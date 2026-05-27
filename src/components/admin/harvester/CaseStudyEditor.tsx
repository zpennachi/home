'use client'

import React, { useState, useEffect } from 'react'
import { HarvestedSession, ProjectBrand, promoteSessionToProject, synthesizeProject } from '@/app/new/admin/harvester/actions'
import { CaseStudyLayout } from '@/components/work/CaseStudyLayout'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Save, Rocket, X, ChevronLeft, Layout, Type, Palette as PaletteIcon, Boxes } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorProps {
    session: HarvestedSession
    onClose: () => void
}

export function CaseStudyEditor({ session, onClose }: EditorProps) {
    const [title, setTitle] = useState(session.title)
    const [summary, setSummary] = useState(session.summary)
    const [content, setContent] = useState('')
    const [branding, setBranding] = useState<ProjectBrand>(session.branding)
    const [stack, setStack] = useState<string[]>(session.stack)
    const [isSynthesizing, setIsSynthesizing] = useState(true)

    // Initial Synthesis logic (simplified for client-side preview)
    useEffect(() => {
        const synthesize = async () => {
            const result = await synthesizeProject(session.repoPath, session.title, session.summary)
            setContent(result.content)
            setStack(result.stack)
            setIsSynthesizing(false)
        }
        synthesize()
    }, [session])

    const handleSave = async (isLive: boolean) => {
        // Prepare promoted session
        const promotedSession = {
            ...session,
            title,
            summary,
            branding,
            stack
        }

        await promoteSessionToProject(promotedSession)
        if (isLive) onClose()
    }

    return (
        <div className="fixed inset-0 bg-background z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Top Bar */}
            <header className="h-16 border-b border-muted flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
                        <span className="text-[10px] font-mono text-muted-fg uppercase tracking-widest">Editor Lab v2.0</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleSave(false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-fg hover:text-foreground hover:bg-muted transition-all"
                    >
                        <Save className="w-3.5 h-3.5" />
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        className="flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest bg-foreground text-background hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/10"
                    >
                        <Rocket className="w-3.5 h-3.5" />
                        Push Live
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Controls */}
                <aside className="w-[450px] border-r border-muted overflow-y-auto p-8 space-y-12 bg-muted/5">
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-muted-fg">
                            <Type className="w-4 h-4" />
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Metadata</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-fg px-1">Project Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-background border border-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all font-light"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-fg px-1">One-Liner</label>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    className="w-full bg-background border border-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all min-h-[100px] resize-none leading-relaxed font-light"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-muted-fg">
                            <PaletteIcon className="w-4 h-4" />
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Visual DNA</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-fg px-1">Primary</label>
                                <input
                                    type="color"
                                    value={branding.primaryColor}
                                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                    className="w-full h-12 bg-background border border-muted rounded-xl p-1 cursor-pointer"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-fg px-1">Secondary</label>
                                <input
                                    type="color"
                                    value={branding.secondaryColor}
                                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                    className="w-full h-12 bg-background border border-muted rounded-xl p-1 cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['grid', 'dots', 'waves', 'mesh'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setBranding({ ...branding, pattern: p })}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg border text-[10px] font-mono uppercase tracking-widest transition-all",
                                        branding.pattern === p ? "bg-foreground text-background border-foreground" : "bg-background text-muted-fg border-muted hover:border-muted-fg"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-muted-fg">
                            <Layout className="w-4 h-4" />
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Narrative</h3>
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-background border border-muted rounded-xl px-5 py-6 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all min-h-[600px] font-mono leading-relaxed"
                            placeholder="# Enter Markdown Content..."
                        />
                    </section>
                </aside>

                {/* Right Side: Live Preview */}
                <main className="flex-1 overflow-y-auto bg-background selection:bg-[#39FF14] selection:text-black">
                    <div className="pointer-events-none scale shadow-2xl origin-top">
                        <CaseStudyLayout
                            title={title}
                            description={summary}
                            category="Harvested Project"
                            year="2024"
                            role="Project Lead"
                            stack={stack}
                            branding={branding}
                        >
                            <div className="prose dark:prose-invert">
                                <ReactMarkdown
                                    rehypePlugins={[rehypeRaw]}
                                    remarkPlugins={[remarkGfm]}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        </CaseStudyLayout>
                    </div>
                </main>
            </div>
        </div>
    )
}
