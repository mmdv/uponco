import {
    Button,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from 'uponco';

export function SingleDay() {
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

export function MultipleDaysWarning() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <SheetTitle>4 days selected</SheetTitle>
                    <SheetDescription>
                        These hours will replace whatever is already set on
                        Tue 18, Wed 19, Thu 20 and Fri 21 August. Days already
                        holding appointments are left untouched.
                    </SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
                    10:00 – 19:00
                </div>
                <SheetFooter className="flex-row justify-end gap-2 border-t">
                    <Button variant="secondary">Cancel</Button>
                    <Button>Apply to 4 days</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
