import { useMemo, useState } from 'react';

import {
    getAvailableOptions,
    groupServicesByCategory,
} from '@/lib/appointments';
import {
    applySelection,
    buildBookableDays,
    cardOrder,
    lockedKinds,
    locationIsMandatory,
    nextOpenCard,
    nothingToChoose,
    resolveInitialSelection,
    serviceRequiresLocation,
} from '@/lib/booking';
import type {
    BookingPreset,
    EntryCard,
    SelectionIds,
    SelectionKind,
} from '@/lib/booking';
import type {
    AppointmentLocationDetail,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

/** Told to the slot hook when the selection is replaced, so it can react. */
export type OnSelectionReplaced = (
    next: SelectionIds,
    /** True when the service or specialist changed, invalidating cached slots. */
    poolChanged: boolean,
) => void;

type Params = {
    services: AppointmentServiceOption[];
    locations: AppointmentLocationDetail[];
    specialists: AppointmentSpecialistOption[];
    preset: BookingPreset | null;
    onSelectionReplaced: OnSelectionReplaced;
};

/**
 * Owns the interdependent service / specialist / location selection: the chosen
 * ids, everything derived from them (narrowed option lists, locked/settled
 * flags, card order) and the handlers that change them. Choosing one entity
 * keeps the other two only while they stay compatible, then opens the next
 * still-missing card — the pure decisions all live in `@/lib/booking`.
 */
export function useBookingSelection({
    services,
    locations,
    specialists,
    preset,
    onSelectionReplaced,
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
        const poolChanged =
            next.service !== serviceId || next.specialist !== specialistId;

        onSelectionReplaced(next, poolChanged);

        setServiceId(next.service);
        setLocationId(next.location);
        setSpecialistId(next.specialist);
        setOpenCard(nextOpenCard(next, order, locationVisibleFor(next)));
    };

    const toggleCard = (card: Exclude<EntryCard, null>) => {
        setOpenCard((current) => (current === card ? null : card));
    };

    const resetSelection = () => {
        // Back to the starting point, not to nothing: the single specialist a
        // solo business has is just as preselected on the second booking.
        setServiceId(initialSelection.service);
        setLocationId(initialSelection.location);
        setSpecialistId(initialSelection.specialist);
        setOpenCard(null);
    };

    return {
        initialSelection,
        serviceId,
        locationId,
        specialistId,
        openCard,
        availableLocations,
        availableSpecialists,
        serviceGroups,
        selectedService,
        selectedLocation,
        selectedSpecialist,
        upcomingDays,
        requiresLocation,
        locationVisible,
        selectionComplete,
        locked,
        order,
        selectionIsFixed,
        changeSelection,
        handleServiceChange: (value: number) =>
            changeSelection('service', value),
        handleLocationChange: (value: number) =>
            changeSelection('location', value),
        handleSpecialistChange: (value: number) =>
            changeSelection('specialist', value),
        toggleCard,
        resetSelection,
    };
}
