'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getNotesByTag, createNoteFromDangling } from '@/app/new/admin/notes/actions'

interface GraphData {
    notes: { id: string, title: string, is_pinned: boolean, tags?: string[], ai_summary?: string }[]
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
        
        // Spawn randomly over a much larger area to prevent dense overlap
        this.x = (Math.random() - 0.5) * 1000
        this.y = (Math.random() - 0.5) * 1000
    }
}

// ── Context Pane Types ───────────────────────────────────────────────────

type PaneContent = 
    | { type: 'note'; id: string; title: string; summary: string | null; tags: string[] }
    | { type: 'tag'; tag: string; notes: { id: string; title: string; ai_summary?: string }[]; loading: boolean }
    | { type: 'dangling'; title: string; creating: boolean }

export function GraphView({ data }: { data: GraphData }) {
    const router = useRouter()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    
    // ── Search State ──────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)
    
    // ── Context Pane State ────────────────────────────────────────────────
    const [paneContent, setPaneContent] = useState<PaneContent | null>(null)
    const [paneOpen, setPaneOpen] = useState(false)
    
    // Expose search query to the canvas render loop via ref
    const searchQueryRef = useRef('')
    useEffect(() => { searchQueryRef.current = searchQuery }, [searchQuery])

    const { nodes, links, noteMap } = useMemo(() => {
        const rawNodes = data.notes.map(n => ({
            id: n.id,
            name: n.title || 'untitled',
            val: 0,
            is_pinned: n.is_pinned
        }))

        // Build a lookup map for note summaries
        const nMap = new Map<string, { title: string, ai_summary?: string, tags?: string[] }>()
        data.notes.forEach(n => nMap.set(n.id, { title: n.title, ai_summary: n.ai_summary || undefined, tags: n.tags }))

        const danglingTargets = new Map<string, any>()
        const tagNodes = new Map<string, any>()
        const rawLinks: { source: string, target: string }[] = []

        // Process existing links
        ;(data.links || []).forEach(l => {
            if (l.target_id) {
                rawLinks.push({ source: l.source_id, target: l.target_id })
            } else {
                const titleStr = typeof l.target_title === 'string' ? l.target_title : 'unknown'
                const pseudoId = `dangling-${titleStr.toLowerCase()}`
                if (!danglingTargets.has(pseudoId)) {
                    danglingTargets.set(pseudoId, {
                        id: pseudoId,
                        name: titleStr,
                        val: 0,
                        isDangling: true
                    })
                }
                rawLinks.push({ source: l.source_id, target: pseudoId })
            }
        })

        // Process tags
        ;(data.notes || []).forEach(n => {
            if (n.tags && Array.isArray(n.tags)) {
                n.tags.forEach(tag => {
                    if (typeof tag === 'string') {
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
                    }
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

        return { nodes: physicsNodes, links: rawLinks, noteMap: nMap }
    }, [data])

    // ── Node Click Handlers ───────────────────────────────────────────────
    
    const handleNodeClick = useCallback((node: Node2D) => {
        if (node.isTag) {
            // Feature 1: Tag Hub
            setPaneContent({ type: 'tag', tag: node.name, notes: [], loading: true })
            setPaneOpen(true)
            getNotesByTag(node.name).then(notes => {
                setPaneContent({ type: 'tag', tag: node.name, notes, loading: false })
            }).catch(console.error)
        } else if (node.isDangling) {
            // Feature 2: Ghost Note resolution
            setPaneContent({ type: 'dangling', title: node.name, creating: false })
            setPaneOpen(true)
        } else {
            // Feature 4: Note Context Pane
            const noteData = noteMap.get(node.id)
            setPaneContent({
                type: 'note',
                id: node.id,
                title: noteData?.title || node.name,
                summary: noteData?.ai_summary || null,
                tags: (noteData?.tags || []) as string[]
            })
            setPaneOpen(true)
        }
    }, [noteMap])

    const handleCreateFromDangling = useCallback(async (title: string) => {
        setPaneContent(prev => prev?.type === 'dangling' ? { ...prev, creating: true } : prev)
        try {
            const newNote = await createNoteFromDangling(title)
            router.push(`/new/admin/notes/${newNote.id}`)
        } catch (err) {
            console.error('Failed to create note:', err)
            setPaneContent(prev => prev?.type === 'dangling' ? { ...prev, creating: false } : prev)
        }
    }, [router])

    // ── Seeder Logic ──────────────────────────────────────────────────────
    const [isSeeding, setIsSeeding] = useState(false)
    const [seedStats, setSeedStats] = useState<{total: number, synced: number, unsyncedIds: string[]} | null>(null)
    const [seedProgress, setSeedProgress] = useState({ current: 0, total: 0 })

    useEffect(() => {
        import('@/app/new/admin/notes/actions').then(m => m.getSeedStats()).then(setSeedStats).catch(console.error)
    }, [])

    const handleSeedGraph = async () => {
        if (!seedStats || seedStats.unsyncedIds.length === 0) return
        if (!confirm(`This will run the AI on your ${seedStats.unsyncedIds.length} unsynced notes to build the graph. It may take a minute. Proceed?`)) return
        setIsSeeding(true)
        try {
            const { generateAISummary } = await import('@/app/new/admin/notes/actions')
            const ids = seedStats.unsyncedIds
            setSeedProgress({ current: 0, total: ids.length })

            for (let i = 0; i < ids.length; i++) {
                try {
                    await generateAISummary(ids[i])
                } catch (err: any) {
                    console.warn(`Skipped note ${ids[i]}: ${err.message}`)
                }
                setSeedProgress(prev => ({ ...prev, current: i + 1 }))
            }
            
            window.location.reload()
        } catch (err) {
            console.error('Seeding failed', err)
            setIsSeeding(false)
        }
    }

    // Store handleNodeClick in a ref so the canvas event loop always has the latest
    const handleNodeClickRef = useRef(handleNodeClick)
    useEffect(() => { handleNodeClickRef.current = handleNodeClick }, [handleNodeClick])

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
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
        
        window.addEventListener('resize', resize)
        resize()
        setTimeout(resize, 100)

        let animationId: number
        let hoveredNodeId: string | null = null

        // Pan & Zoom State
        let panX = 0
        let panY = 0
        let scale = 1
        
        let isDragging = false
        let lastMouseX = 0
        let lastMouseY = 0
        let dragDistance = 0

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true
            dragDistance = 0
            const rect = canvas.getBoundingClientRect()
            lastMouseX = e.clientX - rect.left
            lastMouseY = e.clientY - rect.top
        }

        const handleMouseUp = () => {
            isDragging = false
        }

        const handleMouseLeave = () => {
            isDragging = false
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            const rawMouseX = e.clientX - rect.left
            const rawMouseY = e.clientY - rect.top

            if (isDragging) {
                const dx = rawMouseX - lastMouseX
                const dy = rawMouseY - lastMouseY
                panX += dx
                panY += dy
                dragDistance += Math.abs(dx) + Math.abs(dy)
            }

            lastMouseX = rawMouseX
            lastMouseY = rawMouseY

            // Transform raw mouse coords into physics space for hit detection
            const mouseX = (rawMouseX - (width / 2 + panX)) / scale
            const mouseY = (rawMouseY - (height / 2 + panY)) / scale

            let found: string | null = null
            for (let i = nodes.length - 1; i >= 0; i--) {
                const n = nodes[i]
                const dx = mouseX - n.x
                const dy = mouseY - n.y
                const distSq = dx * dx + dy * dy
                const hitRadius = n.radius + 15
                if (distSq < hitRadius * hitRadius) {
                    found = n.id
                    break
                }
            }

            hoveredNodeId = found
            document.body.style.cursor = isDragging ? 'grabbing' : (found ? 'pointer' : 'grab')
        }

        const handleClick = () => {
            if (dragDistance > 5) return
            if (hoveredNodeId) {
                const node = nodes.find(n => n.id === hoveredNodeId)
                if (node) {
                    handleNodeClickRef.current(node)
                }
            }
        }

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            const zoomSensitivity = 0.002
            const delta = -e.deltaY * zoomSensitivity
            const newScale = Math.min(Math.max(0.1, scale + delta), 4)
            
            const rect = canvas.getBoundingClientRect()
            const rawMouseX = e.clientX - rect.left
            const rawMouseY = e.clientY - rect.top

            const rx = rawMouseX - (width / 2 + panX)
            const ry = rawMouseY - (height / 2 + panY)

            panX -= rx * (newScale / scale - 1)
            panY -= ry * (newScale / scale - 1)

            scale = newScale
        }

        canvas.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)
        canvas.addEventListener('mouseleave', handleMouseLeave)
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('click', handleClick)
        canvas.addEventListener('wheel', handleWheel, { passive: false })

        const REPULSION = 2000
        const SPRING_K = 0.015
        const DAMPING = 0.85
        const CENTER_PULL = 0.001
        const MAX_VELOCITY = 20

        const step = () => {
            // Apply Forces
            for (let i = 0; i < nodes.length; i++) {
                const n1 = nodes[i]
                
                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j]
                    const dx = n1.x - n2.x
                    const dy = n1.y - n2.y
                    let distSq = dx * dx + dy * dy
                    if (distSq < 200) distSq = 200
                    
                    const force = REPULSION / distSq
                    const fx = (dx / Math.sqrt(distSq)) * force
                    const fy = (dy / Math.sqrt(distSq)) * force
                    
                    n1.vx += fx
                    n1.vy += fy
                    n2.vx -= fx
                    n2.vy -= fy
                }

                n1.vx -= n1.x * CENTER_PULL
                n1.vy -= n1.y * CENTER_PULL
            }

            links.forEach(link => {
                const src = nodes.find(n => n.id === link.source)
                const tgt = nodes.find(n => n.id === link.target)
                if (!src || !tgt) return

                const dx = tgt.x - src.x
                const dy = tgt.y - src.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist === 0) return
                
                const force = (dist - 120) * SPRING_K
                const fx = (dx / dist) * force
                const fy = (dy / dist) * force

                src.vx += fx
                src.vy += fy
                tgt.vx -= fx
                tgt.vy -= fy
            })

            nodes.forEach(n => {
                n.vx *= DAMPING
                n.vy *= DAMPING
                
                const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
                if (speed > MAX_VELOCITY) {
                    n.vx = (n.vx / speed) * MAX_VELOCITY
                    n.vy = (n.vy / speed) * MAX_VELOCITY
                }

                n.x += n.vx
                n.y += n.vy
            })

            // ── Render ──────────────────────────────────────────────
            const currentSearch = searchQueryRef.current.toLowerCase()
            
            ctx.clearRect(0, 0, width, height)
            ctx.save()
            ctx.translate(width / 2 + panX, height / 2 + panY)
            ctx.scale(scale, scale)

            // Draw Links
            ctx.lineWidth = 1 / scale
            links.forEach(link => {
                const src = nodes.find(n => n.id === link.source)
                const tgt = nodes.find(n => n.id === link.target)
                if (src && tgt) {
                    const srcMatch = !currentSearch || src.name.toLowerCase().includes(currentSearch)
                    const tgtMatch = !currentSearch || tgt.name.toLowerCase().includes(currentSearch)
                    ctx.strokeStyle = (currentSearch && !srcMatch && !tgtMatch) 
                        ? 'rgba(150, 150, 150, 0.04)' 
                        : 'rgba(150, 150, 150, 0.2)'
                    ctx.beginPath()
                    ctx.moveTo(src.x, src.y)
                    ctx.lineTo(tgt.x, tgt.y)
                    ctx.stroke()
                }
            })

            // Draw Nodes & Labels
            nodes.forEach(n => {
                const isHovered = hoveredNodeId === n.id
                const matchesSearch = !currentSearch || n.name.toLowerCase().includes(currentSearch)
                const dimmed = currentSearch && !matchesSearch
                
                let color = '#3b82f6'
                if (n.isPinned) color = '#f59e0b'
                if (n.isDangling) color = '#a3a3a3'
                if (n.isTag) color = '#8b5cf6'
                
                const alpha = dimmed ? 0.08 : 1

                // Node Circle
                ctx.beginPath()
                ctx.arc(n.x, n.y, isHovered ? n.radius * 1.5 : n.radius, 0, 2 * Math.PI)
                ctx.globalAlpha = alpha
                ctx.fillStyle = color
                ctx.fill()
                
                ctx.lineWidth = 1.5 / scale
                ctx.strokeStyle = dimmed ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.8)'
                ctx.stroke()

                // Text Label
                ctx.font = `400 ${isHovered ? '12px' : '10px'} ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
                const textWidth = ctx.measureText(n.name).width
                
                const bgPaddingX = 6
                const bgPaddingY = 4
                const textY = n.y + n.radius + 14

                ctx.fillStyle = isHovered ? 'rgba(23, 23, 23, 1)' : (dimmed ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.8)')
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
                    ctx.lineWidth = 1 / scale
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
                    ctx.stroke()
                }

                ctx.fillStyle = isHovered ? '#ffffff' : (dimmed ? 'rgba(100,100,100,0.15)' : (n.isTag ? '#a3a3a3' : '#171717'))
                ctx.textAlign = 'center'
                ctx.fillText(n.name, n.x, textY)
                
                ctx.globalAlpha = 1
            })

            ctx.restore()
            animationId = requestAnimationFrame(step)
        }

        animationId = requestAnimationFrame(step)

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resize)
            canvas.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
            canvas.removeEventListener('mouseleave', handleMouseLeave)
            canvas.removeEventListener('mousemove', handleMouseMove)
            canvas.removeEventListener('click', handleClick)
            canvas.removeEventListener('wheel', handleWheel)
        }
    }, [nodes, links])

    if (!nodes.length) {
        return (
            <div className="w-full h-full flex items-center justify-center text-muted-fg font-mono text-sm">
                No notes or connections found.
            </div>
        )
    }

    return (
        <div ref={containerRef} className="w-full h-full min-h-[500px] bg-background relative overflow-hidden group">
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 block w-full h-full outline-none"
            />

            {/* ── Feature 3: Search Bar ─────────────────────────── */}
            <div className="absolute top-4 left-4 z-10">
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="search graph..."
                    className="bg-background/80 backdrop-blur text-foreground placeholder:text-muted-fg/40 px-3 py-1.5 rounded-sm border border-muted text-xs font-mono shadow-sm focus:outline-none focus:border-foreground/30 w-48 transition-all"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground text-[10px] font-mono cursor-pointer"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* ── Feature 4 / 1 / 2: Sliding Context Pane ──────── */}
            {paneOpen && paneContent && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 z-20" 
                        onClick={() => { setPaneOpen(false); setPaneContent(null) }}
                    />
                    {/* Panel */}
                    <div className="absolute top-0 right-0 bottom-0 w-[340px] z-30 bg-background/95 backdrop-blur-sm border-l border-muted overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-200">
                        {/* Close Button */}
                        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-between px-4 pt-4 pb-2 border-b border-muted/20">
                            <span className="text-[9px] font-mono text-muted-fg/40 uppercase tracking-widest">
                                {paneContent.type === 'note' ? 'note' : paneContent.type === 'tag' ? 'tag hub' : 'ghost note'}
                            </span>
                            <button 
                                onClick={() => { setPaneOpen(false); setPaneContent(null) }}
                                className="text-muted-fg hover:text-foreground text-xs font-mono cursor-pointer"
                            >
                                close
                            </button>
                        </div>

                        <div className="px-4 py-4 space-y-4">
                            {/* ── Note Pane ────────────────────────── */}
                            {paneContent.type === 'note' && (
                                <>
                                    <h3 className="text-sm font-medium text-foreground lowercase">{paneContent.title}</h3>
                                    
                                    {paneContent.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {paneContent.tags.map((tag, i) => (
                                                <span key={i} className="text-[10px] font-mono text-purple-500/80 bg-purple-500/10 px-1.5 py-0.5 rounded-sm">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {paneContent.summary ? (
                                        <div className="prose prose-sm dark:prose-invert !max-w-full text-foreground/80 leading-normal font-mono text-[12px]">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {paneContent.summary}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-mono text-muted-fg/50 lowercase">no ai summary yet. click synthesize on this note to generate one.</p>
                                    )}

                                    <button
                                        onClick={() => router.push(`/new/admin/notes/${paneContent.id}`)}
                                        className="w-full mt-2 text-xs font-mono text-foreground border border-muted hover:border-foreground/30 px-3 py-2 rounded-sm transition-colors cursor-pointer lowercase"
                                    >
                                        open full note →
                                    </button>
                                </>
                            )}

                            {/* ── Tag Hub Pane ─────────────────────── */}
                            {paneContent.type === 'tag' && (
                                <>
                                    <h3 className="text-sm font-medium text-purple-500 lowercase">{paneContent.tag}</h3>
                                    
                                    {paneContent.loading ? (
                                        <div className="flex items-center gap-2 py-8 justify-center">
                                            <div className="w-3 h-3 border-2 border-muted border-t-foreground rounded-full animate-spin" />
                                            <span className="text-xs font-mono text-muted-fg lowercase">loading notes...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-[10px] font-mono text-muted-fg/50 uppercase tracking-widest">
                                                {paneContent.notes.length} note{paneContent.notes.length !== 1 ? 's' : ''}
                                            </p>
                                            <div className="space-y-2">
                                                {paneContent.notes.map(note => (
                                                    <button
                                                        key={note.id}
                                                        onClick={() => router.push(`/new/admin/notes/${note.id}`)}
                                                        className="w-full text-left px-3 py-2.5 rounded-sm border border-muted/30 hover:border-foreground/20 transition-colors cursor-pointer group/item"
                                                    >
                                                        <div className="text-xs font-mono text-foreground lowercase group-hover/item:text-blue-500 transition-colors">{note.title}</div>
                                                        {note.ai_summary && (
                                                            <p className="text-[10px] font-mono text-muted-fg/50 mt-1 line-clamp-2 lowercase">
                                                                {note.ai_summary.slice(0, 120)}...
                                                            </p>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {/* ── Dangling / Ghost Note Pane ──────── */}
                            {paneContent.type === 'dangling' && (
                                <>
                                    <h3 className="text-sm font-medium text-neutral-400 lowercase">{paneContent.title}</h3>
                                    <p className="text-xs font-mono text-muted-fg/50 lowercase leading-relaxed">
                                        this concept has been mentioned across your notes but doesn't have its own dedicated page yet. creating it will automatically link all references to this new note.
                                    </p>
                                    
                                    <button
                                        onClick={() => handleCreateFromDangling(paneContent.title)}
                                        disabled={paneContent.creating}
                                        className="w-full mt-2 text-xs font-mono text-foreground bg-foreground/5 border border-muted hover:border-foreground/30 hover:bg-foreground/10 px-3 py-2.5 rounded-sm transition-all cursor-pointer lowercase disabled:opacity-40"
                                    >
                                        {paneContent.creating ? 'creating...' : `create "${paneContent.title}" note →`}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ── Seeder UI ────────────────────────────────────── */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
                {isSeeding ? (
                    <div className="bg-background/80 backdrop-blur text-foreground px-3 py-1.5 rounded-sm border border-muted text-xs font-mono shadow-sm">
                        synthesizing: {seedProgress.current} / {seedProgress.total}
                    </div>
                ) : seedStats && seedStats.unsyncedIds.length > 0 ? (
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur px-3 py-1.5 rounded-sm border border-muted shadow-sm">
                        <span className="text-[10px] text-muted-fg font-mono uppercase tracking-widest">{seedStats.synced}/{seedStats.total} Synced</span>
                        <button 
                            onClick={handleSeedGraph}
                            className="text-foreground hover:text-blue-500 text-xs font-mono lowercase cursor-pointer"
                            title="Run AI Synthesis on unsynced notes"
                        >
                            seed {seedStats.unsyncedIds.length} unsynced notes
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
