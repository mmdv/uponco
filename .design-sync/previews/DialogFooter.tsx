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

export function ConfirmAndCancelActions() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative w-full max-w-md"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Add a customer</DialogTitle>
                    <DialogDescription>
                        They will be able to receive booking reminders by SMS.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-2">
                    <Label htmlFor="footer-customer">Customer name</Label>
                    <Input
                        id="footer-customer"
                        defaultValue="Nigar Məmmədova"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Save customer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DestructiveAction() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative w-full max-w-md"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Cancel this appointment?</DialogTitle>
                    <DialogDescription>
                        Deep Tissue Massage with Leyla Hüseynova on Mon, 17 Aug
                        at 10:30 will be released and the customer notified.
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

export function SplitFooterWithHelperText() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative w-full max-w-lg"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Repeat this week</DialogTitle>
                    <DialogDescription>
                        Copy Leyla&apos;s work hours across the next four weeks.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-between">
                    <span className="self-center text-xs text-muted-foreground">
                        Existing shifts will be overwritten.
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline">Back</Button>
                        <Button>Apply to 4 weeks</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
