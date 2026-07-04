import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { addDays, addMonths, weekDays } from '@/lib/calendar-grid';
import type { Appointment } from '@/types';

import CalendarDayView from './calendar-day-view';
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
    onSelectAppointment: (appointment: Appointment) => void;
    onReschedule: (appointment: Appointment, startIso: string) => void;
};

export default function AppointmentCalendar({
    view,
    date,
    onDateChange,
    onViewChange,
    appointments,
    timezone,
    onSelectAppointment,
    onReschedule,
}: Props) {
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
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => step(-1)}
                            data-test="calendar-prev"
                            aria-label="Previous"
                            className="rounded-r-none"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => step(1)}
                            data-test="calendar-next"
                            aria-label="Next"
                            className="-ml-px rounded-l-none"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => onDateChange(new Date())}
                        data-test="calendar-today"
                    >
                        Today
                    </Button>
                    <h2 className="ml-1 text-sm font-medium">{title}</h2>
                </div>
            </div>

            {view === 'day' && (
                <CalendarDayView
                    date={date}
                    appointments={appointments}
                    timezone={timezone}
                    onSelectAppointment={onSelectAppointment}
                    onReschedule={onReschedule}
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
