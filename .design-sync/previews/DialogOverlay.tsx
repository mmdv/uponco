import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from 'uponco';

/**
 * The scrim only paints while the dialog is modal, so both cells run a modal
 * dialog over a slice of the day view — the page content it is meant to dim.
 */
function DayBehindTheScrim() {
    return (
        <div className="space-y-3 p-6">
            <p className="text-sm font-semibold">Tuesday, 18 August</p>
            {[
                { time: '09:30', label: 'Deep Tissue Massage · Ayla Rzayeva' },
                { time: '11:00', label: 'Beard Trim · Kamran Huseynov' },
                { time: '14:15', label: 'Balayage · Nigar Mammadli' },
                { time: '16:00', label: 'Gel Manicure · Sevinc Alizade' },
            ].map((row) => (
                <div
                    key={row.time}
                    className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm"
                >
                    <span className="font-medium tabular-nums">{row.time}</span>
                    <span className="text-muted-foreground">{row.label}</span>
                </div>
            ))}
        </div>
    );
}

export function ScrimBehindDialog() {
    return (
        <>
            <DayBehindTheScrim />
            <Dialog open>
                <DialogContent
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Cancel this appointment?</DialogTitle>
                        <DialogDescription>
                            Ayla Rzayeva will be emailed to let her know her
                            09:30 Deep Tissue Massage is no longer booked.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline">Keep appointment</Button>
                        <Button variant="destructive">
                            Cancel appointment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function ScrimOnItsOwn() {
    return (
        <>
            <DayBehindTheScrim />
            <Dialog open>
                <DialogOverlay />
            </Dialog>
        </>
    );
}

export function BlurredScrim() {
    return (
        <>
            <DayBehindTheScrim />
            <Dialog open>
                <DialogOverlay className="backdrop-blur-[2px]" />
            </Dialog>
        </>
    );
}
