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

describe('welcome localisation', () => {
    const en = translations.en?.welcome;
    const az = translations.az?.welcome;

    it('ships the welcome namespace for both locales', () => {
        expect(en).toBeDefined();
        expect(az).toBeDefined();
    });

    it('keeps the Azerbaijani keys in parity with English', () => {
        expect(leafKeys(az).sort()).toEqual(leafKeys(en).sort());
    });

    it('ships the hero badge pieces the home page renders', () => {
        expect(leafKeys(en)).toEqual(
            expect.arrayContaining([
                'hero.badge.tag',
                'hero.badge.lead',
                'hero.badge.trail',
            ]),
        );
    });
});
