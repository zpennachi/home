'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { signout } from '@/app/new/login/actions'
import { createNote } from '@/app/new/admin/notes/actions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAdminSync } from './AdminSyncProvider'

const toolItems = [
    { name: 'Design System', href: '/new/admin/design' },
    { name: 'Projects', href: '/new/admin/projects' },
]

export function AdminSidebar({
    isMobileOpen,
    setIsMobileOpen
}: {
    isMobileOpen?: boolean;
    setIsMobileOpen?: (open: boolean) => void
}) {
    const pathname = usePathname()
    const router = useRouter()
    const { activeNoteId, setActiveNoteId, notes } = useAdminSync()
    const [isCreating, setIsCreating] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isToolsOpen, setIsToolsOpen] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const sidebarNotes = notes.slice(0, 15)

    const handleCreateNote = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isCreating) return

        setIsCreating(true)
        try {
            const newNote = await createNote()
            toast.success('Note created')
            setActiveNoteId(newNote.id)
            router.push(`/new/admin/notes/${newNote.id}`)
        } catch (err) {
            toast.error('Failed to create note')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen?.(false)}
                    className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[45] md:hidden"
                />
            )}

            <div
                className={cn(
                    "fixed left-0 top-0 bottom-0 w-64 bg-background flex flex-col z-50 transition-transform duration-300 h-full md:rounded-none shadow-none md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="h-20 flex items-center px-6 relative">
                    <div className="w-5 h-5 bg-foreground rounded-sm mr-3" />
                    <div>
                        <span className="block font-medium text-foreground text-sm lowercase">zpennachi</span>
                        <div className="flex items-center gap-1.5">
                            <span className="block text-xs text-muted-fg/60 lowercase font-mono">admin</span>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileOpen?.(false)}
                        className="absolute right-4 p-2 text-muted-fg hover:text-foreground md:hidden font-mono text-xs"
                    >
                        &lt;
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar flex flex-col">
                    {/* Utility Tools Dropdown */}
                    <div className="space-y-1">
                        <button
                            onClick={() => setIsToolsOpen(!isToolsOpen)}
                            className={cn(
                                "w-full group flex items-center gap-3 px-3 py-1.5 rounded-sm text-[11px] font-mono tracking-wider lowercase transition-all duration-200",
                                isToolsOpen ? "text-foreground font-semibold" : "text-muted-fg/40 hover:text-foreground"
                            )}
                        >
                            <span className="flex-1 text-left">tools</span>
                            <span className="font-mono text-[9px] select-none ml-1">{isToolsOpen ? 'v' : '>'}</span>
                        </button>

                        {isToolsOpen && (
                            <div className="overflow-hidden space-y-0.5 pt-1">
                                {toolItems.map((item) => {
                                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/new/admin');
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => {
                                                if (window.innerWidth < 768) setIsMobileOpen?.(false)
                                            }}
                                            className={cn(
                                                "group flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-normal lowercase transition-all duration-150 pl-6",
                                                isActive ? "text-foreground font-medium" : "text-muted-fg hover:text-foreground"
                                            )}
                                        >
                                            <span>{item.name.toLowerCase()}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Persistent Notes Area */}
                    <div className="flex-1 flex flex-col min-h-0 space-y-3">
                        <div className="flex items-center justify-between px-3">
                            <span className="text-[11px] font-mono text-muted-fg/40 tracking-wider lowercase">notes</span>
                            <button
                                onClick={handleCreateNote}
                                disabled={isCreating}
                                className="p-1 text-muted-fg/40 hover:text-foreground transition-colors group/plus cursor-pointer"
                                title="Quick Create Note"
                            >
                                {isCreating ? (
                                    <span className="text-[10px] font-mono lowercase">...</span>
                                ) : (
                                    <span className="text-[10px] font-mono select-none">+</span>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5 -mx-1 px-1">
                            {sidebarNotes.map((note) => {
                                const isNoteActive = activeNoteId === note.id;
                                return (
                                    <Link
                                        key={note.id}
                                        href={`/new/admin/notes/${note.id}`}
                                        onClick={() => {
                                            setActiveNoteId(note.id)
                                            if (window.innerWidth < 768) setIsMobileOpen?.(false)
                                        }}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-normal lowercase transition-all duration-150 relative group/note",
                                            isNoteActive
                                                ? "text-foreground font-semibold"
                                                : "text-muted-fg hover:text-foreground"
                                        )}
                                    >
                                        <span className={cn("text-xs font-mono select-none w-3 shrink-0", note.is_pinned ? "text-amber-500 font-semibold" : "text-muted-fg/40")}>
                                            {note.is_pinned ? '*' : '-'}
                                        </span>
                                        <span className="truncate flex-1">
                                            {(note.title || 'untitled').toLowerCase()}
                                        </span>
                                    </Link>
                                )
                            })}

                            {notes.length >= 15 && (
                                <Link
                                    href="/new/admin"
                                    onClick={() => {
                                        if (window.innerWidth < 768) setIsMobileOpen?.(false)
                                    }}
                                    className="block text-xs text-muted-fg hover:text-foreground font-normal lowercase px-3 py-3 mt-2"
                                >
                                    view all archive
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-3 mt-auto space-y-1">
                    <Link
                        href="/new"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-normal text-muted-fg hover:text-foreground w-full transition-colors lowercase"
                    >
                        live site
                    </Link>
                    <button
                        onClick={() => signout()}
                        className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-normal text-red-500/80 hover:text-red-500 w-full transition-colors lowercase cursor-pointer"
                    >
                        sign out
                    </button>
                </div>
            </div>
        </>
    )
}
