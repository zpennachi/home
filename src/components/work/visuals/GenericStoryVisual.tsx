import { motion } from "framer-motion";

interface GenericStoryVisualProps {
    title?: string;
    variant: string;
}

export function GenericStoryVisual({ title, variant }: GenericStoryVisualProps) {
    return (
        <div className="w-full h-full bg-zinc-900 flex items-center justify-center p-8 relative overflow-hidden">
            {/* Abstract Background Decoration */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full translate-x-1/3 translate-y-1/3" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 text-center space-y-4"
            >
                <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                        {variant}
                    </span>
                </div>
                {title && (
                    <h3 className="text-2xl md:text-4xl font-display font-light text-white max-w-[12ch] mx-auto leading-tight">
                        {title}
                    </h3>
                )}
            </motion.div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
        </div>
    );
}
