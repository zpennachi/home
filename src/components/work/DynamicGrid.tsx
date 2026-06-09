'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { ProjectThumbnail } from './ProjectThumbnail'
import { ImageLightbox } from './ImageLightbox'

export interface ProjectEntry {
    id: number | string;
    title: string;
    category: string;
    medium: string;
    file: string | string[] | null;
    branding?: any;
    description?: string;
    content?: string;
    stack?: string[];
    repo?: string;
    images?: string[];
    role?: string;
    created_at?: string;
    type?: 'project' | 'entry';
}

interface DynamicGridProps {
    entries: ProjectEntry[] | null;
    projects?: any[] | null;
}

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

function normalizeFiles(file: any): string[] {
    if (!file) return [];
    if (Array.isArray(file)) return file;
    if (typeof file === 'string') {
        try {
            const parsed = JSON.parse(file);
            return Array.isArray(parsed) ? parsed : [file];
        } catch {
            return [file];
        }
    }
    return [];
}

export function DynamicGrid({ entries, projects }: DynamicGridProps) {
    const [hoveredItem, setHoveredItem] = useState<any>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [expandedId, setExpandedId] = useState<string | number | null>(null);

    // Global capture listener to ensure only one media (audio/video) plays at a time
    useEffect(() => {
        const handlePlay = (e: Event) => {
            const activeElement = e.target as HTMLMediaElement;
            if (activeElement && (activeElement.tagName === 'AUDIO' || activeElement.tagName === 'VIDEO')) {
                const mediaElements = Array.from(document.querySelectorAll('audio, video')) as HTMLMediaElement[];
                mediaElements.forEach(media => {
                    if (media !== activeElement && !media.paused) {
                        media.pause();
                    }
                });
            }
        };

        // Capture phase handles play event propagation (which does not bubble by default)
        document.addEventListener('play', handlePlay, true);
        return () => {
            document.removeEventListener('play', handlePlay, true);
        };
    }, []);

    // Combine projects and entries with full case study fields mapped
    const allItems = useMemo(() => {
        const pItems = (projects || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            medium: p.medium,
            file: p.images?.[0] || null,
            branding: p.branding || null,
            description: p.description || '',
            content: p.content || '',
            stack: p.stack || [],
            repo: p.repo || '',
            images: p.images || [],
            role: p.role || 'Lead Engineer',
            created_at: p.created_at,
            type: 'project' as const
        }));

        const eItems = (entries || []).map(e => {
            const files = normalizeFiles(e.file);
            return {
                id: e.id,
                title: e.title,
                category: e.category,
                medium: e.medium,
                file: files[0] || null,
                branding: null,
                description: e.medium || '',
                content: '',
                stack: e.medium ? e.medium.split(',').map((s: string) => s.trim()) : [],
                repo: '',
                images: files,
                role: 'Creator',
                created_at: e.created_at,
                type: 'entry' as const
            };
        });

        const combined = [...pItems, ...eItems];

        const allowedProjectIds = ['OHM-site', '0ghost-chat', 'MVPIQ', 'Volumetric-Design-System-ESR--main'];
        return combined.filter(item => {
            if (item.type === 'project') {
                return allowedProjectIds.includes(String(item.id)) ||
                       item.id === 'ohm' || item.id === '0ghost' || item.id === 'mvpiq' || item.id === 'esr';
            }
            return true;
        });
    }, [entries, projects]);

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleRowClick = (e: React.MouseEvent, entryId: string | number) => {
        e.preventDefault();
        setHoveredItem(null); // Dismiss hover preview card on click

        // Pause all media elements immediately upon collapsing or switching rows
        const mediaElements = Array.from(document.querySelectorAll('audio, video')) as HTMLMediaElement[];
        mediaElements.forEach(media => {
            if (!media.paused) {
                media.pause();
            }
        });

        setExpandedId(prev => prev === entryId ? null : entryId);
    };

    if (!allItems || allItems.length === 0) return null;

    return (
        <ImageLightbox>
            <div className="relative">
                {/* Minimalist List Grid */}
                <div className="flex flex-col border border-muted/40 bg-background/50 backdrop-blur-xl rounded-2xl selection:bg-foreground selection:text-background overflow-hidden">
                    <AnimatePresence mode="popLayout">
                        {allItems.map((entry, i) => {
                            const { client, year } = getProjectMetadata(entry.id, entry.medium);
                            const isExpanded = expandedId === entry.id;

                            // Media helper tags
                            const firstFile = entry.images?.[0] || entry.file;
                            const isAudio = firstFile && (firstFile.endsWith('.mp3') || firstFile.endsWith('.wav') || firstFile.endsWith('.mpeg') || firstFile.endsWith('.aac') || firstFile.endsWith('.ogg'));
                            const isVideo = firstFile && (firstFile.endsWith('.mp4') || firstFile.endsWith('.webm') || firstFile.endsWith('.ogg'));

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
                                    {/* Collapsible Trigger Row */}
                                    <div
                                        onClick={(e) => handleRowClick(e, entry.id)}
                                        onMouseEnter={() => !isExpanded && setHoveredItem(entry)}
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
                                                {isExpanded && <span className="text-[9px] font-mono text-accent ml-3 lowercase">/ [ close ]</span>}
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
                                    </div>

                                    {/* Expanded Case Study Drawer */}
                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                                className="overflow-hidden bg-foreground/[0.01] border-t border-muted/20"
                                            >
                                                <div className="px-6 md:px-12 py-8 space-y-8 text-left font-sans">
                                                    
                                                    {/* Media Viewport (For images/videos - audio renders inline below) */}
                                                    {!isAudio && firstFile && (
                                                        <div className="w-full aspect-video md:aspect-[21/9] bg-muted overflow-hidden border border-muted/50 relative rounded-none select-none">
                                                            {isVideo ? (
                                                                <video
                                                                    src={firstFile}
                                                                    controls
                                                                    preload="metadata"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={firstFile}
                                                                    alt={entry.title}
                                                                    className="w-full h-full object-cover cursor-zoom-in"
                                                                />
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Content details and stack metadata */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pt-4">
                                                        
                                                        {/* Left side: descriptions, markdown prose, audio tracks */}
                                                        <div className="lg:col-span-8 space-y-6">
                                                            {isAudio && firstFile && (
                                                                <div className="p-4 bg-muted/20 border border-muted/50 rounded-none mb-6 max-w-xl">
                                                                    <div className="text-[9px] font-mono text-muted-fg/40 uppercase tracking-widest mb-2 lowercase">audio archive</div>
                                                                    <audio src={firstFile} controls className="w-full bg-transparent" />
                                                                </div>
                                                            )}

                                                            {entry.description && (
                                                                <p className="text-base md:text-lg font-light leading-relaxed text-foreground/80 tracking-tight lowercase">
                                                                    {entry.description}
                                                                </p>
                                                            )}

                                                            {entry.content && (
                                                                <div className="prose dark:prose-invert max-w-none text-xs font-light text-muted-fg/80 pt-4 border-t border-muted/20">
                                                                    <ReactMarkdown
                                                                        rehypePlugins={[rehypeRaw]}
                                                                        remarkPlugins={[remarkGfm]}
                                                                    >
                                                                        {entry.content}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Right side: metadata stats and links */}
                                                        <div className="lg:col-span-4 space-y-6 border-t lg:border-t-0 lg:border-l border-muted/20 pt-6 lg:pt-0 lg:pl-8">
                                                            <div>
                                                                <h4 className="font-mono uppercase tracking-[0.15em] text-muted-fg/50 mb-1 text-[9px] font-light lowercase">role</h4>
                                                                <p className="text-xs font-light tracking-wide uppercase text-foreground">{entry.role || 'creator'}</p>
                                                            </div>

                                                            <div>
                                                                <h4 className="font-mono uppercase tracking-[0.15em] text-muted-fg/50 mb-1 text-[9px] font-light lowercase">category</h4>
                                                                <p className="text-xs font-light tracking-wide uppercase text-foreground">{entry.category} — {entry.medium}</p>
                                                            </div>

                                                            {entry.stack && entry.stack.length > 0 && (
                                                                <div>
                                                                    <h4 className="font-mono uppercase tracking-[0.15em] text-muted-fg/50 mb-2 text-[9px] font-light lowercase">tech stack</h4>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {entry.stack.map((s: string) => (
                                                                            <span key={s} className="px-2 py-0.5 border border-muted/40 text-[9px] uppercase tracking-wider font-light text-muted-fg/80">
                                                                                {s}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {entry.repo && (
                                                                <div className="pt-4">
                                                                    <a
                                                                        href={entry.repo}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-3 px-4 py-2 border border-muted hover:border-foreground rounded-none font-mono text-[9px] uppercase tracking-widest transition-all bg-transparent hover:bg-foreground hover:text-background"
                                                                    >
                                                                        <span>source code</span>
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>

                                                    {/* Expanded images grid (excluding main hero shot) */}
                                                    {entry.images && entry.images.length > 1 && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-muted/20">
                                                            {entry.images.slice(1).map((img: string, idx: number) => (
                                                                <div key={idx} className="relative aspect-video bg-muted overflow-hidden border border-muted/50 cursor-pointer rounded-none">
                                                                    <img src={img} alt={`${entry.title} shot ${idx + 1}`} className="w-full h-full object-cover cursor-zoom-in" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Mouse hover popup card */}
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
                                    files={hoveredItem.images && hoveredItem.images.length > 0 ? hoveredItem.images : hoveredItem.file}
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
        </ImageLightbox>
    )
}
