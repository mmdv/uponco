import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import type { CustomerDetails } from '@/components/public-booking/step-details';
import {
    buildUpcomingDays,
    formatAppointmentDay,
    formatAppointmentTimeRange,
    formatDuration,
    formatServicePrice,
    getAvailableOptions,
    groupServicesByCategory,
} from '@/lib/appointments';
import type { CalendarEvent } from '@/lib/calendar';
import { store } from '@/routes/public/appointments';
import type {
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
} from '@/types';

export type EntryCard = 'service' | 'location' | 'specialist' | null;

export type BookingSummary = {
    serviceTitle?: string;
    metaLabel?: string;
    specialistName?: string;
    locationName?: string | null;
    dateTimeLabel?: string;
};

export type ConfirmedSummary = BookingSummary & {
    customerName: string;
    calendar: CalendarEvent | null;
};

const EMPTY_DETAILS: CustomerDetails = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: '',
};

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
    const upcomingDays = useMemo(() => {
        const bookable = new Set(selectedSpecialist?.available_days ?? []);

        return buildUpcomingDays(14).map((day) => ({
            ...day,
            available: bookable.has(day.date),
        }));
    }, [selectedSpecialist]);

    const requiresLocation =
        selectedService !== null && selectedService.delivery_type !== 'online';
    const selectionComplete =
        serviceId !== null &&
        specialistId !== null &&
        (!requiresLocation || locationId !== null);

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
            return;
        }

        router.reload({
            only: ['availableSlots'],
            data: {
                service_id: next.serviceId,
                specialist_id: next.specialistId,
                date: next.date,
                appointment_id: '',
            },
            onStart: () => setSlotsLoading(true),
            onFinish: () => setSlotsLoading(false),
        });
    };

    // After a selection, open the next still-missing entry card (or collapse).
    const focusNext = (next: {
        serviceId: number | null;
        locationId: number | null;
        specialistId: number | null;
    }) => {
        if (next.serviceId === null) {
            return setOpenCard('service');
        }

        if (next.specialistId === null) {
            return setOpenCard('specialist');
        }

        const service = services.find((item) => item.id === next.serviceId);
        const needsLocation =
            service != null && service.delivery_type !== 'online';

        if (needsLocation && next.locationId === null) {
            return setOpenCard('location');
        }

        return setOpenCard(null);
    };

    const handleServiceChange = (value: number) => {
        const service = services.find((item) => item.id === value);
        let nextLocationId = locationId;
        let nextSpecialistId = specialistId;

        if (service) {
            if (
                nextLocationId !== null &&
                !service.location_ids.includes(nextLocationId)
            ) {
                nextLocationId = null;
            }

            if (
                nextSpecialistId !== null &&
                !service.specialist_ids.includes(nextSpecialistId)
            ) {
                nextSpecialistId = null;
            }
        }

        setServiceId(value);
        setLocationId(nextLocationId);
        setSpecialistId(nextSpecialistId);
        focusNext({
            serviceId: value,
            locationId: nextLocationId,
            specialistId: nextSpecialistId,
        });
    };

    const handleLocationChange = (value: number) => {
        const location = locations.find((item) => item.id === value);
        let nextServiceId = serviceId;
        let nextSpecialistId = specialistId;

        if (location) {
            if (
                nextServiceId !== null &&
                !location.service_ids.includes(nextServiceId)
            ) {
                nextServiceId = null;
            }

            if (
                nextSpecialistId !== null &&
                !location.specialist_ids.includes(nextSpecialistId)
            ) {
                nextSpecialistId = null;
            }
        }

        setLocationId(value);
        setServiceId(nextServiceId);
        setSpecialistId(nextSpecialistId);
        focusNext({
            serviceId: nextServiceId,
            locationId: value,
            specialistId: nextSpecialistId,
        });
    };

    const handleSpecialistChange = (value: number) => {
        const specialist = specialists.find((item) => item.id === value);
        let nextServiceId = serviceId;
        let nextLocationId = locationId;

        if (specialist) {
            if (
                nextServiceId !== null &&
                !specialist.service_ids.includes(nextServiceId)
            ) {
                nextServiceId = null;
            }

            if (
                nextLocationId !== null &&
                !specialist.location_ids.includes(nextLocationId)
            ) {
                nextLocationId = null;
            }
        }

        setSpecialistId(value);
        setServiceId(nextServiceId);
        setLocationId(nextLocationId);
        focusNext({
            serviceId: nextServiceId,
            locationId: nextLocationId,
            specialistId: value,
        });
    };

    const handleDateChange = (value: string) => {
        setDate(value);
        requestSlots({ serviceId, specialistId, date: value });
    };

    const handleSelectSlot = (start: string) => {
        const slot = availableSlots.find((item) => item.start === start);
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

            return next;
        });
    };

    const toggleCard = (card: Exclude<EntryCard, null>) => {
        setOpenCard((current) => (current === card ? null : card));
    };

    const dateTimeLabel = selectedStart
        ? `${formatAppointmentDay(selectedStart, timezone)} · ${
              selectedEnd
                  ? formatAppointmentTimeRange(
                        selectedStart,
                        selectedEnd,
                        timezone,
                    )
                  : ''
          }`.trim()
        : undefined;

    const metaLabel = selectedService
        ? [
              formatDuration(selectedService.duration),
              formatServicePrice(selectedService),
          ]
              .filter(Boolean)
              .join(' · ')
        : undefined;

    const summary: BookingSummary = {
        serviceTitle: selectedService?.title,
        metaLabel,
        specialistName: selectedSpecialist?.name,
        locationName: requiresLocation ? selectedLocation?.name : null,
        dateTimeLabel,
    };

    const calendarEvent: CalendarEvent | null =
        selectedService && selectedStart && selectedEnd
            ? {
                  title: `${selectedService.title} · ${company.name}`,
                  start: selectedStart,
                  end: selectedEnd,
                  location:
                      requiresLocation && selectedLocation
                          ? selectedLocation.name
                          : undefined,
                  description:
                      [
                          selectedSpecialist
                              ? `With ${selectedSpecialist.name}`
                              : null,
                          details.notes.trim() || null,
                      ]
                          .filter(Boolean)
                          .join('\n') || undefined,
              }
            : null;

    const goToStep = (next: number) => {
        setDirection(next > step ? 'forward' : 'back');
        setHasNavigated(true);
        setStep(next);
    };

    const handleContinue = () => {
        if (step === 0) {
            // Keep the chosen day only when the selected specialist can take it,
            // otherwise fall back to their closest bookable day. Always refetch
            // slots here so changing the specialist (or service) never leaves the
            // previous specialist's slots on screen.
            const bookableDays = selectedSpecialist?.available_days ?? [];
            const nextDate =
                date !== '' && bookableDays.includes(date)
                    ? date
                    : (bookableDays[0] ?? '');

            setDate(nextDate);
            requestSlots({ serviceId, specialistId, date: nextDate });

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
        setDetails(EMPTY_DETAILS);
        setErrors({});
        setOpenCard(null);
        setDirection('back');
        setStep(0);
    };

    // Skip the entrance animation on first paint so the fixed footer's
    // Continue button doesn't appear to drop in and settle on load.
    const stepClass = !hasNavigated
        ? ''
        : direction === 'forward'
          ? 'animate-in fade-in-0 slide-in-from-right-8 duration-300'
          : 'animate-in fade-in-0 slide-in-from-left-8 duration-300';

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
        availableSlots,
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
