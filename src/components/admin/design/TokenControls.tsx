'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { GOOGLE_FONTS } from '@/lib/fonts'
import { Search } from 'lucide-react'

interface TokenControlsProps {
    activeTab: 'colors' | 'typography' | 'layout'
    tokens: Record<string, string>
    onChange: (key: string, val: string) => void
}

export function TokenControls({ activeTab, tokens, onChange }: TokenControlsProps) {
    const [searchQuery, setSearchQuery] = React.useState('')
    const [googleFonts, setGoogleFonts] = React.useState<{ name: string; category: string }[]>([])
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all')

    React.useEffect(() => {
        async function loadAllFonts() {
            try {
                const res = await fetch('https://raw.githubusercontent.com/fontsource/google-font-metadata/main/data/google-fonts-v1.json')
                if (res.ok) {
                    const data = await res.json()
                    const parsed = Object.values(data).map((f: any) => ({
                        name: f.family,
                        category: f.category || 'sans-serif'
                    }))
                    parsed.sort((a, b) => a.name.localeCompare(b.name))
                    setGoogleFonts(parsed)
                }
            } catch (err) {
                console.error('Failed to load all Google Fonts dynamically:', err)
            }
        }
        loadAllFonts()
    }, [])

    const fontCatalog = googleFonts.length > 0 ? googleFonts : GOOGLE_FONTS;

    const filteredFonts = React.useMemo(() => {
        return fontCatalog.filter(f => {
            const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || f.category.toLowerCase() === selectedCategory.toLowerCase();
            return matchesSearch && matchesCategory;
        })
    }, [searchQuery, fontCatalog, selectedCategory])

    if (activeTab === 'colors') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <ControlGroup label="Primary Palette">
                    <ColorControl
                        label="Background"
                        value={tokens['--background']}
                        onChange={(val) => onChange('--background', val)}
                    />
                    <ColorControl
                        label="Foreground"
                        value={tokens['--foreground']}
                        onChange={(val) => onChange('--foreground', val)}
                    />
                    <ColorControl
                        label="Accent"
                        value={tokens['--accent']}
                        onChange={(val) => onChange('--accent', val)}
                    />
                </ControlGroup>

                <ControlGroup label="Muted Accents">
                    <ColorControl
                        label="Surface (Muted)"
                        value={tokens['--muted']}
                        onChange={(val) => onChange('--muted', val)}
                    />
                    <ColorControl
                        label="Muted Foreground"
                        value={tokens['--muted-fg']}
                        onChange={(val) => onChange('--muted-fg', val)}
                    />
                </ControlGroup>
            </div>
        )
    }

    if (activeTab === 'layout') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 pb-12">
                <ControlGroup label="Geometry">
                    <RangeControl
                        label="Corner Radius"
                        min={0}
                        max={48}
                        step={2}
                        unit="px"
                        value={parseInt(tokens['--radius']) || 0}
                        onChange={(val) => onChange('--radius', `${val}px`)}
                    />
                    <RangeControl
                        label="Max Container"
                        min={1000}
                        max={1920}
                        step={20}
                        unit="px"
                        value={parseInt(tokens['--container-max']) || 1440}
                        onChange={(val) => onChange('--container-max', `${val}px`)}
                    />
                </ControlGroup>

                <ControlGroup label="Spacing System">
                    <RangeControl
                        label="Grid Gap"
                        min={0}
                        max={80}
                        step={4}
                        unit="px"
                        value={parseFloat(tokens['--gap']) * 16 || 24} // Basic rem to px conversion for slider
                        onChange={(val) => onChange('--gap', `${val / 16}rem`)}
                    />
                    <RangeControl
                        label="Section Padding"
                        min={0}
                        max={160}
                        step={8}
                        unit="px"
                        value={parseFloat(tokens['--section-padding']) * 16 || 80}
                        onChange={(val) => onChange('--section-padding', `${val / 16}rem`)}
                    />
                </ControlGroup>
            </div>
        )
    }

    if (activeTab === 'typography') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 pb-12">
                <ControlGroup label="Primary Font (Google Fonts)">
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-fg" />
                            <input
                                type="text"
                                placeholder="Search 1,500+ Google Fonts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-background border border-muted rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-foreground/10"
                            />
                        </div>

                        {/* Category Filtering Tabs */}
                        <div className="flex flex-wrap gap-1 py-1">
                            {['all', 'sans-serif', 'serif', 'display', 'handwriting', 'monospace'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border cursor-pointer",
                                        selectedCategory === cat
                                            ? "bg-foreground text-background border-foreground shadow-sm"
                                            : "bg-background text-muted-fg border-muted hover:text-foreground"
                                    )}
                                >
                                    {cat === 'all' ? 'All' : cat}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-1 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted">
                            {googleFonts.length === 0 && (
                                <div className="text-[10px] text-muted-fg font-mono uppercase tracking-widest text-center py-4 animate-pulse">
                                    Loading Google Font Registry...
                                </div>
                            )}

                            {filteredFonts.map((font) => (
                                <button
                                    key={font.name}
                                    onClick={() => onChange('--font-sans', font.name)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded-xl transition-all group relative overflow-hidden cursor-pointer",
                                        tokens['--font-sans'] === font.name
                                            ? "bg-foreground text-background"
                                            : "hover:bg-muted/50 text-foreground"
                                    )}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-base tracking-tight font-medium" style={{ fontFamily: `'${font.name}', sans-serif` }}>
                                            {font.name}
                                        </span>
                                        <span className={cn(
                                            "text-[10px] font-mono uppercase tracking-widest",
                                            tokens['--font-sans'] === font.name ? "opacity-50" : "text-muted-fg"
                                        )}>
                                            {font.category}
                                        </span>
                                    </div>
                                    {tokens['--font-sans'] === font.name && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-background" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </ControlGroup>

                <ControlGroup label="Global Scaling">
                    <RangeControl
                        label="Base Text Size"
                        min={12}
                        max={24}
                        step={1}
                        unit="px"
                        value={parseInt(tokens['--base-size']) || 16}
                        onChange={(val) => onChange('--base-size', `${val}px`)}
                    />
                </ControlGroup>
            </div>
        )
    }

    return null
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-fg/60 font-black ml-1">
                {label}
            </h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    )
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
    return (
        <div className="flex items-center justify-between gap-4 p-3 bg-background rounded-2xl border border-muted shadow-sm group">
            <span className="text-xs font-bold text-muted-fg">{label}</span>
            <div
                className="flex items-center gap-2 bg-muted/30 px-2 py-1.5 rounded-xl border border-muted"
                suppressHydrationWarning
            >
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-5 h-5 rounded-md border-none bg-transparent cursor-pointer overflow-hidden p-0"
                    suppressHydrationWarning
                />
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-16 bg-transparent text-[10px] font-mono uppercase focus:outline-none text-foreground"
                    placeholder="#000000"
                />
            </div>
        </div>
    )
}

function RangeControl({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (val: number) => void }) {
    return (
        <div className="space-y-3 p-4 bg-background rounded-2xl border border-muted shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-fg">{label}</span>
                <span className="text-[10px] font-mono text-foreground bg-muted px-2 py-0.5 rounded">{value}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-foreground"
            />
        </div>
    )
}
