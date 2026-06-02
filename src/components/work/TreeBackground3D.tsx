"use client";

import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Load and position the user's custom tree GLB model
function CedarTreeModel() {
    const { scene } = useGLTF('/models/two_cedar_trees.glb');
    
    const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
    const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
    
    // Store animated meshes to update their shader uniforms efficiently
    const animatedMeshes = useRef<THREE.Mesh[]>([]);

    useEffect(() => {
        if (!scene) return;

        const meshes: THREE.Mesh[] = [];

        // Traverse the model to make sure standard shadow casting is active
        scene.traverse((node) => {
            if (node instanceof THREE.Mesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                
                // Set high roughness for a premium, non-shiny, matte clay look
                if (node.material) {
                    const originalMat = node.material as THREE.MeshStandardMaterial;
                    
                    // Clone material to avoid mutating shared cache assets
                    const mat = originalMat.clone();
                    mat.roughness = 0.95;
                    mat.metalness = 0.05;
                    
                    // Inject vertex displacement shader modification for organic GPU ripples
                    mat.onBeforeCompile = (shader) => {
                        shader.uniforms.uTime = { value: 0 };
                        shader.vertexShader = `
                            uniform float uTime;
                        ` + shader.vertexShader;
                        
                        shader.vertexShader = shader.vertexShader.replace(
                            '#include <begin_vertex>',
                            `
                            #include <begin_vertex>
                            // Microscopic, organic flowing ripples moving through details at a natural, smooth speed
                            float wave = sin(position.y * 10.0 + uTime * 0.7) * 0.006;
                            transformed.x += wave;
                            transformed.z += cos(position.y * 8.5 + uTime * 0.55) * 0.006;
                            `
                        );
                        
                        mat.userData.shader = shader;
                    };
                    
                    node.material = mat;
                    meshes.push(node);
                }
            }
        });
        
        animatedMeshes.current = meshes;

        // Compute original bounding box of the un-transformed scene
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        console.log("Tree Model Diagnostics:", {
            rawMin: box.min.toArray(),
            rawMax: box.max.toArray(),
            rawSize: size.toArray(),
            rawCenter: center.toArray()
        });
        
        // Target a consistent tree height of 5.5 units in our 3D world space
        const targetHeight = 5.5;
        const scaleFactor = targetHeight / (size.y || 1);
        
        setScale([scaleFactor, scaleFactor, scaleFactor]);
        
        // Align base to the bottom anchor (-2.4) and center horizontally
        const nextPos: [number, number, number] = [
            -center.x * scaleFactor,
            -box.min.y * scaleFactor - 2.4,
            -center.z * scaleFactor
        ];
        
        setPosition(nextPos);

        console.log("Applied Scales and Positions:", {
            scaleFactor,
            nextPos
        });
    }, [scene]);

    // Animate the custom shader time uniform on every frame loop
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        animatedMeshes.current.forEach((mesh) => {
            const mat = mesh.material as any;
            if (mat && mat.userData?.shader) {
                mat.userData.shader.uniforms.uTime.value = time;
            }
        });
    });

    // Use a parent group for scaling and translation to protect scene object from mutations
    return (
        <group position={position} scale={scale}>
            <primitive object={scene} />
        </group>
    );
}

// Camera framing and scroll control orchestrator
function CameraScrollController({ scrollPercent }: { scrollPercent: number }) {
    const { camera } = useThree();
    
    // Target position and lookAt points (aligned with scroll = 0 values)
    const targetPos = useRef(new THREE.Vector3(0.5, -0.6, 4.0));
    const targetLookAt = useRef(new THREE.Vector3(0, -0.8, 0));
    
    // Smooth tracking ref for lookAt target to avoid orientation locks/flips
    const currentLookAt = useRef(new THREE.Vector3(0, -0.8, 0));

    // Dynamic keyframe definitions based on scroll position (0 to 1)
    // Starts at the bottom base trunk/floor and moves up to the top canopy
    const cameraKeyframes = useMemo(() => [
        {
            pct: 0.0, // Hero: Bottom base / stump fully visible
            pos: new THREE.Vector3(0.5, -0.6, 4.0),
            look: new THREE.Vector3(0, -0.8, 0)
        },
        {
            pct: 0.33, // Manifesto: Mid-trunk, rotated to left side
            pos: new THREE.Vector3(-2.2, 0.4, 3.5),
            look: new THREE.Vector3(-0.2, 0.4, 0)
        },
        {
            pct: 0.66, // Tech Stack: Branch split, rotated to right-front
            pos: new THREE.Vector3(2.0, 1.6, 3.2),
            look: new THREE.Vector3(0.2, 1.4, 0)
        },
        {
            pct: 1.0, // Selected Works: Top Canopy close-up looking down
            pos: new THREE.Vector3(-0.5, 3.2, 2.5),
            look: new THREE.Vector3(0, 2.3, 0)
        }
    ], []);

    useFrame((state, delta) => {
        // Find the bounding keyframes for the current scroll percentage
        let startKey = cameraKeyframes[0];
        let endKey = cameraKeyframes[cameraKeyframes.length - 1];

        for (let i = 0; i < cameraKeyframes.length - 1; i++) {
            if (scrollPercent >= cameraKeyframes[i].pct && scrollPercent <= cameraKeyframes[i + 1].pct) {
                startKey = cameraKeyframes[i];
                endKey = cameraKeyframes[i + 1];
                break;
            }
        }

        // Percentage interpolation between the two active keyframes
        const range = endKey.pct - startKey.pct;
        const localPct = range > 0 ? (scrollPercent - startKey.pct) / range : 0;

        // Smooth cubic-like interpolation curve
        const t = localPct * localPct * (3 - 2 * localPct);

        // Interpolate position and look-at target coordinates directly
        targetPos.current.copy(startKey.pos).lerp(endKey.pos, t);
        targetLookAt.current.copy(startKey.look).lerp(endKey.look, t);

        // Frame-rate independent smooth camera tracking (lerp damping)
        const lerpFactor = 1 - Math.exp(-6 * delta); // smooth follow speed
        camera.position.lerp(targetPos.current, lerpFactor);

        // Update target looking vector smoothly
        currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
        camera.lookAt(currentLookAt.current);
    });

    return null;
}

export default function TreeBackground3D() {
    const [scrollPercent, setScrollPercent] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                setScrollPercent(window.scrollY / totalHeight);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
            <Canvas
                dpr={[1, 1.5]}
                gl={{
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                    alpha: true,
                    antialias: true
                }}
                camera={{ position: [0.5, -0.6, 4.0], fov: 45 }}
            >
                <ambientLight intensity={1.4} />
                <directionalLight position={[6, 10, 6]} intensity={1.8} />
                <directionalLight position={[-6, -6, -2]} intensity={0.4} />
                <pointLight position={[0, 2, 4]} intensity={0.6} />

                {/* Wrap in Suspense to support loading GLB tree model */}
                <Suspense fallback={null}>
                    <CedarTreeModel />
                </Suspense>
                
                <CameraScrollController scrollPercent={scrollPercent} />
            </Canvas>
        </div>
    );
}

// Preload model asset for immediate loading
useGLTF.preload('/models/two_cedar_trees.glb');
