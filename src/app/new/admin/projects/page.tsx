
import Link from 'next/link'
import { Plus, Trash2, Edit, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { deleteProject } from './actions'
import { cn } from '@/lib/utils'

export default async function AdminProjectsPage() {
    const supabase = await createClient()
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-foreground mb-2">Projects</h1>
                    <p className="text-muted-fg text-sm font-mono uppercase tracking-widest font-bold">Global Strategic Archive — Index V1</p>
                </div>
                <Link
                    href="/new/admin/projects/new"
                    className="group bg-foreground text-background px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-foreground/10"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </Link>
            </div>

            <div className="space-y-4">
                {projects?.map((project: any) => (
                    <div
                        key={project.id}
                        className="group relative bg-muted/20 border border-muted rounded-2xl overflow-hidden hover:bg-muted/30 hover:border-foreground/10 transition-all duration-300"
                    >
                        <div className="flex items-center p-5">
                            {/* Thumbnail */}
                            <div className="w-36 aspect-video rounded-xl overflow-hidden bg-foreground/5 flex-shrink-0 relative border border-muted shadow-sm">
                                {project.images?.[0] ? (
                                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-fg/20">
                                        <Package className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="ml-10 flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                    <h3 className="text-2xl font-bold text-foreground tracking-tight">{project.title}</h3>
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                        project.source === 'local'
                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                    )}>
                                        {project.source || 'db'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-6 text-[11px] text-muted-fg font-mono uppercase tracking-[0.2em] font-black">
                                    <span className="text-foreground/60">{project.category}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/10" />
                                    <span className="truncate max-w-[200px] text-muted-fg/40">{project.id}</span>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="px-10 text-right hidden xl:block border-l border-muted">
                                <div className="text-[10px] text-muted-fg uppercase tracking-[0.3em] font-mono mb-2 font-black">Stack Hierarchy</div>
                                <div className="flex gap-2 justify-end">
                                    {project.stack?.slice(0, 3).map((s: string, idx: number) => (
                                        <span key={idx} className="text-[10px] font-mono text-foreground/80 bg-foreground/5 px-2.5 py-1 rounded-lg border border-muted font-bold">
                                            {s}
                                        </span>
                                    ))}
                                    {project.stack?.length > 3 && (
                                        <span className="text-[10px] font-mono text-muted-fg/40 bg-foreground/5 px-2 py-1 rounded-lg">+ {project.stack.length - 3}</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pl-10 border-l border-muted ml-10">
                                <Link
                                    href={`/new/admin/projects/${project.id}`}
                                    className="p-3.5 rounded-2xl text-muted-fg hover:text-foreground hover:bg-muted transition-all border border-transparent hover:border-muted shadow-sm hover:shadow-md"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>
                                <form action={async () => {
                                    'use server'
                                    await deleteProject(project.id)
                                }}>
                                    <button className="p-3.5 rounded-2xl text-muted-fg/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Background subtle accent */}
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-foreground/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                ))}

                {(!projects || projects.length === 0) && (
                    <div className="py-32 text-center border-2 border-dashed border-muted rounded-3xl">
                        <Package className="w-16 h-16 text-muted-fg/10 mx-auto mb-6" />
                        <h3 className="text-muted-fg font-black text-lg uppercase tracking-widest">No projects digitized.</h3>
                        <p className="text-muted-fg/40 text-sm mt-2 max-w-sm mx-auto">The portfolio index is currently empty. Securely add your first strategic entry.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
