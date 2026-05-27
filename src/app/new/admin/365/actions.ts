
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function create365Entry(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const medium = formData.get('medium') as string
    const file = formData.get('file') as string

    const { error } = await supabase.from('365').insert({
        title,
        category,
        medium,
        file,
    })

    if (error) {
        console.error('Error creating entry:', error)
        return { error: error.message }
    }

    revalidatePath('/new/admin/365')
    revalidatePath('/new') // Updates homepage
    return { success: true }
}

export async function delete365Entry(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('365').delete().eq('id', id)

    if (error) {
        console.error('Error deleting entry:', error)
        return { error: error.message }
    }

    revalidatePath('/new/admin/365')
    revalidatePath('/new')
}
