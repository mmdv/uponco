import type { Appointment } from '@/types';

/** The toolbar's facet filters, as arrays of stringified ids. */
type FacetFilters = {
    locationIds: string[];
    serviceIds: string[];
    specialistIds: string[];
};

/**
 * Apply the toolbar facet filters, then split into upcoming and past.
 *
 * Appointments arrive ordered ascending by start. Upcoming keeps that order
 * (closest future first); past is reversed so it reads closest-to-now first.
 */
export function partitionAppointments(
    appointments: Appointment[],
    filters: FacetFilters,
): { upcoming: Appointment[]; past: Appointment[] } {
    const now = Date.now();
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    for (const appointment of appointments) {
        if (
            filters.locationIds.length > 0 &&
            !filters.locationIds.includes(String(appointment.location_id))
        ) {
            continue;
        }

        if (
            filters.serviceIds.length > 0 &&
            !filters.serviceIds.includes(String(appointment.service_id))
        ) {
            continue;
        }

        if (
            filters.specialistIds.length > 0 &&
            !filters.specialistIds.includes(String(appointment.specialist_id))
        ) {
            continue;
        }

        if (new Date(appointment.start_at).getTime() >= now) {
            upcoming.push(appointment);
        } else {
            past.push(appointment);
        }
    }

    return { upcoming, past: past.reverse() };
}
