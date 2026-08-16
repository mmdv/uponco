import { Input, InputError, Label, PhoneInput } from 'uponco';

export function InCustomerFields() {
    return (
        <div className="grid w-full max-w-sm gap-4">
            <div className="grid gap-2">
                <Label htmlFor="customer-name">Customer name</Label>
                <Input id="customer-name" defaultValue="Nigar Məmmədova" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="customer-phone">Phone number</Label>
                <PhoneInput
                    id="customer-phone"
                    defaultValue="+994 50 415 22 08"
                />
            </div>
        </div>
    );
}

export function EmptyAndInvalid() {
    return (
        <div className="grid w-full max-w-sm gap-6">
            <div className="grid gap-2">
                <Label htmlFor="location-phone">Location phone</Label>
                <PhoneInput
                    id="location-phone"
                    placeholder="+994 12 505 40 10"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="booking-phone">Phone number</Label>
                <PhoneInput
                    id="booking-phone"
                    aria-invalid
                    defaultValue="055 12"
                />
                <InputError message="Enter a valid phone number so we can send reminders." />
            </div>
        </div>
    );
}

export function Disabled() {
    return (
        <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="disabled-phone">Phone number</Label>
            <PhoneInput
                id="disabled-phone"
                disabled
                defaultValue="+994 50 415 22 08"
            />
            <p className="text-xs text-muted-foreground">
                Locked while the appointment is being confirmed.
            </p>
        </div>
    );
}
