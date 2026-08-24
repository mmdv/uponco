import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { addDays, addMonths, weekDays } from '@/lib/calendar-grid';
import type { Appointment } from '@/types';

import CalendarDayView from './calendar-day-view';
import type { DayViewColumn } from './calendar-day-view';
import CalendarMonthView from './calendar-month-view';
import CalendarWeekView from './calendar-week-view';

export type CalendarView = 'day' | 'week' | 'month';

type Props = {
    view: CalendarView;
    date: Date;
    onDateChange: (date: Date) => void;
    onViewChange: (view: CalendarView) => void;
    appointments: Appointment[];
    timezone: string;
    dayColumns: DayViewColumn[];
    workingHoursLoading: boolean;
    onSelectAppointment: (appointment: Appointment) => void;
    onReschedule: (appointment: Appointment, startIso: string) => void;
    onCreateSlot: (specialistId: number, startIso: string) => void;
};

export default function AppointmentCalendar({
    view,
    date,
    onDateChange,
    onViewChange,
    appointments,
    timezone,
    dayColumns,
    workingHoursLoading,
    onSelectAppointment,
    onReschedule,
    onCreateSlot,
}: Props) {
    const { t } = useTranslation('appointments');
    const title = useMemo(() => formatTitle(view, date), [view, date]);

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
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => step(-1)}
                    data-test="calendar-prev"
                    aria-label={t('toolbar.calendar.previous')}
                    className="order-1 sm:rounded-r-none"
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => step(1)}
                    data-test="calendar-next"
                    aria-label={t('toolbar.calendar.next')}
                    className="order-3 sm:order-2 sm:-ml-px sm:rounded-l-none"
                >
                    <ChevronRight className="size-4" />
                </Button>
                <Button
                    variant="outline"
                    onClick={() => onDateChange(new Date())}
                    data-test="calendar-today"
                    className="order-3 hidden sm:inline-flex"
                >
                    {t('toolbar.calendar.today')}
                </Button>
                <h2 className="order-2 flex-1 text-center text-sm font-medium sm:order-4 sm:ml-1 sm:flex-none sm:text-left">
                    {title}
                </h2>
            </div>

            {view === 'day' && (
                <CalendarDayView
                    date={date}
                    appointments={appointments}
                    columns={dayColumns}
                    workingHoursLoading={workingHoursLoading}
                    timezone={timezone}
                    onSelectAppointment={onSelectAppointment}
                    onReschedule={onReschedule}
                    onCreateSlot={onCreateSlot}
                />
            )}

            {view === 'week' && (
                <CalendarWeekView
                    date={date}
                    appointments={appointments}
                    timezone={timezone}
                    onSelectAppointment={onSelectAppointment}
                    onSelectDay={(day) => {
                        onDateChange(day);
                        onViewChange('day');
                    }}
                />
            )}

            {view === 'month' && (
                <CalendarMonthView
                    date={date}
                    appointments={appointments}
                    timezone={timezone}
                    onSelectAppointment={onSelectAppointment}
                    onSelectDay={(day) => {
                        onDateChange(day);
                        onViewChange('day');
                    }}
                />
            )}
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
