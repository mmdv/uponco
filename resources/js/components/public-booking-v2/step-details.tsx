import { useEffect, useRef } from 'react';

import InputError from '@/components/input-error';
import { useBooking } from '@/components/public-booking-v2/booking-context';
import ErrorAlert from '@/components/public-booking-v2/error-alert';
import { Input } from '@/components/ui/input';
import { InternationalPhoneInput } from '@/components/ui/international-phone-input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import { REMINDER_OFFSETS } from '@/lib/booking';

export type CustomerDetails = {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    notes: string;
    /**
     * The reminder lead time in minutes (as a string), or `REMINDER_NONE`.
     * Converted to a nullable integer when the booking is submitted.
     */
    reminder_offset_minutes: string;
};

/** The form's fields in on-screen order, so focus lands on the first bad one. */
const FIELD_ORDER = [
    'customer_name',
    'customer_email',
    'customer_phone',
    'notes',
    'reminder_offset_minutes',
] as const;

/**
 * Step three: personal information. The booking recap sits above it.
 *
 * A rejected submit is announced by an alert at the top and the first invalid
 * field is focused and scrolled to — but only when new errors appear, never
 * while the visitor is fixing them one by one.
 */
export default function StepDetails() {
    const {
        details: values,
        handleDetailChange: onChange,
        errors,
    } = useBooking();
    const { t } = useTranslation('booking');
    const invalidFields = FIELD_ORDER.filter((field) => errors[field]);
    const invalidKey = invalidFields.join(',');
    const previousInvalidCount = useRef(0);

    useEffect(() => {
        const fields = invalidKey === '' ? [] : invalidKey.split(',');

        if (fields.length > previousInvalidCount.current) {
            const input = document.getElementById(fields[0]);

            input?.focus({ preventScroll: true });
            input?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }

        previousInvalidCount.current = fields.length;
    }, [invalidKey]);

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
                <h3 className="text-sm font-medium">{t('details.heading')}</h3>

                {errors.booking_conflict ? (
                    <ErrorAlert
                        title={t('v2.errors.title')}
                        data-test="booking-conflict-error"
                    >
                        {errors.booking_conflict}
                    </ErrorAlert>
                ) : (
                    invalidFields.length > 0 && (
                        <ErrorAlert
                            title={t('v2.errors.title')}
                            data-test="booking-details-error"
                        >
                            {t('v2.errors.fields')}
                        </ErrorAlert>
                    )
                )}

                <div className="grid gap-2">
                    <Label htmlFor="customer_name">{t('details.name')}</Label>
                    <Input
                        id="customer_name"
                        className="h-12"
                        value={values.customer_name}
                        onChange={(event) =>
                            onChange('customer_name', event.target.value)
                        }
                        placeholder={t('details.namePlaceholder')}
                        autoComplete="name"
                        autoCapitalize="words"
                        aria-invalid={Boolean(errors.customer_name)}
                        data-test="appointment-customer-name-input"
                    />
                    <InputError message={errors.customer_name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="customer_email">{t('details.email')}</Label>
                    <Input
                        id="customer_email"
                        type="email"
                        className="h-12"
                        value={values.customer_email}
                        onChange={(event) =>
                            onChange('customer_email', event.target.value)
                        }
                        placeholder={t('details.emailPlaceholder')}
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
                    <Label htmlFor="customer_phone">{t('details.phone')}</Label>
                    <InternationalPhoneInput
                        id="customer_phone"
                        className="h-12"
                        value={values.customer_phone}
                        onChange={(next) => onChange('customer_phone', next)}
                        placeholder={t('details.phonePlaceholder')}
                        aria-invalid={Boolean(errors.customer_phone)}
                        data-test="appointment-customer-phone-input"
                    />
                    <InputError message={errors.customer_phone} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="notes">{t('details.notes')}</Label>
                    <Textarea
                        id="notes"
                        value={values.notes}
                        onChange={(event) =>
                            onChange('notes', event.target.value)
                        }
                        placeholder={t('details.notesPlaceholder')}
                        rows={4}
                        autoComplete="off"
                        data-test="appointment-notes-input"
                    />
                    <InputError message={errors.notes} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="reminder_offset_minutes">
                        {t('details.reminder.label')}
                    </Label>
                    <Select
                        value={values.reminder_offset_minutes}
                        onValueChange={(next) =>
                            onChange('reminder_offset_minutes', next)
                        }
                    >
                        <SelectTrigger
                            id="reminder_offset_minutes"
                            className="h-12 w-full"
                            data-test="appointment-reminder-select"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {REMINDER_OFFSETS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    data-test={`appointment-reminder-${option.key}`}
                                >
                                    {t(
                                        `details.reminder.options.${option.key}`,
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.reminder_offset_minutes} />
                </div>
            </form>
        </div>
    );
}
