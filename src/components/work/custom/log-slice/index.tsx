"use client";

import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// --- Custom Shaders ---

// Cap (Wood Rings) Vertex Shader
const capVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Cap (Wood Rings) Fragment Shader
// Matches the iridescent color and mouse paint trail of the main tree trunk
const capFragmentShader = `
uniform float uTime;
uniform vec3 uMousePoints[64];
uniform float uMouseOpacities[64];
uniform float uRadius;
uniform float uFeather;
uniform vec3 uAmbientPoint;
uniform float uAmbientRadius;
uniform float uAmbientFeather;
uniform float uAmbientOpacity;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    vec2 uvCentered = vUv - vec2(0.5);
    float r = length(uvCentered) * 2.0; // r from 0 (center) to 1 (outer edge)
    
    float angle = 0.0;
    if (length(uvCentered) > 0.0001) {
        angle = atan(uvCentered.y, uvCentered.x);
    }
    
    // Warp growth rings
    float warp = sin(angle * 8.0) * 0.03 * sin(r * 8.0) + cos(angle * 3.0) * 0.015;
    float warpedR = r + warp;
    
    // Concentric growth rings
    float ringVal = sin(warpedR * 42.0 + sin(warpedR * 8.0) * 0.4);
    float grain = sin(warpedR * 280.0) * 0.06 * (0.4 + 0.6 * abs(sin(angle * 3.0)));
    
    vec3 heartwood = vec3(0.66, 0.44, 0.28);
    vec3 sapwood = vec3(0.85, 0.75, 0.60);
    vec3 ringColor = vec3(0.38, 0.23, 0.13);
    vec3 barkColor = vec3(0.12, 0.08, 0.07);
    
    vec3 wood = mix(heartwood, sapwood, smoothstep(0.25, 0.82, warpedR));
    float ringMask = 1.0 - smoothstep(-0.2, 0.2, ringVal);
    wood = mix(wood, ringColor, ringMask * 0.4 * (1.0 - smoothstep(0.92, 0.96, warpedR)));
    wood += vec3(grain);
    wood = mix(wood, barkColor, smoothstep(0.94, 0.98, warpedR));
    
    // Mouse paint mask in 3D world space
    float finalMask = 0.0;
    for (int i = 0; i < 64; i++) {
        float dist = distance(vWorldPosition, uMousePoints[i]);
        float mask = 1.0 - smoothstep(uRadius - uFeather, uRadius, dist);
        finalMask = max(finalMask, mask * uMouseOpacities[i]);
    }
    float ambientDist = distance(vWorldPosition, uAmbientPoint);
    float ambientMask = (1.0 - smoothstep(uAmbientRadius - uAmbientFeather, uAmbientRadius, ambientDist)) * uAmbientOpacity;
    
    float totalMask = max(finalMask, ambientMask);
    if (totalMask < 0.01) discard;
    
    // Iridescent color warping
    vec3 p = vWorldPosition;
    float warpX = sin(p.y * 1.8 + uTime * 0.4) * 0.4 + cos(p.z * 1.5 - uTime * 0.3) * 0.3;
    float warpY = cos(p.x * 2.0 + uTime * 0.3) * 0.4 + sin(p.z * 1.8 + uTime * 0.5) * 0.3;
    float warpZ = sin(p.y * 2.2 - uTime * 0.5) * 0.4 + cos(p.x * 1.6 + uTime * 0.4) * 0.3;
    vec3 warpedPos = p + vec3(warpX, warpY, warpZ) * 0.6;
    float detailWarp = sin(warpedPos.x * 4.5 + uTime * 0.8) * 0.15 
                     + cos(warpedPos.y * 5.0 - uTime * 0.7) * 0.15
                     + sin(warpedPos.z * 4.8 + uTime * 0.9) * 0.15;
    float flow = warpedPos.y * 0.25 - uTime * 0.08 + detailWarp * 0.4;
    
    float h1 = fract(flow + sin(warpedPos.x * 1.2 + uTime * 0.15) * 0.3);
    float h2 = fract(warpedPos.z * 0.2 + uTime * 0.05 + cos(warpedPos.y * 0.8 - uTime * 0.1) * 0.2);
    float mixFactor = 0.5 + 0.3 * sin(uTime * 0.22 + warpedPos.y * 0.5);
    float h = fract(mix(h1, h2, mixFactor) * 3.5);
    
    vec3 psychColor = vec3(0.55) + vec3(0.45) * cos(
        6.28318 * (h * vec3(1.0, 1.0, 1.0) + vec3(0.0, 0.33, 0.67))
    );
    
    vec3 base = wood * (vec3(0.4) + max(dot(vNormal, normalize(vec3(5.0, 10.0, 5.0))), 0.0) * vec3(1.1));
    vec3 blended = mix(base, mix(base, psychColor, 0.55), totalMask);
    float edgeGlow = smoothstep(0.0, 0.5, totalMask) * (1.0 - smoothstep(0.5, 1.0, totalMask));
    blended += psychColor * edgeGlow * 0.2;
    
    gl_FragColor = vec4(blended, totalMask);
}
`;

// Helper for smooth interpolation (Hermite cubic)
function smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

// Clones the GLTF scene and configures materials (either Iridescent Solid or Zinc-800 Wireframe)
// Identical logic to the main TreeBackground3D component to ensure styling consistency
function createClippedScene(
    scene: THREE.Group,
    planes: THREE.Plane[],
    isWireframe: boolean,
    animatedMeshesRef: React.MutableRefObject<THREE.Mesh[]>,
    wireframeMeshesRef: React.MutableRefObject<THREE.Mesh[]>
) {
    const cloned = scene.clone();
    cloned.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            if (isWireframe) {
                const mat = new THREE.MeshBasicMaterial({
                    color: new THREE.Color("#27272a"), // Zinc 800 dark gray
                    wireframe: true,
                    transparent: true,
                    opacity: 0.15
                });
                mat.clippingPlanes = planes;
                mat.clipShadows = true;

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
                        
                        // High-frequency sways
                        float swayX = sin(uTime * 3.5 + position.y * 12.0 + position.z * 10.0) * 0.02;
                        float swayZ = cos(uTime * 3.2 + position.y * 11.0 + position.x * 13.0) * 0.02;
                        
                        // Lock trunk base roots to ground
                        float trunkMask = clamp((position.y + 2.3) / 5.2, 0.0, 1.0);
                        
                        transformed.x += swayX * trunkMask * (0.02 + 0.98 * turbulenceMask);
                        transformed.z += swayZ * trunkMask * (0.02 + 0.98 * turbulenceMask);
                        `
                    );
                    mat.userData.shader = shader;
                };

                node.material = mat;
                wireframeMeshesRef.current.push(node);
            } else {
                // Iridescent Solid Material
                const originalMat = node.material as THREE.MeshStandardMaterial;
                const mat = originalMat.clone();
                mat.roughness = 0.95;
                mat.metalness = 0.05;
                mat.transparent = true;
                mat.depthWrite = true; // Fixes depth sorting transparency overlap glitch
                mat.clippingPlanes = planes;
                mat.clipShadows = true;

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
                        float pocketX = sin(position.x * 2.0 + uTime * 0.3) * cos(position.y * 1.5 - uTime * 0.2);
                        float pocketY = sin(position.y * 1.8 - uTime * 0.4) * cos(position.z * 1.6 + uTime * 0.3);
                        float pocketZ = sin(position.z * 1.4 + uTime * 0.5) * cos(position.x * 2.2 - uTime * 0.4);
                        float turbulenceMask = smoothstep(0.02, 0.45, abs(pocketX * pocketY * pocketZ));
                        float swayX = sin(uTime * 3.5 + position.y * 12.0 + position.z * 10.0) * 0.02;
                        float swayZ = cos(uTime * 3.2 + position.y * 11.0 + position.x * 13.0) * 0.02;
                        float trunkMask = clamp((position.y + 2.3) / 5.2, 0.0, 1.0);
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
                        float ambientDist = distance(distortedPos, uAmbientPoint);
                        float ambientMask = (1.0 - smoothstep(uAmbientRadius - uAmbientFeather, uAmbientRadius, ambientDist)) * uAmbientOpacity;
                        float totalMask = max(finalMask, ambientMask);
                        if (totalMask < 0.01) discard;
                        vec3 p = vWorldPosition;
                        float warpX = sin(p.y * 1.8 + uTime * 0.4) * 0.4 + cos(p.z * 1.5 - uTime * 0.3) * 0.3;
                        float warpY = cos(p.x * 2.0 + uTime * 0.3) * 0.4 + sin(p.z * 1.8 + uTime * 0.5) * 0.3;
                        float warpZ = sin(p.y * 2.2 - uTime * 0.5) * 0.4 + cos(p.x * 1.6 + uTime * 0.4) * 0.3;
                        vec3 warpedPos = p + vec3(warpX, warpY, warpZ) * 0.6;
                        float detailWarp = sin(warpedPos.x * 4.5 + uTime * 0.8) * 0.15 
                                         + cos(warpedPos.y * 5.0 - uTime * 0.7) * 0.15
                                         + sin(warpedPos.z * 4.8 + uTime * 0.9) * 0.15;
                        float flow = warpedPos.y * 0.25 - uTime * 0.08 + detailWarp * 0.4;
                        float h1 = fract(flow + sin(warpedPos.x * 1.2 + uTime * 0.15) * 0.3);
                        float h2 = fract(warpedPos.z * 0.2 + uTime * 0.05 + cos(warpedPos.y * 0.8 - uTime * 0.1) * 0.2);
                        float mixFactor = 0.5 + 0.3 * sin(uTime * 0.22 + warpedPos.y * 0.5);
                        float h = fract(mix(h1, h2, mixFactor) * 3.5);
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
                animatedMeshesRef.current.push(node);
            }
        }
    });
    return cloned;
}

// Centroid helper
function getCentroid(points: THREE.Vector3[]) {
    let sumX = 0;
    let sumZ = 0;
    points.forEach((p) => {
        sumX += p.x;
        sumZ += p.z;
    });
    return { x: sumX / points.length, z: sumZ / points.length };
}

// Algorithmic dynamic tree trunk cross-section detection at yCut height (optimized for 60fps loads)
function computeTrunkCrossSections(scene: THREE.Group, yCut: number) {
    const points: THREE.Vector3[] = [];
    
    scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            const geom = node.geometry;
            const posAttr = geom.getAttribute('position');
            if (!posAttr) return;
            
            node.updateMatrixWorld();
            const tempV = new THREE.Vector3();
            
            const step = Math.max(1, Math.floor(posAttr.count / 400));
            
            for (let i = 0; i < posAttr.count; i += step) {
                tempV.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
                tempV.applyMatrix4(node.matrixWorld);
                
                if (Math.abs(tempV.y - yCut) < 0.08) {
                    const isNearMainTrunk = Math.sqrt(Math.pow(tempV.x - 0.0, 2) + Math.pow(tempV.z - 0.0, 2)) < 0.45;
                    const isNearSecondTrunk = Math.sqrt(Math.pow(tempV.x - 0.65, 2) + Math.pow(tempV.z - (-0.45), 2)) < 0.35;
                    
                    if (isNearMainTrunk || isNearSecondTrunk) {
                        points.push(tempV.clone());
                    }
                }
            }
        }
    });

    if (points.length < 5) {
        return [
            { x: -0.1, z: 0.05, radius: 0.28 },
            { x: 0.75, z: -0.5, radius: 0.14 }
        ];
    }
    
    const clusters: THREE.Vector3[][] = [];
    const threshold = 0.5;
    
    points.forEach((p) => {
        let added = false;
        for (const cluster of clusters) {
            const center = getCentroid(cluster);
            const dist = Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.z - center.z, 2));
            if (dist < threshold) {
                cluster.push(p);
                added = true;
                break;
            }
        }
        if (!added) {
            clusters.push([p]);
        }
    });
    
    return clusters
        .filter((c) => c.length > 2)
        .map((cluster) => {
            const center = getCentroid(cluster);
            let totalDist = 0;
            cluster.forEach((p) => {
                totalDist += Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.z - center.z, 2));
            });
            const radius = totalDist / cluster.length;
            return {
                x: center.x,
                z: center.z,
                radius: radius * 0.88
            };
        })
        .sort((a, b) => b.radius - a.radius);
}

// Helper to extract mesh boundary contour segments intersecting Y = yCut
function getSegmentsAtY(scene: THREE.Group, yCut: number) {
    const segments: Array<{ p1: THREE.Vector2; p2: THREE.Vector2 }> = [];
    const perturbedY = yCut + 1.23456e-5; // avoid vertex-aligned edge cases
    
    scene.updateMatrixWorld(true);
    
    scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            const geom = node.geometry;
            const posAttr = geom.getAttribute('position');
            if (!posAttr) return;
            
            const index = geom.index;
            const matrix = node.matrixWorld;
            
            const vA = new THREE.Vector3();
            const vB = new THREE.Vector3();
            const vC = new THREE.Vector3();
            
            const processTriangle = (idxA: number, idxB: number, idxC: number) => {
                vA.set(posAttr.getX(idxA), posAttr.getY(idxA), posAttr.getZ(idxA)).applyMatrix4(matrix);
                vB.set(posAttr.getX(idxB), posAttr.getY(idxB), posAttr.getZ(idxB)).applyMatrix4(matrix);
                vC.set(posAttr.getX(idxC), posAttr.getY(idxC), posAttr.getZ(idxC)).applyMatrix4(matrix);
                
                const yA = vA.y;
                const yB = vB.y;
                const yC = vC.y;
                
                const min = Math.min(yA, yB, yC);
                const max = Math.max(yA, yB, yC);
                
                if (min < perturbedY && max > perturbedY) {
                    const pts: THREE.Vector2[] = [];
                    
                    const checkEdge = (pStart: THREE.Vector3, pEnd: THREE.Vector3) => {
                        const yStart = pStart.y;
                        const yEnd = pEnd.y;
                        if ((yStart - perturbedY) * (yEnd - perturbedY) < 0) {
                            const t = (perturbedY - yStart) / (yEnd - yStart);
                            const ix = pStart.x + t * (pEnd.x - pStart.x);
                            const iz = pStart.z + t * (pEnd.z - pStart.z);
                            pts.push(new THREE.Vector2(ix, iz));
                        }
                    };
                    
                    checkEdge(vA, vB);
                    checkEdge(vB, vC);
                    checkEdge(vC, vA);
                    
                    if (pts.length === 2) {
                        segments.push({ p1: pts[0], p2: pts[1] });
                    }
                }
            };
            
            if (index) {
                const count = index.count;
                for (let i = 0; i < count; i += 3) {
                    processTriangle(index.array[i], index.array[i+1], index.array[i+2]);
                }
            } else {
                const count = posAttr.count;
                for (let i = 0; i < count; i += 3) {
                    processTriangle(i, i+1, i+2);
                }
            }
        }
    });
    
    return segments;
}

interface CapInfo {
    geometry: THREE.BufferGeometry;
    center: { x: number; z: number };
}

// Stitch intersection points into closed 2D shapes using a robust triangle fan
function computeExactCapGeometries(scene: THREE.Group, yCut: number, trunks: any[]): CapInfo[] {
    const segments = getSegmentsAtY(scene, yCut);
    
    // Extract all unique intersection points
    const allPts: THREE.Vector3[] = [];
    segments.forEach((seg) => {
        allPts.push(new THREE.Vector3(seg.p1.x, yCut, seg.p1.y));
        allPts.push(new THREE.Vector3(seg.p2.x, yCut, seg.p2.y));
    });
    
    console.log(`[Cap Debug] yCut=${yCut.toFixed(4)} totalSegments=${segments.length} totalPoints=${allPts.length}`);
    
    return trunks.map((trunk, idx) => {
        // Filter points for this trunk
        const trunkPts = allPts.filter((p) => {
            const dist = Math.sqrt(Math.pow(p.x - trunk.x, 2) + Math.pow(p.z - trunk.z, 2));
            return dist < trunk.radius * 1.6;
        });
        
        // Deduplicate points within 1mm of each other
        const uniquePts: THREE.Vector3[] = [];
        trunkPts.forEach((p) => {
            const isDuplicate = uniquePts.some(up => up.distanceTo(p) < 0.001);
            if (!isDuplicate) {
                uniquePts.push(p);
            }
        });
        
        console.log(`[Cap Debug] Trunk ${idx}: center=(${trunk.x.toFixed(4)}, ${trunk.z.toFixed(4)}) radius=${trunk.radius.toFixed(4)} filtered=${trunkPts.length} unique=${uniquePts.length}`);
        
        if (uniquePts.length < 3) {
            console.warn(`[Cap Debug] Fallback to circle for trunk ${idx}`);
            // Fallback: return circle geometry
            const geom = new THREE.CircleGeometry(trunk.radius, 64);
            return {
                geometry: geom,
                center: { x: trunk.x, z: trunk.z }
            };
        }
        
        // Compute exact centroid of these points
        let sumX = 0;
        let sumZ = 0;
        uniquePts.forEach((p) => {
            sumX += p.x;
            sumZ += p.z;
        });
        const centerX = sumX / uniquePts.length;
        const centerZ = sumZ / uniquePts.length;
        
        // Calculate radius as average distance to centroid
        let totalD = 0;
        uniquePts.forEach((p) => {
            totalD += Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.z - centerZ, 2));
        });
        const actualRadius = totalD / uniquePts.length;
        
        console.log(`[Cap Debug] Trunk ${idx}: computedCenter=(${centerX.toFixed(4)}, ${centerZ.toFixed(4)}) computedRadius=${actualRadius.toFixed(4)}`);
        
        // Sort points angularly around the centroid
        const sorted = uniquePts
            .map((p) => {
                const angle = Math.atan2(p.z - centerZ, p.x - centerX);
                return { p, angle };
            })
            .sort((a, b) => a.angle - b.angle)
            .map(item => item.p);
            
        // Build custom BufferGeometry with Triangle Fan
        const vertices: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];
        
        // Center vertex
        vertices.push(0, 0, 0);
        uvs.push(0.5, 0.5);
        
        sorted.forEach((p) => {
            const dx = p.x - centerX;
            const dz = p.z - centerZ;
            vertices.push(dx, 0, dz);
            
            // Map UV coordinates relative to actualRadius
            const uvRadius = actualRadius > 0.0001 ? actualRadius : trunk.radius;
            const u = dx / (uvRadius * 2) + 0.5;
            const v = dz / (uvRadius * 2) + 0.5;
            uvs.push(u, v);
        });
        
        const numPoints = sorted.length;
        for (let i = 1; i <= numPoints; i++) {
            const next = i === numPoints ? 1 : i + 1;
            indices.push(0, i, next);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return {
            geometry,
            center: { x: centerX, z: centerZ }
        };
    });
}

interface LogSceneProps {
    scrollPercentRef: React.RefObject<number>;
    mouseRef: React.RefObject<THREE.Vector2>;
    mouseActiveRef: React.RefObject<boolean>;
}

function LogScene({ scrollPercentRef, mouseRef, mouseActiveRef }: LogSceneProps) {
    const { gl } = useThree();
    const { scene } = useGLTF('/models/two_cedar_trees.glb');

    // Enable local clipping on the renderer
    useEffect(() => {
        gl.localClippingEnabled = true;
    }, [gl]);

    // Compute dimensions and offset to center the tree model
    const { scale, treeOffset, yLimitTop, yLimitBottom, trunks } = useMemo(() => {
        const box = new THREE.Box3().setFromObject(scene);
        const boxSize = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        const targetHeight = 5.6;
        const scaleFactor = targetHeight / (boxSize.y || 1);
        
        const sliceCenterY = box.min.y + boxSize.y * 0.18;
        const sliceHalfThickness = boxSize.y * 0.024;
        
        const topCut = sliceCenterY + sliceHalfThickness;
        const bottomCut = sliceCenterY - sliceHalfThickness;
        
        const trunkInfo = computeTrunkCrossSections(scene, sliceCenterY);
        
        return {
            scale: [scaleFactor, scaleFactor, scaleFactor] as [number, number, number],
            treeOffset: [center.x, box.min.y, center.z] as [number, number, number],
            yLimitTop: topCut,
            yLimitBottom: bottomCut,
            trunks: trunkInfo
        };
    }, [scene]);

    // Define Local Clipping Planes
    const localPlaneTop = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -yLimitTop), [yLimitTop]);
    const localPlaneBottom = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), yLimitBottom), [yLimitBottom]);

    const localPlaneSliceTop = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), yLimitTop), [yLimitTop]);
    const localPlaneSliceBottom = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -yLimitBottom), [yLimitBottom]);

    // Define World Clipping Planes
    const worldPlaneTop = useMemo(() => new THREE.Plane(), []);
    const worldPlaneBottom = useMemo(() => new THREE.Plane(), []);
    const worldPlaneSliceTop = useMemo(() => new THREE.Plane(), []);
    const worldPlaneSliceBottom = useMemo(() => new THREE.Plane(), []);

    // Mesh Tracking references for Iridescent Shading + Mouse Paint trails
    const animatedMeshes = useRef<THREE.Mesh[]>([]);
    const animatedWireframeMeshes = useRef<THREE.Mesh[]>([]);

    const currentMousePos = useRef(new THREE.Vector3(-10000, -10000, -10000));
    const trailPoints = useRef<THREE.Vector3[]>(
        Array(64).fill(null).map(() => new THREE.Vector3(-10000, -10000, -10000))
    );
    const trailOpacities = useRef<number[]>(Array(64).fill(0));
    const lastDroppedPos = useRef(new THREE.Vector3(-10000, -10000, -10000));
    const ambientOpacity = useRef(1.0);

    // Create three separate instances of solid and wireframe models, each clipped differently
    const { topSolid, topWire, bottomSolid, bottomWire, sliceSolid, sliceWire } = useMemo(() => {
        animatedMeshes.current = [];
        animatedWireframeMeshes.current = [];

        const tSolid = createClippedScene(scene, [worldPlaneTop], false, animatedMeshes, animatedWireframeMeshes);
        const tWire = createClippedScene(scene, [worldPlaneTop], true, animatedMeshes, animatedWireframeMeshes);

        const bSolid = createClippedScene(scene, [worldPlaneBottom], false, animatedMeshes, animatedWireframeMeshes);
        const bWire = createClippedScene(scene, [worldPlaneBottom], true, animatedMeshes, animatedWireframeMeshes);

        const sSolid = createClippedScene(scene, [worldPlaneSliceTop, worldPlaneSliceBottom], false, animatedMeshes, animatedWireframeMeshes);
        const sWire = createClippedScene(scene, [worldPlaneSliceTop, worldPlaneSliceBottom], true, animatedMeshes, animatedWireframeMeshes);

        return {
            topSolid: tSolid,
            topWire: tWire,
            bottomSolid: bSolid,
            bottomWire: bWire,
            sliceSolid: sSolid,
            sliceWire: sWire
        };
    }, [scene, worldPlaneTop, worldPlaneBottom, worldPlaneSliceTop, worldPlaneSliceBottom]);

    // Component references
    const logGroupRef = useRef<THREE.Group>(null);
    const topGroupRef = useRef<THREE.Group>(null);
    const bottomGroupRef = useRef<THREE.Group>(null);
    const sliceGroupRef = useRef<THREE.Group>(null);

    // Subgroup references (used to fetch the true world matrixWorld including scaling & translations)
    const topSubgroupRef = useRef<THREE.Group>(null);
    const bottomSubgroupRef = useRef<THREE.Group>(null);
    const sliceSubgroupRef = useRef<THREE.Group>(null);

    const smoothScroll = useRef(0);

    // Uniform objects to update in render loops
    const uniforms = useMemo(() => ({
        time: { value: 0 },
        topOpacity: { value: 1.0 },
        bottomOpacity: { value: 1.0 },
        sliceOpacity: { value: 1.0 },
        mousePoints: { value: trailPoints.current },
        mouseOpacities: { value: trailOpacities.current },
        radius: { value: 1.0 },
        feather: { value: 0.7 },
        ambientPoint: { value: new THREE.Vector3(-10000, -10000, -10000) },
        ambientOpacity: { value: 1.0 }
    }), [trailPoints, trailOpacities]);

    // Generate exact outline cap geometries for the trunk cross-sections
    const { topCaps, bottomCaps } = useMemo(() => {
        const topCapInfo = computeExactCapGeometries(scene, yLimitTop, trunks);
        const bottomCapInfo = computeExactCapGeometries(scene, yLimitBottom, trunks);
        return { topCaps: topCapInfo, bottomCaps: bottomCapInfo };
    }, [scene, yLimitTop, yLimitBottom, trunks]);

    // Custom solid and wireframe cap materials (reused across trunks)
    const woodCapMaterialSolid = useMemo(() => {
        const mat = new THREE.ShaderMaterial({
            vertexShader: capVertexShader,
            fragmentShader: capFragmentShader,
            uniforms: {
                uTime: uniforms.time,
                uOpacity: { value: 1.0 },
                uActiveRing: { value: 0 },
                uHighlightGlow: { value: 0.0 },
                uMousePoints: uniforms.mousePoints,
                uMouseOpacities: uniforms.mouseOpacities,
                uRadius: uniforms.radius,
                uFeather: uniforms.feather,
                uAmbientPoint: uniforms.ambientPoint,
                uAmbientRadius: { value: 1.8 },
                uAmbientFeather: { value: 1.3 },
                uAmbientOpacity: uniforms.ambientOpacity
            },
            transparent: true,
            depthWrite: true,
            side: THREE.DoubleSide
        });
        return mat;
    }, [uniforms]);

    const woodCapMaterialWireframe = useMemo(() => {
        const mat = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#27272a"), // Zinc 800 dark gray
            wireframe: true,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        return mat;
    }, []);

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        uniforms.time.value = time;

        // Smooth scroll damping
        const targetScroll = scrollPercentRef.current ?? 0;
        smoothScroll.current = THREE.MathUtils.lerp(smoothScroll.current, targetScroll, 0.08);

        const s = smoothScroll.current;

        // Stage 1: Separation of top & bottom, drawer slide out (Scroll 0.15 -> 0.45)
        const separation = smoothstep(0.15, 0.45, s);
        
        const topOffsetY = separation * 0.45;
        const bottomOffsetY = -separation * 0.45;
        
        // Hide top and bottom segments by scaling them down to 0 in stage 2
        // This avoids transparency depth-sorting render glitches
        const fadeOut = smoothstep(0.52, 0.72, s);
        const segmentScale = 1.0 - fadeOut;

        uniforms.topOpacity.value = 1.0 - fadeOut;
        uniforms.bottomOpacity.value = 1.0 - fadeOut;

        if (topGroupRef.current) {
            topGroupRef.current.position.y = topOffsetY;
            topGroupRef.current.scale.setScalar(segmentScale);
        }
        if (bottomGroupRef.current) {
            bottomGroupRef.current.position.y = bottomOffsetY;
            bottomGroupRef.current.scale.setScalar(segmentScale);
        }

        // Drawer slide out
        const slideOut = smoothstep(0.18, 0.48, s);
        // Stage 2: Slide back to center, zoom, and rotate to face camera (Scroll 0.48 -> 0.78)
        const centerAndRotate = smoothstep(0.48, 0.78, s);

        if (sliceGroupRef.current) {
            const posX = (slideOut * 1.8) * (1.0 - centerAndRotate);
            const posZ = centerAndRotate * 1.5;
            const posY = centerAndRotate * 0.25;

            sliceGroupRef.current.position.set(posX, posY, posZ);

            sliceGroupRef.current.rotation.x = centerAndRotate * (Math.PI / 2);
            sliceGroupRef.current.rotation.y = (s * Math.PI * 0.4) + (time * 0.04) * (1.0 - centerAndRotate);
        }

        // --- UPDATE WORLD CLIPPING PLANES ---
        if (topSubgroupRef.current) {
            topSubgroupRef.current.updateMatrixWorld();
            worldPlaneTop.copy(localPlaneTop).applyMatrix4(topSubgroupRef.current.matrixWorld).normalize();
        }
        
        if (bottomSubgroupRef.current) {
            bottomSubgroupRef.current.updateMatrixWorld();
            worldPlaneBottom.copy(localPlaneBottom).applyMatrix4(bottomSubgroupRef.current.matrixWorld).normalize();
        }
        
        if (sliceSubgroupRef.current) {
            sliceSubgroupRef.current.updateMatrixWorld();
            worldPlaneSliceTop.copy(localPlaneSliceTop).applyMatrix4(sliceSubgroupRef.current.matrixWorld).normalize();
            worldPlaneSliceBottom.copy(localPlaneSliceBottom).applyMatrix4(sliceSubgroupRef.current.matrixWorld).normalize();
        }

        // --- MOUSE RAINBOW TRAIL INTERACTION ---
        const isMouseActive = mouseActiveRef.current ?? false;
        let hasIntersection = false;
        const intersectionPoint = new THREE.Vector3();

        if (isMouseActive) {
            state.raycaster.setFromCamera(mouseRef.current, state.camera);
            const intersects = state.raycaster.intersectObjects(animatedMeshes.current, true);
            if (intersects.length > 0) {
                hasIntersection = true;
                intersectionPoint.copy(intersects[0].point);
            }
        }

        const decayRate = 0.1;
        for (let i = 0; i < 64; i++) {
            if (i > 0 || !hasIntersection) {
                trailOpacities.current[i] = Math.max(0.0, trailOpacities.current[i] - delta * decayRate);
            }
        }

        if (hasIntersection) {
            if (trailOpacities.current[0] <= 0.0 || currentMousePos.current.x < -9000) {
                currentMousePos.current.copy(intersectionPoint);
                lastDroppedPos.current.copy(intersectionPoint);
            } else {
                currentMousePos.current.lerp(intersectionPoint, 0.12);
            }
            
            const dist = currentMousePos.current.distanceTo(lastDroppedPos.current);
            const threshold = 0.15;
            
            if (dist > threshold) {
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

            trailPoints.current[0].copy(currentMousePos.current);
            trailOpacities.current[0] = 1.0;
        }

        // Lissajous ambient spotlight drift
        const radius = 1.0;
        const feather = 0.7;
        const anyTrailActive = trailOpacities.current.some(o => o > 0.05);
        const targetAmbientOpacity = anyTrailActive ? 0.0 : 1.0;
        const ambientLerpSpeed = anyTrailActive ? 3.0 : 0.5;
        ambientOpacity.current = THREE.MathUtils.lerp(ambientOpacity.current, targetAmbientOpacity, 1 - Math.exp(-ambientLerpSpeed * delta));

        const lookY = THREE.MathUtils.lerp(-1.6, 0.8, s);
        const ambientX = Math.sin(time * 0.17) * 0.8 + Math.cos(time * 0.31) * 0.3;
        const ambientY = lookY + Math.sin(time * 0.23 + 1.0) * 0.7 + Math.cos(time * 0.13) * 0.4;
        const ambientZ = Math.sin(time * 0.19 + 2.0) * 0.5 + Math.cos(time * 0.29) * 0.2;
        const ambientPoint = new THREE.Vector3(ambientX, ambientY, ambientZ);

        // Update uniforms for solid iridescent meshes
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

        // Update uniforms for solid iridescent caps
        uniforms.ambientPoint.value = ambientPoint;
        uniforms.ambientOpacity.value = ambientOpacity.current;

        // Update wireframe meshes
        animatedWireframeMeshes.current.forEach((mesh) => {
            const mat = mesh.material as any;
            if (mat && mat.userData?.shader) {
                mat.userData.shader.uniforms.uTime.value = time;
            }
        });

        // Gentle floating of the entire tree assembly
        if (logGroupRef.current) {
            logGroupRef.current.position.y = Math.sin(time * 1.2) * 0.05 - 0.4;
            if (s < 0.48) {
                logGroupRef.current.rotation.y = time * 0.08;
            } else {
                logGroupRef.current.rotation.y = THREE.MathUtils.lerp(logGroupRef.current.rotation.y, 0, 0.1);
            }
        }
    });

    return (
        <group ref={logGroupRef}>
            {/* Top Segment */}
            <group ref={topGroupRef}>
                <group 
                    ref={topSubgroupRef}
                    position={[-treeOffset[0], -treeOffset[1], -treeOffset[2]]} 
                    scale={scale}
                >
                    <primitive object={topSolid} />
                    <primitive object={topWire} />
                    {/* Caps for top segment (pointing downwards) */}
                    {trunks.map((trunk, idx) => {
                        const cap = topCaps[idx];
                        return (
                            <group key={idx}>
                                <mesh 
                                    position={[cap.center.x, yLimitTop, cap.center.z]}
                                    geometry={cap.geometry}
                                    material={woodCapMaterialSolid}
                                />
                                <mesh 
                                    position={[cap.center.x, yLimitTop, cap.center.z]}
                                    geometry={cap.geometry}
                                    material={woodCapMaterialWireframe}
                                />
                            </group>
                        );
                    })}
                </group>
            </group>

            {/* Bottom Segment */}
            <group ref={bottomGroupRef}>
                <group 
                    ref={bottomSubgroupRef}
                    position={[-treeOffset[0], -treeOffset[1], -treeOffset[2]]} 
                    scale={scale}
                >
                    <primitive object={bottomSolid} />
                    <primitive object={bottomWire} />
                    {/* Caps for bottom segment (pointing upwards) */}
                    {trunks.map((trunk, idx) => {
                        const cap = bottomCaps[idx];
                        return (
                            <group key={idx}>
                                <mesh 
                                    position={[cap.center.x, yLimitBottom, cap.center.z]}
                                    geometry={cap.geometry}
                                    material={woodCapMaterialSolid}
                                />
                                <mesh 
                                    position={[cap.center.x, yLimitBottom, cap.center.z]}
                                    geometry={cap.geometry}
                                    material={woodCapMaterialWireframe}
                                />
                            </group>
                        );
                    })}
                </group>
            </group>

            {/* Middle Slice (The Drawer) */}
            <group ref={sliceGroupRef}>
                <group 
                    ref={sliceSubgroupRef}
                    position={[-treeOffset[0], -treeOffset[1], -treeOffset[2]]} 
                    scale={scale}
                >
                    <primitive object={sliceSolid} />
                    <primitive object={sliceWire} />
                    
                    {/* Caps for moving slice (top & bottom are capped) */}
                    {trunks.map((trunk, idx) => {
                        const tCap = topCaps[idx];
                        const bCap = bottomCaps[idx];
                        return (
                            <group key={idx}>
                                {/* Top cap (pointing upwards) */}
                                <mesh 
                                    position={[tCap.center.x, yLimitTop, tCap.center.z]}
                                    geometry={tCap.geometry}
                                    material={woodCapMaterialSolid}
                                />
                                <mesh 
                                    position={[tCap.center.x, yLimitTop, tCap.center.z]}
                                    geometry={tCap.geometry}
                                    material={woodCapMaterialWireframe}
                                />
                                
                                {/* Bottom cap (pointing downwards) */}
                                <mesh 
                                    position={[bCap.center.x, yLimitBottom, bCap.center.z]}
                                    geometry={bCap.geometry}
                                    material={woodCapMaterialSolid}
                                />
                                <mesh 
                                    position={[bCap.center.x, yLimitBottom, bCap.center.z]}
                                    geometry={bCap.geometry}
                                    material={woodCapMaterialWireframe}
                                />
                            </group>
                        );
                    })}
                </group>
            </group>
        </group>
    );
}

export default function LogSliceVisual() {
    const scrollPercentRef = useRef(0);
    const mouseRef = useRef(new THREE.Vector2(0, 0));
    const mouseActiveRef = useRef(false);

    useEffect(() => {
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

        handleScroll(); // Init
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerleave', handlePointerLeave);
            window.removeEventListener('pointerenter', handlePointerEnter);
            document.removeEventListener('mouseleave', handlePointerLeave);
        };
    }, []);

    return (
        <div className="w-full h-full min-h-[60vh] bg-white relative flex items-center justify-center overflow-hidden">
            {/* Ambient Background Glow Grid */}
            <div className="absolute inset-0 bg-white pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-100" />

            {/* Scroll Indicator helper */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10 select-none">
                <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-black/40">Scroll to slice core trunk</span>
                <div className="w-4 h-8 border border-black/20 rounded-full flex justify-center p-1">
                    <div className="w-1 h-2 bg-black/40 rounded-full animate-bounce" />
                </div>
            </div>

            <Canvas
                camera={{ position: [0, 0, 5.2], fov: 42 }}
                dpr={[1, 1.5]}
                gl={{ 
                    antialias: true,
                    localClippingEnabled: true // Enable local clipping at WebGL Renderer level
                }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 8, 5]} intensity={1.8} />
                <directionalLight position={[-5, -4, -2]} intensity={0.4} />
                <pointLight position={[0, 1, 3]} intensity={0.8} />

                <Suspense fallback={null}>
                    <LogScene 
                        scrollPercentRef={scrollPercentRef} 
                        mouseRef={mouseRef}
                        mouseActiveRef={mouseActiveRef}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}

// Preload model asset for immediate loading
useGLTF.preload('/models/two_cedar_trees.glb');
