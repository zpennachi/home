"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
const PhysicsScene = dynamic(() => import("./PhysicsScene").then(mod => mod.PhysicsScene), { ssr: false });

export function Hero() {
    const [score, setScore] = useState(0);

    return (
        <section className="h-screen w-full relative flex flex-col justify-between pt-24 pb-8 px-4 md:pt-32 md:pb-12 md:px-8 overflow-hidden pointer-events-none">

            {/* 3D Scene Layer - Absolute & Interactive */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <PhysicsScene onScore={() => setScore((s: number) => s + 1)} />
            </div>

            {/* HUD: Score Display */}
            <div className="absolute top-32 right-8 z-20 pointer-events-none">
                <motion.div
                    key={score}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-end"
                >
                    <span className="text-[10px] font-mono tracking-[0.2em] text-muted-fg uppercase mb-1">Score</span>
                    <span className="text-4xl font-bold font-mono tracking-tighter text-foreground tabular-nums">
                        {String(score).padStart(3, '0')}
                    </span>
                </motion.div>
            </div>

            {/* Content Layer */}
            <div className="relative z-10 h-full flex flex-col justify-between">

                {/* Top: Headline */}
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[14vw] md:text-[12vw] leading-[0.85] font-bold tracking-tighter text-foreground mix-blend-difference"
                    >
                        DESIGN
                        <br />
                        ENGINEER
                    </motion.h1>
                </div>

                {/* Bottom: Meta Data */}
                <div className="flex justify-between items-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-sm font-medium tracking-wide uppercase text-muted-fg"
                    >
                        [ ZPennachi Studio ]
                        <br />
                        Est. 2023
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-right pointer-events-auto"
                    >
                        <a href="#manifesto" className="inline-block text-sm font-medium text-foreground hover:text-muted-fg transition-colors">
                            ( Read Technical Overview ) &darr;
                        </a>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
