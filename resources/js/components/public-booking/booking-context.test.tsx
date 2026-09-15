// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useBooking } from '@/components/public-booking/booking-context';

// Keep the throw path isolated from the flow the provider would run.
vi.mock('@/hooks/use-appointment-booking', () => ({
    useAppointmentBooking: () => ({}),
}));

describe('useBooking', () => {
    it('throws when used outside a BookingProvider', () => {
        expect(() => renderHook(() => useBooking())).toThrow(
            /must be used within a BookingProvider/,
        );
    });
});
