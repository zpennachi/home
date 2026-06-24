'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type FieldArchiveEntry = {
    id: string
    title: string
    media_type: string
    file_url: string
    location_lat: number | null
    location_lng: number | null
    date_captured: string | null
    category: string | null
    species: string | null
    metadata: any
    created_at: string
}

export async function getArchiveEntries() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('field_archive')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching field archive:', error)
        return []
    }

    return data as FieldArchiveEntry[]
}

export async function getArchiveEntry(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('field_archive')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching field archive entry:', error)
        return null
    }

    return data as FieldArchiveEntry
}

export async function createArchiveEntry() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('field_archive')
        .insert({
            title: 'Untitled Archive',
            media_type: 'audio',
            file_url: ''
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/new/admin/field-archive')
    return data as FieldArchiveEntry
}

export async function updateArchiveEntry(id: string, updates: Partial<FieldArchiveEntry>) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('field_archive')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error

    revalidatePath('/new/admin/field-archive')
    revalidatePath(`/new/admin/field-archive/${id}`)
    revalidatePath('/archive')
    return data as FieldArchiveEntry
}

export async function deleteArchiveEntry(id: string) {
    const supabase = await createClient()
    
    // Attempt to delete file from storage if file_url exists
    const entry = await getArchiveEntry(id)
    if (entry?.file_url) {
        const urlObj = new URL(entry.file_url)
        const pathParts = urlObj.pathname.split('/archive_media/')
        if (pathParts.length > 1) {
            const filePath = pathParts[1]
            await supabase.storage.from('archive_media').remove([filePath])
        }
    }

    const { error } = await supabase
        .from('field_archive')
        .delete()
        .eq('id', id)

    if (error) throw error

    revalidatePath('/new/admin/field-archive')
    revalidatePath('/archive')
}
