import { CalendarDays, Clock, MapPin, User } from 'lucide-react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Separator,
    Textarea,
} from 'uponco';

export function AppointmentDetails() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Deep Tissue Massage</DialogTitle>
                    <DialogDescription>
                        Booked online by Ayla Rzayeva on 12 May.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-muted-foreground" />
                        Thursday 16 May 2024
                    </p>
                    <p className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        11:30 – 12:30 · 60 min
                    </p>
                    <p className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        Kamran Aliyev
                    </p>
                    <p className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        Nizami Street Studio
                    </p>
                    <Separator className="my-1" />
                    <p className="font-medium">₼80</p>
                </div>
                <DialogFooter>
                    <Button variant="outline">Reschedule</Button>
                    <Button>Mark as complete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function NewAppointmentForm() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>New appointment</DialogTitle>
                    <DialogDescription>
                        Add a booking taken over the phone.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="dc-customer">Customer</Label>
                        <Input id="dc-customer" defaultValue="Leyla Hasanova" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="dc-date">Date</Label>
                            <Input id="dc-date" defaultValue="16 May 2024" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dc-time">Start</Label>
                            <Input id="dc-time" defaultValue="14:00" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dc-notes">Notes</Label>
                        <Textarea
                            id="dc-notes"
                            defaultValue="Prefers a quiet room, allergic to almond oil."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create appointment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function NarrowWithoutCloseButton() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                showCloseButton={false}
                className="relative sm:max-w-sm"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Leave this booking?</DialogTitle>
                    <DialogDescription>
                        Your 11:30 slot is held for another 4 minutes. Leaving
                        now releases it to other customers.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline">Keep my slot</Button>
                    <Button variant="destructive">Leave</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
