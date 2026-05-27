"use client";

import { useMemo, useEffect, useRef } from 'react'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import * as THREE from 'three'
import { simPositionFrag, simVelocityFrag, simStateFrag } from './shaders'

// Dimension of the particle texture (e.g., 128x128 = 16k particles)
const SIM_SIZE = 128
const WORLD_SIZE = 40

// Helper to generate initial data
const getDataTexture = (size: number) => {
    const count = size * size
    const data = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
        const r = (Math.random() * WORLD_SIZE) - (WORLD_SIZE / 2)
        const g = (Math.random() * WORLD_SIZE) - (WORLD_SIZE / 2)
        const b = (Math.random() * WORLD_SIZE) - (WORLD_SIZE / 2) // Z is now active
        const a = Math.random() // age

        const i4 = i * 4
        data[i4] = r
        data[i4 + 1] = g
        data[i4 + 2] = b
        data[i4 + 3] = a
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
    texture.needsUpdate = true
    return texture
}

const getSpeciesTexture = (size: number) => {
    const count = size * size
    const data = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
        // 6 Species: 0, 1, 2, 3, 4, 5
        const species = Math.floor(Math.random() * 6)

        const i4 = i * 4
        data[i4] = species
        data[i4 + 1] = 0 // Unused
        data[i4 + 2] = 0 // Unused
        data[i4 + 3] = 0 // Unused
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
    texture.needsUpdate = true
    return texture
}

const getRuleTexture = () => {
    const size = 6 // 6 species
    const data = new Float32Array(size * size * 4)

    // Initialize random rules
    for (let i = 0; i < size * size; i++) {
        data[i * 4] = (Math.random() * 2 - 1) * 0.5 // R: Strength -0.5 to 0.5
        // G, B, A are unused for now
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
    texture.needsUpdate = true
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    return texture
}

interface SimulationProps {
    particlesRef: React.MutableRefObject<THREE.ShaderMaterial | null>;
    config: {
        speed: number;
        friction: number;
        attraction: number;
        radius: number;
        size: number;
        decay: number;
        repulsion: number;
    };
    onPresetRef?: React.MutableRefObject<(name: string) => void>;
}

export function Simulation({ particlesRef, config, onPresetRef }: SimulationProps) {
    const { gl } = useThree()

    // Destructure config for easier access
    const { speed, friction, attraction, radius, size, decay, repulsion } = config;

    // Rule Presets
    const presets = useMemo(() => ({
        'Balanced': () => {
            const data = new Float32Array(36 * 4)
            for (let i = 0; i < 36; i++) {
                data[i * 4] = (Math.random() * 2 - 1) * 0.5
            }
            return data
        },
        'Chaos': () => {
            const data = new Float32Array(36 * 4)
            for (let i = 0; i < 36; i++) {
                data[i * 4] = (Math.random() * 2 - 1) * 1.5 // Stronger forces
            }
            return data
        },
        'Clusters': () => {
            const data = new Float32Array(36 * 4)
            for (let i = 0; i < 36; i++) {
                data[i * 4] = Math.random() * 1.0 // Mostly attraction
            }
            return data
        },
        'Cells': () => {
            const data = new Float32Array(36 * 4)
            const size = 6
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const k = i * size + j
                    // Self attraction, others repulsion
                    if (i === j) data[k * 4] = 0.5
                    else data[k * 4] = -0.2
                }
            }
            return data
        }
    }), [])

    const dataTextureRef = useRef<THREE.DataTexture | null>(null)
    const rulesTextureRef = useRef<THREE.DataTexture | null>(null)

    const applyPreset = (name: keyof typeof presets) => {
        const data = rulesTextureRef.current?.image.data
        if (data) {
            const newData = presets[name]()
            for (let i = 0; i < newData.length; i++) {
                data[i] = newData[i]
            }
            rulesTextureRef.current!.needsUpdate = true
        }
    }

    // Expose applyPreset via ref
    useEffect(() => {
        if (onPresetRef) {
            onPresetRef.current = (name: string) => {
                if (name in presets) {
                    // @ts-ignore
                    applyPreset(name as keyof typeof presets)
                }
            }
        }
    }, [onPresetRef, applyPreset])

    // Create FBOs
    const valid = gl.capabilities.isWebGL2 || gl.extensions.get('OES_texture_float')
    if (!valid) console.error("Float textures not supported")

    const floatOpts = useMemo(() => ({
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false,
        depthBuffer: false
    }), [])

    // Position Buffers
    const positionFBO1 = useFBO(SIM_SIZE, SIM_SIZE, floatOpts)
    const positionFBO2 = useFBO(SIM_SIZE, SIM_SIZE, floatOpts)

    // Velocity Buffers
    const velocityFBO1 = useFBO(SIM_SIZE, SIM_SIZE, floatOpts)
    const velocityFBO2 = useFBO(SIM_SIZE, SIM_SIZE, floatOpts)

    // State Buffers
    const dataFBO1 = useFBO(SIM_SIZE, SIM_SIZE, floatOpts)
    const dataFBO2 = useFBO(SIM_SIZE, SIM_SIZE, floatOpts)

    // Simulation Scene
    const simScene = useMemo(() => new THREE.Scene(), [])
    const simCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

    // Materials
    const simPosMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uPosition: { value: null },
            uVelocity: { value: null },
            uTime: { value: 0 },
            uDelta: { value: 0 },
            uSpeed: { value: 1.0 },
            uWorldSize: { value: WORLD_SIZE }
        },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
        fragmentShader: simPositionFrag
    }), [])

    const simVelMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uPosition: { value: null },
            uVelocity: { value: null },
            uData: { value: null },
            uRules: { value: null },
            uTime: { value: 0 },
            uDelta: { value: 0 },
            uFriction: { value: 0.5 },
            uWorldSize: { value: WORLD_SIZE },
            uAttraction: { value: 20.0 },
            uRadius: { value: 10.0 },
            uSeed: { value: 0.0 },
            uRepulsion: { value: 2.0 }
        },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
        fragmentShader: simVelocityFrag
    }), [])

    const simStateMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uPosition: { value: null },
            uVelocity: { value: null },
            uData: { value: null },
            uTime: { value: 0 },
            uDelta: { value: 0 },
            uWorldSize: { value: WORLD_SIZE },
            uSeed: { value: 0.0 },
            uDecay: { value: 0.05 }
        },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
        fragmentShader: simStateFrag
    }), [])

    // Mesh
    const simMesh = useMemo(() => new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), [])

    // Initialize and Seed
    useEffect(() => {
        // Seed textures
        const initialPos = getDataTexture(SIM_SIZE)
        const initialVel = getDataTexture(SIM_SIZE)
        const dataTex = getSpeciesTexture(SIM_SIZE)
        const rulesTex = getRuleTexture()

        dataTextureRef.current = dataTex
        rulesTextureRef.current = rulesTex

        // 1. Seed Positions
        simMesh.material = simPosMat
        simPosMat.uniforms.uPosition.value = initialPos
        simPosMat.uniforms.uVelocity.value = initialVel
        simPosMat.uniforms.uSpeed.value = 0

        gl.setRenderTarget(positionFBO1)
        gl.render(simScene, simCamera)
        gl.setRenderTarget(positionFBO2)
        gl.render(simScene, simCamera)

        // 2. Seed Velocities
        simMesh.material = simVelMat
        simVelMat.uniforms.uPosition.value = initialPos
        simVelMat.uniforms.uVelocity.value = initialVel
        simVelMat.uniforms.uData.value = dataTex
        simVelMat.uniforms.uRules.value = rulesTex
        simVelMat.uniforms.uFriction.value = 1.0

        gl.setRenderTarget(velocityFBO1)
        gl.render(simScene, simCamera)
        gl.setRenderTarget(velocityFBO2)
        gl.render(simScene, simCamera)

        // 3. Seed State
        // Use a temp mesh to copy dataTex to FBOs
        const tempGeom = new THREE.PlaneGeometry(2, 2)
        const tempMesh = new THREE.Mesh(tempGeom, new THREE.MeshBasicMaterial({ map: dataTex }))
        simScene.add(tempMesh)

        gl.setRenderTarget(dataFBO1)
        gl.render(simScene, simCamera)
        gl.setRenderTarget(dataFBO2)
        gl.render(simScene, simCamera)

        simScene.remove(tempMesh)
        tempGeom.dispose()
        tempMesh.material.dispose()

        gl.setRenderTarget(null)

        simPosMat.uniforms.uSpeed.value = 1.0
        simVelMat.uniforms.uFriction.value = 0.5

        return () => {
            // Cleanup WebGL resources
            initialPos.dispose()
            initialVel.dispose()
            dataTex.dispose()
            rulesTex.dispose()
            simPosMat.dispose()
            simVelMat.dispose()
            simStateMat.dispose()
            simMesh.geometry.dispose()

            // Dispose ruleTexture correctly if it exists
            if (rulesTextureRef.current) rulesTextureRef.current.dispose()
            if (dataTextureRef.current) dataTextureRef.current.dispose()
        }
    }, [])

    let frame = 0

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime

        const rPos = frame % 2 === 0 ? positionFBO2 : positionFBO1
        const wPos = frame % 2 === 0 ? positionFBO1 : positionFBO2

        const rVel = frame % 2 === 0 ? velocityFBO2 : velocityFBO1
        const wVel = frame % 2 === 0 ? velocityFBO1 : velocityFBO2

        const rData = frame % 2 === 0 ? dataFBO2 : dataFBO1
        const wData = frame % 2 === 0 ? dataFBO1 : dataFBO2

        // 1. Update State
        simMesh.material = simStateMat
        simStateMat.uniforms.uPosition.value = rPos.texture
        simStateMat.uniforms.uVelocity.value = rVel.texture
        simStateMat.uniforms.uData.value = rData.texture
        simStateMat.uniforms.uTime.value = time
        simStateMat.uniforms.uDelta.value = delta
        simStateMat.uniforms.uSeed.value = Math.random() * 500.0
        simStateMat.uniforms.uDecay.value = decay // Pass Decay

        gl.setRenderTarget(wData)
        gl.render(simScene, simCamera)
        gl.setRenderTarget(null)

        // 2. Update Velocity
        simMesh.material = simVelMat
        simVelMat.uniforms.uPosition.value = rPos.texture
        simVelMat.uniforms.uVelocity.value = rVel.texture
        simVelMat.uniforms.uData.value = wData.texture // Use NEW data
        simVelMat.uniforms.uRules.value = rulesTextureRef.current
        simVelMat.uniforms.uTime.value = time
        simVelMat.uniforms.uDelta.value = delta
        simVelMat.uniforms.uFriction.value = friction
        simVelMat.uniforms.uAttraction.value = attraction
        simVelMat.uniforms.uRadius.value = radius
        simVelMat.uniforms.uRepulsion.value = repulsion // Pass Repulsion
        simVelMat.uniforms.uSeed.value = Math.random() * 1000.0

        gl.setRenderTarget(wVel)
        gl.clear()
        gl.render(simScene, simCamera)
        gl.setRenderTarget(null)

        // 3. Update Position
        simMesh.material = simPosMat
        simPosMat.uniforms.uPosition.value = rPos.texture
        simPosMat.uniforms.uVelocity.value = wVel.texture // Use NEW velocity
        simPosMat.uniforms.uTime.value = time
        simPosMat.uniforms.uDelta.value = delta
        simPosMat.uniforms.uSpeed.value = speed
        simPosMat.uniforms.uWorldSize.value = WORLD_SIZE

        gl.setRenderTarget(wPos)
        gl.clear()
        gl.render(simScene, simCamera)
        gl.setRenderTarget(null)

        // 4. Update Visuals
        if (particlesRef.current) {
            particlesRef.current.uniforms.uPosition.value = wPos.texture
            particlesRef.current.uniforms.uData.value = wData.texture
            particlesRef.current.uniforms.uBaseSize.value = size // Pass Size
        }

        frame++
    })

    return createPortal(
        <primitive object={simMesh} />,
        simScene
    )
}
