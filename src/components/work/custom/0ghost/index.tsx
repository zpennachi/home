"use client";

import { motion } from 'framer-motion';
import { Lock, Smartphone, MoreVertical, Send, ShieldAlert, WifiOff, Ghost } from 'lucide-react';
import { useState } from 'react';

export default function ZeroGhostVisual() {
    const [isPanic, setIsPanic] = useState(false);

    const handlePanic = () => {
        setIsPanic(true);
        setTimeout(() => setIsPanic(false), 2000);
    };

    return (
        <div className="w-full h-full min-h-[60vh] bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden group">

            {/* Background Ambience */}
            <div className={`absolute inset-0 bg-red-900/10 transition-opacity duration-500 ${isPanic ? 'opacity-100' : 'opacity-0'}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_60%)]" />

            {/* Mobile Device Frame */}
            <div className="relative w-full max-w-sm aspect-[9/19] bg-[#0D0D0D] rounded-3xl border border-[#2B2B2B] shadow-2xl overflow-hidden flex flex-col">

                {/* Panic Overlay (Hidden by default) */}
                <motion.div
                    initial={false}
                    animate={{ opacity: isPanic ? 1 : 0, pointerEvents: isPanic ? 'auto' : 'none' }}
                    className="absolute inset-0 z-50 bg-red-600 flex flex-col items-center justify-center text-white p-8 text-center"
                >
                    <ShieldAlert className="w-16 h-16 mb-4 animate-bounce" />
                    <h2 className="text-3xl font-bold mb-2">NUKING DATA</h2>
                    <p className="text-white/80">Overwriting keys...</p>
                    <div className="w-full h-1 bg-black/20 mt-8 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-white"
                            initial={{ width: "0%" }}
                            animate={{ width: isPanic ? "100%" : "0%" }}
                            transition={{ duration: 1.5 }}
                        />
                    </div>
                </motion.div>

                {/* Header */}
                <header className="h-14 border-b border-[#2B2B2B] flex items-center justify-between px-4 bg-[#161616]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-[10px] font-bold text-white">
                            <Ghost className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white/90">Circle #8291</div>
                            <div className="text-[10px] text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Encrypted
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handlePanic}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                        title="PANIC BUTTON"
                    >
                        <ShieldAlert className="w-5 h-5" />
                    </button>
                </header>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />

                    {/* Received Message */}
                    <div className="flex gap-3 justify-start max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-[#1C1C1C] border border-[#2B2B2B] flex-shrink-0" />
                        <div className="space-y-1">
                            <div className="bg-[#1C1C1C] border border-[#2B2B2B] p-3 rounded-2xl rounded-tl-none text-sm text-white/80">
                                LZ is hot. Switch to Signal proxy?
                            </div>
                            <div className="text-[10px] text-white/30 font-mono">10:42 AM • Burn: 1h</div>
                        </div>
                    </div>

                    {/* Sent Message */}
                    <div className="flex gap-3 justify-end max-w-[85%] ml-auto">
                        <div className="space-y-1 items-end flex flex-col">
                            <div className="bg-[#3E7BFA] text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-lg shadow-blue-500/10">
                                Copy. Rotating keys now.
                            </div>
                            <div className="text-[10px] text-white/30 font-mono flex items-center gap-1">
                                <span>Sent</span>
                                <Lock className="w-2 h-2" />
                            </div>
                        </div>
                    </div>

                    {/* System Message */}
                    <div className="flex justify-center py-2">
                        <div className="bg-[#1C1C1C] border border-[#2B2B2B] px-3 py-1 rounded-full flex items-center gap-2">
                            <WifiOff className="w-3 h-3 text-white/40" />
                            <span className="text-[10px] text-white/40 font-mono">OFFLINE MODE ACTIVE</span>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="h-16 border-t border-[#2B2B2B] bg-[#161616] p-3 flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 h-full bg-[#0D0D0D] rounded-xl border border-[#2B2B2B] px-4 flex items-center text-sm text-white/40 font-mono">
                        Type a message...
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#3E7BFA] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Send className="w-4 h-4 ml-0.5" />
                    </div>
                </div>
            </div>

            {/* Floating Label */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Interactive Prototype</span>
                <span className="text-[10px] text-red-500/70 border border-red-500/20 px-2 py-0.5 rounded">Try the Panic Button</span>
            </div>
        </div>
    );
}
