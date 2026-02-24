"use client";

import { motion } from 'framer-motion';
import { Terminal, Database, Cpu, Layers, Box, ArrowRight, Zap, Code2, Globe } from 'lucide-react';

export default function WeekendStory() {
    return (
        <div className="space-y-32 py-12">

            {/* 1. The Origin Story */}
            <section className="relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-white/50 mb-2 font-mono text-xs uppercase tracking-widest">
                            <Box className="w-4 h-4" />
                            <span>Origin Protocol</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            The Web Wears <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Heavy Armor</span>
                        </h2>
                        <div className="prose prose-invert text-white/70 text-lg leading-relaxed space-y-4">
                            <p>
                                Modern 3D websites are bloated. They crush mobile batteries, hijack scroll behavior, and take seconds to become interactive.
                                We asked a simple question: <span className="text-white font-medium">Can we build a cinematic, immersive experience that feels weightless?</span>
                            </p>
                            <p>
                                **Weekend** is the answer. It's a production-ready framework for R3F that handles the heavy lifting—
                                state synchronization, asset preloading, and scroll damping—so the experience feels fluid.
                            </p>
                        </div>
                    </div>
                    <div className="relative aspect-square md:aspect-[4/3] bg-[#050505] rounded-xl border border-white/5 p-8 flex flex-col justify-between overflow-hidden group">
                        {/* Abstract Code Visualization */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]" />
                        <div className="relative z-10 space-y-4 font-mono text-[10px] md:text-xs text-white/40">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-4 border-b border-white/5 pb-2 ml-4"
                                >
                                    <span className="text-white/20">0{i + 1}</span>
                                    <span className="text-blue-400">await</span>
                                    <span className="text-purple-400">weekend.init</span>
                                    <span className="text-white/60">({'weight: 0.0'})</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="relative z-10 p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 mt-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">System Status</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-[10px] text-white/40 uppercase">FPS</div>
                                    <div className="text-lg font-mono text-white">60</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/40 uppercase">Memory</div>
                                    <div className="text-lg font-mono text-white">12MB</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/40 uppercase">Draw Calls</div>
                                    <div className="text-lg font-mono text-white">4</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Key Capabilities Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1 md:col-span-3 pb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Core Capabilities</h3>
                    <p className="text-white/50 max-w-xl">A suite of invisible systems working in harmony to deliver 60fps cinematic scrolling.</p>
                </div>

                {[
                    {
                        icon: Zap,
                        title: "Adaptive Performance",
                        desc: "The renderer automatically scales internal resolution (DPR) based on real-time GPU load. If the frame rate dips, the visual quality adjusts instantly to maintain fluidity."
                    },
                    {
                        icon: Layers,
                        title: "Hybrid Composition",
                        desc: "Most R3F sites suffer from HTML/Canvas sync issues. Weekend uses a custom orchestrator to lock DOM elements (Framer Motion) to 3D scene time (GSAP), ensuring pixel-perfect parallax."
                    },
                    {
                        icon: Box,
                        title: "Asset Streaming",
                        desc: "A smart preloader interacting with React Suspense. It prioritizes geometry based on camera frustum, loading 'off-screen' assets only when the user begins to scroll towards them."
                    }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        className="p-6 rounded-xl bg-[#090909] border border-white/10 hover:border-white/20 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 text-white">
                            <item.icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* 3. The Tech Stack Deep Dive */}
            <section className="border-t border-white/5 pt-24 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-white/50 font-mono text-xs uppercase tracking-widest">
                            <Code2 className="w-4 h-4" />
                            <span>Architecture</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white">The "Weekend" Stack</h3>
                        <p className="text-white/60 leading-relaxed text-lg">
                            We chose a stack that prioritizes developer experience (DX) without compromising on the final output. It's a mix of reactive state management and imperative animation.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-4 items-start p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="mt-1 font-mono text-xs text-blue-400">RENDERER</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">React Three Fiber (R3F)</h4>
                                    <p className="text-xs text-white/50 mt-1">Declarative Three.js. Allows us to compose scenes like Lego blocks.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="mt-1 font-mono text-xs text-green-400">STATE</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Zustand</h4>
                                    <p className="text-xs text-white/50 mt-1">Transient updates. We explicitly avoid React Context for 60fps loops to prevent re-renders.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="mt-1 font-mono text-xs text-purple-400">MOTION</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">GSAP + Maath</h4>
                                    <p className="text-xs text-white/50 mt-1">GSAP for timelines (scroll scrubbing), Maath for physics-based damping.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Stack Representation */}
                    <div className="relative bg-[#050505] rounded-2xl border border-white/5 p-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

                        <div className="relative z-10 grid gap-4 w-full max-w-sm">
                            <div className="p-4 bg-[#111] border border-white/10 rounded-lg text-center transform hover:scale-105 transition-transform duration-500">
                                <div className="text-xs font-mono text-white/30 mb-1">APP LAYER</div>
                                <div className="font-bold text-white">Next.js 14</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[#111] border border-white/10 rounded-lg text-center transform hover:scale-105 transition-transform duration-500 delay-75">
                                    <div className="text-xs font-mono text-white/30 mb-1">UI</div>
                                    <div className="font-bold text-white">Tailwind</div>
                                </div>
                                <div className="p-4 bg-[#111] border border-white/10 rounded-lg text-center transform hover:scale-105 transition-transform duration-500 delay-100">
                                    <div className="text-xs font-mono text-white/30 mb-1">LOGIC</div>
                                    <div className="font-bold text-white">TypeScript</div>
                                </div>
                            </div>
                            <div className="p-8 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/20 rounded-lg text-center shadow-2xl transform hover:scale-105 transition-transform duration-500 delay-150">
                                <div className="text-xs font-mono text-blue-400 mb-2 animate-pulse">CORE ENGINE</div>
                                <div className="text-2xl font-bold text-white">WEBGL / R3F</div>
                                <div className="mt-4 flex justify-center gap-2">
                                    <span className="w-1 h-1 bg-white/50 rounded-full" />
                                    <span className="w-1 h-1 bg-white/50 rounded-full" />
                                    <span className="w-1 h-1 bg-white/50 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Closing / Big Wins */}
            <section className="bg-white/5 rounded-2xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[100%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white">Ready for the Future</h3>
                        <p className="text-white/60 max-w-lg">
                            Weekend isn't just a portfolio; it's a reusable chassis for any high-performance 3D project.
                            It embodies the "Swiss Modern" ethos: stripped back, highly functional, and quietly beautiful.
                        </p>
                    </div>
                    <a
                        href="https://github.com/zpennachi/weekend"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors flex items-center gap-2"
                    >
                        View Source <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </section>

        </div>
    );
}
