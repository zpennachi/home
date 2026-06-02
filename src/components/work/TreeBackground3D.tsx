"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Class/Type representing a generated branch
interface BranchNode {
    id: string;
    start: THREE.Vector3;
    end: THREE.Vector3;
    rotation: THREE.Euler;
    length: number;
    radius: number;
    depth: number;
}

// Generate the tree structure procedurally once on load
function generateProceduralTree(
    start: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    radius: number,
    depth: number,
    maxDepth: number,
    nodes: BranchNode[] = []
): BranchNode[] {
    const end = start.clone().add(direction.clone().multiplyScalar(length));
    
    // Euler rotation representing the direction
    const rotation = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())
    );

    nodes.push({
        id: `branch-${depth}-${nodes.length}`,
        start,
        end,
        rotation,
        length,
        radius,
        depth
    });

    if (depth < maxDepth) {
        const childBranches = depth === 0 ? 3 : 2; // Split trunk into 3, sub-branches into 2
        for (let i = 0; i < childBranches; i++) {
            // Diverge branches outward with some organic noise
            const angle = 0.35 + Math.random() * 0.15; // Dilation angle
            const rotAngle = (i * (Math.PI * 2)) / childBranches + (Math.random() - 0.5) * 0.5;

            const childDir = new THREE.Vector3(0, 1, 0)
                .applyAxisAngle(new THREE.Vector3(1, 0, 0), angle)
                .applyAxisAngle(new THREE.Vector3(0, 1, 0), rotAngle)
                .applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()))
                .normalize();

            // Decay length and thickness
            generateProceduralTree(
                end,
                childDir,
                length * 0.72,
                radius * 0.65,
                depth + 1,
                maxDepth,
                nodes
            );
        }
    }
    return nodes;
}

function MatteTree({ accentColor }: { accentColor: string }) {
    const maxDepth = 4;
    const treeData = useMemo(() => {
        return generateProceduralTree(
            new THREE.Vector3(0, 0, 0), // Base position
            new THREE.Vector3(0, 1, 0), // Grow straight up
            2.5,                        // Trunk length
            0.15,                       // Trunk radius
            0,                          // Initial depth
            maxDepth
        );
    }, []);

    // Theme responsive material colors
    const [foregroundHex, setForegroundHex] = useState("#000000");

    useEffect(() => {
        const getColors = () => {
            const style = getComputedStyle(document.documentElement);
            const fg = style.getPropertyValue('--foreground').trim();
            if (fg) setForegroundHex(fg);
        };
        getColors();
        const obs = new MutationObserver(getColors);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
        return () => obs.disconnect();
    }, []);

    return (
        <group position={[0, -1.8, 0]}>
            {treeData.map((node) => {
                // Calculate midpoint position for cylinder placement
                const midpoint = node.start.clone().add(node.end).multiplyScalar(0.5);

                return (
                    <group key={node.id}>
                        {/* Render the Branch Cylinder */}
                        <mesh position={midpoint} rotation={node.rotation}>
                            <cylinderGeometry args={[node.radius * 0.7, node.radius, node.length, 12]} />
                            <meshStandardMaterial
                                color={foregroundHex}
                                roughness={0.9}
                                metalness={0.05}
                            />
                        </mesh>

                        {/* If it's a leaf node, render a cluster of organic matte accent leaf balls */}
                        {node.depth === maxDepth && (
                            <group position={node.end}>
                                <mesh scale={node.radius * 16}>
                                    <dodecahedronGeometry args={[1]} />
                                    <meshStandardMaterial
                                        color={accentColor}
                                        roughness={0.9}
                                        metalness={0.05}
                                    />
                                </mesh>
                                {/* Secondary offset leaf cluster */}
                                <mesh position={[0.15, 0.1, -0.1]} scale={node.radius * 11}>
                                    <dodecahedronGeometry args={[1]} />
                                    <meshStandardMaterial
                                        color={accentColor}
                                        roughness={0.9}
                                        metalness={0.05}
                                    />
                                </mesh>
                            </group>
                        )}
                    </group>
                );
            })}
        </group>
    );
}

// Camera framing and scroll control orchestrator
function CameraScrollController({ scrollPercent }: { scrollPercent: number }) {
    const { camera } = useThree();
    
    // Target position and lookAt points
    const targetPos = useRef(new THREE.Vector3(0, 2.5, 3.5));
    const targetLookAt = useRef(new THREE.Vector3(0, 2.2, 0));

    // Dynamic keyframe definitions based on scroll position (0 to 1)
    const cameraKeyframes = useMemo(() => [
        {
            pct: 0.0, // Hero: Top Canopy close-up
            pos: new THREE.Vector3(0.4, 2.2, 3.2),
            look: new THREE.Vector3(0, 1.8, 0)
        },
        {
            pct: 0.33, // Manifesto: Upper branches / side profile
            pos: new THREE.Vector3(-1.8, 1.2, 3.5),
            look: new THREE.Vector3(-0.3, 0.8, 0)
        },
        {
            pct: 0.66, // Tech Stack: Trunk split / wide right angle
            pos: new THREE.Vector3(2.2, 0.2, 3.8),
            look: new THREE.Vector3(0.2, -0.2, 0)
        },
        {
            pct: 1.0, // Selected Works: Root up-perspective
            pos: new THREE.Vector3(0.0, -1.8, 5.5),
            look: new THREE.Vector3(0, 0.4, 0)
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

        // Interpolate position and look-at target
        targetPos.current.copy(startKey.pos).lerp(endKey.pos, t);
        targetLookAt.current.copy(startKey.look).lerp(endKey.look, t);

        // Frame-rate independent smooth camera tracking (lerp damping)
        const lerpFactor = 1 - Math.exp(-6 * delta); // smooth follow speed
        camera.position.lerp(targetPos.current, lerpFactor);

        // Update target looking vector smoothly
        const currentLookTarget = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(camera.quaternion)
            .add(camera.position);

        currentLookTarget.lerp(targetLookAt.current, lerpFactor);
        camera.lookAt(currentLookTarget);
    });

    return null;
}

export default function TreeBackground3D() {
    const [scrollPercent, setScrollPercent] = useState(0);
    const [accentColor, setAccentColor] = useState("#ff0000");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                setScrollPercent(window.scrollY / totalHeight);
            }
        };

        const getAccent = () => {
            const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
            if (accent) setAccentColor(accent);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        getAccent();

        const observer = new MutationObserver(getAccent);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
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
                camera={{ position: [0, 2.5, 3.5], fov: 45 }}
            >
                <ambientLight intensity={1.4} />
                <directionalLight position={[6, 10, 6]} intensity={1.8} />
                <directionalLight position={[-6, -6, -2]} intensity={0.4} />
                <pointLight position={[0, 2, 4]} intensity={0.6} />

                <MatteTree accentColor={accentColor} />
                <CameraScrollController scrollPercent={scrollPercent} />
            </Canvas>
        </div>
    );
}
