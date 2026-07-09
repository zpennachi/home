'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { getNoteById, updateNote, deleteNote, saveNoteTranscript, generateAISummary, getGraphData, getNoteConnections, getNoteByTitle, createNoteFromDangling } from '@/app/new/admin/notes/actions'
import { TipTapEditor, TipTapEditorRef } from '@/components/admin/TipTapEditor'
import { MeetingRecorder } from '@/components/admin/MeetingRecorder'
import { GraphView } from '@/components/admin/GraphView'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAdminSync } from '@/components/admin/AdminSyncProvider'

interface TranscriptSegment {
    id: string
    speaker: number
    text: string
    isFinal: boolean
    timestamp: Date
}

const CORE_PEOPLE = [
    { name: 'val', initials: 'va' },
    { name: 'ethan', initials: 'et' },
    { name: 'christiaan', initials: 'ch' },
    { name: 'vincent', initials: 'vi' },
    { name: 'zane', initials: 'za' },
    { name: 'nick', initials: 'ni' },
    { name: 'winson', initials: 'wi' }
]

export function NoteEditor() {
    const router = useRouter()
    const { activeNoteId, notes: cachedNotes, setActiveNoteId, updateNoteInCache, loadNotes } = useAdminSync()

    const [connections, setConnections] = useState<{ inbound: any[], outbound: any[] }>({ inbound: [], outbound: [] })
    const [popoverState, setPopoverState] = useState<{
        isOpen: boolean;
        title: string;
        coords: { top: number; left: number };
        noteDetails: any | null;
        loading: boolean;
        isEditing: boolean;
        editContent: string;
    } | null>(null)

    const fetchConnections = useCallback(async () => {
        if (!activeNoteId) return
        try {
            const data = await getNoteConnections(activeNoteId)
            setConnections(data)
        } catch (err) {
            console.error('Failed to fetch connections:', err)
        }
    }, [activeNoteId])

    useEffect(() => {
        fetchConnections()
        setPopoverState(null)
    }, [activeNoteId, fetchConnections])

    const handleWikiLinkClick = useCallback(async (title: string, event: MouseEvent) => {
        let top = event ? event.clientY + window.scrollY + 15 : 200
        let left = event ? event.clientX + window.scrollX - 100 : 200
        
        if (left < 10) left = 10
        if (left + 350 > window.innerWidth) left = window.innerWidth - 370

        setPopoverState({
            isOpen: true,
            title,
            coords: { top, left },
            noteDetails: null,
            loading: true,
            isEditing: false,
            editContent: ''
        })

        try {
            const targetNote = await getNoteByTitle(title)
            setPopoverState(prev => {
                if (!prev || prev.title !== title) return prev
                return {
                    ...prev,
                    loading: false,
                    noteDetails: targetNote,
                    editContent: targetNote ? targetNote.content : ''
                }
            })
        } catch (err) {
            console.error('Failed to fetch popover note:', err)
            setPopoverState(prev => prev ? { ...prev, loading: false } : null)
        }
    }, [])

    const handleCreateFromPopover = async () => {
        if (!popoverState) return
        setPopoverState(prev => prev ? { ...prev, loading: true } : null)
        try {
            const newNote = await createNoteFromDangling(popoverState.title)
            loadNotes()
            setPopoverState(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    loading: false,
                    noteDetails: newNote,
                    editContent: ''
                }
            })
            fetchConnections()
        } catch (err) {
            toast.error('Failed to create note')
            setPopoverState(prev => prev ? { ...prev, loading: false } : null)
        }
    }

    const handleSavePopoverContent = async () => {
        if (!popoverState || !popoverState.noteDetails) return
        const targetId = popoverState.noteDetails.id
        const content = popoverState.editContent
        
        try {
            await updateNote(targetId, { content })
            setPopoverState(prev => prev ? { ...prev, noteDetails: { ...prev.noteDetails, content } } : null)
            toast.success('Saved target note inline')
            updateNoteInCache(targetId, { content })
        } catch (err) {
            toast.error('Failed to save target note')
        }
    }

    // Note State — initialize synchronously from cache for instant render
    const initialNote = useMemo(() => {
        if (!activeNoteId) return null
        return cachedNotes.find(n => n.id === activeNoteId) || null
    }, []) // intentionally empty deps — only run on mount

    const [note, setNote] = useState<any>(initialNote)
    const [loading, setLoading] = useState(!initialNote)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [titleWidth, setTitleWidth] = useState('auto')
    const titleSpanRef = useRef<HTMLSpanElement>(null)

    // AI Superpower State
    const [isSynthesizing, setIsSynthesizing] = useState(false)
    const [isTranscriptCopied, setIsTranscriptCopied] = useState(false)
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'notes' | 'ai' | 'transcript' | 'graph'>('notes')
    const [graphData, setGraphData] = useState<{notes: any[], links: any[]} | null>(null)



    // Recording State (Lifted from MeetingRecorder)
    const [isRecording, setIsRecording] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    // Voice Dictation State & Hook
    const [isDictating, setIsDictating] = useState(false)
    const isDictatingRef = useRef(false)
    const silentAudioRef = useRef<HTMLAudioElement | null>(null)
    const recognitionRef = useRef<any>(null)

    // Keep the isDictatingRef synced to avoid stale closures in browser event callbacks
    useEffect(() => {
        isDictatingRef.current = isDictating
    }, [isDictating])

    useEffect(() => {
        const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognitionClass) {
            const rec = new SpeechRecognitionClass()
            rec.continuous = true
            rec.interimResults = false
            rec.lang = 'en-US'
            
            rec.onresult = (event: any) => {
                const resultIndex = event.resultIndex
                const transcript = event.results[resultIndex][0].transcript
                
                if (transcript && editorRef.current?.editor) {
                    const editor = editorRef.current.editor
                    const { state } = editor
                    const { selection } = state
                    const { $from } = selection
                    
                    const pos = $from.pos
                    let prefix = ' '
                    if (pos > 1) {
                        try {
                            const textBefore = state.doc.textBetween(Math.max(1, pos - 1), pos)
                            if (textBefore === ' ' || textBefore === '\n') {
                                prefix = ''
                            }
                        } catch (e) {}
                    } else {
                        prefix = ''
                    }
                    
                    editor.chain().focus().insertContent(prefix + transcript.trim()).run()
                }
            }
            
            rec.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error)
                if (event.error === 'not-allowed') {
                    toast.error('Microphone permission blocked for dictation')
                }
                setIsDictating(false)
            }
            
            rec.onend = () => {
                // If it ended due to silence timeout or mobile sleep but user didn't hit stop, restart it immediately
                if (isDictatingRef.current) {
                    try {
                        recognitionRef.current.start()
                    } catch (e) {
                        console.error('Failed to restart speech recognition:', e)
                    }
                } else {
                    setIsDictating(false)
                }
            }
            
            recognitionRef.current = rec
        }
        
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort()
            }
            if (silentAudioRef.current) {
                silentAudioRef.current.pause()
                silentAudioRef.current = null
            }
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'none'
            }
        }
    }, [])

    const startDictation = useCallback(() => {
        if (!recognitionRef.current) return
        try {
            // Start a silent audio loop to convince iOS Safari to keep the background audio thread and microphone alive
            const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA")
            audio.loop = true
            audio.play().catch(err => console.warn("Failed to start background audio keepalive:", err))
            silentAudioRef.current = audio

            recognitionRef.current.start()
            setIsDictating(true)

            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: 'recording voice note...',
                    artist: 'home notes',
                    album: 'dictation active'
                })
                navigator.mediaSession.playbackState = 'playing'
            }
        } catch (e) {
            console.error('Failed to start dictation:', e)
        }
    }, [])

    const stopDictation = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop()
            } catch (e) {}
        }
        setIsDictating(false)
        if (silentAudioRef.current) {
            silentAudioRef.current.pause()
            silentAudioRef.current = null
        }

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'dictation paused',
                artist: 'home notes',
                album: 'dictation suspended'
            })
            navigator.mediaSession.playbackState = 'paused'
        }
    }, [])

    // Register Media Session widget controls on mount/update
    useEffect(() => {
        if ('mediaSession' in navigator) {
            try {
                navigator.mediaSession.setActionHandler('play', () => {
                    startDictation()
                })
                navigator.mediaSession.setActionHandler('pause', () => {
                    stopDictation()
                })
            } catch (e) {
                console.error('Failed to set media session handlers:', e)
            }
        }
        return () => {
            if ('mediaSession' in navigator) {
                try {
                    navigator.mediaSession.setActionHandler('play', null)
                    navigator.mediaSession.setActionHandler('pause', null)
                } catch (e) {}
            }
        }
    }, [startDictation, stopDictation])

    const handleDictateClick = useCallback(() => {
        if (!recognitionRef.current) {
            toast.error('Speech recognition is not supported in this browser. Please use Google Chrome.')
            return
        }
        if (isRecording) {
            toast.error('Please stop the meeting recorder before starting dictation')
            return
        }
        if (isDictating) {
            stopDictation()
            toast.success('Dictation paused')
        } else {
            startDictation()
            toast.success('Dictation active. Start speaking to note...')
        }
    }, [isRecording, isDictating, startDictation, stopDictation])

    useEffect(() => {
        if (isRecording && isDictating) {
            stopDictation()
        }
    }, [isRecording, isDictating, stopDictation])

    // Transcript State
    const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>(() => {
        if (initialNote?.transcript) {
            try { return JSON.parse(initialNote.transcript) } catch { return [] }
        }
        return []
    })
    const transcriptSegmentsRef = useRef<TranscriptSegment[]>(transcriptSegments)
    const transcriptEndRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<TipTapEditorRef>(null)
    const prevNoteIdRef = useRef<string | null>(activeNoteId)

    // Content transition state
    const [contentOpacity, setContentOpacity] = useState(1)

    // Respond to activeNoteId changes (note switching WITHOUT unmount)
    useEffect(() => {
        if (!activeNoteId) return
        // Skip the initial mount — we already loaded synchronously
        if (activeNoteId === prevNoteIdRef.current && note) return
        prevNoteIdRef.current = activeNoteId

        // Crossfade: fade out
        setContentOpacity(0)

        const switchTimeout = setTimeout(() => {
            // Try cache first
            const cached = cachedNotes.find(n => n.id === activeNoteId)
            if (cached) {
                setNote(cached)
                setLastSaved(null)
                setActiveTab('notes')
                setIsAddMenuOpen(false)
                // Parse transcript
                if (cached.transcript) {
                    try {
                        const parsed = JSON.parse(cached.transcript)
                        setTranscriptSegments(parsed)
                        transcriptSegmentsRef.current = parsed
                    } catch {
                        setTranscriptSegments([])
                        transcriptSegmentsRef.current = []
                    }
                } else {
                    setTranscriptSegments([])
                    transcriptSegmentsRef.current = []
                }
                setLoading(false)
                // Crossfade: fade in
                requestAnimationFrame(() => setContentOpacity(1))
                return
            }

            // Fallback: DB fetch
            async function fetchFromDB() {
                setLoading(true)
                const data = await getNoteById(activeNoteId!)
                if (!data) {
                    router.push('/new/admin/notes')
                    return
                }
                setNote(data)
                setLastSaved(null)
                setActiveTab('notes')
                updateNoteInCache(data.id, data)
                if (data.transcript) {
                    try {
                        const parsed = JSON.parse(data.transcript)
                        setTranscriptSegments(parsed)
                        transcriptSegmentsRef.current = parsed
                    } catch {
                        setTranscriptSegments([])
                        transcriptSegmentsRef.current = []
                    }
                } else {
                    setTranscriptSegments([])
                    transcriptSegmentsRef.current = []
                }
                setLoading(false)
                requestAnimationFrame(() => setContentOpacity(1))
            }
            fetchFromDB()
        }, 80) // brief fade-out delay

        return () => clearTimeout(switchTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeNoteId])

    useEffect(() => {
        if (titleSpanRef.current) {
            setTitleWidth(`${titleSpanRef.current.offsetWidth + 2}px`)
        }
    }, [note?.title])

    // Scroll to bottom when a new transcript segment arrives in active transcript tab
    useEffect(() => {
        if (activeTab === 'transcript') {
            transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [transcriptSegments, activeTab])



    const saveNote = useCallback(async (updates: any) => {
        if (!activeNoteId) return
        setSaving(true)
        try {
            await updateNote(activeNoteId, updates)
            setLastSaved(new Date())
            if (updates.content !== undefined) {
                fetchConnections()
            }
        } catch (err) {
            toast.error('Failed to save')
        } finally {
            setSaving(false)
        }
    }, [activeNoteId, fetchConnections])

    const settings = useMemo(() => {
        const defaults = {
            font_family: 'mono',
            font_size: 'medium',
            line_height: 'normal',
            page_width: 'wide'
        }
        return {
            ...defaults,
            ...(note?.editor_settings || {})
        }
    }, [note?.editor_settings])

    const updateSetting = useCallback((key: string, value: string) => {
        if (!note) return
        const nextSettings = { ...settings, [key]: value }
        setNote((prev: any) => ({ ...prev, editor_settings: nextSettings }))
        updateNoteInCache(activeNoteId!, { editor_settings: nextSettings })
        saveNote({ editor_settings: nextSettings })
    }, [note, settings, activeNoteId, updateNoteInCache, saveNote])

    // Specialized transcript saver to avoid revalidatePath conflicts
    const persistTranscript = useCallback(async (segments: TranscriptSegment[]) => {
        if (!activeNoteId) return
        try {
            await saveNoteTranscript(activeNoteId, JSON.stringify(segments))
            setLastSaved(new Date())
        } catch (err) {
            console.error('Failed to persist transcript:', err)
        }
    }, [activeNoteId])

    const handleCopyTranscription = useCallback(() => {
        if (transcriptSegments.length === 0) {
            toast.error("No transcription content to copy")
            return
        }
        const text = transcriptSegments
            .map(seg => `Speaker ${seg.speaker}: ${seg.text}`)
            .join('\n')
        navigator.clipboard.writeText(text)
        setIsTranscriptCopied(true)
        toast.success("Transcription copied to clipboard")
        setTimeout(() => setIsTranscriptCopied(false), 2000)
    }, [transcriptSegments])

    const handleDownloadTranscription = useCallback(() => {
        if (transcriptSegments.length === 0) {
            toast.error("No transcription content to download")
            return
        }
        const text = transcriptSegments
            .map(seg => `Speaker ${seg.speaker}: ${seg.text}`)
            .join('\n')
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${note?.title || 'untitled'}-transcript.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success("Transcription downloaded")
    }, [transcriptSegments, note?.title])

    const handleToggleAttendee = useCallback((name: string) => {
        if (!note) return
        const current = note.attendees || []
        const next = current.includes(name)
            ? current.filter((a: string) => a !== name)
            : [...current, name]
        setNote((prev: any) => ({ ...prev, attendees: next }))
        saveNote({ attendees: next })
    }, [note, saveNote])

    async function handleDelete() {
        if (confirm('Delete this note?')) {
            await deleteNote(activeNoteId!)
            setActiveNoteId(null)
            router.push('/new/admin/notes')
            toast.success('Note deleted')
        }
    }

    const handleSuperpower = async () => {
        if (isSynthesizing || !activeNoteId) return
        setIsSynthesizing(true)
        setActiveTab('ai')
        try {
            const summary = await generateAISummary(activeNoteId)
            setNote((prev: any) => ({ ...prev, ai_summary: summary }))
            toast.success('Superpowered synthesis complete!')
        } catch (err: any) {
            console.error('Synthesis Error in client:', err)
            toast.error(err.message || 'Synthesis failed')
        } finally {
            setIsSynthesizing(false)
        }
    }

    const copyToEditor = () => {
        if (editorRef.current?.editor && note.ai_summary) {
            editorRef.current.editor.chain()
                .focus()
                .insertContent(`\n\n### AI Synthesis\n${note.ai_summary}\n\n`)
                .run()
            toast.success('Added to manual notes')
        }
    }

    const handleTranscription = useCallback((text: string, isFinal: boolean, speaker?: number) => {
        const speakerId = speaker ?? 0
        const prev = transcriptSegmentsRef.current
        const lastSegment = prev[prev.length - 1]

        let nextSegments: TranscriptSegment[]

        // 1. Calculate the new segments array (Sync calculation)
        if (!lastSegment || (isFinal && lastSegment.speaker !== speakerId && lastSegment.isFinal)) {
            const newSegment: TranscriptSegment = {
                id: Math.random().toString(36).substr(2, 9),
                speaker: speakerId,
                text: text,
                isFinal: isFinal,
                timestamp: new Date()
            }
            nextSegments = [...prev, newSegment]
        } else if (lastSegment.speaker === speakerId) {
            const updatedSegments = [...prev]
            const currentSegment = { ...lastSegment }

            if (currentSegment.isFinal) {
                const newSeg: TranscriptSegment = {
                    id: Math.random().toString(36).substr(2, 9),
                    speaker: speakerId,
                    text: text,
                    isFinal: isFinal,
                    timestamp: new Date()
                }
                updatedSegments.push(newSeg)
            } else {
                currentSegment.text = text
                currentSegment.isFinal = isFinal
                updatedSegments[updatedSegments.length - 1] = currentSegment
            }
            nextSegments = updatedSegments
        } else {
            const updated = [...prev]
            updated[updated.length - 1] = {
                ...lastSegment,
                text: text,
                speaker: speakerId,
                isFinal: isFinal
            }
            nextSegments = updated
        }

        // 2. Update local state and ref immediately
        transcriptSegmentsRef.current = nextSegments
        setTranscriptSegments(nextSegments)

        // 3. Trigger side effect (Persist to DB) ONLY if it's a final segment
        if (isFinal) {
            persistTranscript(nextSegments)
        }
    }, [persistTranscript])

    if (loading || !note) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
    )

    return (
        <div
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-12 pb-6 -mx-4 sm:-mx-6 md:-mx-12"
            style={{
                opacity: contentOpacity,
                transition: 'opacity 80ms ease-out',
            }}
        >
            <div className="w-full">
                
                {/* Header Row: Title/Date on left, Actions on right */}
                <div className="sticky top-0 z-30 bg-background pt-6 pb-4 border-b border-muted/20 mb-6 flex flex-col gap-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-12 md:px-12">
                    {/* Row 1: Title/Date & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Title & Date Details */}
                        <div className="flex items-baseline gap-1 min-w-0 relative flex-1">
                            {/* Hidden span to measure dynamic title width */}
                            <span 
                                ref={titleSpanRef}
                                className="absolute opacity-0 pointer-events-none whitespace-pre text-lg sm:text-xl font-medium tracking-tight lowercase"
                            >
                                {note.title || 'untitled note'}
                            </span>

                            <input
                                type="text"
                                value={note.title}
                                onChange={(e) => {
                                    const newTitle = e.target.value
                                    setNote({ ...note, title: newTitle })
                                    updateNoteInCache(activeNoteId!, { title: newTitle })
                                    saveNote({ title: newTitle })
                                }}
                                placeholder="untitled note"
                                style={{ width: titleWidth }}
                                className="bg-transparent text-lg sm:text-xl font-medium tracking-tight text-foreground placeholder:text-muted/50 focus:outline-none border-none p-0 lowercase min-w-[50px] max-w-[300px] sm:max-w-[500px]"
                            />

                            <div className="text-[11px] text-muted-fg/40 font-mono lowercase shrink-0">
                                {format(new Date(note.created_at), 'MM.dd.yy')}
                                {lastSaved && ` • synced ${format(lastSaved, 'HH:mm:ss')}`}
                            </div>
                        </div>

                        {/* Right Side: Action Icons Row */}
                        <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono text-muted-fg/40 lowercase">
                            {/* Transcribe Button */}
                            <MeetingRecorder
                                onTranscription={handleTranscription}
                                isRecording={isRecording}
                                setIsRecording={setIsRecording}
                                isInitializing={isInitializing}
                                setIsInitializing={setIsInitializing}
                            />

                            <span>/</span>

                            {/* Dictate Button */}
                            <button
                                onClick={handleDictateClick}
                                className={cn(
                                    "transition-colors cursor-pointer disabled:opacity-40",
                                    isDictating ? "text-red-500 font-semibold animate-pulse" : "text-muted-fg hover:text-foreground"
                                )}
                                title={isDictating ? "Stop voice dictation" : "Start voice dictation"}
                                disabled={isRecording || isInitializing}
                            >
                                {isDictating ? "dictating..." : "dictate"}
                            </button>

                            <span>/</span>

                            {/* Copy Transcription Button */}
                            <button
                                onClick={handleCopyTranscription}
                                className="text-muted-fg hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
                                title="Copy Transcription"
                                disabled={transcriptSegments.length === 0}
                            >
                                {isTranscriptCopied ? "copied" : "copy"}
                            </button>

                            <span>/</span>

                            {/* Delete Button */}
                            <button
                                onClick={handleDelete}
                                className="text-muted-fg hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete Note"
                            >
                                delete
                            </button>
                        </div>
                    </div>


                    {/* Connections Breadcrumbs Row */}
                    {(connections.inbound.length > 0 || connections.outbound.length > 0) && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-mono text-muted-fg/60 lowercase select-none py-1 border-b border-muted/5">
                            {connections.inbound.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-muted-fg/40">inbound:</span>
                                    {connections.inbound.map(conn => (
                                        <button
                                            key={conn.id}
                                            onClick={() => {
                                                setActiveNoteId(conn.id)
                                                router.push(`/new/admin/notes/${conn.id}`)
                                            }}
                                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer bg-transparent border-none p-0 font-mono text-[10px]"
                                        >
                                            [{conn.title.toLowerCase()}]
                                        </button>
                                    ))}
                                </div>
                            )}
                            {connections.inbound.length > 0 && connections.outbound.length > 0 && <span className="text-muted-fg/20">•</span>}
                            {connections.outbound.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-muted-fg/40">outbound:</span>
                                    {connections.outbound.map(conn => (
                                        <button
                                            key={conn.title}
                                            onClick={() => {
                                                if (conn.id) {
                                                    setActiveNoteId(conn.id)
                                                    router.push(`/new/admin/notes/${conn.id}`)
                                                } else {
                                                    handleWikiLinkClick(conn.title, null as any)
                                                }
                                            }}
                                            className={cn(
                                                "cursor-pointer bg-transparent border-none p-0 font-mono text-[10px]",
                                                conn.id
                                                    ? "text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                                    : "text-neutral-400 dark:text-neutral-500 line-through decoration-dashed hover:text-foreground"
                                            )}
                                        >
                                            [{conn.title.toLowerCase()}]
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Row 2: Attendees & Tab Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Attendees Selection Row */}
                        <div className="flex items-center gap-3.5 flex-wrap">
                            {CORE_PEOPLE.filter(p => (note.attendees || []).includes(p.name)).map((p) => (
                                <button
                                    key={p.name}
                                    onClick={() => handleToggleAttendee(p.name)}
                                    className="text-[11px] font-mono text-foreground hover:text-red-500 hover:line-through transition-colors cursor-pointer select-none lowercase"
                                    title={`click to remove ${p.name}`}
                                >
                                    {p.initials}
                                </button>
                            ))}

                            {/* Add Button */}
                            {CORE_PEOPLE.filter(p => !(note.attendees || []).includes(p.name)).length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                                        className="text-[11px] font-mono text-muted-fg hover:text-foreground transition-colors cursor-pointer select-none lowercase"
                                        title="Add attendee"
                                    >
                                        +
                                    </button>

                                    {isAddMenuOpen && (
                                        <>
                                            {/* Backdrop to close menu */}
                                            <div 
                                                className="fixed inset-0 z-[40]" 
                                                onClick={() => setIsAddMenuOpen(false)}
                                            />
                                            <div
                                                className="absolute left-0 mt-1 w-32 bg-background border border-neutral-200 dark:border-neutral-800 rounded shadow-md py-1 z-[50]"
                                            >
                                                {CORE_PEOPLE.filter(p => !(note.attendees || []).includes(p.name)).map((p) => (
                                                    <button
                                                        key={p.name}
                                                        onClick={() => {
                                                            handleToggleAttendee(p.name)
                                                            setIsAddMenuOpen(false)
                                                        }}
                                                        className="w-full text-left px-2.5 py-1.5 text-[11px] text-muted-fg hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors lowercase font-mono cursor-pointer"
                                                    >
                                                        {p.initials} • {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* TAB SWITCHER & SETTINGS */}
                        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-fg/40 lowercase select-none">
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={cn(
                                    "transition-colors cursor-pointer",
                                    activeTab === 'notes' ? "text-foreground font-semibold" : "text-muted-fg hover:text-foreground"
                                )}
                            >
                                notes
                            </button>
                            <span>/</span>
                            <button
                                onClick={() => setActiveTab('ai')}
                                className={cn(
                                    "transition-colors cursor-pointer",
                                    activeTab === 'ai' ? "text-foreground font-semibold" : "text-muted-fg hover:text-foreground"
                                )}
                            >
                                summary
                            </button>
                            <span>/</span>
                            <button
                                onClick={() => setActiveTab('transcript')}
                                className={cn(
                                    "transition-colors cursor-pointer",
                                    activeTab === 'transcript' ? "text-foreground font-semibold" : "text-muted-fg hover:text-foreground"
                                )}
                            >
                                transcript
                            </button>

                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-6">

                    {/* CONTENT */}
                    <div className={cn("w-full notes-content-area transition-all duration-300", 
                        settings.page_width === 'compact' && 'max-w-[650px] mx-auto',
                        settings.page_width === 'normal' && 'max-w-[850px] mx-auto',
                        settings.page_width === 'wide' && 'max-w-full'
                    )}>
                        {activeTab === 'notes' && (
                            <TipTapEditor
                                ref={editorRef}
                                initialContent={note.content}
                                editorSettings={settings}
                                existingTitles={cachedNotes.map((n: any) => n.title)}
                                onWikiLinkClick={(title, e) => handleWikiLinkClick(title, e as any)}
                                onChange={(content) => {
                                    setNote({ ...note, content })
                                    saveNote({ content })
                                }}
                            />
                        )}

                        {activeTab === 'ai' && (
                            <div className="w-full !max-w-full !mx-0">
                                {isSynthesizing ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
                                        <div className="text-xs font-mono text-muted-fg/60 lowercase">synthesizing summary...</div>
                                    </div>
                                ) : note.ai_summary ? (
                                    <div className="relative pt-2 w-full !max-w-full !mx-0 space-y-4">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={copyToEditor}
                                                className="text-xs font-mono text-muted-fg hover:text-foreground transition-colors bg-transparent cursor-pointer lowercase"
                                            >
                                                copy to notes
                                            </button>
                                        </div>
                                        <div className="prose prose-sm dark:prose-invert focus:outline-none !max-w-full !mx-0 text-foreground leading-normal font-mono text-[13.5px]">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {note.ai_summary}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-16 flex flex-col items-center justify-center gap-4 text-center bg-transparent">
                                        <div>
                                            <p className="text-xs font-mono text-muted-fg max-w-xs lowercase">no ai summary yet. add notes or record a transcript, then generate your summary brief.</p>
                                        </div>
                                        <button
                                            onClick={handleSuperpower}
                                            disabled={isSynthesizing}
                                            className="text-xs font-mono text-foreground hover:underline transition-colors bg-transparent cursor-pointer"
                                        >
                                            generate summary
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'transcript' && (
                            <div className="w-full !max-w-full !mx-0">
                                {transcriptSegments.length === 0 ? (
                                    <div className="py-16 flex flex-col items-center justify-center gap-4 text-center bg-transparent">
                                        <div>
                                            <p className="text-xs font-mono text-muted-fg max-w-xs lowercase">no transcription yet. start transcription using the rec control in the top header row.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative pt-2 w-full !max-w-full !mx-0 space-y-6">
                                        <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800 text-xs font-mono text-muted-fg/40 lowercase">
                                            <span>live meeting audio transcript</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleCopyTranscription}
                                                    className="text-muted-fg hover:text-foreground transition-colors bg-transparent cursor-pointer lowercase"
                                                >
                                                    {isTranscriptCopied ? "copied" : "copy"}
                                                </button>
                                                <span>/</span>
                                                <button
                                                    onClick={handleDownloadTranscription}
                                                    className="text-muted-fg hover:text-foreground transition-colors bg-transparent cursor-pointer lowercase"
                                                >
                                                    txt
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4 max-w-3xl">
                                            {transcriptSegments.map((seg) => (
                                                <div key={seg.id} className="flex gap-4 items-start">
                                                    <span className={cn(
                                                        "shrink-0 text-[10px] lowercase font-mono px-2 py-0.5 rounded select-none w-20 text-center",
                                                        seg.speaker === 0 
                                                            ? "bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 font-semibold" 
                                                            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                                        )}>
                                                        speaker {seg.speaker}
                                                    </span>
                                                    <p className={cn(
                                                        "text-[13.5px] leading-normal text-foreground/90 font-mono",
                                                        !seg.isFinal && "text-foreground/50 animate-pulse"
                                                    )}>
                                                        {seg.text}
                                                    </p>
                                                </div>
                                            ))}
                                            <div ref={transcriptEndRef} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                    </div>
                </div>
            </div>

            {/* Wiki Link Inline Popover */}
            {popoverState?.isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-[100]" 
                        onClick={() => setPopoverState(null)} 
                    />
                    
                    <div 
                        className="absolute z-[101] w-[350px] bg-background border border-neutral-200 dark:border-neutral-800 rounded shadow-xl p-4 text-xs font-mono lowercase flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150"
                        style={{
                            top: `${popoverState.coords.top}px`,
                            left: `${popoverState.coords.left}px`,
                        }}
                    >
                        {/* Popover Header */}
                        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2 text-[10px] text-muted-fg/60">
                            <span className="font-semibold text-foreground truncate max-w-[200px]">
                                [[{popoverState.title.toLowerCase()}]]
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 select-none">
                                {popoverState.noteDetails && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setActiveNoteId(popoverState.noteDetails.id)
                                                router.push(`/new/admin/notes/${popoverState.noteDetails.id}`)
                                                setPopoverState(null)
                                            }}
                                            className="hover:text-foreground text-blue-500 transition-colors cursor-pointer bg-transparent border-none p-0"
                                        >
                                            open
                                        </button>
                                        <span>/</span>
                                    </>
                                )}
                                <button
                                    onClick={() => setPopoverState(null)}
                                    className="hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0"
                                >
                                    close
                                </button>
                            </div>
                        </div>

                        {/* Popover Content */}
                        {popoverState.loading ? (
                            <div className="py-6 text-center text-muted-fg/50">
                                loading...
                            </div>
                        ) : popoverState.noteDetails ? (
                            <div className="flex flex-col gap-3">
                                {popoverState.isEditing ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            value={popoverState.editContent}
                                            onChange={(e) => setPopoverState(prev => prev ? { ...prev, editContent: e.target.value } : null)}
                                            className="w-full min-h-[120px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2 text-foreground focus:outline-none font-mono text-[11px] rounded"
                                            placeholder="type note content..."
                                        />
                                        <div className="flex justify-end gap-2 text-[10px]">
                                            <button
                                                onClick={() => setPopoverState(prev => prev ? { ...prev, isEditing: false } : null)}
                                                className="text-muted-fg hover:text-foreground bg-transparent border-none p-0 cursor-pointer"
                                            >
                                                cancel
                                            </button>
                                            <span>/</span>
                                            <button
                                                onClick={async () => {
                                                    await handleSavePopoverContent()
                                                    setPopoverState(prev => prev ? { ...prev, isEditing: false } : null)
                                                }}
                                                className="text-foreground hover:underline bg-transparent border-none p-0 cursor-pointer"
                                            >
                                                save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2.5">
                                        <div className="max-h-[140px] overflow-y-auto custom-scrollbar text-[11px] leading-normal text-muted-fg/80 whitespace-pre-wrap">
                                            {popoverState.noteDetails.content || 'no content yet. click edit below to write.'}
                                        </div>
                                        <div className="flex justify-end text-[10px]">
                                            <button
                                                onClick={() => setPopoverState(prev => prev ? { ...prev, isEditing: true } : null)}
                                                className="text-muted-fg hover:text-foreground bg-transparent border-none p-0 cursor-pointer"
                                            >
                                                edit inline
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-4 text-center space-y-3">
                                <p className="text-muted-fg/60">ghost note. this link does not have a note associated with it yet.</p>
                                <button
                                    onClick={handleCreateFromPopover}
                                    className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-foreground cursor-pointer font-mono rounded"
                                >
                                    create note
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Sync Overlay */}
            {saving && (
                <div className="fixed bottom-8 right-8 z-50 bg-foreground text-background px-3 py-1.5 shadow flex items-center gap-2 text-xs font-mono lowercase">
                    <div className="w-1 h-1 bg-background rounded-full animate-pulse" />
                    saving...
                </div>
            )}
        </div>
    )
}
