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

const noAutoFocus = (event: Event) => event.preventDefault();

export function CancelConfirmation() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={noAutoFocus}
            >
                <DialogHeader>
                    <DialogTitle>Cancel this appointment?</DialogTitle>
                    <DialogDescription>
                        Deep Tissue Massage with Nigar Aliyeva on Thursday at
                        14:30 will be released, and the customer will be emailed
                        straight away.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline">Keep it</Button>
                    <Button variant="destructive">Cancel appointment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ShortDescriptionAboveForm() {
    return (
        <Dialog open modal={false}>
            <DialogContent
                className="relative"
                onOpenAutoFocus={noAutoFocus}
            >
                <DialogHeader>
                    <DialogTitle>Invite a specialist</DialogTitle>
                    <DialogDescription>
                        They'll get an email inviting them to Nizami Studio.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="invite-email">Email address</Label>
                    <Input
                        id="invite-email"
                        placeholder="leyla@nizamistudio.az"
                        readOnly
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Send invitation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
