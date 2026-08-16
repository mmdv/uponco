import { MoreHorizontal, Pencil, Search, Trash2, Users } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'uponco';

/** Separators fence the destructive tail off from the safe actions. */
export function FencingOffDestructiveActions() {
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
                <DropdownMenuLabel>Swedish Massage · 60 min</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Search />
                    View bookings
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Pencil />
                    Edit service
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Users />
                    Assign specialists
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    <Trash2 />
                    Delete service
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Several separators split a long menu into scannable sections. */
export function SplittingALongMenu() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    Manage team
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-56"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuItem>Invite a member</DropdownMenuItem>
                <DropdownMenuItem>Pending invitations</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Working hours</DropdownMenuItem>
                <DropdownMenuItem>Booking page</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Switch team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    Leave Lumen Studio
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
