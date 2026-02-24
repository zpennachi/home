"use client";

import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Simulation } from './Simulation'
import { Particles } from './Particles'
import { ParticleLifeControls, SimulationConfig } from './ParticleLifeControls'
import * as THREE from 'three'

export default function ParticleLife() {
    const particlesRef = useRef<THREE.ShaderMaterial>(null)
    const onPresetRef = useRef<(name: string) => void>(() => { });

    const [config, setConfig] = useState<SimulationConfig>({
        speed: 1.3,
        friction: 0.9,
        attraction: 100.0,
        radius: 11.5,
        size: 250.0,
        decay: 0.50,
        repulsion: 20.0
    });

    const handlePreset = (name: 'Balanced' | 'Chaos' | 'Clusters' | 'Cells') => {
        if (onPresetRef.current) {
            onPresetRef.current(name);
        }
    };

    return (
        <div className="w-full h-full relative bg-[#050510] border-b border-white/5 overflow-hidden group">
            {/* Integrated Controls (Overlay) */}
            <ParticleLifeControls
                config={config}
                setConfig={setConfig}
                onPreset={handlePreset}
            />

            {/* Canvas */}
            <div className="absolute inset-0">
                <Canvas
                    dpr={1}
                    camera={{ position: [0, 0, 80], fov: 45 }}
                    gl={{ antialias: false, alpha: false, stencil: false, depth: false }}
                    className="w-full h-full"
                    onCreated={(state) => {
                        console.log('ParticleLife: Canvas created');
                        state.gl.domElement.addEventListener('webglcontextlost', (e) => {
                            console.error('ParticleLife: WebGL context lost', e);
                        }, { once: true });
                    }}
                >
                    <color attach="background" args={['#050510']} />

                    <OrbitControls
                        enableDamping
                        zoomSpeed={0.5}
                        maxDistance={200}
                        minDistance={10}
                        autoRotate={true}
                        autoRotateSpeed={0.5}
                    />

                    <Simulation
                        particlesRef={particlesRef}
                        config={config}
                        onPresetRef={onPresetRef}
                    />
                    <Particles simulationRef={particlesRef} />

                    {/* Post Processing */}
                    <EffectComposer>
                        <Bloom luminanceThreshold={0.0} mipmapBlur intensity={2.0} radius={0.5} />
                        <Vignette offset={0.3} darkness={0.4} eskil={false} />
                    </EffectComposer>
                </Canvas>
            </div>
        </div>
    )
}
