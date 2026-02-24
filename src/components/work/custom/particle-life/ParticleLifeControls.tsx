import { RefreshCw, Zap, Activity, Grid } from "lucide-react"

export interface SimulationConfig {
    speed: number;
    friction: number;
    attraction: number;
    radius: number;
    size: number;
    decay: number;
    repulsion: number;
}

interface ParticleLifeControlsProps {
    config: SimulationConfig;
    setConfig: (fn: (prev: SimulationConfig) => SimulationConfig) => void;
    onPreset: (name: 'Balanced' | 'Chaos' | 'Clusters' | 'Cells') => void;
}

export function ParticleLifeControls({ config, setConfig, onPreset }: ParticleLifeControlsProps) {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-10 pointer-events-none">
            <div className="pointer-events-auto bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full border border-black/5 dark:border-white/10 shadow-2xl p-1.5 flex items-center justify-between gap-4">

                {/* Presets */}
                <div className="flex bg-black/5 dark:bg-white/5 rounded-full p-1 gap-1 shrink-0">
                    {[
                        { name: 'Balanced', icon: Activity },
                        { name: 'Chaos', icon: Zap },
                        { name: 'Clusters', icon: Grid },
                        { name: 'Cells', icon: RefreshCw }
                    ].map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => onPreset(preset.name as any)}
                            title={preset.name}
                            className="p-2 rounded-full hover:bg-white dark:hover:bg-white/20 transition-all text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:scale-105 active:scale-95"
                        >
                            <preset.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                <div className="w-px h-8 bg-black/10 dark:bg-white/10 shrink-0" />

                {/* Sliders Compact */}
                <div className="flex gap-4 items-center flex-1 min-w-0 pr-2">
                    <div className="flex flex-col gap-0.5 flex-1">
                        <div className="flex justify-between text-[10px] uppercase font-mono tracking-wider opacity-50">
                            <span>Speed</span>
                            <span>{config.speed.toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            min={0.1}
                            max={5.0}
                            step={0.1}
                            value={config.speed}
                            onChange={(e) => setConfig(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                            className="w-full h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
