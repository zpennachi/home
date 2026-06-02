import { FloatingShape3D } from './FloatingShape3D';

export function Manifesto() {
    return (
        <section id="manifesto" className="container py-24 md:py-48 border-t border-muted">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32">

                {/* Label */}
                <div className="lg:col-span-4 flex flex-col justify-between h-full min-h-[220px]">
                    <div className="space-y-6">
                        <h2 className="text-2xl md:text-4xl font-light tracking-tight text-foreground">
                            Creative Technology
                        </h2>
                    </div>
                    {/* Floating 3D Accent Shape */}
                    <FloatingShape3D type="cube" className="w-28 h-28 md:w-36 md:h-36 mt-8 opacity-80" />
                </div>

                <div className="lg:col-span-8 space-y-12">
                    <p className="text-2xl md:text-3xl font-light text-foreground/95 leading-relaxed tracking-tight">
                        Websites, web applications, 3D experiences, design systems, internal tools, and the systems that connect them.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-muted">
                        <div className="space-y-3">
                            <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-foreground">Web & Product Development</h3>
                            <p className="text-muted-fg/80 text-base font-normal leading-relaxed">
                                Marketing websites, web applications, dashboards, design systems, and frontend architecture.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-foreground">Interactive Experiences</h3>
                            <p className="text-muted-fg/80 text-base font-normal leading-relaxed">
                                3D, WebGL, AR, realtime graphics, creative technology, and experimental digital experiences.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
