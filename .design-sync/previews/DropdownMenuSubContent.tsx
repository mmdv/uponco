import { Globe, MapPin, UserRound } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from 'uponco';

export function SpecialistSubmenu() {
    return (
        <div className="p-2">
            <DropdownMenu open modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        11:30 · Deep Tissue Massage
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="w-56"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <DropdownMenuLabel>Appointment</DropdownMenuLabel>
                    <DropdownMenuItem>Mark as completed</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub open>
                        <DropdownMenuSubTrigger>
                            <UserRound />
                            Reassign specialist
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-56" alignOffset={-4} avoidCollisions={false}>
                            <DropdownMenuLabel>Available 11:30</DropdownMenuLabel>
                            <DropdownMenuItem>Leyla Mammadova</DropdownMenuItem>
                            <DropdownMenuItem>Kamran Hasanov</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>
                                Nigar Aliyeva — day off
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function LocationRadioSubmenu() {
    return (
        <div className="p-2">
            <DropdownMenu open modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <MapPin className="size-4" />
                        Lotus Wellness
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="w-56"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <DropdownMenuItem>Today&apos;s schedule</DropdownMenuItem>
                    <DropdownMenuSub open>
                        <DropdownMenuSubTrigger>
                            <Globe />
                            Show times in
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-56" alignOffset={-4} avoidCollisions={false}>
                            <DropdownMenuRadioGroup value="baku">
                                <DropdownMenuRadioItem value="baku">
                                    Asia/Baku · UTC+4
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="london">
                                    Europe/London · UTC+1
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="istanbul">
                                    Europe/Istanbul · UTC+3
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
