'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Clock, Lock, MessageSquare, Terminal, Sparkles, Wand2, Copy, Check } from 'lucide-react'
import Link from 'next/link'
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

export default function NoteEditorPage() {
    const params = useParams()
    const router = useRouter()
    const { setActiveNoteId, setUpdatedTitle } = useAdminSync()

    // Note State
    const [note, setNote] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // AI Superpower State
    const [isSynthesizing, setIsSynthesizing] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<'notes' | 'ai'>('notes')

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

    // Auto-scroll transcript (Container only, not global)
    useEffect(() => {
        const container = transcriptEndRef.current?.parentElement
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [transcriptSegments])

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
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* STICKY CONTROL CENTER (FIXED TOP) */}
            <div className="flex-none bg-background/80 backdrop-blur-xl border-b border-muted -mx-4 sm:-mx-6 md:-mx-12 px-4 sm:px-6 md:px-12 py-6 z-40">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-end">
                    {/* Left: Nav & Title Area */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/new/admin"
                                className="group flex items-center gap-2 text-muted-fg hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                <span className="text-sm font-medium">Back to Notes</span>
                            </Link>
                            {lastSaved && (
                                <span className="text-[10px] text-muted-fg font-mono uppercase tracking-widest lg:hidden">
                                    Synced {format(lastSaved, 'HH:mm:ss')}
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={note.title}
                                onChange={(e) => {
                                    const newTitle = e.target.value
                                    setNote({ ...note, title: newTitle })
                                    setUpdatedTitle(params.id as string, newTitle)
                                    saveNote({ title: newTitle })
                                }}
                                placeholder="Meeting Context / Title"
                                className="w-full bg-transparent text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-foreground placeholder:text-muted focus:outline-none border-none p-0"
                            />

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-fg bg-muted/30 px-2 py-1 rounded-md">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(note.created_at), 'MMM d, yyyy')}
                                    </div>
                                    {lastSaved && (
                                        <span className="hidden lg:inline text-[9px] text-muted-fg font-mono uppercase tracking-[0.2em]">
                                            Last Sync: {format(lastSaved, 'HH:mm:ss')}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <AnimatePresence>
                                        {!isRecording && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                onClick={handleSuperpower}
                                                disabled={isSynthesizing}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={cn(
                                                    "flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
                                                    isSynthesizing
                                                        ? "bg-muted text-muted-fg cursor-not-allowed"
                                                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                                                )}
                                            >
                                                {isSynthesizing ? <Wand2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                <span>{isSynthesizing ? "..." : "Superpower"}</span>
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                    <button
                                        onClick={handleDelete}
                                        className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete Note"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Transcription Feed Column (Sticky Header) */}
                    <div className="flex flex-col rounded-2xl bg-black/5 border border-muted overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-muted">
                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-foreground/50">
                                <Terminal className="w-3 h-3" />
                                <span>Live Feed</span>
                            </div>
                            <MeetingRecorder
                                onTranscription={handleTranscription}
                                isRecording={isRecording}
                                setIsRecording={setIsRecording}
                                isInitializing={isInitializing}
                                setIsInitializing={setIsInitializing}
                            />
                        </div>

                        <div className="h-[100px] overflow-y-auto custom-scrollbar p-4 space-y-2 font-mono text-[11px] relative bg-black/20 backdrop-blur-sm">
                            <AnimatePresence initial={false}>
                                {transcriptSegments.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-muted-fg/30 italic text-[9px] uppercase tracking-widest">
                                        {isRecording ? "Listening..." : "Feed Inactive"}
                                    </div>
                                ) : (
                                    transcriptSegments.map((seg) => (
                                        <motion.div
                                            key={seg.id}
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-2"
                                        >
                                            <span className={cn(
                                                "shrink-0 font-bold text-[8px] uppercase tracking-tighter w-8 pt-0.5",
                                                seg.speaker === 0 ? "text-indigo-400" : "text-emerald-400"
                                            )}>
                                                S{seg.speaker}
                                            </span>
                                            <span className={cn(
                                                "leading-snug",
                                                seg.isFinal ? "text-foreground/80" : "text-muted-fg animate-pulse"
                                            )}>
                                                {seg.text}
                                            </span>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                            <div ref={transcriptEndRef} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA (INDEPENDENT SCROLL) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-12 pt-6 pb-12 -mx-4 sm:-mx-6 md:-mx-12 flex flex-col">
                {/* TAB SWITCHER */}
                <div className="flex items-center gap-1 mb-6 border-b border-muted relative">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={cn(
                            "relative px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors",
                            activeTab === 'notes' ? "text-foreground" : "text-muted-fg hover:text-foreground/70"
                        )}
                    >
                        Written Notes
                        {activeTab === 'notes' && (
                            <motion.div
                                layoutId="activeContentTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={cn(
                            "relative px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2",
                            activeTab === 'ai' ? "text-indigo-400" : "text-muted-fg hover:text-foreground/70"
                        )}
                    >
                        <Sparkles className="w-3 h-3" />
                        AI Summary
                        {activeTab === 'ai' && (
                            <motion.div
                                layoutId="activeContentTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 rounded-full"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            />
                        )}
                    </button>
                </div>

                {/* TAB CONTENT */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {activeTab === 'notes' ? (
                            <motion.div
                                key="notes"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
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
                        ) : (
                            <motion.div
                                key="ai"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isSynthesizing ? (
                                    <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 border-dashed animate-pulse flex flex-col items-center justify-center gap-4 text-center">
                                        <div className="p-3 bg-indigo-500/10 rounded-full">
                                            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-widest text-indigo-400">Synthesizing Super-Notes</p>
                                            <p className="text-[10px] text-muted-fg font-bold uppercase tracking-[0.2em] mt-1">Synthesizing intelligence from transcript & observations...</p>
                                        </div>
                                    </div>
                                ) : note.ai_summary ? (
                                    <div className="relative p-6 sm:p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 group overflow-hidden">
                                        {/* Background Glow */}
                                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
                                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 relative z-10 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">AI Super-Summary</h3>
                                                    <p className="text-[10px] text-muted-fg font-bold uppercase tracking-[0.2em]">Merged Transcript x User Notes</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleSuperpower}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                                >
                                                    <Wand2 className="w-3 h-3" />
                                                    Regenerate
                                                </button>
                                                <button
                                                    onClick={copyToEditor}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                    Copy to Notes
                                                </button>
                                            </div>
                                        </div>

                                        <div className="relative z-10 prose prose-invert prose-indigo max-w-none prose-sm sm:prose-base
                                        prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:text-indigo-400
                                        prose-p:text-foreground/90 prose-p:leading-relaxed
                                        prose-strong:text-indigo-300
                                        prose-ul:list-disc prose-li:text-foreground/80
                                        border-l-2 border-indigo-500/30 pl-4 sm:pl-6 ml-1">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {note.ai_summary}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-12 rounded-3xl bg-muted/10 border border-muted border-dashed flex flex-col items-center justify-center gap-6 text-center">
                                        <div className="p-4 bg-indigo-500/10 rounded-2xl">
                                            <Sparkles className="w-8 h-8 text-indigo-400/50" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground/70 mb-1">No AI Summary Yet</p>
                                            <p className="text-[11px] text-muted-fg max-w-xs">Add notes or record a transcript, then generate your intelligence brief.</p>
                                        </div>
                                        <button
                                            onClick={handleSuperpower}
                                            disabled={isSynthesizing}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Generate Summary
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Sync Overlay */}
            <div className="fixed bottom-8 right-8 z-50">
                <AnimatePresence>
                    {saving && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest"
                        >
                            <div className="w-2 h-2 bg-background rounded-full animate-ping" />
                            Archiving to Cloud...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
