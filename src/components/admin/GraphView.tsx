'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface GraphData {
    notes: { id: string, title: string, is_pinned: boolean, tags?: string[] }[]
    links: { source_id: string, target_id: string | null, target_title: string }[]
}

// ── Minimalist 2D Physics Engine ─────────────────────────────────────────

class Node2D {
    id: string
    name: string
    isDangling: boolean
    isPinned: boolean
    isTag: boolean
    val: number
    
    x: number = 0
    y: number = 0
    vx: number = 0
    vy: number = 0
    radius: number

    constructor(data: any) {
        this.id = data.id
        this.name = data.name
        this.isDangling = !!data.isDangling
        this.isPinned = !!data.is_pinned
        this.isTag = !!data.isTag
        this.val = data.val || 0
        this.radius = this.isTag ? 4 : 6 + (this.val * 0.5)
        
        // Spawn randomly around center
        this.x = (Math.random() - 0.5) * 400
        this.y = (Math.random() - 0.5) * 400
    }
}

export function GraphView({ data }: { data: GraphData }) {
    const router = useRouter()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    
    // Process Data
    const { nodes, links } = useMemo(() => {
        const rawNodes = data.notes.map(n => ({
            id: n.id,
            name: n.title || 'untitled',
            val: 0,
            is_pinned: n.is_pinned
        }))

        const danglingTargets = new Map<string, any>()
        const tagNodes = new Map<string, any>()
        const rawLinks: { source: string, target: string }[] = []

        // Process existing links
        data.links.forEach(l => {
            if (l.target_id) {
                rawLinks.push({ source: l.source_id, target: l.target_id })
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
                rawLinks.push({ source: l.source_id, target: pseudoId })
            }
        })

        // Process tags
        data.notes.forEach(n => {
            if (n.tags && Array.isArray(n.tags)) {
                n.tags.forEach(tag => {
                    const tagId = `tag-${tag.toLowerCase()}`
                    if (!tagNodes.has(tagId)) {
                        tagNodes.set(tagId, {
                            id: tagId,
                            name: tag,
                            val: 0,
                            isTag: true
                        })
                    }
                    rawLinks.push({ source: n.id, target: tagId })
                })
            }
        })

        danglingTargets.forEach(node => rawNodes.push(node))
        tagNodes.forEach(node => rawNodes.push(node))

        // Count connections for size scaling
        rawLinks.forEach(link => {
            const src = rawNodes.find(n => n.id === link.source)
            const tgt = rawNodes.find(n => n.id === link.target)
            if (src) src.val += 1
            if (tgt) tgt.val += 1
        })

        // Convert to Physics Nodes
        const physicsNodes = rawNodes.map(n => new Node2D(n))

        return { nodes: physicsNodes, links: rawLinks }
    }, [data])

    // Physics Loop & Rendering
    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container || nodes.length === 0) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let width = container.clientWidth
        let height = container.clientHeight
        
        // Handle High-DPI displays for crisp rendering
        const dpr = window.devicePixelRatio || 1
        
        const resize = () => {
            width = container.clientWidth
            height = container.clientHeight
            canvas.width = width * dpr
            canvas.height = height * dpr
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            ctx.scale(dpr, dpr)
        }
        
        window.addEventListener('resize', resize)
        resize()
        // Ensure accurate sizing after mount
        setTimeout(resize, 100)

        let animationId: number
        let hoveredNodeId: string | null = null

        // Mouse Interactivity
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left - width / 2
            const mouseY = e.clientY - rect.top - height / 2

            let found: string | null = null
            // Check in reverse order so top nodes are hit first
            for (let i = nodes.length - 1; i >= 0; i--) {
                const n = nodes[i]
                const dx = mouseX - n.x
                const dy = mouseY - n.y
                const distSq = dx * dx + dy * dy
                
                // Hitbox includes label padding
                const hitRadius = n.radius + 15
                if (distSq < hitRadius * hitRadius) {
                    found = n.id
                    break
                }
            }

            hoveredNodeId = found
            document.body.style.cursor = found ? 'pointer' : 'default'
        }

        const handleClick = () => {
            if (hoveredNodeId) {
                const node = nodes.find(n => n.id === hoveredNodeId)
                if (node && !node.isDangling && !node.isTag) {
                    router.push(`/new/admin/notes/${node.id}`)
                }
            }
        }

        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('click', handleClick)

        const REPULSION = 1000
        const SPRING_K = 0.015
        const DAMPING = 0.85
        const CENTER_PULL = 0.002

        const step = () => {
            // Apply Forces
            for (let i = 0; i < nodes.length; i++) {
                const n1 = nodes[i]
                
                // Repulsion
                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j]
                    const dx = n1.x - n2.x
                    const dy = n1.y - n2.y
                    let distSq = dx * dx + dy * dy
                    if (distSq < 1) distSq = 1
                    
                    const force = REPULSION / distSq
                    const fx = (dx / Math.sqrt(distSq)) * force
                    const fy = (dy / Math.sqrt(distSq)) * force
                    
                    n1.vx += fx
                    n1.vy += fy
                    n2.vx -= fx
                    n2.vy -= fy
                }

                // Centering
                n1.vx -= n1.x * CENTER_PULL
                n1.vy -= n1.y * CENTER_PULL
            }

            // Spring Attraction
            links.forEach(link => {
                const src = nodes.find(n => n.id === link.source)
                const tgt = nodes.find(n => n.id === link.target)
                if (!src || !tgt) return

                const dx = tgt.x - src.x
                const dy = tgt.y - src.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                
                const force = (dist - 40) * SPRING_K // Target distance 40
                const fx = (dx / dist) * force
                const fy = (dy / dist) * force

                src.vx += fx
                src.vy += fy
                tgt.vx -= fx
                tgt.vy -= fy
            })

            // Update Positions
            nodes.forEach(n => {
                n.vx *= DAMPING
                n.vy *= DAMPING
                n.x += n.vx
                n.y += n.vy
            })

            // Render
            ctx.clearRect(0, 0, width, height)
            ctx.save()
            ctx.translate(width / 2, height / 2) // Center graph

            // Draw Links
            ctx.lineWidth = 1
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.2)'
            ctx.beginPath()
            links.forEach(link => {
                const src = nodes.find(n => n.id === link.source)
                const tgt = nodes.find(n => n.id === link.target)
                if (src && tgt) {
                    ctx.moveTo(src.x, src.y)
                    ctx.lineTo(tgt.x, tgt.y)
                }
            })
            ctx.stroke()

            // Draw Nodes & Labels
            nodes.forEach(n => {
                const isHovered = hoveredNodeId === n.id
                
                // Color mapping matching solid minimalist design
                let color = '#3b82f6' // Default note (blue)
                if (n.isPinned) color = '#f59e0b' // Pinned (amber)
                if (n.isDangling) color = '#a3a3a3' // Dangling (gray)
                if (n.isTag) color = '#8b5cf6' // Tag (purple)
                
                // Node Circle
                ctx.beginPath()
                ctx.arc(n.x, n.y, isHovered ? n.radius * 1.5 : n.radius, 0, 2 * Math.PI)
                ctx.fillStyle = color
                ctx.fill()
                
                // Subtle border
                ctx.lineWidth = 1.5
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
                ctx.stroke()

                // Text Label
                ctx.font = `400 ${isHovered ? '12px' : '10px'} ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
                const textWidth = ctx.measureText(n.name).width
                
                // Label Background
                const bgPaddingX = 6
                const bgPaddingY = 4
                const textY = n.y + n.radius + 14

                ctx.fillStyle = isHovered ? 'rgba(23, 23, 23, 1)' : 'rgba(255, 255, 255, 0.8)'
                ctx.beginPath()
                ctx.roundRect(
                    n.x - textWidth / 2 - bgPaddingX, 
                    textY - 10 - bgPaddingY, 
                    textWidth + bgPaddingX * 2, 
                    12 + bgPaddingY * 2, 
                    4
                )
                ctx.fill()
                if (isHovered) {
                    ctx.lineWidth = 1
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
                    ctx.stroke()
                }

                // Text
                ctx.fillStyle = isHovered ? '#ffffff' : n.isTag ? '#a3a3a3' : '#171717'
                ctx.textAlign = 'center'
                ctx.fillText(n.name, n.x, textY)
            })

            ctx.restore()
            animationId = requestAnimationFrame(step)
        }

        animationId = requestAnimationFrame(step)

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resize)
            canvas.removeEventListener('mousemove', handleMouseMove)
            canvas.removeEventListener('click', handleClick)
        }
    }, [nodes, links, router])

    if (!nodes.length) {
        return (
            <div className="w-full h-full flex items-center justify-center text-muted-fg font-mono text-sm">
                No notes or connections found.
            </div>
        )
    }

    return (
        <div ref={containerRef} className="w-full h-full min-h-[500px] bg-background relative overflow-hidden">
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 block w-full h-full outline-none"
            />
        </div>
    )
}
