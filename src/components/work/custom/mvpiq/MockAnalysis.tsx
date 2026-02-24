"use client";

import { Play, Pause, RotateCcw, PenTool, MessageSquare, ChevronRight, Share } from 'lucide-react';

export function MockAnalysis() {
    return (
        <div className="w-full h-full bg-[#0F1115] text-white flex flex-col font-sans text-[10px] md:text-xs overflow-hidden select-none border border-white/10 rounded-xl shadow-2xl">
            {/* Header */}
            <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#15171C]">
                <div className="flex items-center gap-2 text-white/60">
                    <span>Submissions</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white">Varsity vs. Linfield</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-[10px] font-medium border border-yellow-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        FEEDBACK MODE
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Video Area */}
                <div className="flex-1 relative bg-black flex items-center justify-center group">
                    {/* Fake Video Content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                    <div className="w-full h-full opacity-60 bg-[url('/work/mvpiq/hero.png')] bg-cover bg-center" />

                    {/* Telestrator Annotations */}
                    <svg className="absolute inset-0 z-20 w-full h-full pointer-events-none">
                        {/* Example Play Diagram */}
                        <path d="M 200 300 Q 300 100 450 150" fill="none" stroke="#EAB308" strokeWidth="2" strokeDasharray="4 4" className="drop-shadow-md" />
                        <circle cx="450" cy="150" r="4" fill="#EAB308" />
                        <circle cx="200" cy="300" r="15" fill="none" stroke="#EAB308" strokeWidth="2" />
                    </svg>

                    {/* Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#15171C]/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-30 transition-opacity opacity-0 group-hover:opacity-100">
                        <RotateCcw className="w-4 h-4 text-white/70 hover:text-white cursor-pointer" />
                        <Play className="w-5 h-5 text-white/70 hover:text-white cursor-pointer fill-current" />
                        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-yellow-500" />
                        </div>
                        <span className="text-[10px] font-mono text-white/50">00:12 / 00:45</span>
                    </div>
                </div>

                {/* Sidebar Feedback */}
                <div className="w-64 border-l border-white/5 bg-[#121419] hidden md:flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-semibold text-white mb-1">Mentor Feedback</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-700" />
                            <div className="text-[10px] text-white/50">Coach Williams • Pro QB</div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {[
                            { time: "00:04", text: "Great read on the safety here. You looked him off perfectly.", type: "positive" },
                            { time: "00:12", text: "Watch your footwork on the dropback. You're drifting left.", type: "critique" },
                            { time: "00:23", text: "Excellent release point.", type: "positive" }
                        ].map((note, i) => (
                            <div key={i} className="group">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-mono text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">{note.time}</span>
                                </div>
                                <p className="text-white/70 leading-relaxed text-[11px]">{note.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/5 bg-[#15171C]">
                        <div className="flex items-center justify-between mb-3 text-[10px] text-white/50 uppercase tracking-widest font-semibold">
                            <span>Rating</span>
                            <span className="text-white">4.8 / 5.0</span>
                        </div>
                        <button className="w-full py-2 bg-white text-black font-semibold rounded-md hover:bg-white/90 transition-colors shadow-lg">
                            Download Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
