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
    EMPTY_DETAILS,
    nextOpenCard,
    resolveBookableDate,
    serviceRequiresLocation,
    slotsKey,
    stepAnimationClass,
} from '@/lib/booking';
import type { ConfirmedSummary, EntryCard, SelectionKind } from '@/lib/booking';
import { store } from '@/routes/public/appointments';
import type {
    AppointmentLocationOption,
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
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    availableSlots: AppointmentSlot[];
};

/**
 * Drives the public appointment booking flow: the three-step wizard, the
 * interdependent service/location/specialist selection, slot loading and the
 * final submission. Returns the derived view state plus the handlers the page
 * and its child components bind to, keeping the page itself presentational.
 *
 * The interdependent-selection, day-resolution and summary/calendar building
 * logic lives in `@/lib/booking` as pure functions so it can be unit-tested
 * independently of React state and the Inertia router.
 */
export function useAppointmentBooking({
    company,
    timezone,
    services,
    locations,
    specialists,
    availableSlots,
}: Params) {
    const [step, setStep] = useState(0);
    const [hasNavigated, setHasNavigated] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [openCard, setOpenCard] = useState<EntryCard>(null);

    const [serviceId, setServiceId] = useState<number | null>(null);
    const [locationId, setLocationId] = useState<number | null>(null);
    const [specialistId, setSpecialistId] = useState<number | null>(null);
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

    const { availableServices, availableLocations, availableSpecialists } =
        useMemo(
            () =>
                getAvailableOptions(services, locations, specialists, {
                    serviceId,
                    locationId,
                    specialistId,
                }),
            [
                services,
                locations,
                specialists,
                serviceId,
                locationId,
                specialistId,
            ],
        );

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
    const selectionComplete =
        serviceId !== null &&
        specialistId !== null &&
        (!requiresLocation || locationId !== null);

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
        setOpenCard(nextOpenCard(next, services));
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
        setServiceId(null);
        setLocationId(null);
        setSpecialistId(null);
        setDate('');
        setSelectedStart('');
        setSelectedEnd('');
        // The booking just made means any cached slot list is stale.
        requestedSlotsKey.current = null;
        loadedSlotsKey.current = null;
        setSlots([]);
        setDetails(EMPTY_DETAILS);
        setErrors({});
        setOpenCard(null);
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
        selectionComplete,
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
