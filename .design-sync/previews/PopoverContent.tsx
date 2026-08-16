import { Clock, MapPin } from 'lucide-react';
import {
    Button,
    Input,
    Label,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from 'uponco';

export function Default() {
    return (
        <Popover open modal={false}>
            <PopoverTrigger asChild>
                <Button variant="outline">Appointment details</Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="relative space-y-3">
                <div>
                    <p className="text-sm font-semibold">Gel Manicure</p>
                    <p className="text-sm text-muted-foreground">
                        Ayla Rzayeva · ₼45
                    </p>
                </div>
                <div className="space-y-1.5 text-sm">
                    <p className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        Sunday 16 August · 11:30 – 12:15
                    </p>
                    <p className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        Nizami Street Studio
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function WithForm() {
    return (
        <Popover open modal={false}>
            <PopoverTrigger asChild>
                <Button variant="outline">Block time</Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="relative w-80 space-y-3"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <p className="text-sm font-medium">Block time off</p>
                <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="block-from">From</Label>
                        <Input id="block-from" defaultValue="13:00" />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="block-to">To</Label>
                        <Input id="block-to" defaultValue="14:00" />
                    </div>
                </div>
                <Button className="w-full" size="sm">
                    Block
                </Button>
            </PopoverContent>
        </Popover>
    );
}

export function AlignedEnd() {
    return (
        <div className="flex w-full justify-end">
            <Popover open modal={false}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                        Share booking page
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="end"
                    className="relative w-72 space-y-2"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <p className="text-xs font-medium text-muted-foreground">
                        Your public link
                    </p>
                    <div className="rounded-md border bg-muted/40 px-2 py-1.5 font-mono text-xs">
                        uponco.app/lotus-wellness
                    </div>
                    <Button size="sm" className="w-full">
                        Copy link
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}
