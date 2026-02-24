"use client";

import { useMemo } from 'react'
import * as THREE from 'three'
import { renderVert, renderFrag } from './shaders'

const SIM_SIZE = 128

export function Particles({ simulationRef }: { simulationRef?: any }) {

    // Generate UV reference coordinates for particles
    const geometry = useMemo(() => {
        const geom = new THREE.BufferGeometry()
        const positions = new Float32Array(SIM_SIZE * SIM_SIZE * 3) // Actual positions not used, just count
        const references = new Float32Array(SIM_SIZE * SIM_SIZE * 2) // UVs to lookup FBO

        for (let i = 0; i < SIM_SIZE; i++) {
            for (let j = 0; j < SIM_SIZE; j++) {
                const index = i * SIM_SIZE + j

                // Ref: uv coordinates (0.0 to 1.0)
                references[index * 2] = (i + 0.5) / SIM_SIZE
                references[index * 2 + 1] = (j + 0.5) / SIM_SIZE

                positions[index * 3] = 0
                positions[index * 3 + 1] = 0
                positions[index * 3 + 2] = 0
            }
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geom.setAttribute('reference', new THREE.BufferAttribute(references, 2))
        return geom
    }, [])

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uPosition: { value: null }, // Will be injected by Simulation
            uData: { value: null },
            uTime: { value: 0 },
            uBaseSize: { value: 3000.0 }
        },
        vertexShader: renderVert,
        fragmentShader: renderFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    // Expose ref
    // We can pass this ref to Simulation so it updates the uniform
    if (simulationRef) {
        simulationRef.current = material
    }

    return (
        <points geometry={geometry} material={material} />
    )
}
