"use client";

import { motion } from 'framer-motion';
import { MockDashboard } from './MockDashboard';

export default function MVPIQVisual() {
    return (
        <div className="w-full h-full relative bg-[#050510] overflow-hidden flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] bg-yellow-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[4000ms]" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full mix-blend-screen" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

            <div className="relative z-10 w-full max-w-5xl px-4 md:px-0 flex flex-col items-center perspective-[1200px]">

                {/* Main Interface (Dashboard) - Floating & Tilted */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 5 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className="relative w-full aspect-[16/10] bg-[#111] rounded-xl border border-white/10 shadow-2xl overflow-hidden group hover:scale-[1.01] transition-transform duration-500"
                >
                    <MockDashboard />

                    {/* Floating Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="absolute bottom-6 right-6 bg-[#050510]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 shadow-xl"
                    >
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-black" />
                            ))}
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <span className="text-xs font-mono font-medium text-white/90">3 New Mentors</span>
                    </motion.div>
                </motion.div>

            </div>
        </div>
    );
}
