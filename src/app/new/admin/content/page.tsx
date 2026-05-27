import { createClient } from '@/lib/supabase/server'
import { updateContent } from './actions'
import { Save, Type, Link as LinkIcon, Globe } from 'lucide-react'

interface SiteContent {
    id: string
    key_label: string
    value: string
    category: string
    updated_at: string
}

export default async function ContentPage() {
    const supabase = await createClient()
    const { data: content } = await supabase
        .from('site_content')
        .select('*')
        .order('category', { ascending: true }) as { data: SiteContent[] | null }

    const categories = Array.from(new Set(content?.map((c: SiteContent) => c.category) || []))

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-light tracking-tight text-foreground mb-2">Site Content</h1>
                <p className="text-muted-fg text-sm font-mono uppercase tracking-widest font-bold">Global String Registry — CMS V1</p>
            </header>

            <div className="space-y-12">
                {categories.map((cat) => (
                    <section key={cat} className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-fg font-bold">{cat}</h2>
                            <div className="h-px flex-1 bg-muted" />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {content?.filter((c: SiteContent) => c.category === cat).map((item: SiteContent) => (
                                <div
                                    key={item.id}
                                    className="group flex flex-col md:flex-row md:items-center gap-6 bg-muted/20 border border-muted rounded-2xl p-6 hover:bg-muted/30 hover:border-foreground/10 transition-all"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-mono text-muted-fg uppercase tracking-widest bg-foreground/5 px-2 py-0.5 rounded font-bold">
                                                {item.id}
                                            </span>
                                            <h3 className="text-sm font-bold text-foreground/80">{item.key_label}</h3>
                                        </div>
                                        <form
                                            action={async (formData: FormData) => {
                                                'use server'
                                                const val = formData.get('value') as string
                                                await updateContent(item.id, val)
                                            }}
                                            className="relative flex items-center gap-3"
                                        >
                                            <div className="relative flex-1">
                                                {item.id.includes('social') || item.id.includes('url') ? (
                                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-fg" />
                                                ) : (
                                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-fg" />
                                                )}
                                                <input
                                                    name="value"
                                                    defaultValue={item.value}
                                                    className="w-full bg-foreground/[0.02] border border-muted rounded-xl pl-11 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all font-mono"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="p-3 rounded-xl bg-foreground text-background opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {(!content || content.length === 0) && (
                <div className="py-24 text-center border border-dashed border-muted rounded-3xl">
                    <Globe className="w-12 h-12 text-muted-fg/20 mx-auto mb-4" />
                    <h3 className="text-muted-fg font-bold">No site content found.</h3>
                    <p className="text-muted-fg/40 text-sm mt-1">Run the migration to initialize keys.</p>
                </div>
            )}
        </div>
    )
}
