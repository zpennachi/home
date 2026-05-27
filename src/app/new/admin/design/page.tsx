'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Palette,
    Layers,
    Type,
    Maximize2,
    Copy,
    RotateCcw,
    Check,
    Box,
    Layout,
    Save,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TokenControls } from '@/components/admin/design/TokenControls'
import { DesignPlayground } from '@/components/admin/design/DesignPlayground'
import { getDesignTokens, saveDesignTokens } from './actions'
import { useToast } from '@/components/admin/ToastProvider'
import { GOOGLE_FONTS } from '@/lib/fonts'

export default function AdminDesignPage() {
    const { toast } = useToast()
    const [tokens, setTokens] = useState<Record<string, string>>({})
    const [initialTokens, setInitialTokens] = useState<Record<string, string>>({})
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout'>('colors')

    // Handle Hydration and Initial Fetch
    useEffect(() => {
        setIsMounted(true)
        async function fetchTokens() {
            const data = await getDesignTokens()
            const currentTokens = data.light || {}

            // Ensure default layout tokens exist if not in CSS
            const defaults = {
                '--gap': '1.5rem',
                '--container-max': '1440px',
                '--section-padding': '5rem',
                ...currentTokens
            }

            setTokens(defaults)
            setInitialTokens(defaults)
        }
        fetchTokens()
    }, [])

    // Global Font Preview Loader (Batch load curated list for visual selection)
    useEffect(() => {
        if (!isMounted) return

        const curatedFonts = GOOGLE_FONTS.map(f => `family=${f.name.replace(/\s+/g, '+')}:wght@400;700`).join('&')
        const linkId = 'google-fonts-preview-loader'

        if (!document.getElementById(linkId)) {
            const link = document.createElement('link')
            link.id = linkId
            link.rel = 'stylesheet'
            link.href = `https://fonts.googleapis.com/css2?${curatedFonts}&display=swap`
            document.head.appendChild(link)
        }
    }, [isMounted])

    // Dynamic Font Loader (Full weights for active selection)
    useEffect(() => {
        const fontSans = tokens['--font-sans'];
        if (fontSans && !fontSans.startsWith('var(')) {
            const fontId = `google-font-${fontSans.replace(/\s+/g, '-').toLowerCase()}`;
            if (!document.getElementById(fontId)) {
                const link = document.createElement('link');
                link.id = fontId;
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${fontSans.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
                document.head.appendChild(link);
            }
        }
    }, [tokens['--font-sans']])

    // Detect Changes
    useEffect(() => {
        if (Object.keys(initialTokens).length > 0) {
            const changed = JSON.stringify(tokens) !== JSON.stringify(initialTokens)
            setHasChanges(changed)
        }
    }, [tokens, initialTokens])

    // Inject styles live into the document root for site-wide preview
    useEffect(() => {
        if (!isMounted) return

        Object.entries(tokens).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value)
        })

        return () => {
            Object.entries(initialTokens).forEach(([key, value]) => {
                document.documentElement.style.removeProperty(key)
            })
        }
    }, [tokens, initialTokens, isMounted])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await saveDesignTokens(tokens, 'light')
            if (result.success) {
                setInitialTokens(tokens)
                setHasChanges(false)
                toast('Design system updated successfully', 'success')
            } else {
                toast(result.error || 'Failed to preserve changes', 'error')
            }
        } catch (e) {
            toast('A synchronization error occurred', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setTokens(initialTokens)
        Object.entries(initialTokens).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value)
        })
        toast('Changes reverted', 'info')
    }

    const copyToClipboard = () => {
        const css = `:root {\n${Object.entries(tokens)
            .map(([key, value]) => `  ${key}: ${value};`)
            .join('\n')}\n}`
        navigator.clipboard.writeText(css)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isMounted) return null

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col gap-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-foreground mb-2">Design Tokens</h1>
                    <p className="text-muted-fg text-sm font-mono uppercase tracking-widest font-bold flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Visual System Controller — V1.0
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {hasChanges && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-2 mr-4"
                            >
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-fg hover:text-foreground transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Discard
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 border border-muted text-foreground px-6 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-muted transition-all"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy CSS'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left: Controls */}
                <aside className="w-80 bg-muted/20 border border-muted rounded-3xl p-6 flex flex-col gap-8 overflow-y-auto scrollbar-none">
                    <div className="flex p-1 bg-muted/40 rounded-xl">
                        {[
                            { id: 'colors', icon: Palette, label: 'Colors' },
                            { id: 'layout', icon: Layers, label: 'Layout' },
                            { id: 'typography', icon: Type, label: 'Type' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                    activeTab === tab.id
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-fg hover:text-foreground"
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <TokenControls
                        activeTab={activeTab}
                        tokens={tokens}
                        onChange={(key: string, val: string) => setTokens(prev => ({ ...prev, [key]: val }))}
                    />
                </aside>

                {/* Right: Playground */}
                <main
                    id="design-playground-root"
                    className="flex-1 bg-background border border-muted rounded-3xl overflow-hidden relative shadow-inner"
                >
                    <div className="absolute top-6 left-6 z-10">
                        <span className="bg-foreground/5 backdrop-blur-md border border-muted px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] text-muted-fg flex items-center gap-2 font-bold">
                            <Box className="w-3 h-3" />
                            Live Component Playground
                        </span>
                    </div>

                    <div className="h-full overflow-y-auto p-12 pt-20 custom-scrollbar">
                        <DesignPlayground />
                    </div>
                </main>
            </div>
        </div>
    )
}
