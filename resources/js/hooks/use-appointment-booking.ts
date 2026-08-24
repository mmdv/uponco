import { router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';

import type { CustomerDetails } from '@/components/public-booking/step-details';
import {
    getAvailableOptions,
    groupServicesByCategory,
} from '@/lib/appointments';
import {
    applySelection,
    buildBookableDays,
    buildCalendarEvent,
    buildSummary,
    cardOrder,
    EMPTY_DETAILS,
    lockedKinds,
    locationIsMandatory,
    daysBetween,
    nextOpenCard,
    nextPrefetchStart,
    nothingToChoose,
    resolveBookableDate,
    resolveInitialSelection,
    serviceRequiresLocation,
    slotsKey,
    SLOT_WINDOW_DAYS,
    stepAnimationClass,
} from '@/lib/booking';
import type {
    BookingPreset,
    ConfirmedSummary,
    EntryCard,
    SelectionIds,
    SelectionKind,
} from '@/lib/booking';
import { store } from '@/routes/public/appointments';
import type {
    AppointmentLocationDetail,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
} from '@/types';

export type {
    BookingSummary,
    ConfirmedSummary,
    EntryCard,
} from '@/lib/booking';

type Params = {
    company: { name: string; slug: string };
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationDetail[];
    specialists: AppointmentSpecialistOption[];
    /** Slots for a window of days keyed by `YYYY-MM-DD`, when the page shipped one. */
    slotWindow?: Record<string, AppointmentSlot[]>;
    preset: BookingPreset | null;
};

/**
 * Drives the public appointment booking flow: the three-step wizard, the
 * interdependent service/location/specialist selection, slot loading and the
 * final submission. Returns the derived view state plus the handlers the page
 * and its child components bind to, keeping the page itself presentational.
 *
 * Choices that only have one possible answer — and anything a deep link pinned
 * — start out already made, and the flow reports which of them the visitor can
 * still change. That resolution, the card ordering and the summary/calendar
 * building all live in `@/lib/booking` as pure functions, so they can be
 * unit-tested independently of React state and the Inertia router.
 */
export function useAppointmentBooking({
    company,
    timezone,
    services,
    locations,
    specialists,
    slotWindow,
    preset,
}: Params) {
    // Resolved once: the option lists arrive with the page and never change
    // within a visit, so re-resolving could only ever fight the visitor's own
    // later choices.
    const [initialSelection] = useState(() =>
        resolveInitialSelection({ services, locations, specialists }, preset),
    );

    /**
     * Whether the location card belongs on screen for a given selection.
     *
     * Not the same question as `requiresLocation`, which needs a chosen service
     * and so is false on arrival — that hid the location card on exactly the
     * pages where it had already been decided. This asks the same thing the
     * preselection did: is a location unavoidable from here?
     */
    const locationVisibleFor = (selection: SelectionIds): boolean => {
        const { availableServices } = getAvailableOptions(
            services,
            locations,
            specialists,
            {
                serviceId: selection.service,
                locationId: selection.location,
                specialistId: selection.specialist,
            },
        );

        return locationIsMandatory(
            availableServices,
            services.find((item) => item.id === selection.service) ?? null,
        );
    };

    const [step, setStep] = useState(0);
    const [hasNavigated, setHasNavigated] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');

    const [serviceId, setServiceId] = useState<number | null>(
        initialSelection.service,
    );
    const [locationId, setLocationId] = useState<number | null>(
        initialSelection.location,
    );
    const [specialistId, setSpecialistId] = useState<number | null>(
        initialSelection.specialist,
    );
    // Nothing is unfolded on arrival: every card that is still a choice starts
    // collapsed, so the step reads as a short list of what it needs.
    const [openCard, setOpenCard] = useState<EntryCard>(null);

    const [date, setDate] = useState('');
    const [selectedStart, setSelectedStart] = useState('');
    const [selectedEnd, setSelectedEnd] = useState('');
    const [slotsLoading, setSlotsLoading] = useState(false);
    // The slots for the day currently on screen. Read from the cache below
    // rather than straight from the prop: a submit redirects back to a page
    // render where the optional `slotWindow` prop is omitted, which would
    // otherwise wipe the picker.
    const [slots, setSlots] = useState<AppointmentSlot[]>([]);

    const [details, setDetails] = useState<CustomerDetails>(EMPTY_DETAILS);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [processing, setProcessing] = useState(false);
    const [confirmed, setConfirmed] = useState<ConfirmedSummary | null>(null);

    const {
        availableServices,
        availableLocations: narrowedLocations,
        availableSpecialists,
    } = useMemo(
        () =>
            getAvailableOptions(services, locations, specialists, {
                serviceId,
                locationId,
                specialistId,
            }),
        [services, locations, specialists, serviceId, locationId, specialistId],
    );

    // `getAvailableOptions` is shared with the dashboard and so returns the base
    // location shape; map back onto our own list to keep the address detail.
    const availableLocations = useMemo(() => {
        const ids = new Set(narrowedLocations.map((item) => item.id));

        return locations.filter((location) => ids.has(location.id));
    }, [locations, narrowedLocations]);

    const serviceGroups = useMemo(
        () => groupServicesByCategory(availableServices),
        [availableServices],
    );

    const selectedService = useMemo(
        () => services.find((item) => item.id === serviceId) ?? null,
        [services, serviceId],
    );
    const selectedLocation = useMemo(
        () => locations.find((item) => item.id === locationId) ?? null,
        [locations, locationId],
    );
    const selectedSpecialist = useMemo(
        () => specialists.find((item) => item.id === specialistId) ?? null,
        [specialists, specialistId],
    );

    // The day strip runs from today out to the specialist's furthest available
    // day (at least two weeks); only the days they actually have a free slot on
    // are bookable (and clickable).
    const upcomingDays = useMemo(
        () => buildBookableDays(selectedSpecialist?.available_days ?? []),
        [selectedSpecialist],
    );

    const requiresLocation = serviceRequiresLocation(selectedService);
    // Shown from the first paint when a location is unavoidable, even before a
    // service narrows it down — otherwise the one already chosen for the
    // visitor would sit invisible until they picked something.
    const locationVisible = locationVisibleFor({
        service: serviceId,
        location: locationId,
        specialist: specialistId,
    });
    const selectionComplete =
        serviceId !== null &&
        specialistId !== null &&
        (!requiresLocation || locationId !== null);

    // What is locked is measured against the full option pools, not the
    // narrowed ones: a company with two specialists still offers a real choice
    // even while the current service happens to narrow it to one, and the
    // visitor can widen it again by changing the service.
    const locked = useMemo(
        () =>
            lockedKinds(
                {
                    service: services.length,
                    location: locations.length,
                    specialist: specialists.length,
                },
                preset,
            ),
        [services, locations, specialists, preset],
    );

    const order = useMemo(() => cardOrder(locked), [locked]);

    const selectionIsFixed = nothingToChoose(
        locked,
        requiresLocation,
        selectionComplete,
    );

    // Fetched days are cached client-side keyed by `service:specialist:date`, so
    // scrubbing the day strip serves from cache instead of firing a request per
    // day. `slotWindow` arrives from the server as a `date -> slots` map for one
    // week; the cache merges every window fetched during the visit.
    // Seeded once from the optional window prop when the page shipped one.
    // Usually empty: `slotWindow` is an optional Inertia prop, so it is absent
    // on the first paint and only present on the client's own window reloads.
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
    // The day on screen and the current service/specialist, read inside async
    // reload callbacks where the render's own values would be stale. When the
    // selection changes mid-flight the token stops the late response applying.
    const selectedDateRef = useRef('');
    const selectionToken = (service: number, specialist: number): string =>
        `${service}:${specialist}`;
    const activeSelectionRef = useRef(
        initialSelection.service !== null &&
            initialSelection.specialist !== null
            ? selectionToken(
                  initialSelection.service,
                  initialSelection.specialist,
              )
            : '',
    );

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
                        | Record<string, AppointmentSlot[]>
                        | undefined) ?? {};

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
        } else {
            setSlots([]);
            requestSlotWindow(service, specialist, value);
        }

        maybePrefetch(service, specialist, value);
    };

    // Selecting one entity keeps each of the other two only while it stays
    // compatible with the new choice, then opens the next still-missing card.
    const changeSelection = (kind: SelectionKind, value: number) => {
        const next = applySelection(
            { service: services, location: locations, specialist: specialists },
            {
                service: serviceId,
                location: locationId,
                specialist: specialistId,
            },
            kind,
            value,
        );

        // A different service or specialist changes what is available on every
        // day, so the cached windows for the old selection are thrown away.
        if (next.service !== serviceId || next.specialist !== specialistId) {
            slotCacheRef.current.clear();
            inFlightWindowsRef.current.clear();
            setSlots([]);
        }

        activeSelectionRef.current =
            next.service !== null && next.specialist !== null
                ? selectionToken(next.service, next.specialist)
                : '';

        setServiceId(next.service);
        setLocationId(next.location);
        setSpecialistId(next.specialist);
        setOpenCard(nextOpenCard(next, order, locationVisibleFor(next)));
    };

    const handleServiceChange = (value: number) =>
        changeSelection('service', value);

    const handleLocationChange = (value: number) =>
        changeSelection('location', value);

    const handleSpecialistChange = (value: number) =>
        changeSelection('specialist', value);

    const handleDateChange = (value: string) => {
        showSlotsForDay(serviceId, specialistId, value);
    };

    const handleSelectSlot = (start: string) => {
        const slot = slots.find((item) => item.start === start);
        setSelectedStart(start);
        setSelectedEnd(slot?.end ?? '');
    };

    const handleDetailChange = (
        field: keyof CustomerDetails,
        value: string,
    ) => {
        setDetails((current) => ({ ...current, [field]: value }));
        setErrors((current) => {
            const next = { ...current };
            delete next[field];

            // Editing either contact field clears the "already booked this
            // session" conflict so the banner disappears as the user corrects it.
            if (field === 'customer_email' || field === 'customer_phone') {
                delete next.booking_conflict;
            }

            return next;
        });
    };

    const toggleCard = (card: Exclude<EntryCard, null>) => {
        setOpenCard((current) => (current === card ? null : card));
    };

    const summary = buildSummary({
        service: selectedService,
        specialist: selectedSpecialist,
        location: selectedLocation,
        requiresLocation,
        start: selectedStart,
        end: selectedEnd,
        timezone,
    });

    const calendarEvent = buildCalendarEvent({
        service: selectedService,
        specialist: selectedSpecialist,
        location: selectedLocation,
        requiresLocation,
        companyName: company.name,
        start: selectedStart,
        end: selectedEnd,
        notes: details.notes,
    });

    const goToStep = (next: number) => {
        setDirection(next > step ? 'forward' : 'back');
        setHasNavigated(true);
        setStep(next);
    };

    const handleContinue = () => {
        if (step === 0) {
            // Keep the chosen day only when the selected specialist can take it,
            // otherwise fall back to their closest bookable day. Serving the day
            // from cache (or fetching it) never leaves a previous specialist's
            // slots on screen, because changing the selection cleared the cache.
            const nextDate = resolveBookableDate(
                date,
                selectedSpecialist?.available_days ?? [],
            );

            showSlotsForDay(serviceId, specialistId, nextDate);

            goToStep(1);

            return;
        }

        goToStep(2);
    };

    const handleSubmit = () => {
        router.post(
            store.url(company.slug),
            {
                service_id: serviceId,
                location_id: locationId,
                specialist_id: specialistId,
                start_at: selectedStart,
                ...details,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setProcessing(true),
                onError: (formErrors) => {
                    setErrors(formErrors);

                    if (
                        formErrors.service_id ||
                        formErrors.specialist_id ||
                        formErrors.location_id
                    ) {
                        goToStep(0);
                    } else if (formErrors.start_at) {
                        // The slot list on screen is now known to be stale
                        // (e.g. the slot was just taken), so drop this day from
                        // the cache and refetch its window before returning.
                        if (
                            serviceId !== null &&
                            specialistId !== null &&
                            date !== ''
                        ) {
                            slotCacheRef.current.delete(
                                slotsKey(serviceId, specialistId, date),
                            );
                            showSlotsForDay(serviceId, specialistId, date);
                        }

                        goToStep(1);
                    }
                },
                onSuccess: () => {
                    setConfirmed({
                        ...summary,
                        customerName: details.customer_name,
                        calendar: calendarEvent,
                    });
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const resetFlow = () => {
        setConfirmed(null);
        // Back to the starting point, not to nothing: the single specialist a
        // solo business has is just as preselected on the second booking.
        setServiceId(initialSelection.service);
        setLocationId(initialSelection.location);
        setSpecialistId(initialSelection.specialist);
        setOpenCard(null);
        setDate('');
        selectedDateRef.current = '';
        setSelectedStart('');
        setSelectedEnd('');
        // The booking just made means every cached day may now be stale.
        slotCacheRef.current.clear();
        inFlightWindowsRef.current.clear();
        activeSelectionRef.current =
            initialSelection.service !== null &&
            initialSelection.specialist !== null
                ? selectionToken(
                      initialSelection.service,
                      initialSelection.specialist,
                  )
                : '';
        setSlots([]);
        setDetails(EMPTY_DETAILS);
        setErrors({});
        setDirection('back');
        setStep(0);
    };

    const stepClass = stepAnimationClass(hasNavigated, direction);

    return {
        // Wizard navigation
        step,
        stepClass,
        goToStep,
        handleContinue,
        // Entry cards (step 0)
        openCard,
        toggleCard,
        serviceGroups,
        availableLocations,
        availableSpecialists,
        serviceId,
        locationId,
        specialistId,
        selectedService,
        selectedLocation,
        selectedSpecialist,
        requiresLocation,
        /** Whether the location card belongs on screen at all. */
        locationVisible,
        selectionComplete,
        locked,
        /** The order step one stacks its sections in. */
        order,
        /** Nothing on step 0 is the visitor's to decide; it is a recap. */
        selectionIsFixed,
        handleServiceChange,
        handleLocationChange,
        handleSpecialistChange,
        // Date & time (step 1)
        upcomingDays,
        date,
        handleDateChange,
        availableSlots: slots,
        slotsLoading,
        selectedStart,
        handleSelectSlot,
        // Details (step 2)
        details,
        handleDetailChange,
        errors,
        // Submission & summary
        summary,
        processing,
        confirmed,
        handleSubmit,
        resetFlow,
    };
}
