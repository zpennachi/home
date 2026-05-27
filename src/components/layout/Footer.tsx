import Link from "next/link"

export function Footer() {
    return (
        <footer className="container py-16 border-t border-muted mt-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                {/* Brand Logo */}
                <div>
                    <Link href="/new" className="text-base font-light tracking-[0.15em] hover:opacity-75 transition-opacity block w-fit">
                        zpennachi<span className="text-accent">.</span>
                    </Link>
                </div>

                {/* Contact CTA */}
                <div className="text-sm font-light text-muted-fg/80 tracking-tight">
                    lets work together :) <a href="mailto:z@zpennachi.com" className="text-foreground hover:opacity-70 transition-opacity underline underline-offset-4 font-normal">z@zpennachi.com</a>
                </div>
            </div>
        </footer>
    );
}
