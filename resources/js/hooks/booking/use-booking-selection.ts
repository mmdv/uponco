import { useMemo, useState } from 'react';

import {
    getAvailableOptions,
    groupServicesByCategory,
} from '@/lib/appointments';
import {
    applySelection,
    buildBookableDays,
    cardOrder,
    fillSingleOptions,
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
    // The kinds the last choice filled in on the visitor's behalf because only
    // one option fitted. They are dropped again before the next choice, so a
    // value picked for the visitor never outlives the reason it was picked.
    const [autoFilled, setAutoFilled] = useState<SelectionKind[]>([]);
    // Nothing is unfolded on arrival: every card that is still a choice starts
    // collapsed, so the step reads as a short list of what it needs.
    const [openCard, setOpenCard] = useState<EntryCard>(null);

    // The option lists narrow only by what the visitor chose (or the page
    // preselected): a value picked for them is dropped on their next choice, so
    // letting it hide options would leave them unable to make that choice —
    // auto-picking the only specialist of one service must not hide the others.
    const narrowedBy = (kind: SelectionKind, id: number | null) =>
        autoFilled.includes(kind) ? initialSelection[kind] : id;
    const narrowServiceId = narrowedBy('service', serviceId);
    const narrowLocationId = narrowedBy('location', locationId);
    const narrowSpecialistId = narrowedBy('specialist', specialistId);

    const {
        availableServices,
        availableLocations: narrowedLocations,
        availableSpecialists,
    } = useMemo(
        () =>
            getAvailableOptions(services, locations, specialists, {
                serviceId: narrowServiceId,
                locationId: narrowLocationId,
                specialistId: narrowSpecialistId,
            }),
        [
            services,
            locations,
            specialists,
            narrowServiceId,
            narrowLocationId,
            narrowSpecialistId,
        ],
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

    // Every change to the ids goes through here, so the slot hook always hears
    // about it: a different service or specialist changes what is available on
    // every day, and the cached windows for the old selection are thrown away.
    const replaceSelection = (next: SelectionIds) => {
        const poolChanged =
            next.service !== serviceId || next.specialist !== specialistId;

        onSelectionReplaced(next, poolChanged);

        setServiceId(next.service);
        setLocationId(next.location);
        setSpecialistId(next.specialist);
    };

    // Selecting one entity keeps each of the other two only while it stays
    // compatible with the new choice, fills in whatever that leaves with a
    // single option, then opens the next still-missing card.
    const changeSelection = (kind: SelectionKind, value: number) => {
        const current: SelectionIds = {
            service: serviceId,
            location: locationId,
            specialist: specialistId,
        };

        for (const filledKind of autoFilled) {
            if (filledKind !== kind) {
                current[filledKind] = initialSelection[filledKind];
            }
        }

        const { selection: next, filled } = fillSingleOptions(
            { services, locations, specialists },
            applySelection(
                {
                    service: services,
                    location: locations,
                    specialist: specialists,
                },
                current,
                kind,
                value,
            ),
        );

        replaceSelection(next);
        setAutoFilled(filled);
        setOpenCard(nextOpenCard(next, order, locationVisibleFor(next)));
    };

    /**
     * Un-choose one kind, leaving the other two as they are. A locked kind was
     * never the visitor's to choose, so it can't be cleared either. The open
     * card is left alone: clearing a filter from inside a picker keeps that
     * picker on screen.
     */
    const clearSelection = (kind: SelectionKind) => {
        if (locked[kind]) {
            return;
        }

        replaceSelection({
            service: serviceId,
            location: locationId,
            specialist: specialistId,
            [kind]: null,
        });
        setAutoFilled((kinds) => kinds.filter((filled) => filled !== kind));
    };

    /** Start the choices over from what the page preselected on arrival. */
    const clearAllSelections = () => {
        replaceSelection(initialSelection);
        setAutoFilled([]);
        setOpenCard(null);
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
        setAutoFilled([]);
        setOpenCard(null);
    };

    return {
        initialSelection,
        autoFilled,
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
        /** Open a specific card (or close them all with `null`). */
        openPicker: setOpenCard,
        clearSelection,
        clearAllSelections,
        resetSelection,
    };
}
