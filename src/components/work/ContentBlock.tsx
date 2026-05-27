import { cn } from "@/lib/utils";

interface ContentBlockProps {
    label: string;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function ContentBlock({ label, title, children, className }: ContentBlockProps) {
    return (
        <section className={cn("grid grid-cols-1 md:grid-cols-12 gap-8 mb-24", className)}>
            <div className="md:col-span-3">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#E55F0E]">
                    {label}
                </span>
            </div>
            <div className="md:col-span-8 md:col-start-5">
                {title && (
                    <h3 className="text-2xl md:text-3xl font-medium mb-6 text-[#111111]">
                        {title}
                    </h3>
                )}
                <div className="text-lg leading-relaxed text-[#444] space-y-6">
                    {children}
                </div>
            </div>
        </section>
    );
}
