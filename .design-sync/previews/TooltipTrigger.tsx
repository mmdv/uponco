import { X } from 'lucide-react';
import {
    Badge,
    Button,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from 'uponco';

export function IconButtonTrigger() {
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

export function BadgeTrigger() {
    return (
        <TooltipProvider>
            <Tooltip open>
                <TooltipTrigger asChild>
                    <Badge variant="secondary">Pending invite</Badge>
                </TooltipTrigger>
                <TooltipContent className="relative" side="right">
                    Invited 2 days ago — the invite expires on 25 August.
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function RestingInMemberRow() {
    return (
        <TooltipProvider>
            <div className="flex w-96 items-center justify-between gap-3 rounded-xl border px-4 py-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                        Rashad Guliyev
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                        rashad.guliyev@bellasalon.az
                    </p>
                </div>
                <Badge variant="secondary">Member</Badge>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Remove member"
                        >
                            <X className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Remove Rashad Guliyev from the team
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
