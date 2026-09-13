import { describe, expect, it } from 'vitest';

import { isCacheablePageRequest } from '@/lib/offline-page-cache';

const ORIGIN = 'https://uponco.com';

function request(path: string, headers: Record<string, string> = {}): Request {
    return new Request(`${ORIGIN}${path}`, { method: 'GET', headers });
}

describe('isCacheablePageRequest', () => {
    it('caches a plain calendar page visit', () => {
        const req = request('/calendar');

        expect(
            isCacheablePageRequest(new URL(req.url), req, ORIGIN),
        ).toBe(true);
    });

    it('caches the Inertia XHR variant of a cached page', () => {
        const req = request('/dashboard', { 'X-Inertia': 'true' });

        expect(
            isCacheablePageRequest(new URL(req.url), req, ORIGIN),
        ).toBe(true);
    });

    it('excludes Inertia partial reloads so they always hit the network', () => {
        const req = request('/calendar?date=2026-09-21&days=7', {
            'X-Inertia': 'true',
            'X-Inertia-Partial-Data': 'workingHoursWindow',
        });

        expect(
            isCacheablePageRequest(new URL(req.url), req, ORIGIN),
        ).toBe(false);
    });

    it('ignores pages outside the offline allow-list, incl. public booking', () => {
        for (const path of ['/customers', '/appointments/acme']) {
            const req = request(path);

            expect(
                isCacheablePageRequest(new URL(req.url), req, ORIGIN),
            ).toBe(false);
        }
    });

    it('ignores cross-origin requests', () => {
        const req = new Request('https://evil.example/calendar', {
            method: 'GET',
        });

        expect(
            isCacheablePageRequest(new URL(req.url), req, ORIGIN),
        ).toBe(false);
    });

    it('ignores non-GET requests', () => {
        const req = new Request(`${ORIGIN}/calendar`, { method: 'POST' });

        expect(
            isCacheablePageRequest(new URL(req.url), req, ORIGIN),
        ).toBe(false);
    });
});
