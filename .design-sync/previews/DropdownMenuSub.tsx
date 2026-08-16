import { CalendarClock, MoreHorizontal, Users } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from 'uponco';

/** Both the root and the submenu are pinned open so the flyout is visible. */
export function ReassignSpecialist() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-56"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>Deep Tissue Massage</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <CalendarClock />
                    Reschedule
                </DropdownMenuItem>
                <DropdownMenuSub open>
                    <DropdownMenuSubTrigger>
                        <Users className="mr-2 size-4" />
                        Reassign to
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-52">
                        <DropdownMenuItem>Leyla Hüseynova</DropdownMenuItem>
                        <DropdownMenuItem>Səbinə Quliyeva</DropdownMenuItem>
                        <DropdownMenuItem>Kamran Həsənov</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                            Nurlan Əliyev (on leave)
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Closed submenu: the trigger row rests with its chevron, no flyout. */
export function SubmenuClosed() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    Move booking
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-56"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuItem>
                    <CalendarClock />
                    Reschedule
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Users className="mr-2 size-4" />
                        Reassign to
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-52">
                        <DropdownMenuItem>Leyla Hüseynova</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    Cancel appointment
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
