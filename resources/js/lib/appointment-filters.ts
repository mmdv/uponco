import type { Appointment } from '@/types';

/** The toolbar's facet filters, as arrays of stringified ids. */
type FacetFilters = {
    locationIds: string[];
    serviceIds: string[];
    specialistIds: string[];
};

/**
 * Apply the toolbar facet filters (location, service, specialist), preserving
 * the input order. Appointments arrive ordered ascending by start, so the
 * result stays chronological for every view to slice by date.
 */
export function filterAppointments(
    appointments: Appointment[],
    filters: FacetFilters,
): Appointment[] {
    return appointments.filter((appointment) => {
        if (
            filters.locationIds.length > 0 &&
            !filters.locationIds.includes(String(appointment.location_id))
        ) {
            return false;
        }

        if (
            filters.serviceIds.length > 0 &&
            !filters.serviceIds.includes(String(appointment.service_id))
        ) {
            return false;
        }

        if (
            filters.specialistIds.length > 0 &&
            !filters.specialistIds.includes(String(appointment.specialist_id))
        ) {
            return false;
        }

        return true;
    });
}
