import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from 'uponco';

export function Default() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Cancel this appointment?</DialogTitle>
                    <DialogDescription>
                        Ayla Rzayeva will be emailed to let her know her 11:30
                        Deep Tissue Massage is no longer booked.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline">Keep appointment</Button>
                    <Button variant="destructive">Cancel appointment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function TitleOnly() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Repeat this week</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Copy Leyla&apos;s hours for 17 – 23 August onto the next
                    four weeks.
                </p>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Repeat</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function LongTitle() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        Remove Kamran Hasanov from Lotus Wellness?
                    </DialogTitle>
                    <DialogDescription>
                        His three upcoming appointments will need to be
                        reassigned to another specialist before he can be
                        removed.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline">Keep member</Button>
                    <Button variant="destructive">Remove member</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
