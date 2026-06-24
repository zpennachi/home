'use client'

import { useAudioPlayer } from '@/components/archive/AudioPlayerProvider'
import { Play, Pause } from 'lucide-react'

type Track = {
    id: string;
    url: string;
    title: string;
    category?: string;
};

export function AudioPlayerButton({ track }: { track: Track }) {
    const { currentTrack, isPlaying, playTrack } = useAudioPlayer()

    const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying

    return (
        <button 
            onClick={() => playTrack(track)}
            className="absolute z-10 w-16 h-16 flex items-center justify-center rounded-full bg-background text-foreground shadow-xl border border-muted transition-transform hover:scale-105"
        >
            {isThisTrackPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
    )
}
