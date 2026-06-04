"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

export function Header() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        // Hide if scrolling down past 100px, show if scrolling up
        if (latest > previous && latest > 100) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    return (
        <motion.header
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center bg-background/80 backdrop-blur-md text-foreground pointer-events-none"
        >
            <div className="container flex items-center justify-between pointer-events-auto">
                <Link href="/new" className="text-xl font-normal tracking-[0.1em] hover:opacity-70 transition-opacity">
                    zpennachi<span className="text-accent">.</span>
                </Link>
                <nav className="flex items-center gap-4 md:gap-8 text-xs md:text-sm font-normal uppercase tracking-[0.1em]">
                    <Link href="/new/work" className="hover:opacity-70 transition-opacity">
                        Work
                    </Link>
                    <Link href="/new/about" className="hover:opacity-70 transition-opacity">
                        About
                    </Link>
                    <Link href="/new/contact" className="hover:opacity-70 transition-opacity px-4 py-2 border border-foreground/20 rounded-full hover:border-foreground/60">
                        Contact
                    </Link>
                </nav>
            </div>
        </motion.header>
    )
}
