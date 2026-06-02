export function ToolStack() {
    return (
        <section className="container py-24 md:py-48 border-t border-muted" >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32">

                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-2xl md:text-4xl font-light tracking-tight text-foreground">
                        Technical Stack
                    </h2>
                    <p className="text-muted-fg/80 text-base font-normal leading-relaxed max-w-sm">
                        A curated selection of tools and technologies used to build immersive digital products at the intersection of design and engineering.
                    </p>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                    {/* Category 1 */}
                    <div className="space-y-4">
                        <h3 className="text-xs md:text-sm font-mono uppercase tracking-wider font-semibold text-foreground border-b border-muted pb-2 flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                            Spatial Computing
                        </h3>
                        <ul className="space-y-1.5 text-base font-normal text-muted-fg/80">
                            <li className="hover:text-foreground transition-colors">React Three Fiber (R3F)</li>
                            <li className="hover:text-foreground transition-colors">Three.js / WebGL</li>
                            <li className="hover:text-foreground transition-colors">GLSL Shaders</li>
                            <li className="hover:text-foreground transition-colors">Rapier Physics</li>
                        </ul>
                    </div>
                    {/* Category 2 */}
                    <div className="space-y-4">
                        <h3 className="text-xs md:text-sm font-mono uppercase tracking-wider font-semibold text-foreground border-b border-muted pb-2 flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                            Interface Engineering
                        </h3>
                        <ul className="space-y-1.5 text-base font-normal text-muted-fg/80">
                            <li className="hover:text-foreground transition-colors">Next.js / Server Components</li>
                            <li className="hover:text-foreground transition-colors">TypeScript / Rust</li>
                            <li className="hover:text-foreground transition-colors">Tailwind CSS / PostCSS</li>
                            <li className="hover:text-foreground transition-colors">Framer Motion</li>
                        </ul>
                    </div>
                    {/* Category 3 */}
                    <div className="space-y-4">
                        <h3 className="text-xs md:text-sm font-mono uppercase tracking-wider font-semibold text-foreground border-b border-muted pb-2 flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                            Interactive / XR
                        </h3>
                        <ul className="space-y-1.5 text-base font-normal text-muted-fg/80">
                            <li className="hover:text-foreground transition-colors">WebXR / VisionOS</li>
                            <li className="hover:text-foreground transition-colors">A-Frame / 8th Wall</li>
                            <li className="hover:text-foreground transition-colors">Unity (C#)</li>
                            <li className="hover:text-foreground transition-colors">TouchDesigner</li>
                        </ul>
                    </div>
                    {/* Category 4 */}
                    <div className="space-y-4">
                        <h3 className="text-xs md:text-sm font-mono uppercase tracking-wider font-semibold text-foreground border-b border-muted pb-2 flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                            Workflow
                        </h3>
                        <ul className="space-y-1.5 text-base font-normal text-muted-fg/80">
                            <li className="hover:text-foreground transition-colors">Figma / Spline</li>
                            <li className="hover:text-foreground transition-colors">Blender / Houdini</li>
                            <li className="hover:text-foreground transition-colors">Git / CI/CD</li>
                            <li className="hover:text-foreground transition-colors">Vercel / Supabase</li>
                        </ul>
                    </div>
                </div>

            </div>
        </section >
    );
}
