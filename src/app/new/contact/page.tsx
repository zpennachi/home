import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact — ZPennachi",
    description: "Get in touch.",
};

export default function ContactPage() {
    return (
        <main className="container min-h-[60vh] flex flex-col justify-center items-center py-24">

            <div className="w-full max-w-4xl text-center space-y-12">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-fg">
                    Open for Opportunities
                </span>

                <a
                    href="mailto:hello@zpennachi.com"
                    className="block text-[8vw] md:text-[6vw] font-bold tracking-tighter leading-none hover:text-muted-fg transition-colors duration-300"
                >
                    hello@zpennachi.com
                </a>

                <div className="flex justify-center gap-8 md:gap-16 pt-12">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:text-muted-fg transition-colors border-b border-transparent hover:border-muted-fg">
                        GitHub ↗
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:text-muted-fg transition-colors border-b border-transparent hover:border-muted-fg">
                        Twitter ↗
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-lg font-medium hover:text-muted-fg transition-colors border-b border-transparent hover:border-muted-fg">
                        LinkedIn ↗
                    </a>
                </div>
            </div>

        </main>
    );
}
