"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WorkFilterProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export function WorkFilter({ categories, activeCategory, onCategoryChange }: WorkFilterProps) {
    return (
        <div className="flex flex-wrap gap-4 mb-12">
            {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={cn(
                            "relative px-4 py-2 text-sm font-mono uppercase tracking-wider rounded-full transition-colors z-10",
                            isActive
                                ? "text-background font-medium"
                                : "text-muted-fg hover:text-foreground"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeFilter"
                                className="absolute inset-0 bg-foreground rounded-full -z-10"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        {category}
                    </button>
                );
            })}
        </div>
    );
}
