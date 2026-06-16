'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAdminSync } from '@/components/admin/AdminSyncProvider'

/**
 * Thin route handler — its only job is to sync the URL param into context.
 * The actual editor is rendered by the parent notes/layout.tsx and persists
 * across note-to-note navigation (the Notion pattern).
 */
export default function NoteRouteHandler() {
    const params = useParams()
    const { setActiveNoteId } = useAdminSync()

    useEffect(() => {
        const noteId = params.id as string
        if (noteId) {
            setActiveNoteId(noteId)
        }
    }, [params.id, setActiveNoteId])

    // Render nothing — the layout handles everything
    return null
}
