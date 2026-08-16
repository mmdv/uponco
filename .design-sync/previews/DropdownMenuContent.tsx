import {
    CalendarDays,
    CalendarRange,
    ChevronDown,
    LayoutGrid,
    MoreHorizontal,
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

/** Wide content with a label, grouped actions and a destructive tail. */
export function ServiceActions() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-60"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>Gel Manicure · 45 min</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit service</DropdownMenuItem>
                <DropdownMenuItem>Assign specialists</DropdownMenuItem>
                <DropdownMenuItem>Copy booking link</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    Delete service
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Narrow content (`w-40`), the width the appointments view switcher uses. */
export function NarrowViewSwitcher() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <CalendarDays className="size-4" />
                    Day
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-40"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuRadioGroup value="day">
                    <DropdownMenuRadioItem value="day">
                        <CalendarDays className="size-4" />
                        Day
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="week">
                        <CalendarRange className="size-4" />
                        Week
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="list">
                        <LayoutGrid className="size-4" />
                        List
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** `align="end"` — how the menu hangs off a right-aligned toolbar button. */
export function AlignedToEnd() {
    return (
        <div className="flex w-96 justify-end rounded-lg border bg-card p-3">
            <DropdownMenu open modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        Export
                        <ChevronDown className="size-4 opacity-60" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="relative w-52"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <DropdownMenuItem>Download CSV</DropdownMenuItem>
                    <DropdownMenuItem>Download PDF schedule</DropdownMenuItem>
                    <DropdownMenuItem>Email to the team</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
