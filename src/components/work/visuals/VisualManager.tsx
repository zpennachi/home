import { HawkeyeVisual } from "./HawkeyeVisual";
import { MVPIQVisual } from "./MVPIQVisual";
import { WeekendVisual } from "./WeekendVisual";
import { ZeroGhostVisual } from "./ZeroGhostVisual";
import { ParticleLifeVisual } from "./ParticleLifeVisual";
import { VantageVisual } from "./VantageVisual";
import { SynthetixVisual } from "./SynthetixVisual";
import { NexusVisual } from "./NexusVisual";
import { GenericStoryVisual } from "./GenericStoryVisual";
import ProjectVisualLoader from "../custom/ProjectVisualLoader";

interface VisualManagerProps {
    projectId: string;
    variant?: string;
}

export function VisualManager({ projectId, variant = 'default' }: VisualManagerProps) {
    const id = projectId.toLowerCase();

    if (id === 'log-slice') {
        return <ProjectVisualLoader slug="log-slice" />;
    }
    if (id === 'hawkeye') {
        return <HawkeyeVisual variant={variant as any} />;
    }
    if (id === 'mvpiq') {
        return <MVPIQVisual variant={variant as any} />;
    }
    if (id === 'weekend') {
        return <WeekendVisual variant={variant as any} />;
    }
    if (id === '0ghost-chat' || id === '0ghost') {
        return <ZeroGhostVisual variant={variant as any} />;
    }
    if (id === 'particle-life-131') {
        return <ParticleLifeVisual variant={variant as any} />;
    }
    if (id === 'vantage') {
        return <VantageVisual variant={variant as any} />;
    }
    if (id === 'synthetix') {
        return <SynthetixVisual variant={variant as any} />;
    }
    if (id === 'nexus') {
        return <NexusVisual variant={variant as any} />;
    }

    // New Red One Projects
    if (['krampus', 'box-nn', 'nn-snap', 'snowmen'].includes(id)) {
        return <GenericStoryVisual variant={variant} />;
    }

    return null;
}

export function hasVisualComponent(projectId: string) {
    const ids = [
        'hawkeye', 'mvpiq', '0ghost-chat', '0ghost', 'weekend',
        'particle-life-131', 'vantage', 'synthetix', 'nexus',
        'krampus', 'box-nn', 'nn-snap', 'snowmen', 'log-slice'
    ];
    return ids.includes(projectId.toLowerCase());
}

