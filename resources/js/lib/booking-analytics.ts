import { daysBetween } from '@/lib/booking';
import type { BookingPreset } from '@/lib/booking';

/**
 * The segmentation properties every public-booking funnel event carries, so a
 * drop-off can be sliced by deep-link vs. manual arrival and by how much choice
 * the visitor faced. Built once per visit from values that never change within
 * it; the per-event, changing values (selection ids, step, day) are merged in
 * at capture time.
 */
export type BookingFunnelBase = {
    company: string;
    /** Arrived via a deep link that pinned a service, specialist or location. */
    preselected: boolean;
    service_count: number;
    specialist_count: number;
    location_count: number;
};

export function bookingFunnelBase(params: {
    company: string;
    preset: BookingPreset | null;
    serviceCount: number;
    specialistCount: number;
    locationCount: number;
}): BookingFunnelBase {
    return {
        company: params.company,
        preselected: params.preset !== null,
        service_count: params.serviceCount,
        specialist_count: params.specialistCount,
        location_count: params.locationCount,
    };
}

/**
 * How many calendar days out from the start of the day strip a chosen day sits.
 * The strip always begins at today, so this reads as "days from now". Null when
 * there is no strip yet or no day is chosen.
 */
export function bookingDayOffset(
    upcomingDays: { date: string }[],
    date: string,
): number | null {
    const first = upcomingDays[0]?.date;

    if (first === undefined || date === '') {
        return null;
    }

    return daysBetween(first, date);
}

/** Why a submission the server rejected failed, for the submit-error event. */
export type SubmitErrorCategory =
    'slot_taken' | 'selection' | 'validation' | 'other';

/**
 * Classify Inertia's returned form errors into a single funnel reason. The slot
 * being taken and the selection going stale send the visitor back a step, so
 * they are the failures worth separating from ordinary field validation.
 */
export function submitErrorCategory(
    errors: Record<string, string>,
): SubmitErrorCategory {
    if (errors.start_at) {
        return 'slot_taken';
    }

    if (errors.service_id || errors.specialist_id || errors.location_id) {
        return 'selection';
    }

    if (Object.keys(errors).length > 0) {
        return 'validation';
    }

    return 'other';
}
