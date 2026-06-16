import { DynamicGrid } from "@/components/work/DynamicGrid";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
    title: "Work — ZPennachi",
    description: "Selected works and experiments.",
};

export default async function WorkPage() {
    const supabase = await createClient();

    // Query 365 entries from database
    const { data: entries, error: entriesError } = await supabase
        .from('365')
        .select('id, title, category, medium, file')
        .order('id', { ascending: false });

    // Query projects from database
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, category, medium, images, description, created_at, status')
        .order('created_at', { ascending: false });

    if (entriesError || projectsError) {
        console.error("Supabase query error inside WorkPage:", entriesError || projectsError);
    }

    return (
        <main className="container py-12 md:py-24">

            <div className="mb-24 space-y-6">
                <h1 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.1]">
                    Selected Works
                </h1>
                <p className="text-lg text-muted-fg max-w-xl">
                    A collection of commercial projects, experiments, and daily sketches exploring the intersection of design and engineering.
                </p>
            </div>

            <DynamicGrid entries={entries} projects={projects} />

        </main>
    );
}
