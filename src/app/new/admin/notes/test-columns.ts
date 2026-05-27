import { createClient } from '@/lib/supabase/server'

export async function checkColumns() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('notes')
        .select('transcript')
        .limit(1)

    if (error) {
        console.error('Column Check Error:', error)
        return false
    }
    console.log('Column transcript exists')
    return true
}
