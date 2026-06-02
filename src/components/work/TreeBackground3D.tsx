"use client";

import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Load, position, and handle the user's custom tree GLB model
const CedarTreeModel = React.memo(function CedarTreeModel() {
    const { scene } = useGLTF('/models/two_cedar_trees.glb');
    
    const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
    const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
    const animatedMeshes = useRef<THREE.Mesh[]>([]);

    useEffect(() => {
        if (!scene) return;

        const meshes: THREE.Mesh[] = [];

        // Traverse the model to clone materials and inject wind waving
        scene.traverse((node) => {
            if (node instanceof THREE.Mesh) {
                const originalMat = node.material as THREE.MeshStandardMaterial;
                const mat = originalMat.clone();
                mat.roughness = 0.95;
                mat.metalness = 0.05;
                
                mat.onBeforeCompile = (shader) => {
                    shader.uniforms.uTime = { value: 0 };
                    shader.vertexShader = `
                        uniform float uTime;
                    ` + shader.vertexShader;
                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `
                        #include <begin_vertex>
                        
                        // Low frequency slow sway (main trunk and general movement)
                        float slowSwayX = sin(uTime * 0.5 + position.y * 0.4) * 0.08;
                        float slowSwayZ = cos(uTime * 0.4 + position.y * 0.3) * 0.08;
                        
                        // Medium frequency branch motion (gusts)
                        float midSwayX = cos(uTime * 1.3 + position.y * 1.1 + position.z * 1.5) * 0.03;
                        float midSwayZ = sin(uTime * 1.5 + position.y * 1.3 + position.x * 1.7) * 0.03;
                        
                        // High frequency leaf/twig rustling (jitter)
                        float fastRustleX = sin(uTime * 3.1 + position.x * 2.8 + position.y * 2.1) * 0.009;
                        float fastRustleZ = cos(uTime * 2.7 + position.z * 3.2 + position.y * 2.5) * 0.009;
                        
                        // Height mask: lock trunk roots to ground (base y is around -2.4, range is ~5.2)
                        float trunkMask = clamp((position.y + 2.3) / 5.2, 0.0, 1.0);
                        
                        // Branch flexibility: outer leaves/branches sway more than the central trunk
                        float branchFlex = trunkMask * (0.2 + length(position.xz) * 0.8);
                        
                        // Apply wave displacement
                        transformed.x += (slowSwayX + midSwayX + fastRustleX) * branchFlex;
                        transformed.z += (slowSwayZ + midSwayZ + fastRustleZ) * branchFlex;
                        `
                    );
                    mat.userData.shader = shader;
                };
                
                node.material = mat;
                meshes.push(node);
            }
        });

        animatedMeshes.current = meshes;

        // Compute original bounding box of the un-transformed scene
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // Target a consistent tree height of 5.5 units in our 3D world space
        const targetHeight = 5.5;
        const scaleFactor = targetHeight / (size.y || 1);
        
        setScale([scaleFactor, scaleFactor, scaleFactor]);
        
        // Align base to the bottom anchor (-2.4) and position it to the left of center (X = -1.5)
        const nextPos: [number, number, number] = [
            -center.x * scaleFactor - 1.5,
            -box.min.y * scaleFactor - 2.4,
            -center.z * scaleFactor
        ];
        
        setPosition(nextPos);
    }, [scene]);

    // Animate the solid mesh materials' uTime values
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        animatedMeshes.current.forEach((mesh) => {
            const mat = mesh.material as any;
            if (mat && mat.userData?.shader) {
                mat.userData.shader.uniforms.uTime.value = time;
            }
        });
    });

    // Use a parent group for scaling, translation, and tilt rotation
    return (
        <group 
            position={position} 
            scale={scale}
            rotation={[0.12, 0, -0.08]} // Subtle rightward tilt
        >
            <primitive object={scene} />
        </group>
    );
});

interface ControllerProps {
    scrollPercentRef: React.RefObject<number>;
}

// Camera framing, scroll control orchestrator
function CameraScrollController({ scrollPercentRef }: ControllerProps) {
    const { camera, size } = useThree();
    
    // Smooth targets for camera tracking (starts on lower trunk at fixed distance)
    const targetPos = useRef(new THREE.Vector3(-1.08, -1.2, 3.47));
    const targetLookAt = useRef(new THREE.Vector3(-1.5, -1.6, 0));
    
    // Smooth tracking ref for lookAt target to avoid sudden orientation flips
    const currentLookAt = useRef(new THREE.Vector3(-1.5, -1.6, 0));

    // Dynamic keyframe definitions based on scroll position (0 to 1)
    // Starts at the bottom base trunk/floor and moves up to the top canopy
    const cameraKeyframes = useMemo(() => [
        {
            pct: 0.0,
            angle: 0.12, // Starting angle (front-right)
            radius: 3.3, // Zoomed in a bit more at the start (from 3.8)
            y: -1.4,     // Balanced camera height focused on bottom third
            look: new THREE.Vector3(-1.5, -1.6, 0) // Look target centered at lower trunk (X = -1.5)
        },
        {
            pct: 0.33,
            angle: 2.21, // Rotated to right-back
            radius: 4.1, // Zooming out
            y: -1.2,
            look: new THREE.Vector3(-1.5, -1.4, 0)  // Keep focused on trunk
        },
        {
            pct: 0.66,
            angle: 4.28, // Rotated to left-back
            radius: 4.4, // Zooming out more
            y: -0.2,
            look: new THREE.Vector3(-1.5, -0.4, 0)  // Slowly shift to lower-middle foliage
        },
        {
            pct: 1.0,
            angle: 6.40, // Full clean 360-degree rotation back to front-right
            radius: 4.8, // Zoomed out further to fully frame the canopy with breathing room
            y: 1.0,
            look: new THREE.Vector3(-1.5, 0.8, 0)  // Reach upper canopy
        }
    ], []);

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        const lerpFactor = 1 - Math.exp(-5 * delta); // smooth, frame-rate independent easing
        const scrollPercent = scrollPercentRef.current ?? 0;

        // SCROLL-LINKED MODE:
        // Linearly interpolate between the nearest scroll keyframes
        let startKey = cameraKeyframes[0];
        let endKey = cameraKeyframes[cameraKeyframes.length - 1];

        for (let i = 0; i < cameraKeyframes.length - 1; i++) {
            if (scrollPercent >= cameraKeyframes[i].pct && scrollPercent <= cameraKeyframes[i + 1].pct) {
                startKey = cameraKeyframes[i];
                endKey = cameraKeyframes[i + 1];
                break;
            }
        }

        const range = endKey.pct - startKey.pct;
        const localPct = range > 0 ? (scrollPercent - startKey.pct) / range : 0;

        // Smooth Hermite cubic interpolation
        const t = localPct * localPct * (3 - 2 * localPct);

        // Interpolate polar/cylindrical coordinates for a perfect spiral orbit path
        const angle = THREE.MathUtils.lerp(startKey.angle, endKey.angle, t);
        const radius = THREE.MathUtils.lerp(startKey.radius, endKey.radius, t);
        const y = THREE.MathUtils.lerp(startKey.y, endKey.y, t);

        // Reconstruct camera Cartesian target coordinates orbiting around the tree center (X = -1.5)
        targetPos.current.set(
            -1.5 + radius * Math.sin(angle),
            y,
            radius * Math.cos(angle)
        );
        const baseLook = new THREE.Vector3().copy(startKey.look).lerp(endKey.look, t);
        
        // Responsive offset: shift the tree right on desktop (size.width >= 1024), center on mobile
        const isDesktop = size.width >= 1024;
        const offsetX = isDesktop ? -1.3 : 0.0;
        
        targetLookAt.current.set(
            baseLook.x + offsetX * Math.cos(angle),
            baseLook.y,
            baseLook.z - offsetX * Math.sin(angle)
        );

        // Interpolate camera coordinates and gaze point towards target values
        camera.position.lerp(targetPos.current, lerpFactor);
        currentLookAt.current.lerp(targetLookAt.current, lerpFactor);
        camera.lookAt(currentLookAt.current);
    });

    return null;
}

export default function TreeBackground3D() {
    const scrollPercentRef = useRef(0);
    const [mounted, setMounted] = useState(false);

    // Track scroll positions and handle scroll boundaries
    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const currentPct = window.scrollY / totalHeight;
                scrollPercentRef.current = currentPct;
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
                camera={{ position: [-1.08, -1.2, 3.47], fov: 45 }}
            >
                <ambientLight intensity={1.4} />
                <directionalLight position={[6, 10, 6]} intensity={1.8} />
                <directionalLight position={[-6, -6, -2]} intensity={0.4} />
                <pointLight position={[0, 2, 4]} intensity={0.6} />

                {/* Wrap in Suspense to support loading GLB tree model */}
                <Suspense fallback={null}>
                    <CedarTreeModel />
                </Suspense>
                
                <CameraScrollController scrollPercentRef={scrollPercentRef} />
            </Canvas>
        </div>
    );
}

// Preload model asset for immediate loading
useGLTF.preload('/models/two_cedar_trees.glb');
