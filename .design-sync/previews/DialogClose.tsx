import { CheckCircle2 } from 'lucide-react';
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from 'uponco';

export function DismissAConfirmation() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader className="items-center text-center sm:text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="size-7" />
                    </span>
                    <DialogTitle className="mt-3">
                        Appointment booked
                    </DialogTitle>
                    <DialogDescription>
                        Deep Tissue Massage with Ayla Rzayeva, Thursday 16 May
                        at 11:30. We have emailed the details to the customer.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <DialogClose asChild>
                        <Button className="w-full">Done</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CancelBesideDestructiveAction() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Remove Nizami Street Studio?</DialogTitle>
                    <DialogDescription>
                        Four upcoming appointments are booked at this location.
                        They will need a new branch before customers arrive.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Keep location</Button>
                    </DialogClose>
                    <Button variant="destructive">Remove location</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function AsAGhostLink() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Share your booking page</DialogTitle>
                    <DialogDescription>
                        Anyone with this link can book Gel Manicure, Beard Trim
                        and six other services.
                    </DialogDescription>
                </DialogHeader>
                <div className="rounded-xl border bg-muted/40 px-3 py-2 font-mono text-sm">
                    uponco.app/aurora-beauty
                </div>
                <DialogFooter className="sm:justify-between">
                    <DialogClose asChild>
                        <Button variant="ghost">Not now</Button>
                    </DialogClose>
                    <Button>Copy link</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
