import { CalendarClock, MapPin, MoreHorizontal, UserRound } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from 'uponco';

export function OpenAndClosedTriggers() {
    return (
        <div className="p-2">
            <DropdownMenu open modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <MoreHorizontal className="size-4" />
                        Appointment actions
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="w-56"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <DropdownMenuItem>
                        <CalendarClock />
                        Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuSub open>
                        <DropdownMenuSubTrigger>
                            <UserRound />
                            Reassign specialist
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-52" alignOffset={-4} avoidCollisions={false}>
                            <DropdownMenuItem>
                                Leyla Mammadova
                            </DropdownMenuItem>
                            <DropdownMenuItem>Kamran Hasanov</DropdownMenuItem>
                            <DropdownMenuItem>Nigar Aliyeva</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <MapPin />
                            Move to location
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem>Nizami 42</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                        Cancel appointment
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function InsetTrigger() {
    return (
        <div className="p-2">
            <DropdownMenu open modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        Booking page
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="w-56"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <DropdownMenuItem inset>Copy booking link</DropdownMenuItem>
                    <DropdownMenuSub open>
                        <DropdownMenuSubTrigger inset>
                            Share with a customer
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48" alignOffset={-4} avoidCollisions={false}>
                            <DropdownMenuItem>By email</DropdownMenuItem>
                            <DropdownMenuItem>By WhatsApp</DropdownMenuItem>
                            <DropdownMenuItem>Download QR code</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem inset disabled>
                        Embed on your site
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
