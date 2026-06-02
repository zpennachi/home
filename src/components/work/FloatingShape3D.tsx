"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ShapeMeshProps {
    type: 'cube' | 'torus' | 'dodecahedron';
    color: string;
}

function ShapeMesh({ type, color }: ShapeMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        
        // Very slow, subtle organic floating/undulating
        meshRef.current.position.y = Math.sin(time * 0.15) * 0.15;
        meshRef.current.position.x = Math.cos(time * 0.12) * 0.1;
        
        // Slow continuous rotation
        meshRef.current.rotation.x = time * 0.02;
        meshRef.current.rotation.y = time * 0.03;
    });

    return (
        <mesh ref={meshRef}>
            {type === 'cube' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
            {type === 'torus' && <torusGeometry args={[0.9, 0.35, 16, 100]} />}
            {type === 'dodecahedron' && <dodecahedronGeometry args={[1.1]} />}
            
            <meshStandardMaterial
                color={color}
                roughness={0.9}     // High roughness for a matte, clay-like feel
                metalness={0.05}    // Low metalness
            />
        </mesh>
    );
}

interface FloatingShape3DProps {
    type: 'cube' | 'torus' | 'dodecahedron';
    className?: string;
}

export function FloatingShape3D({ type, className }: FloatingShape3DProps) {
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

        // Listen for live design system token changes in admin dashboard
        const observer = new MutationObserver(getAccent);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });

        return () => observer.disconnect();
    }, []);

    if (!mounted) {
        // Return a structural placeholder of the same size to prevent layout shifts
        return <div className={className} />;
    }

    return (
        <div className={className}>
            <Canvas
                dpr={[1, 1.5]}
                gl={{
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                    alpha: true,
                    antialias: true
                }}
                camera={{ position: [0, 0, 4.5], fov: 40 }}
            >
                <ambientLight intensity={1.2} />
                <directionalLight position={[3, 5, 3]} intensity={1.8} />
                <directionalLight position={[-3, -3, -1]} intensity={0.4} />
                <pointLight position={[0, 0, 2]} intensity={0.8} />
                <ShapeMesh type={type} color={accentColor} />
            </Canvas>
        </div>
    );
}
