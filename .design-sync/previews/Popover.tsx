import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import {
    Badge,
    Button,
    Label,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Switch,
} from 'uponco';

export function FiltersPopover() {
    return (
        <Popover open modal={false}>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <SlidersHorizontal className="size-4" />
                    Filters
                    <Badge variant="secondary">2</Badge>
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="relative w-80 space-y-4"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">
                        Filters
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground"
                    >
                        Clear all
                    </Button>
                </div>
                <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        Specialist
                    </span>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="font-normal">Leyla Aliyeva</Label>
                            <Switch checked onCheckedChange={() => {}} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="font-normal">Ayla Rzayeva</Label>
                            <Switch checked onCheckedChange={() => {}} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="font-normal">Kamran Hasanov</Label>
                            <Switch checked={false} onCheckedChange={() => {}} />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function AppearanceMenu() {
    return (
        <Popover open modal={false}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                    Appearance
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="relative w-72 space-y-4"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                        Theme
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="default" size="sm">
                            Light
                        </Button>
                        <Button variant="outline" size="sm">
                            Dark
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                        Language
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                            English
                        </Button>
                        <Button variant="outline" size="sm">
                            Azərbaycan
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function Closed() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <SlidersHorizontal className="size-4" />
                    Filters
                    <ChevronDown className="size-4 opacity-60" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                Filters for the appointments list.
            </PopoverContent>
        </Popover>
    );
}
