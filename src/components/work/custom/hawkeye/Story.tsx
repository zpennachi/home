"use client";

import { motion } from 'framer-motion';
import { Eye, Activity, Cpu, Database, Network, Move, Workflow } from 'lucide-react';

export default function HawkeyeStory() {
    return (
        <div className="space-y-32 py-12">

            {/* 1. The Challenge */}
            <section className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-white/50 mb-2 font-mono text-xs uppercase tracking-widest">
                            <Eye className="w-4 h-4" />
                            <span>Computer Vision Pipeline</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
                            The Game Is Fast. <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500">Data Is Faster.</span>
                        </h2>
                        <div className="prose prose-zinc dark:prose-invert text-lg leading-relaxed space-y-4 text-zinc-600 dark:text-white/70">
                            <p>
                                In professional sports, the difference between a win and a loss is often measured in milliseconds.
                                Coaches need more than just video; they need **spatial intelligence**.
                            </p>
                            <p>
                                **Hawkeye** is a skeletal tracking visualization engine. It ingests high-frequency positional data
                                (60Hz tracking of 22 joints per player) to reconstruct the game in 3D, allowing for
                                analysis from any angle.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Technical Deep Dive */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1 md:col-span-3 pb-8 border-b border-zinc-200 dark:border-white/5 mb-8">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Systems Architecture</h3>
                    <p className="text-zinc-500 dark:text-white/50 max-w-xl">Turning chaos into structured skeletal data.</p>
                </div>

                {[
                    {
                        icon: Network,
                        title: "Skeleton Reconstruction",
                        desc: "Raw coordinate data is often noisy. We use inverse kinematics (IK) normalization to ensure erratic sensor data doesn't result in broken limbs."
                    },
                    {
                        icon: Database,
                        title: "High-Frequency Ingest",
                        desc: "Handling 2GB+ JSON files of game data requires aggressive optimization. We implemented a custom binary format parser to stream frame data efficiently."
                    },
                    {
                        icon: Move,
                        title: "3D Spatial Queries",
                        desc: "The real power is in the query engine: 'Show me every time Lebron's elbow angle was < 90° while within 3ft of the baseline.'"
                    }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        className="p-6 rounded-xl bg-zinc-100 dark:bg-[#090909] border border-zinc-200 dark:border-white/10 hover:border-orange-500/20 transition-colors group"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 text-orange-600 dark:text-orange-500 group-hover:scale-110 transition-transform">
                            <item.icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{item.title}</h4>
                        <p className="text-sm text-zinc-600 dark:text-white/60 leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* 3. Performance Metrics */}
            <section className="bg-zinc-100 dark:bg-[#090909] border border-zinc-200 dark:border-white/10 rounded-2xl p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                    <Activity className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Engineering Wins</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-zinc-500 dark:text-white/60">
                            <span>Coordinate Normalization</span>
                            <span className="text-zinc-900 dark:text-white">Z-Up vs Y-Up</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-full" />
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-white/40 pt-2">
                            Transforming sports analytics data (typically Z-up) to standard WebGL coordinate systems (typically Y-up) without losing spatial accuracy.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-zinc-500 dark:text-white/60">
                            <span>Frame Interpolation</span>
                            <span className="text-zinc-900 dark:text-white">60fps Smoothness</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[98%]" />
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-white/40 pt-2">
                            Using linear interpolation (lerp) between discrete data frames to ensure buttery smooth playback even when network conditions fluctuate.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
