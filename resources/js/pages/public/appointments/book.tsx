import { Head, Link } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PublicBookingFlow } from '@/components/public-booking/booking-flow';
import type { PublicBookingProps } from '@/components/public-booking/booking-flow';
import type { PublicTheme } from '@/components/public-booking/booking-header';
import { Button } from '@/components/ui/button';
import { brandStyle } from '@/lib/brand';
import { dashboard } from '@/routes';

type PageProps = PublicBookingProps & {
    /** True when the signed-in visitor is a member of this company. */
    canManage?: boolean;
};

// The public page keeps its own light/dark preference, separate from the
// dashboard's appearance so a visitor's choice never affects the team's user.
const THEME_STORAGE_KEY = 'public-booking-appearance';

function readStoredTheme(): PublicTheme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'dark' || stored === 'light') {
        return stored;
    }

    // Light is the default look everywhere, regardless of the OS preference;
    // the visitor can still switch the page to dark.
    return 'light';
}

export default function PublicAppointmentBooking({
    canManage = false,
    ...props
}: PageProps) {
    const [theme, setTheme] = useState<PublicTheme>(readStoredTheme);

    // Apply and persist the visitor's chosen theme for the public page.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        root.style.colorScheme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    return (
        <div
            className="flex min-h-svh w-full justify-center bg-muted/30"
            style={brandStyle(props.company.brand)}
        >
            <Head title={`Book an appointment · ${props.company.name}`} />

            <div className="flex w-full max-w-[460px] flex-col">
                {canManage && (
                    <div className="flex items-center justify-between gap-3 px-5 pt-3">
                        <span className="text-xs text-muted-foreground">
                            You're viewing your booking page
                        </span>
                        <Button asChild size="sm" variant="outline">
                            <Link href={dashboard.url()}>
                                <LayoutDashboard />
                                Go to dashboard
                            </Link>
                        </Button>
                    </div>
                )}

                <PublicBookingFlow
                    {...props}
                    theme={theme}
                    onThemeChange={setTheme}
                />
            </div>
        </div>
    );
}
