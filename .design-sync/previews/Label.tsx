import { Checkbox, Input, Label, Switch, Textarea } from 'uponco';

export function FieldLabel() {
    return (
        <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="service-title">Service name</Label>
            <Input id="service-title" defaultValue="Deep Tissue Massage" />
        </div>
    );
}

export function LabelledForm() {
    return (
        <div className="grid w-full max-w-sm gap-4">
            <div className="grid gap-2">
                <Label htmlFor="customer-name">Full name</Label>
                <Input id="customer-name" defaultValue="Ayla Rzayeva" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="customer-phone">Phone</Label>
                <Input id="customer-phone" defaultValue="+994 50 412 08 77" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="customer-note">Note</Label>
                <Textarea
                    id="customer-note"
                    defaultValue="Prefers late-afternoon slots with Leyla."
                />
            </div>
        </div>
    );
}

export function InlineWithControl() {
    return (
        <div className="grid w-full max-w-sm gap-4">
            <div className="flex items-center gap-3">
                <Checkbox id="send-reminder" defaultChecked />
                <Label htmlFor="send-reminder">
                    Send an SMS reminder 24 hours before
                </Label>
            </div>
            <div className="flex items-center gap-3">
                <Switch id="online-booking" defaultChecked />
                <Label htmlFor="online-booking">
                    Bookable on your public page
                </Label>
            </div>
        </div>
    );
}

export function DisabledField() {
    return (
        <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="booking-reference">Booking reference</Label>
            <Input id="booking-reference" disabled defaultValue="APT-2026-0814" />
            <p className="text-xs text-muted-foreground">
                Generated when the appointment is confirmed.
            </p>
        </div>
    );
}
