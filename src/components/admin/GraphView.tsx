'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

// ForceGraph2D requires browser environment (canvas)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface GraphData {
    notes: { id: string, title: string, is_pinned: boolean }[]
    links: { source_id: string, target_id: string | null, target_title: string }[]
}

export function GraphView({ data }: { data: GraphData }) {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                })
            }
        }
        
        window.addEventListener('resize', updateDimensions)
        updateDimensions()
        
        // Small delay to ensure layout is complete
        setTimeout(updateDimensions, 100)
        
        return () => window.removeEventListener('resize', updateDimensions)
    }, [])

    const graphData = useMemo(() => {
        const nodes = data.notes.map(n => ({
            id: n.id,
            name: n.title || 'untitled',
            val: 2, // base size
            is_pinned: n.is_pinned
        }))

        // Map dangling links to a pseudo node so they still render
        const danglingTargets = new Map<string, any>()
        const links: any[] = []

        data.links.forEach(l => {
            if (l.target_id) {
                links.push({
                    source: l.source_id,
                    target: l.target_id
                })
            } else {
                // Dangling link
                const pseudoId = `dangling-${l.target_title.toLowerCase()}`
                if (!danglingTargets.has(pseudoId)) {
                    danglingTargets.set(pseudoId, {
                        id: pseudoId,
                        name: l.target_title,
                        val: 1,
                        isDangling: true
                    })
                }
                links.push({
                    source: l.source_id,
                    target: pseudoId
                })
            }
        })

        danglingTargets.forEach(node => nodes.push(node))

        // Increase size of nodes based on connections
        links.forEach(link => {
            const src = nodes.find(n => n.id === link.source)
            const tgt = nodes.find(n => n.id === link.target)
            if (src) src.val += 0.5
            if (tgt) tgt.val += 0.5
        })

        return { nodes, links }
    }, [data])

    const handleNodeClick = useCallback((node: any) => {
        if (!node.isDangling) {
            router.push(`/new/admin/notes/${node.id}`)
        } else {
            // Option to create node in future, for now do nothing
            console.log('Dangling node clicked:', node.name)
        }
    }, [router])

    return (
        <div ref={containerRef} className="w-full h-full min-h-[600px] bg-background">
            {typeof window !== 'undefined' && (
                <ForceGraph2D
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeColor={node => {
                        if (node.isDangling) return '#a3a3a3' // muted/dangling
                        if (node.is_pinned) return '#f59e0b' // amber
                        return '#171717' // foreground (light/dark adapt later via ref if needed)
                    }}
                    linkColor={() => '#e5e5e5'}
                    nodeRelSize={4}
                    onNodeClick={handleNodeClick}
                    backgroundColor="#ffffff" // Adjust for theme if needed
                />
            )}
        </div>
    )
}
