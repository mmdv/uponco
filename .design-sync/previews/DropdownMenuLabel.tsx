import { ChevronsUpDown, MoreHorizontal } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'uponco';

/** A plain label naming the record the menu acts on. */
export function RecordTitle() {
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
                <DropdownMenuLabel>Deep Tissue Massage</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit service</DropdownMenuItem>
                <DropdownMenuItem>Assign specialists</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** The user menu's label carries the whole identity block, so it is unpadded. */
export function IdentityHeader() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-12 w-56 justify-start">
                    <Avatar className="size-8">
                        <AvatarFallback className="bg-muted text-xs font-medium">
                            AR
                        </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-left text-sm font-medium">
                        Ayla Rzayeva
                    </span>
                    <ChevronsUpDown className="size-4 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-56"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="size-8">
                            <AvatarFallback className="bg-muted text-xs font-medium">
                                AR
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1">
                            <span className="truncate font-medium">
                                Ayla Rzayeva
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                ayla@lumenstudio.az
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Teams</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Section labels between groups, plus an `inset` label above indented items. */
export function SectionHeadings() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    Schedule
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-56"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>This week</DropdownMenuLabel>
                <DropdownMenuItem>Copy work hours</DropdownMenuItem>
                <DropdownMenuItem>Clear all shifts</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel inset>Specialist</DropdownMenuLabel>
                <DropdownMenuItem inset>Leyla Hüseynova</DropdownMenuItem>
                <DropdownMenuItem inset>Səbinə Quliyeva</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
