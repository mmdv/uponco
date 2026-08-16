import { TriangleAlert } from 'lucide-react';
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
} from 'uponco';

export function FormDialogHeader() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Add a customer</DialogTitle>
                    <DialogDescription>
                        New customers can be booked in straight away and will
                        receive confirmation by email.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor="customer-name">Full name</Label>
                    <Input id="customer-name" defaultValue="Nigar Aliyeva" />
                </div>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Add customer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DestructiveHeader() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <TriangleAlert className="size-5" />
                    </span>
                    <DialogTitle>Delete “Gel Manicure”?</DialogTitle>
                    <DialogDescription>
                        Two upcoming appointments use this service. Deleting it
                        keeps those bookings but removes it from your booking
                        page.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline">Keep service</Button>
                    <Button variant="destructive">Delete service</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CenteredHeader() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative sm:max-w-sm"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader className="items-center text-center sm:text-center">
                    <DialogTitle>Booking confirmed</DialogTitle>
                    <DialogDescription>
                        Leyla Mammadova will see you on Tuesday, 19 August at
                        11:30 for a Deep Tissue Massage.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button variant="outline" className="w-full">
                        Add to calendar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
