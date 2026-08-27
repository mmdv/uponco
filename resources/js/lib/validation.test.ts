import { describe, expect, it } from 'vitest';

import {
    email,
    firstErrors,
    minLength,
    required,
    requiredWithout,
} from '@/lib/validation';

describe('required', () => {
    it('accepts a value with content', () => {
        expect(required('Jane')).toBe(true);
    });

    it('rejects empty, whitespace-only, null and undefined', () => {
        expect(required('')).toBe(false);
        expect(required('   ')).toBe(false);
        expect(required('\n\t')).toBe(false);
        expect(required(null)).toBe(false);
        expect(required(undefined)).toBe(false);
    });
});

describe('requiredWithout', () => {
    it('passes when this field is filled', () => {
        expect(requiredWithout('jane@example.com', '')).toBe(true);
    });

    it('passes when the other field is filled', () => {
        expect(requiredWithout('', '+994 12 555 00 11')).toBe(true);
    });

    it('fails only when both are empty', () => {
        expect(requiredWithout('', '')).toBe(false);
        expect(requiredWithout('  ', null)).toBe(false);
    });
});

describe('email', () => {
    it('accepts ordinary addresses', () => {
        expect(email('jane@example.com')).toBe(true);
        expect(email('jane.doe+tag@sub.example.co.uk')).toBe(true);
        expect(email('  jane@example.com  ')).toBe(true);
    });

    it('rejects what the browser would also reject', () => {
        expect(email('jane')).toBe(false);
        expect(email('jane@')).toBe(false);
        expect(email('jane@example')).toBe(false);
        expect(email('jane doe@example.com')).toBe(false);
        expect(email('')).toBe(false);
    });
});

describe('minLength', () => {
    it('counts the trimmed value', () => {
        expect(minLength('password', 8)).toBe(true);
        expect(minLength('  password  ', 8)).toBe(true);
        expect(minLength('short', 8)).toBe(false);
        expect(minLength(null, 1)).toBe(false);
    });
});

describe('firstErrors', () => {
    it('returns an empty bag when everything passes', () => {
        expect(
            firstErrors([
                { field: 'name', passes: true, message: 'Name is required.' },
            ]),
        ).toEqual({});
    });

    it('keys messages by field, Inertia-style', () => {
        expect(
            firstErrors([
                { field: 'name', passes: false, message: 'Name is required.' },
                { field: 'email', passes: true, message: 'Email is invalid.' },
                {
                    field: 'phone',
                    passes: false,
                    message: 'Phone is required.',
                },
            ]),
        ).toEqual({
            name: 'Name is required.',
            phone: 'Phone is required.',
        });
    });

    it('keeps the first failure for a field, like Laravel', () => {
        expect(
            firstErrors([
                {
                    field: 'email',
                    passes: false,
                    message: 'Email is required.',
                },
                { field: 'email', passes: false, message: 'Email is invalid.' },
            ]),
        ).toEqual({ email: 'Email is required.' });
    });
});
