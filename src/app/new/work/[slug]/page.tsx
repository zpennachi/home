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
    let supabaseIds: string[] = [];
    let supabase365Ids: string[] = [];

    try {
        const { data: supabaseProjects } = await supabase.from('projects').select('id').eq('status', 'published');
        if (supabaseProjects) {
            supabaseIds = supabaseProjects.map((p: any) => String(p.id));
        }
    } catch (e) {
        console.error("Error fetching projects for generateStaticParams:", e);
    }

    try {
        const { data: supabase365 } = await supabase.from('365').select('id');
        if (supabase365) {
            supabase365Ids = supabase365.map((e: any) => String(e.id));
        }
    } catch (e) {
        console.error("Error fetching 365 for generateStaticParams:", e);
    }

    const localIds = localProjects.map(p => String(p.id));
    const allIds = Array.from(new Set([...supabaseIds, ...supabase365Ids, ...localIds]));

    return allIds.map((id) => ({
        slug: id,
    }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const { slug } = params;

    let project: any = null;

    try {
        const { data: dbProject } = await supabase.from('projects').select('*').eq('id', slug).eq('status', 'published').single();
        if (dbProject) {
            project = dbProject;
        }
    } catch (e) {
        console.error("Error fetching project in generateMetadata:", e);
    }

    // Fallback to local
    if (!project) {
        const local = localProjects.find(p => String(p.id) === slug);
        if (local) {
            project = {
                ...local,
            } as any;
        }
    }

    // Fallback to 365 daily
    if (!project) {
        try {
            const { data: daily } = await supabase.from('365').select('*').eq('id', slug).single();
            if (daily) {
                project = {
                    title: daily.title,
                    description: daily.description,
                };
            }
        } catch (e) {
            console.error("Error fetching 365 entry in generateMetadata:", e);
        }
    }

    if (!project) return { title: "Project Not Found" };

    return {
        title: `${project.title} — ZPennachi`,
        description: project.description || "",
    };
}

import ProjectVisualLoader from '@/components/work/custom/ProjectVisualLoader';
import ProjectStoryLoader from '@/components/work/custom/ProjectStoryLoader';

export default async function ProjectPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;

    let project: any = null;
    let isDailyEntry = false;

    try {
        const { data: dbProject } = await supabase.from('projects').select('*').eq('id', params.slug).eq('status', 'published').single();
        if (dbProject) {
            project = dbProject;
        }
    } catch (e) {
        console.error("Error fetching project in ProjectPage:", e);
    }

    // Fallback to local JSON
    if (!project) {
        const local = localProjects.find(p => String(p.id) === params.slug);
        if (local) {
            project = {
                ...local,
                created_at: new Date().toISOString() // Mock missing DB fields
            } as any;
        }
    }

    // Fallback to 365 daily entry
    if (!project) {
        try {
            const { data: daily } = await supabase.from('365').select('*').eq('id', params.slug).single();
            if (daily) {
                isDailyEntry = true;
                // Normalize files
                let imagesList: string[] = [];
                if (daily.file) {
                    if (Array.isArray(daily.file)) {
                        imagesList = daily.file;
                    } else if (typeof daily.file === 'string') {
                        try {
                            const parsed = JSON.parse(daily.file);
                            imagesList = Array.isArray(parsed) ? parsed : [daily.file];
                        } catch {
                            imagesList = [daily.file];
                        }
                    }
                }
                project = {
                    id: String(daily.id),
                    title: daily.title,
                    category: daily.category,
                    medium: daily.medium,
                    description: daily.description || "",
                    content: daily.description || "",
                    stack: daily.medium ? daily.medium.split(',').map((s: string) => s.trim()) : [],
                    repo: "",
                    images: imagesList,
                    branding: null,
                    created_at: daily.created_at,
                    source: '365'
                };
            }
        } catch (e) {
            console.error("Error fetching 365 entry in ProjectPage:", e);
        }
    }

    if (!project) {
        notFound();
    }

    const firstImage = project.images?.[0] || null;
    const isVideo = firstImage && (firstImage.endsWith('.mp4') || firstImage.endsWith('.webm') || firstImage.endsWith('.ogg'));
    const isAudio = firstImage && (firstImage.endsWith('.mp3') || firstImage.endsWith('.wav') || firstImage.endsWith('.ogg'));

    let customVisual: React.ReactNode = null;
    if (isVideo) {
        customVisual = <video src={firstImage} autoPlay muted loop playsInline className="w-full h-full object-cover" />;
    } else if (isAudio) {
        customVisual = (
            <div className="w-full h-full flex items-center justify-center bg-muted">
                <audio src={firstImage} controls className="w-full max-w-md" />
            </div>
        );
    } else if (['particle-life-131', 'MVPIQ', 'weekend', '0ghost-chat', 'hawkeye', 'log-slice'].includes(params.slug)) {
        customVisual = <ProjectVisualLoader slug={params.slug} />;
    }

    const customStory = <ProjectStoryLoader slug={params.slug} />;

    return (
        <CaseStudyLayout
            id={project.id}
            title={project.title}
            category={project.category}
            role={project.role || (isDailyEntry ? "Creator" : "Lead Engineer")}
            year={project.created_at ? new Date(project.created_at).getFullYear().toString() : "2024"}
            description={project.description}
            stack={project.stack}
            heroImage={!isVideo && !isAudio ? firstImage : null}
            customVisual={customVisual}
            branding={project.branding}
        >
            {customStory}

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
                    <div key={i} className="group relative aspect-video bg-muted overflow-hidden rounded-md shadow-2xl shadow-black/10 transition-transform hover:scale-[1.01]">
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
