'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Mail, Bell, ArrowRight } from 'lucide-react'

export function DesignPlayground() {
    return (
        <div className="max-w-[var(--container-max,1000px)] mx-auto" style={{ color: 'var(--foreground)', background: 'var(--background)', padding: 'var(--section-padding, 5rem) 2rem' }}>
            {/* Typography Section */}
            <section className="space-y-8" style={{ fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}>
                <div className="border-b border-muted pb-4" style={{ borderColor: 'var(--muted)' }}>
                    <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-fg font-black">01 Typography Scale</h2>
                </div>
                <div className="space-y-6">
                    <h1 className="text-6xl font-light tracking-tight">Headline Large</h1>
                    <h2 className="text-4xl font-light tracking-tight">Sub-headline Medium</h2>
                    <p className="opacity-80 leading-relaxed font-medium" style={{ fontSize: 'var(--base-size, 1.125rem)' }}>
                        Swiss Modernism is a graphic design style that emerged in Switzerland in the 1950s.
                        It is characterized by cleanliness, readability, and objectivity.
                    </p>
                    <p className="text-sm text-muted-fg font-mono uppercase tracking-widest font-bold">Mono Caption Labels</p>
                </div>
            </section>

            {/* Buttons Section */}
            <section className="space-y-8 mt-20">
                <div className="border-b border-muted pb-4" style={{ borderColor: 'var(--muted)' }}>
                    <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-fg font-black">02 Interactive Objects</h2>
                </div>
                <div className="flex flex-wrap items-center" style={{ gap: 'var(--gap, 1.5rem)' }}>
                    <button
                        className="px-8 py-3.5 font-black text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-lg active:scale-95"
                        style={{ background: 'var(--foreground)', color: 'var(--background)', borderRadius: '9999px' }}
                    >
                        Primary Action
                    </button>
                    <button
                        className="px-8 py-3.5 font-black text-xs tracking-widest uppercase border transition-all"
                        style={{ background: 'var(--muted)', color: 'var(--foreground)', borderColor: 'var(--muted)', borderRadius: '9999px' }}
                    >
                        Secondary
                    </button>
                    <button className="flex items-center gap-2 font-black text-xs tracking-widest uppercase group transition-colors" style={{ color: 'var(--foreground)' }}>
                        Text link <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Cards Section */}
            <section className="space-y-8 mt-20">
                <div className="border-b border-muted pb-4" style={{ borderColor: 'var(--muted)' }}>
                    <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-fg font-black">03 Container Architecture</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--gap, 1.5rem)' }}>
                    <div
                        className="border p-8 transition-all group"
                        style={{
                            borderRadius: 'var(--radius)',
                            background: 'color-mix(in srgb, var(--muted), transparent 80%)',
                            borderColor: 'var(--muted)'
                        }}
                    >
                        <div className="w-12 h-12 bg-foreground rounded-xl mb-6 shadow-xl" style={{ background: 'var(--foreground)' }} />
                        <h3 className="text-xl font-bold mb-3">Project Registry</h3>
                        <p className="text-sm text-muted-fg leading-relaxed font-medium">
                            A centralized vault for all high-fidelity digital artifacts and case studies.
                        </p>
                    </div>

                    <div
                        className="p-8 shadow-2xl relative overflow-hidden"
                        style={{
                            borderRadius: 'var(--radius)',
                            background: 'var(--foreground)',
                            color: 'var(--background)'
                        }}
                    >
                        <h3 className="text-xl font-bold mb-3">Premium Upgrade</h3>
                        <p className="text-sm opacity-70 leading-relaxed mb-6 font-medium">
                            Unlock the full potential of your site with advanced analytics and CMS integration.
                        </p>
                        <button
                            className="text-xs font-black uppercase tracking-widest border-b-2 transition-all pb-1"
                            style={{ borderColor: 'color-mix(in srgb, var(--background), transparent 80%)' }}
                        >
                            Learn more
                        </button>
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-background/5 rounded-full blur-2xl" />
                    </div>
                </div>
            </section>
        </div>
    )
}
