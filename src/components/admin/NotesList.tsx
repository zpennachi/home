'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createNote, deleteNote, updateNote } from '@/app/new/admin/notes/actions'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAdminSync } from './AdminSyncProvider'

export function NotesList() {
    const { notes, setNotes, setActiveNoteId, notesLoading: loading, updateNoteInCache, loadNotes } = useAdminSync()
    const [search, setSearch] = useState('')
    const router = useRouter()

    async function handleCreate() {
        try {
            const newNote = await createNote()
            toast.success('Note created')
            setActiveNoteId(newNote.id)
            router.push(`/new/admin/notes/${newNote.id}`)
        } catch (err) {
            toast.error('Failed to create note')
        }
    }

    async function handleDelete(e: React.MouseEvent, id: string) {
        e.preventDefault()
        e.stopPropagation()
        if (confirm('Delete this note?')) {
            // Optimistic update
            setNotes(prev => prev.filter(n => n.id !== id))
            try {
                await deleteNote(id)
                toast.success('Note deleted')
            } catch (err) {
                toast.error('Failed to delete note')
                loadNotes()
            }
        }
    }

    async function togglePin(e: React.MouseEvent, note: any) {
        e.preventDefault()
        e.stopPropagation()
        const newPinned = !note.is_pinned
        // Optimistic update
        updateNoteInCache(note.id, { is_pinned: newPinned })
        try {
            await updateNote(note.id, { is_pinned: newPinned })
            toast.success(newPinned ? 'Note pinned' : 'Note unpinned')
        } catch (err) {
            toast.error('Failed to update pin status')
            updateNoteInCache(note.id, { is_pinned: !newPinned })
        }
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
                        className="w-full bg-transparent border-0 pr-4 py-1.5 text-sm focus:outline-none font-normal transition-all lowercase"
                    />
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto shrink-0 justify-between md:justify-end">
                    <span className="text-[11px] font-mono text-muted-fg/40 font-normal select-none lowercase">
                        {filteredNotes.length} notes
                    </span>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 py-1.5 text-[11px] font-mono lowercase font-medium transition-all text-foreground hover:underline bg-transparent cursor-pointer"
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
                            onClick={() => setActiveNoteId(note.id)}
                            className="flex items-center justify-between py-2 transition-all duration-150 group"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                {/* Details */}
                                <div className="flex items-baseline gap-6 min-w-0 flex-1">
                                    <span className="font-medium text-sm text-foreground truncate group-hover:text-muted-fg transition-colors lowercase">
                                        {note.is_pinned && <span className="text-amber-500 mr-1.5 font-medium font-mono">*</span>}
                                        {note.title || 'untitled'}
                                    </span>
                                    <span className="text-[13px] text-muted-fg/50 truncate font-normal max-w-xl hidden md:inline lowercase">
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
