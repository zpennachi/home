"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function FloatingSphere() {
    const meshRef = React.useRef<THREE.Mesh>(null);
    const { viewport } = useThree();
    
    // Much smaller scale to serve as a subtle accent
    const scale = Math.min(viewport.width * 0.08, 0.9);

    // Get the accent color dynamically from document styles
    const [accentColor, setAccentColor] = React.useState("#ff0000");

    React.useEffect(() => {
        const getAccent = () => {
            const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
            if (accent) {
                setAccentColor(accent);
            }
        };

        getAccent();
        
        // Listen for token updates if customized dynamically in admin dashboard
        const observer = new MutationObserver(getAccent);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
        
        return () => observer.disconnect();
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        
        // Significantly slower and tighter organic drifting animation
        meshRef.current.position.y = Math.sin(time * 0.1) * (viewport.height * 0.08);
        meshRef.current.position.x = Math.cos(time * 0.08) * (viewport.width * 0.10);
        
        // Very slow continuous rotation
        meshRef.current.rotation.x = time * 0.015;
        meshRef.current.rotation.y = time * 0.02;
    });

    return (
        <mesh ref={meshRef} scale={scale}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
                color={accentColor}
                roughness={0.9} // high roughness for a very matte, clay-like, non-shiny surface
                metalness={0.05} // low metalness to keep it soft and organic
            />
        </mesh>
    );
}

function HeroCanvas() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
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
                <FloatingSphere />
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
