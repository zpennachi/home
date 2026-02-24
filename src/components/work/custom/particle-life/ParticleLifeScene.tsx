"use client";

import { Canvas } from "@react-three/fiber";
import { Simulation } from "./Simulation";
import { Particles } from "./Particles";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

interface ParticleLifeSceneProps {
    variant?: 'rules' | 'soup' | 'emergence' | 'stable' | 'complexity';
    interactive?: boolean;
}

export function ParticleLifeScene({ variant = 'complexity', interactive = false }: ParticleLifeSceneProps) {

    // Map variant to Simulation Config & Preset
    const config = useMemo(() => {
        const base = {
            speed: 1.0,
            friction: 0.5,
            attraction: 20.0,
            radius: 10.0,
            size: 3000.0,
            decay: 0.05,
            repulsion: 2.0
        };

        // Tune configs if needed per variant
        if (variant === 'soup') return { ...base, friction: 0.05, attraction: 5.0 };
        if (variant === 'stable') return { ...base, friction: 0.8, attraction: 30.0 };

        return base;
    }, [variant]);

    const presetName = useMemo(() => {
        switch (variant) {
            case 'soup': return 'Chaos';
            case 'emergence': return 'Clusters';
            case 'stable': return 'Cells';
            case 'complexity': return 'Balanced';
            default: return 'Balanced';
        }
    }, [variant]);

    const particlesRef = useRef<THREE.ShaderMaterial>(null);
    const onPresetRef = useRef<((name: string) => void) | null>(null);

    // Apply preset when reference is ready
    useEffect(() => {
        // Short timeout to ensure init
        const t = setTimeout(() => {
            if (onPresetRef.current) {
                onPresetRef.current(presetName);
            }
        }, 100);
        return () => clearTimeout(t);
    }, [presetName]);

    return (
        <Canvas
            camera={{ position: [0, 0, 30], fov: 50, near: 0.1, far: 1000 }}
            gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
            dpr={[1, 2]}
            className="w-full h-full"
        >
            <color attach="background" args={['#050505']} />

            <Simulation
                particlesRef={particlesRef}
                config={config}
                onPresetRef={onPresetRef as any}
            />

            <Particles simulationRef={particlesRef} />

            {interactive && <OrbitControls makeDefault />}
        </Canvas>
    );
}
