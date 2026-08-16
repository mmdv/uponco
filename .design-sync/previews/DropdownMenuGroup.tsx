import {
    CalendarPlus,
    LogOut,
    MapPin,
    MoreHorizontal,
    Scissors,
    Settings,
    UserRoundPlus,
    Users,
} from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'uponco';

/** The user menu: an account group, then the sign-out action on its own. */
export function UserMenuGroups() {
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
                <DropdownMenuLabel>Ayla Rzayeva</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Settings />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Users />
                        Teams
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <LogOut />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** The dashboard quick-create menu: two labelled groups of create actions. */
export function QuickCreateGroups() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button size="sm">Create</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-56"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>Bookings</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <CalendarPlus />
                        New appointment
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <UserRoundPlus />
                        New customer
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Catalogue</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Scissors />
                        New service
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <MapPin />
                        New location
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
