import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { InternationalPhoneInput } from '@/components/ui/international-phone-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export type CustomerDetails = {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    notes: string;
};

type Props = {
    values: CustomerDetails;
    onChange: (field: keyof CustomerDetails, value: string) => void;
    errors: Partial<Record<string, string>>;
};

/**
 * Step three: personal information. The booking recap lives in the inline
 * summary bar at the top of the flow.
 */
export default function StepDetails({ values, onChange, errors }: Props) {
    return (
        <div className="space-y-6">
            {/*
             * Grouping the fields in a form (with authoritative autocomplete
             * tokens) lets the browser and password managers offer native
             * autofill and "save these details" prompts. Submission itself is
             * driven from the footer via the booking hook, so the form's own
             * submit is a no-op.
             */}
            <form
                className="space-y-4"
                onSubmit={(event) => event.preventDefault()}
            >
                <h2 className="text-sm font-medium">Your details</h2>

                {errors.booking_conflict && (
                    <p
                        role="alert"
                        className="rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                    >
                        {errors.booking_conflict}
                    </p>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="customer_name">Name surname</Label>
                    <Input
                        id="customer_name"
                        className="h-12"
                        value={values.customer_name}
                        onChange={(event) =>
                            onChange('customer_name', event.target.value)
                        }
                        placeholder="Jane Doe"
                        autoComplete="name"
                        autoCapitalize="words"
                        aria-invalid={Boolean(errors.customer_name)}
                        data-test="appointment-customer-name-input"
                    />
                    <InputError message={errors.customer_name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="customer_email">Email</Label>
                    <Input
                        id="customer_email"
                        type="email"
                        className="h-12"
                        value={values.customer_email}
                        onChange={(event) =>
                            onChange('customer_email', event.target.value)
                        }
                        placeholder="jane@example.com"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        inputMode="email"
                        aria-invalid={Boolean(errors.customer_email)}
                        data-test="appointment-customer-email-input"
                    />
                    <InputError message={errors.customer_email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="customer_phone">Phone</Label>
                    <InternationalPhoneInput
                        id="customer_phone"
                        className="h-12"
                        value={values.customer_phone}
                        onChange={(next) => onChange('customer_phone', next)}
                        placeholder="555 123 4567"
                        aria-invalid={Boolean(errors.customer_phone)}
                        data-test="appointment-customer-phone-input"
                    />
                    <InputError message={errors.customer_phone} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                        id="notes"
                        value={values.notes}
                        onChange={(event) =>
                            onChange('notes', event.target.value)
                        }
                        placeholder="Anything we should know before your visit…"
                        rows={4}
                        autoComplete="off"
                        data-test="appointment-notes-input"
                    />
                    <InputError message={errors.notes} />
                </div>
            </form>
        </div>
    );
}
