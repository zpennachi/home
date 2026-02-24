
'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { create365Entry } from '../actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/admin/ToastProvider'
import { useState } from 'react'

export default function New365EntryPage() {
    const { toast } = useToast()
    const router = useRouter()
    const [pending, setPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setPending(true)
        try {
            const result = await create365Entry(formData)
            if (result && 'error' in result) {
                toast(result.error as string, 'error')
            } else {
                toast('Entry successfully registered to the archive.')
                router.push('/new/admin/365')
            }
        } catch (err: any) {
            toast('Failed to commit output. Internal system error.', 'error')
        } finally {
            setPending(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link
                href="/new/admin/365"
                className="inline-flex items-center gap-2 text-muted-fg hover:text-foreground mb-12 text-xs font-mono uppercase tracking-[0.2em] transition-all group font-bold"
            >
                <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                Back to Archive
            </Link>

            <header className="mb-12">
                <h1 className="text-4xl font-light tracking-tight text-foreground mb-2">New Output</h1>
                <p className="text-muted-fg text-sm font-mono uppercase tracking-widest font-bold">Entry Registration — Day Archive</p>
            </header>

            <div className="bg-muted/20 border border-muted rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
                <form action={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-fg mb-3 ml-1 font-bold">Asset Title</label>
                            <input
                                name="title"
                                type="text"
                                required
                                disabled={pending}
                                className="w-full bg-foreground/[0.02] border border-muted rounded-xl px-5 py-4 text-foreground placeholder:text-muted-fg/30 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all font-medium text-lg disabled:opacity-50"
                                placeholder="e.g. Chrome Sphere Study"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-fg mb-3 ml-1 font-bold">Category</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    disabled={pending}
                                    className="w-full bg-foreground/[0.02] border border-muted rounded-xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all appearance-none cursor-pointer disabled:opacity-50"
                                >
                                    <option value="artwork">Artwork</option>
                                    <option value="concept">Concept</option>
                                    <option value="experiment">Experiment</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-fg">
                                    <ChevronLeft className="w-4 h-4 -rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-fg mb-3 ml-1 font-bold">Technical Medium</label>
                            <input
                                name="medium"
                                type="text"
                                required
                                disabled={pending}
                                className="w-full bg-foreground/[0.02] border border-muted rounded-xl px-5 py-4 text-foreground placeholder:text-muted-fg/30 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all font-mono text-sm disabled:opacity-50"
                                placeholder="e.g. Blender Cycles"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-fg mb-3 ml-1 font-bold">Resource Blueprint (Path)</label>
                            <input
                                name="file"
                                type="text"
                                required
                                disabled={pending}
                                className="w-full bg-foreground/[0.02] border border-muted rounded-xl px-5 py-4 text-foreground placeholder:text-muted-fg/30 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all font-mono text-sm disabled:opacity-50"
                                placeholder="/work/365/day-01.jpg"
                            />
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-foreground/[0.02] border border-muted">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <p className="text-[10px] text-muted-fg uppercase tracking-widest leading-none font-bold">
                                    Reference file from <code className="text-foreground/60">public/</code> partition or external URL.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-muted flex justify-end">
                        <button
                            type="submit"
                            disabled={pending}
                            className="bg-foreground text-background px-10 py-4 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg active:shadow-none disabled:opacity-50 disabled:scale-100"
                        >
                            {pending ? 'Committing...' : 'Commit to Archive'}
                        </button>
                    </div>
                </form>

                {/* Subtle BG Glow - Adjusted for light/dark */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-foreground/[0.02] rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-foreground/[0.01] rounded-full blur-[100px] pointer-events-none" />
            </div>
        </div>
    )
}
