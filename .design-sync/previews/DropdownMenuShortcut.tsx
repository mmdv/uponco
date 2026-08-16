import {
    CalendarPlus,
    Pencil,
    Printer,
    Search,
    Trash2,
    UserRoundPlus,
} from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from 'uponco';

/** Shortcut hints sit flush right of each action via `ml-auto`. */
export function AppointmentShortcuts() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    Appointment
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-64"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>Deep Tissue Massage</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Search />
                    View details
                    <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Pencil />
                    Edit appointment
                    <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Printer />
                    Print day sheet
                    <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    <Trash2 />
                    Cancel
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Longer chord hints still line up because the shortcut owns the right edge. */
export function QuickCreateShortcuts() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button size="sm">Create</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-64"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuItem>
                    <CalendarPlus />
                    New appointment
                    <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <UserRoundPlus />
                    New customer
                    <DropdownMenuShortcut>⇧⌘C</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
