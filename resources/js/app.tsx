import { createInertiaApp, router } from '@inertiajs/react';
import ConsentBanner from '@/components/analytics/consent-banner';
import PullToRefresh from '@/components/pull-to-refresh';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import BusinessLayout from '@/layouts/business/layout';
import SettingsLayout from '@/layouts/settings/layout';
import { startAnalytics, trackPageVisit } from '@/lib/analytics';
import { registerServiceWorker } from '@/lib/push';

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

        // The service worker only handles push notifications — it caches
        // nothing — so registering it on every load is cheap and keeps an
        // installed PWA able to receive notifications while it is closed.
        registerServiceWorker();

        // These extras are client-only: the SSR pass renders `app` alone, so
        // each must emit no DOM at first paint or hydration mismatches. The
        // Toaster gates itself to mount; PullToRefresh and ConsentBanner render
        // nothing until a gesture / consent decision.
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <PullToRefresh />
                <ConsentBanner />
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

// This will set light / dark mode on load...
initializeTheme();
