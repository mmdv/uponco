import { router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { AppointmentView } from '@/components/appointments/appointments-toolbar';
import type { DayViewColumn } from '@/components/appointments/calendar/calendar-day-view';
import type { AppointmentSpecialistOption, WorkingHoursMap } from '@/types';

type Params = {
    view: AppointmentView;
    cursorKey: string;
    specialists: AppointmentSpecialistOption[];
    workingHours: WorkingHoursMap;
    specialistFilterIds: string[];
};

type DayColumns = {
    dayColumns: DayViewColumn[];
    workingHoursLoading: boolean;
};

/**
 * The day view's specialist columns and their working hours.
 *
 * `workingHours` is date-specific and not shipped up front, so it is fetched on
 * demand whenever the day view is shown or the viewed day changes. Columns are
 * the specialists who work that day, honouring an active specialist filter so
 * the grid matches the filtered appointments.
 */
export function useDayColumns({
    view,
    cursorKey,
    specialists,
    workingHours,
    specialistFilterIds,
}: Params): DayColumns {
    const [workingHoursLoading, setWorkingHoursLoading] = useState(false);

    const refreshWorkingHours = useCallback(() => {
        router.reload({
            only: ['workingHours'],
            data: { date: cursorKey },
            onStart: () => setWorkingHoursLoading(true),
            onFinish: () => setWorkingHoursLoading(false),
        });
    }, [cursorKey]);

    useEffect(() => {
        if (view !== 'day') {
            return;
        }

        refreshWorkingHours();
    }, [view, refreshWorkingHours]);

    const dayColumns = useMemo(
        () =>
            specialists
                .filter(
                    (specialist) =>
                        (workingHours[String(specialist.id)]?.length ?? 0) > 0,
                )
                .filter(
                    (specialist) =>
                        specialistFilterIds.length === 0 ||
                        specialistFilterIds.includes(String(specialist.id)),
                )
                .map((specialist) => ({
                    specialist,
                    windows: workingHours[String(specialist.id)],
                })),
        [specialists, workingHours, specialistFilterIds],
    );

    return { dayColumns, workingHoursLoading };
}
