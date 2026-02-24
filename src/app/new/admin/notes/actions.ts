'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotes() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching notes:', error)
        return []
    }

    return data
}

export async function getNoteById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching note:', error)
        return null
    }

    return data
}

export async function createNote() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('notes')
        .insert({
            user_id: user.id,
            title: 'Untitled Note',
            content: '',
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating note:', error)
        throw error
    }

    revalidatePath('/new/admin/notes')
    return data
}

export async function updateNote(id: string, updates: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)

    if (error) {
        console.error('Error updating note:', error)
        throw error
    }

    revalidatePath('/new/admin/notes')
    revalidatePath(`/new/admin/notes/${id}`)
}

export async function deleteNote(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting note:', error)
        throw error
    }

    revalidatePath('/new/admin/notes')
}
export async function saveNoteTranscript(id: string, transcript: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notes')
        .update({ transcript })
        .eq('id', id)

    if (error) {
        console.error('Error saving transcript:', error)
        throw error
    }
    // No revalidatePath here to avoid router thrashing during transcription
}
export async function generateAISummary(id: string) {
    const supabase = await createClient()
    const { data: note, error: fetchError } = await supabase
        .from('notes')
        .select('content, transcript, title')
        .eq('id', id)
        .single()

    if (fetchError || !note) {
        throw new Error('Note not found')
    }

    // 1. Prepare text for synthesis
    let transcriptText = ''
    try {
        if (note.transcript) {
            const segments = JSON.parse(note.transcript)
            transcriptText = segments.map((s: any) => `Speaker ${s.speaker}: ${s.text}`).join('\n')
        }
    } catch (e) {
        transcriptText = note.transcript || ''
    }

    const hasTranscript = transcriptText.trim().length > 0
    const hasNotes = (note.content || '').trim().length > 0

    if (!hasTranscript && !hasNotes) {
        throw new Error('Add some notes or record a transcript before synthesizing.')
    }

    // 2. Try OpenAI first, fall back to Deepgram
    const openaiKey = process.env.OPENAI_API_KEY
    const deepgramKey = process.env.DEEPGRAM_API_KEY

    let summary: string

    if (openaiKey) {
        summary = await synthesizeWithOpenAI(openaiKey, note, transcriptText, hasTranscript, hasNotes)
    } else if (deepgramKey) {
        summary = await synthesizeWithDeepgram(deepgramKey, note, transcriptText)
    } else {
        throw new Error('No AI API key configured. Add OPENAI_API_KEY or DEEPGRAM_API_KEY to your environment.')
    }

    // 3. Persist to DB
    const { error: updateError } = await supabase
        .from('notes')
        .update({ ai_summary: summary })
        .eq('id', id)

    if (updateError) {
        console.error('[AI] DB Update Error:', updateError.message)
        return summary // Still return even if DB fails
    }

    revalidatePath(`/new/admin/notes/${id}`)
    return summary
}

// ── OpenAI Synthesis (Primary) ──────────────────────────────────────────
async function synthesizeWithOpenAI(
    apiKey: string,
    note: { title: string; content: string; transcript: string },
    transcriptText: string,
    hasTranscript: boolean,
    hasNotes: boolean
): Promise<string> {
    const systemPrompt = `You are a world-class Chief of Staff and strategic note-taker. Your job is to synthesize raw meeting transcripts and personal observations into a structured, actionable intelligence brief.

OUTPUT FORMAT (use exactly these markdown headers):

## Executive Summary
2-3 sentences capturing the most important takeaways. Be direct and specific — no filler.

## Key Decisions
- Bullet each decision that was made or implied
- If no clear decisions, note "No explicit decisions captured"

## Action Items
- [ ] Each action item as a checkbox, with owner if mentioned
- [ ] Include deadlines if mentioned
- If none, note "No action items identified"

## Themes & Insights
- Strategic observations, recurring patterns, or notable dynamics
- Connect dots between different parts of the conversation
- Note any tensions, risks, or opportunities

## Open Questions
- Unresolved items that need follow-up
- Topics that were raised but not concluded
- If none, note "No open questions"

RULES:
- Be concise. Every word should earn its place.
- Use the user's own language and terminology where possible.
- If the transcript has multiple speakers, note who said what when relevant.
- If user observations contradict or add nuance to the transcript, highlight this.
- Write in a professional but approachable tone.
- Do NOT invent information. If something is unclear, say so.
- Omit any section header that would be empty or only say "None identified".`

    const userContent = [
        `# Meeting: ${note.title || 'Untitled'}`,
        '',
        hasTranscript ? `## Transcript\n${transcriptText}` : '',
        hasNotes ? `## User's Personal Notes\n${note.content}` : '',
    ].filter(Boolean).join('\n\n')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                temperature: 0.3,
                max_tokens: 2000,
            }),
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            const err = await response.text()
            throw new Error(`OpenAI API error (${response.status}): ${err}`)
        }

        const result = await response.json()
        const content = result.choices?.[0]?.message?.content

        if (!content) {
            throw new Error('OpenAI returned empty response')
        }

        return content
    } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
            throw new Error('AI synthesis timed out. Try again with less content.')
        }
        throw error
    }
}

// ── Deepgram Synthesis (Fallback) ───────────────────────────────────────
async function synthesizeWithDeepgram(
    apiKey: string,
    note: { title: string; content: string; transcript: string },
    transcriptText: string
): Promise<string> {
    const combinedText = `
[MEETING TITLE]: ${note.title}

[TRANSCRIPT CONTENT]
${transcriptText || '(No transcript available)'}

[USER OBSERVATIONS]
${note.content || '(No manual notes yet)'}
    `.trim()

    const wordCount = combinedText.split(/\s+/).length
    if (wordCount < 10) {
        throw new Error(`Insufficient content (${wordCount} words). Add more notes or record a longer transcript.`)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch('https://api.deepgram.com/v1/read?summarize=v2&language=en', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: combinedText }),
        signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`Deepgram API error (${response.status}): ${err}`)
    }

    const result = await response.json()
    const summary = result.results?.channels?.[0]?.alternatives?.[0]?.summaries?.[0]?.summary ||
        result.results?.summary?.text ||
        null

    if (!summary) {
        return 'No summary could be generated. Try adding more content.'
    }

    return summary
}

