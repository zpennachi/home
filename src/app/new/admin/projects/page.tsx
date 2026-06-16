
import Link from 'next/link'
import { Plus, Trash2, Edit, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { deleteProject, toggleProjectVisibility } from './actions'
import { cn } from '@/lib/utils'
import localProjects from '@/data/projects.json'

export default async function AdminProjectsPage() {
    const supabase = await createClient()
    const { data: dbProjects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    const dbProjectsMap = new Map(dbProjects?.map(p => [p.id, p]) || []);
    const projects = [
        ...(dbProjects || []),
        ...localProjects.filter(p => !dbProjectsMap.has(p.id)).map((p: any) => ({
            ...p,
            status: p.status || 'published',
            source: p.source || 'local'
        }))
    ];

    return (
        <div className="space-y-6">
            {/* Header / Action Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between pb-4 border-b border-muted/50 mb-8">
                <div className="flex items-baseline gap-4 w-full md:w-auto">
                    <h1 className="text-lg font-light text-foreground lowercase">projects</h1>
                    <span className="text-[10px] font-mono text-muted-fg/40 lowercase">archive index</span>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto shrink-0 justify-between md:justify-end">
                    <span className="text-xs text-muted-fg font-light tracking-wide select-none lowercase">
                        {projects?.length || 0} projects
                    </span>
                    <Link
                        href="/new/admin/projects/new"
                        className="flex items-center gap-2 px-4 py-2 border border-muted hover:border-foreground rounded-none text-xs uppercase tracking-widest font-light transition-all bg-transparent hover:bg-foreground hover:text-background"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>new project</span>
                    </Link>
                </div>
            </div>

            {/* Projects Flat List */}
            <div className="flex flex-col border-t border-muted/50">
                {projects?.map((project: any) => (
                    <div
                        key={project.id}
                        className="border-b border-muted/50 py-4 hover:px-2 transition-all duration-150 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-6 min-w-0 flex-1">
                            {/* Flat Thumbnail */}
                            <div className="w-16 h-10 border border-muted/50 overflow-hidden bg-muted flex-shrink-0 relative">
                                {project.images?.[0] ? (
                                    <img 
                                        src={project.images[0]} 
                                        alt={project.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-fg/20">
                                        <Package className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex items-baseline gap-6 min-w-0 flex-1">
                                <span className="font-medium text-sm text-foreground truncate group-hover:text-muted-fg transition-colors lowercase">
                                    {project.title}
                                </span>
                                <span className="text-xs text-muted-fg truncate font-light hidden md:inline lowercase">
                                    {project.category}
                                </span>
                                <span className="text-[10px] text-muted-fg/40 truncate font-mono hidden lg:inline lowercase">
                                    {project.id}
                                </span>
                            </div>

                            {/* Source and Status Tags (Flat borders) */}
                            <div className="flex gap-2 items-center shrink-0">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-none text-[9px] font-mono lowercase tracking-wider border",
                                    project.source === 'local'
                                        ? 'bg-amber-500/5 text-amber-500 border-amber-500/20'
                                        : 'bg-indigo-500/5 text-indigo-500 border-indigo-500/20'
                                )}>
                                    {project.source || 'db'}
                                </span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-none text-[9px] font-mono lowercase tracking-wider border",
                                    (project.status || 'published') === 'published'
                                        ? 'bg-green-500/5 text-green-500 border-green-500/20'
                                        : 'bg-red-500/5 text-red-500 border-red-500/20'
                                )}>
                                    {project.status || 'published'}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-6 shrink-0 ml-6">
                            {/* Toggle visibility form */}
                            <form action={async () => {
                                'use server'
                                await toggleProjectVisibility(project.id, project.status || 'published')
                            }}>
                                <button className="text-[10px] font-mono lowercase tracking-wider px-3 py-1 border border-muted hover:border-foreground rounded-none transition-all bg-transparent cursor-pointer">
                                    {(project.status || 'published') === 'published' ? 'hide' : 'show'}
                                </button>
                            </form>

                            {/* Edit Button */}
                            <Link
                                href={`/new/admin/projects/${project.id}`}
                                className="p-1 rounded-none text-muted-fg hover:text-foreground transition-all shrink-0"
                                title="edit project"
                            >
                                <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Delete Button */}
                            <form action={async () => {
                                'use server'
                                await deleteProject(project.id)
                            }}>
                                <button className="p-1 rounded-none text-muted-fg/40 hover:text-red-500 hover:bg-red-500/10 md:opacity-0 group-hover:opacity-100 transition-all shrink-0 cursor-pointer">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        </div>
                    </div>
                ))}

                {(!projects || projects.length === 0) && (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <Package className="w-8 h-8 text-muted-fg/30 mb-4 font-light" />
                        <p className="text-muted-fg text-xs font-light lowercase">no projects digitized. add one.</p>
                        <Link 
                            href="/new/admin/projects/new"
                            className="mt-3 text-xs font-medium uppercase tracking-widest text-foreground hover:underline"
                        >
                            new project
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
