"use client";

import { motion } from 'framer-motion';
import { Play, CheckCircle2, Clock, UploadCloud, Search, Bell, Menu } from 'lucide-react';

export function MockDashboard() {
    return (
        <div className="w-full h-full bg-[#0F1115] text-white flex flex-col font-sans text-[10px] md:text-xs overflow-hidden select-none">
            {/* Header */}
            <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#15171C]">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white">M</div>
                        <span className="font-bold tracking-tight text-sm">MVP IQ</span>
                    </div>
                    <div className="hidden md:flex gap-4 text-white/50">
                        <span className="text-white">Dashboard</span>
                        <span className="hover:text-white transition-colors">Team</span>
                        <span className="hover:text-white transition-colors">Analytics</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-white/30" />
                    <Bell className="w-4 h-4 text-white/30" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600" />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 border-r border-white/5 bg-[#121419] hidden md:block p-4 space-y-6">
                    <div>
                        <div className="text-white/30 uppercase tracking-wider text-[9px] mb-2 font-semibold">Menu</div>
                        <div className="space-y-1">
                            {['Overview', 'Submissions', 'Mentors', 'Payments'].map((item, i) => (
                                <div key={item} className={`px-3 py-2 rounded-md ${i === 0 ? 'bg-yellow-500/10 text-yellow-500' : 'text-white/60 hover:bg-white/5'}`}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-white/30 uppercase tracking-wider text-[9px] mb-2 font-semibold">Filters</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/60"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Pending</div>
                            <div className="flex items-center gap-2 text-white/60"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Reviewed</div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-[#0F1115] p-6 overflow-hidden relative">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Video Library</h2>
                            <p className="text-white/40">Manage your game footage and feedback.</p>
                        </div>
                        <div className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md flex items-center gap-2 font-medium transition-colors shadow-lg shadow-blue-900/20">
                            <UploadCloud className="w-3 h-3" />
                            <span>Upload Footage</span>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { title: "Varsity vs. Linfield", status: "Analyzed", color: "emerald", score: "4.8" },
                            { title: "Playoffs - Quarter 2", status: "Processing", color: "yellow", score: null },
                            { title: "Drills - 40 Yard Dash", status: "Analyzed", color: "emerald", score: "4.2" },
                            { title: "Training Camp Day 1", status: "Pending", color: "yellow", score: null },
                            { title: "Scrimmage Highlights", status: "Analyzed", color: "emerald", score: "3.9" },
                            { title: "Week 4 Pass Rush", status: "Draft", color: "gray", score: null },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#181A20] border border-white/5 rounded-lg p-3 hover:border-white/10 transition-colors group cursor-default"
                            >
                                <div className="aspect-video bg-[#0A0C10] rounded-sm mb-3 relative overflow-hidden">
                                    {/* Mock Waveform/Thumbnail */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-105 transition-transform duration-500">
                                        <div className="w-full h-1/2 flex items-center justify-center gap-[2px]">
                                            {[...Array(20)].map((_, j) => (
                                                <div
                                                    key={j}
                                                    className="w-1 bg-white/20 rounded-full"
                                                    style={{
                                                        height: `${30 + (Math.sin(j * 0.5) * 0.5 + 0.5) * 40}%`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                            <Play className="w-3 h-3 text-white fill-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-white/90 mb-1">{item.title}</div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full bg-${item.color}-500`} />
                                            <span className="text-white/40">{item.status}</span>
                                        </div>
                                    </div>
                                    {item.score && (
                                        <div className="bg-white/5 text-white/80 px-1.5 py-0.5 rounded text-[9px] font-mono">
                                            {item.score} ★
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
