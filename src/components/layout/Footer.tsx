import Link from "next/link"

export function Footer() {
    return (
        <footer className="container py-24 border-t border-muted mt-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 items-start">

                {/* Brand / Copyright */}
                <div className="lg:col-span-6 space-y-8">
                    <Link href="/new" className="text-2xl font-display font-light uppercase tracking-[0.3em] hover:text-accent transition-colors block w-fit">
                        zpennachi
                    </Link>
                    <div className="space-y-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-fg font-bold leading-relaxed">
                        <p>&copy; {new Date().getFullYear()} ZPENNACHI STUDIO // DESIGN ENGINEER</p>
                    </div>
                </div>

                {/* Social Links */}
                <div className="lg:col-span-6 flex flex-col md:items-end gap-12">
                    <div className="flex flex-col md:items-end gap-4">
                        <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-fg font-black">/ Connectivity</span>
                        <nav className="flex flex-wrap md:justify-end gap-x-8 gap-y-4 text-[11px] font-mono uppercase tracking-[0.3em] font-black">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">GitHub</a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Twitter</a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">LinkedIn</a>
                            <a href="mailto:hello@zpennachi.com" className="hover:text-accent transition-colors">Email</a>
                        </nav>
                    </div>
                </div>

            </div>
        </footer>
    );
}
