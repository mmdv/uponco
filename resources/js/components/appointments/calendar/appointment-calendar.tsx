import type { Appointment } from '@/types';

import CalendarDateNav from './calendar-date-nav';
import type { CalendarView } from './calendar-date-nav';
import CalendarDayView from './calendar-day-view';
import type { DayViewColumn } from './calendar-day-view';
import CalendarMonthView from './calendar-month-view';
import CalendarWeekView from './calendar-week-view';

export type { CalendarView } from './calendar-date-nav';

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
    return (
        <div className="space-y-4">
            <CalendarDateNav
                view={view}
                date={date}
                onDateChange={onDateChange}
            />

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
