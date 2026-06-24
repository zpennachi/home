'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FieldArchiveEntry, updateArchiveEntry } from '@/app/new/admin/field-archive/actions'
import { toast } from 'sonner'
import Link from 'next/link'

export function FieldArchiveEditor({ entry }: { entry: FieldArchiveEntry }) {
    const router = useRouter()
    const supabase = createClient()
    
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    
    const [formData, setFormData] = useState({
        title: entry.title || '',
        media_type: entry.media_type || 'audio',
        category: entry.category || '',
        species: entry.species || '',
        location_lat: entry.location_lat || '',
        location_lng: entry.location_lng || '',
        file_url: entry.file_url || ''
    })

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateArchiveEntry(entry.id, {
                title: formData.title,
                media_type: formData.media_type,
                category: formData.category,
                species: formData.species,
                location_lat: formData.location_lat ? parseFloat(formData.location_lat as string) : null,
                location_lng: formData.location_lng ? parseFloat(formData.location_lng as string) : null,
                file_url: formData.file_url
            })
            toast.success('Saved successfully')
        } catch (err) {
            console.error(err)
            toast.error('Failed to save')
        } finally {
            setIsSaving(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${entry.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('archive_media')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('archive_media')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, file_url: publicUrl }))
            
            // Auto-detect media type if possible
            if (file.type.startsWith('audio/')) setFormData(prev => ({ ...prev, media_type: 'audio' }))
            else if (file.type.startsWith('video/')) setFormData(prev => ({ ...prev, media_type: 'video' }))
            else if (file.type.startsWith('image/')) setFormData(prev => ({ ...prev, media_type: 'photo' }))
            else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) setFormData(prev => ({ ...prev, media_type: '3d' }))

            toast.success('File uploaded')
        } catch (err) {
            console.error(err)
            toast.error('Failed to upload file')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full max-w-3xl mx-auto w-full p-6 space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/new/admin/field-archive" className="text-xs font-mono text-muted-fg hover:text-foreground">
                    &lt; Back to Archive
                </Link>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-xs font-mono uppercase tracking-wider bg-foreground text-background px-4 py-2 hover:opacity-90 disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-mono uppercase text-muted-fg mb-2 tracking-widest">Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-transparent border-b border-muted py-2 font-display text-2xl focus:outline-none focus:border-foreground"
                        placeholder="e.g. Morning Birdsong"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-mono uppercase text-muted-fg mb-2 tracking-widest">Media Type</label>
                        <select
                            value={formData.media_type}
                            onChange={(e) => setFormData(prev => ({ ...prev, media_type: e.target.value }))}
                            className="w-full bg-background border border-muted p-2 text-sm focus:outline-none focus:border-foreground"
                        >
                            <option value="audio">Audio</option>
                            <option value="3d">3D Mesh (.glb)</option>
                            <option value="photo">Photo</option>
                            <option value="video">Video</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-mono uppercase text-muted-fg mb-2 tracking-widest">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full bg-transparent border-b border-muted py-2 text-sm focus:outline-none focus:border-foreground"
                            placeholder="e.g. bird chirp, wind"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-mono uppercase text-muted-fg mb-2 tracking-widest">Species (Optional)</label>
                    <input
                        type="text"
                        value={formData.species}
                        onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                        className="w-full bg-transparent border-b border-muted py-2 text-sm focus:outline-none focus:border-foreground"
                        placeholder="e.g. Turdus migratorius"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-mono uppercase text-muted-fg mb-2 tracking-widest">Latitude</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.location_lat}
                            onChange={(e) => setFormData(prev => ({ ...prev, location_lat: e.target.value }))}
                            className="w-full bg-transparent border-b border-muted py-2 text-sm focus:outline-none focus:border-foreground"
                            placeholder="e.g. 40.7128"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono uppercase text-muted-fg mb-2 tracking-widest">Longitude</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.location_lng}
                            onChange={(e) => setFormData(prev => ({ ...prev, location_lng: e.target.value }))}
                            className="w-full bg-transparent border-b border-muted py-2 text-sm focus:outline-none focus:border-foreground"
                            placeholder="e.g. -74.0060"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-muted">
                    <label className="block text-xs font-mono uppercase text-muted-fg mb-2 tracking-widest">Media File</label>
                    
                    {formData.file_url ? (
                        <div className="mb-4">
                            <p className="text-xs text-green-600 mb-2 font-mono">File uploaded successfully</p>
                            <input 
                                type="text" 
                                readOnly 
                                value={formData.file_url} 
                                className="w-full text-xs font-mono bg-muted/20 p-2 border border-muted"
                            />
                        </div>
                    ) : null}

                    <div className="border border-dashed border-muted p-8 flex flex-col items-center justify-center bg-muted/5 relative hover:bg-muted/10 transition-colors">
                        <input 
                            type="file" 
                            onChange={handleFileUpload} 
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            accept="audio/*,video/*,image/*,.glb,.gltf"
                        />
                        <span className="text-sm font-mono text-muted-fg uppercase tracking-widest">
                            {isUploading ? 'Uploading...' : 'Click or Drag File Here'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
