import {
    CalendarClock,
    ChevronDown,
    MoreHorizontal,
    Pencil,
    Search,
    Trash2,
} from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'uponco';

export function AppointmentRowActions() {
    return (
        <DropdownMenu open modal={false}>
            <div className="flex w-96 items-center gap-3 rounded-lg border bg-card p-3">
                <span className="text-sm font-medium tabular-nums">10:30</span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                        Deep Tissue Massage
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        Leyla Hüseynova · Nizami Studio
                    </p>
                </div>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent
                align="start"
                className="relative w-56"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>Deep Tissue Massage</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Search />
                    View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Pencil />
                    Edit appointment
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CalendarClock />
                    Reschedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    <Trash2 />
                    Cancel appointment
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function LanguageSwitcherMenu() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-1.5">
                    <span className="uppercase">en</span>
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuRadioGroup value="en">
                    <DropdownMenuRadioItem value="en">
                        English
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="az">
                        Azərbaycan
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ru">
                        Русский
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function Closed() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    Day view
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>Week view</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
