"use client";

import dynamic from "next/dynamic";

const ParticleField = dynamic(
    () => import("./ParticleField").then((mod) => mod.ParticleField),
    { ssr: false }
);

export function ParticleBackground() {
    return <ParticleField />;
}
