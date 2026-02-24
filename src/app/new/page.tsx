import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/work/Hero";
import { Manifesto } from "@/components/work/Manifesto";
import { ToolStack } from "@/components/work/ToolStack";
import { DynamicGrid } from "@/components/work/DynamicGrid";

export default async function Home() {
  const supabase = await createClient();

  const { data: entries, error: entriesError } = await supabase
    .from('365')
    .select('id, title, category, medium, file')
    .limit(10);

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, category, medium, images')
    .order('created_at', { ascending: false });

  if (entriesError || projectsError) {
    console.error("Supabase error trace:", JSON.stringify(entriesError || projectsError, null, 2));
    // Continue rendering even if fetch fails, to show the static content
  }

  return (
    <main className="selection:bg-foreground selection:text-background">

      {/* 1. THE HOOK - Contains PhysicsScene */}
      <Hero />

      {/* 2. THE PHILOSOPHY */}
      <Manifesto />

      {/* 3. THE ARSENAL - Solid */}
      <ToolStack />

      {/* 4. THE OUTPUT - Solid */}
      <section id="work" className="relative z-10 bg-background container py-24 border-t border-muted">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-fg">Selected Works</h2>
          <span className="text-xs text-muted-fg">2023 — Present</span>
        </div>

        <DynamicGrid entries={entries} projects={projects} />
      </section>
    </main>
  );
}
