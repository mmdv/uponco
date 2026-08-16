import { CalendarPlus, Copy, Settings2 } from 'lucide-react';
import {
    Button,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from 'uponco';

const ACTIONS = [
    { icon: CalendarPlus, label: 'New appointment' },
    { icon: Copy, label: 'Copy booking link' },
    { icon: Settings2, label: 'Day settings' },
];

/**
 * One provider wraps a whole toolbar — every Tooltip beneath it shares the
 * same open/skip timing, which is why the provider belongs at the top of a
 * screen rather than around each individual tooltip.
 */
export function ToolbarWithSharedTiming() {
    return (
        <TooltipProvider>
            <div className="inline-flex items-center gap-1 rounded-xl border p-1">
                {ACTIONS.map(({ icon: Icon, label }) => (
                    <Tooltip key={label}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={label}
                            >
                                <Icon className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{label}</TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}

export function OneTooltipOpen() {
    return (
        <TooltipProvider>
            <div className="inline-flex items-center gap-1 rounded-xl border p-1">
                {ACTIONS.map(({ icon: Icon, label }, index) => (
                    <Tooltip key={label} open={index === ACTIONS.length - 1}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={label}
                            >
                                <Icon className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="relative" side="right">
                            {label}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}

export function LongerDelay() {
    return (
        <TooltipProvider delayDuration={700}>
            <Tooltip open>
                <TooltipTrigger asChild>
                    <Button variant="outline">Publish booking page</Button>
                </TooltipTrigger>
                <TooltipContent className="relative" side="right">
                    Customers can book the moment this goes live.
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
