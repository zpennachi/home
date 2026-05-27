"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MockupContainer } from "./MockupContainer";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface VantageVisualProps {
    variant?: "hero" | "grid" | "anomaly";
}

// Institutional Financial Palette
const TOKENS = {
    dark: {
        bg: "#0B0E11", // Deep Gunmetal
        panel: "#151921", // Lighter panel
        grid: "rgba(255,255,255,0.05)",
        text: "#B0B8C1", // Cool Grey
        textBright: "#E2E8F0",
        green: "#00E096", // Sharp Mint
        red: "#FF3B30", // Sharp Red
        accent: "#3B82F6", // Bloomberg Blue
        border: "rgba(255,255,255,0.1)"
    },
    light: {
        bg: "#FFFFFF", // Clean White
        panel: "#F1F5F9", // Slate-100
        grid: "rgba(0,0,0,0.06)",
        text: "#64748B", // Slate-500
        textBright: "#0F172A", // Slate-900
        green: "#10B981", // Emerald-500
        red: "#EF4444", // Red-500
        accent: "#2563EB", // Blue-600
        border: "rgba(0,0,0,0.08)"
    }
};

export function VantageVisual({ variant = "hero" }: VantageVisualProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const theme = useMemo(() => {
        return (mounted && resolvedTheme === 'light') ? TOKENS.light : TOKENS.dark;
    }, [resolvedTheme, mounted]);

    // --- High-Performance Financial Engine ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // --- State ---
        // Generate initial candles
        let candles: { open: number, close: number, high: number, low: number }[] = [];
        let price = 2450;
        for (let i = 0; i < 80; i++) {
            const move = (Math.random() - 0.48) * 15;
            const open = price;
            const close = price + move;
            const high = Math.max(open, close) + Math.random() * 5;
            const low = Math.min(open, close) - Math.random() * 5;
            candles.push({ open, close, high, low });
            price = close;
        }

        const resize = () => {
            if (canvas.parentElement) {
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;
            }
        };
        resize();
        window.addEventListener("resize", resize);

        // Interaction
        const onMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        };
        const onLeave = () => setHoverPos(null);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseleave', onLeave);

        let frameId: number;
        let t = 0;

        const loop = () => {
            t += 1;
            const w = parseFloat(canvas.style.width);
            const h = parseFloat(canvas.style.height);

            // Update Data (Simulate Live Market)
            if (t % 10 === 0) {
                const last = candles[candles.length - 1];
                const move = (Math.random() - 0.45) * 8; // Volatility
                const open = last.close;
                const close = open + move;
                const high = Math.max(open, close) + Math.random() * 2;
                const low = Math.min(open, close) - Math.random() * 2;
                candles.push({ open, close, high, low });
                candles.shift();
            }

            // Clear Background
            ctx.fillStyle = theme.bg;
            ctx.fillRect(0, 0, w, h);

            // Draw Grid
            ctx.strokeStyle = theme.grid;
            ctx.lineWidth = 1;
            ctx.beginPath();
            const tickX = w / 10;
            const tickY = h / 6;
            for (let x = 0; x < w; x += tickX) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
            for (let y = 0; y < h; y += tickY) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
            ctx.stroke();

            // Calculate Scale
            const prices = candles.flatMap(c => [c.high, c.low]);
            const min = Math.min(...prices) - 5;
            const max = Math.max(...prices) + 5;
            const range = max - min;
            const candleWidth = (w / candles.length) * 0.7;
            const spacing = w / candles.length;

            if (variant === 'hero' || variant === 'grid') {
                // --- Candlestick Chart ---
                candles.forEach((c, i) => {
                    const x = i * spacing + spacing / 2;
                    const yOpen = h - ((c.open - min) / range) * h;
                    const yClose = h - ((c.close - min) / range) * h;
                    const yHigh = h - ((c.high - min) / range) * h;
                    const yLow = h - ((c.low - min) / range) * h;

                    const isGreen = c.close >= c.open;
                    ctx.fillStyle = isGreen ? theme.green : theme.red;
                    ctx.strokeStyle = isGreen ? theme.green : theme.red;

                    // Wick
                    ctx.beginPath();
                    ctx.moveTo(x, yHigh);
                    ctx.lineTo(x, yLow);
                    ctx.stroke();

                    // Body
                    const bodyH = Math.max(Math.abs(yClose - yOpen), 1);
                    ctx.fillRect(x - candleWidth / 2, Math.min(yOpen, yClose), candleWidth, bodyH);
                });

                // Price Line (MA)
                ctx.beginPath();
                ctx.strokeStyle = theme.accent;
                ctx.lineWidth = 1.5;
                candles.forEach((c, i) => {
                    const x = i * spacing + spacing / 2;
                    const y = h - ((c.close - min) / range) * h;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
            }

            if (variant === 'anomaly') {
                // --- Radar/Sonar Render ---
                const cx = w / 2;
                const cy = h / 2;
                const radius = Math.min(w, h) * 0.35;

                // Concentric Circles
                ctx.strokeStyle = theme.panel;
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2); ctx.stroke();

                // Scan Line
                const angle = (t * 0.03) % (Math.PI * 2);
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
                ctx.strokeStyle = theme.red;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Blip
                if (Math.random() > 0.92) {
                    ctx.fillStyle = theme.red;
                    const r = Math.random() * radius * 0.9;
                    const a = Math.random() * Math.PI * 2;
                    ctx.beginPath();
                    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4, 0, Math.PI * 2);
                    ctx.fill();

                    // Text Label
                    ctx.fillStyle = theme.textBright;
                    ctx.font = "10px monospace";
                    ctx.fillText("ANOMALY", cx + Math.cos(a) * r + 8, cy + Math.sin(a) * r);
                }
            }

            frameId = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("mouseleave", onLeave);
        };
    }, [variant, theme]);

    if (!mounted) return <MockupContainer type="browser" className="bg-[#0B0E11]"><div /></MockupContainer>;

    return (
        <MockupContainer type="browser" className="border transition-colors duration-500" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
            <div className="w-full h-full relative font-mono text-[10px] overflow-hidden flex flex-col transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.text }}>

                {/* Header (Terminal Style) */}
                <div className="h-9 border-b flex items-center justify-between px-4 shrink-0 transition-colors duration-500"
                    style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: theme.accent }} />
                            <span className="font-bold tracking-widest" style={{ color: theme.textBright }}>VANTAGE // TERM_1</span>
                        </div>
                        <div className="hidden md:flex gap-4 border-l pl-4 text-xs" style={{ borderColor: theme.border }}>
                            <span style={{ color: theme.green }}>NDX +1.2%</span>
                            <span style={{ color: theme.red }}>VIX +4.5%</span>
                        </div>
                    </div>
                    <div className="flex gap-3 text-[10px] opacity-60">
                        <span>LATENCY: 2ms</span>
                        <span>CONN: SECURE</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex relative overflow-hidden">

                    {/* Visual Layer */}
                    <div className="flex-1 relative flex flex-col">
                        {/* Toolbar */}
                        <div className="h-6 border-b flex items-center px-4 gap-4 text-[9px] uppercase tracking-wider opacity-60"
                            style={{ borderColor: theme.border }}>
                            <span className="opacity-100 font-bold">1H</span>
                            <span>4H</span>
                            <span>1D</span>
                            <span className="flex-1"></span>
                            <span>Indicators</span>
                            <span>Settings</span>
                        </div>
                        <div className="flex-1 relative">
                            <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

                            {/* Crosshair Overlay */}
                            {hoverPos && variant === 'hero' && (
                                <div className="pointer-events-none absolute inset-0">
                                    <div className="absolute top-0 bottom-0 border-l border-dashed"
                                        style={{ left: hoverPos.x, borderColor: theme.text }} />
                                    <div className="absolute left-0 right-0 border-t border-dashed"
                                        style={{ top: hoverPos.y, borderColor: theme.text }} />
                                    <div className="absolute px-1 py-0.5 text-[9px] border rounded"
                                        style={{
                                            left: hoverPos.x + 4,
                                            top: hoverPos.y - 20,
                                            backgroundColor: theme.panel,
                                            color: theme.textBright,
                                            borderColor: theme.border
                                        }}>
                                        ${(2450 + (1 - hoverPos.y / 500) * 100).toFixed(2)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar (Order Book - Visual Only) */}
                    {(variant === 'hero' || variant === 'grid') && (
                        <div className="w-40 border-l flex flex-col hidden md:flex transition-colors duration-500"
                            style={{ borderColor: theme.border, backgroundColor: resolvedTheme === 'light' ? '#F8FAFC' : '#0E1116' }}>
                            <div className="p-2 border-b text-[9px] uppercase font-bold flex justify-between"
                                style={{ borderColor: theme.border, color: theme.text }}>
                                <span>Price</span>
                                <span>Size</span>
                            </div>
                            <div className="flex-1 overflow-hidden p-1 space-y-[1px]">
                                {Array.from({ length: 24 }).map((_, i) => {
                                    const isSell = i < 12;
                                    const relPrice = 2450 + (12 - i) * 0.25;
                                    return (
                                        <div key={i} className="flex justify-between px-2 py-0.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group">
                                            <span className={`${isSell ? "" : ""} group-hover:brightness-110`}
                                                style={{ color: isSell ? theme.red : theme.green }}>
                                                {relPrice.toFixed(2)}
                                            </span>
                                            <span className="text-right w-12 text-[9px] opacity-40">
                                                {variant === 'grid' ? (Math.random() * 50).toFixed(0) : (Math.random() * 5).toFixed(3)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Ticker */}
                <div className="h-7 border-t flex items-center overflow-hidden whitespace-nowrap relative z-10 transition-colors duration-500"
                    style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
                    <div className="absolute left-0 top-0 bottom-0 w-8 z-10"
                        style={{ background: `linear-gradient(to right, ${theme.bg}, transparent)` }} />
                    <div className="absolute right-0 top-0 bottom-0 w-8 z-10"
                        style={{ background: `linear-gradient(to left, ${theme.bg}, transparent)` }} />

                    <motion.div
                        className="flex gap-12 px-4"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    >
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex gap-3 items-center text-xs">
                                <span className="font-bold opacity-50">BTC-PERP</span>
                                <span style={{ color: theme.green }}>94,102.50</span>
                                <span className="px-1 rounded text-[9px]"
                                    style={{ color: theme.green, backgroundColor: `${theme.green}20` }}>+2.4%</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </MockupContainer>
    );
}
