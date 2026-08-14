import { router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';

import type { CustomerDetails } from '@/components/public-booking/step-details';
import {
    getAvailableOptions,
    groupServicesByCategory,
} from '@/lib/appointments';
import {
    applySelection,
    buildCalendarEvent,
    buildSummary,
    buildUpcomingDaysWithAvailability,
    cardOrder,
    EMPTY_DETAILS,
    lockedKinds,
    locationIsMandatory,
    nextOpenCard,
    nothingToChoose,
    resolveBookableDate,
    resolveInitialSelection,
    serviceRequiresLocation,
    slotsKey,
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
    availableSlots: AppointmentSlot[];
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
    availableSlots,
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
    // Slots live in local state rather than being read straight from the prop:
    // submitting a booking redirects back to a page render where the optional
    // `availableSlots` prop is omitted (reset to []), which would otherwise wipe
    // the picker. Keeping our own copy means the last fetched day survives a
    // failed submit until the visitor changes the day.
    const [slots, setSlots] = useState<AppointmentSlot[]>(availableSlots);

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

    // The day strip covers the next two weeks; only the days the selected
    // specialist actually has a free slot on are bookable (and clickable).
    const upcomingDays = useMemo(
        () =>
            buildUpcomingDaysWithAvailability(
                14,
                selectedSpecialist?.available_days ?? [],
            ),
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

    // The slot query the visitor most recently asked for, and the one whose
    // slots are currently on screen. Comparing against them lets a late
    // response for a superseded selection be ignored, and an identical
    // refetch be skipped when the selection hasn't changed.
    const requestedSlotsKey = useRef<string | null>(null);
    const loadedSlotsKey = useRef<string | null>(null);

    const requestSlots = (next: {
        serviceId: number | null;
        specialistId: number | null;
        date: string;
    }) => {
        setSelectedStart('');
        setSelectedEnd('');

        if (
            next.serviceId === null ||
            next.specialistId === null ||
            next.date === ''
        ) {
            requestedSlotsKey.current = null;
            loadedSlotsKey.current = null;
            setSlots([]);

            return;
        }

        const key = slotsKey(next.serviceId, next.specialistId, next.date);
        requestedSlotsKey.current = key;

        router.reload({
            only: ['availableSlots'],
            data: {
                service_id: next.serviceId,
                specialist_id: next.specialistId,
                date: next.date,
                appointment_id: '',
            },
            onStart: () => setSlotsLoading(true),
            onSuccess: (page) => {
                if (requestedSlotsKey.current !== key) {
                    return;
                }

                loadedSlotsKey.current = key;
                setSlots(
                    (page.props.availableSlots as
                        | AppointmentSlot[]
                        | undefined) ?? [],
                );
            },
            onFinish: () => {
                if (requestedSlotsKey.current === key) {
                    setSlotsLoading(false);
                }
            },
        });
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
        setDate(value);
        requestSlots({ serviceId, specialistId, date: value });
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
            // otherwise fall back to their closest bookable day. Refetch slots
            // unless the on-screen ones already belong to this exact selection,
            // so changing the specialist (or service) never leaves the previous
            // specialist's slots on screen.
            const nextDate = resolveBookableDate(
                date,
                selectedSpecialist?.available_days ?? [],
            );

            setDate(nextDate);

            const alreadyLoaded =
                serviceId !== null &&
                specialistId !== null &&
                nextDate !== '' &&
                loadedSlotsKey.current ===
                    slotsKey(serviceId, specialistId, nextDate);

            if (!alreadyLoaded) {
                requestSlots({ serviceId, specialistId, date: nextDate });
            }

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
                        // (e.g. the slot was just taken), so forget it was
                        // loaded and refetch when the visitor returns here.
                        loadedSlotsKey.current = null;
                        requestSlots({ serviceId, specialistId, date });
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
        setSelectedStart('');
        setSelectedEnd('');
        // The booking just made means any cached slot list is stale.
        requestedSlotsKey.current = null;
        loadedSlotsKey.current = null;
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
