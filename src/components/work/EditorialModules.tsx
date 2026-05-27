'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface FactGridProps {
    items: { label: string; value: string; description?: string }[]
    columns?: 2 | 3 | 4
}

export function FactGrid({ items, columns = 3 }: FactGridProps) {
    const colClass = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
    }[columns]

    return (
        <div className={cn("grid grid-cols-1 gap-12 my-24 border-t border-muted pt-12", colClass)}>
            {items.map((item, i) => (
                <div key={i} className="space-y-4 group">
                    <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-fg font-bold block">{item.label}</span>
                        <div className="h-0.5 w-8 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-4xl font-display font-light uppercase tracking-tighter leading-none">{item.value}</p>
                        {item.description && (
                            <p className="text-sm text-muted-fg leading-relaxed">{item.description}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

interface FeatureBreakoutProps {
    title: string
    description: string
    accent?: string
}

export function FeatureBreakout({ title, description, accent = "Phase 01" }: FeatureBreakoutProps) {
    return (
        <div className="my-32 p-12 md:p-24 bg-muted relative overflow-hidden rounded-md">
            <div className="absolute top-0 right-0 p-8">
                <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-muted-fg opacity-30">{accent}</span>
            </div>
            <div className="max-w-2xl space-y-8 relative z-10">
                <h3 className="text-5xl md:text-7xl font-display font-light uppercase tracking-tight leading-[0.85]">
                    {title}
                </h3>
                <p className="text-xl md:text-2xl font-light text-muted-fg leading-relaxed">
                    {description}
                </p>
            </div>
            <div className="absolute -bottom-12 -right-12 text-[12vw] font-display font-black text-background opacity-5 select-none pointer-events-none uppercase">
                {title.split(' ')[0]}
            </div>
        </div>
    )
}

export function TypographicAccent({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative inline-block">
            <span className="relative z-10">{children}</span>
            <div className="absolute -bottom-1 -left-2 -right-2 h-3 bg-accent/10 -z-0 skew-x-12" />
        </div>
    )
}
