
import Link from 'next/link'
import { Plus, Trash2, FileImage } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { delete365Entry } from './actions'

export default async function Admin365Page() {
    const supabase = await createClient()
    const { data: entries } = await supabase
        .from('365')
        .select('*')
        .order('id', { ascending: false })

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-light tracking-tight text-foreground mb-2">365 Renders</h1>
                <p className="text-muted-fg text-sm font-mono uppercase tracking-widest font-bold">Daily Archive Index — Total {entries?.length || 0}</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <Link
                    href="/new/admin/365/new"
                    className="group aspect-square rounded-2xl border border-dashed border-muted hover:border-foreground/20 hover:bg-muted/30 transition-all flex flex-col items-center justify-center gap-3 text-muted-fg hover:text-foreground relative overflow-hidden"
                >
                    <div className="p-4 rounded-full bg-muted/50 group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest font-bold">Register Entry</span>
                </Link>

                {entries?.map((entry: any) => (
                    <div key={entry.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-muted/10 border border-muted hover:border-foreground/10 transition-all duration-500">
                        {entry.file ? (
                            <div className="absolute inset-0">
                                <img src={entry.file} alt={entry.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-fg/20">
                                <FileImage className="w-12 h-12" />
                            </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-5">
                            <h3 className="font-bold text-foreground truncate text-sm mb-1">{entry.title}</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-fg font-bold">{entry.category}</span>
                                <span className="text-[10px] font-mono text-muted-fg/60">{new Date(entry.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex gap-2">
                            <form action={async () => {
                                'use server'
                                await delete365Entry(entry.id)
                            }}>
                                <button className="p-2.5 rounded-xl bg-background/80 backdrop-blur-md text-foreground border border-muted hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-lg font-bold">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
