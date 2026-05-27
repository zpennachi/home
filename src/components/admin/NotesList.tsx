'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, Pin, Clock, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import { getNotes, createNote, deleteNote, updateNote } from '@/app/new/admin/notes/actions'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function NotesList() {
    const [notes, setNotes] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadNotes()

        const supabase = createClient()
        const channel = supabase
            .channel('dashboard-notes-sync')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notes'
                },
                (payload: any) => {
                    console.log('[REALTIME] Dashboard detected change:', {
                        event: payload.eventType,
                        new: payload.new,
                        old: payload.old
                    })

                    if (payload.eventType === 'INSERT') {
                        setNotes(prev => [payload.new, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        // Ensure we have enough data to update the card UI
                        if (payload.new && 'title' in payload.new) {
                            setNotes(prev => prev.map(note =>
                                note.id === payload.new.id
                                    ? { ...note, ...payload.new }
                                    : note
                            ))
                        } else {
                            console.warn('[REALTIME] Dashboard received incomplete update. Refetching...')
                            loadNotes()
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setNotes(prev => prev.filter(note => note.id !== payload.old.id))
                    }
                }
            )
            .subscribe((status, err) => {
                console.log('[REALTIME] Dashboard sync status:', status)
                if (err) console.error('[REALTIME] Dashboard sync error:', err)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function loadNotes() {
        setLoading(true)
        const data = await getNotes()
        setNotes(data)
        setLoading(false)
    }

    async function handleCreate() {
        try {
            const newNote = await createNote()
            toast.success('Note created')
            router.push(`/new/admin/notes/${newNote.id}`)
        } catch (err) {
            toast.error('Failed to create note')
        }
    }

    async function handleDelete(e: React.MouseEvent, id: string) {
        e.preventDefault()
        e.stopPropagation()
        if (confirm('Delete this note?')) {
            await deleteNote(id)
            setNotes(notes.filter(n => n.id !== id))
            toast.success('Note deleted')
        }
    }

    async function togglePin(e: React.MouseEvent, note: any) {
        e.preventDefault()
        e.stopPropagation()
        const newPinned = !note.is_pinned
        await updateNote(note.id, { is_pinned: newPinned })
        setNotes(notes.map(n => n.id === note.id ? { ...n, is_pinned: newPinned } : n))
        toast.success(newPinned ? 'Note pinned' : 'Note unpinned')
    }

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    )

    if (loading && notes.length === 0) {
        return (
            <div className="py-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-fg" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg group-focus-within:text-foreground transition-colors" />
                    <input
                        type="search"
                        placeholder="Search notes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-background/50 backdrop-blur-sm border border-muted rounded-2xl pl-12 pr-4 py-3.5 md:py-4 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-fg bg-muted/20 h-11 md:h-14 px-4 rounded-xl border border-muted/50 whitespace-nowrap">
                        <span>{filteredNotes.length} Notes</span>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-11 md:h-14 bg-foreground text-background rounded-xl md:rounded-2xl font-bold hover:scale-[1.02] md:hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Note</span>
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredNotes.map((note) => (
                        <motion.div
                            layout
                            key={note.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group"
                        >
                            <Link href={`/new/admin/notes/${note.id}`}>
                                <div className={cn(
                                    "h-full p-6 bg-background border rounded-3xl transition-all duration-300 relative flex flex-col gap-4 overflow-hidden",
                                    note.is_pinned ? "border-foreground/20 ring-1 ring-foreground/5 shadow-lg shadow-black/5" : "border-muted hover:border-foreground/20 hover:shadow-xl hover:shadow-black/5"
                                )}>
                                    {/* Actions Overlay */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={(e) => togglePin(e, note)}
                                            className={cn(
                                                "p-2 rounded-xl transition-colors",
                                                note.is_pinned ? "bg-foreground text-background" : "bg-muted/50 hover:bg-muted text-muted-fg hover:text-foreground"
                                            )}
                                        >
                                            <Pin className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, note.id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-start justify-between gap-4">
                                        <div className="p-3 bg-muted/50 rounded-2xl">
                                            <FileText className="w-5 h-5 text-foreground" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-foreground transition-colors">
                                            {note.title || 'Untitled'}
                                        </h3>
                                        <p className="text-muted-fg text-xs leading-relaxed line-clamp-3">
                                            {note.content || 'No content yet...'}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-muted/30 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] text-muted-fg font-medium">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(note.updated_at))} ago
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-fg group-hover:translate-x-1 group-hover:text-foreground transition-all" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredNotes.length === 0 && !loading && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-muted/10 rounded-3xl border border-dashed border-muted">
                        <FileText className="w-12 h-12 text-muted-fg/20 mb-4" />
                        <p className="text-muted-fg text-sm">No notes found. Create your first one!</p>
                        <button onClick={handleCreate} className="mt-4 text-foreground font-bold hover:underline">New Note</button>
                    </div>
                )}
            </div>
        </div>
    )
}
