import { DynamicGrid, type ProjectEntry } from "@/components/work/DynamicGrid";
import projectsData from "@/data/projects.json";

export const metadata = {
    title: "Work — ZPennachi",
    description: "Selected works and experiments.",
};

export default function WorkPage() {
    // Map JSON data to grid format
    const entries: ProjectEntry[] = (projectsData as any[]).map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        medium: p.medium,
        file: p.images[0] || null,
        branding: p.branding || null,
        type: "project"
    }));

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

            <DynamicGrid entries={entries} />

        </main>
    );
}
