import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import {
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'uponco';

const noop = () => {};

/** Filtering the appointments table by specialist — checked and unchecked. */
export function SpecialistFilter() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <SlidersHorizontal className="size-4" />
                    Specialists
                    <Badge variant="secondary">2</Badge>
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-56"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>Show appointments for</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked onCheckedChange={noop}>
                    Leyla Hüseynova
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked onCheckedChange={noop}>
                    Səbinə Quliyeva
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={false}
                    onCheckedChange={noop}
                >
                    Kamran Həsənov
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={false}
                    disabled
                    onCheckedChange={noop}
                >
                    Nurlan Əliyev (on leave)
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Choosing which columns the appointments table shows. */
export function TableColumns() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    Columns
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-48"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuCheckboxItem checked onCheckedChange={noop}>
                    Customer
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked onCheckedChange={noop}>
                    Service
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked onCheckedChange={noop}>
                    Location
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={false}
                    onCheckedChange={noop}
                >
                    Price
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={false}
                    onCheckedChange={noop}
                >
                    Created by
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
