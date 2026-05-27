import { getHarvestedSessions } from './actions'
import { Archive } from 'lucide-react'
import { HarvesterList } from './HarvesterList'

export default async function HarvesterPage() {
    const sessions = await getHarvestedSessions()

    return (
        <div className="p-12 max-w-7xl mx-auto space-y-12">
            <header className="flex items-end justify-between border-b border-muted pb-8">
                <div className="space-y-2">
                    <h1 className="text-6xl font-light tracking-tighter text-foreground">Harvester</h1>
                    <p className="text-muted-fg font-mono uppercase tracking-[0.2em] text-xs font-bold flex items-center gap-2">
                        <Archive className="w-4 h-4" />
                        Autonomous Project Ingestion Lab
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-mono font-light text-muted-fg/20">{sessions.length}</span>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-fg">Pending Drafts</p>
                </div>
            </header>

            <HarvesterList sessions={sessions} />

            {sessions.length === 0 && (
                <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-3xl opacity-50">
                    <Archive className="w-12 h-12 mb-4 text-muted-fg" />
                    <p className="text-sm font-mono uppercase tracking-widest">The silos are empty</p>
                </div>
            )}
        </div>
    )
}
