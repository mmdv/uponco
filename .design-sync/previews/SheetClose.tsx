import { ArrowLeft } from 'lucide-react';
import {
    Button,
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from 'uponco';

export function CloseInFooter() {
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
                    <SheetClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </SheetClose>
                    <Button>Save</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export function CloseAsBackLink() {
    return (
        <Sheet open modal={false}>
            <SheetContent
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <SheetClose asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 w-fit text-muted-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to the day view
                        </Button>
                    </SheetClose>
                    <SheetTitle>Ayla Rzayeva</SheetTitle>
                    <SheetDescription>
                        Deep Tissue Massage · 09:30 with Leyla Aliyeva
                    </SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
                    Booked online 3 days ago · ₼80 · Bella Salon — Nizami
                </div>
            </SheetContent>
        </Sheet>
    );
}
