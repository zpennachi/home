"use client";

import Image from 'next/image'
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AudioThumbnail } from './AudioThumbnail';

function normalizeFiles(file: string | string[] | null): string[] {
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

const EXTENSIONS = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    video: ['mp4', 'webm', 'ogg'],
    audio: ['mp3', 'wav', 'mpeg', 'x-m4a', 'aac'],
}

// Swiss-inspired palette for generated branding
const BRAND_PALETTE = [
    '#E63946', // Red
    '#F1FAEE', // Off-white (might be too light for bg) -> swapped for softer standard colors
    '#A8DADC', // Light Blue
    '#457B9D', // Steel Blue
    '#1D3557', // Navy
    '#2A9D8F', // Teal
    '#E9C46A', // Saffron
    '#F4A261', // Sandy Brown
    '#264653', // Charcoal
    '#D62828', // Fire Engine Red
    '#F77F00', // Orange
    '#FCBF49', // Marigold
    '#EAE2B7', // Lemon Meringue
    '#606c38', // Olive
    '#283618', // Dark Green
    '#dda15e', // Terra Cotta
    '#bc6c25', // Tiger's Eye
];

const PATTERNS = ['grid', 'dots', 'gradient'];

function generateBranding(title: string) {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Ensure positive
    hash = Math.abs(hash);

    const color = BRAND_PALETTE[hash % BRAND_PALETTE.length];
    const pattern = PATTERNS[(hash >> 2) % PATTERNS.length];

    return {
        primaryColor: color,
        pattern: pattern
    };
}

import { VisualManager, hasVisualComponent } from './visuals/VisualManager';

// ...

export function ProjectThumbnail({ id, files, title, branding }: { id?: string, files: string | string[] | null, title: string, branding?: any }) {
    const normalized = normalizeFiles(files);
    const [index, setIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Only cycle if we have multiple items
    const hasMultiple = normalized.length > 1;

    // Memoize generated branding to keep it stable
    const effectiveBranding = useMemo(() => {
        if (branding) return branding;
        return generateBranding(title);
    }, [branding, title]);

    useEffect(() => {
        if (isHovering && hasMultiple) {
            timerRef.current = setInterval(() => {
                setIndex((prev) => (prev + 1) % normalized.length);
            }, 800); // Cycle every 800ms
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setIndex(0); // Reset on mouse leave
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isHovering, hasMultiple, normalized.length]);

    // Priority 1: Programmatic Visual (if available for this ID)
    if (id && hasVisualComponent(id)) {
        return (
            <div className="w-full h-full relative bg-muted group-hover:bg-muted/80 transition-colors">
                <VisualManager projectId={id} variant="thumbnail" />
            </div>
        )
    }

    const currentFile = normalized[index];

    // Fallback if no file (and no visual, though visual checked above)
    if (!currentFile) {
        return (
            <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{ background: effectiveBranding.primaryColor || 'var(--muted)' }}
            >
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: effectiveBranding.pattern === 'grid' ? 'radial-gradient(var(--foreground) 1px, transparent 1px)' :
                            effectiveBranding.pattern === 'dots' ? 'radial-gradient(var(--foreground) 2px, transparent 2px)' :
                                'linear-gradient(45deg, var(--foreground) 12.5%, transparent 12.5%, transparent 50%, var(--foreground) 50%, var(--foreground) 62.5%, transparent 62.5%, transparent 100%)',
                        backgroundSize: effectiveBranding.pattern === 'grid' ? '20px 20px' : '30px 30px'
                    }}
                />
                <div className="relative z-10 flex flex-col items-center gap-4 text-center p-4">
                    {/* Dynamic font size based on title length could be nice, but keeping simple for now */}
                    <span className="text-[12vw] md:text-[5vw] font-display font-black text-foreground/10 uppercase select-none leading-none">
                        {title.split(' ')[0].substring(0, 2)}
                    </span>
                    <div className="h-0.5 w-12 bg-foreground/20" />
                    <span className="text-xs font-mono uppercase tracking-widest text-foreground/60 font-medium">Coming Soon</span>
                </div>
            </div>
        );
    }

    const ext = currentFile.split('.').pop()?.toLowerCase() || '';

    // Wrapper to handle hover events
    return (
        <div
            className="w-full h-full relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {renderMedia(currentFile, ext, title, index)}

            {/* Pagination Dots */}
            {hasMultiple && isHovering && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {normalized.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                                i === index ? "bg-foreground" : "bg-muted-fg/50"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function renderMedia(file: string, ext: string, title: string, key: number) {
    if (EXTENSIONS.audio.includes(ext)) {
        return <AudioThumbnail key={file} file={file} title={title} />;
    }

    if (EXTENSIONS.video.includes(ext)) {
        return (
            <video
                key={file}
                src={file}
                className="object-cover w-full h-full animate-in fade-in duration-300"
                muted
                loop
                playsInline
                autoPlay
            />
        );
    }

    return (
        <Image
            key={file}
            src={file}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-[0.2,0,0,1]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
    );
}
