"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getNotes } from '@/app/new/admin/notes/actions'
import { createClient } from '@/lib/supabase/client'

interface Note {
    id: string
    title: string
    content: string
    transcript: string
    ai_summary: string
    is_pinned: boolean
    created_at: string
    updated_at: string
    attendees: string[]
    user_id: string
}

interface AdminSyncContextType {
    notes: Note[]
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>
    loadNotes: () => Promise<void>
    notesLoading: boolean
    activeNoteId: string | null
    setActiveNoteId: (id: string | null) => void
    updateNoteInCache: (id: string, updates: Partial<Note>) => void
}

const AdminSyncContext = createContext<AdminSyncContextType | undefined>(undefined)

export function AdminSyncProvider({ children }: { children: ReactNode }) {
    const [notes, setNotes] = useState<Note[]>([])
    const [notesLoading, setNotesLoading] = useState(true)
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null)

    const loadNotes = async () => {
        setNotesLoading(true)
        try {
            const data = await getNotes()
            setNotes(data)
        } catch (err) {
            console.error('Failed to load notes in sync provider:', err)
        } finally {
            setNotesLoading(false)
        }
    }

    const updateNoteInCache = (id: string, updates: Partial<Note>) => {
        setNotes(prev => prev.map(note => 
            note.id === id ? { ...note, ...updates } : note
        ))
    }

    useEffect(() => {
        loadNotes()

        const supabase = createClient()
        const channel = supabase
            .channel('admin-notes-global-sync')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notes'
                },
                (payload: any) => {
                    console.log('[REALTIME] Sync Provider detected change:', payload.eventType)
                    if (payload.eventType === 'INSERT') {
                        setNotes(prev => {
                            if (prev.some(n => n.id === payload.new.id)) return prev
                            return [payload.new, ...prev]
                        })
                    } else if (payload.eventType === 'UPDATE') {
                        setNotes(prev => prev.map(note =>
                            note.id === payload.new.id
                                ? { ...note, ...payload.new }
                                : note
                        ))
                    } else if (payload.eventType === 'DELETE') {
                        setNotes(prev => prev.filter(note => note.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <AdminSyncContext.Provider
            value={{
                notes,
                setNotes,
                loadNotes,
                notesLoading,
                activeNoteId,
                setActiveNoteId,
                updateNoteInCache
            }}
        >
            {children}
        </AdminSyncContext.Provider>
    )
}

export function useAdminSync() {
    const context = useContext(AdminSyncContext)
    if (context === undefined) {
        throw new Error('useAdminSync must be used within an AdminSyncProvider')
    }
    return context
}
