'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command'
import {
    LayoutDashboard,
    Package,
    Plus,
    ExternalLink
} from 'lucide-react'

export function AdminCommandPalette() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((o) => !o)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <div className="bg-background border-b border-muted">
                <CommandInput placeholder="Search command center..." className="h-14 font-sans text-foreground border-none focus:ring-0" />
            </div>
            <CommandList className="bg-background max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted/20 scrollbar-track-transparent">
                <CommandEmpty className="py-12 text-center text-sm text-muted-fg font-medium">No results found.</CommandEmpty>

                <CommandGroup heading="Navigation" className="text-muted-fg font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-3">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/new/admin'))}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground aria-selected:bg-muted cursor-pointer transition-all"
                    >
                        <LayoutDashboard className="w-4 h-4 text-muted-fg" />
                        <span className="text-sm font-medium">Dashboard</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/new/admin/projects'))}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground aria-selected:bg-muted cursor-pointer transition-all"
                    >
                        <Package className="w-4 h-4 text-muted-fg" />
                        <span className="text-sm font-medium">Projects index</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="bg-muted mx-4" />

                <CommandGroup heading="Actions" className="text-muted-fg font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-3">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/new/admin/projects/new'))}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground aria-selected:bg-muted cursor-pointer transition-all"
                    >
                        <Plus className="w-4 h-4 text-muted-fg" />
                        <span className="text-sm font-medium">Initialize new case study</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => window.open('/new', '_blank'))}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground aria-selected:bg-muted cursor-pointer transition-all"
                    >
                        <ExternalLink className="w-4 h-4 text-muted-fg" />
                        <span className="text-sm font-medium">Go to Live Production</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
