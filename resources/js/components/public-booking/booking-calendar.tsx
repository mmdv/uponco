import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import {
    addMonths,
    dateKey,
    monthGridDays,
    parseDateKey,
} from '@/lib/calendar-grid';
import { cn } from '@/lib/utils';

type Props = {
    /** The `YYYY-MM-DD` currently selected, or '' when none. */
    selectedDate: string;
    /** `YYYY-MM-DD` days the specialist has a free slot on (ascending). */
    availableDays: string[];
    onSelectDay: (date: string) => void;
};

/** Translation weekday indices (0 = Sunday) ordered Monday-first for the header. */
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** A month as a comparable `year * 12 + month` ordinal. */
function monthOrdinal(date: Date): number {
    return date.getFullYear() * 12 + date.getMonth();
}

/**
 * A month-grid alternative to the horizontal day strip. The visitor pages
 * between months and picks from the days the specialist is actually available —
 * those are highlighted, everything else is shown disabled. Weekday and month
 * labels come from the bundled translation arrays (not `Intl`), matching the
 * day strip so embedded webviews never fall back to the wrong locale.
 */
export default function BookingCalendar({
    selectedDate,
    availableDays,
    onSelectDay,
}: Props) {
    const { t } = useTranslation('booking');

    const todayKey = dateKey(new Date());
    const available = new Set(availableDays);
    const firstAvailable = availableDays[0] ?? '';
    const lastAvailable = availableDays[availableDays.length - 1] ?? '';

    // Open on the selected day's month, else the first available month, else now.
    const [month, setMonth] = useState(() =>
        parseDateKey(selectedDate || firstAvailable || todayKey),
    );

    const todayMonth = monthOrdinal(parseDateKey(todayKey));
    const lastMonth =
        lastAvailable === ''
            ? todayMonth
            : monthOrdinal(parseDateKey(lastAvailable));
    const shownMonth = monthOrdinal(month);

    const prevDisabled = shownMonth <= todayMonth;
    const nextDisabled = shownMonth >= lastMonth;

    const caption = `${t(`datetime.months.${month.getMonth()}`)} ${month.getFullYear()}`;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={prevDisabled}
                    aria-label={t('datetime.prevMonth')}
                    onClick={() =>
                        setMonth((current) => addMonths(current, -1))
                    }
                >
                    <ChevronLeft className="size-4" />
                </Button>

                <span className="text-sm font-medium">{caption}</span>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={nextDisabled}
                    aria-label={t('datetime.nextMonth')}
                    onClick={() => setMonth((current) => addMonths(current, 1))}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {WEEKDAY_ORDER.map((weekday) => (
                    <div
                        key={weekday}
                        className="py-1 text-center text-[11px] font-medium text-muted-foreground"
                    >
                        {t(`datetime.weekdays.${weekday}`)}
                    </div>
                ))}

                {monthGridDays(month).map((day) => {
                    const key = dateKey(day);
                    const isCurrentMonth = day.getMonth() === month.getMonth();
                    const isAvailable = available.has(key);
                    const isSelected = key === selectedDate;
                    const isToday = key === todayKey;

                    return (
                        <button
                            key={key}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => onSelectDay(key)}
                            data-test={`booking-calendar-day-${key}`}
                            className={cn(
                                'flex aspect-square items-center justify-center rounded-lg border text-sm font-medium transition-all duration-200',
                                isSelected
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : isAvailable
                                      ? 'border-primary/40 bg-card hover:border-primary'
                                      : 'border-transparent',
                                !isAvailable &&
                                    'cursor-not-allowed text-muted-foreground/40',
                                !isCurrentMonth && !isSelected && 'opacity-50',
                                isToday &&
                                    !isSelected &&
                                    'ring-1 ring-primary/50',
                            )}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
