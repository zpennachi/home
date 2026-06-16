import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
    console.error("Missing credentials in .env.local")
    process.exit(1)
}

const supabase = createClient(url, anonKey)

async function inspect() {
    console.log("Inspecting database...")
    
    // Check if there are other tables or data in '365' or other tables
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables') // if RPC exists
    
    // Let's do a direct select on common tables
    const checkTable = async (name: string) => {
        try {
            const { data, error, count } = await supabase.from(name).select('*', { count: 'exact', head: false })
            if (error) {
                console.log(`Table "${name}": Error -`, error.message)
            } else {
                console.log(`Table "${name}": Found ${data?.length} rows (count: ${count})`)
                if (data && data.length > 0) {
                    console.log(`Sample row from "${name}":`, JSON.stringify(data[0], null, 2))
                    console.log(`All rows IDs from "${name}":`, data.map((r: any) => r.id || r.title))
                }
            }
        } catch (e: any) {
            console.log(`Table "${name}": Exception -`, e.message)
        }
    }

    await checkTable('projects')
    await checkTable('365')
    await checkTable('design_tokens')
    await checkTable('site_content')
}

inspect()
