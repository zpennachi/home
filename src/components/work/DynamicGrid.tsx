"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectThumbnail } from "./ProjectThumbnail";
import { WorkFilter } from "./WorkFilter";
import { cn } from "@/lib/utils";

export interface ProjectEntry {
    id: number | string;
    title: string;
    category: string;
    medium: string;
    file: string | string[] | null;
    branding?: any;
    type?: 'project' | 'entry';
}

interface DynamicGridProps {
    entries: ProjectEntry[] | null;
    projects?: any[] | null;
}

export function DynamicGrid({ entries, projects }: DynamicGridProps) {
    const [activeCategory, setActiveCategory] = useState("All");

    // Combine projects and entries
    const allItems = useMemo(() => {
        const pItems = (projects || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            medium: p.medium,
            file: p.images?.[0] || null,
            branding: p.branding || null,
            type: 'project'
        }));

        const eItems = (entries || []).map(e => ({
            ...e,
            type: 'entry' as const
        }));

        return [...pItems, ...eItems];
    }, [entries, projects]);


    // Extract unique categories
    const categories = useMemo(() => {
        if (!allItems.length) return ["All"];
        const unique = Array.from(new Set(allItems.map(e => e.category)));
        return ["All", ...unique.sort()];
    }, [allItems]);

    // Filter logic
    const filteredEntries = useMemo(() => {
        if (!allItems.length) return [];
        if (activeCategory === "All") return allItems;
        return allItems.filter(e => e.category === activeCategory);
    }, [allItems, activeCategory]);

    if (!allItems || allItems.length === 0) return null;

    return (
        <div>
            <WorkFilter
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20 auto-rows-fr grid-flow-dense">
                <AnimatePresence mode="popLayout">
                    {filteredEntries.map((entry, i) => {
                        // Standardize all cards
                        const spanClass = "flex flex-col group/card col-span-1";
                        const aspectClass = "aspect-[4/5]";

                        const href = `/new/work/${entry.id}`;

                        return (
                            <motion.div
                                layout
                                key={entry.id}
                                className={spanClass}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                            >
                                <Link href={href} className="group cursor-pointer h-full flex flex-col relative">
                                    {/* Image Frame */}
                                    <div className={cn("relative bg-muted overflow-hidden mb-8 transition-all duration-700 ease-[0.2,0,0,1] group-hover:scale-[1.02] rounded-md shadow-lg shadow-black/5 ring-1 ring-foreground/5", aspectClass)}>
                                        <ProjectThumbnail
                                            id={String(entry.id)}
                                            files={entry.file}
                                            title={entry.title}
                                            branding={entry.type === 'project' ? entry.branding : undefined}
                                        />
                                        <div className="absolute inset-0 bg-background/5 group-hover:bg-transparent transition-colors duration-500" />

                                        {/* Hover Overlay Mono metadata */}
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <span className="text-[8px] font-mono uppercase tracking-[0.4em] bg-foreground text-background px-2 py-1 rounded-sm font-black">
                                                Exhibition Ref. {i.toString().padStart(3, '0')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Typography */}
                                    <div className="flex flex-col gap-4 mt-auto px-1">
                                        <h3 className="text-2xl md:text-3xl font-display font-light uppercase tracking-tighter leading-none group-hover:text-accent transition-colors line-clamp-2">
                                            {entry.title}
                                        </h3>
                                        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em] font-black text-muted-fg border-t border-muted pt-4 group-hover:border-foreground transition-colors group-active:translate-y-1 transition-transform">
                                            <span>{entry.category}</span>
                                            <span className="opacity-40">{entry.medium}</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
