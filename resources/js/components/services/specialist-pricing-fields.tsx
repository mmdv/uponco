import InputError from '@/components/input-error';
import NumericInput from '@/components/numeric-input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import type { PriceType, Service, SpecialistPricing } from '@/types';

type SpecialistPricingFieldsProps = {
    id: string;
    label: string;
    priceType: PriceType;
    pricing: SpecialistPricing | undefined;
    service: Service | null;
    errors: Record<string, string>;
};

/**
 * Per-specialist duration and price overrides for a single specialist. Any field
 * left blank falls back to the service's own value — shown as the placeholder.
 */
export default function SpecialistPricingFields({
    id,
    label,
    priceType,
    pricing,
    service,
    errors,
}: SpecialistPricingFieldsProps) {
    const { t } = useTranslation('company');

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">{label}</p>
            <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                    <Label htmlFor={`specialist_pricing_${id}_duration`}>
                        {t('services.form.duration')}
                    </Label>
                    <NumericInput
                        id={`specialist_pricing_${id}_duration`}
                        name={`specialist_pricing[${id}][duration]`}
                        defaultValue={pricing?.duration ?? ''}
                        placeholder={service?.duration?.toString() ?? '60'}
                    />
                    <InputError
                        message={errors[`specialist_pricing.${id}.duration`]}
                    />
                </div>

                {priceType === 'fixed' && (
                    <div className="grid gap-2">
                        <Label htmlFor={`specialist_pricing_${id}_price`}>
                            {t('services.form.price')}
                        </Label>
                        <NumericInput
                            id={`specialist_pricing_${id}_price`}
                            name={`specialist_pricing[${id}][price]`}
                            decimal
                            defaultValue={pricing?.price ?? ''}
                            placeholder={service?.price ?? '50.00'}
                        />
                        <InputError
                            message={errors[`specialist_pricing.${id}.price`]}
                        />
                    </div>
                )}
            </div>

            {priceType === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor={`specialist_pricing_${id}_price_min`}>
                            {t('services.form.minPrice')}
                        </Label>
                        <NumericInput
                            id={`specialist_pricing_${id}_price_min`}
                            name={`specialist_pricing[${id}][price_min]`}
                            decimal
                            defaultValue={pricing?.price_min ?? ''}
                            placeholder={service?.price_min ?? '50.00'}
                        />
                        <InputError
                            message={
                                errors[`specialist_pricing.${id}.price_min`]
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`specialist_pricing_${id}_price_max`}>
                            {t('services.form.maxPrice')}
                        </Label>
                        <NumericInput
                            id={`specialist_pricing_${id}_price_max`}
                            name={`specialist_pricing[${id}][price_max]`}
                            decimal
                            defaultValue={pricing?.price_max ?? ''}
                            placeholder={service?.price_max ?? '200.00'}
                        />
                        <InputError
                            message={
                                errors[`specialist_pricing.${id}.price_max`]
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
