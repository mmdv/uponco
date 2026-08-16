import { Input, InputError, Label } from 'uponco';

/** The message sits directly under the field it belongs to. */
export function UnderField() {
    return (
        <div className="grid max-w-sm gap-2">
            <Label htmlFor="customer-email-error">Email</Label>
            <Input
                id="customer-email-error"
                aria-invalid
                defaultValue="ayla@"
            />
            <InputError message="Enter a valid email address." />
        </div>
    );
}

/** A whole form section after a failed save, several fields rejected at once. */
export function FormWithErrors() {
    return (
        <div className="grid max-w-sm gap-4">
            <div className="grid gap-2">
                <Label htmlFor="service-title">Service name</Label>
                <Input id="service-title" aria-invalid defaultValue="" />
                <InputError message="Give this service a name." />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="service-duration">Duration (minutes)</Label>
                <Input
                    id="service-duration"
                    type="number"
                    aria-invalid
                    defaultValue="0"
                />
                <InputError message="Duration must be at least 5 minutes." />
            </div>
        </div>
    );
}

/**
 * With no message the component renders nothing, so a valid field keeps its
 * layout unchanged — shown here beside an invalid twin.
 */
export function NoMessage() {
    return (
        <div className="grid max-w-sm gap-4">
            <div className="grid gap-2">
                <Label htmlFor="slot-start-ok">Starts at</Label>
                <Input id="slot-start-ok" type="time" defaultValue="09:30" />
                <InputError message={undefined} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="slot-end-bad">Ends at</Label>
                <Input
                    id="slot-end-bad"
                    type="time"
                    aria-invalid
                    defaultValue="08:00"
                />
                <InputError message="The end time must be after the start time." />
            </div>
        </div>
    );
}
