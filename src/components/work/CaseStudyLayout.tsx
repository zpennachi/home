"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import { ProjectThumbnail } from "./ProjectThumbnail";
import { VisualManager, hasVisualComponent } from "./visuals/VisualManager";
import { CaseStudyStory } from "./CaseStudyStory";

interface CaseStudyLayoutProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
    title?: string;
    category?: string;
    role?: string;
    year?: string;
    description?: string;
    stack?: string[];
    heroImage?: string | null;
    customVisual?: React.ReactNode;
    branding?: {
        primaryColor: string;
        secondaryColor: string;
        pattern: string;
    } | null;
}

export function CaseStudyLayout({
    children,
    className,
    id,
    title,
    category,
    role,
    year,
    description,
    stack,
    heroImage,
    customVisual,
    branding
}: CaseStudyLayoutProps) {

    // Full Page Hero Logic (Particle Life)
    const isFullPageHero = id === 'particle-life-131';

    // Stable "Other Projects" selection to avoid Hydration Mismatch
    // (Random.math() in render causes server/client diffs)
    const allowedIds = ['OHM-site', '0ghost-chat', 'MVPIQ', 'Volumetric-Design-System-ESR--main'];
    const otherProjects = projectsData
        .filter(p => p.id !== id && allowedIds.includes(p.id))
        .slice(0, 3); // Deterministic slice

    return (
        <article className={cn(
            "min-h-screen text-foreground selection:bg-foreground selection:text-background relative",
            isFullPageHero ? "bg-transparent" : "bg-background",
            className
        )}>

            {/* Full Screen Interactive Background */}
            {isFullPageHero && hasVisualComponent(id || '') && (
                <div className="fixed inset-0 w-full h-screen z-0">
                    <div className="absolute inset-0 bg-background/20 z-10" /> {/* Minimal dimming */}
                    <div className="w-full h-full opacity-100">
                        <VisualManager projectId={id || ''} variant="complexity" />
                    </div>
                    {/* Gradient Fade at bottom to blend into content */}
                    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-background to-transparent z-20" />
                </div>
            )}

            <div className="container mx-auto px-6 md:px-12 pt-12 pb-32 max-w-screen-xl relative z-10">

                {/* Back Link */}
                <div className="mb-12">
                    <Link
                        href="/new/work"
                        className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest hover:underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity mix-blend-difference text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>All Work</span>
                    </Link>
                </div>

                {/* Header */}
                <header className="mb-32 relative z-20">
                    <div className="flex flex-col lg:flex-row gap-16 lg:items-start justify-between border-b border-muted/30 pb-16 mb-16 transition-all duration-500">
                        <div className="space-y-8 flex-1">
                            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-fg/70 font-light">
                                <span className="text-accent font-normal">/</span>
                                <span>{category}</span>
                                <span className="opacity-20">|</span>
                                <span>{year}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-[1.1] uppercase">
                                {title?.split(' ').map((word, i) => (
                                    <span key={i} className="block">{word}</span>
                                ))}
                            </h1>
                        </div>

                        <div className="lg:w-1/3 space-y-12">
                             <p className="text-lg md:text-xl font-light leading-relaxed text-foreground/80 tracking-tight">
                                {description}
                            </p>

                            <div className={cn(
                                "grid grid-cols-2 gap-8 pt-8 transition-all duration-500",
                                isFullPageHero
                                    ? "bg-background/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl"
                                    : "border-t border-muted/30"
                            )}>
                                <div>
                                    <h3 className="font-mono uppercase tracking-[0.15em] text-muted-fg/50 mb-2 text-[9px] font-light">Role</h3>
                                    <p className="text-xs font-light tracking-wide uppercase text-foreground">{role}</p>
                                </div>
                                <div>
                                    <h3 className="font-mono uppercase tracking-[0.15em] text-muted-fg/50 mb-2 text-[9px] font-light">Artifacts</h3>
                                    <p className="text-xs font-light tracking-wide uppercase text-foreground">Source Code // Deep Case Study</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        {stack?.map(tech => (
                            <span key={tech} className="px-3 py-1 border border-muted/40 rounded-full text-[10px] uppercase tracking-wider font-light text-muted-fg/80 hover:border-muted-fg transition-colors backdrop-blur-sm">
                                {tech}
                            </span>
                        ))}
                    </div>
                </header>

                {/* Standard Hero / Visual (Hidden for FullPageHero) */}
                {!isFullPageHero && (
                    <div className="w-full aspect-video md:aspect-[21/9] bg-muted rounded-md overflow-hidden mb-16 md:mb-32 relative shadow-2xl shadow-black/20 group">
                        {isFullPageHero ? null : (
                            /* Priority 1: Custom Visual Component from ID */
                            hasVisualComponent(id || '') ? (
                                <div className="w-full h-full absolute inset-0">
                                    <VisualManager projectId={id || ''} />
                                </div>
                            ) : customVisual ? (
                                <div className="w-full h-full absolute inset-0">
                                    {customVisual}
                                </div>
                            ) : heroImage ? (
                                <img
                                    src={heroImage}
                                    alt={title || "Project Hero"}
                                    className="w-full h-full object-cover"
                                />
                            ) : branding ? (
                                <div
                                    className="w-full h-full relative flex items-center justify-center overflow-hidden"
                                    style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
                                >
                                    <div className="absolute inset-0 opacity-10" style={{
                                        backgroundImage: branding.pattern === 'grid' ? `radial-gradient(${branding.primaryColor} 1px, transparent 0)` :
                                            branding.pattern === 'dots' ? `radial-gradient(${branding.primaryColor} 2px, transparent 0)` :
                                                `linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)`,
                                        backgroundSize: '60px 60px'
                                    }} />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20" />

                                    <div className="relative text-center space-y-6">
                                        <div className="p-12 border border-white/20 rounded-full bg-black/10 backdrop-blur-3xl inline-block shadow-2xl scale-125">
                                            <h4 className="text-[10px] font-mono uppercase tracking-[0.6em] text-white/60 mb-2">Deep Synthesis v3.0</h4>
                                            <p className="text-3xl text-white font-display font-light tracking-[0.2em] uppercase">{title}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : null
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="selection:bg-foreground selection:text-background">
                    {children}
                </div>

                {/* Visual Stories / Deep Dive */}
                {id && (
                    <CaseStudyStory projectId={id} />
                )}

                {/* More Work Section */}
                <footer className="border-t border-muted pt-32 mt-32">
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-1.5">
                            <h3 className="text-xl md:text-2xl font-light uppercase tracking-tight leading-none">More Work</h3>
                            <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-fg/70">Exploration // Selection</p>
                        </div>
                        <Link href="/new/work" className="text-[10px] font-mono uppercase tracking-[0.15em] font-light hover:text-accent transition-colors border-b border-accent/40 pb-0.5">
                            View All Work
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {otherProjects.map((project) => (
                            <Link key={project.id} href={`/new/work/${project.id}`} className="group block space-y-6">
                                <div className="aspect-[16/10] bg-muted relative overflow-hidden rounded-md transition-transform hover:scale-[1.02]">
                                    <ProjectThumbnail
                                        id={project.id}
                                        files={project.images && project.images.length > 0 ? project.images : null}
                                        title={project.title}
                                    />
                                    <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors" />
                                </div>
                                <div>
                                    <h4 className="font-light text-lg uppercase tracking-tight group-hover:opacity-75 transition-opacity">{project.title}</h4>
                                    <p className="text-[9px] font-mono uppercase tracking-wider text-muted-fg/70">{project.category}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </footer>

            </div>
        </article>
    );
}
