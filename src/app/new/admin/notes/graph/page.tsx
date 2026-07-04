import { getGraphData } from '../actions'
import { GraphView } from '@/components/admin/GraphView'

export default async function NotesGraphPage() {
    const data = await getGraphData()

    return (
        <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h1 className="text-xl font-display font-light">Global Graph</h1>
                <p className="text-xs font-mono text-muted-fg mt-1">interconnected notes & thoughts</p>
            </div>
            
            <GraphView data={data} />
        </div>
    )
}
