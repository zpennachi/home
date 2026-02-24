import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkColumns() {
    console.log('Checking columns for "notes" table...')

    // Attempt to select columns from the notes table
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error selecting from notes:', error.message)
        process.exit(1)
    }

    if (data && data.length > 0) {
        const columns = Object.keys(data[0])
        console.log('Available columns:', columns.join(', '))
        const required = ['transcript', 'ai_summary']
        const missing = required.filter(col => !columns.includes(col))

        if (missing.length === 0) {
            console.log('SUCCESS: All required columns exist.')
        } else {
            console.error('FAILURE: Missing columns:', missing.join(', '))
        }
    } else {
        console.log('No notes found to inspect columns. Trying a different method...')
        // Handle empty table case
        const { error: colError } = await supabase
            .from('notes')
            .select('transcript, ai_summary')
            .limit(1)

        if (colError) {
            console.error('FAILURE: One or more required columns are MISSING.')
            console.error('Error details:', colError.message)
        } else {
            console.log('SUCCESS: All required columns ("transcript", "ai_summary") exist.')
        }
    }
}

checkColumns()
