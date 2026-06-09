"use client";

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Dynamic imports to keep bundle size low
const ParticleLife = dynamic(() => import('./particle-life'), {
    loading: () => <div className="w-full h-full bg-black/5 animate-pulse" />,
    ssr: false
});

const MVPIQVisual = dynamic(() => import('./mvpiq'), {
    loading: () => <div className="w-full h-full bg-[#050510] animate-pulse" />,
    ssr: false
});
const MVPIQStory = dynamic(() => import('./mvpiq/Story'));

// Weekend (R3F Portfolio)
const WeekendStory = dynamic(() => import('./weekend/Story'));
const WeekendVisual = dynamic(() => import('./weekend'), {
    loading: () => <div className="w-full h-full bg-black/90 animate-pulse" />,
    ssr: false
});

const ZeroGhostStory = dynamic(() => import('./0ghost/Story'));
const ZeroGhostVisual = dynamic(() => import('./0ghost'), {
    loading: () => <div className="w-full h-full bg-[#111] animate-pulse" />,
    ssr: false
});

// Hawkeye (Computer Vision)
const HawkeyeStory = dynamic(() => import('./hawkeye/Story'));
const HawkeyeVisual = dynamic(() => import('./hawkeye'), {
    loading: () => <div className="w-full h-full bg-[#111] animate-pulse" />,
    ssr: false
});

// Nexus (Knowledge Graph)
const NexusStory = dynamic(() => import('./nexus/Story'));

// Vantage (Fintech Terminal)
const VantageStory = dynamic(() => import('./vantage/Story'));

// Log Slice Scroll Dissect (Timeline)
const LogSliceStory = dynamic(() => import('./log-slice/Story'));
const LogSliceVisual = dynamic(() => import('./log-slice'), {
    loading: () => <div className="w-full h-full bg-black/95 animate-pulse" />,
    ssr: false
});

// Map slugs to components
export const PROJECT_VISUALS = {
    'particle-life-131': ParticleLife,
    'MVPIQ': MVPIQVisual,
    'weekend': WeekendVisual,
    '0ghost-chat': ZeroGhostVisual,
    'hawkeye': HawkeyeVisual,
    'log-slice': LogSliceVisual,
};

export const PROJECT_STORIES = {
    'MVPIQ': MVPIQStory,
    'weekend': WeekendStory,
    '0ghost-chat': ZeroGhostStory,
    'hawkeye': HawkeyeStory,
    'nexus': NexusStory,
    'vantage': VantageStory,
    'log-slice': LogSliceStory,
};

