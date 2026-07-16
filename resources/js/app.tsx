import { createInertiaApp, router } from '@inertiajs/react';
import ConsentBanner from '@/components/analytics/consent-banner';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import BusinessLayout from '@/layouts/business/layout';
import SettingsLayout from '@/layouts/settings/layout';
import { startAnalytics, trackPageVisit } from '@/lib/analytics';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// The whole app scrolls inside #app (body is `overflow: hidden`), so tell
// Inertia to treat it as a scroll region. Otherwise Inertia only resets the
// window scroll — which never moves here — and every client-side visit keeps
// the previous page's scroll position.
document.getElementById('app')?.setAttribute('scroll-region', '');

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('public/'):
                return null;
            case name.startsWith('legal/'):
                return null;
            case name === 'onboard':
                return AuthLayout;
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

        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <ConsentBanner />
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

router.on('navigate', (event) => {
    trackPageVisit(event.detail.page);
});

// This will set light / dark mode on load...
initializeTheme();
