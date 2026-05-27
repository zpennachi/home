interface ProjectHeaderProps {
    title: string;
    role: string;
    year: string;
    stack: string[];
}

export function ProjectHeader({ title, role, year, stack }: ProjectHeaderProps) {
    return (
        <header className="mb-24 border-b border-[#E5E5E5] pb-12">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.1] mb-12 text-[#111111]">
                {title}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                <div>
                    <span className="block text-[#6F6F6F] text-xs uppercase tracking-widest mb-2">Role</span>
                    <span className="text-[#111111] font-medium">{role}</span>
                </div>
                <div>
                    <span className="block text-[#6F6F6F] text-xs uppercase tracking-widest mb-2">Year</span>
                    <span className="text-[#111111] font-medium">{year}</span>
                </div>
                <div className="col-span-2">
                    <span className="block text-[#6F6F6F] text-xs uppercase tracking-widest mb-2">Tech Stack</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {stack.map(tech => (
                            <span key={tech} className="text-[#111111] font-medium">{tech}</span>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
