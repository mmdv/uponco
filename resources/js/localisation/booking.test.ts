import { describe, expect, it } from 'vitest';

import { translations } from '@/localisation';

/** Collect every dot-path leaf key in a nested translation tree. */
function leafKeys(tree: unknown, prefix = ''): string[] {
    if (tree === null || typeof tree !== 'object') {
        return [prefix];
    }

    return Object.entries(tree as Record<string, unknown>).flatMap(
        ([key, value]) => leafKeys(value, prefix ? `${prefix}.${key}` : key),
    );
}

describe('booking localisation', () => {
    const en = translations.en?.booking;
    const az = translations.az?.booking;

    it('ships the booking namespace for both locales', () => {
        expect(en).toBeDefined();
        expect(az).toBeDefined();
    });

    it('keeps the Azerbaijani keys in parity with English', () => {
        expect(leafKeys(az).sort()).toEqual(leafKeys(en).sort());
    });

    it('actually translates every string rather than leaving English', () => {
        const flatten = (tree: unknown): Record<string, string> =>
            Object.fromEntries(
                leafKeys(tree).map((key) => [
                    key,
                    key
                        .split('.')
                        .reduce<unknown>(
                            (node, part) =>
                                (node as Record<string, unknown>)?.[part],
                            tree,
                        ) as string,
                ]),
            );

        const englishStrings = flatten(en);
        const azStrings = flatten(az);

        // Proper nouns, brand names and short forms that genuinely coincide
        // across locales (e.g. the Azerbaijani abbreviations for Mart/Aprel/May)
        // can legitimately match their English source.
        const allowedIdentical = new Set([
            'success.google',
            'success.apple',
            'datetime.months.2',
            'datetime.months.3',
            'datetime.months.4',
            'datetime.monthsLong.4',
        ]);

        for (const [key, english] of Object.entries(englishStrings)) {
            if (allowedIdentical.has(key)) {
                continue;
            }

            expect(
                azStrings[key],
                `booking.${key} is not translated into Azerbaijani`,
            ).not.toBe(english);
        }
    });
});
