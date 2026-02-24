"use client";

import { MockupContainer } from "./MockupContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { useTheme } from "next-themes";

interface NexusVisualProps {
    variant?: "graph" | "editor" | "search";
}

// Light & Dark Tokens - "Academic Digital"
const TOKENS = {
    light: {
        bg: "#F7F5F3", // Warm paper
        ink: "#1A1A1A", // Near black
        accent: "#D94032", // International Orange / Academic Red
        sub: "#666666", // Deep Gray
        line: "rgba(26, 26, 26, 0.12)", // Sharper lines
        grid: "rgba(0,0,0,0.06)",
        highlight: "#EBE9E6" // Subtle highlight
    },
    dark: {
        bg: "#0A0A0A", // Obsidian - Deep Black
        ink: "#EDEDED", // Off-white/Silver
        accent: "#FF4D40", // Vibrant Red-Orange
        sub: "#888888", // Neutral Gray
        line: "rgba(255, 255, 255, 0.15)", // Crisp white lines
        grid: "rgba(255,255,255,0.08)",
        highlight: "#1A1A1A" // Dark Gray highlight
    }
};

export function NexusVisual({ variant = "graph" }: NexusVisualProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const theme = useMemo(() => {
        return (mounted && resolvedTheme === 'dark') ? TOKENS.dark : TOKENS.light;
    }, [resolvedTheme, mounted]);

    // --- Enhanced Graph Engine ---
    useEffect(() => {
        if (variant !== 'graph') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Mock Nodes with Clusters
        const clusters = [
            { id: 0, label: "Core", x: 0, y: 0, color: theme.ink },
            { id: 1, label: "Knowledge", x: 0, y: 0, color: theme.accent },
            { id: 2, label: "Context", x: 0, y: 0, color: theme.sub },
        ];

        const nodeCount = 70;
        const nodes = Array.from({ length: nodeCount }).map((_, i) => ({
            id: i,
            cluster: i % 3,
            x: Math.random() * 800,
            y: Math.random() * 600,
            vx: 0,
            vy: 0,
            r: i % 12 === 0 ? 6 : (Math.random() * 1.5 + 2),
            label: i % 12 === 0 ? ["Ontology", "Vectors", "RAG", "Index", "Cache", "Sync"][i % 6] : null
        }));

        const links: { s: number, t: number, strength: number }[] = [];
        nodes.forEach((n, i) => {
            // Cluster cohesion
            const sameCluster = nodes.filter(o => o.cluster === n.cluster && o.id !== n.id);
            if (sameCluster.length > 0 && Math.random() > 0.4) {
                const target = sameCluster[Math.floor(Math.random() * sameCluster.length)];
                links.push({ s: i, t: target.id, strength: 0.8 });
            }
            // Cross-pollination
            if (Math.random() > 0.95) {
                const other = nodes[Math.floor(Math.random() * nodes.length)];
                links.push({ s: i, t: other.id, strength: 0.2 });
            }
        });

        const resize = () => {
            if (canvas.parentElement) {
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.parentElement.getBoundingClientRect();

                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                // Re-center clusters
                const w = rect.width;
                const h = rect.height;
                clusters[0].x = w * 0.5; clusters[0].y = h * 0.4;
                clusters[1].x = w * 0.25; clusters[1].y = h * 0.6;
                clusters[2].x = w * 0.75; clusters[2].y = h * 0.6;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        // Interaction
        let mouseX = -1000;
        let mouseY = -1000;
        const onMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };
        canvas.addEventListener('mousemove', onMove);

        let frameId: number;
        let time = 0;

        const loop = () => {
            time += 0.005;
            const rect = canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;

            nodes.forEach(n => {
                // 1. Cluster Gravity (Pull towards cluster center)
                const c = clusters[n.cluster];
                n.vx += (c.x - n.x) * 0.0006;
                n.vy += (c.y - n.y) * 0.0006;

                // 2. Center Gravity (Keep in view)
                n.vx += (w / 2 - n.x) * 0.0001;
                n.vy += (h / 2 - n.y) * 0.0001;

                // 3. Mouse Interaction (Repel)
                const dx = n.x - mouseX;
                const dy = n.y - mouseY;
                const dist = Math.hypot(dx, dy);
                if (dist < 120) {
                    const force = (120 - dist) * 0.003;
                    n.vx += dx * force;
                    n.vy += dy * force;
                }

                // 4. Verlet Integration
                n.x += n.vx;
                n.y += n.vy;
                n.vx *= 0.93; // Drag
                n.vy *= 0.93;

                // 5. Thermal Noise (Alive feel)
                n.vx += (Math.random() - 0.5) * 0.04;
                n.vy += (Math.random() - 0.5) * 0.04;
            });

            // Draw
            ctx.clearRect(0, 0, w, h);
            // Background is handled by container, but we can add subtle grid if needed

            // Links
            ctx.lineWidth = 1;
            links.forEach((l, i) => {
                const s = nodes[l.s];
                const t = nodes[l.t];

                const dist = Math.hypot(s.x - t.x, s.y - t.y);
                const opacity = Math.max(0, (1 - dist / 200) * 0.5); // Fade distant links

                if (opacity > 0) {
                    ctx.strokeStyle = theme.line.replace(/[\d.]+\)$/g, `${opacity})`);
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(t.x, t.y);
                    ctx.stroke();
                }
            });

            // Nodes
            nodes.forEach(n => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);

                const isClusterRoot = n.id === 0; // Special styling for root?

                if (n.r > 5) {
                    // "Hub" Node
                    ctx.fillStyle = theme.bg;
                    ctx.fill();
                    ctx.strokeStyle = theme.ink;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    // Inner dot
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = theme.accent;
                    ctx.fill();
                } else {
                    // "Leaf" Node
                    ctx.fillStyle = n.cluster === 1 ? theme.accent : theme.sub;
                    ctx.fill();
                }

                // Labels
                if (n.label) {
                    ctx.font = "500 10px 'Geist Mono', 'Fira Code', monospace"; // Technical font
                    ctx.fillStyle = theme.ink;
                    ctx.fillText(n.label.toUpperCase(), n.x + 10, n.y + 3);
                }
            });

            frameId = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', onMove);
        };
    }, [variant, theme]);

    // --- Typing Effect for Editor ---
    const [typedText, setTypedText] = useState("");
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        if (variant !== 'editor') return;
        const fullText = "The integrity of the network depends on the Consensus Protocol established in Q2. We observed a 15% reduction in latency after the migration.";
        let i = 0;

        // Initial delay
        const startTimeout = setTimeout(() => {
            const interval = setInterval(() => {
                setTypedText(fullText.slice(0, i));
                i++;
                if (i > fullText.length) clearInterval(interval);
            }, 35); // Slightly faster typing
            return () => clearInterval(interval);
        }, 800);

        const cursorInterval = setInterval(() => setCursorVisible(v => !v), 500);

        return () => {
            clearTimeout(startTimeout);
            clearInterval(cursorInterval);
        };
    }, [variant]);

    // --- Search Animation ---
    const [query, setQuery] = useState("");
    useEffect(() => {
        if (variant !== 'search') return;
        const target = "partition tolerance";
        let i = 0;
        setTimeout(() => {
            const interval = setInterval(() => {
                setQuery(target.slice(0, i));
                i++;
                if (i > target.length) clearInterval(interval);
            }, 50);
        }, 500);
    }, [variant]);

    if (!mounted) return <MockupContainer type="browser" className="bg-[#F7F5F3]"><div /></MockupContainer>;

    return (
        <MockupContainer type="browser" className="border-black/5 dark:border-white/5 transition-all duration-700">
            <div className="w-full h-full relative font-serif overflow-hidden flex transition-colors duration-700"
                style={{ backgroundColor: theme.bg, color: theme.ink }}>

                {/* Visual: Graph */}
                {variant === 'graph' && (
                    <div className="w-full h-full relative group cursor-crosshair">
                        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
                        <div className="absolute top-6 left-6 flex flex-col gap-2 font-mono text-[9px] uppercase tracking-widest opacity-60 pointer-events-none" style={{ color: theme.ink }}>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
                                Live Graph // MainNet
                            </div>
                            <div>Nodes: 2,401</div>
                            <div>Latency: 12ms</div>
                        </div>
                    </div>
                )}

                {/* Visual: Editor */}
                {variant === 'editor' && (
                    <>
                        <div className="w-48 border-r p-6 hidden md:flex flex-col gap-8 transition-colors duration-500"
                            style={{
                                borderColor: theme.line,
                                backgroundColor: resolvedTheme === 'dark' ? '#0A0A0A' : '#FAFAFA'
                            }}>
                            <div className="font-bold tracking-tight text-sm">Nexus.wiki</div>
                            <div className="space-y-4 text-[10px] font-mono uppercase tracking-widest opacity-60">
                                <div className="font-bold opacity-100" style={{ color: theme.accent }}>Recent</div>
                                <div className="hover:text-current cursor-pointer transition-colors">Architecture v2</div>
                                <div className="hover:text-current cursor-pointer transition-colors">Q3 Roadmap</div>
                                <div className="hover:text-current cursor-pointer transition-colors">API Specs</div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 md:p-12 max-w-2xl mx-auto flex flex-col">
                            <div className="flex items-center gap-2 mb-8 opacity-40 text-[10px] font-mono uppercase tracking-widest">
                                <span>Draft</span>
                                <span>/</span>
                                <span>Engineering</span>
                                <span>/</span>
                                <span>Protocol</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-normal tracking-tight mb-8 font-serif">System Architecture</h1>
                            <div className="space-y-6 text-lg leading-relaxed font-serif opacity-90">
                                <p className="relative">
                                    {typedText}
                                    <span className="w-[2px] h-5 inline-block align-middle ml-0.5"
                                        style={{
                                            backgroundColor: theme.accent,
                                            opacity: cursorVisible ? 1 : 0
                                        }} />
                                </p>

                                {/* Simulated Block Quote */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 3, duration: 1 }}
                                    className="pl-4 border-l-2 py-1 text-base italic opacity-70"
                                    style={{ borderColor: theme.accent }}
                                >
                                    "Consistency models are the backbone of distributed trust."
                                </motion.div>
                            </div>
                        </div>
                    </>
                )}

                {/* Visual: Search */}
                {variant === 'search' && (
                    <div className="w-full h-full flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-opacity-50" style={{ backgroundImage: `radial-gradient(${theme.line} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="w-full max-w-lg shadow-2xl rounded-xl border overflow-hidden flex flex-col relative z-10"
                            style={{ backgroundColor: theme.bg, borderColor: theme.line }}
                        >
                            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: theme.line }}>
                                <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    value={query}
                                    readOnly
                                    className="w-full bg-transparent outline-none text-base font-serif"
                                    style={{ color: theme.ink }}
                                />
                                <div className="text-[10px] font-mono px-2 py-0.5 rounded border opacity-40" style={{ borderColor: theme.ink }}>CMD+K</div>
                            </div>

                            <div className="min-h-[250px] p-2">
                                {[
                                    { title: "CAP Theorem Implementation", path: "Engineering / Distributed Systems" },
                                    { title: "Partition Strategies", path: "Infrastructure" },
                                    { title: "Database Sharding", path: "Engineering / Data" },
                                ].filter(i => i.title.toLowerCase().includes(query.split(' ')[0] || "")).map((res, i) => (
                                    <motion.div
                                        layout
                                        key={res.title}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors mb-1`}
                                        style={{ backgroundColor: i === 0 ? theme.highlight : 'transparent' }}
                                    >
                                        <div>
                                            <div className="text-sm font-medium" style={{ color: theme.ink }}>{res.title}</div>
                                            <div className="text-[10px] opacity-50" style={{ color: theme.sub }}>{res.path}</div>
                                        </div>
                                        {i === 0 && <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">Jump</span>}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </MockupContainer>
    );
}
