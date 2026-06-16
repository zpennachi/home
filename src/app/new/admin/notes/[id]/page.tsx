'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Trash2, Clock, Lock, MessageSquare, Terminal, Sparkles, Wand2, Copy, Check, Download, Loader2, Plus, X } from 'lucide-react'
import { getNoteById, updateNote, deleteNote, saveNoteTranscript, generateAISummary } from '../actions'
import { TipTapEditor, TipTapEditorRef } from '@/components/admin/TipTapEditor'
import { MeetingRecorder } from '@/components/admin/MeetingRecorder'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
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

export default function NoteEditorPage() {
    const params = useParams()
    const router = useRouter()
    const { setActiveNoteId, setUpdatedTitle } = useAdminSync()

    // Note State
    const [note, setNote] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [titleWidth, setTitleWidth] = useState('auto')
    const titleSpanRef = useRef<HTMLSpanElement>(null)

    // AI Superpower State
    const [isSynthesizing, setIsSynthesizing] = useState(false)
    const [isTranscriptCopied, setIsTranscriptCopied] = useState(false)
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'notes' | 'ai' | 'transcript'>('notes')

    // Recording State (Lifted from MeetingRecorder)
    const [isRecording, setIsRecording] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)

    // Transcript State
    const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([])
    const transcriptSegmentsRef = useRef<TranscriptSegment[]>([])
    const transcriptEndRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<TipTapEditorRef>(null)

    useEffect(() => {
        loadNote()
    }, [params.id])

    useEffect(() => {
        if (titleSpanRef.current) {
            setTitleWidth(`${titleSpanRef.current.offsetWidth + 2}px`)
        }
    }, [note?.title])

    async function loadNote() {
        setLoading(true)
        const data = await getNoteById(params.id as string)
        if (!data) {
            router.push('/new/admin/notes')
        }
        setNote(data)
        setActiveNoteId(data.id)
        setUpdatedTitle(data.id, data.title)

        // Parse existing transcript if it exists
        if (data.transcript) {
            try {
                const parsed = JSON.parse(data.transcript)
                setTranscriptSegments(parsed)
                transcriptSegmentsRef.current = parsed
            } catch (e) {
                setTranscriptSegments([])
                transcriptSegmentsRef.current = []
            }
        }

        setLoading(false)
    }

    // Clean up active note on unmount
    useEffect(() => {
        return () => {
            setActiveNoteId(null)
        }
    }, [setActiveNoteId])

    // Scroll to bottom when a new transcript segment arrives in active transcript tab
    useEffect(() => {
        if (activeTab === 'transcript') {
            transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [transcriptSegments, activeTab])

    const saveNote = useCallback(async (updates: any) => {
        if (!params.id) return
        setSaving(true)
        try {
            await updateNote(params.id as string, updates)
            setLastSaved(new Date())
        } catch (err) {
            toast.error('Failed to save')
        } finally {
            setSaving(false)
        }
    }, [params.id])

    // Specialized transcript saver to avoid revalidatePath conflicts
    const persistTranscript = useCallback(async (segments: TranscriptSegment[]) => {
        if (!params.id) return
        try {
            await saveNoteTranscript(params.id as string, JSON.stringify(segments))
            setLastSaved(new Date())
        } catch (err) {
            console.error('Failed to persist transcript:', err)
        }
    }, [params.id])

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
            await deleteNote(params.id as string)
            router.push('/new/admin/notes')
            toast.success('Note deleted')
        }
    }

    const handleSuperpower = async () => {
        if (isSynthesizing) return
        setIsSynthesizing(true)
        setActiveTab('ai')
        try {
            const summary = await generateAISummary(params.id as string)
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

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-12 py-6 -mx-4 sm:-mx-6 md:-mx-12">
            <div className="w-full space-y-6">
                
                {/* Header Row: Title/Date on left, Actions on right */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                    {/* Left Side: Title & Date Details & Attendees */}
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                        <div className="flex items-baseline gap-1 min-w-0 relative">
                            {/* Hidden span to measure dynamic title width */}
                            <span 
                                ref={titleSpanRef}
                                className="absolute opacity-0 pointer-events-none whitespace-pre text-xl sm:text-2xl font-semibold tracking-tight lowercase"
                            >
                                {note.title || 'untitled note'}
                            </span>

                            <input
                                type="text"
                                value={note.title}
                                onChange={(e) => {
                                    const newTitle = e.target.value
                                    setNote({ ...note, title: newTitle })
                                    setUpdatedTitle(params.id as string, newTitle)
                                    saveNote({ title: newTitle })
                                }}
                                placeholder="untitled note"
                                style={{ width: titleWidth }}
                                className="bg-transparent text-xl sm:text-2xl font-semibold tracking-tight text-foreground placeholder:text-muted/50 focus:outline-none border-none p-0 lowercase min-w-[50px] max-w-[300px] sm:max-w-[500px]"
                            />

                            <div className="text-xs text-muted-fg/60 lowercase shrink-0">
                                {format(new Date(note.created_at), 'MM.dd.yy')}
                                {lastSaved && ` • synced ${format(lastSaved, 'HH:mm:ss')}`}
                            </div>
                        </div>

                        {/* Attendees Selection Row */}
                        <div className="flex items-center gap-3.5 flex-wrap">
                            {CORE_PEOPLE.filter(p => (note.attendees || []).includes(p.name)).map((p) => (
                                <button
                                    key={p.name}
                                    onClick={() => handleToggleAttendee(p.name)}
                                    className="text-xs font-mono text-foreground hover:text-red-500 hover:line-through transition-colors cursor-pointer select-none lowercase"
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
                                        className="p-1 text-muted-fg hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer flex items-center justify-center"
                                        title="Add attendee"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>

                                    <AnimatePresence>
                                        {isAddMenuOpen && (
                                            <>
                                                {/* Backdrop to close menu */}
                                                <div 
                                                    className="fixed inset-0 z-[40]" 
                                                    onClick={() => setIsAddMenuOpen(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 4 }}
                                                    transition={{ duration: 0.1 }}
                                                    className="absolute left-0 mt-1 w-32 bg-background border border-neutral-200 dark:border-neutral-800 rounded shadow-md py-1 z-[50]"
                                                >
                                                    {CORE_PEOPLE.filter(p => !(note.attendees || []).includes(p.name)).map((p) => (
                                                        <button
                                                            key={p.name}
                                                            onClick={() => {
                                                                handleToggleAttendee(p.name)
                                                                setIsAddMenuOpen(false)
                                                            }}
                                                            className="w-full text-left px-2.5 py-1.5 text-xs text-muted-fg hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors lowercase font-mono cursor-pointer"
                                                        >
                                                            {p.initials} • {p.name}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Action Icons Row */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Transcribe Button */}
                        <MeetingRecorder
                            onTranscription={handleTranscription}
                            isRecording={isRecording}
                            setIsRecording={setIsRecording}
                            isInitializing={isInitializing}
                            setIsInitializing={setIsInitializing}
                        />

                        {/* Copy Transcription Button */}
                        <button
                            onClick={handleCopyTranscription}
                            className="p-1.5 text-muted-fg hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                            title="Copy Transcription"
                            disabled={transcriptSegments.length === 0}
                            style={{ opacity: transcriptSegments.length === 0 ? 0.35 : 1 }}
                        >
                            {isTranscriptCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {/* Download Transcription Button */}
                        <button
                            onClick={handleDownloadTranscription}
                            className="p-1.5 text-muted-fg hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                            title="Download Transcription"
                            disabled={transcriptSegments.length === 0}
                            style={{ opacity: transcriptSegments.length === 0 ? 0.35 : 1 }}
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        {/* Superpower Button */}
                        <button
                            onClick={handleSuperpower}
                            disabled={isSynthesizing}
                            className={cn(
                                "p-1.5 text-muted-fg hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer",
                                isSynthesizing && "opacity-50 cursor-not-allowed"
                            )}
                            title="Superpower (AI Summary)"
                        >
                            {isSynthesizing ? (
                                <Loader2 className="w-4 h-4 animate-spin text-muted-fg" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={handleDelete}
                            className="p-1.5 text-muted-fg hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                            title="Delete Note"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-6">
                    {/* TAB SWITCHER */}
                    <div className="flex items-center gap-6 pb-2">
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={cn(
                                "text-sm lowercase tracking-normal transition-colors pb-1 cursor-pointer",
                                activeTab === 'notes' ? "text-foreground font-semibold" : "text-muted-fg hover:text-foreground/70"
                            )}
                        >
                            notes
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={cn(
                                "text-sm lowercase tracking-normal transition-colors pb-1 flex items-center gap-1.5 cursor-pointer",
                                activeTab === 'ai' ? "text-foreground font-semibold" : "text-muted-fg hover:text-foreground/70"
                            )}
                        >
                            ai summary
                        </button>
                        <button
                            onClick={() => setActiveTab('transcript')}
                            className={cn(
                                "text-sm lowercase tracking-normal transition-colors pb-1 flex items-center gap-1.5 cursor-pointer",
                                activeTab === 'transcript' ? "text-foreground font-semibold" : "text-muted-fg hover:text-foreground/70"
                            )}
                        >
                            transcript
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className="w-full">
                        <AnimatePresence mode="wait">
                            {activeTab === 'notes' && (
                                <motion.div
                                    key="notes"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <TipTapEditor
                                        ref={editorRef}
                                        initialContent={note.content}
                                        onChange={(content) => {
                                            setNote({ ...note, content })
                                            saveNote({ content })
                                        }}
                                    />
                                </motion.div>
                            )}

                            {activeTab === 'ai' && (
                                <motion.div
                                    key="ai"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="w-full !max-w-full !mx-0"
                                >
                                    {isSynthesizing ? (
                                        <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                                            <Sparkles className="w-5 h-5 text-muted-fg animate-spin" />
                                            <div>
                                                <p className="text-sm text-muted-fg/60 lowercase">synthesizing summary...</p>
                                            </div>
                                        </div>
                                    ) : note.ai_summary ? (
                                        <div className="relative pt-2 w-full !max-w-full !mx-0 space-y-4">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={copyToEditor}
                                                    className="flex items-center gap-1.5 py-1 px-2.5 rounded text-xs text-muted-fg hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors bg-transparent cursor-pointer font-medium lowercase"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                    copy to notes
                                                </button>
                                            </div>
                                            <div className="prose prose-sm sm:prose-base dark:prose-invert focus:outline-none !max-w-full !mx-0 text-foreground leading-relaxed">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {note.ai_summary}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-16 flex flex-col items-center justify-center gap-4 text-center bg-transparent">
                                            <div className="p-2 text-muted-fg">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground lowercase">no ai summary yet</p>
                                                <p className="text-xs text-muted-fg max-w-xs lowercase mt-0.5">add notes or record a transcript, then generate your summary brief.</p>
                                            </div>
                                            <button
                                                onClick={handleSuperpower}
                                                disabled={isSynthesizing}
                                                className="flex items-center gap-1.5 py-1.5 text-xs text-foreground hover:underline transition-colors bg-transparent cursor-pointer font-medium"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                generate summary
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'transcript' && (
                                <motion.div
                                    key="transcript"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="w-full !max-w-full !mx-0"
                                >
                                    {transcriptSegments.length === 0 ? (
                                        <div className="py-16 flex flex-col items-center justify-center gap-4 text-center bg-transparent">
                                            <div className="p-2 text-muted-fg">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground lowercase">no transcription yet</p>
                                                <p className="text-xs text-muted-fg max-w-xs lowercase mt-0.5">start transcription using the play icon in the top header row.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative pt-2 w-full !max-w-full !mx-0 space-y-6">
                                            <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
                                                <span className="text-xs text-muted-fg/60 lowercase">live meeting audio transcript</span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleCopyTranscription}
                                                        className="flex items-center gap-1.5 py-1 px-2.5 rounded text-xs text-muted-fg hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors bg-transparent cursor-pointer font-medium lowercase"
                                                    >
                                                        {isTranscriptCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                        copy to clipboard
                                                    </button>
                                                    <button
                                                        onClick={handleDownloadTranscription}
                                                        className="flex items-center gap-1.5 py-1 px-2.5 rounded text-xs text-muted-fg hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors bg-transparent cursor-pointer font-medium lowercase"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        download txt
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
                                                            "text-sm sm:text-base leading-relaxed text-foreground/90",
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
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>

            {/* Sync Overlay */}
            <div className="fixed bottom-8 right-8 z-50">
                <AnimatePresence>
                    {saving && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-foreground text-background px-3.5 py-2 shadow-lg flex items-center gap-2 text-xs font-medium lowercase"
                        >
                            <div className="w-1.5 h-1.5 bg-background rounded-full animate-ping" />
                            saving...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
