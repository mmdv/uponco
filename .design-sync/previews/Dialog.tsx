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

export function ConfirmDialog() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                // Radix autofocuses the first field on open, which screenshots as a
                // selected-text highlight. Previews are static, so opt out.
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Cancel this appointment?</DialogTitle>
                    <DialogDescription>
                        Ayla Rzayeva will be emailed to let them know their
                        11:30 Deep Tissue Massage is no longer booked.
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

export function FormDialog() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                // Radix autofocuses the first field on open, which screenshots as a
                // selected-text highlight. Previews are static, so opt out.
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>New customer</DialogTitle>
                    <DialogDescription>
                        Add someone to your book so you can schedule them
                        directly.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="customer-name">Full name</Label>
                        <Input id="customer-name" defaultValue="Ayla Rzayeva" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="customer-email">Email</Label>
                        <Input
                            id="customer-email"
                            type="email"
                            defaultValue="ayla@example.com"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Add customer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
