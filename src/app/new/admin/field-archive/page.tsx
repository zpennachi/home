import { getArchiveEntries, createArchiveEntry, deleteArchiveEntry } from './actions'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function FieldArchiveAdminPage() {
    const entries = await getArchiveEntries()

    return (
        <div className="flex-1 flex flex-col h-full relative p-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl font-display font-light">Field Archive</h1>
                    <p className="text-sm text-muted-fg mt-1">Manage audio, 3d, video, and photos.</p>
                </div>
                <form action={async () => {
                    "use server";
                    const newEntry = await createArchiveEntry()
                    // Revalidation handled in action, simple redirect can be done via client component, but we will just rely on revalidate
                }}>
                    <button type="submit" className="text-xs font-mono uppercase tracking-wider bg-foreground text-background px-4 py-2 hover:opacity-90 transition-opacity">
                        + New Entry
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.map((entry) => (
                    <div key={entry.id} className="border border-muted p-4 flex flex-col justify-between group">
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-fg/60">
                                    {entry.media_type}
                                </span>
                                {entry.category && (
                                    <span className="text-[10px] bg-muted/30 px-2 py-0.5 rounded-sm">
                                        {entry.category}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-medium text-sm truncate">{entry.title || 'Untitled'}</h3>
                            <p className="text-xs text-muted-fg mt-1 truncate">
                                {entry.species ? `Species: ${entry.species}` : 'No species recorded'}
                            </p>
                        </div>
                        
                        <div className="mt-6 flex items-center justify-between border-t border-muted pt-3">
                            <Link 
                                href={`/new/admin/field-archive/${entry.id}`}
                                className="text-xs font-mono lowercase hover:text-foreground text-muted-fg"
                            >
                                edit
                            </Link>
                            <form action={async () => {
                                "use server";
                                await deleteArchiveEntry(entry.id);
                            }}>
                                <button type="submit" className="text-xs font-mono lowercase text-red-500/60 hover:text-red-500">
                                    delete
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>

            {entries.length === 0 && (
                <div className="flex-1 flex items-center justify-center border border-dashed border-muted">
                    <p className="text-sm text-muted-fg font-mono uppercase tracking-widest">No entries yet</p>
                </div>
            )}
        </div>
    )
}
