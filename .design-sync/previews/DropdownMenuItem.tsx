import {
    CalendarClock,
    MoreHorizontal,
    Pencil,
    Search,
    Send,
    Trash2,
    UserRound,
} from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'uponco';

export function AppointmentActions() {
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
                <DropdownMenuItem>
                    <Search />
                    View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Pencil />
                    Edit appointment
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <UserRound />
                    View customer
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CalendarClock />
                    Reschedule
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** `variant="destructive"` and the disabled state, next to normal items. */
export function DestructiveAndDisabled() {
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
                <DropdownMenuLabel>Nizami Studio</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Pencil />
                    Edit location
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <Send />
                    Publish booking page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    <Trash2 />
                    Delete location
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** `inset` indents items so they line up under ones that carry an indicator. */
export function InsetItems() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    Reminders
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-56"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel inset>Send a reminder</DropdownMenuLabel>
                <DropdownMenuItem inset>24 hours before</DropdownMenuItem>
                <DropdownMenuItem inset>1 hour before</DropdownMenuItem>
                <DropdownMenuItem inset>Right now</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
