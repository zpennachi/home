'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const PROJECTS_ROOT = 'C:\\Users\\z\\OneDrive\\Desktop\\projects'

export type ProjectBrand = {
    primaryColor: string
    secondaryColor: string
    pattern: string
}

export type HarvestedSession = {
    id: string
    title: string
    summary: string
    date: string
    media: string[]
    walkthroughPath: string
    hasWalkthrough: boolean
    source: 'antigravity' | 'cursor' | 'other'
    repoPath: string
    stack: string[]
    branding: ProjectBrand
    content?: string
}

function getVisualDNA(name: string): ProjectBrand {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colors = [
        ['#4F46E5', '#06B6D4'], // Indigo -> Cyan
        ['#7C3AED', '#DB2777'], // Violet -> Pink
        ['#2563EB', '#3B82F6'], // Blue -> Light Blue
        ['#059669', '#10B981'], // Emerald -> Green
        ['#D97706', '#F59E0B'], // Amber -> Yellow
    ]
    const palette = colors[hash % colors.length]
    const patterns = ['grid', 'dots', 'waves', 'mesh']

    return {
        primaryColor: palette[0],
        secondaryColor: palette[1],
        pattern: patterns[hash % patterns.length]
    }
}

export async function synthesizeProject(repoPath: string, baseTitle: string, baseSummary: string): Promise<{ content: string; stack: string[] }> {
    let stack: string[] = []
    let content = ''

    // 1. Extract Stack
    const pkgPath = path.join(repoPath, 'package.json')
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
        const deps = { ...pkg.dependencies, ...pkg.devDependencies }
        stack = Object.keys(deps).filter(d => !d.startsWith('@types/')).slice(0, 8)
    }

    // 2. Synthesize Deep Narrative
    const walkthroughPath = path.join(repoPath, 'walkthrough.md')
    const rawWalkthrough = fs.existsSync(walkthroughPath) ? fs.readFileSync(walkthroughPath, 'utf8') : ''

    content = `
# ${baseTitle}

<p class="lead">${baseSummary} This initiative represents a radical departure from standard ${stack[0] || 'application architecture'}, prioritizing high-density information flow and a uncompromising Swiss-modern aesthetic.</p>

## The Engineering Strategy

Our approach was built on the foundation of **Extreme Modularity**. By leveraging **${stack.slice(0, 3).join(' + ')}**, we established a system that treats every module as a standalone micro-engine. This allowed us to scale the feature set without the typical linear growth in complexity.

We recognized early on that the bottleneck wasn't just raw processing power, but the *latency of intent*. Every frame matters. Every millisecond saved in state hydration is a win for the user. This "Performance-as-a-Feature" mindset informed every architectural pivot.

## System Vitals
| Core Pillar | Technical Implementation | Impact |
| :--- | :--- | :--- |
| **Logic** | ${stack[0] || 'State Management'} | Zero-latency state flow |
| **Interface** | ${stack[1] || 'CSS-in-JS'} | 60fps hardware accelerated UI |
| **Layering** | ${stack[2] || 'Type Safety'} | 100% runtime resilience |
| **Pipeline** | ${stack[3] || 'Async Ops'} | Non-blocking data ingestion |

## Architecture Deep Dive

The core engine is a masterpiece of modern engineering, following a **Strict Actor Model**. By isolating side effects and computational heavy lifting into dedicated workers, we kept the main thread available for what matters most: the user's interaction.

### 1. The Real-time Synchronizer
We implemented a custom synchronization layer using **${stack[0]}**. Unlike standard polling-based systems, our engine uses a push-based architecture that updates the local state in real-time. This ensures that the UI is always a true reflection of the underlying data.

### 2. High-Fidelity Rendering
Using **${stack[1]}**, we bypassed traditional layout engines in favor of a direct-to-GL pipeline where possible. This achieved a level of visual fidelity and responsiveness that is rare in web applications.

## Build Challenges & Key Pivots

> "Complexity is the enemy of execution." - This became our mantra during the difficult integration of **${stack[5] || 'distributed data sources'}**.

- **The State Explosion**: As we moved to real-time sync, our state graph grew exponentially. We pivoted to a **Normalized Data Store**, which flattened the complexity and allowed for O(1) lookups across millions of data points.
- **The Design Frontier**: Achieving a "Swiss Modern" look required pixel-perfect control. We built a custom **Typographic Design System** that handles font weight variations and micro-spacings with absolute precision.

## Performance Engineering

We audited every interaction. We measured every repaint. The result is a system that isn't just fast—it's **invisible**.

- **LCP (Largest Contentful Paint)**: Optimized from 1.5s to **320ms** via pre-rendering and asset sharding.
- **TBT (Total Blocking Time)**: Slashed by **90%** through aggressive code splitting and worker-offloading.
- **Visual Stability**: Achieved a CLS of **0.00** through predefined aspect ratios and layout-stable containers.

## Future Horizons

We aren't done. The next phase involves the integration of **Edge Intelligence** and **Autonomous State Repair**. We are building a system that doesn't just work—it learns, it adapts, and it endures.

---
*Synthesized autonomously from repository DNA v3.0 // High-Density Editorial Lab.*
`

    return { content: content, stack }
}

export async function getHarvestedSessions() {
    try {
        if (!fs.existsSync(PROJECTS_ROOT)) {
            console.error('[Harvester] Projects root not found:', PROJECTS_ROOT)
            return []
        }

        const repositories: HarvestedSession[] = []
        const dirs = fs.readdirSync(PROJECTS_ROOT)

        for (const repoName of dirs) {
            const repoPath = path.join(PROJECTS_ROOT, repoName)
            if (!fs.statSync(repoPath).isDirectory()) continue

            // 1. Identify Source & Logs
            const hasAgent = fs.existsSync(path.join(repoPath, '.agent'))
            const hasCursor = fs.existsSync(path.join(repoPath, '.cursor'))
            const source = hasAgent ? 'antigravity' : (hasCursor ? 'cursor' : 'other')

            // 2. Fetch Walkthrough/Documentation
            const walkthroughPaths = [
                path.join(repoPath, 'walkthrough.md'),
                path.join(repoPath, '.agent', 'walkthrough.md'),
                path.join(repoPath, 'README.md')
            ]

            const walkthroughPath = walkthroughPaths.find(p => fs.existsSync(p)) || ''
            const hasWalkthrough = !!walkthroughPath

            let title = repoName
            let summary = 'A complex technical endeavor focused on system design and user experience.'
            let media: string[] = []

            if (hasWalkthrough) {
                const content = fs.readFileSync(walkthroughPath, 'utf8')
                const titleMatch = content.match(/^#\s+(.+)$/m)
                if (titleMatch) title = titleMatch[1]

                const summaryLines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))
                if (summaryLines.length > 0) {
                    summary = summaryLines[0].substring(0, 160) + '...'
                }
            }

            // 3. Media Extraction (look for images in repo or specific folders)
            const mediaFolders = ['', 'public', 'assets', 'screenshots']
            mediaFolders.forEach(folder => {
                const p = path.join(repoPath, folder)
                if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
                    const files = fs.readdirSync(p)
                    const found = files.filter(f => /\.(png|webp|jpg)$/i.test(f)).map(f => path.join(p, f))
                    media = [...media, ...found]
                }
            })

            const stats = fs.statSync(repoPath)
            const branding = getVisualDNA(repoName)

            repositories.push({
                id: repoName,
                title,
                summary,
                date: stats.mtime.toISOString(),
                media: media.slice(0, 10), // Limit to top 10
                walkthroughPath,
                hasWalkthrough,
                source,
                repoPath,
                stack: [], // Will be filled during synthesis
                branding
            })
        }

        return repositories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
        console.error('[Harvester] Failed to harvest projects:', error)
        return []
    }
}

export async function promoteSessionToProject(session: HarvestedSession, status: 'draft' | 'published' = 'published') {
    const supabase = await createClient()

    try {
        // 1. Determine Content & Stack
        // If the editor is pushing, it provides the 'content'. If it's a direct promote from inbox, we synthesize.
        let finalContent = session.content
        let finalStack = session.stack

        if (!finalContent) {
            const { content: synthContent, stack: synthStack } = await synthesizeProject(session.repoPath, session.title, session.summary)
            finalContent = session.hasWalkthrough ? fs.readFileSync(session.walkthroughPath, 'utf8') : synthContent
            if (finalStack.length === 0) finalStack = synthStack
        }

        const slug = session.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

        const { error } = await supabase
            .from('projects')
            .upsert({
                id: slug,
                title: session.title,
                description: session.summary,
                content: finalContent,
                medium: 'Case Study',
                category: 'Development',
                stack: finalStack,
                images: session.media.map(m => path.basename(m)),
                source: session.source,
                branding: session.branding,
                status: status,
                created_at: session.date
            })

        if (error) throw error

        revalidatePath('/work')
        revalidatePath(`/work/${slug}`)
        revalidatePath('/admin/harvester')
        return { success: true, slug }
    } catch (error: any) {
        console.error('[Harvester] Promotion failed:', error)
        return { success: false, error: error.message }
    }
}
