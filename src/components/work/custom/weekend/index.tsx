"use client";

import { Canvas } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

function GhostSphere() {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh>
                <sphereGeometry args={[1.5, 64, 64]} />
                <MeshTransmissionMaterial
                    backside
                    backsideThickness={5}
                    thickness={2}
                    roughness={0.1}
                    transmission={1}
                    ior={1.5}
                    chromaticAberration={0.2}
                    anisotropy={1}
                    distortion={1}
                    distortionScale={1}
                    temporalDistortion={0.2}
                    color="#ffffff"
                    background={undefined}
                />
            </mesh>
        </Float>
    );
}

function Scene() {
    return (
        <>
            <GhostSphere />

            <Environment resolution={256}>
                <group rotation={[-Math.PI / 3, 0, 1]}>
                    <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
                    <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
                    <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
                    <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
                </group>
            </Environment>

            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} color="#000000" />
        </>
    );
}

export default function WeekendVisual() {
    return (
        <div className="w-full h-full min-h-[50vh] bg-[#050505]">
            <Canvas
                dpr={1}
                camera={{ position: [0, 0, 6], fov: 45 }}
                onCreated={(state) => {
                    console.log('WeekendVisual: Canvas created');
                    state.gl.domElement.addEventListener('webglcontextlost', (e) => {
                        console.error('WeekendVisual: WebGL context lost', e);
                    }, { once: true });
                }}
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
}
