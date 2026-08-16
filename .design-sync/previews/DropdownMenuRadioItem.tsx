import { ChevronDown, Globe } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'uponco';

const noop = () => {};

/** The header language switcher: the selected locale carries the dot. */
export function LocalePicker() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-1.5">
                    <Globe className="size-4" />
                    <span className="uppercase">az</span>
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-44"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value="az" onValueChange={noop}>
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

/** A disabled option alongside the selected one — reminder timing settings. */
export function ReminderTiming() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    24 hours before
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-52"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>Send the reminder</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value="24h" onValueChange={noop}>
                    <DropdownMenuRadioItem value="48h">
                        48 hours before
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="24h">
                        24 hours before
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="1h">
                        1 hour before
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="15m" disabled>
                        15 minutes before
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
