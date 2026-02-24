"use client";

import { cn } from "@/lib/utils";

interface MockupContainerProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    type?: 'browser' | 'mobile' | 'terminal' | 'clean' | 'code';
    url?: string;
    title?: string;
}

export function MockupContainer({
    children,
    className,
    style,
    type = 'browser',
    url = 'localhost:3000',
    title
}: MockupContainerProps) {
    if (type === 'clean') {
        return (
            <div className={cn("w-full h-full relative overflow-hidden bg-background", className)} style={style}>
                {children}
            </div>
        );
    }

    if (type === 'terminal' || type === 'code') {
        return (
            <div className={cn("w-full h-full flex flex-col bg-[#1e1e1e] font-mono text-sm overflow-hidden rounded-lg shadow-2xl border border-white/10", className)} style={style}>
                {/* Header */}
                <div className="h-8 flex items-center px-4 gap-2 bg-[#2d2d2d] border-b border-white/5 shrink-0">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="flex-1 text-center text-white/40 text-xs truncate">
                        {title || (type === 'code' ? 'editor' : 'terminal')}
                    </div>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {children}
                </div>
            </div>
        );
    }

    if (type === 'mobile') {
        return (
            <div className={cn("h-full aspect-[9/19] mx-auto bg-black rounded-[3rem] border-[8px] border-zinc-800 overflow-hidden shadow-2xl relative", className)} style={style}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-zinc-800 rounded-b-2xl z-20" />
                <div className="w-full h-full bg-background relative overflow-hidden">
                    {children}
                </div>
            </div>
        );
    }

    // Default Browser Style
    return (
        <div className={cn("w-full h-full flex flex-col bg-background overflow-hidden relative shadow-2xl border border-muted", className)} style={style}>
            {/* Browser Header */}
            <div className="h-10 flex items-center px-4 gap-4 bg-muted/50 border-b border-muted shrink-0 z-20 relative backdrop-blur-md">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-fg/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-fg/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-fg/20" />
                </div>
                {/* Omni-bar */}
                <div className="flex-1 max-w-md mx-auto h-6 bg-background/50 rounded flex items-center px-3 text-[10px] text-muted-fg font-mono truncate">
                    {/* Lock Icon */}
                    <span className="mr-2 opacity-50">🔒</span>
                    {url}
                </div>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>
        </div>
    );
}
