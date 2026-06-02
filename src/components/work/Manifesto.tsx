export function Manifesto() {
    return (
        <section id="manifesto" className="container py-24 md:py-48 border-t border-muted">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32">

                {/* Label */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-fg font-normal">
                        <span className="text-accent font-normal">/</span>
                        <span>Approach</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-light tracking-tight text-foreground">
                        How I Work
                    </h2>
                </div>

                <div className="lg:col-span-8 space-y-12">
                    <p className="text-2xl md:text-3xl font-light text-foreground/95 leading-relaxed tracking-tight">
                        I build things that feel good to use, blending <span className="italic font-light">motion</span>, <span className="italic font-light">design</span>, and reliable engineering.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-muted">
                        <div className="space-y-3">
                            <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-foreground">Obsessive Details</h3>
                            <p className="text-muted-fg/80 text-base font-normal leading-relaxed">
                                I care deeply about the small interactions. Every animation, layout choice, and line of code is intentional, aiming for a polished and cohesive experience.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-foreground">Performance First</h3>
                            <p className="text-muted-fg/80 text-base font-normal leading-relaxed">
                                Fast sites respect the user's time. I focus on optimizing assets and keeping the main thread clear so interactions feel fluid and immediate.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
