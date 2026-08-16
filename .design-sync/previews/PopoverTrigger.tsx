import { CalendarDays, ChevronDown } from 'lucide-react';
import { Button, Popover, PopoverContent, PopoverTrigger } from 'uponco';

export function ButtonTrigger() {
    return (
        <Popover open modal={false}>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <CalendarDays className="size-4" />
                    16 August 2026
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="relative w-64 space-y-2"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <p className="text-sm font-medium">Jump to a date</p>
                <div className="grid gap-1 text-sm">
                    <button className="rounded-sm px-2 py-1.5 text-left hover:bg-accent">
                        Today · 16 August
                    </button>
                    <button className="rounded-sm px-2 py-1.5 text-left hover:bg-accent">
                        Tomorrow · 17 August
                    </button>
                    <button className="rounded-sm px-2 py-1.5 text-left hover:bg-accent">
                        Next Monday · 24 August
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function IconTrigger() {
    return (
        <Popover open modal={false}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Booking menu">
                    <ChevronDown className="size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="relative w-56 text-sm"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <p className="font-medium">Deep Tissue Massage</p>
                <p className="mt-1 text-muted-foreground">
                    60 min · ₼75 · Leyla Aliyeva
                </p>
            </PopoverContent>
        </Popover>
    );
}
