import { Apple, Calendar, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import BookingSummary from '@/components/public-booking/booking-summary';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import type { CalendarEvent } from '@/lib/calendar';
import { buildGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar';

type Props = {
    companyName: string;
    customerName: string;
    summary: {
        serviceTitle?: string;
        metaLabel?: string;
        specialistName?: string;
        locationName?: string | null;
        dateTimeLabel?: string;
    };
    calendar: CalendarEvent | null;
    /** The business category's icon, passed straight through to the summary. */
    serviceIcon?: LucideIcon;
    onBookAnother: () => void;
};

/**
 * The terminal confirmation screen shown after a booking is created.
 */
export default function SuccessScreen({
    companyName,
    customerName,
    summary,
    calendar,
    serviceIcon,
    onBookAnother,
}: Props) {
    const { t } = useTranslation('booking');

    return (
        <div className="flex animate-in flex-col items-center px-1 py-6 text-center duration-500 fade-in-0 zoom-in-95">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-6" />
                </span>
            </div>

            <h1 className="mt-5 text-xl font-semibold">{t('success.title')}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
                {t('success.message', {
                    name: customerName.split(' ')[0] || t('success.there'),
                    company: companyName,
                })}
            </p>

            <div className="mt-6 w-full text-left">
                <BookingSummary {...summary} serviceIcon={serviceIcon} />
            </div>

            {calendar && (
                <div className="mt-6 w-full space-y-2 text-left">
                    <p className="text-xs font-medium text-muted-foreground">
                        {t('success.addToCalendar')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-11" asChild>
                            <a
                                href={buildGoogleCalendarUrl(calendar)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Calendar className="size-4" />
                                {t('success.google')}
                            </a>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11"
                            onClick={() => downloadIcsFile(calendar)}
                        >
                            <Apple className="size-4" />
                            {t('success.apple')}
                        </Button>
                    </div>
                </div>
            )}

            <Button
                variant="outline"
                className="mt-4 h-12 w-full text-base"
                onClick={onBookAnother}
            >
                {t('success.bookAnother')}
            </Button>
        </div>
    );
}
