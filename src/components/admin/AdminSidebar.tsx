'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LogOut,
    ExternalLink,
    Palette,
    BookOpen,
    Plus,
    Loader2,
    FileText,
    ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signout } from '@/app/new/login/actions'
import { getNotes, createNote } from '@/app/new/admin/notes/actions'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAdminSync } from './AdminSyncProvider'

const toolItems = [
    { name: 'Design System', href: '/new/admin/design', icon: Palette },
    { name: 'Projects', href: '/new/admin/projects', icon: BookOpen },
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
    const { activeNoteId, activeNoteTitle, updatedTitles } = useAdminSync()
    const [notes, setNotes] = useState<any[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isToolsOpen, setIsToolsOpen] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const loadNotes = async () => {
        const data = await getNotes()
        setNotes(data.slice(0, 15)) // Show top 15 notes (pinned + recent)
    }

    useEffect(() => {
        loadNotes()

        const supabase = createClient()

        const channel = supabase
            .channel('sidebar-notes-sync')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notes'
                },
                (payload: any) => {
                    if (payload.eventType === 'UPDATE') {
                        if (payload.new && 'title' in payload.new) {
                            setNotes(prev => prev.map(note =>
                                note.id === payload.new.id
                                    ? { ...note, ...payload.new }
                                    : note
                            ))
                        } else {
                            loadNotes()
                        }
                    } else {
                        loadNotes()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleCreateNote = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isCreating) return

        setIsCreating(true)
        try {
            const newNote = await createNote()
            toast.success('Note created')
            if (window.innerWidth < 768) setIsMobileOpen?.(false)
            router.push(`/new/admin/notes/${newNote.id}`)
            await loadNotes()
        } catch (err) {
            toast.error('Failed to create note')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen?.(false)}
                        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[45] md:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={false}
                animate={{
                    x: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -300 : 0),
                    opacity: 1
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "fixed left-0 top-0 bottom-0 w-64 bg-background flex flex-col z-50 transition-all h-full md:rounded-none shadow-none",
                    !isMobileOpen && "-translate-x-full md:translate-x-0"
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
                        className="absolute right-4 p-2 text-muted-fg hover:text-foreground md:hidden"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar flex flex-col">
                    {/* Utility Tools Dropdown */}
                    <div className="space-y-1">
                        <button
                            onClick={() => setIsToolsOpen(!isToolsOpen)}
                            className={cn(
                                "w-full group flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-normal lowercase transition-all duration-200",
                                isToolsOpen ? "text-foreground font-semibold" : "text-muted-fg hover:text-foreground"
                            )}
                        >
                            <span className="flex-1 text-left">tools</span>
                            <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-300", isToolsOpen && "rotate-90")} />
                        </button>

                        <AnimatePresence>
                            {isToolsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden space-y-0.5 pt-1"
                                >
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
                                                    "group flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-normal lowercase transition-all duration-150",
                                                    isActive ? "text-foreground font-medium" : "text-muted-fg hover:text-foreground"
                                                )}
                                            >
                                                <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-foreground" : "text-muted-fg group-hover:text-foreground")} />
                                                <span>{item.name.toLowerCase()}</span>
                                            </Link>
                                        )
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Persistent Notes Area */}
                    <div className="flex-1 flex flex-col min-h-0 space-y-3">
                        <div className="flex items-center justify-between px-3">
                            <span className="text-xs font-normal text-muted-fg lowercase">notes</span>
                            <button
                                onClick={handleCreateNote}
                                disabled={isCreating}
                                className="p-1 text-muted-fg hover:text-foreground transition-colors group/plus"
                                title="Quick Create Note"
                            >
                                {isCreating ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground" />
                                ) : (
                                    <Plus className="w-3.5 h-3.5 text-muted-fg group-hover/plus:text-foreground transition-all" />
                                )}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5 -mx-1 px-1">
                            {notes.map((note) => {
                                const isNoteActive = pathname === `/new/admin/notes/${note.id}`;
                                return (
                                    <Link
                                        key={note.id}
                                        href={`/new/admin/notes/${note.id}`}
                                        onClick={() => {
                                            if (window.innerWidth < 768) setIsMobileOpen?.(false)
                                        }}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-normal lowercase transition-all duration-150 relative group/note",
                                            isNoteActive
                                                ? "text-foreground font-semibold"
                                                : "text-muted-fg hover:text-foreground"
                                        )}
                                    >
                                        <FileText className={cn("w-3.5 h-3.5 transition-colors", note.is_pinned ? "text-amber-500" : "text-muted-fg/40 group-hover/note:text-muted-fg/70")} />
                                        <span className="truncate flex-1">
                                            {(updatedTitles[note.id] || note.title || 'untitled').toLowerCase()}
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
                        <ExternalLink className="w-3.5 h-3.5" />
                        live site
                    </Link>
                    <button
                        onClick={() => signout()}
                        className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-normal text-red-500/80 hover:text-red-500 w-full transition-colors lowercase"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        sign out
                    </button>
                </div>
            </motion.div>
        </>
    )
}
