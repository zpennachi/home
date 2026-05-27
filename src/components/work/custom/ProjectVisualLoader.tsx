"use client";

import { PROJECT_VISUALS } from "./registry";
import React from "react";

interface ProjectVisualLoaderProps {
    slug: string;
}

export default function ProjectVisualLoader({ slug }: ProjectVisualLoaderProps) {
    const Component = (PROJECT_VISUALS as any)[slug];

    if (!Component) return null;

    return <Component />;
}
