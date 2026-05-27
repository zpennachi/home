'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'
import { useToast } from '@/components/admin/ToastProvider'
import { AssetChecklist } from './AssetChecklist'
import { TipTapEditor } from './TipTapEditor'
import { ImageManager } from './ImageManager'

interface ProjectFormProps {
    initialData?: any;
    action: (formData: FormData) => Promise<any>;
}

export function ProjectForm({ initialData, action }: ProjectFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [pending, setPending] = useState(false)
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        id: initialData?.id || '',
        category: initialData?.category || '',
        medium: initialData?.medium || '',
        repo: initialData?.repo || '',
        description: initialData?.description || '',
        content: initialData?.content || '',
        stack: initialData?.stack ? initialData.stack.join(', ') : '',
        images: initialData?.images ? initialData.images.join(', ') : '',
        heroImage: initialData?.heroImage || ''
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        setPending(true)
        try {
            const data = new FormData()
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value)
            })

            const result = await action(data)

            if (result && 'error' in result) {
                toast(result.error as string, 'error')
            } else {
                toast('Project saved successfully.')
                router.push('/new/admin/projects')
                router.refresh()
            }
        } catch (err: any) {
            toast('Failed to save project.', 'error')
        } finally {
            setPending(false)
        }
    }

    // Derived state for Checklist
    const checklistData = {
        images: formData.images.split(',').map((s: string) => s.trim()).filter(Boolean),
        content: formData.content,
        stack: formData.stack.split(',').map((s: string) => s.trim()).filter(Boolean),
        repo: formData.repo,
        heroImage: formData.heroImage
    }

    return (
        <div className="p-6 md:p-12 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Link
                    href="/new/admin/projects"
                    className="inline-flex items-center gap-2 text-muted-fg hover:text-foreground text-[10px] font-mono uppercase tracking-[0.2em] transition-all group font-medium"
                >
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    back
                </Link>

                <h1 className="text-xl font-light tracking-tight text-foreground lowercase">
                    {initialData ? `edit ${initialData.id}` : 'new project'}
                </h1>

                <button
                    onClick={handleSubmit}
                    disabled={pending}
                    className="border border-muted text-foreground hover:border-foreground hover:bg-foreground hover:text-background px-6 py-2 rounded-sm font-light text-xs tracking-widest uppercase flex items-center gap-2 transition-all bg-transparent disabled:opacity-50"
                >
                    {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    save
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

                {/* Left Sidebar: Checklist & Metadata */}
                <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
                    <AssetChecklist data={checklistData} />

                    <div className="space-y-6">
                        <div className="p-6 rounded-sm border border-muted/50 space-y-6">
                            <h3 className="text-xs font-mono uppercase tracking-widest font-medium text-muted-fg">core identity</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-fg mb-2">title</label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        className="w-full bg-background border border-muted/70 rounded-sm px-3 py-2 text-xs font-light focus:border-foreground focus:outline-none transition-colors"
                                        placeholder="Project Title"
                                    />
                                </div>

                                {initialData ? (
                                    <input type="hidden" name="id" value={formData.id} />
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-fg mb-2">slug (id)</label>
                                        <input
                                            value={formData.id}
                                            onChange={(e) => handleChange('id', e.target.value)}
                                            className="w-full bg-background border border-muted/70 rounded-sm px-3 py-2 text-xs font-mono focus:border-foreground focus:outline-none transition-colors"
                                            placeholder="project-slug"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-fg mb-2">category</label>
                                        <input
                                            value={formData.category}
                                            onChange={(e) => handleChange('category', e.target.value)}
                                            className="w-full bg-background border border-muted/70 rounded-sm px-3 py-2 text-xs focus:border-foreground focus:outline-none transition-colors"
                                            placeholder="Engineering"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-fg mb-2">medium</label>
                                        <input
                                            value={formData.medium}
                                            onChange={(e) => handleChange('medium', e.target.value)}
                                            className="w-full bg-background border border-muted/70 rounded-sm px-3 py-2 text-xs focus:border-foreground focus:outline-none transition-colors"
                                            placeholder="Web App"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-sm border border-muted/50 space-y-6">
                            <h3 className="text-xs font-mono uppercase tracking-widest font-medium text-muted-fg">tech & assets</h3>

                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-fg mb-2">repo link</label>
                                <input
                                    value={formData.repo}
                                    onChange={(e) => handleChange('repo', e.target.value)}
                                    className="w-full bg-background border border-muted/70 rounded-sm px-3 py-2 text-xs font-mono focus:border-foreground focus:outline-none transition-colors"
                                    placeholder="https://github.com/..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-fg mb-2">tech stack (comma sep)</label>
                                <textarea
                                    value={formData.stack}
                                    onChange={(e) => handleChange('stack', e.target.value)}
                                    className="w-full bg-background border border-muted/70 rounded-sm px-3 py-2 text-xs font-mono focus:border-foreground focus:outline-none transition-colors h-24 resize-none"
                                    placeholder="React, Next.js, Supabase..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-fg mb-4">project assets (thumb, hero, etc)</label>
                                <ImageManager
                                    images={formData.images ? formData.images.split(',').map((s: string) => s.trim()).filter(Boolean) : []}
                                    onChange={(imgs) => handleChange('images', imgs.join(','))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Panel: Editor */}
                <div className="lg:col-span-8 space-y-10 order-1 lg:order-2">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-fg font-medium">executive summary</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-muted px-0 py-4 text-xl md:text-2xl font-light leading-snug focus:border-foreground focus:ring-0 resize-none transition-colors placeholder:text-muted-fg/20 lowercase"
                            placeholder="a concise, high-impact summary of the project..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-fg font-medium">deep dive content</label>
                            <span className="text-[10px] font-mono text-muted-fg/40 lowercase">markdown enabled</span>
                        </div>

                        {/* Block Editor */}
                        <div className="min-h-[500px]">
                            <TipTapEditor
                                initialContent={formData.content}
                                onChange={(val) => handleChange('content', val)}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
