"use client";

import { cn } from "@/lib/utils";
import { getProjectStories } from "@/data/projectStories";
import { VisualManager } from "./visuals/VisualManager";
import { motion } from "framer-motion";

interface CaseStudyStoryProps {
    projectId: string;
}

export function CaseStudyStory({ projectId }: CaseStudyStoryProps) {
    const stories = getProjectStories(projectId);

    if (!stories || stories.length === 0) return null;

    return (
        <section className="py-24 md:py-48 bg-background relative overflow-hidden">
            {/* Section Header */}
            <div className="container mb-24 md:mb-32">
                <div className="flex flex-col md:flex-row gap-8 md:items-end justify-between border-b border-muted pb-8">
                    <div>
                        <h2 className="text-4xl md:text-7xl font-display font-light uppercase tracking-tighter leading-none mb-4">
                            Deep Dive
                        </h2>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-fg">
                            Visual Breakdown // {projectId}
                        </p>
                    </div>
                    <p className="max-w-md text-sm md:text-base text-muted-fg leading-relaxed">
                        A closer look at the key technical and design challenges solved during the development of this project.
                    </p>
                </div>
            </div>

            <div className="container space-y-32 md:space-y-48">
                {stories.map((story, i) => {
                    const isEven = i % 2 === 0;

                    return (
                        <div key={story.id} className={cn(
                            "flex flex-col gap-12 md:gap-24 items-center",
                            isEven ? "md:flex-row" : "md:flex-row-reverse"
                        )}>
                            {/* Visual Side */}
                            <motion.div
                                className="w-full md:w-1/2 aspect-video md:aspect-[4/3] relative rounded-2xl md:rounded-3xl overflow-hidden bg-muted shadow-2xl shadow-black/10 edge-accent ring-1 ring-black/5"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                            >
                                <div className="absolute inset-0">
                                    <VisualManager projectId={story.projectId} variant={story.visualVariant} />
                                </div>
                            </motion.div>

                            {/* Text Side */}
                            <motion.div
                                className="w-full md:w-5/12 space-y-8"
                                initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] bg-accent/10 text-accent px-2 py-1 rounded-sm">
                                            0{i + 1}
                                        </span>
                                        <div className="h-px flex-1 bg-muted" />
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tight leading-[0.9]">
                                        {story.title}
                                    </h3>
                                </div>
                                <p className="text-lg text-muted-fg font-light leading-relaxed">
                                    {story.description}
                                </p>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
