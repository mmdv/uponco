import { Clock, MapPin, Pencil, Tag, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { currencySymbol } from '@/lib/currency';
import type { Service } from '@/types';

type Props = {
    service: Service;
    onEdit: () => void;
};

function formatPrice(service: Service, freeLabel: string): string {
    if (service.price_type === 'free') {
        return freeLabel;
    }

    const symbol = currencySymbol(service.currency);

    if (service.price_type === 'range') {
        return `${service.price_min ? symbol + service.price_min : '—'} – ${
            service.price_max ? symbol + service.price_max : '—'
        }`;
    }

    return service.price ? symbol + service.price : '—';
}

/**
 * A read-only summary of a saved service, shown after the first one is created
 * so the user can review it and reopen the edit drawer before moving on.
 */
export default function ServiceSummaryCard({ service, onEdit }: Props) {
    const { t } = useTranslation('company');

    return (
        <div
            data-test="onboarding-service-card"
            className="rounded-2xl border border-[#f1f3f5] bg-card p-6 shadow-soft dark:border-border"
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 text-lg font-semibold tracking-tight">
                    {service.title}
                </h3>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    data-test="onboarding-service-edit-button"
                >
                    <Pencil />
                    {t('services.editServiceTooltip')}
                </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2 font-medium text-foreground">
                    <Tag className="size-4 shrink-0 text-muted-foreground" />
                    {formatPrice(service, t('services.table.free'))}
                </span>
                <span className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0" />
                    {service.duration} min
                </span>
                <span className="flex items-center gap-2">
                    {service.delivery_type === 'online' ? (
                        <Video className="size-4 shrink-0" />
                    ) : (
                        <MapPin className="size-4 shrink-0" />
                    )}
                    {service.delivery_type === 'online'
                        ? t('services.wizard.summary.online')
                        : t('services.wizard.summary.onsite')}
                </span>
            </div>
        </div>
    );
}
