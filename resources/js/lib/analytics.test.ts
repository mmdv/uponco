import { describe, expect, it } from 'vitest';

import type { AnalyticsEvent } from '@/lib/analytics';
import {
    pageviewProperties,
    resolveConsent,
    resolvePersistence,
    shouldShowConsentBanner,
    unseenEvents,
} from '@/lib/analytics';

function event(id: string): AnalyticsEvent {
    return { id, name: 'signup_completed', properties: {} };
}

describe('resolveConsent', () => {
    it('accepts the decisions we store', () => {
        expect(resolveConsent('granted')).toBe('granted');
        expect(resolveConsent('denied')).toBe('denied');
    });

    it('ignores missing or unrecognised values', () => {
        expect(resolveConsent(null)).toBeNull();
        expect(resolveConsent('')).toBeNull();
        expect(resolveConsent('true')).toBeNull();
    });
});

describe('resolvePersistence', () => {
    it('only uses cookies once consent is granted', () => {
        expect(resolvePersistence(false, 'granted')).toBe(
            'localStorage+cookie',
        );
        expect(resolvePersistence(false, null)).toBe('memory');
        expect(resolvePersistence(false, 'denied')).toBe('memory');
    });

    it('stays cookieless in an embedded widget even when consent is granted', () => {
        expect(resolvePersistence(true, 'granted')).toBe('memory');
        expect(resolvePersistence(true, null)).toBe('memory');
    });
});

describe('shouldShowConsentBanner', () => {
    it('asks once, only where a cookie could be set', () => {
        expect(shouldShowConsentBanner(true, false, null)).toBe(true);
    });

    it('stays hidden once the visitor has decided', () => {
        expect(shouldShowConsentBanner(true, false, 'granted')).toBe(false);
        expect(shouldShowConsentBanner(true, false, 'denied')).toBe(false);
    });

    it('stays hidden when embedded or when analytics is not configured', () => {
        expect(shouldShowConsentBanner(true, true, null)).toBe(false);
        expect(shouldShowConsentBanner(false, false, null)).toBe(false);
    });
});

describe('unseenEvents', () => {
    it('drops events that were already captured', () => {
        const seen = new Set(['a']);

        expect(unseenEvents([event('a'), event('b')], seen)).toEqual([
            event('b'),
        ]);
    });

    it('keeps every event when none have been seen', () => {
        expect(unseenEvents([event('a'), event('b')], new Set())).toHaveLength(
            2,
        );
    });
});

describe('pageviewProperties', () => {
    it('always reports the page component', () => {
        expect(
            pageviewProperties({ component: 'dashboard', props: {} }),
        ).toEqual({ component: 'dashboard' });
    });

    it('attributes company scoped pages so public traffic can be split per company', () => {
        expect(
            pageviewProperties({
                component: 'public/appointments/book',
                props: { company: { slug: 'acme-salon' } },
            }),
        ).toEqual({
            component: 'public/appointments/book',
            company: 'acme-salon',
        });
    });

    it('ignores a company prop without a usable slug', () => {
        expect(
            pageviewProperties({
                component: 'public/appointments/book',
                props: { company: { name: 'Acme' } },
            }),
        ).toEqual({ component: 'public/appointments/book' });
    });
});
