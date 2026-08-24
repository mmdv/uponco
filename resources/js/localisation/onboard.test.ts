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

describe('onboard localisation', () => {
    const en = translations.en?.onboard;
    const az = translations.az?.onboard;

    it('ships the onboard namespace for both locales', () => {
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

        for (const [key, english] of Object.entries(englishStrings)) {
            expect(
                azStrings[key],
                `onboard.${key} is not translated into Azerbaijani`,
            ).not.toBe(english);
        }
    });
});
