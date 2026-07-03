import type {
    Appointment,
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

const priceFormatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

export type AppointmentSelection = {
    serviceId: number | null;
    locationId: number | null;
    specialistId: number | null;
};

export type ServiceCategoryGroup = {
    id: number;
    name: string;
    services: AppointmentServiceOption[];
};

/**
 * Narrow each of the three option lists based on the current selection.
 *
 * Service, location and specialist all relate to one another, so picking any
 * of them constrains the choices available for the other two. This is the core
 * availability logic shared between the dashboard and the public booking page.
 */
export function getAvailableOptions(
    services: AppointmentServiceOption[],
    locations: AppointmentLocationOption[],
    specialists: AppointmentSpecialistOption[],
    selection: AppointmentSelection,
) {
    const { serviceId, locationId, specialistId } = selection;

    const availableServices = services.filter(
        (service) =>
            (locationId === null ||
                service.location_ids.includes(locationId)) &&
            (specialistId === null ||
                service.specialist_ids.includes(specialistId)),
    );

    const availableLocations = locations.filter(
        (location) =>
            (serviceId === null || location.service_ids.includes(serviceId)) &&
            (specialistId === null ||
                location.specialist_ids.includes(specialistId)),
    );

    const availableSpecialists = specialists.filter(
        (specialist) =>
            (serviceId === null ||
                specialist.service_ids.includes(serviceId)) &&
            (locationId === null ||
                specialist.location_ids.includes(locationId)),
    );

    return { availableServices, availableLocations, availableSpecialists };
}

/**
 * Group services by their category for a grouped select control.
 */
export function groupServicesByCategory(
    services: AppointmentServiceOption[],
): ServiceCategoryGroup[] {
    const groups = new Map<number, ServiceCategoryGroup>();

    for (const service of services) {
        const group = groups.get(service.category_id);

        if (group) {
            group.services.push(service);
        } else {
            groups.set(service.category_id, {
                id: service.category_id,
                name: service.category_name,
                services: [service],
            });
        }
    }

    return Array.from(groups.values());
}

/**
 * Format the day portion of an appointment in the location timezone.
 */
export function formatAppointmentDay(iso: string, timezone: string): string {
    return new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(iso));
}

/**
 * Convert an ISO instant to a `YYYY-MM-DD` value (in the location timezone)
 * suitable for a native date input.
 */
export function toDateInputValue(iso: string, timezone: string): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(iso));
}

/**
 * Get today's date as a `YYYY-MM-DD` value, used as the minimum bookable day.
 */
export function todayDateInputValue(): string {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Format the start–end time range of an appointment in the location timezone.
 */
export function formatAppointmentTimeRange(
    startIso: string,
    endIso: string,
    timezone: string,
): string {
    const formatter = new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${formatter.format(new Date(startIso))} – ${formatter.format(new Date(endIso))}`;
}

export type UpcomingDay = {
    /** `YYYY-MM-DD` value passed to the slot generator. */
    date: string;
    weekday: string;
    day: string;
    month: string;
    isToday: boolean;
    isTomorrow: boolean;
};

/**
 * Build a list of the next `count` calendar days for the horizontal day picker.
 */
export function buildUpcomingDays(count: number): UpcomingDay[] {
    const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
    });
    const monthFormatter = new Intl.DateTimeFormat(undefined, {
        month: 'short',
    });

    const base = new Date();
    base.setHours(0, 0, 0, 0);

    return Array.from({ length: count }, (_, index) => {
        const current = new Date(base);
        current.setDate(base.getDate() + index);

        const date = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

        return {
            date,
            weekday: weekdayFormatter.format(current),
            day: String(current.getDate()),
            month: monthFormatter.format(current),
            isToday: index === 0,
            isTomorrow: index === 1,
        };
    });
}

/**
 * Filter a list of half-hour preview start times down to the ones where a
 * service of the given duration actually fits — i.e. enough back-to-back free
 * 30-minute blocks start at that time. A 30-minute opening shouldn't be offered
 * for a one-hour service, so the specialist preview stays honest once a service
 * (and therefore a duration) has been chosen.
 */
export function filterPreviewSlotsByDuration(
    slots: string[],
    durationMinutes: number,
): string[] {
    const step = 30;
    const blocksNeeded = Math.max(1, Math.ceil(durationMinutes / step));

    if (blocksNeeded === 1) {
        return slots;
    }

    const available = new Set(slots);

    const toMinutes = (value: string): number => {
        const [hours, minutes] = value.split(':').map(Number);

        return hours * 60 + minutes;
    };

    const toLabel = (total: number): string => {
        const hours = Math.floor(total / 60);
        const minutes = total % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    return slots.filter((slot) => {
        const start = toMinutes(slot);

        for (let index = 1; index < blocksNeeded; index++) {
            if (!available.has(toLabel(start + index * step))) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Format a service duration in minutes as a short human label, e.g. "1h 30m".
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;

    return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

/**
 * Format a service's price into a short display string based on its price type.
 */
export function formatServicePrice(service: AppointmentServiceOption): string {
    switch (service.price_type) {
        case 'free':
            return 'Free';
        case 'range':
            if (service.price_min && service.price_max) {
                return `${priceFormatter.format(Number(service.price_min))}–${priceFormatter.format(Number(service.price_max))}`;
            }

            return service.price
                ? priceFormatter.format(Number(service.price))
                : '';
        case 'fixed':
        default:
            return service.price
                ? priceFormatter.format(Number(service.price))
                : '';
    }
}

/**
 * Label a day relative to now: "Today", "Yesterday" and "Tomorrow" are spelled
 * out, every other day reads like "8 Jun 2026, Mon". Comparisons happen in the
 * given timezone so day boundaries match the appointment's location.
 */
export function dayLabel(iso: string, timezone: string): string {
    const target = toDateInputValue(iso, timezone);
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    if (target === toDateInputValue(new Date(now).toISOString(), timezone)) {
        return 'Today';
    }

    if (
        target === toDateInputValue(new Date(now + day).toISOString(), timezone)
    ) {
        return 'Tomorrow';
    }

    if (
        target === toDateInputValue(new Date(now - day).toISOString(), timezone)
    ) {
        return 'Yesterday';
    }

    const date = new Date(iso);
    const part = (options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('en', {
            timeZone: timezone,
            ...options,
        }).format(date);

    return `${part({ day: 'numeric' })} ${part({ month: 'short' })} ${part({
        year: 'numeric',
    })}, ${part({ weekday: 'short' })}`;
}

/**
 * Whether the appointment has already started. Past appointments are read-only:
 * they can be previewed but not edited, rescheduled or deleted. Matches the
 * upcoming/past split, which buckets appointments by their start time.
 */
export function isPastAppointment(appointment: Appointment): boolean {
    return new Date(appointment.start_at).getTime() < Date.now();
}

export type AppointmentDayGroup = {
    /** `YYYY-MM-DD` key used to bucket appointments by calendar day. */
    key: string;
    label: string;
    appointments: Appointment[];
};

/**
 * Bucket appointments into per-day groups, preserving the input order so the
 * caller controls the direction (ascending for upcoming, descending for past).
 */
export function groupAppointmentsByDay(
    appointments: Appointment[],
): AppointmentDayGroup[] {
    const groups: AppointmentDayGroup[] = [];
    const byKey = new Map<string, AppointmentDayGroup>();

    for (const appointment of appointments) {
        const key = toDateInputValue(
            appointment.start_at,
            appointment.timezone,
        );
        let group = byKey.get(key);

        if (!group) {
            group = {
                key,
                label: dayLabel(appointment.start_at, appointment.timezone),
                appointments: [],
            };
            byKey.set(key, group);
            groups.push(group);
        }

        group.appointments.push(appointment);
    }

    return groups;
}
