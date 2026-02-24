import Link from "next/link"
import { cn } from "@/lib/utils"

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-24 items-center bg-transparent mix-blend-difference text-white pointer-events-none">
            <div className="container flex items-center justify-between pointer-events-auto">
                <Link href="/new" className="text-xl font-display font-light uppercase tracking-[0.3em] hover:opacity-70 transition-opacity">
                    zpennachi <span className="text-accent font-black">.</span>
                </Link>
                <nav className="flex items-center gap-4 md:gap-12 text-[10px] font-mono uppercase tracking-[0.4em] font-black">
                    <Link href="/new/work" className="hover:text-accent transition-colors">
                        Work
                    </Link>
                    <Link href="/new/about" className="hover:text-accent transition-colors">
                        About
                    </Link>
                    <Link href="/new/contact" className="hover:text-accent transition-colors px-4 py-2 border border-white/20 rounded-full hover:border-accent">
                        Contact
                    </Link>
                </nav>
            </div>
        </header>
    )
}
