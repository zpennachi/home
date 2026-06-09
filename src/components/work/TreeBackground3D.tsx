"use client";

import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const TREE_X = -1.6;

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
    const ambientOpacity = useRef(1.0);

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
                    shader.uniforms.uAmbientPoint = { value: new THREE.Vector3(-10000, -10000, -10000) };
                    shader.uniforms.uAmbientRadius = { value: 1.8 };
                    shader.uniforms.uAmbientFeather = { value: 1.3 };
                    shader.uniforms.uAmbientOpacity = { value: 1.0 };
                    
                    shader.vertexShader = `
                        uniform float uTime;
                        varying vec3 vWorldPosition;
                    ` + shader.vertexShader;
                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `
                        #include <begin_vertex>
                        
                        // Localized shifting physical pockets of turbulence
                        float pocketX = sin(position.x * 2.0 + uTime * 0.3) * cos(position.y * 1.5 - uTime * 0.2);
                        float pocketY = sin(position.y * 1.8 - uTime * 0.4) * cos(position.z * 1.6 + uTime * 0.3);
                        float pocketZ = sin(position.z * 1.4 + uTime * 0.5) * cos(position.x * 2.2 - uTime * 0.4);
                        float turbulenceMask = smoothstep(0.02, 0.45, abs(pocketX * pocketY * pocketZ));
                        
                        // Much smaller, high-frequency physical sways (fine branch/leaf rustle)
                        float swayX = sin(uTime * 3.5 + position.y * 12.0 + position.z * 10.0) * 0.02;
                        float swayZ = cos(uTime * 3.2 + position.y * 11.0 + position.x * 13.0) * 0.02;
                        
                        // Height mask to lock the base trunk roots to the ground
                        float trunkMask = clamp((position.y + 2.3) / 5.2, 0.0, 1.0);
                        
                        // Apply displacement only in the slow-moving wandering turbulent areas
                        transformed.x += swayX * trunkMask * (0.02 + 0.98 * turbulenceMask);
                        transformed.z += swayZ * trunkMask * (0.02 + 0.98 * turbulenceMask);
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
                        uniform vec3 uAmbientPoint;
                        uniform float uAmbientRadius;
                        uniform float uAmbientFeather;
                        uniform float uAmbientOpacity;
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
                        
                        // Mouse paint mask
                        float finalMask = 0.0;
                        for (int i = 0; i < 64; i++) {
                            float dist = distance(distortedPos, uMousePoints[i]);
                            float mask = 1.0 - smoothstep(uRadius - uFeather, uRadius, dist);
                            finalMask = max(finalMask, mask * uMouseOpacities[i]);
                        }
                        
                        // Ambient wandering spotlight mask
                        float ambientDist = distance(distortedPos, uAmbientPoint);
                        float ambientMask = (1.0 - smoothstep(uAmbientRadius - uAmbientFeather, uAmbientRadius, ambientDist)) * uAmbientOpacity;
                        
                        // Combined mask: mouse paint OR ambient wander
                        float totalMask = max(finalMask, ambientMask);
                        if (totalMask < 0.01) discard;

                        // --- Psychedelic iridescent color overlay (intricate domain-warped coordinates) ---
                        vec3 p = vWorldPosition;
                        
                        // Layer 1: Slow, large-scale organic fluid currents
                        float warpX = sin(p.y * 1.8 + uTime * 0.4) * 0.4 + cos(p.z * 1.5 - uTime * 0.3) * 0.3;
                        float warpY = cos(p.x * 2.0 + uTime * 0.3) * 0.4 + sin(p.z * 1.8 + uTime * 0.5) * 0.3;
                        float warpZ = sin(p.y * 2.2 - uTime * 0.5) * 0.4 + cos(p.x * 1.6 + uTime * 0.4) * 0.3;
                        vec3 warpedPos = p + vec3(warpX, warpY, warpZ) * 0.6;
                        
                        // Layer 2: High-frequency intricate ripples (adds detailed texture)
                        float detailWarp = sin(warpedPos.x * 4.5 + uTime * 0.8) * 0.15 
                                         + cos(warpedPos.y * 5.0 - uTime * 0.7) * 0.15
                                         + sin(warpedPos.z * 4.8 + uTime * 0.9) * 0.15;
                                         
                        // Combine frequencies for organic flow direction
                        float flow = warpedPos.y * 0.25 - uTime * 0.08 + detailWarp * 0.4;
                        
                        // Multi-axis evolving waves
                        float h1 = fract(flow + sin(warpedPos.x * 1.2 + uTime * 0.15) * 0.3);
                        float h2 = fract(warpedPos.z * 0.2 + uTime * 0.05 + cos(warpedPos.y * 0.8 - uTime * 0.1) * 0.2);
                        
                        // Time-evolving blending factor that shifts with height
                        float mixFactor = 0.5 + 0.3 * sin(uTime * 0.22 + warpedPos.y * 0.5);
                        // Multiply by 3.5 to create more frequent wrapping boundaries (harsh color change lines)
                        float h = fract(mix(h1, h2, mixFactor) * 3.5);
                        
                        // Smooth cosine palette: no branching, perfectly continuous gradients
                        // rgb = a + b * cos(2π * (c * t + d))
                        vec3 psychColor = vec3(0.55) + vec3(0.45) * cos(
                            6.28318 * (h * vec3(1.0, 1.0, 1.0) + vec3(0.0, 0.33, 0.67))
                        );

                        vec3 base = gl_FragColor.rgb;
                        vec3 blended = mix(base, mix(base, psychColor, 0.55), totalMask);
                        float edgeGlow = smoothstep(0.0, 0.5, totalMask) * (1.0 - smoothstep(0.5, 1.0, totalMask));
                        blended += psychColor * edgeGlow * 0.2;
                        
                        gl_FragColor.rgb = blended;
                        gl_FragColor.a *= totalMask;
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
                        
                        // Localized shifting physical pockets of turbulence
                        float pocketX = sin(position.x * 2.0 + uTime * 0.3) * cos(position.y * 1.5 - uTime * 0.2);
                        float pocketY = sin(position.y * 1.8 - uTime * 0.4) * cos(position.z * 1.6 + uTime * 0.3);
                        float pocketZ = sin(position.z * 1.4 + uTime * 0.5) * cos(position.x * 2.2 - uTime * 0.4);
                        float turbulenceMask = smoothstep(0.02, 0.45, abs(pocketX * pocketY * pocketZ));
                        
                        // Much smaller, high-frequency physical sways (fine branch/leaf rustle)
                        float swayX = sin(uTime * 3.5 + position.y * 12.0 + position.z * 10.0) * 0.02;
                        float swayZ = cos(uTime * 3.2 + position.y * 11.0 + position.x * 13.0) * 0.02;
                        
                        // Height mask to lock the base trunk roots to the ground
                        float trunkMask = clamp((position.y + 2.3) / 5.2, 0.0, 1.0);
                        
                        // Apply displacement only in the slow-moving wandering turbulent areas
                        transformed.x += swayX * trunkMask * (0.02 + 0.98 * turbulenceMask);
                        transformed.z += swayZ * trunkMask * (0.02 + 0.98 * turbulenceMask);
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
        
        // Target a consistent tree height of 5.6 units in our 3D world space (zoomed in a bit)
        const targetHeight = 5.6;
        const scaleFactor = targetHeight / (size.y || 1);
        
        setScale([scaleFactor, scaleFactor, scaleFactor]);
        setTreeOffset([center.x, box.min.y, center.z]);
        
        // Align base to the bottom anchor (-2.4) and position it to the left of center (X = TREE_X)
        const nextPos: [number, number, number] = [TREE_X, -2.4, 0];
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

        // Fade ambient out when user is actively painting, fade back in when idle
        const anyTrailActive = trailOpacities.current.some(o => o > 0.05);
        const targetAmbientOpacity = anyTrailActive ? 0.0 : 1.0;
        const ambientLerpSpeed = anyTrailActive ? 3.0 : 0.5; // fade out fast, fade in slowly
        ambientOpacity.current = THREE.MathUtils.lerp(ambientOpacity.current, targetAmbientOpacity, 1 - Math.exp(-ambientLerpSpeed * delta));

        // Ambient wandering spotlight: Lissajous drift around the camera's lookAt target on the tree
        const scrollPercent = scrollPercentRef.current ?? 0;
        // Camera looks at Y ranging from -1.6 to 0.8 based on scroll, X = TREE_X
        const lookY = THREE.MathUtils.lerp(-1.6, 0.8, scrollPercent);
        const ambientX = TREE_X + Math.sin(time * 0.17) * 0.8 + Math.cos(time * 0.31) * 0.3;
        const ambientY = lookY + Math.sin(time * 0.23 + 1.0) * 0.7 + Math.cos(time * 0.13) * 0.4;
        const ambientZ = Math.sin(time * 0.19 + 2.0) * 0.5 + Math.cos(time * 0.29) * 0.2;
        const ambientPoint = new THREE.Vector3(ambientX, ambientY, ambientZ);

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
                if (mat.userData.shader.uniforms.uAmbientPoint) {
                    mat.userData.shader.uniforms.uAmbientPoint.value = ambientPoint;
                }
                if (mat.userData.shader.uniforms.uAmbientOpacity) {
                    mat.userData.shader.uniforms.uAmbientOpacity.value = ambientOpacity.current;
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
    
    // Smooth targets for camera tracking (starts looking down at ground/grass)
    const targetPos = useRef(new THREE.Vector3(1.44, -0.4, 1.74));
    const targetLookAt = useRef(new THREE.Vector3(TREE_X, -1.6, 0));
    
    // Smooth tracking ref for lookAt target to avoid sudden orientation flips
    const currentLookAt = useRef(new THREE.Vector3(TREE_X, -1.6, 0));

    // Dynamic keyframe definitions based on scroll position (0 to 1)
    // Starts angled down at the grass/trunk base, levels out, then climbs up to the canopy
    const cameraKeyframes = useMemo(() => [
        {
            pct: 0.0,
            angle: 0.3,   // Start at the ground/trunk base, zoomed out more
            radius: 3.8,  // Zoomed out to avoid feeling too close/zoomed in
            y: -1.8,
            look: new THREE.Vector3(TREE_X, 0.4, 0) // Look up the tree
        },
        {
            pct: 0.4,     // Climb up the trunk
            angle: 0.1,
            radius: 3.8,  // Zoomed out
            y: -0.2,
            look: new THREE.Vector3(TREE_X, 1.2, 0) // Pointing up ahead
        },
        {
            pct: 0.7,     // Enter lower branches, zooming out further
            angle: 0.6,
            radius: 4.2,  // Zoomed out
            y: 0.8,
            look: new THREE.Vector3(TREE_X, 1.8, 0)
        },
        {
            pct: 1.0,     // Top of the canopy framing
            angle: 1.2,
            radius: 4.6,  // Zoomed out
            y: 2.2,
            look: new THREE.Vector3(TREE_X, 0.6, 0)
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

        // Reconstruct camera Cartesian target coordinates orbiting around the tree center (X = TREE_X)
        targetPos.current.set(
            TREE_X + radius * Math.sin(angle),
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

interface TreeBackground3DProps {
    mode?: 'scroll' | 'static';
    scrollPercent?: number;
    interactive?: boolean;
}

export default function TreeBackground3D({ mode = 'scroll', scrollPercent, interactive = false }: TreeBackground3DProps) {
    const scrollPercentRef = useRef(0);
    const mouseRef = useRef(new THREE.Vector2(0, 0));
    const mouseActiveRef = useRef(false); // set to false initially until mouse moves in
    const [mounted, setMounted] = useState(false);

    // Keep track of a stable random percent if none is passed
    const stableRandomPct = useRef(Math.random());

    // Determine the active static percentage
    const activeStaticPct = scrollPercent !== undefined ? scrollPercent : stableRandomPct.current;

    // Track scroll positions and handle scroll boundaries
    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            if (mode === 'static') {
                scrollPercentRef.current = activeStaticPct;
                return;
            }
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const currentPct = window.scrollY / totalHeight;
                scrollPercentRef.current = currentPct;
            }
        };

        // Initialize position
        if (mode === 'static') {
            scrollPercentRef.current = activeStaticPct;
        } else {
            handleScroll();
        }

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
    }, [mode, activeStaticPct]);

    if (!mounted) return null;

    return (
        <div 
            className={`fixed inset-0 w-full h-full z-0 transition-opacity duration-1000 ${
                interactive 
                    ? "pointer-events-auto opacity-100" 
                    : "pointer-events-none opacity-50 md:opacity-100"
            }`}
        >
            <Canvas
                dpr={[1, 1.5]}
                gl={{
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                    alpha: true,
                    antialias: true
                }}
                camera={{ position: [1.44, -0.4, 1.74], fov: 45 }}
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
                
                {!interactive && <CameraScrollController scrollPercentRef={scrollPercentRef} />}
                {interactive && (
                    <OrbitControls 
                        makeDefault 
                        target={[TREE_X, -0.5, 0]} 
                        enableZoom={true} 
                        enablePan={true} 
                        enableDamping={true} 
                        dampingFactor={0.05} 
                        minDistance={2}
                        maxDistance={8}
                    />
                )}
            </Canvas>
        </div>
    );
}

// Preload model asset for immediate loading
useGLTF.preload('/models/two_cedar_trees.glb');
