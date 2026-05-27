"use client";

import { MockupContainer } from "./MockupContainer";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
import { createPortal } from "react-dom";

export type ParticleLifeVariant = 'rules' | 'soup' | 'emergence' | 'stable' | 'complexity';

export function ParticleLifeVisual({ variant = 'complexity' }: { variant?: ParticleLifeVariant }) {

    // --- State ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fullscreen, setFullscreen] = useState(false);

    // --- Optimization: Pause when out of view ---
    const containerRef = useRef<HTMLDivElement>(null);
    const isPaused = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                isPaused.current = !entry.isIntersecting;
            },
            { threshold: 0 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Config
    const getParams = (v: string) => {
        switch (v) {
            case 'rules': return { count: 100, types: 2, friction: 0.80, speed: 0.1 };
            case 'soup': return { count: 1500, types: 4, friction: 0.50, speed: 0.5 };
            case 'emergence': return { count: 1200, types: 3, friction: 0.82, speed: 1.0 };
            case 'stable': return { count: 1000, types: 4, friction: 0.80, speed: 0.8 };
            // Hero: More particles, slightly less friction for turbulence, higher speed cap
            case 'complexity': return { count: 2500, types: 6, friction: 0.96, speed: 0.8 };
            default: return { count: 1000, types: 4, friction: 0.80, speed: 0.5 };
        }
    }

    useEffect(() => {
        if (variant === 'rules') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Resize
        const resize = () => {
            if (canvas.parentElement) {
                // For full span hero, ensures it matches container
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        // --- Optimized Engine ---
        const params = getParams(variant);
        const count = params.count;
        const types = params.types;

        // Data Arrays (SoA)
        const x = new Float32Array(count);
        const y = new Float32Array(count);
        const vx = new Float32Array(count);
        const vy = new Float32Array(count);
        const type = new Uint8Array(count);

        // Species Props
        const interactRadius = 80;
        const r2 = interactRadius * interactRadius;
        const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];

        // Species Diversity
        const speciesProps = new Array(types).fill(0).map(() => ({
            mass: 0.5 + Math.random(),
            friction: 0.9 + Math.random() * 0.08, // Higher friction base for "glide" but handled carefully
            gravity: 0.0
        }));

        // Interaction Matrix - Boosted Forces
        const matrix = new Float32Array(types * types);
        for (let i = 0; i < types; i++) {
            for (let j = 0; j < types; j++) {
                let val = 0;
                if (variant === 'stable') {
                    val = (i === j) ? 0.8 : -0.2;
                    if (i === (j + 1) % types) val = 0.5;
                } else {
                    // Stronger random forces (-1.5 to 1.5)
                    val = Math.random() * 3 - 1.5;
                }
                matrix[i * types + j] = val;
            }
        }

        // Init Data
        for (let i = 0; i < count; i++) {
            x[i] = Math.random() * canvas.width;
            y[i] = Math.random() * canvas.height;
            vx[i] = 0;
            vy[i] = 0;
            type[i] = Math.floor(Math.random() * types);
        }

        // Spatial Grid
        let gridSize = interactRadius;
        let gridW = 0;
        let gridH = 0;
        let grid: number[][] = [];

        const updateGridDimensions = () => {
            gridW = Math.ceil(canvas.width / gridSize);
            gridH = Math.ceil(canvas.height / gridSize);
            grid = new Array(gridW * gridH).fill(null).map(() => []);
        };
        updateGridDimensions();

        // Higher capability for speed
        const MAX_VELOCITY = 6.0;
        let frameId: number;

        const loop = () => {
            frameId = requestAnimationFrame(loop);

            // OPTIMIZATION: Skip physics + render if off-screen
            if (isPaused.current) return;

            const width = canvas.width;
            const height = canvas.height;

            // 1. Clear Grid
            for (let i = 0; i < grid.length; i++) grid[i] = [];

            // 2. Populate Grid
            for (let i = 0; i < count; i++) {
                const gx = Math.floor(x[i] / gridSize);
                const gy = Math.floor(y[i] / gridSize);
                if (gx >= 0 && gx < gridW && gy >= 0 && gy < gridH) {
                    // @ts-ignore
                    grid[gy * gridW + gx].push(i);
                }
            }

            // 3. Draw & Update
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < count; i++) {
                let fx = 0, fy = 0;
                const ti = type[i];
                const props = speciesProps[ti];

                const gx = Math.floor(x[i] / gridSize);
                const gy = Math.floor(y[i] / gridSize);

                // Grid Neighborhood
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = gx + dx;
                    if (nx < 0 || nx >= gridW) continue;

                    for (let dy = -1; dy <= 1; dy++) {
                        const ny = gy + dy;
                        if (ny < 0 || ny >= gridH) continue;

                        const cell = grid[ny * gridW + nx];
                        // @ts-ignore
                        for (let k = 0; k < cell.length; k++) {
                            // @ts-ignore
                            const j = cell[k];
                            if (i === j) continue;

                            const dx = x[j] - x[i];
                            const dy = y[j] - y[i];

                            if (dx > 80 || dx < -80) continue;
                            if (dy > 80 || dy < -80) continue;

                            const d2 = dx * dx + dy * dy;
                            if (d2 > 0 && d2 < r2) {
                                const d = Math.sqrt(d2);
                                const tj = type[j];

                                // Force
                                let f = 0;
                                if (d < 15) {
                                    f = -3.0; // Stronger repulsion buffer
                                } else {
                                    f = matrix[ti * types + tj] / d;
                                }

                                fx += f * dx;
                                fy += f * dy;
                            }
                        }
                    }
                }

                // Physics
                // Use params.friction for global damping + species variance?
                // Actually let's just use our global friction for simplicity since we want high energy
                vx[i] = (vx[i] + fx / props.mass) * params.friction;
                vy[i] = (vy[i] + fy / props.mass) * params.friction;

                // Clamp
                const v2 = vx[i] * vx[i] + vy[i] * vy[i];
                if (v2 > MAX_VELOCITY * MAX_VELOCITY) {
                    const scale = MAX_VELOCITY / Math.sqrt(v2);
                    vx[i] *= scale;
                    vy[i] *= scale;
                }

                x[i] += vx[i] * params.speed;
                y[i] += vy[i] * params.speed;

                // Wrap
                if (x[i] < 0) x[i] = width;
                if (x[i] > width) x[i] = 0;
                if (y[i] < 0) y[i] = height;
                if (y[i] > height) y[i] = 0;

                // Draw
                ctx.fillStyle = colors[ti];
                ctx.fillRect(x[i], y[i], 2, 2);
            }
        };
        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(frameId);
        }

    }, [variant]);


    // Return JSX

    // --- 2. RULES VARIANT ---
    if (variant === 'rules') {
        return (
            <MockupContainer type="clean" className="bg-[#111] flex items-center justify-center">
                <div className="grid grid-cols-4 gap-4 p-8">
                    {[0, 1, 2, 3].map(col => (
                        <div key={col} className="space-y-4">
                            {[0, 1, 2, 3].map(row => {
                                const val = Math.sin(col * row + 1);
                                return (
                                    <motion.div
                                        key={row}
                                        className="w-12 h-12 rounded border border-white/10 flex items-center justify-center text-[8px] font-mono text-white/50"
                                        style={{ backgroundColor: val > 0 ? `rgba(34, 197, 94, ${val})` : `rgba(239, 68, 68, ${Math.abs(val)})` }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: (col + row) * 0.1 }}
                                    >
                                        {val.toFixed(1)}
                                    </motion.div>
                                )
                            })}
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-8 text-center">
                    <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Interaction Matrix</div>
                    <div className="text-[10px] text-white/30 font-mono">Defining attraction & repulsion rules</div>
                </div>
            </MockupContainer>
        )
    }

    const VisualContent = (
        <div ref={containerRef} className="w-full h-full relative group">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Fullscreen Toggle (Only for Hero/Complexity) */}
            {variant === 'complexity' && (
                <>
                    <button
                        onClick={() => setFullscreen(!fullscreen)}
                        className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-white/10 text-white/70 hover:text-white rounded-lg backdrop-blur transition-colors border border-white/10 z-50 mix-blend-difference opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    {!fullscreen && (
                        <div className="absolute top-4 right-4 pointer-events-none">
                            <div className="bg-black/50 backdrop-blur border border-white/10 px-3 py-1 rounded-full text-[10px] font-mono text-white/60 uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                2.5K Particles
                            </div>
                        </div>
                    )}
                </>
            )}

            {variant !== 'complexity' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-xs font-mono text-white/60">
                        Mode: {variant.toUpperCase()}
                    </div>
                </div>
            )}
        </div>
    );

    // Fullscreen Portal
    if (fullscreen && variant === 'complexity') {
        if (typeof document === 'undefined') return null;
        return createPortal(
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black"
            >
                {VisualContent}
            </motion.div>,
            document.body
        );
    }

    // Hero Variant: NO MOCKUP CONTAINER (Full Span)
    if (variant === 'complexity') {
        return (
            <div className="w-full h-full bg-[#050505]">
                {VisualContent}
            </div>
        );
    }

    // Story Variants: KEEP MOCKUP CONTAINER
    return (
        <MockupContainer type="clean" className="bg-[#050505]">
            {VisualContent}
        </MockupContainer>
    );
}
