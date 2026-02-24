import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { CaseStudyLayout } from "@/components/work/CaseStudyLayout";
import { Metadata } from "next";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import localProjects from "@/data/projects.json";

export const dynamicParams = true;

export async function generateStaticParams() {
    const { data: supabaseProjects } = await supabase.from('projects').select('id');

    // Combine IDs from both sources
    const supabaseIds = (supabaseProjects || []).map(p => p.id);
    const localIds = localProjects.map(p => p.id);
    const allIds = Array.from(new Set([...supabaseIds, ...localIds]));

    return allIds.map((id) => ({
        slug: id,
    }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const { slug } = params;

    let { data: project } = await supabase.from('projects').select('*').eq('id', slug).single();

    // Fallback to local
    if (!project) {
        const local = localProjects.find(p => p.id === slug);
        if (local) {
            project = {
                ...local,
                // Ensure compatibility if types differ slightly
            } as any;
        }
    }

    if (!project) return { title: "Project Not Found" };

    return {
        title: `${project.title} — ZPennachi`,
        description: project.description,
    };
}

import ProjectVisualLoader from '@/components/work/custom/ProjectVisualLoader';
import ProjectStoryLoader from '@/components/work/custom/ProjectStoryLoader';

export default async function ProjectPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;

    let { data: project } = await supabase.from('projects').select('*').eq('id', params.slug).single();

    // Fallback to local JSON
    if (!project) {
        const local = localProjects.find(p => p.id === params.slug);
        if (local) {
            project = {
                ...local,
                created_at: new Date().toISOString() // Mock missing DB fields
            } as any;
        }
    }

    if (!project) {
        notFound();
    }

    const customVisual = <ProjectVisualLoader slug={params.slug} />;
    const customStory = <ProjectStoryLoader slug={params.slug} />;

    // Map JSON data to CaseStudyLayout props
    return (
        <CaseStudyLayout
            id={project.id}
            title={project.title}
            category={project.category}
            role="Lead Engineer" // TODO: Add to JSON
            year="2024" // TODO: Add to JSON
            description={project.description}
            stack={project.stack}
            customVisual={customVisual}
            branding={project.branding}
        >
            {customStory}

            {/* Fallback Content (Only show if no story, OR if story wants to render content below? 
                Usually customStory replaces the whole view, but here we might want text below.
                For now, let's render text if it's there, but usually the Story component handles the full layout override if needed.
                Actually, CaseStudyLayout renders children below the fold. 
                So we WANT the content here.
            */}

            <div className="prose dark:prose-invert mt-24">
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                >
                    {project.content || ""}
                </ReactMarkdown>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-24 lg:my-32">
                {project.images?.slice(1).map((img: string, i: number) => (
                    <div key={i} className="group relative aspect-video bg-muted overflow-hidden rounded-2xl edge-accent shadow-2xl shadow-black/10 transition-transform hover:scale-[1.01]">
                        <img src={img} alt={`Project shot ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-background/10 group-hover:bg-transparent transition-colors" />
                    </div>
                ))}
            </div>

            {/* Display Repo Link if available */}
            {project.repo && (
                <div className="mt-32 pt-12 border-t border-muted flex justify-center">
                    <a
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-4 px-8 py-4 bg-foreground text-background rounded-full font-mono text-[10px] uppercase tracking-[0.2em] font-black hover:scale-105 transition-transform shadow-2xl"
                    >
                        <span>Access Source Repository</span>
                        <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                    </a>
                </div>
            )}
        </CaseStudyLayout >
    );
}
