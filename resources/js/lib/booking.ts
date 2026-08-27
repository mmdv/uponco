import type { CustomerDetails } from '@/components/public-booking/step-details';
import {
    buildUpcomingDays,
    formatAppointmentDay,
    formatAppointmentTimeRange,
    formatDuration,
    formatServicePrice,
    getAvailableOptions,
} from '@/lib/appointments';
import type { UpcomingDay } from '@/lib/appointments';
import type { CalendarEvent } from '@/lib/calendar';
import {
    email,
    firstErrors,
    required,
    requiredWithout,
} from '@/lib/validation';
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

/** How many days of slots a single window fetch covers. */
export const SLOT_WINDOW_DAYS = 7;

/** Format a `Date` as a `YYYY-MM-DD` calendar-date string. */
function toDateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * The `YYYY-MM-DD` date `count` calendar days after `date`. Built from the
 * date parts rather than by adding milliseconds, so it can never drift across a
 * daylight-saving boundary the way adding 24-hour spans would.
 */
export function addDays(date: string, count: number): string {
    const [year, month, day] = date.split('-').map(Number);

    return toDateString(new Date(year, month - 1, day + count));
}

/** Whole calendar days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
    const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
    const [toYear, toMonth, toDay] = to.split('-').map(Number);

    return Math.round(
        (Date.UTC(toYear, toMonth - 1, toDay) -
            Date.UTC(fromYear, fromMonth - 1, fromDay)) /
            86_400_000,
    );
}

/** The list of `YYYY-MM-DD` dates in a `days`-long window starting at `startDate`. */
export function windowDates(startDate: string, days: number): string[] {
    return Array.from({ length: days }, (_, offset) =>
        addDays(startDate, offset),
    );
}

/**
 * The start date of the next slot window to prefetch, or `null` when none is
 * needed yet.
 *
 * Walks forward over the days already cached from `selectedDate` to find the
 * furthest contiguous loaded day. When that edge is within two days of the
 * selection — and still short of the strip's horizon — the day after it starts
 * the next window: this is the "refetch when the last fetched day is only two
 * days away or less" rule. Returns `null` when the selected day itself isn't
 * cached yet (a cold fetch already covers what's ahead) or the horizon is
 * already loaded.
 */
export function nextPrefetchStart(
    cachedDates: Iterable<string>,
    selectedDate: string,
    horizonEnd: string,
): string | null {
    if (selectedDate === '') {
        return null;
    }

    const cached =
        cachedDates instanceof Set ? cachedDates : new Set(cachedDates);

    if (!cached.has(selectedDate)) {
        return null;
    }

    let edge = selectedDate;

    while (cached.has(addDays(edge, 1))) {
        edge = addDays(edge, 1);
    }

    if (edge >= horizonEnd) {
        return null;
    }

    return daysBetween(selectedDate, edge) <= 2 ? addDays(edge, 1) : null;
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
 * Build the day strip so it runs from today through the specialist's last
 * available day, never shorter than `minDays`. This lets the strip reach a
 * schedule published weeks or months ahead instead of stopping at a fixed
 * two-week horizon. `availableDays` is ascending; the last entry is the furthest
 * bookable day.
 */
export function buildBookableDays(
    availableDays: string[],
    minDays = 14,
): UpcomingDayWithAvailability[] {
    const last = availableDays[availableDays.length - 1] ?? '';
    const today = buildUpcomingDays(1)[0].date;
    const span =
        last === '' ? minDays : Math.max(minDays, daysBetween(today, last) + 1);

    return buildUpcomingDaysWithAvailability(span, availableDays);
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

/** The user-facing copy `validateDetails` needs, resolved by the caller. */
export type DetailMessages = {
    nameRequired: string;
    contactRequired: string;
    emailInvalid: string;
};

/**
 * Check the customer details the way BookPublicAppointmentRequest will.
 *
 * Mirrors `customer_name` required plus the `required_without` pair on
 * `customer_email`/`customer_phone`, so a submission that the server is
 * certain to reject never leaves the browser. The booking POST is rate
 * limited, and the step's own `<form>` deliberately swallows native submit
 * (its `onSubmit` is a `preventDefault`, so autofill still works), which means
 * `required` attributes on those inputs would never fire — this is the only
 * place the check can live.
 *
 * Returns an Inertia-shaped bag, so the same `<InputError>` renders whichever
 * side produced the error.
 */
export function validateDetails(
    details: CustomerDetails,
    messages: DetailMessages,
): Partial<Record<string, string>> {
    return firstErrors([
        {
            field: 'customer_name',
            passes: required(details.customer_name),
            message: messages.nameRequired,
        },
        {
            field: 'customer_email',
            passes: requiredWithout(
                details.customer_email,
                details.customer_phone,
            ),
            message: messages.contactRequired,
        },
        {
            field: 'customer_email',
            // Only meaningful once something was typed; an empty email is
            // legitimate when a phone number was given instead.
            passes:
                !required(details.customer_email) ||
                email(details.customer_email),
            message: messages.emailInvalid,
        },
    ]);
}

/** A choice the visitor arrived with, from a deep-linked booking URL. */
export type BookingPreset = {
    type: SelectionKind;
    id: number;
    name: string;
    back_url: string;
};

/** Which of the three choices the visitor cannot change. */
export type LockedKinds = Record<SelectionKind, boolean>;

type Pools = {
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
};

/**
 * Whether a location has to be picked at all.
 *
 * Once a service is chosen its own delivery type decides. Before then, a
 * location is only unavoidable when every service still on offer is on-site —
 * if even one online service remains, choosing it would drop the requirement,
 * so nothing may be preselected on the visitor's behalf yet.
 */
export function locationIsMandatory(
    availableServices: AppointmentServiceOption[],
    selectedService: AppointmentServiceOption | null,
): boolean {
    if (selectedService !== null) {
        return serviceRequiresLocation(selectedService);
    }

    return (
        availableServices.length > 0 &&
        availableServices.every(serviceRequiresLocation)
    );
}

/**
 * Decide what is already chosen the moment the page loads.
 *
 * A choice with exactly one possible answer is not a choice: an appointment
 * cannot exist without a service or a specialist, so a company offering one of
 * either has it selected up front. A location follows the same rule, but only
 * while it is genuinely unavoidable ({@see locationIsMandatory}). Anything the
 * URL pinned via a deep link is applied first and always wins.
 *
 * The passes matter: selecting the only service can narrow the specialists to
 * one, which can in turn narrow the locations to one. Four passes is more than
 * the three kinds can ever need, and bounds the loop.
 */
export function resolveInitialSelection(
    { services, locations, specialists }: Pools,
    preset: BookingPreset | null,
): SelectionIds {
    const pools: SelectionPools = {
        service: services,
        location: locations,
        specialist: specialists,
    };

    let selection: SelectionIds = {
        service: null,
        location: null,
        specialist: null,
    };

    if (preset) {
        selection = applySelection(pools, selection, preset.type, preset.id);
    }

    for (let pass = 0; pass < 4; pass++) {
        const { availableServices, availableLocations, availableSpecialists } =
            getAvailableOptions(services, locations, specialists, {
                serviceId: selection.service,
                locationId: selection.location,
                specialistId: selection.specialist,
            });

        let changed = false;

        if (selection.service === null && availableServices.length === 1) {
            selection = applySelection(
                pools,
                selection,
                'service',
                availableServices[0].id,
            );
            changed = true;
        }

        if (
            selection.specialist === null &&
            availableSpecialists.length === 1
        ) {
            selection = applySelection(
                pools,
                selection,
                'specialist',
                availableSpecialists[0].id,
            );
            changed = true;
        }

        if (selection.location === null && availableLocations.length === 1) {
            const selectedService =
                services.find((item) => item.id === selection.service) ?? null;

            if (locationIsMandatory(availableServices, selectedService)) {
                selection = applySelection(
                    pools,
                    selection,
                    'location',
                    availableLocations[0].id,
                );
                changed = true;
            }
        }

        if (!changed) {
            break;
        }
    }

    return selection;
}

/**
 * Which kinds the visitor has no say over: pinned by the URL, or down to a
 * single option. A locked kind is shown as a plain statement of fact rather
 * than as a picker with one row.
 */
export function lockedKinds(
    counts: Record<SelectionKind, number>,
    preset: BookingPreset | null,
): LockedKinds {
    return {
        service: preset?.type === 'service' || counts.service <= 1,
        location: preset?.type === 'location' || counts.location <= 1,
        specialist: preset?.type === 'specialist' || counts.specialist <= 1,
    };
}

/** Settled sections lead, in this order. */
const SETTLED_ORDER: SelectionKind[] = ['specialist', 'service', 'location'];

/** Sections still to be chosen follow, in this order. */
const CHOOSABLE_ORDER: SelectionKind[] = ['service', 'specialist', 'location'];

/**
 * The order step one stacks its three sections in.
 *
 * Whatever is already settled floats to the top: those are statements of fact,
 * and reading them first tells the visitor what this page is before asking them
 * for anything. What is left to choose follows, service first — it is the one
 * that reads as a menu, and the other two mostly narrow it.
 */
export function cardOrder(locked: LockedKinds): SelectionKind[] {
    return [
        ...SETTLED_ORDER.filter((kind) => locked[kind]),
        ...CHOOSABLE_ORDER.filter((kind) => !locked[kind]),
    ];
}

/**
 * Which card to open once the visitor has made a choice: the first one in the
 * rendered order that is still empty.
 *
 * Only ever called in response to a selection — nothing is open on arrival, so
 * a page of collapsed cards reads as a short list of what it needs rather than
 * one unfolded list with the rest hidden below it.
 */
export function nextOpenCard(
    selection: SelectionIds,
    order: SelectionKind[],
    locationVisible: boolean,
): EntryCard {
    for (const kind of order) {
        if (kind === 'location' && !locationVisible) {
            continue;
        }

        if (selection[kind] === null) {
            return kind;
        }
    }

    return null;
}

/**
 * Whether step one has nothing left for the visitor to decide, which turns it
 * into a recap and makes the button below it say where it actually goes.
 */
export function nothingToChoose(
    locked: LockedKinds,
    requiresLocation: boolean,
    selectionComplete: boolean,
): boolean {
    return (
        selectionComplete &&
        locked.service &&
        locked.specialist &&
        (!requiresLocation || locked.location)
    );
}
