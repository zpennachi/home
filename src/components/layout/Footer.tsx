import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full bg-background/80 backdrop-blur-md border-t border-muted/30 mt-auto">
            <div className="container py-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                {/* Brand Logo & Nav Links */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12">
                    <Link href="/new" className="text-base font-light tracking-[0.15em] hover:opacity-75 transition-opacity block w-fit">
                        zpennachi<span className="text-accent">.</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-[10px] md:text-[11px] font-normal uppercase tracking-[0.15em] text-muted-fg">
                        <Link href="/new/work" className="hover:text-foreground transition-colors">
                            Work
                        </Link>
                        <Link href="/new/about" className="hover:text-foreground transition-colors">
                            About
                        </Link>
                        <Link href="/new/contact" className="hover:text-foreground transition-colors">
                            Contact
                        </Link>
                    </nav>
                </div>

                {/* Contact CTA */}
                <div className="text-sm font-light text-muted-fg/80 tracking-tight">
                    lets work together :) <a href="mailto:z@zpennachi.com" className="text-foreground hover:opacity-70 transition-opacity underline underline-offset-4 font-normal">z@zpennachi.com</a>
                </div>
            </div>
        </footer>
    );
}
