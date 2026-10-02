// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({ props: { locale: 'en', availableLocales: [] } }),
}));

import { useCustomerDetails } from '@/hooks/booking/use-customer-details';

describe('useCustomerDetails', () => {
    it('updates a field and clears that field error', () => {
        const { result } = renderHook(() => useCustomerDetails());

        act(() => result.current.setErrors({ customer_name: 'Required' }));
        act(() => result.current.handleDetailChange('customer_name', 'Ada'));

        expect(result.current.details.customer_name).toBe('Ada');
        expect(result.current.errors.customer_name).toBeUndefined();
    });

    it('clears the session booking conflict when a contact field is edited', () => {
        const { result } = renderHook(() => useCustomerDetails());

        act(() =>
            result.current.setErrors({ booking_conflict: 'Already booked' }),
        );
        act(() =>
            result.current.handleDetailChange('customer_email', 'a@b.co'),
        );

        expect(result.current.errors.booking_conflict).toBeUndefined();
    });

    it('validates the required fields on empty details', () => {
        const { result } = renderHook(() => useCustomerDetails());

        const errors = result.current.validate();

        expect(errors.customer_name).toBeDefined();
    });

    it('clears only the named errors', () => {
        const { result } = renderHook(() => useCustomerDetails());

        act(() =>
            result.current.setErrors({
                start_at: 'Taken',
                service_id: 'Gone',
                customer_name: 'Required',
            }),
        );
        act(() => result.current.clearErrors(['start_at', 'service_id']));

        expect(result.current.errors).toEqual({ customer_name: 'Required' });
    });
});
