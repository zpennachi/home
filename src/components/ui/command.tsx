'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandContextValue {
    search: string
    setSearch: (s: string) => void
}

const CommandContext = React.createContext<CommandContextValue | undefined>(undefined)

export function Command({ children, className }: { children: React.ReactNode; className?: string }) {
    const [search, setSearch] = React.useState('')
    return (
        <CommandContext.Provider value={{ search, setSearch }}>
            <div className={cn('flex flex-col h-full overflow-hidden', className)}>
                {children}
            </div>
        </CommandContext.Provider>
    )
}

export function CommandInput({ placeholder, className }: { placeholder?: string; className?: string }) {
    const context = React.useContext(CommandContext)
    return (
        <div className="flex items-center px-4 py-3 gap-3 border-b border-muted">
            <Search className="w-4 h-4 text-muted-fg" />
            <input
                className={cn(
                    'flex-1 bg-transparent border-none text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-fg/50 font-sans',
                    className
                )}
                placeholder={placeholder}
                value={context?.search}
                onChange={(e) => context?.setSearch(e.target.value)}
                autoFocus
            />
        </div>
    )
}

export function CommandList({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('overflow-y-auto scrollbar-thin scrollbar-thumb-muted-fg/10 scrollbar-track-transparent', className)}>
            {children}
        </div>
    )
}

export function CommandEmpty({ children, className }: { children: React.ReactNode; className?: string }) {
    const context = React.useContext(CommandContext)
    if (context?.search && React.Children.count(children) === 0) return null // Simplified
    return <div className={cn('py-12 text-center text-sm text-muted-fg font-medium', className)}>{children}</div>
}

export function CommandGroup({ heading, children, className }: { heading?: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('px-2 py-3', className)}>
            {heading && <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-fg font-bold">{heading}</div>}
            <div className="space-y-1">{children}</div>
        </div>
    )
}

export function CommandItem({ children, onSelect, className }: { children: React.ReactNode; onSelect?: () => void; className?: string }) {
    return (
        <div
            onClick={onSelect}
            className={cn(
                'group flex items-center px-3 py-2.5 rounded-xl cursor-pointer hover:bg-muted transition-all text-muted-fg hover:text-foreground aria-selected:bg-muted aria-selected:text-foreground font-medium',
                className
            )}
        >
            {children}
        </div>
    )
}

export function CommandSeparator({ className }: { className?: string }) {
    return <div className={cn('h-px bg-muted mx-3', className)} />
}

export function CommandShortcut({ children, className }: { children: React.ReactNode; className?: string }) {
    return <span className={cn('ml-auto text-[10px] font-mono text-muted-fg/40', className)}>{children}</span>
}

export function CommandDialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false)
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onOpenChange])

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]"
                    />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="w-full max-w-xl bg-background border border-muted rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            <Command>{children}</Command>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
