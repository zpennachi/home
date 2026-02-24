'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateContent(id: string, value: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('site_content')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) {
        console.error('Error updating content:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content')
    return { success: true }
}
