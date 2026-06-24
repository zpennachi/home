import { createClient } from '@/lib/supabase/server'
import { AudioPlayerButton } from '@/components/archive/AudioPlayerButton'

// Required for typescript to accept the model-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { src?: string; alt?: string; 'auto-rotate'?: boolean; 'camera-controls'?: boolean }, HTMLElement>;
    }
  }
}

export const revalidate = 60; // revalidate every minute

export default async function ArchivePage() {
    const supabase = await createClient()
    const { data: entries, error } = await supabase
        .from('field_archive')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error(error)
    }

    const archives = entries || []

    return (
        <main className="min-h-screen selection:bg-foreground selection:text-background pb-32">
            <div className="container py-24 max-w-5xl mx-auto space-y-16">
                <header className="space-y-4">
                    <h1 className="text-4xl font-display font-extralight tracking-tight">Field Archive</h1>
                    <p className="text-sm font-mono text-muted-fg max-w-xl">
                        A curated collection of field recordings, spatial captures, and visual fragments.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {archives.map((item) => (
                        <div key={item.id} className="group relative border border-muted bg-background overflow-hidden flex flex-col">
                            {/* Media Display Area */}
                            <div className="relative aspect-square w-full bg-muted/10 border-b border-muted flex items-center justify-center overflow-hidden">
                                {item.media_type === 'audio' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/5">
                                        <div className="w-full h-32 flex items-center justify-center opacity-30">
                                            {/* Abstract Waveform representation */}
                                            {Array.from({length: 20}).map((_, i) => (
                                                <div key={i} className="w-1 bg-foreground mx-[2px] rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                                            ))}
                                        </div>
                                        <AudioPlayerButton 
                                            track={{
                                                id: item.id,
                                                url: item.file_url,
                                                title: item.title,
                                                category: item.category
                                            }} 
                                        />
                                    </div>
                                )}

                                {item.media_type === 'photo' && item.file_url && (
                                    <img 
                                        src={item.file_url} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    />
                                )}

                                {item.media_type === 'video' && item.file_url && (
                                    <video 
                                        src={item.file_url} 
                                        controls 
                                        className="w-full h-full object-cover" 
                                    />
                                )}

                                {item.media_type === '3d' && item.file_url && (
                                    <model-viewer 
                                        src={item.file_url}
                                        alt={item.title}
                                        auto-rotate
                                        camera-controls
                                        style={{ width: '100%', height: '100%' }}
                                    ></model-viewer>
                                )}
                            </div>

                            {/* Metadata Area */}
                            <div className="p-4 space-y-3 bg-background relative z-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-sm tracking-wide">{item.title}</h3>
                                    {item.category && (
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-fg">
                                            {item.category}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="space-y-1">
                                    {item.species && (
                                        <p className="text-xs font-mono text-muted-fg/80">Species: {item.species}</p>
                                    )}
                                    {(item.location_lat !== null && item.location_lng !== null) && (
                                        <p className="text-[10px] font-mono text-muted-fg/60">
                                            {item.location_lat.toFixed(4)}, {item.location_lng.toFixed(4)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {archives.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-muted">
                        <p className="text-sm font-mono text-muted-fg uppercase tracking-widest">No entries found.</p>
                    </div>
                )}
            </div>
        </main>
    )
}
