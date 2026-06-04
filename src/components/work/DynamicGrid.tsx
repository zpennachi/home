"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectThumbnail } from "./ProjectThumbnail";

export interface ProjectEntry {
    id: number | string;
    title: string;
    category: string;
    medium: string;
    file: string | string[] | null;
    branding?: any;
    description?: string;
    type?: 'project' | 'entry';
}

interface DynamicGridProps {
    entries: ProjectEntry[] | null;
    projects?: any[] | null;
}

// Map custom client names and years for a highly editorial feel
function getProjectMetadata(id: string | number, fallbackClient: string) {
    const clientMap: Record<string, { client: string, year: string }> = {
        'krampus': { client: '8th Wall Campaign', year: '2024' },
        'box-nn': { client: 'Holiday Experience', year: '2024' },
        'nn-snap': { client: 'Snap Inc.', year: '2024' },
        'snowmen': { client: 'Survival Game Dev', year: '2023' },
        'hawkeye': { client: 'Coaching Analytics', year: '2024' },
        'MVPIQ': { client: 'MVP IQ Platform', year: '2024' },
        'particle-life-131': { client: 'Creative Code Lab', year: '2024' },
        'streamer': { client: 'Twitch Alternative', year: '2023' },
        'Volumetric-Design-System-ESR--main': { client: 'Edge Sound Research', year: '2024' },
        '0ghost-chat': { client: '0Ghost Security', year: '2024' },
        'OHM-site': { client: 'OHM Brand System', year: '2023' }
    };

    const key = String(id);
    if (clientMap[key]) return clientMap[key];

    return {
        client: fallbackClient || 'Freelance',
        year: '2024'
    };
}

export function DynamicGrid({ entries, projects }: DynamicGridProps) {
    const [hoveredItem, setHoveredItem] = useState<any>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Combine projects and entries
    const allItems = useMemo(() => {
        const pItems = (projects || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            medium: p.medium,
            file: p.images?.[0] || null,
            branding: p.branding || null,
            description: p.description || '',
            type: 'project'
        }));

        const eItems = (entries || []).map(e => ({
            ...e,
            description: '',
            type: 'entry' as const
        }));

        const combined = [...pItems, ...eItems];

        // Filter: only show allowed projects and all 365 daily entries (type === 'entry')
        const allowedProjectIds = ['OHM-site', '0ghost-chat', 'MVPIQ', 'Volumetric-Design-System-ESR--main'];
        return combined.filter(item => {
            if (item.type === 'project') {
                return allowedProjectIds.includes(String(item.id)) ||
                       item.id === 'ohm' || item.id === '0ghost' || item.id === 'mvpiq' || item.id === 'esr';
            }
            // Allow all 365 daily visual/music entries
            return true;
        });
    }, [entries, projects]);

    // Mouse movement tracker to move the hover popup dynamically
    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (!allItems || allItems.length === 0) return null;

    return (
        <div className="relative">
            {/* Ultra-Minimal List Wrapper */}
            <div className="flex flex-col border border-muted/40 bg-background/50 backdrop-blur-xl rounded-2xl selection:bg-foreground selection:text-background overflow-hidden shadow-2xl shadow-black/5">
                <AnimatePresence mode="popLayout">
                    {allItems.map((entry, i) => {
                        const href = `/new/work/${entry.id}`;
                        const { client, year } = getProjectMetadata(entry.id, entry.medium);

                        return (
                            <motion.div
                                layout
                                key={entry.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                                className="border-b border-muted/30 last:border-b-0"
                            >
                                <Link
                                    href={href}
                                    onMouseEnter={() => setHoveredItem(entry)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    onMouseMove={handleMouseMove}
                                    className="grid grid-cols-12 py-5 items-center hover:bg-foreground/5 transition-all duration-300 px-6 group cursor-pointer"
                                >
                                    {/* Number & Title */}
                                    <div className="col-span-12 md:col-span-6 flex items-center gap-6">
                                        <span className="text-[9px] font-mono text-muted-fg/40 group-hover:text-accent transition-colors">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <h3 className="text-base font-light tracking-tight text-foreground group-hover:translate-x-1.5 transition-transform duration-300">
                                            {entry.title}
                                        </h3>
                                    </div>

                                    {/* Client Name */}
                                    <div className="col-span-8 md:col-span-4 mt-1 md:mt-0">
                                        <span className="text-xs font-light text-muted-fg/70 tracking-tight">
                                            {client}
                                        </span>
                                    </div>

                                    {/* Date/Year */}
                                    <div className="col-span-4 md:col-span-2 text-right mt-1 md:mt-0">
                                        <span className="text-xs font-mono text-muted-fg/40 tracking-wider">
                                            {year}
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Mouse-following Floating Card Preview */}
            <AnimatePresence>
                {hoveredItem && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: 'fixed',
                            left: mousePos.x + 20,
                            top: mousePos.y + 20,
                        }}
                        className="bg-background/95 backdrop-blur-md border border-muted p-4 rounded-xl shadow-2xl w-64 z-50 space-y-3 pointer-events-none"
                    >
                        <div className="w-full aspect-[16/10] bg-muted rounded-lg overflow-hidden relative border border-muted/20">
                            <ProjectThumbnail
                                id={String(hoveredItem.id)}
                                files={hoveredItem.file}
                                title={hoveredItem.title}
                                branding={hoveredItem.type === 'project' ? hoveredItem.branding : undefined}
                            />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-mono uppercase tracking-wider text-foreground">{hoveredItem.title}</h4>
                            <p className="text-[10px] text-muted-fg/90 leading-relaxed font-light line-clamp-3">
                                {hoveredItem.description || "Interactive digital experience developed at the intersection of design and engineering."}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
