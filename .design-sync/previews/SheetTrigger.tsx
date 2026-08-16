import { SlidersHorizontal } from 'lucide-react';
import {
    Button,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from 'uponco';

export function ClosedTrigger() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">
                    <SlidersHorizontal className="size-4" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}

export function TriggerWithSheetOpen() {
    return (
        <Sheet open modal={false}>
            <SheetTrigger asChild>
                <Button variant="outline">
                    <SlidersHorizontal className="size-4" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                        Narrow the day view by location, service or specialist.
                    </SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-sm">
                    <p className="text-muted-foreground">Locations</p>
                    <p className="font-medium">Bella Salon — Nizami</p>
                    <p className="text-muted-foreground">Specialists</p>
                    <p className="font-medium">Leyla Aliyeva, Rashad Guliyev</p>
                </div>
                <SheetFooter className="flex-row justify-end gap-2 border-t">
                    <Button variant="secondary">Clear</Button>
                    <Button>Apply</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
