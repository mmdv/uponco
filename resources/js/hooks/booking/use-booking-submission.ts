import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';

import type { CustomerDetails } from '@/components/public-booking/step-details';
import type { CaptureBookingEvent } from '@/hooks/booking/use-booking-analytics';
import type {
    BookingErrors,
    CustomerDetailsState,
} from '@/hooks/booking/use-customer-details';
import { buildCalendarEvent, buildSummary, REMINDER_NONE } from '@/lib/booking';
import type { ConfirmedSummary } from '@/lib/booking';
import { submitErrorCategory } from '@/lib/booking-analytics';
import { store } from '@/routes/public/appointments';
import type {
    AppointmentLocationDetail,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

type Selection = {
    serviceId: number | null;
    locationId: number | null;
    specialistId: number | null;
    selectedService: AppointmentServiceOption | null;
    selectedSpecialist: AppointmentSpecialistOption | null;
    selectedLocation: AppointmentLocationDetail | null;
    requiresLocation: boolean;
};

type Slot = {
    date: string;
    selectedStart: string;
    selectedEnd: string;
};

type Params = {
    company: { name: string; slug: string };
    timezone: string;
    selection: Selection;
    slot: Slot;
    details: CustomerDetails;
    validate: CustomerDetailsState['validate'];
    setErrors: CustomerDetailsState['setErrors'];
    captureBookingEvent: CaptureBookingEvent;
    goToStep: (next: number) => void;
    /** Drop the on-screen day from the cache and refetch it after a stale slot. */
    recoverStaleSlot: (
        service: number,
        specialist: number,
        day: string,
    ) => void;
};

/**
 * Owns the final submission: the recap the UI shows, the POST to the server and
 * the confirmation it turns into. The failure branches send the visitor back to
 * whichever step can fix the problem.
 */
export function useBookingSubmission({
    company,
    timezone,
    selection,
    slot,
    details,
    validate,
    setErrors,
    captureBookingEvent,
    goToStep,
    recoverStaleSlot,
}: Params) {
    const [processing, setProcessing] = useState(false);
    const [confirmed, setConfirmed] = useState<ConfirmedSummary | null>(null);
    // `processing` is state, so it only disables the button on the next render.
    // A fast double-tap lands inside that gap, so the guard that actually stops
    // a duplicate POST has to be a ref we can read and set synchronously.
    const submittingRef = useRef(false);

    const summary = buildSummary({
        service: selection.selectedService,
        specialist: selection.selectedSpecialist,
        location: selection.selectedLocation,
        requiresLocation: selection.requiresLocation,
        start: slot.selectedStart,
        end: slot.selectedEnd,
        timezone,
    });

    const calendarEvent = buildCalendarEvent({
        service: selection.selectedService,
        specialist: selection.selectedSpecialist,
        location: selection.selectedLocation,
        requiresLocation: selection.requiresLocation,
        companyName: company.name,
        start: slot.selectedStart,
        end: slot.selectedEnd,
        notes: details.notes,
    });

    const handleSubmit = () => {
        // Two guards before anything leaves the browser. The POST is rate
        // limited at 10/min, and a rejected submission round-trips in
        // milliseconds, so without these an impatient visitor can spend the
        // whole budget and get a 429 that reads like a crash.
        if (submittingRef.current) {
            return;
        }

        const detailErrors = validate();
        const invalidFields = Object.keys(detailErrors);

        // Logged for every attempt, before the client-side validation guard —
        // otherwise a visitor who fills the form, trips a field error and gives
        // up never reaches the server and stays invisible to the funnel. The
        // `valid` flag and offending fields say which field breaks people.
        captureBookingEvent('public_booking_submit_attempted', {
            valid: invalidFields.length === 0,
            invalid_fields: invalidFields,
        });

        if (invalidFields.length > 0) {
            setErrors(detailErrors);

            return;
        }

        submittingRef.current = true;

        const { reminder_offset_minutes, ...customer } = details;

        router.post(
            store.url(company.slug),
            {
                service_id: selection.serviceId,
                location_id: selection.locationId,
                specialist_id: selection.specialistId,
                start_at: slot.selectedStart,
                ...customer,
                // The "don't remind me" choice becomes a null the server reads
                // as no reminder; any other choice is the lead time in minutes.
                reminder_offset_minutes:
                    reminder_offset_minutes === REMINDER_NONE
                        ? null
                        : Number(reminder_offset_minutes),
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setProcessing(true),
                onError: (formErrors: BookingErrors) => {
                    setErrors(formErrors);

                    // A submission the server rejected. The category separates a
                    // slot taken out from under the visitor and a stale selection
                    // (both bounce them back a step) from ordinary validation.
                    captureBookingEvent('public_booking_submit_error', {
                        category: submitErrorCategory(
                            formErrors as Record<string, string>,
                        ),
                    });

                    if (
                        formErrors.service_id ||
                        formErrors.specialist_id ||
                        formErrors.location_id
                    ) {
                        goToStep(0);
                    } else if (formErrors.start_at) {
                        // The slot list on screen is now known to be stale
                        // (e.g. the slot was just taken), so drop this day from
                        // the cache and refetch its window before returning.
                        if (
                            selection.serviceId !== null &&
                            selection.specialistId !== null &&
                            slot.date !== ''
                        ) {
                            recoverStaleSlot(
                                selection.serviceId,
                                selection.specialistId,
                                slot.date,
                            );
                        }

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
                onFinish: () => {
                    submittingRef.current = false;
                    setProcessing(false);
                },
            },
        );
    };

    const resetSubmission = () => {
        setConfirmed(null);
        submittingRef.current = false;
        setProcessing(false);
    };

    return {
        processing,
        confirmed,
        summary,
        calendarEvent,
        handleSubmit,
        resetSubmission,
    };
}
