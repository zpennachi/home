"use client";

import React from 'react';
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="h-[calc(100dvh-9rem)] w-full relative flex flex-col justify-between overflow-hidden">

            {/* Content Layer (Frames the 3D Canvas background) */}
            <div className="relative z-10 h-full w-full container pt-12 pb-16 md:pt-16 md:pb-24 flex flex-col justify-between pointer-events-none">
                
                {/* Top Left: Frame Text */}
                <div className="w-full flex justify-start">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-md pointer-events-auto"
                    >
                        <h1 className="text-2xl md:text-4xl font-extralight tracking-tight leading-[1.2] text-foreground text-left">
                            I enjoy finding unique solutions to difficult problems.
                        </h1>
                    </motion.div>
                </div>

                {/* Bottom Left: Frame Text */}
                <div className="w-full flex justify-start mt-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-md pointer-events-auto border border-muted/40 bg-background/50 backdrop-blur-xl rounded-2xl p-6 md:p-8"
                    >
                        <p className="text-sm md:text-base font-normal leading-relaxed text-foreground text-left">
                            I love meeting new and interesting clients that allow me to understand just a little bit more about our wild digital world. If that sounds like you, <a href="mailto:z@zpennachi.com" className="underline hover:opacity-70 transition-opacity font-normal">hit me up!</a>
                        </p>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
