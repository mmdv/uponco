import { CalendarClock, MapPin, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useTranslation } from '@/hooks/use-translation';
import { GENERIC_SERVICE_ICON } from '@/lib/business-category-icons';

type Row = {
    icon: LucideIcon;
    label: string;
    value: string;
};

type Props = {
    serviceTitle?: string;
    metaLabel?: string;
    specialistName?: string;
    locationName?: string | null;
    dateTimeLabel?: string;
    /** Stands for what the business does; defaults to the generic service icon. */
    serviceIcon?: LucideIcon;
};

/**
 * A compact recap of the booking shown before submitting and on the success
 * screen.
 */
export default function BookingSummary({
    serviceTitle,
    metaLabel,
    specialistName,
    locationName,
    dateTimeLabel,
    serviceIcon = GENERIC_SERVICE_ICON,
}: Props) {
    const { t } = useTranslation('booking');
    const rows: Row[] = [];

    if (serviceTitle) {
        rows.push({
            icon: serviceIcon,
            label: t('summary.service'),
            value: metaLabel ? `${serviceTitle} · ${metaLabel}` : serviceTitle,
        });
    }

    if (specialistName) {
        rows.push({
            icon: User,
            label: t('summary.specialist'),
            value: specialistName,
        });
    }

    if (locationName) {
        rows.push({
            icon: MapPin,
            label: t('summary.location'),
            value: locationName,
        });
    }

    if (dateTimeLabel) {
        rows.push({
            icon: CalendarClock,
            label: t('summary.when'),
            value: dateTimeLabel,
        });
    }

    return (
        <div className="divide-y rounded-2xl border bg-muted/30">
            {rows.map((row) => (
                <div key={row.label} className="flex items-center gap-3 p-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
                        <row.icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                            {row.label}
                        </p>
                        <p className="truncate text-sm font-medium">
                            {row.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
