import { CircleHelp, Trash2 } from 'lucide-react';
import {
    Button,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from 'uponco';

export function ShortLabel() {
    return (
        <TooltipProvider>
            <Tooltip open>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete service"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="relative" side="right">
                    Delete Gel Manicure
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function WrappingParagraph() {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Lead time</span>
                <Tooltip open>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            aria-label="What is lead time?"
                        >
                            <CircleHelp className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="relative" side="right">
                        How far ahead a customer has to book. With two hours of
                        lead time, the 09:30 slot stops being offered at 07:30.
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}

export function BelowTheTrigger() {
    return (
        <TooltipProvider>
            <Tooltip open>
                <TooltipTrigger asChild>
                    <Button variant="outline">Copy booking link</Button>
                </TooltipTrigger>
                <TooltipContent className="relative" side="bottom">
                    uponco.app/bella-salon
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
