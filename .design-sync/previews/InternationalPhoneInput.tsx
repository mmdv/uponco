import { InternationalPhoneInput, Label } from 'uponco';

export function Default() {
    return (
        <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="customer-phone">Phone number</Label>
            <InternationalPhoneInput
                id="customer-phone"
                className="h-12"
                value="+994505551234"
                onChange={() => {}}
                placeholder="Your mobile number"
            />
        </div>
    );
}

export function NoNumberYet() {
    return (
        <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="customer-phone-empty">Phone number</Label>
            <InternationalPhoneInput
                id="customer-phone-empty"
                className="h-12"
                value=""
                onChange={() => {}}
                placeholder="Your mobile number"
            />
        </div>
    );
}

export function Invalid() {
    return (
        <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="customer-phone-invalid">Phone number</Label>
            <InternationalPhoneInput
                id="customer-phone-invalid"
                className="h-12"
                value="+994505551"
                onChange={() => {}}
                placeholder="Your mobile number"
                aria-invalid
            />
            <p className="text-sm text-destructive">
                Enter a full mobile number so we can text you a reminder.
            </p>
        </div>
    );
}

export function InBookingDetailsStep() {
    return (
        <div className="grid w-full max-w-sm gap-4 rounded-xl border bg-card p-5">
            <p className="font-semibold">Your details</p>
            <div className="grid gap-2">
                <Label htmlFor="booking-phone">Phone number</Label>
                <InternationalPhoneInput
                    id="booking-phone"
                    className="h-12"
                    value="+994512223344"
                    onChange={() => {}}
                    placeholder="Your mobile number"
                />
                <p className="text-xs text-muted-foreground">
                    Used only to confirm your Deep Tissue Massage on 16 August.
                </p>
            </div>
        </div>
    );
}
