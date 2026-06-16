'use client'

import { usePathname } from 'next/navigation'
import { useAdminSync } from '@/components/admin/AdminSyncProvider'
import { NoteEditor } from '@/components/admin/NoteEditor'

export default function NotesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { activeNoteId } = useAdminSync()

    // Determine if we're on a specific note route
    const isNoteRoute = pathname.startsWith('/new/admin/notes/') && pathname !== '/new/admin/notes'

    // Show editor when we have an active note (either from route or sidebar click)
    const showEditor = isNoteRoute || !!activeNoteId

    if (showEditor) {
        return <NoteEditor />
    }

    return <>{children}</>
}
