'use client'

import React, { useState } from 'react'
import { HarvestedSession } from './actions'
import { cn } from '@/lib/utils'
import { Rocket, ImageIcon, Sparkles, Edit3 } from 'lucide-react'
import { CaseStudyEditor } from '@/components/admin/harvester/CaseStudyEditor'

interface HarvesterListProps {
    sessions: HarvestedSession[]
}

export function HarvesterList({ sessions }: HarvesterListProps) {
    const [editingSession, setEditingSession] = useState<HarvestedSession | null>(null)

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sessions.map((session) => (
                    <SessionCard
                        key={session.id}
                        session={session}
                        onEdit={() => setEditingSession(session)}
                    />
                ))}
            </div>

            {editingSession && (
                <CaseStudyEditor
                    session={editingSession}
                    onClose={() => setEditingSession(null)}
                />
            )}
        </>
    )
}

function SessionCard({ session, onEdit }: { session: HarvestedSession, onEdit: () => void }) {
    const { primaryColor, secondaryColor, pattern } = session.branding

    return (
        <div
            onClick={onEdit}
            className="group bg-muted/20 border border-muted rounded-3xl overflow-hidden flex flex-col hover:bg-muted/40 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/5 cursor-pointer"
        >
            {/* Project Branding Header */}
            <div
                className="h-32 w-full relative overflow-hidden flex items-center justify-center border-b border-muted"
                style={{ background: `linear-gradient(135deg, ${primaryColor}22, ${secondaryColor}11)` }}
            >
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: pattern === 'grid' ? `radial-gradient(${primaryColor} 1px, transparent 0)` :
                        pattern === 'dots' ? `radial-gradient(${primaryColor} 2px, transparent 0)` :
                            `linear-gradient(45deg, ${primaryColor}44 25%, transparent 25%)`,
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-background/80 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-xl">
                        <Edit3 className="w-3.5 h-3.5" />
                        Open Lab
                    </div>
                </div>

                <Sparkles className="w-8 h-8 text-foreground/20 animate-pulse group-hover:scale-125 transition-transform" />

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <span className={cn(
                        "text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-tighter font-black",
                        session.source === 'antigravity' ? "bg-purple-500 text-white border-purple-400" :
                            session.source === 'cursor' ? "bg-blue-500 text-white border-blue-400" :
                                "bg-gray-500 text-white border-gray-400"
                    )}>
                        {session.source}
                    </span>
                    <span className="text-[9px] font-mono text-muted-fg bg-background/50 backdrop-blur px-2 py-0.5 rounded uppercase tracking-tighter">
                        Synthesized Engine v2
                    </span>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-light tracking-tight text-foreground leading-tight group-hover:underline decoration-muted-fg/30 underline-offset-4">
                        {session.title}
                    </h3>
                    <p className="text-[9px] font-mono text-muted-fg truncate opacity-60">
                        {session.repoPath.replace('C:\\Users\\z\\OneDrive\\Desktop\\', '~/')}
                    </p>
                </div>

                <p className="text-xs text-muted-fg leading-relaxed line-clamp-3">
                    {session.summary}
                </p>

                {/* Tech Stack Bubbles */}
                <div className="flex flex-wrap gap-1">
                    {session.stack?.slice(0, 4).map((s: string) => (
                        <span key={s} className="text-[8px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-fg border border-muted-fg/10">
                            {s}
                        </span>
                    ))}
                </div>
            </div>

            <div className="px-6 py-4 border-t border-muted/50 flex items-center justify-between gap-4 bg-muted/10">
                <div className="flex -space-x-2">
                    {session.media.slice(0, 3).map((m: string, i: number) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                            <ImageIcon className="w-3 h-3 text-muted-fg" />
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full font-bold text-[9px] tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-lg shadow-foreground/5 whitespace-nowrap">
                    <Rocket className="w-3 h-3" />
                    Refine & Posh
                </div>
            </div>
        </div>
    )
}
