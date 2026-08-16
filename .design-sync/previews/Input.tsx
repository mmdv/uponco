import { Input, InputError, Label } from 'uponco';

/** A single field from the new-customer form. */
export function Default() {
    return (
        <div className="grid max-w-sm gap-2">
            <Label htmlFor="customer-name">Full name</Label>
            <Input id="customer-name" defaultValue="Ayla Rzayeva" />
        </div>
    );
}

/** Empty with placeholder guidance, as the field first appears. */
export function Placeholder() {
    return (
        <div className="grid max-w-sm gap-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input
                id="customer-email"
                type="email"
                placeholder="ayla@example.com"
            />
        </div>
    );
}

/** The input types the booking and service forms actually use. */
export function Types() {
    return (
        <div className="grid max-w-sm gap-4">
            <div className="grid gap-2">
                <Label htmlFor="service-price">Price (₼)</Label>
                <Input id="service-price" type="number" defaultValue="85" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="slot-start">Starts at</Label>
                <Input id="slot-start" type="time" defaultValue="09:30" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="appointment-date">Date</Label>
                <Input
                    id="appointment-date"
                    type="date"
                    defaultValue="2026-08-21"
                />
            </div>
        </div>
    );
}

/** Server-side validation failed: destructive ring plus the message below. */
export function Invalid() {
    return (
        <div className="grid max-w-sm gap-2">
            <Label htmlFor="customer-phone">Phone</Label>
            <Input
                id="customer-phone"
                aria-invalid
                defaultValue="+994 50 12"
            />
            <InputError message="Enter a valid mobile number." />
        </div>
    );
}

/** Disabled while a service's price is inherited from the category default. */
export function Disabled() {
    return (
        <div className="grid max-w-sm gap-2">
            <Label htmlFor="inherited-duration">Duration</Label>
            <Input id="inherited-duration" disabled defaultValue="60 minutes" />
        </div>
    );
}
