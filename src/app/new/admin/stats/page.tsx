
import { createClient } from '@/lib/supabase/server'

export default async function StatsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { count: entriesCount } = await supabase.from('365').select('*', { count: 'exact', head: true })
    const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8 md:space-y-12">
            <header className="mb-8 md:mb-12">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">Command Center</h1>
                <p className="text-muted-fg text-[10px] md:text-sm font-mono uppercase tracking-widest font-medium">Enterprise Management Platform — V1.0.4</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="group bg-muted/30 border border-muted rounded-2xl p-6 md:p-8 hover:border-foreground/10 transition-all relative overflow-hidden">
                    <h3 className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-muted-fg mb-4 flex items-center gap-2 font-bold">
                        <div className="w-1 h-1 bg-foreground/20 rounded-full" />
                        Total 365 Entries
                    </h3>
                    <div className="flex items-end justify-between">
                        <div className="text-5xl md:text-6xl font-light tracking-tight text-foreground group-hover:scale-105 transition-transform origin-left">{entriesCount || 0}</div>
                        <div className="h-10 w-24 mb-2">
                            {/* Simple SVG Sparkline */}
                            <svg className="w-full h-full stroke-foreground/20 fill-none" viewBox="0 0 100 40">
                                <path d="M0,35 Q10,10 20,30 T40,20 T60,35 T80,10 T100,5" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="group bg-muted/30 border border-muted rounded-2xl p-6 md:p-8 hover:border-foreground/10 transition-all relative overflow-hidden">
                    <h3 className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-muted-fg mb-4 flex items-center gap-2 font-bold">
                        <div className="w-1 h-1 bg-foreground/20 rounded-full" />
                        Case Studies
                    </h3>
                    <div className="flex items-end justify-between">
                        <div className="text-5xl md:text-6xl font-light tracking-tight text-foreground group-hover:scale-105 transition-transform origin-left">{projectsCount || 0}</div>
                        <div className="h-10 w-24 mb-2 text-emerald-500/30">
                            <svg className="w-full h-full stroke-current fill-none" viewBox="0 0 100 40">
                                <path d="M0,38 L10,30 L20,35 L30,10 L40,20 L50,5 L60,15 L70,8 L80,12 L90,2 L100,5" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="group bg-muted/30 border border-muted rounded-2xl p-6 md:p-8 hover:border-foreground/10 transition-all sm:col-span-2 lg:col-span-1">
                    <h3 className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-muted-fg mb-4 flex items-center gap-2 font-bold">
                        <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                        System Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            <span className="text-xl md:text-2xl font-bold text-emerald-500">Global Operational</span>
                        </div>
                        <div className="flex gap-1">
                            {[...Array(15)].map((_, i) => (
                                <div key={i} className="h-6 w-1 md:w-1.5 bg-emerald-500/20 rounded-full hover:bg-emerald-500/40 transition-colors" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Bar */}
            <div className="mt-8 bg-muted/10 border border-muted rounded-xl px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] md:text-[11px] font-mono uppercase tracking-widest text-muted-fg font-bold">
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        Last Sync: {new Date().toLocaleTimeString()}
                    </span>
                    <div className="flex items-center gap-4">
                        <span className="opacity-60 md:opacity-100 Region: US-East-1">Region: US-East-1</span>
                        <span className="opacity-60 md:opacity-100 Latency: 14ms">Latency: 14ms</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-auto md:ml-0">
                    <kbd className="hidden sm:inline-block bg-foreground/5 px-1.5 py-0.5 rounded border border-foreground/10">⌘K</kbd>
                    <span>Quick Command</span>
                </div>
            </div>
        </div>
    )
}
