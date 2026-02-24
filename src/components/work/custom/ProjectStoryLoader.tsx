"use client";

import { PROJECT_STORIES } from "./registry";
import React from "react";

interface ProjectStoryLoaderProps {
    slug: string;
}

export default function ProjectStoryLoader({ slug }: ProjectStoryLoaderProps) {
    const Component = (PROJECT_STORIES as any)[slug];

    if (!Component) return null;

    return <Component />;
}
