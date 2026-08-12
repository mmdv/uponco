import { Form } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import NumericInput from '@/components/numeric-input';
import ServiceHiddenInputs from '@/components/services/service-hidden-inputs';
import ServicePricingFields from '@/components/services/service-pricing-fields';
import ServiceSpecialistPricingSection from '@/components/services/service-specialist-pricing-section';
import ServiceTypeFields from '@/components/services/service-type-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { SheetFooter } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { defaultCurrencyForLocale } from '@/lib/currency';
import { store, update } from '@/routes/company/services';
import type {
    CurrencyCode,
    DeliveryType,
    PriceType,
    SelectOption,
    Service,
    ServiceCategory,
    ServiceTypeValue,
} from '@/types';

export type ServiceFormFieldsProps = {
    service: Service | null;
    defaultCategoryId: number | null;
    categories: ServiceCategory[];
    locations: SelectOption[];
    specialists: SelectOption[];
    priceTypes: SelectOption[];
    currencies: SelectOption[];
    serviceTypes: SelectOption[];
    deliveryTypes: SelectOption[];
    meetingProviders: SelectOption[];
    onSuccess: () => void;
    onCancel: () => void;
};

export default function ServiceFormFields({
    service,
    defaultCategoryId,
    categories,
    locations,
    specialists,
    priceTypes,
    currencies,
    serviceTypes,
    deliveryTypes,
    meetingProviders,
    onSuccess,
    onCancel,
}: ServiceFormFieldsProps) {
    const { t } = useTranslation('company');
    const { locale } = useLocale();
    const isEditing = service !== null;

    const [isActive, setIsActive] = useState(service?.is_active ?? true);
    const [categoryId, setCategoryId] = useState(
        service?.service_category_id?.toString() ??
            defaultCategoryId?.toString() ??
            '',
    );
    const [priceType, setPriceType] = useState<PriceType>(
        service?.price_type ?? 'fixed',
    );
    const [currency, setCurrency] = useState<CurrencyCode>(
        service?.currency ?? defaultCurrencyForLocale(locale),
    );
    const [serviceType, setServiceType] = useState<ServiceTypeValue>(
        service?.service_type ?? 'individual',
    );
    const [deliveryType, setDeliveryType] = useState<DeliveryType>(
        service?.delivery_type ?? 'onsite',
    );
    const [meetingProvider, setMeetingProvider] = useState(
        service?.online_meeting_provider ?? '',
    );
    const [locationIds, setLocationIds] = useState<string[]>(
        service?.location_ids.map((id) => id.toString()) ?? [],
    );
    const [specialistIds, setSpecialistIds] = useState<string[]>(
        service?.user_ids.map((id) => id.toString()) ?? [],
    );

    // A category is optional, so leaving it unset is an explicit choice rather
    // than an empty field. The blank value submits as null.
    const categoryOptions: SelectOption[] = [
        { value: '', label: t('services.form.categoryNone') },
        ...categories.map((category) => ({
            value: category.id.toString(),
            label: category.name,
        })),
    ];

    const handleDeliveryTypeChange = (next: DeliveryType) => {
        setDeliveryType(next);

        // Online services are not tied to a branch.
        if (next === 'online') {
            setLocationIds([]);

            // Default to the only available provider.
            if (!meetingProvider) {
                setMeetingProvider(meetingProviders[0]?.value ?? '');
            }
        }
    };

    return (
        <Form
            {...(isEditing ? update.form([service.id]) : store.form())}
            options={{ preserveScroll: true }}
            onSuccess={onSuccess}
            className="flex min-h-0 flex-1 flex-col"
            disableWhileProcessing
        >
            {({ errors, processing }) => (
                <>
                    <ServiceHiddenInputs
                        isActive={isActive}
                        categoryId={categoryId}
                        priceType={priceType}
                        serviceType={serviceType}
                        deliveryType={deliveryType}
                        meetingProvider={meetingProvider}
                        locationIds={locationIds}
                        specialistIds={specialistIds}
                    />

                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active">
                                    {t('services.form.active')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('services.form.activeHint')}
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                data-test="service-active-switch"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                {t('services.form.titleLabel')}
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                data-test="service-title-input"
                                defaultValue={service?.title ?? ''}
                                placeholder={t(
                                    'services.form.titlePlaceholder',
                                )}
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="service_category_id">
                                {t('services.form.category')}
                            </Label>
                            <SearchableSelect
                                id="service_category_id"
                                options={categoryOptions}
                                value={categoryId}
                                onChange={setCategoryId}
                                placeholder={t(
                                    'services.form.categoryPlaceholder',
                                )}
                                searchPlaceholder={t(
                                    'services.form.categorySearchPlaceholder',
                                )}
                                emptyMessage={t('services.form.categoryEmpty')}
                                invalid={Boolean(errors.service_category_id)}
                                data-test="service-category-select"
                            />
                            <InputError message={errors.service_category_id} />
                        </div>

                        <ServicePricingFields
                            priceTypes={priceTypes}
                            priceType={priceType}
                            onPriceTypeChange={setPriceType}
                            currency={currency}
                            onCurrencyChange={setCurrency}
                            currencies={currencies}
                            service={service}
                            errors={errors}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">
                                    {t('services.form.duration')}
                                </Label>
                                <NumericInput
                                    id="duration"
                                    name="duration"
                                    defaultValue={service?.duration ?? ''}
                                    placeholder="60"
                                />
                                <InputError message={errors.duration} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="technical_break">
                                    {t('services.form.break')}
                                </Label>
                                <NumericInput
                                    id="technical_break"
                                    name="technical_break"
                                    defaultValue={service?.technical_break ?? 0}
                                    placeholder="0"
                                />
                                <InputError message={errors.technical_break} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="slot_interval">
                                {t('services.form.slotInterval')}
                            </Label>
                            <NumericInput
                                id="slot_interval"
                                name="slot_interval"
                                defaultValue={service?.slot_interval ?? ''}
                                placeholder={t(
                                    'services.form.slotIntervalPlaceholder',
                                )}
                            />
                            <p className="text-sm text-muted-foreground">
                                {t('services.form.slotIntervalHint')}
                            </p>
                            <InputError message={errors.slot_interval} />
                        </div>

                        <ServiceTypeFields
                            serviceTypes={serviceTypes}
                            serviceType={serviceType}
                            onServiceTypeChange={setServiceType}
                            deliveryTypes={deliveryTypes}
                            deliveryType={deliveryType}
                            onDeliveryTypeChange={handleDeliveryTypeChange}
                            meetingProviders={meetingProviders}
                            meetingProvider={meetingProvider}
                            onMeetingProviderChange={setMeetingProvider}
                            service={service}
                            errors={errors}
                        />

                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                {t('services.form.description')}
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={service?.description ?? ''}
                                placeholder={t(
                                    'services.form.descriptionPlaceholder',
                                )}
                                rows={4}
                            />
                            <InputError message={errors.description} />
                        </div>

                        {deliveryType !== 'online' && (
                            <div className="grid gap-2">
                                <Label htmlFor="location_ids">
                                    {t('services.form.locations')}
                                </Label>
                                <MultiSelect
                                    id="location_ids"
                                    options={locations}
                                    value={locationIds}
                                    onChange={setLocationIds}
                                    placeholder={t(
                                        'services.form.locationsPlaceholder',
                                    )}
                                    searchPlaceholder={t(
                                        'services.form.locationsSearchPlaceholder',
                                    )}
                                    emptyMessage={t(
                                        'services.form.locationsEmpty',
                                    )}
                                    invalid={Boolean(errors.location_ids)}
                                    data-test="service-locations-select"
                                />
                                <p className="text-sm text-muted-foreground">
                                    {t('services.form.locationsHint')}
                                </p>
                                <InputError message={errors.location_ids} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="user_ids">
                                {t('services.form.specialists')}
                            </Label>
                            <MultiSelect
                                id="user_ids"
                                options={specialists}
                                value={specialistIds}
                                onChange={setSpecialistIds}
                                placeholder={t(
                                    'services.form.specialistsPlaceholder',
                                )}
                                searchPlaceholder={t(
                                    'services.form.specialistsSearchPlaceholder',
                                )}
                                emptyMessage={t(
                                    'services.form.specialistsEmpty',
                                )}
                                invalid={Boolean(errors.user_ids)}
                                data-test="service-specialists-select"
                            />
                            <p className="text-sm text-muted-foreground">
                                {t('services.form.specialistsHint')}
                            </p>
                            <InputError message={errors.user_ids} />
                        </div>

                        <ServiceSpecialistPricingSection
                            specialistIds={specialistIds}
                            specialists={specialists}
                            priceType={priceType}
                            service={service}
                            errors={errors}
                        />
                    </div>

                    <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            {t('services.form.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            data-test="service-save-button"
                            disabled={processing}
                        >
                            {isEditing
                                ? t('services.form.save')
                                : t('services.form.add')}
                        </Button>
                    </SheetFooter>
                </>
            )}
        </Form>
    );
}
