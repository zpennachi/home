'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Trash2, Clock, Lock, MessageSquare, Terminal, Sparkles, Wand2, Copy, Check } from 'lucide-react'
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
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-12 py-6 -mx-4 sm:-mx-6 md:-mx-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
                
                {/* Left Column: Editor/AI Summary Content */}
                <div className="space-y-6 min-w-0">
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
                    </div>

                    {/* CONTENT */}
                    <div className="w-full">
                        <AnimatePresence mode="wait">
                            {activeTab === 'notes' ? (
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
                            ) : (
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
                                        <div className="relative pt-2 w-full !max-w-full !mx-0">
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
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Column: Title, Metadata, Transcription Stack */}
                <div className="space-y-3 lg:pl-4">
                    {/* Title & Date Details */}
                    <div className="space-y-1">
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
                            className="w-full bg-transparent text-lg sm:text-xl font-semibold tracking-tight text-foreground placeholder:text-muted/50 focus:outline-none border-none p-0 lowercase"
                        />

                        <div className="text-xs text-muted-fg/60 lowercase leading-none">
                            {format(new Date(note.created_at), 'MMM d, yyyy')}
                            {lastSaved && ` • synced ${format(lastSaved, 'HH:mm:ss')}`}
                        </div>
                    </div>

                    {/* Action Buttons Stack */}
                    <div className="flex items-center gap-4 pt-2">
                        <AnimatePresence>
                            {!isRecording && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={handleSuperpower}
                                    disabled={isSynthesizing}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-1 text-xs text-muted-fg hover:text-foreground hover:underline transition-colors bg-transparent cursor-pointer",
                                        isSynthesizing
                                            ? "text-muted-fg cursor-not-allowed opacity-50"
                                            : "text-muted-fg hover:text-foreground"
                                    )}
                                >
                                    {isSynthesizing ? <Wand2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    <span>{isSynthesizing ? "..." : "superpower"}</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                        
                        {activeTab === 'ai' && note.ai_summary && !isSynthesizing && (
                            <button
                                onClick={copyToEditor}
                                className="flex items-center gap-1.5 py-1 text-xs text-muted-fg hover:text-foreground hover:underline transition-colors bg-transparent cursor-pointer"
                            >
                                <Copy className="w-4 h-4" />
                                <span>copy to notes</span>
                            </button>
                        )}

                        <button
                            onClick={handleDelete}
                            className="p-1 text-muted-fg hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete Note"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Transcription Section */}
                    <div className="pt-2 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-normal text-muted-fg/60 lowercase">transcription</span>
                            <MeetingRecorder
                                onTranscription={handleTranscription}
                                isRecording={isRecording}
                                setIsRecording={setIsRecording}
                                isInitializing={isInitializing}
                                setIsInitializing={setIsInitializing}
                            />
                        </div>

                        <div className="h-[120px] overflow-y-auto custom-scrollbar py-1 space-y-2 font-mono text-xs">
                            <AnimatePresence initial={false}>
                                {transcriptSegments.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-muted-fg/40 italic text-xs lowercase">
                                        {isRecording ? "listening..." : "feed inactive"}
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
                                                "shrink-0 text-[10px] lowercase w-8 pt-0.5",
                                                seg.speaker === 0 ? "text-foreground/75 font-semibold" : "text-muted-fg/60"
                                            )}>
                                                s{seg.speaker}
                                            </span>
                                            <span className={cn(
                                                "leading-snug",
                                                seg.isFinal ? "text-foreground/80" : "text-muted-fg/50 animate-pulse"
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
