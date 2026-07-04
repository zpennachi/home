'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'

interface GraphData {
    notes: { id: string, title: string, is_pinned: boolean }[]
    links: { source_id: string, target_id: string | null, target_title: string }[]
}

function GraphSimulation({ nodes, links, onNodeClick }: { nodes: any[], links: any[], onNodeClick: (n: any) => void }) {
    const groupRef = useRef<THREE.Group>(null)
    const linesRef = useRef<THREE.LineSegments>(null)
    const pointsRef = useRef<THREE.Points>(null)
    
    // Physics simulation state
    const positions = useRef<THREE.Vector3[]>([])
    const velocities = useRef<THREE.Vector3[]>([])
    
    // Initialize random positions
    useEffect(() => {
        positions.current = nodes.map(() => new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        ))
        velocities.current = nodes.map(() => new THREE.Vector3(0, 0, 0))
    }, [nodes])

    // Physics loop
    useFrame(() => {
        if (!positions.current.length) return

        const pos = positions.current
        const vel = velocities.current
        const len = nodes.length

        // Repulsion (O(N^2) but fine for <100 nodes)
        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len; j++) {
                const dx = pos[i].x - pos[j].x
                const dy = pos[i].y - pos[j].y
                const dz = pos[i].z - pos[j].z
                let distSq = dx * dx + dy * dy + dz * dz
                if (distSq < 0.1) distSq = 0.1 // prevent division by zero
                const force = 2.0 / distSq // Repulsion strength
                
                const fx = (dx / Math.sqrt(distSq)) * force
                const fy = (dy / Math.sqrt(distSq)) * force
                const fz = (dz / Math.sqrt(distSq)) * force
                
                vel[i].x += fx
                vel[i].y += fy
                vel[i].z += fz
                vel[j].x -= fx
                vel[j].y -= fy
                vel[j].z -= fz
            }
        }

        // Attraction along links
        links.forEach(link => {
            const i = nodes.findIndex(n => n.id === link.source)
            const j = nodes.findIndex(n => n.id === link.target)
            if (i === -1 || j === -1) return
            
            const dx = pos[j].x - pos[i].x
            const dy = pos[j].y - pos[i].y
            const dz = pos[j].z - pos[i].z
            
            // Spring force
            const force = 0.02 // Attraction strength
            vel[i].x += dx * force
            vel[i].y += dy * force
            vel[i].z += dz * force
            vel[j].x -= dx * force
            vel[j].y -= dy * force
            vel[j].z -= dz * force
        })

        // Centering force to keep them on screen
        for (let i = 0; i < len; i++) {
            vel[i].x -= pos[i].x * 0.005
            vel[i].y -= pos[i].y * 0.005
            vel[i].z -= pos[i].z * 0.005
        }

        // Apply velocities and damping
        for (let i = 0; i < len; i++) {
            vel[i].multiplyScalar(0.85) // Damping
            pos[i].add(vel[i])
        }
    })

    return (
        <group ref={groupRef}>
            {nodes.map((node, i) => (
                <GraphNode 
                    key={node.id} 
                    node={node} 
                    positionRef={positions} 
                    index={i} 
                    onClick={() => onNodeClick(node)}
                />
            ))}
            <GraphLinks links={links} nodes={nodes} positionsRef={positions} />
        </group>
    )
}

function GraphNode({ node, positionRef, index, onClick }: any) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    useFrame(() => {
        if (meshRef.current && positionRef.current[index]) {
            meshRef.current.position.copy(positionRef.current[index])
        }
    })

    const isDangling = node.isDangling
    const isPinned = node.is_pinned
    
    // Scale based on connections
    const scale = 1 + (node.val || 1) * 0.2

    return (
        <mesh 
            ref={meshRef} 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
            scale={hovered ? scale * 1.2 : scale}
        >
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
                color={isDangling ? '#a3a3a3' : isPinned ? '#f59e0b' : '#3b82f6'} 
                roughness={0.2}
                metalness={0.8}
            />
            {/* HTML label for crisp text rendering */}
            <Html distanceFactor={15} center zIndexRange={[100, 0]}>
                <div 
                    className={`px-2 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-opacity ${hovered ? 'opacity-100 bg-background/90 text-foreground border border-muted' : 'opacity-70 text-foreground'}`}
                    style={{ transform: 'translate3d(0, -20px, 0)', pointerEvents: 'none' }}
                >
                    {node.name}
                </div>
            </Html>
        </mesh>
    )
}

function GraphLinks({ links, nodes, positionsRef }: any) {
    const lineRef = useRef<THREE.LineSegments>(null)
    const geometry = useMemo(() => new THREE.BufferGeometry(), [])
    
    useFrame(() => {
        if (!lineRef.current || !positionsRef.current.length) return
        
        const pos = positionsRef.current
        const points = []
        
        links.forEach((link: any) => {
            const i = nodes.findIndex((n: any) => n.id === link.source)
            const j = nodes.findIndex((n: any) => n.id === link.target)
            if (i !== -1 && j !== -1 && pos[i] && pos[j]) {
                points.push(pos[i].x, pos[i].y, pos[i].z)
                points.push(pos[j].x, pos[j].y, pos[j].z)
            }
        })
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    })

    return (
        <lineSegments ref={lineRef} geometry={geometry}>
            <lineBasicMaterial color="#888888" transparent opacity={0.3} />
        </lineSegments>
    )
}

export function GraphView({ data }: { data: GraphData }) {
    const router = useRouter()

    const graphData = useMemo(() => {
        const nodes = data.notes.map(n => ({
            id: n.id,
            name: n.title || 'untitled',
            val: 0,
            is_pinned: n.is_pinned
        }))

        const danglingTargets = new Map<string, any>()
        const links: any[] = []

        data.links.forEach(l => {
            if (l.target_id) {
                links.push({ source: l.source_id, target: l.target_id })
            } else {
                const pseudoId = `dangling-${l.target_title.toLowerCase()}`
                if (!danglingTargets.has(pseudoId)) {
                    danglingTargets.set(pseudoId, {
                        id: pseudoId,
                        name: l.target_title,
                        val: 0,
                        isDangling: true
                    })
                }
                links.push({ source: l.source_id, target: pseudoId })
            }
        })

        danglingTargets.forEach(node => nodes.push(node))

        links.forEach(link => {
            const src = nodes.find(n => n.id === link.source)
            const tgt = nodes.find(n => n.id === link.target)
            if (src) src.val += 1
            if (tgt) tgt.val += 1
        })

        return { nodes, links }
    }, [data])

    const handleNodeClick = (node: any) => {
        if (!node.isDangling) {
            router.push(`/new/admin/notes/${node.id}`)
        }
    }

    if (!graphData.nodes.length) {
        return (
            <div className="w-full h-full flex items-center justify-center text-muted-fg font-mono text-sm">
                No notes or connections found.
            </div>
        )
    }

    return (
        <div className="w-full h-full min-h-[500px] bg-background">
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <GraphSimulation 
                    nodes={graphData.nodes} 
                    links={graphData.links} 
                    onNodeClick={handleNodeClick} 
                />
                <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
        </div>
    )
}
