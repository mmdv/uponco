import { Info, X } from 'lucide-react';
import {
    Button,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from 'uponco';

export function RemoveMemberHint() {
    return (
        <TooltipProvider>
            <Tooltip open>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" aria-label="Remove member">
                        <X className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="relative" side="right">
                    Remove Rashad Guliyev from the team
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function FieldExplainer() {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Buffer after booking</span>
                <Tooltip open>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            aria-label="What is a buffer?"
                        >
                            <Info className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="relative" side="right">
                        Blocked-out time after each appointment so Leyla can
                        reset the treatment room.
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
