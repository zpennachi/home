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

    if (error || !data || data.length === 0) {
        console.warn('Error fetching notes or table empty. Returning mock fallback list for design validation.')
        return [
            {
                id: 'mock-1',
                title: 'weekly sync & design review',
                content: 'we discussed the ui update. the goals are to make the workspace look extremely professional...',
                is_pinned: true,
                created_at: new Date(Date.now() - 3600000).toISOString(),
                updated_at: new Date(Date.now() - 3600000).toISOString(),
                attendees: ['val', 'ethan']
            },
            {
                id: 'mock-2',
                title: 'marketing brainstorming',
                content: 'ideas for the launch including product videos, community outreach, and newsletter...',
                is_pinned: false,
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: new Date(Date.now() - 86400000).toISOString(),
                attendees: ['vincent', 'zane']
            }
        ]
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

    if (error || !data) {
        console.warn('Error fetching note or not found. Returning mock fallback note for design validation.')
        return {
            id: id || 'mock-1',
            title: 'weekly sync & design review',
            content: `## Action Items
- [ ] Rework the notes page minimal styling
- [ ] Simplify buttons and tab switchers
- [ ] Align text components to the left
- [ ] Verify that transcript feed runs cleanly

## Meeting Notes
We discussed the UI update. The goals are to make the workspace look extremely professional and clean. We want to avoid flashy colors, glows, and shadow overlays that distract the user. Instead, we should leverage a clean, high-density monospace layout for logs/feeds and elegant typography for primary content blocks.`,
            transcript: JSON.stringify([
                { id: '1', speaker: 0, text: 'Hi team, let\'s look at the new note page styling.', isFinal: true, timestamp: new Date() },
                { id: '2', speaker: 1, text: 'Yeah, we need to make it feel much more minimal. The heading is currently too loud.', isFinal: true, timestamp: new Date() },
                { id: '3', speaker: 0, text: 'Agreed. Let\'s align all the note content to the left and unbox it.', isFinal: true, timestamp: new Date() }
            ]),
            ai_summary: `## Executive Summary
The team met to plan the redesign of the note details interface. Key objectives are reducing visual noise, shifting to a left-aligned full-width text container, and stripping away flashy indigo shadows.

## Key Decisions
- Adopt a flat, borderless document editor design.
- Re-style all action buttons as lightweight, grayscale border outlines.

## Action Items
- [ ] Align prose content to 100% width and remove px-8/rounded-3xl card paddings.
- [ ] Simplify tab switcher headers to lowercase text labels.`,
            is_pinned: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString(),
            attendees: ['val', 'ethan']
        }
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

    // Process wiki-links if content or summary was updated
    if (updates.content !== undefined || updates.ai_summary !== undefined) {
        const { data: note } = await supabase.from('notes').select('content, ai_summary').eq('id', id).single()
        if (note) {
            const combinedText = (note.content || '') + '\n' + (note.ai_summary || '')
            const regex = /\[\[(.*?)\]\]/g
            const matches = [...combinedText.matchAll(regex)]
            const targetTitles = [...new Set(matches.map(m => m[1].trim()))]

            // Clear old links
            await supabase.from('note_links').delete().eq('source_id', id)

            if (targetTitles.length > 0) {
                // Find matching notes by title (case insensitive using ilike might be better, but we'll fetch and match lowercase)
                const { data: potentialTargets } = await supabase
                    .from('notes')
                    .select('id, title')
                
                const targetMap = new Map((potentialTargets || []).map(t => [t.title?.toLowerCase(), t.id]))

                const newLinks = targetTitles.map(title => ({
                    source_id: id,
                    target_id: targetMap.get(title.toLowerCase()) || null,
                    target_title: title
                }))

                await supabase.from('note_links').insert(newLinks)
            }
        }
    }

    revalidatePath('/new/admin/notes')
    revalidatePath(`/new/admin/notes/${id}`)
}

export async function getGraphData() {
    const supabase = await createClient()
    const [notesRes, linksRes] = await Promise.all([
        supabase.from('notes').select('id, title, is_pinned, tags'),
        supabase.from('note_links').select('source_id, target_id, target_title')
    ])
    return {
        notes: notesRes.data || [],
        links: linksRes.data || []
    }
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

export async function getSeedStats() {
    const supabase = await createClient()
    const { data } = await supabase.from('notes').select('id, ai_summary')
    const allNotes = data || []
    const unsyncedIds = allNotes.filter(n => !n.ai_summary).map(n => n.id)
    return {
        total: allNotes.length,
        synced: allNotes.length - unsyncedIds.length,
        unsyncedIds
    }
}

export async function generateAISummary(id: string) {
    const supabase = await createClient()
    const { data: note, error: fetchError } = await supabase
        .from('notes')
        .select('content, transcript, title, ai_summary')
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
    const hasOldSummary = (note.ai_summary || '').trim().length > 0

    if (!hasTranscript && !hasNotes && !hasOldSummary) {
        throw new Error('Add some notes or record a transcript before synthesizing.')
    }

    // Fetch all other note titles for auto-linking
    const { data: allNotes } = await supabase.from('notes').select('id, title').neq('id', id)
    const allTitles = (allNotes || []).map(n => n.title).filter(Boolean) as string[]

    // 2. Try OpenAI first, fall back to Deepgram
    const openaiKey = process.env.OPENAI_API_KEY
    const deepgramKey = process.env.DEEPGRAM_API_KEY

    let summary: string
    let tags: string[] = []
    let auto_links: string[] = []

    if (openaiKey) {
        const res = await synthesizeWithOpenAI(openaiKey, note as any, transcriptText, hasTranscript, hasNotes, hasOldSummary, allTitles)
        summary = res.summary
        tags = res.tags || []
        auto_links = res.auto_links || []
    } else if (deepgramKey) {
        summary = await synthesizeWithDeepgram(deepgramKey, note, transcriptText)
    } else {
        throw new Error('No AI API key configured. Add OPENAI_API_KEY or DEEPGRAM_API_KEY to your environment.')
    }

    // 3. Persist to DB
    const { error: updateError } = await supabase
        .from('notes')
        .update({ ai_summary: summary, tags })
        .eq('id', id)

    if (updateError) {
        console.error('[AI] DB Update Error:', updateError.message)
        return summary // Still return even if DB fails
    }

    // 4. Update auto links
    if (auto_links.length > 0) {
        const { data: potentialTargets } = await supabase
            .from('notes')
            .select('id, title')

        const targetMap = new Map((potentialTargets || []).map(t => [t.title?.toLowerCase(), t.id]))

        const newLinks = auto_links.map(title => ({
            source_id: id,
            target_id: targetMap.get(title.toLowerCase()) || null,
            target_title: title
        }))

        // Upsert prevents duplicate links if manual links already exist
        await supabase.from('note_links').upsert(newLinks, { onConflict: 'source_id, target_title' })
    }

    revalidatePath(`/new/admin/notes/${id}`)
    return summary
}

// ── OpenAI Synthesis (Primary) ──────────────────────────────────────────
async function synthesizeWithOpenAI(
    apiKey: string,
    note: { title: string; content: string; transcript: string; ai_summary?: string },
    transcriptText: string,
    hasTranscript: boolean,
    hasNotes: boolean,
    hasOldSummary: boolean,
    allTitles: string[]
): Promise<{ summary: string, tags: string[], auto_links: string[] }> {
    const systemPrompt = `You are an elite Chief of Staff, operator, and strategic thinking partner.

Your job is to determine what matters, what should happen next, what can wait, and what deserves attention.
Assume every conversation is part of a larger ongoing body of work.

Focus on clarity, prioritization, and execution.

# OUTPUT FORMAT

You must respond with a JSON object containing three keys: "summary", "tags", and "auto_links".

1. "summary": A markdown string structured exactly as follows:
## What Happened
A concise synthesis of what this conversation was actually about. Do not recap the discussion chronologically. Explain what changed, what decisions were made, and what matters going forward. Keep this to a few short paragraphs.

---
## Next
The most important actions that should happen immediately.
* [ ] Action

---
## Later
Important follow-ups, opportunities, ideas, or projects that emerged but are not immediate priorities.

---
## Watchouts
Anything that could slow progress, blockers, risks, or open questions. Omit this section if none exist.

2. "tags": An array of 3-5 strings representing core concepts or topics from the note (e.g. ["#ui-design", "#marketing"]). Prefix with #.
3. "auto_links": An array of strings. Review the provided "EXISTING NOTES INDEX" below. If the current note strongly relates to any of these existing notes, include their exact titles in this array to form a connection.

# RULES
* Prioritize usefulness over completeness.
* Eliminate filler and meeting-speak.
* Treat this like a personal operating brief.`

    const userContent = [
        `# Meeting: ${note.title || 'Untitled'}`,
        '',
        hasTranscript ? `## Transcript\n${transcriptText}` : '',
        hasNotes ? `## User's Personal Notes\n${note.content}` : '',
        hasOldSummary ? `## Previous Summary (Refine/Include this context)\n${note.ai_summary}` : '',
        '',
        `# EXISTING NOTES INDEX (For Auto-Linking)`,
        allTitles.length > 0 ? allTitles.map(t => `- ${t}`).join('\n') : '(No other notes exist yet)'
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
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                temperature: 0.3,
                max_tokens: 2500,
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

        return JSON.parse(content)
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

