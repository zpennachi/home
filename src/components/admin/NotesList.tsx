'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getNotes, createNote, deleteNote, updateNote } from '@/app/new/admin/notes/actions'
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
            <div className="py-24 flex items-center justify-center text-xs font-mono text-muted-fg lowercase">
                loading...
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between pb-2">
                <div className="relative flex-1 group w-full">
                    <input
                        type="search"
                        placeholder="search notes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-transparent border-0 pr-4 py-2 text-base focus:outline-none font-normal transition-all lowercase"
                    />
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto shrink-0 justify-between md:justify-end">
                    <span className="text-xs font-mono text-muted-fg/60 font-normal select-none lowercase">
                        {filteredNotes.length} notes
                    </span>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 py-2 text-xs font-mono lowercase font-medium transition-all text-foreground hover:underline bg-transparent cursor-pointer"
                    >
                        new note
                    </button>
                </div>
            </div>

            {/* Notes List */}
            <div className="flex flex-col">
                {filteredNotes.map((note) => (
                    <div key={note.id}>
                        <Link 
                            href={`/new/admin/notes/${note.id}`}
                            className="flex items-center justify-between py-3 transition-all duration-150 group"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                {/* Details */}
                                <div className="flex items-baseline gap-6 min-w-0 flex-1">
                                    <span className="font-semibold text-base text-foreground truncate group-hover:text-muted-fg transition-colors lowercase">
                                        {note.is_pinned && <span className="text-amber-500 mr-1.5 font-semibold font-mono">*</span>}
                                        {note.title || 'untitled'}
                                    </span>
                                    <span className="text-sm text-muted-fg/60 truncate font-normal max-w-xl hidden md:inline lowercase">
                                        {note.content || 'no content yet...'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 ml-4 text-xs font-mono text-muted-fg/40 lowercase">
                                {/* Timestamp */}
                                <span className="text-muted-fg/50 select-none">
                                    {formatDistanceToNow(new Date(note.updated_at))} ago
                                </span>

                                <span className="md:opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                                    <span>/</span>
                                    <button
                                        onClick={(e) => togglePin(e, note)}
                                        className="text-muted-fg hover:text-foreground transition-colors cursor-pointer bg-transparent"
                                    >
                                        {note.is_pinned ? 'unpin' : 'pin'}
                                    </button>
                                    <span>/</span>
                                    <button
                                        onClick={(e) => handleDelete(e, note.id)}
                                        className="text-muted-fg hover:text-red-500 transition-colors cursor-pointer bg-transparent"
                                    >
                                        delete
                                    </button>
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}

                {filteredNotes.length === 0 && !loading && (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <p className="text-muted-fg text-xs font-mono lowercase">no notes found. write a new one.</p>
                        <button 
                            onClick={handleCreate} 
                            className="mt-3 text-xs font-mono lowercase text-foreground hover:underline cursor-pointer bg-transparent"
                        >
                            create note
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
