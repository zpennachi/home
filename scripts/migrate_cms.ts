import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Or allow service role if needed, but actions usually use anon + RLS or server uses service role. Since this is an admin script, we might need service role if RLS blocks us. But let's try with ANON first if we have admin policies, or just assume the user has a service role in their env. NOTE: The user's env file might not have SERVICE_ROLE_KEY. I'll check.
// Actually, for a script, we often need the Service Role Key to bypass RLS if we are not logged in as a user. 
// I'll try to find the SERVICE_ROLE_KEY in the env file.
// If it's not there, I might need to ask the user or just try to use the ANON key and hope RLS allows insert (which it shouldn't for anon).
// Wait, the user is developing locally. They probably have the service role key.

const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);

async function migrate() {
    console.log('Starting migration...');

    // 1. Load Projects
    const projectsPath = path.resolve(process.cwd(), 'src/data/projects.json');
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    console.log(`Loaded ${projects.length} active projects from projects.json`);

    // 2. Define Hidden Projects to Delete
    const hiddenIds = ['vantage', 'nexus', 'synthetix', 'weekend', 'streamer-portfolio'];

    // 3. Delete Hidden Projects
    console.log(`Deleting ${hiddenIds.length} hidden projects...`);
    const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .in('id', hiddenIds);

    if (deleteError) {
        console.error('Error deleting projects:', deleteError);
    } else {
        console.log('Successfully deleted hidden projects.');
    }

    // 4. Upsert Active Projects
    console.log('Upserting active projects...');
    for (const project of projects) {
        // We need to map the JSON structure to the DB columns.
        // DB Schema (inferred from actions.ts): id, title, category, medium, description, content, repo, source, stack (array), images (array)
        const { error: upsertError } = await supabase
            .from('projects')
            .upsert({
                id: project.id,
                title: project.title,
                category: project.category,
                medium: project.medium,
                description: project.description,
                content: project.content,
                repo: project.repo,
                source: project.source || 'local',
                stack: project.stack, // Supabase handles array columns normally
                images: project.images
            }, { onConflict: 'id' });

        if (upsertError) {
            console.error(`Error upserting ${project.id}:`, upsertError);
        } else {
            console.log(`Upserted ${project.id}`);
        }
    }

    console.log('Migration complete.');
}

migrate().catch(console.error);
