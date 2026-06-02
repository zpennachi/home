"use client";

import React from 'react';
import { motion } from "framer-motion";


export function Hero() {
    return (
        <section className="h-[calc(100dvh-9rem)] w-full relative flex flex-col justify-center overflow-hidden">


            {/* Content Layer */}
            <div className="relative z-10 h-full flex flex-col justify-center container pt-24 pb-8 md:pt-32 md:pb-12 pointer-events-none">

                {/* Top: Headline */}
                <div className="w-full">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl font-extralight tracking-tight leading-[1.1] text-foreground w-full"
                    >
                        building, learning, and having fun
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-6 w-full max-w-none text-base md:text-lg font-normal leading-relaxed text-foreground pointer-events-auto"
                        style={{ maxWidth: 'none', width: '100%' }}
                    >
                        hi! My name is Zack, i've been <strong className="font-bold">building</strong> digital things for 10+ years, <strong className="font-bold">learning</strong> a ton and <strong className="font-bold">having fun</strong> along the way. I love finding new problems to solve. From nitty gritty texture editing, to deploying full-stack architecture for enterprise web apps, I enjoy finding unique solutions to difficult problems. I love meeting new and interesting clients that allow me to understand just a little bit more about our wild digital world. If that sounds like you, <a href="mailto:z@zpennachi.com" className="underline hover:opacity-70 transition-opacity font-normal">hit me up!</a>
                    </motion.p>
                </div>

            </div>
        </section>
    );
}
