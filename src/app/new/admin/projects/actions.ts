
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get('id') as string // slug
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const medium = formData.get('medium') as string
    const description = formData.get('description') as string
    const content = formData.get('content') as string
    const repo = formData.get('repo') as string
    const source = formData.get('source') as string

    // Simple string-to-array parsing for stack/images (comma separated for MVP)
    const stack = (formData.get('stack') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const images = (formData.get('images') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []

    const { error } = await supabase.from('projects').insert({
        id,
        title,
        category,
        medium,
        description,
        content,
        repo,
        source,
        stack,
        images
    })

    if (error) {
        console.error('Error creating project:', error)
        return { error: error.message }
    }

    revalidatePath('/new/admin/projects')
    revalidatePath('/new')
    return { success: true }
}

export async function deleteProject(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
        console.error('Error deleting project:', error)
        return { error: error.message }
    }


    revalidatePath('/new/admin/projects')
    revalidatePath('/new')
}

export async function updateProject(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const medium = formData.get('medium') as string
    const description = formData.get('description') as string
    const content = formData.get('content') as string
    const repo = formData.get('repo') as string

    // Parse arrays
    const stack = (formData.get('stack') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const images = (formData.get('images') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []

    const { error } = await supabase.from('projects').update({
        title,
        category,
        medium,
        description,
        content,
        repo: repo || null,
        stack,
        images,
        updated_at: new Date().toISOString()
    }).eq('id', id)

    if (error) {
        console.error('Error updating project:', error)
        return { error: error.message }
    }

    revalidatePath('/new/admin/projects')
    revalidatePath(`/new/work/${id}`)
    revalidatePath('/new')
    return { success: true }
}
