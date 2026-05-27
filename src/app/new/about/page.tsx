import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About — ZPennachi",
    description: "Design Engineer bridging the gap between visual intuition and engineering rigor.",
};

const EXPERIENCE = [
    {
        role: "Senior Design Engineer",
        company: "Current Studio",
        period: "2023 — Present",
        desc: "Leading the development of immersive web experiences and design systems for global brands. Bridging the gap between design and engineering teams."
    },
    {
        role: "Creative Technologist",
        company: "Agency X",
        period: "2021 — 2023",
        desc: "Prototyped and built experimental AR/VR activations and WebGL-heavy landing pages."
    },
    {
        role: "Frontend Developer",
        company: "Tech Corp",
        period: "2019 — 2021",
        desc: "Built scalable React applications and maintained the core component library."
    }
];

export default function AboutPage() {
    return (
        <main className="container py-12 md:py-24 space-y-32">

            {/* Bio Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 lg:col-start-1">
                    <h1 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.1] mb-12">
                        I build digital objects that feel <span className="text-muted-fg italic">alive</span>.
                    </h1>
                    <div className="space-y-8 text-lg md:text-xl leading-relaxed text-muted-fg max-w-2xl">
                        <p>
                            My background is a hybrid of traditional graphic design and computer science.
                            I don't see them as separate disciplines, but as two sides of the same coin.
                        </p>
                        <p>
                            <strong className="text-foreground">Code is my material.</strong> Just as a carpenter understands wood,
                            I understand the browser's rendering engine, the GPU's pipeline, and the user's interaction patterns.
                        </p>
                        <p>
                            By controlling the full stack—from the initial Figma vector to the final GLSL shader—I can execute ideas
                            with a fidelity that is lost in traditional handoffs.
                        </p>
                    </div>
                </div>

                {/* Placeholder for Photo */}
                <div className="lg:col-span-4 h-full min-h-[400px] bg-muted relative overflow-hidden rounded-sm">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-fg text-sm uppercase tracking-widest">
                        [ Author Portrait ]
                    </div>
                </div>
            </section>

            {/* Experience Section */}
            <section className="border-t border-muted pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4">
                        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-fg">Experience</h2>
                    </div>
                    <div className="lg:col-span-8 space-y-16">
                        {EXPERIENCE.map((item, i) => (
                            <div key={i} className="group">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4">
                                    <h3 className="text-2xl font-medium text-foreground group-hover:text-muted-fg transition-colors">
                                        {item.role}
                                    </h3>
                                    <span className="text-sm text-muted-fg font-mono mt-1 md:mt-0">
                                        {item.company} / {item.period}
                                    </span>
                                </div>
                                <p className="text-lg text-muted-fg max-w-xl leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </main>
    );
}
