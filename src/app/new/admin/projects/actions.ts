
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import localProjects from '@/data/projects.json'

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
    const status = (formData.get('status') as string) || 'published'

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
        images,
        status
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
    const status = (formData.get('status') as string) || 'published'

    // Parse arrays
    const stack = (formData.get('stack') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const images = (formData.get('images') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []

    const { error } = await supabase.from('projects').upsert({
        id,
        title,
        category,
        medium,
        description,
        content,
        repo: repo || null,
        stack,
        images,
        status,
        source: 'supabase'
    })

    if (error) {
        console.error('Error updating project:', error)
        return { error: error.message }
    }

    revalidatePath('/new/admin/projects')
    revalidatePath(`/new/work/${id}`)
    revalidatePath('/new')
    return { success: true }
}

export async function toggleProjectVisibility(id: string, currentStatus: string) {
    const supabase = await createClient()
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'

    // Check if the project already exists in the database
    const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('id', id)
        .single()

    let error

    if (existing) {
        const { error: err } = await supabase
            .from('projects')
            .update({ status: newStatus })
            .eq('id', id)
        error = err
    } else {
        // Find local project and upsert it with the new visibility status
        const local = localProjects.find(p => p.id === id)
        if (local) {
            const { error: err } = await supabase
                .from('projects')
                .upsert({
                    id: local.id,
                    title: local.title,
                    category: local.category,
                    medium: local.medium,
                    description: local.description,
                    content: local.content,
                    repo: local.repo || null,
                    stack: local.stack || [],
                    images: local.images || [],
                    branding: (local as any).branding || null,
                    status: newStatus,
                    source: 'supabase'
                })
            error = err
        } else {
            error = { message: 'Project not found' }
        }
    }

    if (error) {
        console.error('Error toggling project status:', error)
        return { error: error.message }
    }

    revalidatePath('/new/admin/projects')
    revalidatePath('/new')
    revalidatePath('/new/work')
    revalidatePath(`/new/work/${id}`)
    return { success: true }
}
