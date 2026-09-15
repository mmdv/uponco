import { useEffect, useRef } from 'react';

import { useBookingAnalytics } from '@/hooks/booking/use-booking-analytics';
import { useBookingSelection } from '@/hooks/booking/use-booking-selection';
import type { OnSelectionReplaced } from '@/hooks/booking/use-booking-selection';
import { useBookingSteps } from '@/hooks/booking/use-booking-steps';
import { useBookingSubmission } from '@/hooks/booking/use-booking-submission';
import { useCustomerDetails } from '@/hooks/booking/use-customer-details';
import { useSlotWindow } from '@/hooks/booking/use-slot-window';
import { resolveBookableDate } from '@/lib/booking';
import type { BookingPreset } from '@/lib/booking';
import { bookingDayOffset } from '@/lib/booking-analytics';
import type {
    AppointmentLocationDetail,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
} from '@/types';

export type {
    BookingSummary,
    ConfirmedSummary,
    EntryCard,
} from '@/lib/booking';

type Params = {
    company: { name: string; slug: string };
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationDetail[];
    specialists: AppointmentSpecialistOption[];
    /** Slots for a window of days keyed by `YYYY-MM-DD`, when the page shipped one. */
    slotWindow?: Record<string, AppointmentSlot[]>;
    preset: BookingPreset | null;
};

/**
 * Drives the public appointment booking flow by composing one hook per concern:
 * step navigation, the interdependent service/location/specialist selection,
 * slot loading, the customer details form, submission and funnel analytics.
 * Each concern lives in `@/hooks/booking`; this file only wires them together
 * and returns the flat view state the flow and its child components bind to.
 *
 * Choices that only have one possible answer — and anything a deep link pinned
 * — start out already made, and the flow reports which of them the visitor can
 * still change.
 */
export function useAppointmentBooking({
    company,
    timezone,
    services,
    locations,
    specialists,
    slotWindow,
    preset,
}: Params) {
    // The "started" end of the funnel is reaching the date & time screen.
    // Logged once per attempt; "book another" (which resets the flow) starts a
    // fresh count.
    const secondScreenLoggedRef = useRef(false);

    const steps = useBookingSteps();

    // Selection tells the slot hook when the selection is replaced, but the slot
    // hook is created after it — this ref bridges the one-frame gap. It is only
    // ever called from an event handler, long after both hooks have mounted.
    const slotBridgeRef = useRef<OnSelectionReplaced>(() => {});
    const selection = useBookingSelection({
        services,
        locations,
        specialists,
        preset,
        onSelectionReplaced: (next, poolChanged) =>
            slotBridgeRef.current(next, poolChanged),
    });

    const captureBookingEvent = useBookingAnalytics({
        company,
        preset,
        serviceCount: services.length,
        specialistCount: specialists.length,
        locationCount: locations.length,
        selection: {
            serviceId: selection.serviceId,
            specialistId: selection.specialistId,
            locationId: selection.locationId,
        },
        maxStepRef: steps.maxStepRef,
    });

    const slots = useSlotWindow({
        initialSelection: selection.initialSelection,
        slotWindow,
        upcomingDays: selection.upcomingDays,
        serviceId: selection.serviceId,
        specialistId: selection.specialistId,
        captureBookingEvent,
    });
    // Keep the bridge pointing at the latest callback. Written in an effect, not
    // during render: a selection change only ever fires from a user event, long
    // after the effect has run, so the ref is always current by then.
    useEffect(() => {
        slotBridgeRef.current = slots.onSelectionReplaced;
    });

    const details = useCustomerDetails();

    const submission = useBookingSubmission({
        company,
        timezone,
        selection: {
            serviceId: selection.serviceId,
            locationId: selection.locationId,
            specialistId: selection.specialistId,
            selectedService: selection.selectedService,
            selectedSpecialist: selection.selectedSpecialist,
            selectedLocation: selection.selectedLocation,
            requiresLocation: selection.requiresLocation,
        },
        slot: {
            date: slots.date,
            selectedStart: slots.selectedStart,
            selectedEnd: slots.selectedEnd,
        },
        details: details.details,
        validate: details.validate,
        setErrors: details.setErrors,
        captureBookingEvent,
        goToStep: steps.goToStep,
        recoverStaleSlot: slots.recoverStaleSlot,
    });

    const handleContinue = () => {
        if (steps.step === 0) {
            // Keep the chosen day only when the selected specialist can take it,
            // otherwise fall back to their closest bookable day. Serving the day
            // from cache (or fetching it) never leaves a previous specialist's
            // slots on screen, because changing the selection cleared the cache.
            const nextDate = resolveBookableDate(
                slots.date,
                selection.selectedSpecialist?.available_days ?? [],
            );

            slots.showSlotsForDay(
                selection.serviceId,
                selection.specialistId,
                nextDate,
            );

            if (!secondScreenLoggedRef.current) {
                secondScreenLoggedRef.current = true;
                captureBookingEvent('public_booking_second_screen');
            }

            steps.goToStep(1);

            return;
        }

        // Step 1 -> 2: reaching the details form. Splits a drop-off on the slot
        // picker from one on the form, and records how far out the chosen day
        // was and whether a time was picked before continuing.
        captureBookingEvent('public_booking_details_screen', {
            day_offset: bookingDayOffset(selection.upcomingDays, slots.date),
            slot_selected: slots.selectedStart !== '',
        });

        steps.goToStep(2);
    };

    const resetFlow = () => {
        submission.resetSubmission();
        selection.resetSelection();
        slots.resetSlots();
        details.resetDetails();
        steps.resetSteps();
        secondScreenLoggedRef.current = false;
    };

    return {
        // Wizard navigation
        step: steps.step,
        stepClass: steps.stepClass,
        goToStep: steps.goToStep,
        handleContinue,
        // Entry cards (step 0)
        openCard: selection.openCard,
        toggleCard: selection.toggleCard,
        serviceGroups: selection.serviceGroups,
        availableLocations: selection.availableLocations,
        availableSpecialists: selection.availableSpecialists,
        serviceId: selection.serviceId,
        locationId: selection.locationId,
        specialistId: selection.specialistId,
        selectedService: selection.selectedService,
        selectedLocation: selection.selectedLocation,
        selectedSpecialist: selection.selectedSpecialist,
        requiresLocation: selection.requiresLocation,
        /** Whether the location card belongs on screen at all. */
        locationVisible: selection.locationVisible,
        selectionComplete: selection.selectionComplete,
        locked: selection.locked,
        /** The order step one stacks its sections in. */
        order: selection.order,
        /** Nothing on step 0 is the visitor's to decide; it is a recap. */
        selectionIsFixed: selection.selectionIsFixed,
        handleServiceChange: selection.handleServiceChange,
        handleLocationChange: selection.handleLocationChange,
        handleSpecialistChange: selection.handleSpecialistChange,
        // Date & time (step 1)
        upcomingDays: selection.upcomingDays,
        date: slots.date,
        handleDateChange: slots.handleDateChange,
        availableSlots: slots.slots,
        slotsLoading: slots.slotsLoading,
        selectedStart: slots.selectedStart,
        handleSelectSlot: slots.handleSelectSlot,
        // Details (step 2)
        details: details.details,
        handleDetailChange: details.handleDetailChange,
        errors: details.errors,
        // Submission & summary
        summary: submission.summary,
        processing: submission.processing,
        confirmed: submission.confirmed,
        handleSubmit: submission.handleSubmit,
        resetFlow,
    };
}
