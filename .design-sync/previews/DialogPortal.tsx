import { useState } from 'react';
import {
    Button,
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPortal,
    DialogTitle,
} from 'uponco';

/**
 * DialogPortal relocates dialog content out of the trigger's DOM position.
 * Passing `container` keeps it inside a chosen element, which is what makes the
 * portal observable in a static preview.
 */
export function PortalIntoContainer() {
    const [container, setContainer] = useState<HTMLElement | null>(null);

    return (
        <div className="w-full max-w-md space-y-3">
            <p className="text-sm text-muted-foreground">
                Booking panel rendered through DialogPortal into the container
                below rather than at the end of the document.
            </p>

            <div
                ref={setContainer}
                className="rounded-lg border border-dashed p-3"
            />

            <Dialog open modal={false}>
                <DialogPortal container={container ?? undefined}>
                    <div className="grid gap-4 rounded-lg border bg-background p-6 shadow-sm">
                        <DialogHeader>
                            <DialogTitle>Cancel this appointment?</DialogTitle>
                            <DialogDescription>
                                Ayla Rzayeva will be emailed to let her know her
                                11:30 Deep Tissue Massage is no longer booked.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline">Keep appointment</Button>
                            <Button variant="destructive">
                                Cancel appointment
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogPortal>
            </Dialog>
        </div>
    );
}

export function PortalledSpecialistCard() {
    const [container, setContainer] = useState<HTMLElement | null>(null);

    return (
        <div className="w-full max-w-md space-y-3">
            <div
                ref={setContainer}
                className="rounded-lg border border-dashed p-3"
            />

            <Dialog open modal={false}>
                <DialogPortal container={container ?? undefined}>
                    <div className="grid gap-4 rounded-lg border bg-background p-6 shadow-sm">
                        <DialogHeader>
                            <DialogTitle>Leyla Hüseynova</DialogTitle>
                            <DialogDescription>
                                Senior massage therapist · Nizami Studio
                            </DialogDescription>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            Twelve years of deep tissue and sports massage.
                            Works Tuesday to Saturday, 10:00–19:00.
                        </p>
                        <DialogFooter>
                            <Button>Book with Leyla</Button>
                        </DialogFooter>
                    </div>
                </DialogPortal>
            </Dialog>
        </div>
    );
}
