export function Manifesto() {
    return (
        <section id="manifesto" className="container py-24 md:py-48 border-t border-muted">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32">

                {/* Label */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.4em] text-muted-fg font-black">
                        <span className="text-accent">/</span>
                        <span>Philosophy (001)</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-light leading-[0.9] tracking-tighter uppercase">
                        The Invisible Interface
                    </h2>
                </div>

                <div className="lg:col-span-8 space-y-16">
                    <p className="text-4xl md:text-6xl font-display font-thin text-foreground leading-[1.05] tracking-tight hover:opacity-100 transition-opacity">
                        Engineering is not just about <span className="font-normal italic">function</span>. It is about the <span className="text-accent font-black">emotional density</span> of an interaction.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-muted">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-mono uppercase tracking-widest font-black">High-Density DNA</h3>
                            <p className="text-muted-fg text-sm leading-relaxed">
                                We treat every repository as a living organism. Our synthesis engine extracts the blood, sweat, and shims of development, transforming logs into premium editorial artifacts.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-mono uppercase tracking-widest font-black">Performance First</h3>
                            <p className="text-muted-fg text-sm leading-relaxed">
                                Speed is our aesthetic. By moving heavy computation to the edge and offloading the main thread, we achieve 60fps high-fidelity experiences that feel instantaneous.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
