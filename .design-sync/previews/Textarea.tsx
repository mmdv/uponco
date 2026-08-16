import { Label, Textarea } from 'uponco';

export function AppointmentNote() {
    return (
        <div className="grid w-full max-w-md gap-2">
            <Label htmlFor="appointment-note">Note for the specialist</Label>
            <Textarea
                id="appointment-note"
                defaultValue="Ayla prefers firm pressure on the shoulders and asked to skip the scalp massage."
            />
            <p className="text-xs text-muted-foreground">
                Only visible to your team, never to the customer.
            </p>
        </div>
    );
}

export function Placeholder() {
    return (
        <div className="grid w-full max-w-md gap-2">
            <Label htmlFor="service-description">Service description</Label>
            <Textarea
                id="service-description"
                placeholder="Describe what a Deep Tissue Massage includes so customers know what to expect…"
            />
        </div>
    );
}

export function Invalid() {
    return (
        <div className="grid w-full max-w-md gap-2">
            <Label htmlFor="cancellation-reason">Cancellation reason</Label>
            <Textarea id="cancellation-reason" aria-invalid defaultValue="" />
            <p className="text-xs text-destructive">
                Tell Nigar Əliyeva why her 11:00 Gel Manicure is being cancelled.
            </p>
        </div>
    );
}

export function Disabled() {
    return (
        <div className="grid w-full max-w-md gap-2">
            <Label htmlFor="booking-message">Message from the customer</Label>
            <Textarea
                id="booking-message"
                disabled
                defaultValue="Running about ten minutes late — please don't give my slot away!"
            />
        </div>
    );
}
