import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslation } from '@/hooks/use-translation';
import { addDays, addMonths, weekDays } from '@/lib/calendar-grid';

export type CalendarView = 'day' | 'week' | 'month';

type Props = {
    view: CalendarView;
    date: Date;
    onDateChange: (date: Date) => void;
};

/**
 * Date navigation header shared by the calendar views and the minimal day view:
 * previous/next buttons that step by the view's unit, a "Today" shortcut, a
 * calendar popover to jump straight to any date, and the formatted period title.
 */
export default function CalendarDateNav({ view, date, onDateChange }: Props) {
    const { t } = useTranslation('appointments');
    const title = useMemo(() => formatTitle(view, date), [view, date]);
    const [pickerOpen, setPickerOpen] = useState(false);

    const step = (direction: 1 | -1) => {
        if (view === 'month') {
            onDateChange(addMonths(date, direction));
        } else if (view === 'week') {
            onDateChange(addDays(date, direction * 7));
        } else {
            onDateChange(addDays(date, direction));
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => step(-1)}
                data-test="calendar-prev"
                aria-label={t('toolbar.calendar.previous')}
                className="order-1"
            >
                <ChevronLeft className="size-4" />
            </Button>
            {/* Desktop: "Today" sits between the arrows; on mobile it lives in a
                floating action button instead, so it is hidden here. */}
            <Button
                variant="outline"
                onClick={() => onDateChange(new Date())}
                data-test="calendar-today"
                className="order-2 hidden sm:inline-flex"
            >
                {t('toolbar.calendar.today')}
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={() => step(1)}
                data-test="calendar-next"
                aria-label={t('toolbar.calendar.next')}
                className="order-3"
            >
                <ChevronRight className="size-4" />
            </Button>
            {/* Jump straight to any date, so reaching a far-off day no longer
                needs repeated arrow taps. */}
            <Popover open={pickerOpen} onOpenChange={setPickerOpen} modal>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        data-test="calendar-date-picker"
                        aria-label={t('toolbar.calendar.pickDate')}
                        className="order-4"
                    >
                        <CalendarDays className="size-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={date}
                        defaultMonth={date}
                        autoFocus
                        onSelect={(next) => {
                            if (next) {
                                onDateChange(next);
                            }

                            setPickerOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
            <h2 className="order-2 flex-1 text-center text-sm font-medium sm:order-5 sm:ml-1 sm:flex-none sm:text-left">
                {title}
            </h2>
        </div>
    );
}

function formatTitle(view: CalendarView, date: Date): string {
    if (view === 'month') {
        return new Intl.DateTimeFormat(undefined, {
            month: 'long',
            year: 'numeric',
        }).format(date);
    }

    if (view === 'day') {
        return new Intl.DateTimeFormat(undefined, {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    }

    const days = weekDays(date);
    const start = days[0];
    const end = days[6];
    const sameMonth = start.getMonth() === end.getMonth();

    const startLabel = new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: sameMonth ? undefined : 'short',
    }).format(start);

    const endLabel = new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(end);

    return `${startLabel} – ${endLabel}`;
}
