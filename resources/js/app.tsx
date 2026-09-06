import './sentry';

import { createInertiaApp, router } from '@inertiajs/react';
import { toast } from 'sonner';
import PullToRefresh from '@/components/pull-to-refresh';
import PwaUpdatePrompt from '@/components/pwa-update-prompt';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { FALLBACK_LOCALE, translate } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import BusinessLayout from '@/layouts/business/layout';
import SettingsLayout from '@/layouts/settings/layout';
import {
    flushServerEvents,
    startAnalytics,
    trackPageVisit,
} from '@/lib/analytics';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// The whole app scrolls inside #app (body is `overflow: hidden`), so tell
// Inertia to treat it as a scroll region. Otherwise Inertia only resets the
// window scroll — which never moves here — and every client-side visit keeps
// the previous page's scroll position.
//
// Guarded because this module is also evaluated in Node when Inertia warms up
// its SSR module graph, where there is no `document`.
if (typeof document !== 'undefined') {
    document.getElementById('app')?.setAttribute('scroll-region', '');
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name === 'pricing':
                return null;
            case name === 'features':
                return null;
            case name === 'your-data':
                return null;
            case name.startsWith('public/'):
                return null;
            case name.startsWith('legal/'):
                return null;
            case name === 'onboard':
                return AuthLayout;
            // The setup flow owns the whole screen; the app shell would only
            // eat vertical space it needs on a phone.
            case name === 'onboarding':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name === 'company/business/members/edit':
                return AppLayout;
            case name.startsWith('company/business/'):
                return [AppLayout, BusinessLayout];
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app, { ssr, page }) {
        if (ssr) {
            return app;
        }

        // Inertia's `navigate` event covers later visits but not this first
        // one, so the initial pageview is captured from the page we boot with.
        startAnalytics(page);

        // These extras are client-only: the SSR pass renders `app` alone, so
        // each must emit no DOM at first paint or hydration mismatches. The
        // Toaster gates itself to mount; PullToRefresh renders nothing until a
        // gesture. PwaUpdatePrompt registers the service worker (which handles
        // both push and offline caching) and only ever renders a toast.
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <PullToRefresh />
                <PwaUpdatePrompt />
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
        // Default is 250ms, which leaves a "dead" pause after a tap before any
        // feedback shows. Surface the bar almost immediately instead.
        delay: 50,
    },
});

router.on('navigate', (event) => {
    trackPageVisit(event.detail.page);
});

// Dashboard and Appointments are served from the service-worker cache offline,
// but every other page needs the network. When a visit fails purely because we
// are offline, tell the user why and leave them on the working page they came
// from rather than surfacing a raw error.
router.on('networkError', () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const locale =
            (typeof document !== 'undefined' && document.documentElement.lang) ||
            FALLBACK_LOCALE;

        toast.error(translate('nav', 'offline.unavailable', locale));
    }
});

// Flush server-queued events on every page set, including the same-URL
// redirect-back that carries validation errors (e.g. a booking whose slot was
// taken between load and submit). That response never fires `navigate`, so
// `trackPageVisit` alone would drop its `public_booking_slot_unavailable` event.
router.on('beforeUpdate', (event) => {
    flushServerEvents(event.detail.page);
});

// This will set light / dark mode on load...
initializeTheme();
