"use client";

import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface CedarTreeProps {
    scrollPercentRef: React.RefObject<number>;
    mouseRef: React.RefObject<THREE.Vector2>;
    mouseActiveRef: React.RefObject<boolean>;
}

// Load, position, and handle the user's custom tree GLB model
const CedarTreeModel = React.memo(function CedarTreeModel({ scrollPercentRef, mouseRef, mouseActiveRef }: CedarTreeProps) {
    const { scene } = useGLTF('/models/two_cedar_trees.glb');
    
    const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
    const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
    const [treeOffset, setTreeOffset] = useState<[number, number, number]>([0, 0, 0]);
    const [wireframeScene, setWireframeScene] = useState<THREE.Group | null>(null);
    
    const animatedMeshes = useRef<THREE.Mesh[]>([]);
    const animatedWireframeMeshes = useRef<THREE.Mesh[]>([]);

    const currentMousePos = useRef(new THREE.Vector3(-10000, -10000, -10000));
    const trailPoints = useRef<THREE.Vector3[]>(
        Array(64).fill(null).map(() => new THREE.Vector3(-10000, -10000, -10000))
    );
    const trailOpacities = useRef<number[]>(Array(64).fill(0));
    const lastDroppedPos = useRef(new THREE.Vector3(-10000, -10000, -10000));

    useEffect(() => {
        if (!scene) return;

        const meshes: THREE.Mesh[] = [];

        // Traverse the model to clone materials and inject wind waving + magic lens shader
        scene.traverse((node) => {
            if (node instanceof THREE.Mesh) {
                const originalMat = node.material as THREE.MeshStandardMaterial;
                const mat = originalMat.clone();
                mat.roughness = 0.95;
                mat.metalness = 0.05;
                mat.transparent = true;
                mat.depthWrite = false;
                
                mat.onBeforeCompile = (shader) => {
                    shader.uniforms.uTime = { value: 0 };
                    shader.uniforms.uMousePoints = { value: Array(64).fill(null).map(() => new THREE.Vector3(-10000, -10000, -10000)) };
                    shader.uniforms.uMouseOpacities = { value: Array(64).fill(0) };
                    shader.uniforms.uRadius = { value: 1.0 };
                    shader.uniforms.uFeather = { value: 0.7 };
                    
                    shader.vertexShader = `
                        uniform float uTime;
                        varying vec3 vWorldPosition;
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
                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <project_vertex>',
                        `
                        #include <project_vertex>
                        vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
                        `
                    );

                    shader.fragmentShader = `
                        uniform float uTime;
                        uniform vec3 uMousePoints[64];
                        uniform float uMouseOpacities[64];
                        uniform float uRadius;
                        uniform float uFeather;
                        varying vec3 vWorldPosition;
                    ` + shader.fragmentShader;

                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <dithering_fragment>',
                        `
                        #include <dithering_fragment>
                        
                        // Dynamic organic ripple distortion (liquid/smoke boundary feel) in 3D world space
                        float waveX = sin(vWorldPosition.y * 6.0 + uTime * 1.5) * 0.15;
                        float waveY = cos(vWorldPosition.z * 6.0 + uTime * 1.2) * 0.15;
                        float waveZ = sin(vWorldPosition.x * 6.0 + uTime * 1.0) * 0.15;
                        float detailX = cos(vWorldPosition.y * 15.0 + uTime * 3.2) * 0.04;
                        float detailY = sin(vWorldPosition.z * 15.0 + uTime * 2.8) * 0.04;
                        float detailZ = cos(vWorldPosition.x * 15.0 + uTime * 2.5) * 0.04;
                        vec3 distortedPos = vWorldPosition + vec3(waveX + detailX, waveY + detailY, waveZ + detailZ);
                        
                        float finalMask = 0.0;
                        for (int i = 0; i < 64; i++) {
                            float dist = distance(distortedPos, uMousePoints[i]);
                            float mask = 1.0 - smoothstep(uRadius - uFeather, uRadius, dist);
                            finalMask = max(finalMask, mask * uMouseOpacities[i]);
                        }
                        if (finalMask < 0.01) discard;
                        gl_FragColor.a *= finalMask;
                        `
                    );
                    mat.userData.shader = shader;
                };
                
                node.material = mat;
                meshes.push(node);
            }
        });

        animatedMeshes.current = meshes;

        // Clone scene to create wireframe copy
        const wireScene = scene.clone();
        const wireMeshes: THREE.Mesh[] = [];
        
        wireScene.traverse((node) => {
            if (node instanceof THREE.Mesh) {
                const originalMat = node.material as THREE.MeshStandardMaterial;
                const mat = new THREE.MeshBasicMaterial({
                    color: new THREE.Color("#27272a"), // Zinc 800 dark gray
                    wireframe: true,
                    transparent: true,
                    opacity: 0.15
                });

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
                wireMeshes.push(node);
            }
        });

        animatedWireframeMeshes.current = wireMeshes;
        setWireframeScene(wireScene);

        // Compute original bounding box of the un-transformed scene
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // Target a consistent tree height of 5.5 units in our 3D world space
        const targetHeight = 5.5;
        const scaleFactor = targetHeight / (size.y || 1);
        
        setScale([scaleFactor, scaleFactor, scaleFactor]);
        setTreeOffset([center.x, box.min.y, center.z]);
        
        // Align base to the bottom anchor (-2.4) and position it to the left of center (X = -1.5)
        const nextPos: [number, number, number] = [-1.5, -2.4, 0];
        setPosition(nextPos);
    }, [scene]);

    // Animate materials
    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        
        const isMouseActive = mouseActiveRef.current ?? false;
        let hasIntersection = false;
        const intersectionPoint = new THREE.Vector3();

        if (isMouseActive && mouseRef.current) {
            state.raycaster.setFromCamera(mouseRef.current, state.camera);
            const intersects = state.raycaster.intersectObjects(animatedMeshes.current, true);
            if (intersects.length > 0) {
                hasIntersection = true;
                intersectionPoint.copy(intersects[0].point);
            }
        }

        const decayRate = 0.1;
        // Decay opacities of the trail points (index 1 to 63, and index 0 if not active/no intersection)
        for (let i = 0; i < 64; i++) {
            if (i > 0 || !hasIntersection) {
                trailOpacities.current[i] = Math.max(0.0, trailOpacities.current[i] - delta * decayRate);
            }
        }

        // Position tracking for the active point
        if (hasIntersection) {
            // If the active point was fully faded, or is uninitialized, snap it directly to avoid a long lerp trail
            if (trailOpacities.current[0] <= 0.0 || currentMousePos.current.x < -9000) {
                currentMousePos.current.copy(intersectionPoint);
                lastDroppedPos.current.copy(intersectionPoint);
            } else {
                currentMousePos.current.lerp(intersectionPoint, 0.12);
            }
            
            // Check if mouse has moved past threshold to drop a new trail point (in meters)
            const dist = currentMousePos.current.distanceTo(lastDroppedPos.current);
            const threshold = 0.15; // 15 cm in world coords
            
            if (dist > threshold) {
                // Recycle the oldest/most faded point in the pool (indices 1 to 63)
                let bestIndex = 1;
                let minOpacity = trailOpacities.current[1];
                for (let i = 2; i < 64; i++) {
                    if (trailOpacities.current[i] < minOpacity) {
                        minOpacity = trailOpacities.current[i];
                        bestIndex = i;
                    }
                }
                
                trailPoints.current[bestIndex].copy(currentMousePos.current);
                trailOpacities.current[bestIndex] = 1.0;
                lastDroppedPos.current.copy(currentMousePos.current);
            }

            // Active point at index 0 tracks the current mouse position continuously
            trailPoints.current[0].copy(currentMousePos.current);
            trailOpacities.current[0] = 1.0;
        }

        const radius = 1.0;
        const feather = 0.7;

        // Solid meshes: update uniforms
        animatedMeshes.current.forEach((mesh) => {
            const mat = mesh.material as any;
            if (mat && mat.userData?.shader) {
                mat.userData.shader.uniforms.uTime.value = time;
                if (mat.userData.shader.uniforms.uMousePoints) {
                    mat.userData.shader.uniforms.uMousePoints.value = [...trailPoints.current];
                }
                if (mat.userData.shader.uniforms.uMouseOpacities) {
                    mat.userData.shader.uniforms.uMouseOpacities.value = [...trailOpacities.current];
                }
                if (mat.userData.shader.uniforms.uRadius) {
                    mat.userData.shader.uniforms.uRadius.value = radius;
                }
                if (mat.userData.shader.uniforms.uFeather) {
                    mat.userData.shader.uniforms.uFeather.value = feather;
                }
            }
        });

        // Wireframe meshes: update time uniform
        animatedWireframeMeshes.current.forEach((mesh) => {
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
            rotation={[0.12, Math.PI / 2, -0.08]} // Rotate 90 deg so ferns face front, with rightward tilt
        >
            {/* Center the tree inside a subgroup so local coordinates match tags */}
            <group position={[-treeOffset[0], -treeOffset[1], -treeOffset[2]]}>
                <primitive object={scene} />
                {wireframeScene && <primitive object={wireframeScene} />}
            </group>
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
            angle: 0.12, // Starting angle
            radius: 3.6, // Constant zoom level
            y: -1.4,     // Base height
            look: new THREE.Vector3(-1.5, -1.6, 0)
        },
        {
            pct: 0.33,
            angle: 0.18, // Extremely subtle rotation
            radius: 3.6,
            y: -0.6,     // Floating up the trunk
            look: new THREE.Vector3(-1.5, -0.8, 0)
        },
        {
            pct: 0.66,
            angle: 0.24, // Continuing subtle rotation
            radius: 3.6,
            y: 0.2,      // Approaching foliage
            look: new THREE.Vector3(-1.5, 0.0, 0)
        },
        {
            pct: 1.0,
            angle: 0.30, // Max subtle rotation (about 10 degrees total)
            radius: 3.6,
            y: 1.0,      // Reached upper canopy
            look: new THREE.Vector3(-1.5, 0.8, 0)
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
    const mouseRef = useRef(new THREE.Vector2(0, 0));
    const mouseActiveRef = useRef(false); // set to false initially until mouse moves in
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

        const handlePointerMove = (event: PointerEvent) => {
            mouseActiveRef.current = true;
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;
            mouseRef.current.set(x, y);
        };

        const handlePointerLeave = () => {
            mouseActiveRef.current = false;
        };

        const handlePointerEnter = () => {
            mouseActiveRef.current = true;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
        window.addEventListener('pointerenter', handlePointerEnter, { passive: true });
        document.addEventListener('mouseleave', handlePointerLeave, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerleave', handlePointerLeave);
            window.removeEventListener('pointerenter', handlePointerEnter);
            document.removeEventListener('mouseleave', handlePointerLeave);
        };
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
                    <CedarTreeModel 
                        scrollPercentRef={scrollPercentRef} 
                        mouseRef={mouseRef} 
                        mouseActiveRef={mouseActiveRef} 
                    />
                </Suspense>
                
                <CameraScrollController scrollPercentRef={scrollPercentRef} />
            </Canvas>
        </div>
    );
}

// Preload model asset for immediate loading
useGLTF.preload('/models/two_cedar_trees.glb');
