import InputError from '@/components/input-error';
import NumericInput from '@/components/numeric-input';
import { CurrencySelect } from '@/components/services/currency-select';
import { OptionToggleGroup } from '@/components/services/option-toggle-group';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import type { CurrencyCode, PriceType, SelectOption, Service } from '@/types';

type ServicePricingFieldsProps = {
    priceTypes: SelectOption[];
    priceType: PriceType;
    onPriceTypeChange: (value: PriceType) => void;
    currency: CurrencyCode;
    onCurrencyChange: (value: CurrencyCode) => void;
    currencies: SelectOption[];
    service: Service | null;
    errors: Record<string, string>;
};

/**
 * The price-type toggle and the price inputs it reveals: a single price for
 * `fixed`, a min/max pair for `range`, and nothing but a hidden currency for
 * `free`. Currency is shared across the fixed and range variants.
 */
export default function ServicePricingFields({
    priceTypes,
    priceType,
    onPriceTypeChange,
    currency,
    onCurrencyChange,
    currencies,
    service,
    errors,
}: ServicePricingFieldsProps) {
    const { t } = useTranslation('company');

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="price_type">
                    {t('services.form.priceType')}
                </Label>
                <OptionToggleGroup
                    id="price_type"
                    options={priceTypes}
                    value={priceType}
                    onChange={(value) => onPriceTypeChange(value as PriceType)}
                    invalid={Boolean(errors.price_type)}
                    data-test="service-price-type-select"
                />
                <InputError message={errors.price_type} />
            </div>

            {priceType === 'fixed' && (
                <div className="grid gap-2">
                    <Label htmlFor="price">{t('services.form.price')}</Label>
                    <div className="flex items-start gap-2">
                        <NumericInput
                            id="price"
                            name="price"
                            decimal
                            defaultValue={service?.price ?? ''}
                            placeholder="50.00"
                            className="flex-1"
                        />
                        <CurrencySelect
                            id="currency"
                            name="currency"
                            value={currency}
                            onChange={onCurrencyChange}
                            options={currencies}
                            label={t('services.form.currency')}
                            className="w-24"
                            data-test="service-currency-select"
                        />
                    </div>
                    <InputError message={errors.price} />
                </div>
            )}

            {priceType === 'range' && (
                <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="price_min">
                                {t('services.form.minPrice')}
                            </Label>
                            <NumericInput
                                id="price_min"
                                name="price_min"
                                decimal
                                defaultValue={service?.price_min ?? ''}
                                placeholder="50.00"
                            />
                            <InputError message={errors.price_min} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price_max">
                                {t('services.form.maxPrice')}
                            </Label>
                            <NumericInput
                                id="price_max"
                                name="price_max"
                                decimal
                                defaultValue={service?.price_max ?? ''}
                                placeholder="200.00"
                            />
                            <InputError message={errors.price_max} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="currency">
                            {t('services.form.currency')}
                        </Label>
                        <CurrencySelect
                            id="currency"
                            name="currency"
                            value={currency}
                            onChange={onCurrencyChange}
                            options={currencies}
                            label={t('services.form.currency')}
                            className="w-24"
                            data-test="service-currency-select"
                        />
                    </div>
                </div>
            )}

            {priceType === 'free' && (
                <input type="hidden" name="currency" value={currency} />
            )}
        </>
    );
}
