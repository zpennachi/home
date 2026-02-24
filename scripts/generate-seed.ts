
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load env vars from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // or SERVICE_ROLE_KEY if RLS blocks anon inserts, but we can use anon here if we just sign in or if we have service role. Let's assume user will run this locally where they might need service role if RLS is strict for anon. Wait, the policy "Admin Manage Projects" allows 'authenticated'. 'anon' cannot write.
// Actually, for a seed script, it's best to use SERVICE_ROLE_KEY to bypass RLS, or sign in.
// But we might not have SERVICE_ROLE_KEY in .env.local (usually it's not there for security).
// Let's ask user to provide it or relax RLS for a moment? 
// No, the user provided .env.local content earlier, it only has URL and ANON_KEY.
// We can use the ANON_KEY and rely on the fact that we might NOT need to be authenticated IF we temporarily allow public insert OR we prompt user to insert via UI.
// But to script it, we need write access.
// Let's assume the user has the SERVICE_ROLE_KEY available or we can ask them to run SQL to allow anon insert temporarily? 
// BETTER IDEA: The user can run specific SQL to insert data. 
// OR: We can use the existing 'Authenticated' policy and sign in with email/password in the script? No, that's complex.
// EASIEST: Generate SQL INSERT statements from the JSON! Then user just runs the SQL. Secure and simple.

// So this script will generate a storage.sql file with INSERT statements.

const projectsPath = path.join(process.cwd(), 'src', 'data', 'projects.json')
const outputPath = path.join(process.cwd(), 'supabase', 'seed-data.sql')

const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'))

let sql = `-- Seed data for projects table\n`

const formatArray = (arr: any[]) => {
  if (!arr || arr.length === 0) return 'ARRAY[]::text[]'
  const items = arr.map(item => `'${item.replace(/'/g, "''")}'`).join(', ')
  return `ARRAY[${items}]`
}

projects.forEach((p: any) => {
  const images = formatArray(p.images)
  const stack = formatArray(p.stack)
  const content = p.content ? `'${p.content.replace(/'/g, "''")}'` : 'NULL' // Escape single quotes
  const description = p.description ? `'${p.description.replace(/'/g, "''")}'` : 'NULL'
  const title = p.title.replace(/'/g, "''")
  const category = p.category.replace(/'/g, "''")
  const medium = p.medium.replace(/'/g, "''")
  const repo = p.repo ? `'${p.repo}'` : 'NULL'
  const id = p.id

  sql += `
INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('${id}', '${title}', '${category}', '${medium}', ${description}, ${content}, ${stack}, ${repo}, ${images}, 'supabase')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  images = EXCLUDED.images;
`
})

fs.writeFileSync(outputPath, sql)

console.log(`Generated SQL seed file at ${outputPath}`)
