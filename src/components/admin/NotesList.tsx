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
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        (n.attendees && n.attendees.some((a: string) => a.toLowerCase().includes(search.toLowerCase())))
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
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between pb-2">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg group-focus-within:text-foreground transition-colors" />
                    <input
                        type="search"
                        placeholder="search notes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-transparent border-0 pl-8 pr-4 py-2 text-base focus:outline-none font-normal transition-all lowercase"
                    />
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto shrink-0 justify-between md:justify-end">
                    <span className="text-sm text-muted-fg/60 font-normal select-none lowercase">
                        {filteredNotes.length} notes
                    </span>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 py-2 text-sm lowercase font-medium transition-all text-foreground hover:underline bg-transparent"
                    >
                        <Plus className="w-4 h-4" />
                        <span>new note</span>
                    </button>
                </div>
            </div>

            {/* Notes List */}
            <div className="flex flex-col">
                <AnimatePresence mode="popLayout">
                    {filteredNotes.map((note) => (
                        <motion.div
                            layout
                            key={note.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Link 
                                href={`/new/admin/notes/${note.id}`}
                                className="flex items-center justify-between py-3 transition-all duration-150 group"
                            >
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    {/* Pin Button */}
                                    <button
                                        onClick={(e) => togglePin(e, note)}
                                        className={cn(
                                            "p-1 transition-colors shrink-0",
                                            note.is_pinned ? "text-amber-500" : "text-muted-fg/40 hover:text-foreground"
                                        )}
                                        title={note.is_pinned ? "Unpin note" : "Pin note"}
                                    >
                                        <Pin className="w-4 h-4" />
                                    </button>

                                    {/* Details */}
                                    <div className="flex items-baseline gap-6 min-w-0 flex-1">
                                        <span className="font-semibold text-base text-foreground truncate group-hover:text-muted-fg transition-colors lowercase">
                                            {note.title || 'untitled'}
                                        </span>
                                        <span className="text-sm text-muted-fg/60 truncate font-normal max-w-xl hidden md:inline lowercase">
                                            {note.content || 'no content yet...'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 shrink-0 ml-4">
                                    {/* Timestamp */}
                                    <span className="text-xs font-mono text-muted-fg/50 lowercase">
                                        {formatDistanceToNow(new Date(note.updated_at))} ago
                                    </span>

                                    {/* Action Buttons */}
                                    <button
                                        onClick={(e) => handleDelete(e, note.id)}
                                        className="p-1 text-muted-fg/40 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                        title="Delete note"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredNotes.length === 0 && !loading && (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <FileText className="w-8 h-8 text-muted-fg/30 mb-4" />
                        <p className="text-muted-fg text-sm lowercase">no notes found. write a new one.</p>
                        <button 
                            onClick={handleCreate} 
                            className="mt-3 text-sm font-medium lowercase text-foreground hover:underline"
                        >
                            create note
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
