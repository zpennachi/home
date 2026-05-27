"use client";

import { MockupContainer } from "./MockupContainer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export type WeekendVariant = 'loader' | 'timeline' | 'shader' | 'scroll' | 'perf';

export function WeekendVisual({ variant = 'loader' }: { variant?: WeekendVariant }) {

    // --- Shared / Utils ---
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Variants ---

    if (variant === 'loader') {
        return (
            <MockupContainer type="clean" className="bg-[#050505] text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-white"
                            initial={{ width: "0%" }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                        />
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.5em] flex justify-between w-full opacity-50">
                        <span>Loading Assets</span>
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                        >
                            98%
                        </motion.span>
                    </div>
                </div>
            </MockupContainer>
        );
    }

    if (variant === 'timeline') {
        return (
            <MockupContainer type="code" title="timeline.js" className="bg-[#0a0a0a]">
                <div className="relative w-full h-full flex flex-col p-4 overflow-hidden">
                    {/* Timeline Tracks */}
                    <div className="flex-1 space-y-4 relative">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-zinc-900 border border-zinc-800 rounded w-full relative overflow-hidden">
                                <motion.div
                                    className="absolute top-1 bottom-1 bg-blue-500/20 border border-blue-500/50 rounded"
                                    initial={{ left: `${10 + i * 15}%`, width: '20%' }}
                                    animate={{ left: [`${10 + i * 15}%`, `${20 + i * 15}%`, `${10 + i * 15}%`] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="absolute top-0 left-0 px-2 py-0.5 text-[8px] font-mono text-blue-300">clip_{i}</div>
                                </motion.div>
                            </div>
                        ))}
                        {/* Playhead */}
                        <motion.div
                            className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                            initial={{ left: "0%" }}
                            animate={{ left: "100%" }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="absolute top-0 -translate-x-1/2 -mt-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-red-500" />
                        </motion.div>
                    </div>
                </div>
            </MockupContainer>
        );
    }

    if (variant === 'shader') {
        return (
            <MockupContainer type="clean" className="bg-black">
                <div className="absolute inset-0 overflow-hidden">
                    {/* Abstract Shader Gradient */}
                    <motion.div
                        className="absolute inset-[-50%]"
                        style={{
                            background: 'conic-gradient(from 0deg at 50% 50%, #ff0080, #7928ca, #4299e1, #ff0080)',
                            filter: 'blur(80px)',
                            opacity: 0.6
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl" />

                    {/* Code Overlay */}
                    <div className="absolute inset-0 p-8 font-mono text-xs text-blue-300/80 leading-relaxed pointer-events-none">
                        {`void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float time = u_time * 0.5;
    
    vec3 color = vec3(0.0);
    color.r = sin(uv.x * 10.0 + time);
    color.g = cos(uv.y * 8.0 + time);
    color.b = sin((uv.x + uv.y) * 5.0 - time);
    
    gl_FragColor = vec4(color, 1.0);
}`}
                    </div>
                </div>
            </MockupContainer>
        );
    }

    if (variant === 'scroll') {
        return (
            <MockupContainer type="browser" url="weekend.io" className="bg-white dark:bg-zinc-900">
                <div className="h-full overflow-hidden relative">
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            className="w-full bg-black dark:bg-white rounded-full"
                            style={{ height: '30%' }}
                            animate={{ top: ['0%', '70%', '0%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                    <div className="p-12 space-y-12 opacity-50 blur-[1px]">
                        <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
                        <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
                        <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/80 backdrop-blur text-white px-6 py-3 rounded-full font-mono text-xs uppercase tracking-widest border border-white/10 shadow-2xl">
                            Lenis Scroll: <span className="text-green-400">Active</span>
                        </div>
                    </div>
                </div>
            </MockupContainer>
        );
    }

    if (variant === 'perf') {
        return (
            <MockupContainer type="terminal" title="devtools" className="bg-zinc-900">
                <div className="p-4 h-full flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-black/50 p-3 rounded border border-white/5 text-center">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">FPS</div>
                            <div className="text-2xl font-mono text-green-400">60</div>
                        </div>
                        <div className="bg-black/50 p-3 rounded border border-white/5 text-center">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Memory</div>
                            <div className="text-2xl font-mono text-blue-400">24MB</div>
                        </div>
                        <div className="bg-black/50 p-3 rounded border border-white/5 text-center">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Draw Calls</div>
                            <div className="text-2xl font-mono text-yellow-400">12</div>
                        </div>
                    </div>
                    <div className="flex-1 bg-black/50 rounded border border-white/5 relative overflow-hidden flex items-end gap-px p-1">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 bg-green-500/20 border-t border-green-500/50"
                                initial={{ height: "40%" }}
                                animate={{ height: `${40 + Math.random() * 20}%` }}
                                transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 0.05 }}
                            />
                        ))}
                    </div>
                </div>
            </MockupContainer>
        );
    }

    return null;
}
