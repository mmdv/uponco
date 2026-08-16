import {
    Button,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from 'uponco';

function Body() {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
            09:00 – 13:00 · 14:00 – 18:30
        </div>
    );
}

export function CancelAndSave() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <SheetTitle>Tue, 18 Aug</SheetTitle>
                    <SheetDescription>
                        Set the hours Leyla Aliyeva is bookable.
                    </SheetDescription>
                </SheetHeader>
                <Body />
                <SheetFooter className="flex-row justify-end gap-2 border-t">
                    <Button variant="secondary">Cancel</Button>
                    <Button>Save</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export function DestructiveAndSave() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <SheetTitle>Tue, 18 Aug</SheetTitle>
                    <SheetDescription>
                        Set the hours Leyla Aliyeva is bookable.
                    </SheetDescription>
                </SheetHeader>
                <Body />
                <SheetFooter className="flex-row items-center justify-between gap-2 border-t">
                    <Button
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                    >
                        Mark day off
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary">Cancel</Button>
                        <Button>Save</Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export function StackedSaving() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <SheetTitle>Gel Manicure</SheetTitle>
                    <SheetDescription>
                        45 min · ₼35 · Bella Salon — Nizami
                    </SheetDescription>
                </SheetHeader>
                <Body />
                <SheetFooter className="border-t">
                    <Button disabled>Saving…</Button>
                    <Button variant="secondary" disabled>
                        Cancel
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
