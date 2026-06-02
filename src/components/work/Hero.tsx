"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface ShapeProps {
    type: 'sphere' | 'cube' | 'torus' | 'dodecahedron';
    position: [number, number, number];
    speedMultiplier: number;
    driftRadius: number;
    delay: number;
    color: string;
}

function FloatingShape({ type, position, speedMultiplier, driftRadius, delay, color }: ShapeProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();
    
    // Scale responds to section width
    const scale = Math.min(viewport.width * 0.055, 0.65);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime() + delay;
        
        // Responsive floating and undulating around its initial position
        meshRef.current.position.x = position[0] * (viewport.width / 8) + Math.cos(time * 0.15 * speedMultiplier) * driftRadius * (viewport.width * 0.04);
        meshRef.current.position.y = position[1] * (viewport.height / 5) + Math.sin(time * 0.18 * speedMultiplier) * driftRadius * (viewport.height * 0.05);
        meshRef.current.position.z = position[2];
        
        // Very slow organic rotation
        meshRef.current.rotation.x = time * 0.015 * speedMultiplier;
        meshRef.current.rotation.y = time * 0.02 * speedMultiplier;
    });

    return (
        <mesh ref={meshRef} scale={scale}>
            {type === 'sphere' && <sphereGeometry args={[1, 64, 64]} />}
            {type === 'cube' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
            {type === 'torus' && <torusGeometry args={[0.9, 0.35, 16, 100]} />}
            {type === 'dodecahedron' && <dodecahedronGeometry args={[1.1]} />}
            
            <meshStandardMaterial
                color={color}
                roughness={0.9}     // High roughness for clay-matte look
                metalness={0.05}    // Low metalness
            />
        </mesh>
    );
}

function HeroCanvas() {
    const [mounted, setMounted] = useState(false);
    const [accentColor, setAccentColor] = useState("#ff0000");

    useEffect(() => {
        setMounted(true);
        const getAccent = () => {
            const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
            if (accent) {
                setAccentColor(accent);
            }
        };

        getAccent();
        
        const observer = new MutationObserver(getAccent);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
        
        return () => observer.disconnect();
    }, []);

    if (!mounted) return null;

    return (
        <div className="w-full h-full">
            <Canvas
                dpr={[1, 1.5]}
                gl={{
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                    alpha: true,
                    antialias: true
                }}
                camera={{ position: [0, 0, 8], fov: 45 }}
            >
                <ambientLight intensity={1.2} />
                <directionalLight position={[5, 8, 5]} intensity={1.8} />
                <directionalLight position={[-5, -5, -2]} intensity={0.5} />
                <pointLight position={[0, 0, 4]} intensity={0.8} />
                
                {/* 1. Sphere - Center-left drift */}
                <FloatingShape 
                    type="sphere" 
                    position={[-1.2, 0.4, 0]} 
                    speedMultiplier={0.8} 
                    driftRadius={0.7} 
                    delay={0}
                    color={accentColor}
                />

                {/* 2. Cube - Upper-right drift */}
                <FloatingShape 
                    type="cube" 
                    position={[1.6, 1.2, 0]} 
                    speedMultiplier={0.9} 
                    driftRadius={0.6} 
                    delay={10}
                    color={accentColor}
                />

                {/* 3. Torus - Mid-left drift */}
                <FloatingShape 
                    type="torus" 
                    position={[-1.8, -1.0, 0]} 
                    speedMultiplier={0.75} 
                    driftRadius={0.8} 
                    delay={25}
                    color={accentColor}
                />

                {/* 4. Dodecahedron - Center-right drift */}
                <FloatingShape 
                    type="dodecahedron" 
                    position={[1.2, -0.8, 0]} 
                    speedMultiplier={0.85} 
                    driftRadius={0.75} 
                    delay={40}
                    color={accentColor}
                />
            </Canvas>
        </div>
    );
}

export function Hero() {
    return (
        <section className="h-[calc(100dvh-9rem)] w-full relative flex flex-col justify-between overflow-hidden">

            {/* R3F 3D Canvas Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <HeroCanvas />
            </div>

            {/* Content Layer (Frames the 3D Canvas) */}
            <div className="relative z-10 h-full w-full container pt-12 pb-16 md:pt-16 md:pb-24 flex flex-col justify-between pointer-events-none">
                
                {/* Top Left: Frame Text */}
                <div className="w-full flex justify-start">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-md pointer-events-auto"
                    >
                        <h1 className="text-2xl md:text-4xl font-extralight tracking-tight leading-[1.2] text-foreground text-left">
                            I enjoy finding unique solutions to difficult problems.
                        </h1>
                    </motion.div>
                </div>

                {/* Bottom Right: Frame Text */}
                <div className="w-full flex justify-end mt-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-md pointer-events-auto"
                    >
                        <p className="text-sm md:text-base font-normal leading-relaxed text-foreground text-right">
                            I love meeting new and interesting clients that allow me to understand just a little bit more about our wild digital world. If that sounds like you, <a href="mailto:z@zpennachi.com" className="underline hover:opacity-70 transition-opacity font-normal">hit me up!</a>
                        </p>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
