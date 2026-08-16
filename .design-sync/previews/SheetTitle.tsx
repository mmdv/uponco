import {
    Button,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from 'uponco';

export function DayEditorTitle() {
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
                <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
                    09:00 – 13:00 · 14:00 – 18:30
                </div>
                <SheetFooter className="flex-row justify-end gap-2 border-t">
                    <Button variant="secondary">Cancel</Button>
                    <Button>Save</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export function LongTitleWraps() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <SheetTitle className="pr-10 text-lg">
                        Deep Tissue Massage with Hot Stones — Bella Salon,
                        Nizami
                    </SheetTitle>
                    <SheetDescription>
                        Edit the service before it appears on the booking page.
                    </SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
                    90 min · ₼140 · 4 specialists assigned
                </div>
            </SheetContent>
        </Sheet>
    );
}
