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

async function test() {
    const { data, error } = await supabase.from('365').select('*')
    if (error) {
        console.error("Error:", error)
    } else {
        console.log("Success! Found 365 rows:", data.length)
        data.forEach((row: any) => {
            console.log(`ID: ${row.id} | Title: "${row.title}" | Category: "${row.category}" | Medium: "${row.medium}"`)
        })
    }
}

test()
