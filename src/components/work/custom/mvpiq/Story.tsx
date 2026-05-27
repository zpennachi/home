"use client";

import { motion } from 'framer-motion';
import { MockDashboard } from './MockDashboard';
import { MockAnalysis } from './MockAnalysis';
import { Check, ArrowRight, Zap, Shield, Smartphone, Users, Trophy, BarChart3, Lock } from 'lucide-react';

export default function MVPIQStory() {
    return (
        <div className="space-y-32 py-12">

            {/* 1. The Challenge (Mission) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-2">
                        <Trophy className="w-5 h-5" />
                        <span className="text-xs font-mono uppercase tracking-widest">The Mission</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
                        Democratizing Access to <span className="text-yellow-600 dark:text-yellow-500">Elite Coaching</span>
                    </h2>
                    <div className="prose prose-zinc dark:prose-invert text-lg leading-relaxed text-zinc-600 dark:text-white/70">
                        <p>
                            High school recruitment is a broken system. Talented athletes often fall through the cracks simply simply because they lack access to professional feedback and exposure.
                        </p>
                        <p>
                            **MVP IQ** was built to bridge this gap. We set out to create a platform that connects aspiring athletes directly with vetted professionals (NFL, NCAA) for frame-by-frame video analysis.
                        </p>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-zinc-900 dark:text-white">2GB+</span>
                            <span className="text-xs text-zinc-500 dark:text-white/40 uppercase tracking-widest">Video Uploads</span>
                        </div>
                        <div className="w-px h-12 bg-zinc-300 dark:bg-white/10" />
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-zinc-900 dark:text-white">&lt;48h</span>
                            <span className="text-xs text-zinc-500 dark:text-white/40 uppercase tracking-widest">Turnaround</span>
                        </div>
                        <div className="w-px h-12 bg-zinc-300 dark:bg-white/10" />
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-zinc-900 dark:text-white">100%</span>
                            <span className="text-xs text-zinc-500 dark:text-white/40 uppercase tracking-widest">Secure</span>
                        </div>
                    </div>
                </div>

                {/* Feature Grid Bento */}
                <div className="relative bg-zinc-100 dark:bg-gradient-to-br dark:from-white/5 dark:to-transparent rounded-2xl border border-zinc-200 dark:border-white/5 p-8">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Zap, label: "Instant Uploads", desc: "Resumable uploads for massive game files" },
                            { icon: Shield, label: "Verified Pros", desc: "Identity verification for all coaches" },
                            { icon: Smartphone, label: "Mobile First", desc: "Feedback accessible anywhere" },
                            { icon: Lock, label: "Secure Payments", desc: "Powered by Stripe Connect" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 p-6 rounded-xl flex flex-col gap-3 shadow-lg hover:border-yellow-500/30 transition-colors group"
                            >
                                <item.icon className="w-6 h-6 text-yellow-600 dark:text-yellow-500 group-hover:scale-110 transition-transform" />
                                <div>
                                    <div className="text-xs font-mono uppercase tracking-widest text-zinc-700 dark:text-white/90 mb-1">{item.label}</div>
                                    <div className="text-[10px] text-zinc-500 dark:text-white/50 leading-tight">{item.desc}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. User Flow: The Athlete's Journey */}
            <section className="space-y-12 border-t border-zinc-200 dark:border-white/5 pt-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="col-span-1 space-y-6">
                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                            <Users className="w-5 h-5" />
                            <span className="text-xs font-mono uppercase tracking-widest">Athlete Experience</span>
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Frictionless Management</h3>
                        <p className="text-zinc-600 dark:text-white/60 leading-relaxed">
                            We designed the dashboard to be the command center for an athlete's career. It handles the complexity of video processing in the background, allowing players to focus on what matters: the game.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {[
                                "Drag-and-drop massive video files",
                                "Real-time status tracking (Transcoding -> Ready)",
                                "Direct messaging with assigned mentors",
                                "History of all past evaluations"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-zinc-700 dark:text-white/80 text-sm">
                                    <Check className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-span-2 relative aspect-[16/10] bg-zinc-50 dark:bg-[#050510] rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-200 dark:from-[#050510] to-transparent z-10 pointer-events-none opacity-50" />
                        <div className="scale-[0.9] md:scale-100 origin-top-left transform transition-transform duration-700 group-hover:scale-[1.02]">
                            <MockDashboard />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. User Flow: The Mentor's Toolkit */}
            <section className="space-y-12 border-t border-zinc-200 dark:border-white/5 pt-24">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
                    <div className="md:col-span-3 order-2 md:order-1 relative aspect-video bg-white dark:bg-[#111] rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden shadow-2xl">
                        <MockAnalysis />
                    </div>
                    <div className="md:col-span-2 order-1 md:order-2 space-y-6">
                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                            <BarChart3 className="w-5 h-5" />
                            <span className="text-xs font-mono uppercase tracking-widest">Mentor Toolkit</span>
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Precision Analysis</h3>
                        <p className="text-zinc-600 dark:text-white/60 leading-relaxed">
                            For coaches, we built a bespoke video review interface. It mimics professional telestrator tools seen on TV, but runs entirely in the browser.
                        </p>
                        <div className="space-y-6 pt-4">
                            <div className="flex gap-4">
                                <span className="text-3xl font-bold text-yellow-500/20">01</span>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm uppercase tracking-wide">Frame-Accurate Control</h4>
                                    <p className="text-xs text-zinc-500 dark:text-white/50 mt-1">scrub through footage with millisecond precision to isolate mechanics.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-3xl font-bold text-yellow-500/20">02</span>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm uppercase tracking-wide">Vector Telestration</h4>
                                    <p className="text-xs text-zinc-500 dark:text-white/50 mt-1">Draw plays, angles, and corrections directly on the video canvas.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-3xl font-bold text-yellow-500/20">03</span>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm uppercase tracking-wide">Actionable Feedback</h4>
                                    <p className="text-xs text-zinc-500 dark:text-white/50 mt-1">Comments are timestamped and linked to specific frames.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. The "Big Wins" / Technical Architecture */}
            <section className="border-t border-zinc-200 dark:border-white/5 pt-24 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-2">
                            <Zap className="w-5 h-5" />
                            <span className="text-xs font-mono uppercase tracking-widest">Under the Hood</span>
                        </div>
                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Engineered for Speed</h3>
                        <p className="text-zinc-600 dark:text-white/60 leading-relaxed">
                            Video analysis is resource-intensive. We built a custom pipeline to handle gigabytes of data while keeping the UI buttery smooth.
                            The goal was to make a complex tool feel like a simple consumer app.
                        </p>
                    </div>
                    <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 p-6 rounded-xl hover:border-yellow-500/30 transition-colors group">
                            <div className="text-yellow-600 dark:text-yellow-500 font-mono text-xs mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-500 animate-pulse" />
                                DATA LAYER
                            </div>
                            <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-2 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">Supabase (PostgreSQL)</h4>
                            <p className="text-sm text-zinc-500 dark:text-white/50 leading-relaxed">
                                Leveraging Row Level Security (RLS) to enforce strict privacy between athletes and coaches. Real-time subscriptions update the dashboard instantly when a video is analyzed.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 p-6 rounded-xl hover:border-yellow-500/30 transition-colors group">
                            <div className="text-yellow-600 dark:text-yellow-500 font-mono text-xs mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-500 animate-pulse" />
                                VIDEO PROCESSING
                            </div>
                            <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-2 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">FFmpeg WASM + Mux</h4>
                            <p className="text-sm text-zinc-500 dark:text-white/50 leading-relaxed">
                                Hybrid transcoding pipeline. Lightweight thumbnail generation happens client-side via WASM, while heavy lifting is offloaded to Mux for adaptive bitrate streaming.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 p-6 rounded-xl hover:border-yellow-500/30 transition-colors group">
                            <div className="text-yellow-600 dark:text-yellow-500 font-mono text-xs mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-500 animate-pulse" />
                                COMMERCE
                            </div>
                            <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-2 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">Stripe Connect</h4>
                            <p className="text-sm text-zinc-500 dark:text-white/50 leading-relaxed">
                                A complete marketplace solution. Handles complex split payments (platform fee vs. coach payout), automated onboarding for coaches, and tax document generation.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 p-6 rounded-xl hover:border-yellow-500/30 transition-colors group">
                            <div className="text-yellow-600 dark:text-yellow-500 font-mono text-xs mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-500 animate-pulse" />
                                FRONTEND
                            </div>
                            <h4 className="font-bold text-lg text-zinc-900 dark:text-white mb-2 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">Next.js 14 + Framer</h4>
                            <p className="text-sm text-zinc-500 dark:text-white/50 leading-relaxed">
                                Server Actions for type-safe mutations. Framer Motion handles complex shared-element transitions, making navigation feel continuous and app-like.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
}
