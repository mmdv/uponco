import { router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { AppointmentView } from '@/components/appointments/appointments-toolbar';
import type { DayViewColumn } from '@/components/appointments/calendar/calendar-day-view';
import { addDaysKey, dayWindowPrefetch } from '@/lib/calendar-grid';
import type {
    AppointmentSpecialistOption,
    WorkingHoursMap,
    WorkingHoursWindow,
} from '@/types';

type Params = {
    view: AppointmentView;
    cursorKey: string;
    specialists: AppointmentSpecialistOption[];
    specialistFilterIds: string[];
};

type DayColumns = {
    dayColumns: DayViewColumn[];
    workingHoursLoading: boolean;
};

/** How many days each working-hours fetch covers. */
const WINDOW_DAYS = 7;
/** Days before the cursor a cold, centered window starts. */
const WINDOW_LOOKBACK = Math.floor(WINDOW_DAYS / 2);

/**
 * The day view's specialist columns and their working hours.
 *
 * `workingHours` is date-specific and not shipped up front, so it is fetched on
 * demand — but a week at a time and cached, so paging the day cursor back and
 * forth serves from cache instead of re-requesting every day. A cold day fetches
 * a window centered on it; nearing either edge of what's cached prefetches the
 * adjacent window in the background. Columns are the specialists who work the
 * viewed day, honouring an active specialist filter so the grid matches the
 * filtered appointments.
 */
export function useDayColumns({
    view,
    cursorKey,
    specialists,
    specialistFilterIds,
}: Params): DayColumns {
    const [workingHoursLoading, setWorkingHoursLoading] = useState(false);
    // The viewed day's working windows, served from the cache below.
    const [currentWorkingHours, setCurrentWorkingHours] =
        useState<WorkingHoursMap>({});

    // Fetched days cached by `YYYY-MM-DD`; window fetches in flight keyed by
    // their start, so the same window is never requested twice at once.
    const cacheRef = useRef<Map<string, WorkingHoursMap>>(new Map());
    const inFlightRef = useRef<Set<string>>(new Set());
    // The viewed day, read inside async reload callbacks where the render's own
    // value would be stale.
    const cursorKeyRef = useRef(cursorKey);

    useEffect(() => {
        if (view !== 'day') {
            return;
        }

        cursorKeyRef.current = cursorKey;

        const requestWindow = (startKey: string, background: boolean) => {
            if (inFlightRef.current.has(startKey)) {
                return;
            }

            inFlightRef.current.add(startKey);

            if (!background) {
                setWorkingHoursLoading(true);
            }

            router.reload({
                only: ['workingHoursWindow'],
                data: { date: startKey, days: WINDOW_DAYS },
                onSuccess: (page) => {
                    const window =
                        (page.props.workingHoursWindow as
                            | WorkingHoursWindow
                            | undefined) ?? {};

                    for (const [day, map] of Object.entries(window)) {
                        cacheRef.current.set(day, map);
                    }

                    const current = cacheRef.current.get(cursorKeyRef.current);

                    if (current !== undefined) {
                        setCurrentWorkingHours(current);
                    }
                },
                onFinish: () => {
                    inFlightRef.current.delete(startKey);

                    if (!background) {
                        setWorkingHoursLoading(false);
                    }
                },
            });
        };

        const cached = cacheRef.current.get(cursorKey);

        if (cached !== undefined) {
            setCurrentWorkingHours(cached);
            setWorkingHoursLoading(false);
        } else {
            setCurrentWorkingHours({});
            requestWindow(addDaysKey(cursorKey, -WINDOW_LOOKBACK), false);
        }

        // Top up the neighbouring window(s) so paging on stays instant.
        const { before, after } = dayWindowPrefetch(
            cacheRef.current.keys(),
            cursorKey,
        );

        for (const start of [before, after]) {
            if (start !== null && !cacheRef.current.has(start)) {
                requestWindow(start, true);
            }
        }
    }, [view, cursorKey]);

    const dayColumns = useMemo(
        () =>
            specialists
                .filter(
                    (specialist) =>
                        (currentWorkingHours[String(specialist.id)]?.length ??
                            0) > 0,
                )
                .filter(
                    (specialist) =>
                        specialistFilterIds.length === 0 ||
                        specialistFilterIds.includes(String(specialist.id)),
                )
                .map((specialist) => ({
                    specialist,
                    windows: currentWorkingHours[String(specialist.id)],
                })),
        [specialists, currentWorkingHours, specialistFilterIds],
    );

    return { dayColumns, workingHoursLoading };
}
