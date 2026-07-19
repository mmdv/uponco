import { Form } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { PhoneInput } from '@/components/ui/phone-input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/use-translation';
import { store, update } from '@/routes/company/locations';
import type { Location, SelectOption } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location: Location | null;
    teamSlug: string;
    services: SelectOption[];
    specialists: SelectOption[];
    countries: SelectOption[];
};

export default function LocationFormModal({
    open,
    onOpenChange,
    location,
    teamSlug,
    services,
    specialists,
    countries,
}: Props) {
    const { t } = useTranslation('locations');
    const isEditing = location !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
                    <DialogTitle>
                        {isEditing ? t('form.editTitle') : t('form.newTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? t('form.editDescription')
                            : t('form.newDescription')}
                    </DialogDescription>
                </DialogHeader>

                <LocationFormFields
                    key={location?.id ?? 'new'}
                    location={location}
                    teamSlug={teamSlug}
                    services={services}
                    specialists={specialists}
                    countries={countries}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}

type FieldsProps = {
    location: Location | null;
    teamSlug: string;
    services: SelectOption[];
    specialists: SelectOption[];
    countries: SelectOption[];
    onSuccess: () => void;
    onCancel: () => void;
};

function FormSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            {children}
        </section>
    );
}

function LocationFormFields({
    location,
    teamSlug,
    services,
    specialists,
    countries,
    onSuccess,
    onCancel,
}: FieldsProps) {
    const { t } = useTranslation('locations');
    const isEditing = location !== null;

    const [isActive, setIsActive] = useState(location?.is_active ?? true);
    const [country, setCountry] = useState(location?.country ?? '');
    const [serviceIds, setServiceIds] = useState<string[]>(
        location?.service_ids.map((id) => id.toString()) ?? [],
    );
    const [specialistIds, setSpecialistIds] = useState<string[]>(
        location?.user_ids.map((id) => id.toString()) ?? [],
    );

    return (
        <Form
            {...(isEditing
                ? update.form([teamSlug, location.id])
                : store.form(teamSlug))}
            // The modal can be opened from inside another flow (the service
            // wizard), so the page must not remount and drop that flow's state.
            options={{ preserveScroll: true, preserveState: true }}
            onSuccess={onSuccess}
            className="flex min-h-0 flex-1 flex-col"
            disableWhileProcessing
        >
            {({ errors, processing }) => (
                <>
                    <input
                        type="hidden"
                        name="is_active"
                        value={isActive ? '1' : '0'}
                    />
                    <input type="hidden" name="country" value={country} />
                    {serviceIds.map((id) => (
                        <input
                            key={`service-${id}`}
                            type="hidden"
                            name="service_ids[]"
                            value={id}
                        />
                    ))}
                    {specialistIds.map((id) => (
                        <input
                            key={`specialist-${id}`}
                            type="hidden"
                            name="user_ids[]"
                            value={id}
                        />
                    ))}

                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active">
                                    {t('form.active')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('form.activeHint')}
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                data-test="location-active-switch"
                            />
                        </div>

                        <FormSection title={t('form.sections.details')}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        {t('form.name')}
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        data-test="location-name-input"
                                        defaultValue={location?.name ?? ''}
                                        placeholder="Head office"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        {t('form.phone')}
                                    </Label>
                                    <PhoneInput
                                        id="phone"
                                        name="phone"
                                        defaultValue={location?.phone ?? ''}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title={t('form.sections.address')}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="country">
                                        {t('form.country')}
                                    </Label>
                                    <SearchableSelect
                                        id="country"
                                        options={countries}
                                        value={country}
                                        onChange={setCountry}
                                        placeholder={t('form.selectCountry')}
                                        searchPlaceholder={t(
                                            'form.searchCountries',
                                        )}
                                        emptyMessage={t('form.noCountries')}
                                        invalid={Boolean(errors.country)}
                                        data-test="location-country-select"
                                    />
                                    <InputError message={errors.country} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="city">
                                        {t('form.city')}
                                    </Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        defaultValue={location?.city ?? ''}
                                        placeholder="San Francisco"
                                    />
                                    <InputError message={errors.city} />
                                </div>

                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="street_address">
                                        {t('form.streetAddress')}
                                    </Label>
                                    <Input
                                        id="street_address"
                                        name="street_address"
                                        defaultValue={
                                            location?.street_address ?? ''
                                        }
                                        placeholder="123 Market St"
                                    />
                                    <InputError
                                        message={errors.street_address}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="unit">
                                        {t('form.unit')}
                                    </Label>
                                    <Input
                                        id="unit"
                                        name="unit"
                                        defaultValue={location?.unit ?? ''}
                                        placeholder="Suite 400"
                                    />
                                    <InputError message={errors.unit} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="postal_code">
                                        {t('form.postalCode')}
                                    </Label>
                                    <Input
                                        id="postal_code"
                                        name="postal_code"
                                        defaultValue={
                                            location?.postal_code ?? ''
                                        }
                                        placeholder="94103"
                                    />
                                    <InputError message={errors.postal_code} />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title={t('form.sections.assignments')}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="service_ids">
                                        {t('form.services')}
                                    </Label>
                                    <MultiSelect
                                        id="service_ids"
                                        options={services}
                                        value={serviceIds}
                                        onChange={setServiceIds}
                                        placeholder={t('form.selectServices')}
                                        searchPlaceholder={t(
                                            'form.searchServices',
                                        )}
                                        emptyMessage={t('form.noServices')}
                                        invalid={Boolean(errors.service_ids)}
                                        data-test="location-services-select"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {t('form.servicesHint')}
                                    </p>
                                    <InputError message={errors.service_ids} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="user_ids">
                                        {t('form.specialists')}
                                    </Label>
                                    <MultiSelect
                                        id="user_ids"
                                        options={specialists}
                                        value={specialistIds}
                                        onChange={setSpecialistIds}
                                        placeholder={t(
                                            'form.selectSpecialists',
                                        )}
                                        searchPlaceholder={t(
                                            'form.searchSpecialists',
                                        )}
                                        emptyMessage={t('form.noSpecialists')}
                                        invalid={Boolean(errors.user_ids)}
                                        data-test="location-specialists-select"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {t('form.specialistsHint')}
                                    </p>
                                    <InputError message={errors.user_ids} />
                                </div>
                            </div>
                        </FormSection>
                    </div>

                    <DialogFooter className="shrink-0 flex-row justify-end border-t px-4 py-4 sm:px-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                            className="flex-1 sm:flex-none"
                        >
                            {t('form.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            data-test="location-save-button"
                            disabled={processing}
                            className="flex-1 sm:flex-none"
                        >
                            {isEditing
                                ? t('form.saveChanges')
                                : t('form.addLocation')}
                        </Button>
                    </DialogFooter>
                </>
            )}
        </Form>
    );
}
