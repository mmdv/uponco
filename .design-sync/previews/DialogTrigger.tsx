import { CalendarPlus, Trash2 } from 'lucide-react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
} from 'uponco';

/**
 * The closed state: `DialogTrigger` is just the button that opens the dialog,
 * wrapped around the app's own `Button` with `asChild`.
 */
export function ClosedTriggers() {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <CalendarPlus />
                        New appointment
                    </Button>
                </DialogTrigger>
            </Dialog>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">Add customer</Button>
                </DialogTrigger>
            </Dialog>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 />
                        Delete service
                    </Button>
                </DialogTrigger>
            </Dialog>
        </div>
    );
}

/** The trigger together with the dialog it opens, pinned open and in flow. */
export function TriggerWithOpenDialog() {
    return (
        <Dialog open modal={false}>
            <DialogTrigger asChild>
                <Button variant="outline">Add customer</Button>
            </DialogTrigger>
            <DialogContent
                className="relative"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>New customer</DialogTitle>
                    <DialogDescription>
                        Add someone to your book so you can schedule them
                        directly.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor="trigger-customer-name">Full name</Label>
                    <Input
                        id="trigger-customer-name"
                        defaultValue="Ayla Rzayeva"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Add customer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** Disabled while the current plan has hit its service limit. */
export function DisabledTrigger() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled>Add service</Button>
            </DialogTrigger>
        </Dialog>
    );
}
