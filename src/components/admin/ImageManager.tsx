'use client'

import { Plus, X, Image as ImageIcon, Star, LayoutTemplate } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageManagerProps {
    images: string[];
    onChange: (images: string[]) => void;
}

export function ImageManager({ images, onChange }: ImageManagerProps) {
    const handleChange = (index: number, value: string) => {
        const newImages = [...images]
        while (newImages.length <= index) {
            newImages.push('')
        }
        newImages[index] = value
        // Filter out trailing empty strings but keep intermediate ones? 
        // Actually, let's keep it simple. Just update.
        onChange(newImages)
    }

    const addImage = () => {
        onChange([...images, ''])
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        onChange(newImages)
    }

    // Ensure we render at least the first 2 slots (Thumbnail, Hero) + any extra images
    // We create a display array that pads the real images array with empty strings if needed
    // But we need to map back to the real index correctly. 
    // Actually, let's just use the real images array and if it's short, we render extra slots that push to it.

    // A better approach: 
    // We always render at least 2 slots. 
    // If images[0] exists, it goes there. If not, empty slot 0.
    // If images[1] exists, it goes there. If not, empty slot 1.
    // Then rest.

    const minSlots = 2
    const totalSlots = Math.max(images.length, minSlots)
    const slots = Array.from({ length: totalSlots }).map((_, i) => images[i] || '')

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((url, index) => (
                    <div key={index} className="relative group">
                        <div className="aspect-video bg-muted/20 border border-muted rounded-xl overflow-hidden relative">
                            {url ? (
                                <img src={url} alt={`Asset ${index}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-fg/20 gap-2">
                                    <ImageIcon className="w-8 h-8 opacity-50" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-muted-fg/60">
                                        {index === 0 ? 'Thumbnail' : index === 1 ? 'Hero' : 'Gallery Asset'}
                                    </span>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm">
                                        <span className="text-xs font-bold">Paste URL</span>
                                    </div>
                                </div>
                            )}

                            {/* Overlay Controls */}
                            <div className={cn(
                                "absolute inset-0 bg-black/80 transition-opacity flex flex-col items-center justify-center p-4 gap-2",
                                url ? "opacity-0 group-hover:opacity-100" : (index === 0 || index === 1) ? "opacity-0 group-hover:opacity-100" : "opacity-0"
                            )}>
                                <input
                                    className="w-full bg-transparent text-white text-xs border-b border-white/20 focus:border-white outline-none mb-2 placeholder:text-white/30 text-center pb-2"
                                    placeholder={index === 0 ? "/work/thumb.jpg" : index === 1 ? "/work/hero.jpg" : "/work/img.jpg"}
                                    value={url}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    autoFocus={!url && index >= images.length}
                                />
                                {url && (
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500 text-red-200 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex gap-1 pointer-events-none">
                                {index === 0 && <span className="bg-amber-500 text-black px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"><LayoutTemplate className="w-3 h-3" /> Thumb</span>}
                                {index === 1 && <span className="bg-indigo-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"><Star className="w-3 h-3" /> Hero</span>}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Button */}
                <button
                    type="button"
                    onClick={addImage}
                    className="aspect-video bg-muted/5 border border-dashed border-muted/50 rounded-xl flex flex-col items-center justify-center text-muted-fg/40 hover:text-foreground hover:bg-muted/10 hover:border-foreground/20 transition-all gap-2"
                >
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Add Asset</span>
                </button>
            </div>
            <p className="text-[10px] text-muted-fg/40 font-mono text-center lg:text-right">
                * Slot 1 is Thumbnail (Grid), Slot 2 is Hero (Header).
            </p>
        </div>
    )
}
