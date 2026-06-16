import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/work/Hero";
import { Manifesto } from "@/components/work/Manifesto";
import { ToolStack } from "@/components/work/ToolStack";
import { DynamicGrid } from "@/components/work/DynamicGrid";
import { ParticleBackground } from "@/components/work/ParticleBackground";
import localProjects from "@/data/projects.json";

export default async function Home() {
  const supabase = await createClient();

  const { data: entries, error: entriesError } = await supabase
    .from('365')
    .select('id, title, category, medium, file')
    .order('id', { ascending: false });

  const { data: dbProjects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, category, medium, images, description, content, stack, repo, branding, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const projects = dbProjects && dbProjects.length > 0
    ? dbProjects
    : localProjects.map((p: any) => ({
        ...p,
        status: p.status || 'published',
        source: p.source || 'local'
      }));

  if (entriesError || projectsError) {
    console.error("Supabase error trace:", JSON.stringify(entriesError || projectsError, null, 2));
    // Continue rendering even if fetch fails, to show the static content
  }

  return (
    <main className="selection:bg-foreground selection:text-background relative">

      {/* Global Ambient Particle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleBackground />
      </div>

      {/* 1. THE HOOK - Contains Hero Content Layer */}
      <Hero />

      {/* 2. THE PHILOSOPHY */}
      <Manifesto />

      {/* 3. THE ARSENAL - Solid */}
      <ToolStack />

      {/* 4. THE OUTPUT - Solid */}
      <section id="work" className="relative z-10 container py-24">
        <div className="max-w-3xl space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-sm font-normal uppercase tracking-[0.2em] text-foreground">Selected Works</h2>
            <p className="text-xs font-mono text-muted-fg/60">2023 — Present</p>
          </div>

          <div>
            <DynamicGrid entries={entries} projects={projects} />
          </div>
          
        </div>
      </section>
    </main>
  );
}
