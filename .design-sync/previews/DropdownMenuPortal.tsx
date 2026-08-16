import { ChevronsUpDown, MapPin, MoreHorizontal, Users } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from 'uponco';

/**
 * `DropdownMenuSubContent` does not portal itself, so submenus that must escape
 * a clipping parent wrap it in `DropdownMenuPortal` — here the menu lives inside
 * an `overflow-hidden` table cell and the flyout still reaches outside it.
 */
export function SubmenuEscapingAClippedRow() {
    return (
        <div className="w-96 overflow-hidden rounded-lg border bg-card">
            <div className="flex items-center gap-3 p-3">
                <span className="text-sm font-medium tabular-nums">10:30</span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                        Deep Tissue Massage
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        Leyla Hüseynova · Nizami Studio
                    </p>
                </div>
                <DropdownMenu open modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="relative w-56"
                        onOpenAutoFocus={(event) => event.preventDefault()}
                    >
                        <DropdownMenuLabel>Move this booking</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub open>
                            <DropdownMenuSubTrigger>
                                <Users className="mr-2 size-4" />
                                Reassign to
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-52">
                                    <DropdownMenuItem>
                                        Leyla Hüseynova
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Səbinə Quliyeva
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Kamran Həsənov
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <MapPin className="mr-2 size-4" />
                                Move to location
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-52">
                                    <DropdownMenuItem>
                                        Nizami Studio
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Port Baku Kiosk
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

/**
 * The sidebar's team menu: the portal lets the "Switch team" flyout sit over the
 * page content instead of being trapped in the fixed-width sidebar rail.
 */
export function TeamSwitcherFlyout() {
    return (
        <div className="w-64 rounded-lg border bg-sidebar p-2">
            <DropdownMenu open modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-12 w-full justify-start"
                    >
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                            L
                        </span>
                        <span className="flex-1 text-left text-sm font-medium">
                            Lumen Studio
                        </span>
                        <ChevronsUpDown className="size-4 opacity-60" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="relative w-56"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <DropdownMenuLabel>Teams</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub open>
                        <DropdownMenuSubTrigger>
                            Switch team
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-52">
                                <DropdownMenuItem>
                                    Lumen Studio
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Aura Wellness
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Baku Barbers
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem>Team settings</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
