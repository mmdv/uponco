import InputError from '@/components/input-error';
import { OptionToggleGroup } from '@/components/services/option-toggle-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import type { PriceType, SelectOption, ServiceTypeValue } from '@/types';

export type WizardDetails = {
    title: string;
    categoryId: string;
    description: string;
    priceType: PriceType;
    price: string;
    priceMin: string;
    priceMax: string;
    duration: string;
    technicalBreak: string;
    serviceType: ServiceTypeValue;
    capacity: string;
    specialistIds: string[];
    isActive: boolean;
};

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <h3 className="text-sm font-medium">{children}</h3>
            <Separator />
        </div>
    );
}

/** Marks a field the user must fill in before the service can be created. */
function RequiredMark({ label }: { label: string }) {
    return (
        <span className="text-destructive">
            <span aria-hidden="true">*</span>
            <span className="sr-only">{label}</span>
        </span>
    );
}

/**
 * Final wizard step: everything that is not about delivery, grouped into
 * small titled sections so the long list stays scannable.
 */
export default function StepDetails({
    details,
    onPatch,
    summary,
    onEditDelivery,
    categoryOptions,
    specialists,
    priceTypes,
    serviceTypes,
    errors,
}: {
    details: WizardDetails;
    onPatch: (patch: Partial<WizardDetails>) => void;
    summary: string;
    onEditDelivery: () => void;
    categoryOptions: SelectOption[];
    specialists: SelectOption[];
    priceTypes: SelectOption[];
    serviceTypes: SelectOption[];
    errors: Record<string, string>;
}) {
    const { t } = useTranslation('company');
    const requiredLabel = t('services.wizard.details.required');

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-sm" data-test="wizard-summary">
                    {summary}
                </p>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onEditDelivery}
                >
                    {t('services.wizard.summary.edit')}
                </Button>
            </div>

            <p className="text-xs text-muted-foreground">
                {t('services.wizard.details.requiredLegend')}
            </p>

            <SectionHeading>
                {t('services.wizard.details.basics')}
            </SectionHeading>

            <div className="grid gap-2">
                <Label htmlFor="wizard_title">
                    {t('services.form.titleLabel')}{' '}
                    <RequiredMark label={requiredLabel} />
                </Label>
                <Input
                    id="wizard_title"
                    aria-required="true"
                    value={details.title}
                    onChange={(event) => onPatch({ title: event.target.value })}
                    placeholder={t('services.form.titlePlaceholder')}
                    aria-invalid={Boolean(errors.title)}
                    data-test="wizard-title-input"
                />
                <InputError message={errors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="wizard_category">
                    {t('services.form.category')}
                </Label>
                <SearchableSelect
                    id="wizard_category"
                    options={categoryOptions}
                    value={details.categoryId}
                    onChange={(categoryId) => onPatch({ categoryId })}
                    placeholder={t('services.form.categoryPlaceholder')}
                    searchPlaceholder={t(
                        'services.form.categorySearchPlaceholder',
                    )}
                    emptyMessage={t('services.form.categoryEmpty')}
                    invalid={Boolean(errors.service_category_id)}
                    data-test="wizard-category-select"
                />
                <InputError message={errors.service_category_id} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="wizard_description">
                    {t('services.form.description')}
                </Label>
                <Textarea
                    id="wizard_description"
                    value={details.description}
                    onChange={(event) =>
                        onPatch({ description: event.target.value })
                    }
                    placeholder={t('services.form.descriptionPlaceholder')}
                    rows={3}
                />
                <InputError message={errors.description} />
            </div>

            <SectionHeading>
                {t('services.wizard.details.pricing')}
            </SectionHeading>

            <div className="grid gap-2">
                <Label htmlFor="wizard_price_type">
                    {t('services.form.priceType')}
                </Label>
                <OptionToggleGroup
                    id="wizard_price_type"
                    options={priceTypes}
                    value={details.priceType}
                    onChange={(value) =>
                        onPatch({ priceType: value as PriceType })
                    }
                    invalid={Boolean(errors.price_type)}
                    data-test="wizard-price-type-select"
                />
                <InputError message={errors.price_type} />
            </div>

            {details.priceType === 'fixed' && (
                <div className="grid gap-2">
                    <Label htmlFor="wizard_price">
                        {t('services.form.price')}{' '}
                        <RequiredMark label={requiredLabel} />
                    </Label>
                    <Input
                        id="wizard_price"
                        aria-required="true"
                        type="number"
                        step="0.01"
                        min="0"
                        value={details.price}
                        onChange={(event) =>
                            onPatch({ price: event.target.value })
                        }
                        placeholder="50.00"
                        aria-invalid={Boolean(errors.price)}
                    />
                    <InputError message={errors.price} />
                </div>
            )}

            {details.priceType === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor="wizard_price_min">
                            {t('services.form.minPrice')}{' '}
                            <RequiredMark label={requiredLabel} />
                        </Label>
                        <Input
                            id="wizard_price_min"
                            aria-required="true"
                            type="number"
                            step="0.01"
                            min="0"
                            value={details.priceMin}
                            onChange={(event) =>
                                onPatch({ priceMin: event.target.value })
                            }
                            placeholder="50.00"
                            aria-invalid={Boolean(errors.price_min)}
                        />
                        <InputError message={errors.price_min} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="wizard_price_max">
                            {t('services.form.maxPrice')}{' '}
                            <RequiredMark label={requiredLabel} />
                        </Label>
                        <Input
                            id="wizard_price_max"
                            aria-required="true"
                            type="number"
                            step="0.01"
                            min="0"
                            value={details.priceMax}
                            onChange={(event) =>
                                onPatch({ priceMax: event.target.value })
                            }
                            placeholder="200.00"
                            aria-invalid={Boolean(errors.price_max)}
                        />
                        <InputError message={errors.price_max} />
                    </div>
                </div>
            )}

            <SectionHeading>
                {t('services.wizard.details.scheduling')}
            </SectionHeading>

            <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                    <Label htmlFor="wizard_duration">
                        {t('services.form.duration')}{' '}
                        <RequiredMark label={requiredLabel} />
                    </Label>
                    <Input
                        id="wizard_duration"
                        aria-required="true"
                        type="number"
                        min="1"
                        value={details.duration}
                        onChange={(event) =>
                            onPatch({ duration: event.target.value })
                        }
                        placeholder="60"
                        aria-invalid={Boolean(errors.duration)}
                        data-test="wizard-duration-input"
                    />
                    <InputError message={errors.duration} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="wizard_technical_break">
                        {t('services.form.break')}
                    </Label>
                    <Input
                        id="wizard_technical_break"
                        type="number"
                        min="0"
                        value={details.technicalBreak}
                        onChange={(event) =>
                            onPatch({ technicalBreak: event.target.value })
                        }
                        placeholder="0"
                        aria-invalid={Boolean(errors.technical_break)}
                    />
                    <InputError message={errors.technical_break} />
                </div>
            </div>

            <SectionHeading>
                {t('services.wizard.details.format')}
            </SectionHeading>

            <div className="grid gap-2">
                <Label htmlFor="wizard_service_type">
                    {t('services.form.serviceType')}
                </Label>
                <OptionToggleGroup
                    id="wizard_service_type"
                    options={serviceTypes}
                    value={details.serviceType}
                    onChange={(value) =>
                        onPatch({ serviceType: value as ServiceTypeValue })
                    }
                    invalid={Boolean(errors.service_type)}
                    data-test="wizard-service-type-select"
                />
                <InputError message={errors.service_type} />
            </div>

            {details.serviceType === 'group' && (
                <div className="grid gap-2">
                    <Label htmlFor="wizard_capacity">
                        {t('services.form.capacity')}{' '}
                        <RequiredMark label={requiredLabel} />
                    </Label>
                    <Input
                        id="wizard_capacity"
                        aria-required="true"
                        type="number"
                        min="1"
                        value={details.capacity}
                        onChange={(event) =>
                            onPatch({ capacity: event.target.value })
                        }
                        placeholder="10"
                        aria-invalid={Boolean(errors.capacity)}
                    />
                    <InputError message={errors.capacity} />
                </div>
            )}

            <SectionHeading>{t('services.wizard.details.team')}</SectionHeading>

            <div className="grid gap-2">
                <Label htmlFor="wizard_user_ids">
                    {t('services.form.specialists')}
                </Label>
                <MultiSelect
                    id="wizard_user_ids"
                    options={specialists}
                    value={details.specialistIds}
                    onChange={(specialistIds) => onPatch({ specialistIds })}
                    placeholder={t('services.form.specialistsPlaceholder')}
                    searchPlaceholder={t(
                        'services.form.specialistsSearchPlaceholder',
                    )}
                    emptyMessage={t('services.form.specialistsEmpty')}
                    invalid={Boolean(errors.user_ids)}
                    data-test="wizard-specialists-select"
                />
                <p className="text-sm text-muted-foreground">
                    {t('services.form.specialistsHint')}
                </p>
                <InputError message={errors.user_ids} />
            </div>

            <SectionHeading>
                {t('services.wizard.details.visibility')}
            </SectionHeading>

            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor="wizard_is_active">
                        {t('services.form.active')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {t('services.form.activeHint')}
                    </p>
                </div>
                <Switch
                    id="wizard_is_active"
                    checked={details.isActive}
                    onCheckedChange={(isActive) => onPatch({ isActive })}
                    data-test="wizard-active-switch"
                />
            </div>
        </div>
    );
}
