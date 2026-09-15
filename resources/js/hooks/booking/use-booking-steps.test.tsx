// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useBookingSteps } from '@/hooks/booking/use-booking-steps';

describe('useBookingSteps', () => {
    it('advances forward and remembers the furthest step reached', () => {
        const { result } = renderHook(() => useBookingSteps());

        expect(result.current.step).toBe(0);

        act(() => result.current.goToStep(1));
        expect(result.current.step).toBe(1);
        expect(result.current.direction).toBe('forward');
        expect(result.current.maxStepRef.current).toBe(1);

        act(() => result.current.goToStep(2));
        act(() => result.current.goToStep(1));
        expect(result.current.step).toBe(1);
        expect(result.current.direction).toBe('back');
        // The high-water mark only ever climbs, so stepping back keeps it at 2.
        expect(result.current.maxStepRef.current).toBe(2);
    });

    it('resets to the first step and clears the high-water mark', () => {
        const { result } = renderHook(() => useBookingSteps());

        act(() => result.current.goToStep(2));
        act(() => result.current.resetSteps());

        expect(result.current.step).toBe(0);
        expect(result.current.maxStepRef.current).toBe(0);
    });
});
