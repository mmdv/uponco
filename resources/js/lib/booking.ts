import type { CustomerDetails } from '@/components/public-booking/step-details';
import {
    buildUpcomingDays,
    formatAppointmentDay,
    formatAppointmentTimeRange,
    formatDuration,
    formatServicePrice,
} from '@/lib/appointments';
import type { UpcomingDay } from '@/lib/appointments';
import type { CalendarEvent } from '@/lib/calendar';
import type {
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

export type EntryCard = 'service' | 'location' | 'specialist' | null;

export const SELECTION_KINDS = ['service', 'location', 'specialist'] as const;

export type SelectionKind = (typeof SELECTION_KINDS)[number];

export type SelectionIds = Record<SelectionKind, number | null>;

/**
 * The compatibility id-lists every option carries about the other two kinds:
 * a service lists its `location_ids`/`specialist_ids`, a location its
 * `service_ids`/`specialist_ids`, and so on.
 */
export type CompatibilityLists = Partial<
    Record<`${SelectionKind}_ids`, number[]>
>;

/** An option that can be looked up by id and cross-checked for compatibility. */
export type CompatibilityOption = CompatibilityLists & { id: number };

/** The three option pools, keyed by selection kind. */
export type SelectionPools = Record<SelectionKind, CompatibilityOption[]>;

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

/**
 * Identifies a slot query so a response can be matched to the selection it was
 * made for, and an identical refetch can be skipped.
 */
export function slotsKey(
    serviceId: number,
    specialistId: number,
    date: string,
): string {
    return `${serviceId}:${specialistId}:${date}`;
}

/**
 * Whether a service must be delivered at a physical location. Online services
 * never require one; a missing service can't require one either.
 */
export function serviceRequiresLocation(
    service: AppointmentServiceOption | null | undefined,
): boolean {
    return service != null && service.delivery_type !== 'online';
}

/**
 * Apply a new selection for `kind`, dropping each of the other two selections
 * that is no longer compatible with the chosen option. Compatibility is read
 * from the id-lists the backend ships on every option. Returns the next set of
 * selection ids without mutating the input.
 */
export function applySelection(
    pools: SelectionPools,
    current: SelectionIds,
    kind: SelectionKind,
    value: number,
): SelectionIds {
    const selected = pools[kind].find((item) => item.id === value);
    const next: SelectionIds = { ...current, [kind]: value };

    if (!selected) {
        return next;
    }

    for (const other of SELECTION_KINDS) {
        const currentId = next[other];

        if (
            other !== kind &&
            currentId !== null &&
            !selected[`${other}_ids`]?.includes(currentId)
        ) {
            next[other] = null;
        }
    }

    return next;
}

/**
 * Given a (possibly partial) selection, decide which entry card should open
 * next: the first still-missing one in service → specialist → location order,
 * or `null` once everything required is chosen. Location is only required when
 * the chosen service is delivered on-site.
 */
export function nextOpenCard(
    selection: SelectionIds,
    services: AppointmentServiceOption[],
): EntryCard {
    if (selection.service === null) {
        return 'service';
    }

    if (selection.specialist === null) {
        return 'specialist';
    }

    const service = services.find((item) => item.id === selection.service);

    if (serviceRequiresLocation(service) && selection.location === null) {
        return 'location';
    }

    return null;
}

/**
 * Resolve which day the slot picker should load: keep the visitor's preferred
 * day when the selected specialist can actually take it, otherwise fall back to
 * their closest bookable day (or `''` when they have none).
 */
export function resolveBookableDate(
    preferredDate: string,
    availableDays: string[],
): string {
    if (preferredDate !== '' && availableDays.includes(preferredDate)) {
        return preferredDate;
    }

    return availableDays[0] ?? '';
}

export type UpcomingDayWithAvailability = UpcomingDay & { available: boolean };

/**
 * Build the day strip for the next `count` days, marking each day bookable only
 * when it appears in the specialist's set of available days.
 */
export function buildUpcomingDaysWithAvailability(
    count: number,
    availableDays: string[],
): UpcomingDayWithAvailability[] {
    const bookable = new Set(availableDays);

    return buildUpcomingDays(count).map((day) => ({
        ...day,
        available: bookable.has(day.date),
    }));
}

/**
 * Short "duration · price" line for the chosen service, or `undefined` when no
 * service is selected. Empty parts are dropped so a free service with no price
 * still reads cleanly.
 */
export function buildMetaLabel(
    service: AppointmentServiceOption | null,
): string | undefined {
    if (!service) {
        return undefined;
    }

    return [formatDuration(service.duration), formatServicePrice(service)]
        .filter(Boolean)
        .join(' · ');
}

/**
 * Human "day · time-range" label for the chosen slot, or `undefined` when no
 * start is selected. The time range is omitted until an end is also known.
 */
export function buildDateTimeLabel(
    start: string,
    end: string,
    timezone: string,
): string | undefined {
    if (!start) {
        return undefined;
    }

    const timeRange = end
        ? formatAppointmentTimeRange(start, end, timezone)
        : '';

    return `${formatAppointmentDay(start, timezone)} · ${timeRange}`.trim();
}

/**
 * Assemble the read-only booking summary shown in the sidebar and on the
 * confirmation screen. The location line is suppressed for online services.
 */
export function buildSummary(input: {
    service: AppointmentServiceOption | null;
    specialist: AppointmentSpecialistOption | null;
    location: AppointmentLocationOption | null;
    requiresLocation: boolean;
    start: string;
    end: string;
    timezone: string;
}): BookingSummary {
    return {
        serviceTitle: input.service?.title,
        metaLabel: buildMetaLabel(input.service),
        specialistName: input.specialist?.name,
        locationName: input.requiresLocation ? input.location?.name : null,
        dateTimeLabel: buildDateTimeLabel(
            input.start,
            input.end,
            input.timezone,
        ),
    };
}

/**
 * Build the calendar event used for the "add to calendar" links, or `null`
 * until a service and a full slot (start and end) are known.
 */
export function buildCalendarEvent(input: {
    service: AppointmentServiceOption | null;
    specialist: AppointmentSpecialistOption | null;
    location: AppointmentLocationOption | null;
    requiresLocation: boolean;
    companyName: string;
    start: string;
    end: string;
    notes: string;
}): CalendarEvent | null {
    if (!input.service || !input.start || !input.end) {
        return null;
    }

    return {
        title: `${input.service.title} · ${input.companyName}`,
        start: input.start,
        end: input.end,
        location:
            input.requiresLocation && input.location
                ? input.location.name
                : undefined,
        description:
            [
                input.specialist ? `With ${input.specialist.name}` : null,
                input.notes.trim() || null,
            ]
                .filter(Boolean)
                .join('\n') || undefined,
    };
}

/**
 * The entrance-animation class for a wizard step. Empty on first paint so the
 * fixed footer's Continue button doesn't appear to drop in on load.
 */
export function stepAnimationClass(
    hasNavigated: boolean,
    direction: 'forward' | 'back',
): string {
    if (!hasNavigated) {
        return '';
    }

    return direction === 'forward'
        ? 'animate-in fade-in-0 slide-in-from-right-8 duration-300'
        : 'animate-in fade-in-0 slide-in-from-left-8 duration-300';
}

export const EMPTY_DETAILS: CustomerDetails = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: '',
};
