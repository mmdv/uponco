import { useMemo } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';
import { captureEvent } from '@/lib/analytics';
import type { BookingPreset } from '@/lib/booking';
import { bookingFunnelBase } from '@/lib/booking-analytics';

export type CaptureBookingEvent = (
    name: string,
    extra?: Record<string, unknown>,
) => void;

type Params = {
    company: { slug: string };
    preset: BookingPreset | null;
    serviceCount: number;
    specialistCount: number;
    locationCount: number;
    /** The live selection, merged into every event. */
    selection: {
        serviceId: number | null;
        specialistId: number | null;
        locationId: number | null;
    };
    maxStepRef: React.RefObject<number>;
};

/**
 * Builds the one `captureBookingEvent` every part of the flow uses, so each
 * funnel event carries the same segmentation props: the stable per-visit base
 * ({@link bookingFunnelBase}) plus the values that move as the visitor works
 * through the flow.
 */
export function useBookingAnalytics({
    company,
    preset,
    serviceCount,
    specialistCount,
    locationCount,
    selection,
    maxStepRef,
}: Params): CaptureBookingEvent {
    const isMobile = useIsMobile();

    const funnelBase = useMemo(
        () =>
            bookingFunnelBase({
                company: company.slug,
                preset,
                serviceCount,
                specialistCount,
                locationCount,
            }),
        [company.slug, preset, serviceCount, specialistCount, locationCount],
    );

    return (name, extra = {}) => {
        captureEvent(name, {
            ...funnelBase,
            service_id: selection.serviceId,
            specialist_id: selection.specialistId,
            location_id: selection.locationId,
            is_mobile: isMobile,
            step_reached: maxStepRef.current,
            ...extra,
        });
    };
}
