import {
    Badge,
    Button,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from 'uponco';

export function TitleAndDescription() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <SheetTitle>Tue, 18 Aug</SheetTitle>
                    <SheetDescription>
                        Set the hours Leyla Aliyeva is bookable on this day.
                    </SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 text-sm">
                    <p className="text-muted-foreground">
                        09:00 – 13:00 · 14:00 – 18:30
                    </p>
                </div>
                <SheetFooter className="flex-row justify-end gap-2 border-t">
                    <Button variant="secondary">Cancel</Button>
                    <Button>Save</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export function TitleOnly() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 text-sm">
                    <p className="text-muted-foreground">
                        Narrow the day view by location, service or specialist.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function HeaderWithStatus() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <div className="flex items-center gap-2 pr-10">
                        <SheetTitle>Ayla Rzayeva</SheetTitle>
                        <Badge>Confirmed</Badge>
                    </div>
                    <SheetDescription>
                        Deep Tissue Massage · Tuesday, 18 August at 09:30
                    </SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
                    Booked online 3 days ago. Reminder email scheduled for
                    Monday at 09:30.
                </div>
            </SheetContent>
        </Sheet>
    );
}
