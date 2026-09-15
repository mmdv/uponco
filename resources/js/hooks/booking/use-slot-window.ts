import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';

import type { CaptureBookingEvent } from '@/hooks/booking/use-booking-analytics';
import type { UpcomingDay } from '@/lib/appointments';
import {
    daysBetween,
    nextPrefetchStart,
    slotsKey,
    SLOT_WINDOW_DAYS,
} from '@/lib/booking';
import type { SelectionIds } from '@/lib/booking';
import { bookingDayOffset } from '@/lib/booking-analytics';
import type { AppointmentSlot } from '@/types';

type Params = {
    /** The selection resolved on arrival, used to seed the cache and token. */
    initialSelection: SelectionIds;
    /** Slots for a window of days keyed by `YYYY-MM-DD`, when the page shipped one. */
    slotWindow?: Record<string, AppointmentSlot[]>;
    /** The bookable day strip, from the selection hook. */
    upcomingDays: (UpcomingDay & { available: boolean })[];
    serviceId: number | null;
    specialistId: number | null;
    captureBookingEvent: CaptureBookingEvent;
};

const selectionToken = (service: number, specialist: number): string =>
    `${service}:${specialist}`;

const initialToken = (selection: SelectionIds): string =>
    selection.service !== null && selection.specialist !== null
        ? selectionToken(selection.service, selection.specialist)
        : '';

/**
 * Owns the slot picker: the day on screen, the chosen time, and the client-side
 * cache of fetched day-windows. Fetched days are keyed by
 * `service:specialist:date` so scrubbing the strip serves from cache instead of
 * firing a request per day, and the next window is prefetched as the visitor
 * nears the edge of what's loaded.
 */
export function useSlotWindow({
    initialSelection,
    slotWindow,
    upcomingDays,
    serviceId,
    specialistId,
    captureBookingEvent,
}: Params) {
    const [date, setDate] = useState('');
    const [selectedStart, setSelectedStart] = useState('');
    const [selectedEnd, setSelectedEnd] = useState('');
    const [slotsLoading, setSlotsLoading] = useState(false);
    // The slots for the day currently on screen. Read from the cache below
    // rather than straight from the prop: a submit redirects back to a page
    // render where the optional `slotWindow` prop is omitted, which would
    // otherwise wipe the picker.
    const [slots, setSlots] = useState<AppointmentSlot[]>([]);

    // Fetched days are cached client-side keyed by `service:specialist:date`.
    // `slotWindow` arrives from the server as a `date -> slots` map for one
    // week; the cache merges every window fetched during the visit. Seeded once
    // from the optional window prop when the page shipped one. Usually empty:
    // `slotWindow` is an optional Inertia prop, so it is absent on the first
    // paint and only present on the client's own window reloads.
    const [initialSlotCache] = useState(() => {
        const cache = new Map<string, AppointmentSlot[]>();

        if (
            slotWindow &&
            initialSelection.service !== null &&
            initialSelection.specialist !== null
        ) {
            for (const [day, daySlots] of Object.entries(slotWindow)) {
                cache.set(
                    slotsKey(
                        initialSelection.service,
                        initialSelection.specialist,
                        day,
                    ),
                    daySlots,
                );
            }
        }

        return cache;
    });
    const slotCacheRef = useRef(initialSlotCache);
    // Window fetches in flight, keyed by their start, so an identical window (a
    // cold fetch and its prefetch racing) is never requested twice at once.
    const inFlightWindowsRef = useRef<Set<string>>(new Set());
    // The day on screen, read inside async reload callbacks where the render's
    // own value would be stale.
    const selectedDateRef = useRef('');
    // The current service/specialist token. When the selection changes
    // mid-flight this stops the late response applying.
    const activeSelectionRef = useRef(initialToken(initialSelection));
    // Days already reported as having no free slots, so scrubbing back over a
    // known-empty day (or a background refetch of it) logs `no_slots` once each.
    const noSlotsLoggedRef = useRef<Set<string>>(new Set());

    /** The `YYYY-MM-DD` of the last day the strip shows, i.e. the fetch horizon. */
    const horizonEnd = (): string =>
        upcomingDays[upcomingDays.length - 1]?.date ?? '';

    /** The cached days already loaded for a selection, for the prefetch decision. */
    const cachedDatesFor = (service: number, specialist: number): string[] => {
        const prefix = `${selectionToken(service, specialist)}:`;

        return Array.from(slotCacheRef.current.keys())
            .filter((key) => key.startsWith(prefix))
            .map((key) => key.slice(prefix.length));
    };

    /**
     * Log that a day the visitor is looking at has no free slots — a silent
     * killer of the funnel. Once per day per selection: scrubbing back over it
     * or a background refetch resolving to the same empty day must not re-log.
     */
    const reportNoSlotsIfEmpty = (
        service: number,
        specialist: number,
        dayValue: string,
        daySlots: AppointmentSlot[],
    ) => {
        if (daySlots.length > 0 || dayValue === '') {
            return;
        }

        const key = slotsKey(service, specialist, dayValue);

        if (noSlotsLoggedRef.current.has(key)) {
            return;
        }

        noSlotsLoggedRef.current.add(key);
        captureBookingEvent('public_booking_no_slots', {
            day_offset: bookingDayOffset(upcomingDays, dayValue),
        });
    };

    /**
     * Fetch a window of slots starting at `startDate` and merge it into the
     * cache. A background fetch (the sliding prefetch) never toggles the loading
     * state, so it can top up the cache without flashing the skeleton.
     */
    const requestSlotWindow = (
        service: number,
        specialist: number,
        startDate: string,
        options: { background?: boolean } = {},
    ) => {
        const background = options.background ?? false;

        // Never ask for days past the strip's horizon — the visitor can't reach
        // them, so there is nothing to show.
        const end = horizonEnd();
        const span = Math.min(
            SLOT_WINDOW_DAYS,
            end === '' ? SLOT_WINDOW_DAYS : daysBetween(startDate, end) + 1,
        );

        if (span <= 0) {
            return;
        }

        const windowKey = slotsKey(service, specialist, startDate);

        if (inFlightWindowsRef.current.has(windowKey)) {
            return;
        }

        inFlightWindowsRef.current.add(windowKey);

        const token = selectionToken(service, specialist);

        if (!background) {
            setSlotsLoading(true);
        }

        router.reload({
            only: ['slotWindow'],
            data: {
                service_id: service,
                specialist_id: specialist,
                date: startDate,
                days: span,
                appointment_id: '',
            },
            onSuccess: (page) => {
                // A change of service/specialist since this fetch started makes
                // its slots belong to a selection that is no longer on screen.
                if (activeSelectionRef.current !== token) {
                    return;
                }

                const window =
                    (page.props.slotWindow as
                        Record<string, AppointmentSlot[]> | undefined) ?? {};

                for (const [day, daySlots] of Object.entries(window)) {
                    slotCacheRef.current.set(
                        slotsKey(service, specialist, day),
                        daySlots,
                    );
                }

                const current = slotCacheRef.current.get(
                    slotsKey(service, specialist, selectedDateRef.current),
                );

                if (current !== undefined) {
                    setSlots(current);
                    reportNoSlotsIfEmpty(
                        service,
                        specialist,
                        selectedDateRef.current,
                        current,
                    );
                }
            },
            onFinish: () => {
                inFlightWindowsRef.current.delete(windowKey);

                if (!background && activeSelectionRef.current === token) {
                    setSlotsLoading(false);
                }
            },
        });
    };

    /**
     * After settling on a day, prefetch the next window in the background once
     * the furthest cached day comes within two days of the selection.
     */
    const maybePrefetch = (
        service: number,
        specialist: number,
        selectedDate: string,
    ) => {
        const start = nextPrefetchStart(
            cachedDatesFor(service, specialist),
            selectedDate,
            horizonEnd(),
        );

        if (start !== null) {
            requestSlotWindow(service, specialist, start, { background: true });
        }
    };

    /**
     * Show the slots for a day: instantly from cache when loaded, otherwise
     * fetch the window that starts on it. Either way, top up the next window if
     * the visitor is nearing the edge of what's cached.
     */
    const showSlotsForDay = (
        service: number | null,
        specialist: number | null,
        value: string,
    ) => {
        setSelectedStart('');
        setSelectedEnd('');
        setDate(value);
        selectedDateRef.current = value;

        if (service === null || specialist === null || value === '') {
            setSlots([]);

            return;
        }

        const cached = slotCacheRef.current.get(
            slotsKey(service, specialist, value),
        );

        if (cached !== undefined) {
            setSlots(cached);
            setSlotsLoading(false);
            reportNoSlotsIfEmpty(service, specialist, value, cached);
        } else {
            setSlots([]);
            requestSlotWindow(service, specialist, value);
        }

        maybePrefetch(service, specialist, value);
    };

    const handleDateChange = (value: string) => {
        showSlotsForDay(serviceId, specialistId, value);
    };

    const handleSelectSlot = (start: string) => {
        const slot = slots.find((item) => item.start === start);
        setSelectedStart(start);
        setSelectedEnd(slot?.end ?? '');

        // A time was picked on the slot screen: separates visitors who engaged
        // with the calendar from those who left it untouched.
        captureBookingEvent('public_booking_slot_selected', {
            day_offset: bookingDayOffset(upcomingDays, date),
        });
    };

    /**
     * React to a replaced selection: the token always follows the new choice so
     * in-flight responses for the old one are dropped, and a changed
     * service/specialist throws away every cached window it invalidated.
     */
    const onSelectionReplaced = (next: SelectionIds, poolChanged: boolean) => {
        activeSelectionRef.current = initialToken(next);

        if (poolChanged) {
            slotCacheRef.current.clear();
            inFlightWindowsRef.current.clear();
            setSlots([]);
        }
    };

    /**
     * A submission the server rejected because the slot was taken: the day on
     * screen is now known stale, so drop it from the cache and refetch it.
     */
    const recoverStaleSlot = (
        service: number,
        specialist: number,
        day: string,
    ) => {
        slotCacheRef.current.delete(slotsKey(service, specialist, day));
        showSlotsForDay(service, specialist, day);
    };

    const resetSlots = () => {
        setDate('');
        selectedDateRef.current = '';
        setSelectedStart('');
        setSelectedEnd('');
        // The booking just made means every cached day may now be stale.
        slotCacheRef.current.clear();
        inFlightWindowsRef.current.clear();
        activeSelectionRef.current = initialToken(initialSelection);
        setSlots([]);
        noSlotsLoggedRef.current.clear();
    };

    return {
        slots,
        slotsLoading,
        date,
        selectedStart,
        selectedEnd,
        showSlotsForDay,
        handleDateChange,
        handleSelectSlot,
        onSelectionReplaced,
        recoverStaleSlot,
        resetSlots,
    };
}
