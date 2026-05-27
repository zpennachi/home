import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssetChecklistProps {
    data: {
        images?: string[];
        content?: string;
        stack?: string[];
        repo?: string;
        heroImage?: string;
    }
}

export function AssetChecklist({ data }: AssetChecklistProps) {
    const checks = [
        {
            label: "Thumbnail",
            valid: data.images && data.images.length > 0,
            required: true
        },
        {
            label: "Hero Image",
            valid: (data.images && data.images.length > 1) || !!data.heroImage,
            required: false // Optional if using generated/code visual
        },
        {
            label: "Narrative Content",
            valid: data.content && data.content.length > 100,
            required: true
        },
        {
            label: "Tech Stack",
            valid: data.stack && data.stack.length > 0,
            required: true
        },
        {
            label: "Repository Link",
            valid: !!data.repo,
            required: false
        }
    ]

    const completed = checks.filter(c => c.valid).length
    const total = checks.length
    const progress = Math.round((completed / total) * 100)

    return (
        <div className="bg-muted/20 border border-muted rounded-2xl p-6 lg:sticky lg:top-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-muted-fg">Asset Health</h3>
                <span className="text-[10px] font-mono bg-foreground/10 px-2 py-1 rounded-md font-bold">{progress}% Ready</span>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-muted rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-foreground transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-4">
                {checks.map((check, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                        {check.valid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : check.required ? (
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 animate-pulse" />
                        ) : (
                            <Circle className="w-4 h-4 text-muted-fg/20 flex-shrink-0" />
                        )}
                        <span className={cn(
                            "text-sm font-medium transition-colors",
                            check.valid ? "text-foreground" : "text-muted-fg",
                            !check.valid && check.required && "text-amber-500/80"
                        )}>
                            {check.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-muted/50">
                <p className="text-[10px] text-muted-fg/40 leading-relaxed uppercase tracking-wide">
                    Ensuring comprehensive case studies increases portfolio impact.
                </p>
            </div>
        </div>
    )
}
