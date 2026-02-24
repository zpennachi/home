"use client"

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminCommandPalette } from '@/components/admin/AdminCommandPalette'
import { ToastProvider } from '@/components/admin/ToastProvider'
import { Menu, Search as SearchIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AdminSyncProvider } from '@/components/admin/AdminSyncProvider'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <ToastProvider>
            <AdminSyncProvider>
                <div className="h-screen overflow-hidden bg-background text-foreground selection:bg-foreground selection:text-background font-sans transition-colors duration-300 flex flex-col md:flex-row">

                    {/* Mobile Header */}
                    <header className="h-16 border-b border-muted flex items-center justify-between px-4 md:hidden bg-background/80 backdrop-blur-md z-[40]">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMobileOpen(true)}
                                className="p-2 -ml-2 text-muted-fg hover:text-foreground transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="w-6 h-6 bg-foreground rounded shadow-sm" />
                            <span className="text-xs font-black uppercase tracking-widest pt-0.5">Admin</span>
                        </div>
                        <button className="p-2 text-muted-fg hover:text-foreground">
                            <SearchIcon className="w-4 h-4" />
                        </button>
                    </header>

                    <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
                    <AdminCommandPalette />

                    <main className="flex-1 overflow-hidden md:ml-[280px] flex flex-col">
                        <div className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col px-4 md:px-12 py-6 md:py-10">
                            {children}
                        </div>
                    </main>
                </div>
            </AdminSyncProvider>
        </ToastProvider>
    )
}
