"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AdminSyncContextType {
    activeNoteId: string | null
    setActiveNoteId: (id: string | null) => void
    activeNoteTitle: string
    setActiveNoteTitle: (title: string) => void
    updatedTitles: Record<string, string>
    setUpdatedTitle: (id: string, title: string) => void
}

const AdminSyncContext = createContext<AdminSyncContextType | undefined>(undefined)

export function AdminSyncProvider({ children }: { children: ReactNode }) {
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
    const [activeNoteTitle, setActiveNoteTitle] = useState("")
    const [updatedTitles, setUpdatedTitles] = useState<Record<string, string>>({})

    const setUpdatedTitle = (id: string, title: string) => {
        setUpdatedTitles(prev => ({ ...prev, [id]: title }))
        // Also update the active title if it's the current one
        if (id === activeNoteId) {
            setActiveNoteTitle(title)
        }
    }

    return (
        <AdminSyncContext.Provider
            value={{
                activeNoteId,
                setActiveNoteId,
                activeNoteTitle,
                setActiveNoteTitle,
                updatedTitles,
                setUpdatedTitle
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
