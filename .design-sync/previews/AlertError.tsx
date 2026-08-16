import { AlertError, Button, Input, Label } from 'uponco';

export function ValidationSummary() {
    return (
        <div className="w-full max-w-lg">
            <AlertError
                errors={[
                    'The service title has already been taken.',
                    'The duration must be at least 5 minutes.',
                    'Select at least one specialist for this service.',
                ]}
            />
        </div>
    );
}

export function SingleErrorWithCustomTitle() {
    return (
        <div className="w-full max-w-lg">
            <AlertError
                title="We couldn't sign you in"
                errors={['These credentials do not match our records.']}
            />
        </div>
    );
}

export function AboveAForm() {
    return (
        <div className="w-full max-w-md space-y-4">
            <AlertError
                title="Deep Tissue Massage wasn't saved"
                errors={[
                    'The price must be a number.',
                    'Nizami Studio is closed on the days you selected.',
                ]}
            />

            <div className="space-y-2">
                <Label htmlFor="service-title">Service name</Label>
                <Input
                    id="service-title"
                    defaultValue="Deep Tissue Massage"
                    readOnly
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="service-price">Price (₼)</Label>
                <Input id="service-price" defaultValue="sixty" readOnly aria-invalid />
            </div>

            <Button className="w-full">Save service</Button>
        </div>
    );
}
