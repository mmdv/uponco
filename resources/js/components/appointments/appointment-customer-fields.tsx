import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import type { Appointment } from '@/types';

type Props = {
    appointment: Appointment | null;
    errors: Partial<Record<string, string>>;
};

/**
 * The customer details section of the appointment form. A customer record is
 * created automatically on the server when the details don't match an existing
 * customer for the team.
 */
export default function AppointmentCustomerFields({
    appointment,
    errors,
}: Props) {
    const { t } = useTranslation('appointments');
    const customer = appointment?.customer ?? null;

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-0.5">
                <h3 className="text-sm font-medium">{t('customer.heading')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('customer.autoCreateNote')}
                </p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="customer_name">{t('customer.nameLabel')}</Label>
                <Input
                    id="customer_name"
                    name="customer_name"
                    defaultValue={customer?.name ?? ''}
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
                    defaultValue={customer?.email ?? ''}
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
                    defaultValue={customer?.phone ?? ''}
                    placeholder={t('customer.phonePlaceholder')}
                    data-test="appointment-customer-phone-input"
                />
                <InputError message={errors.customer_phone} />
            </div>

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
