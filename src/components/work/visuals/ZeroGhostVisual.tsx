"use client";

import { MockupContainer } from "./MockupContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export type ZeroGhostVariant = 'chat' | 'encrypted' | 'network' | 'keys' | 'mobile';

const MESSAGES = [
    { from: 'me', text: 'Initiating key exchange...' },
    { from: 'sys', text: 'Identity Verified: RSA-4096' },
    { from: 'them', text: 'Secure channel established.' },
    { from: 'me', text: 'Sending payload.' },
];

export function ZeroGhostVisual({ variant = 'chat' }: { variant?: ZeroGhostVariant }) {

    // --- Shared State ---
    const [visible, setVisible] = useState(0);

    useEffect(() => {
        if (variant !== 'chat' && variant !== 'mobile') return;
        const interval = setInterval(() => {
            setVisible(v => (v + 1) % (MESSAGES.length + 2));
        }, 1500);
        return () => clearInterval(interval);
    }, [variant]);

    // --- Variants ---

    if (variant === 'chat' || variant === 'mobile') {
        return (
            <MockupContainer type="mobile" title="0Ghost Secure" className="bg-black text-white font-mono">
                {/* Mobile Header */}
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur">
                    <div className="text-xs font-bold tracking-widest uppercase">0Ghost</div>
                    <div className="flex items-center gap-2">
                        <div className="text-[8px] text-white/50 uppercase">capBAC: Active</div>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                    </div>
                </div>

                {/* Chat Area */}
                <div className="p-4 space-y-4 pt-8">
                    {MESSAGES.map((msg, i) => {
                        if (i >= visible) return null;
                        const isMe = msg.from === 'me';
                        const isSys = msg.from === 'sys';

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={`flex ${isMe ? 'justify-end' : isSys ? 'justify-center' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-3 rounded-lg text-xs border ${isMe ? 'bg-white/10 border-white/5' :
                                    isSys ? 'bg-transparent border-transparent text-white/40 text-[10px] uppercase tracking-widest' :
                                        'bg-zinc-900 border-white/10'
                                    }`}>
                                    {isSys ? (
                                        <span className="flex items-center gap-2">
                                            🔒 {msg.text}
                                        </span>
                                    ) : (
                                        <DecryptedText text={msg.text} />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </MockupContainer>
        );
    }

    if (variant === 'encrypted') {
        return (
            <MockupContainer type="clean" className="bg-black text-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #22c55e 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="relative z-10 text-center space-y-8">
                    <motion.div
                        className="w-24 h-24 mx-auto border-2 border-green-500 rounded-2xl flex items-center justify-center relative"
                        animate={{ rotate: [0, 90, 180, 270, 360] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="absolute inset-2 border border-white/20 rounded-xl" />
                        <span className="text-4xl">🔒</span>
                    </motion.div>

                    <div className="font-mono text-xs space-y-2">
                        <div className="text-green-500 uppercase tracking-widest">AES-256-GCM</div>
                        <div className="text-white/50 max-w-xs mx-auto">
                            Payload encrypted at edge. <br /> Server sees only ciphertext.
                        </div>
                    </div>
                </div>
            </MockupContainer>
        );
    }

    if (variant === 'keys') {
        return (
            <MockupContainer type="code" title="crypto.subtle" className="bg-[#111]">
                <div className="p-6 font-mono text-xs leading-relaxed text-yellow-100/80">
                    <span className="text-purple-400">const</span> <span className="text-blue-400">keyPair</span> = <span className="text-purple-400">await</span> window.crypto.subtle.generateKey(<br />
                    &nbsp;&nbsp;{'{'}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;name: <span className="text-green-400">"RSA-OAEP"</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;modulusLength: <span className="text-orange-400">4096</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;publicExponent: <span className="text-orange-400">new Uint8Array([1, 0, 1])</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;hash: <span className="text-green-400">"SHA-256"</span><br />
                    &nbsp;&nbsp;{'}'},<br />
                    &nbsp;&nbsp;<span className="text-orange-400">true</span>,<br />
                    &nbsp;&nbsp;[<span className="text-green-400">"encrypt"</span>, <span className="text-green-400">"decrypt"</span>]<br />
                    );

                    <motion.div
                        className="mt-6 p-4 border border-white/10 rounded bg-white/5 flex items-center gap-4"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold text-xs">QR</div>
                        <div className="flex-1">
                            <div className="text-[10px] text-white/50 uppercase">Public Key Fingerprint</div>
                            <div className="text-[10px] text-green-400 truncate">SHA256: 8f:2a:b3:4c...</div>
                        </div>
                    </motion.div>
                </div>
            </MockupContainer>
        )
    }

    if (variant === 'network') {
        return (
            <MockupContainer type="clean" className="bg-[#0a0a0a]">
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Central Node */}
                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center z-10 bg-black">
                        <div className="text-[10px] text-white/30">RELAY</div>
                    </div>

                    {/* Orbiting Nodes */}
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15 + i * 2, repeat: Infinity, ease: "linear", delay: i * -2 }}
                        >
                            <div
                                className="w-3 h-3 bg-green-500 rounded-full absolute"
                                style={{ top: '50%', left: `${80 + i * 5}%` }} // simplistic orbit placement
                            />
                            <motion.div
                                className="absolute h-px bg-white/10"
                                style={{
                                    top: '50%', left: '50%', width: `${30 + i * 5}%`, transformOrigin: 'left center'
                                }}
                            />
                        </motion.div>
                    ))}
                </div>
                <div className="absolute bottom-6 left-0 right-0 text-center">
                    <div className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] text-white/60 font-mono">
                        0-Knowledge Routing
                    </div>
                </div>
            </MockupContainer>
        )
    }

    return null;
}

function DecryptedText({ text }: { text: string }) {
    const [display, setDisplay] = useState('');

    useEffect(() => {
        let iter = 0;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        const interval = setInterval(() => {
            setDisplay(text.split('').map((c, i) => {
                if (i < iter) return c;
                return chars[Math.floor(Math.random() * chars.length)];
            }).join(''));

            if (iter >= text.length) clearInterval(interval);
            iter += 1 / 2; // Speed
        }, 30);
        return () => clearInterval(interval);
    }, [text]);

    return <span>{display}</span>;
}
