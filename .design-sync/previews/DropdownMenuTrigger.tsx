import { ChevronDown, MoreHorizontal, Users } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from 'uponco';

export function IconButtonTrigger() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-52"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuItem>Edit service</DropdownMenuItem>
                <DropdownMenuItem>Duplicate service</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    Delete service
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function LabelledButtonTrigger() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Users className="size-4" />
                    All specialists
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-52"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>Filter by specialist</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All specialists</DropdownMenuItem>
                <DropdownMenuItem>Leyla Hüseynova</DropdownMenuItem>
                <DropdownMenuItem>Səbinə Quliyeva</DropdownMenuItem>
                <DropdownMenuItem>Kamran Həsənov</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** The header's user menu hangs off an avatar rather than a button. */
export function AvatarTrigger() {
    return (
        <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-full p-1"
                >
                    <Avatar className="size-8">
                        <AvatarFallback className="bg-muted text-xs font-medium">
                            AR
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="relative w-56"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DropdownMenuLabel>
                    <p className="text-sm font-medium">Ayla Rzayeva</p>
                    <p className="text-xs font-normal text-muted-foreground">
                        ayla@lumenstudio.az
                    </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Teams</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
