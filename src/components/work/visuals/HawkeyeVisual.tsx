"use client";

import { MockupContainer } from "./MockupContainer";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export type HawkeyeVariant = 'ingest' | 'skeleton' | 'court' | 'query' | 'analytics';

export function HawkeyeVisual({ variant = 'ingest' }: { variant?: HawkeyeVariant }) {

    // --- Shared State for 'ingest' ---
    const [logs, setLogs] = useState<string[]>([]);
    const [frame, setFrame] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Mock Logs Effect
    useEffect(() => {
        if (variant !== 'ingest') return;
        const interval = setInterval(() => {
            const newLog = `[${new Date().toISOString()}] INFO: Frame processed in ${Math.floor(Math.random() * 5) + 12}ms`;
            setLogs(prev => [...prev.slice(-8), newLog]);
            setFrame(f => f + 1);
        }, 100);
        return () => clearInterval(interval);
    }, [variant]);

    // Canvas Draw Effect (Ingest/Skeleton)
    useEffect(() => {
        if (variant !== 'ingest' && variant !== 'skeleton') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        let animationFrameId: number;

        const draw = () => {
            if (!ctx) return;
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() / 1000;

            if (variant === 'ingest') {
                // ... Ingest Grid & Dots ...
                ctx.strokeStyle = '#1a1a1a';
                ctx.lineWidth = 1;
                // Simple perspective grid lines
                for (let i = 0; i < canvas.width; i += 40) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i + (canvas.width / 2 - i) * 0.5, canvas.height / 2);
                    ctx.stroke();
                }

                // Players
                const players = [
                    { x: canvas.width * 0.3, y: canvas.height * 0.6, col: '#ff3d00' },
                    { x: canvas.width * 0.7, y: canvas.height * 0.4, col: '#ff3d00' },
                    { x: canvas.width * 0.5, y: canvas.height * 0.5, col: '#00ff00' },
                ];
                players.forEach((p, i) => {
                    const pulse = Math.sin(time * 5 + i);
                    ctx.fillStyle = p.col;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4 + pulse, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = p.col;
                    ctx.strokeRect(p.x - 10, p.y - 30, 20, 40);
                });

            } else if (variant === 'skeleton') {
                // ... Large Skeleton ...
                const cx = canvas.width / 2;
                const cy = canvas.height * 0.6;
                const scale = 150;

                ctx.strokeStyle = '#00ff00';
                ctx.fillStyle = '#00ff00';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                const t = time;
                // Animated joints
                const head = { x: cx, y: cy - scale * 1.5 + Math.sin(t) * 10 };
                const neck = { x: cx, y: cy - scale * 1.2 + Math.sin(t) * 8 };
                const hip = { x: cx, y: cy };
                const kneeL = { x: cx - scale * 0.3 + Math.sin(t + 1) * 20, y: cy + scale * 0.8 };
                const kneeR = { x: cx + scale * 0.3 + Math.sin(t + 2) * 20, y: cy + scale * 0.8 };
                const footL = { x: cx - scale * 0.4, y: cy + scale * 1.6 };
                const footR = { x: cx + scale * 0.4, y: cy + scale * 1.6 };
                const elbowL = { x: cx - scale * 0.4, y: cy - scale * 0.8 + Math.cos(t) * 20 };
                const elbowR = { x: cx + scale * 0.4, y: cy - scale * 0.8 + Math.cos(t + 0.5) * 20 };
                const handL = { x: cx - scale * 0.6, y: cy - scale * 0.5 };
                const handR = { x: cx + scale * 0.6, y: cy - scale * 0.5 };

                const joints = [head, neck, hip, kneeL, kneeR, footL, footR, elbowL, elbowR, handL, handR];

                // Draw bones
                ctx.beginPath();
                ctx.moveTo(head.x, head.y); ctx.lineTo(neck.x, neck.y); // Neck
                ctx.moveTo(neck.x, neck.y); ctx.lineTo(hip.x, hip.y); // Spine
                ctx.moveTo(hip.x, hip.y); ctx.lineTo(kneeL.x, kneeL.y); ctx.lineTo(footL.x, footL.y); // Left Leg
                ctx.moveTo(hip.x, hip.y); ctx.lineTo(kneeR.x, kneeR.y); ctx.lineTo(footR.x, footR.y); // Right Leg
                ctx.moveTo(neck.x, neck.y); ctx.lineTo(elbowL.x, elbowL.y); ctx.lineTo(handL.x, handL.y); // Left Arm
                ctx.moveTo(neck.x, neck.y); ctx.lineTo(elbowR.x, elbowR.y); ctx.lineTo(handR.x, handR.y); // Right Arm
                ctx.stroke();

                // Draw joints
                joints.forEach(j => {
                    ctx.beginPath();
                    ctx.arc(j.x, j.y, 6, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            animationFrameId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        }
    }, [variant]);


    // --- Variants ---

    if (variant === 'ingest') {
        return (
            <MockupContainer type="terminal" title="hawkeye-engine-v3 (zsh)" className="border-accent/20">
                <div className="absolute inset-0 flex bg-black">
                    <canvas ref={canvasRef} className="w-full h-full opacity-60" />
                    <div className="absolute bottom-4 left-4 right-4 font-mono text-[10px] text-green-500/80 space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className="truncate">{log}</div>
                        ))}
                    </div>
                    <div className="absolute top-4 right-4 text-xs font-bold text-accent animate-pulse">
                        LIVE INGEST
                    </div>
                </div>
            </MockupContainer>
        );
    }

    if (variant === 'skeleton') {
        return (
            <MockupContainer type="clean" className="bg-[#050505] border-accent/20">
                <div className="absolute inset-0 flex items-center justify-center">
                    <canvas ref={canvasRef} className="w-full h-full" />
                </div>
                <div className="absolute bottom-8 left-0 right-0 text-center text-green-500 font-mono text-xs uppercase tracking-widest">
                    Skeleton Tracking v2.4
                </div>
            </MockupContainer>
        );
    }

    if (variant === 'court') {
        return (
            <MockupContainer type="clean" className="bg-[#1a1a1a]">
                <div className="w-full h-full relative perspective-[1000px] overflow-hidden flex items-center justify-center">
                    <div className="w-[80%] aspect-[1.8] border-4 border-white transform rotate-x-12 shadow-2xl bg-[#dfa37e] relative">
                        {/* Court markings */}
                        <div className="absolute top-0 bottom-0 left-0 w-[20%] border-r-4 border-white bg-[#d18f68]" />
                        <div className="absolute top-0 bottom-0 right-0 w-[20%] border-l-4 border-white bg-[#d18f68]" />
                        <div className="absolute top-[40%] bottom-[40%] left-0 right-0 border-t-4 border-b-4 border-white/30" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full border-4 border-white" />
                        </div>

                        {/* Heatmap spots */}
                        <motion.div
                            className="absolute top-[20%] left-[25%] w-16 h-16 bg-red-500/50 rounded-full blur-xl"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </div>
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-white text-xs font-mono border border-white/10">
                    Court Mapping: ACTIVE
                </div>
            </MockupContainer>
        )
    }

    if (variant === 'query') {
        return (
            <MockupContainer type="browser" url="hawkeye.io/query" className="bg-zinc-900">
                <div className="flex h-full flex-col p-8 items-center justify-center gap-6">
                    <div className="w-full max-w-lg">
                        <div className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2">Natural Language Search</div>
                        <div className="bg-black border border-zinc-700 rounded-xl p-4 flex items-center gap-3 shadow-2xl">
                            <span className="text-accent">Type:</span>
                            <div className="flex-1 font-mono text-sm text-white relative">
                                Show me all <span className="text-blue-400">Pick & Rolls</span> from <span className="text-yellow-400">Top of Key</span>
                                <span className="absolute right-0 top-0 bottom-0 w-2 bg-accent animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full max-w-lg space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-500 font-mono uppercase">
                            <span>Query Construction</span>
                            <span>SQL Generated</span>
                        </div>
                        <div className="bg-zinc-800/50 p-3 rounded-md font-mono text-[10px] text-zinc-400 border border-zinc-700/50">
                            SELECT * FROM plays WHERE type = 'pnr' AND location = 'top_key' LIMIT 50;
                        </div>
                    </div>
                </div>
            </MockupContainer>
        );
    }

    if (variant === 'analytics') {
        return (
            <MockupContainer type="browser" url="hawkeye.io/analytics" className="bg-white dark:bg-zinc-900">
                <div className="h-full flex flex-col p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl">Shot Efficiency</h3>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                        </div>
                    </div>
                    <div className="flex-1 flex items-end gap-2 px-4 pb-4 border-b border-l border-zinc-200 dark:border-zinc-800 relative">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 bg-zinc-900 dark:bg-white rounded-t-sm"
                                initial={{ height: 0 }}
                                whileInView={{ height: `${Math.random() * 80 + 10}%` }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                            />
                        ))}
                        {/* Trend Line */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <motion.path
                                d="M 0 150 C 50 100, 100 180, 150 120 S 250 50, 350 80 S 450 150, 550 100"
                                fill="none"
                                stroke="#f43f5e"
                                strokeWidth="3"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                            />
                        </svg>
                    </div>
                </div>
            </MockupContainer>
        );
    }

    return null;
}
