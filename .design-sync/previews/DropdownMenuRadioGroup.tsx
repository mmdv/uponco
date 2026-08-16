import {
    CalendarDays,
    CalendarRange,
    ChevronDown,
    Rows3,
} from 'lucide-react';
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

/** The appointments toolbar's view picker — exactly one view at a time. */
export function AppointmentViewPicker() {
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
                <DropdownMenuRadioGroup value="day" onValueChange={noop}>
                    <DropdownMenuRadioItem value="day">
                        <CalendarDays className="size-4" />
                        Day
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="week">
                        <CalendarRange className="size-4" />
                        Week
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="list">
                        <Rows3 className="size-4" />
                        List
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Two radio groups, separated — sort field and direction. */
export function SortingCustomers() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    Sort
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-52"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>Sort customers by</DropdownMenuLabel>
                <DropdownMenuRadioGroup value="visits" onValueChange={noop}>
                    <DropdownMenuRadioItem value="name">
                        Name
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="visits">
                        Total visits
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="last">
                        Last appointment
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value="desc" onValueChange={noop}>
                    <DropdownMenuRadioItem value="asc">
                        Ascending
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">
                        Descending
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
