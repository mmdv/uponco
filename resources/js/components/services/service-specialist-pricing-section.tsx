import { ChevronDownIcon } from 'lucide-react';

import SpecialistPricingFields from '@/components/services/specialist-pricing-fields';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useTranslation } from '@/hooks/use-translation';
import type { PriceType, SelectOption, Service } from '@/types';

type ServiceSpecialistPricingSectionProps = {
    specialistIds: string[];
    specialists: SelectOption[];
    priceType: PriceType;
    service: Service | null;
    errors: Record<string, string>;
};

/**
 * Collapsible list of per-specialist price/duration overrides, one row per
 * selected specialist. Hidden entirely until at least one specialist is picked.
 */
export default function ServiceSpecialistPricingSection({
    specialistIds,
    specialists,
    priceType,
    service,
    errors,
}: ServiceSpecialistPricingSectionProps) {
    const { t } = useTranslation('company');

    if (specialistIds.length === 0) {
        return null;
    }

    return (
        <Collapsible className="rounded-lg border">
            <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-3 text-left">
                <div className="space-y-0.5">
                    <span className="text-sm font-medium">
                        {t('services.form.specialistPricing')}
                    </span>
                    <p className="text-sm text-muted-foreground">
                        {t('services.form.specialistPricingHint')}
                    </p>
                </div>
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent
                forceMount
                className="data-[state=closed]:hidden"
            >
                <div className="divide-y border-t">
                    {specialistIds.map((id) => (
                        <div key={id} className="p-3">
                            <SpecialistPricingFields
                                id={id}
                                label={
                                    specialists.find(
                                        (option) => option.value === id,
                                    )?.label ?? id
                                }
                                priceType={priceType}
                                pricing={
                                    service?.specialist_pricing?.[Number(id)]
                                }
                                service={service}
                                errors={errors}
                            />
                        </div>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
