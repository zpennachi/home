"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, InstancedRigidBodies, RapierRigidBody, RigidBody, CuboidCollider, useAfterPhysicsStep } from "@react-three/rapier";
import { useMemo, useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";

const COUNT_REDUCED = 10; // Changed from 20 to 10 as per instruction

// Scratchpad for physics calculations - kept in a stable object to avoid per-frame allocation
// and moved inside the component to prevent cross-component race conditions if multiple scenes exist.
function usePhysicsScratchpad() {
    return useMemo(() => ({
        tmpVec: new THREE.Vector3(),
        tmpPos: new THREE.Vector3(),
        tmpDir: new THREE.Vector3(),
        upSmall: new THREE.Vector3(0, 0.05, 0),
        upHero: new THREE.Vector3(0, 0.02, 0)
    }), []);
}

function PhysicsEntities({ onScore }: { onScore: () => void }) {
    const spheresApi = useRef<RapierRigidBody[]>(null);
    const greenSpheresApi = useRef<RapierRigidBody[]>(null);
    const heroApi = useRef<RapierRigidBody>(null);
    const { viewport, pointer } = useThree();
    const { tmpVec, tmpPos, tmpDir, upSmall, upHero } = usePhysicsScratchpad();

    const instances = useMemo(() => {
        const data = [];
        for (let i = 0; i < COUNT_REDUCED; i++) {
            data.push({
                key: 'instance_' + i,
                position: [(Math.random() - 0.5) * 8, 4 + Math.random() * 6, (Math.random() - 0.5) * 3] as [number, number, number],
                rotation: [Math.random() * Math.PI, 0, 0] as [number, number, number],
            });
        }
        return data;
    }, []);

    const greenInstances = useMemo(() => {
        const data = [];
        for (let i = 0; i < COUNT_REDUCED; i++) {
            data.push({
                key: 'green_instance_' + i,
                position: [(Math.random() - 0.5) * 8, 4 + Math.random() * 6, (Math.random() - 0.5) * 3] as [number, number, number],
                rotation: [Math.random() * Math.PI, 0, 0] as [number, number, number],
            });
        }
        return data;
    }, []);

    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, []);

    // useAfterPhysicsStep is the ONLY safe place to apply continuous impulses in Rapier WASM
    // to avoid the "recursive use of an object" safety panic.
    useAfterPhysicsStep(() => {
        if (isNaN(pointer.x) || isNaN(pointer.y)) {
            // console.warn("Pointer coordinates are NaN, skipping physics step."); // Removed for less console noise
            return;
        }

        tmpVec.set(pointer.x * viewport.width / 2, pointer.y * viewport.height / 2, 0);
        const isMouseActive = Math.abs(pointer.x) < 0.9 && Math.abs(pointer.y) < 0.9;

        // 1. Process Background Spheres (Black/White)
        if (spheresApi.current) {
            spheresApi.current.forEach((body) => {
                if (!body) return;
                const translation = body.translation();
                if (isNaN(translation.x) || isNaN(translation.y) || isNaN(translation.z)) return;

                if (isMouseActive && !isClicking) {
                    tmpPos.set(translation.x, translation.y, translation.z);
                    tmpDir.copy(tmpVec).sub(tmpPos);
                    const distSq = tmpDir.lengthSq();
                    if (distSq < 0.0001) return;
                    tmpDir.normalize();

                    body.applyImpulse(upSmall, true);
                    body.applyImpulse(tmpDir.multiplyScalar(0.06), true);
                    body.setLinearDamping(2.0);
                } else {
                    body.setLinearDamping(0.2);
                }
            });
        }

        // 2. Process Green Spheres (Small)
        if (greenSpheresApi.current) {
            greenSpheresApi.current.forEach((body) => {
                if (!body) return;
                const translation = body.translation();
                if (isNaN(translation.x) || isNaN(translation.y) || isNaN(translation.z)) return;

                if (isMouseActive && isClicking) {
                    tmpPos.set(translation.x, translation.y, translation.z);
                    tmpDir.copy(tmpVec).sub(tmpPos);
                    const distSq = tmpDir.lengthSq();
                    if (distSq < 0.0001) return;
                    tmpDir.normalize();

                    body.applyImpulse(upSmall, true);
                    body.applyImpulse(tmpDir.multiplyScalar(0.06), true);
                    body.setLinearDamping(2.0);
                } else {
                    body.setLinearDamping(0.2);
                }
            });
        }

        // 3. Process Hero Sphere (Neon Green Big)
        if (heroApi.current) {
            const body = heroApi.current;
            const translation = body.translation();
            if (isNaN(translation.x) || isNaN(translation.y) || isNaN(translation.z)) return;

            if (isMouseActive && isClicking) {
                tmpPos.set(translation.x, translation.y, translation.z);
                tmpDir.copy(tmpVec).sub(tmpPos);
                const distSq = tmpDir.lengthSq();
                if (distSq < 0.0001) return;
                tmpDir.normalize();

                body.applyImpulse(upHero, true);
                body.applyImpulse(tmpDir.multiplyScalar(0.04), true);
                body.setLinearDamping(2.0);
            } else {
                body.setLinearDamping(0.5);
            }
        }
    });

    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const sphereColor = mounted ? (resolvedTheme === 'dark' ? '#FAFAF8' : '#111111') : '#FAFAF8';
    const floorY = -viewport.height / 2;
    const clippingPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -floorY), [floorY]);

    return (
        <>
            <InstancedRigidBodies ref={spheresApi} instances={instances} colliders="ball">
                <instancedMesh args={[null as any, null as any, COUNT_REDUCED]} count={COUNT_REDUCED}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color={sphereColor} clippingPlanes={[clippingPlane]} />
                </instancedMesh>
            </InstancedRigidBodies>

            <InstancedRigidBodies ref={greenSpheresApi} instances={greenInstances} colliders="ball">
                <instancedMesh args={[null as any, null as any, COUNT_REDUCED]} count={COUNT_REDUCED}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color="#39FF14" clippingPlanes={[clippingPlane]} />
                </instancedMesh>
            </InstancedRigidBodies>

            <RigidBody ref={heroApi} position={[0, 10, 0]} colliders="ball" restitution={0.7} friction={0.1}>
                <mesh>
                    <sphereGeometry args={[0.8, 16, 16]} />
                    <meshBasicMaterial color="#39FF14" clippingPlanes={[clippingPlane]} />
                </mesh>
            </RigidBody>
            <Boundaries onScore={onScore} />
        </>
    );
}

function Boundaries({ onScore }: { onScore: () => void }) {
    const { viewport } = useThree();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleScore = (e: any) => {
        const body = e.rigidBody;
        if (body) {
            onScore();
            body.setTranslation({
                x: (Math.random() - 0.5) * 6,
                y: 12,
                z: (Math.random() - 0.5) * 2
            }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
    };

    const floorY = -viewport.height / 2;
    const holeSize = 1.0;
    const holeZ = -6;
    const holeX = viewport.width / 4; // Shifted right

    // Scene depth limits based on the walls
    const FRONT_LIMIT = 5;
    const BACK_LIMIT = -10;

    // Theme-aware hole void color
    const voidColor = mounted ? (resolvedTheme === 'dark' ? '#FFFFFF' : '#000000') : '#000000';
    const rimColor = mounted ? (resolvedTheme === 'dark' ? '#EEEEEE' : '#111111') : '#111111';

    // Calculate side panel dimensions based on holeX
    const leftPanelWidth = (holeX - holeSize) - (-viewport.width / 2);
    const leftPanelX = -viewport.width / 2 + leftPanelWidth / 2;

    const rightPanelWidth = (viewport.width / 2) - (holeX + holeSize);
    const rightPanelX = viewport.width / 2 - rightPanelWidth / 2;

    return (
        <>
            {/* 1 & 2: Long Side Panels (Left/Right) - Adjusted for holeX */}
            <RigidBody type="fixed" position={[leftPanelX, floorY, 0]}>
                <CuboidCollider args={[leftPanelWidth / 2, 1, 25]} />
            </RigidBody>
            <RigidBody type="fixed" position={[rightPanelX, floorY, 0]}>
                <CuboidCollider args={[rightPanelWidth / 2, 1, 25]} />
            </RigidBody>

            {/* 3: Front Floor Segment - Centered on holeX */}
            <RigidBody type="fixed" position={[holeX, floorY, (FRONT_LIMIT + (holeZ + holeSize)) / 2]}>
                <CuboidCollider args={[holeSize, 1, (FRONT_LIMIT - (holeZ + holeSize)) / 2]} />
            </RigidBody>

            {/* 4: Back Floor Segment - Centered on holeX */}
            <RigidBody type="fixed" position={[holeX, floorY, (BACK_LIMIT + (holeZ - holeSize)) / 2]}>
                <CuboidCollider args={[holeSize, 1, ((holeZ - holeSize) - BACK_LIMIT) / 2]} />
            </RigidBody>

            {/* Visual Hole - Flat Circle Representation - repositioned track holeX */}
            <group position={[holeX, floorY + 1.0, holeZ]}>
                {/* Visual Rim */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <ringGeometry args={[holeSize - 0.05, holeSize, 32]} />
                    <meshBasicMaterial color={rimColor} />
                </mesh>
                {/* Inner Void Circle - occludes spheres falling in */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[holeSize - 0.05, 32]} />
                    <meshBasicMaterial color={voidColor} />
                </mesh>
            </group>

            {/* Scoring Sensor - Aligned with holeX and holeZ */}
            <RigidBody type="fixed" position={[holeX, floorY - 2, holeZ]}>
                <CuboidCollider
                    args={[holeSize - 0.2, 0.5, holeSize - 0.2]}
                    sensor
                    onIntersectionEnter={handleScore}
                />
            </RigidBody>
            <RigidBody type="fixed" position={[0, 0, -10]}>
                <CuboidCollider args={[50, 50, 1]} />
            </RigidBody>
            <RigidBody type="fixed" position={[0, 0, 5]}>
                <CuboidCollider args={[50, 50, 1]} />
            </RigidBody>
            <RigidBody type="fixed" position={[-viewport.width / 2 - 1, 0, 0]}>
                <CuboidCollider args={[1, 50, 50]} />
            </RigidBody>
            <RigidBody type="fixed" position={[viewport.width / 2 + 1, 0, 0]}>
                <CuboidCollider args={[1, 50, 50]} />
            </RigidBody>
        </>
    );
}

export function PhysicsScene({ onScore }: { onScore: () => void }) {
    const [canvasKey, setCanvasKey] = useState(0);
    const [delayedMounted, setDelayedMounted] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        console.log('PhysicsScene: Component mounted');
        const timeout = setTimeout(() => {
            setDelayedMounted(true);
        }, 500);

        return () => {
            console.log('PhysicsScene: Component unmounting');
            clearTimeout(timeout);
            if (canvasRef.current) {
                canvasRef.current = null;
            }
        };
    }, []);

    if (!delayedMounted) return null;

    return (
        <div className="w-full h-full">
            <Canvas
                key={canvasKey}
                dpr={[1, 1.5]}
                gl={{
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                    alpha: true,
                    preserveDrawingBuffer: false,
                    localClippingEnabled: true
                }}
                camera={{ position: [0, 0, 10], fov: 35 }}
                onCreated={(state) => {
                    const canvas = state.gl.domElement;
                    canvasRef.current = canvas;

                    const handleContextLost = (e: Event) => {
                        e.preventDefault();
                        console.error('PhysicsScene: WebGL context lost', e);
                        setTimeout(() => {
                            console.log('PhysicsScene: Attempting context recovery via re-mount');
                            setCanvasKey(prev => prev + 1);
                        }, 1000);
                    };

                    const handleContextRestored = () => {
                        console.log('PhysicsScene: WebGL context restored');
                    };

                    canvas.addEventListener('webglcontextlost', handleContextLost, { once: true });
                    canvas.addEventListener('webglcontextrestored', handleContextRestored, { once: true });
                }}
            >
                <Physics gravity={[0, -5, 0]}>
                    <PhysicsEntities onScore={onScore} />
                </Physics>
            </Canvas>
        </div>
    );
}
