"use client";

import React from 'react';
import { motion } from "framer-motion";


export function Hero() {
    return (
        <section className="h-[calc(100dvh-9rem)] w-full relative flex flex-col justify-between overflow-hidden">


            {/* Content Layer */}
            <div className="relative z-10 h-full flex flex-col justify-between container pt-24 pb-8 md:pt-32 md:pb-12 pointer-events-none">

                {/* Top: Headline */}
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl md:text-5xl font-light tracking-tight text-foreground"
                    >
                        Creative Technologist
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-4 max-w-md text-sm md:text-base font-light leading-relaxed text-muted-fg"
                    >
                        Hi, I build interactive digital experiences at the intersection of design and engineering.
                    </motion.p>
                </div>

                {/* Bottom: Meta Data */}
                <div className="flex justify-between items-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-xs font-light tracking-wider uppercase text-muted-fg/80"
                    >
                        [ ZPennachi Studio ]
                        <br />
                        Est. 2023
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-right"
                    >
                        <a href="#manifesto" className="inline-block text-xs font-light text-foreground hover:opacity-70 transition-opacity pointer-events-auto">
                            ( View Approach ) &darr;
                        </a>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
