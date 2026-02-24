"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Player } from './Player';
import { Court } from './Court';
import { Loader2, Play, Pause, Rewind, FastForward } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data structure or types would go here
const PLAYER_COLORS: Record<string, string> = {
    'LeBron James': '#FDB927', // Lakers Gold
    'Kevin Durant': '#000000', // Nets/Suns Black
    'Giannis Antetokounmpo': '#00471B', // Bucks Green
    'Stephen Curry': '#1D428A', // Warriors Blue
    'Luka Doncic': '#002B5C', // Mavs Blue
    'Nikola Jokic': '#FEC524', // Nuggets Gold
    'Ball': '#F97316' // Orange
};

function Game({ data, frameIndex }: { data: any[], frameIndex: number }) {
    const currentFrame = data[frameIndex];
    if (!currentFrame || !currentFrame.Position) return null;

    const positions = currentFrame.Position;

    return (
        <group>
            <Court />
            {Object.entries(positions).map(([entityName, entityData]) => {
                const isBall = entityName.toLowerCase().includes('ball');
                const color = isBall ? '#F97316' : (PLAYER_COLORS[entityName] || '#ffffff');

                return (
                    <Player
                        key={entityName}
                        data={entityData}
                        color={color}
                    />
                );
            })}
        </group>
    );
}

export default function HawkeyeVisual() {
    const [data, setData] = useState<any[] | null>(null);
    const [frameIndex, setFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false); // Start paused so they can read
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the 20MB json file
        fetch('/work/hawkeye/data.json')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
                setIsPlaying(true); // Auto-play once loaded
            })
            .catch(err => {
                console.error("Failed to load Hawkeye data", err);
                setLoading(false);
            });
    }, []);

    // Animation Loop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && data) {
            interval = setInterval(() => {
                setFrameIndex(prev => (prev + 1) % data.length);
            }, 1000 / 60); // 60 FPS target
        }
        return () => clearInterval(interval);
    }, [isPlaying, data]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFrameIndex(parseInt(e.target.value));
        setIsPlaying(false);
    };

    if (loading) {
        return (
            <div className="w-full h-full min-h-[60vh] bg-[#050510] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-white/40 text-sm">Loading Tracking Data (20MB)...</span>
                </div>
            </div>
        );
    }

    if (!data) return <div className="text-red-500">Failed to load data.</div>;

    const currentTime = data[frameIndex]?.Time?.gameClockTime || "00:00";

    return (
        <div className="w-full h-full min-h-[70vh] relative bg-[#050510] border-b border-white/5">
            {/* 3D Scene */}
            <Canvas
                dpr={1}
                onCreated={(state) => {
                    console.log('HawkeyeVisual: Canvas created');
                    state.gl.domElement.addEventListener('webglcontextlost', (e) => {
                        console.error('HawkeyeVisual: WebGL context lost', e);
                    }, { once: true });
                }}
            >
                <PerspectiveCamera makeDefault position={[0, -600, 400]} fov={45} up={[0, 0, 1]} />
                {/* Note: Original code used up=[0,0,1] and high Z camera. We'll adjust. */}
                <color attach="background" args={['#050505']} />

                <ambientLight intensity={0.5} />
                <pointLight position={[0, 0, 1000]} intensity={1} />

                <Suspense fallback={null}>
                    <Game data={data} frameIndex={frameIndex} />
                </Suspense>

                <OrbitControls
                    maxPolarAngle={Math.PI / 2}
                    target={[0, 0, 0]}
                    minDistance={200}
                    maxDistance={2000}
                />
            </Canvas>

            {/* HUD Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-4 shadow-2xl"
                >
                    {/* Top Row: Time & Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                            >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <div>
                                <div className="text-xs text-white/40 font-mono uppercase tracking-widest">Game Clock</div>
                                <div className="text-xl font-bold text-white font-mono tabular-nums">{currentTime}</div>
                            </div>
                        </div>

                        <div className="flex gap-4 text-right">
                            <div>
                                <div className="text-xs text-white/40 font-mono uppercase tracking-widest">Frame</div>
                                <div className="text-sm font-mono text-emerald-400 tabular-nums">{frameIndex} <span className="text-white/20">/ {data.length}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Scrubber */}
                    <input
                        type="range"
                        min="0"
                        max={data.length - 1}
                        value={frameIndex}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                    />
                </motion.div>
            </div>

            {/* Top Right Legend */}
            <div className="absolute top-6 right-6 bg-black/50 backdrop-blur p-4 rounded-lg border border-white/5 hidden md:block">
                <div className="text-xs font-bold text-white/100 mb-2 uppercase tracking-widest">Tracked Entities</div>
                <div className="space-y-1">
                    {Object.keys(PLAYER_COLORS).map(name => (
                        <div key={name} className="flex items-center gap-2 text-xs text-white/60">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_COLORS[name] }} />
                            <span>{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
