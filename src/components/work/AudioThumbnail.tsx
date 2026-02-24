"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioThumbnailProps {
    file: string;
    title: string;
}

export function AudioThumbnail({ file, title }: AudioThumbnailProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if inside a Link
        e.stopPropagation();

        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Stop all other audio elements on the page (simple exclusion)
            document.querySelectorAll('audio').forEach(el => {
                if (el !== audioRef.current) {
                    el.pause();
                }
            });
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration || 1;
        setProgress((current / duration) * 100);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    // Pause when unmounting or leaving view could be good, but for now we let it play
    // until user pauses or plays another.

    return (
        <div className="w-full h-full bg-muted flex flex-col items-center justify-center relative group overflow-hidden">
            <audio
                ref={audioRef}
                src={file}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                className="hidden"
            />

            {/* Vinyl / Visualizer Placeholder */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br from-muted to-muted-fg/20 transition-opacity duration-500",
                isPlaying ? "opacity-100" : "opacity-50"
            )} />

            {/* Spinning Disc Effect */}
            <div className={cn(
                "w-32 h-32 rounded-full border-4 border-foreground/10 flex items-center justify-center transition-transform duration-[3s] linear",
                isPlaying ? "animate-spin" : ""
            )}>
                <div className="w-12 h-12 rounded-full bg-foreground/10" />
            </div>

            {/* Controls Overlay */}
            <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center z-10 bg-black/5 hover:bg-black/10 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                    {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                    ) : (
                        <Play className="w-6 h-6 fill-current ml-1" />
                    )}
                </div>
            </button>

            {/* Progress Bar (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted-fg/20">
                <div
                    className="h-full bg-foreground transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Label */}
            <div className="absolute bottom-4 left-4 text-xs font-mono uppercase tracking-widest text-muted-fg opacity-0 group-hover:opacity-100 transition-opacity">
                Audio Track
            </div>
        </div>
    );
}
