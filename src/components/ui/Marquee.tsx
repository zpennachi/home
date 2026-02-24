import { cn } from "@/lib/utils"

interface MarqueeProps {
    className?: string
    reverse?: boolean
    pauseOnHover?: boolean
    children?: React.ReactNode
    repeat?: number
}

export function Marquee({
    className,
    reverse,
    pauseOnHover = false,
    children,
    repeat = 4,
}: MarqueeProps) {
    return (
        <div className={cn("group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]", className)}>
            {Array(repeat)
                .fill(0)
                .map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row items-center",
                            {
                                "[animation-direction:reverse]": reverse,
                                "group-hover:[animation-play-state:paused]": pauseOnHover,
                            }
                        )}
                    >
                        {children}
                    </div>
                ))}
        </div>
    )
}
