import {
    Button,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from 'uponco';

function ServiceSummary() {
    return (
        <div className="space-y-3 p-4 text-sm">
            {[
                ['Service', 'Deep Tissue Massage'],
                ['Specialist', 'Leyla Aliyeva'],
                ['Location', 'Bella Salon — Nizami'],
                ['Duration', '60 min'],
                ['Price', '₼80'],
            ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                </div>
            ))}
        </div>
    );
}

function Panel({ side }: { side: 'right' | 'left' | 'bottom' }) {
    return (
        <Sheet open modal={false}>
            <SheetContent
                side={side}
                className="gap-0 p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <SheetHeader className="border-b">
                    <SheetTitle>Appointment details</SheetTitle>
                    <SheetDescription>
                        Tuesday, 18 August · 09:30
                    </SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <ServiceSummary />
                </div>
                <SheetFooter className="flex-row justify-end gap-2 border-t">
                    <Button variant="secondary">Reschedule</Button>
                    <Button variant="destructive">Cancel booking</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export function SideRight() {
    return <Panel side="right" />;
}

export function SideLeft() {
    return <Panel side="left" />;
}

export function SideBottom() {
    return <Panel side="bottom" />;
}
