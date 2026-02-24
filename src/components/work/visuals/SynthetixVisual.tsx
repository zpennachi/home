"use client";

import { MockupContainer } from "./MockupContainer";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SynthetixVisualProps {
    variant?: "pipeline" | "terminal" | "cluster";
}

// Nodes config
const nodes = [
    { id: 1, x: 20, y: 50, label: "git-push", status: "success" },
    { id: 2, x: 40, y: 30, label: "build-api", status: "success" },
    { id: 3, x: 40, y: 70, label: "build-web", status: "success" },
    { id: 4, x: 60, y: 50, label: "test-e2e", status: "running" },
    { id: 5, x: 80, y: 50, label: "deploy-k8s", status: "pending" },
];

const links = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
];

export function SynthetixVisual({ variant = "pipeline" }: SynthetixVisualProps) {
    // --- Terminal Animation ---
    const [lines, setLines] = useState<string[]>([
        "> Initializing build agent...",
        "> Pulling image node:18-alpine...",
        "> Success. Cache hit (240ms)",
        "> Running npm install..."
    ]);

    useEffect(() => {
        if (variant !== 'terminal') return;

        const logs = [
            "> [deps] Installing @types/react...",
            "> [deps] Installing framer-motion...",
            "> [audit] 0 vulnerabilities found",
            "> [build] Compiling src/app/page.tsx...",
            "> [build] Bundled 45 modules",
            "> [test] Running jest --watch",
            "> [test] PASS components/Button.test.tsx",
            "> [test] PASS utils/format.test.tsx",
            "> [deploy] Pushing to registry.k8s.io...",
            "> [deploy] Verifying sha256 checksum...",
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (Math.random() > 0.3) {
                setLines(prev => [...prev.slice(-12), logs[i % logs.length]]);
                i++;
            }
        }, 300);
        return () => clearInterval(interval);
    }, [variant]);


    // --- Render ---
    return (
        <MockupContainer type="terminal" className="bg-[#0f1115]">
            <div className="w-full h-full p-8 font-mono relative overflow-hidden flex flex-col">

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <div className="flex gap-4 text-xs text-white/40">
                        <span className="text-white">my-org / synthetix-core</span>
                        <span>commit: 5a2b1c</span>
                        <span className="text-blue-400">@master</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-green-500">Building</span>
                    </div>
                </div>

                {/* VISUAL: PIPELINE */}
                {variant === 'pipeline' && (
                    <div className="relative flex-1">
                        {/* Links (SVG Layer) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {links.map((link, i) => {
                                const n1 = nodes.find(n => n.id === link.from);
                                const n2 = nodes.find(n => n.id === link.to);
                                if (!n1 || !n2) return null;
                                return (
                                    <line
                                        key={i}
                                        x1={`${n1.x}%`} y1={`${n1.y}%`}
                                        x2={`${n2.x}%`} y2={`${n2.y}%`}
                                        stroke="#333" strokeWidth="2"
                                    />
                                );
                            })}
                        </svg>

                        {/* Nodes */}
                        {nodes.map(node => (
                            <motion.div
                                key={node.id}
                                className="absolute w-24 h-10 -ml-12 -mt-5 bg-[#181a1f] border border-white/10 rounded flex items-center justify-center text-[10px] text-white/80 shadow-lg"
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: node.id * 0.1 }}
                            >
                                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${node.status === 'success' ? 'bg-green-500' :
                                    node.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'
                                    }`} />
                                {node.label}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* VISUAL: TERMINAL */}
                {variant === 'terminal' && (
                    <div className="flex-1 bg-black/30 rounded-lg p-4 font-mono text-[10px] leading-relaxed text-white/70 overflow-hidden flex flex-col-reverse">
                        {lines.map((line, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                {line}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* VISUAL: CLUSTER */}
                {variant === 'cluster' && (
                    <div className="flex-1 grid grid-cols-4 gap-4 content-center">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="aspect-square bg-[#181a1f] border border-white/5 rounded-lg p-2 flex flex-col justify-between"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[8px] text-white/20">pod-{i}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-500"
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${30 + Math.random() * 60}%` }}
                                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                        />
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-purple-500"
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${20 + Math.random() * 50}%` }}
                                            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}


            </div>
        </MockupContainer>
    );
}
