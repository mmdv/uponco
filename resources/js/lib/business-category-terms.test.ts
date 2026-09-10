import { describe, expect, it } from 'vitest';

import { customerTermKey } from '@/lib/business-category-terms';

describe('customerTermKey', () => {
    it('maps medical, beauty, wellness and professional categories to "client"', () => {
        expect(customerTermKey('medical_clinic')).toBe('client');
        expect(customerTermKey('veterinary_clinic')).toBe('client');
        expect(customerTermKey('beauty_salon')).toBe('client');
        expect(customerTermKey('psychologist')).toBe('client');
        expect(customerTermKey('legal_services')).toBe('client');
    });

    it('maps education categories to "student"', () => {
        expect(customerTermKey('private_tutoring')).toBe('student');
        expect(customerTermKey('driving_school')).toBe('student');
    });

    it('falls back to "customer" for home/auto, other, unknown and missing', () => {
        expect(customerTermKey('car_wash')).toBe('customer');
        expect(customerTermKey('other')).toBe('customer');
        expect(customerTermKey('not_a_real_category')).toBe('customer');
        expect(customerTermKey(null)).toBe('customer');
        expect(customerTermKey(undefined)).toBe('customer');
    });
});
