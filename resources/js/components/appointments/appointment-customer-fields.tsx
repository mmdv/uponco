import { useState } from 'react';

import CustomerSearchPopover from '@/components/appointments/customer-search-popover';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import { appointmentCustomerLabel } from '@/lib/appointments';
import type { Appointment } from '@/types';

type Props = {
    appointment: Appointment | null;
    errors: Partial<Record<string, string>>;
};

/**
 * The customer details section of the appointment form. A customer record is
 * created automatically on the server when the details don't match an existing
 * customer for the team.
 *
 * Customer details are only editable while booking a new appointment. When
 * editing an existing one they're shown read-only — the customer is fixed for
 * the booking — while the appointment notes stay editable.
 */
export default function AppointmentCustomerFields({
    appointment,
    errors,
}: Props) {
    const { t } = useTranslation('appointments');
    const customer = appointment?.customer ?? null;
    const isEditing = appointment !== null;

    // While creating, the fields are controlled so selecting a customer from
    // search can autofill (and overwrite) them. When editing they're read-only.
    const [name, setName] = useState(customer?.name ?? '');
    const [email, setEmail] = useState(customer?.email ?? '');
    const [phone, setPhone] = useState(customer?.phone ?? '');

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">
                        {t('customer.heading')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {isEditing
                            ? t('customer.readOnlyNote')
                            : t('customer.autoCreateNote')}
                    </p>
                </div>
                {!isEditing ? (
                    <CustomerSearchPopover
                        onSelect={(selected) => {
                            setName(selected.name ?? '');
                            setEmail(selected.email ?? '');
                            setPhone(selected.phone ?? '');
                        }}
                    />
                ) : null}
            </div>

            {isEditing ? (
                <>
                    {/* Carry the existing customer through so the update request
                        still validates without changing the customer. */}
                    <input
                        type="hidden"
                        name="customer_name"
                        value={customer?.name ?? ''}
                    />
                    <input
                        type="hidden"
                        name="customer_email"
                        value={customer?.email ?? ''}
                    />
                    <input
                        type="hidden"
                        name="customer_phone"
                        value={customer?.phone ?? ''}
                    />

                    <dl className="space-y-3">
                        <div className="grid gap-0.5">
                            <dt className="text-sm text-muted-foreground">
                                {t('customer.nameLabel')}
                            </dt>
                            <dd className="text-sm font-medium">
                                {appointment
                                    ? appointmentCustomerLabel(
                                          appointment,
                                          t('customer.noName'),
                                      )
                                    : '—'}
                            </dd>
                        </div>
                        <div className="grid gap-0.5">
                            <dt className="text-sm text-muted-foreground">
                                {t('customer.emailLabel')}
                            </dt>
                            <dd className="text-sm font-medium">
                                {customer?.email || '—'}
                            </dd>
                        </div>
                        <div className="grid gap-0.5">
                            <dt className="text-sm text-muted-foreground">
                                {t('customer.phoneLabel')}
                            </dt>
                            <dd className="text-sm font-medium">
                                {customer?.phone || '—'}
                            </dd>
                        </div>
                    </dl>
                </>
            ) : (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="customer_name">
                            {t('customer.nameLabel')}
                        </Label>
                        <Input
                            id="customer_name"
                            name="customer_name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder={t('customer.namePlaceholder')}
                            data-test="appointment-customer-name-input"
                        />
                        <InputError message={errors.customer_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="customer_email">
                            {t('customer.emailLabel')}
                        </Label>
                        <Input
                            id="customer_email"
                            name="customer_email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder={t('customer.emailPlaceholder')}
                            data-test="appointment-customer-email-input"
                        />
                        <InputError message={errors.customer_email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="customer_phone">
                            {t('customer.phoneLabel')}
                        </Label>
                        <PhoneInput
                            id="customer_phone"
                            name="customer_phone"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            placeholder={t('customer.phonePlaceholder')}
                            data-test="appointment-customer-phone-input"
                        />
                        <InputError message={errors.customer_phone} />
                    </div>
                </>
            )}

            <div className="grid gap-2">
                <Label htmlFor="notes">{t('customer.notesLabel')}</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={appointment?.notes ?? ''}
                    placeholder={t('customer.notesPlaceholder')}
                    rows={3}
                    data-test="appointment-notes-input"
                />
                <InputError message={errors.notes} />
            </div>
        </div>
    );
}
