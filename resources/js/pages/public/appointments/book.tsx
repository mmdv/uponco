import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { PublicBookingFlow } from '@/components/public-booking/booking-flow';
import type { PublicBookingProps } from '@/components/public-booking/booking-flow';
import type { PublicTheme } from '@/components/public-booking/booking-header';

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

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export default function PublicAppointmentBooking(props: PublicBookingProps) {
    const [theme, setTheme] = useState<PublicTheme>(readStoredTheme);

    // Apply and persist the visitor's chosen theme for the public page.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        root.style.colorScheme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    return (
        <div className="flex min-h-svh w-full justify-center bg-muted/30">
            <Head title={`Book an appointment · ${props.company.name}`} />

            <div className="flex w-full max-w-[460px] flex-col">
                <PublicBookingFlow
                    {...props}
                    theme={theme}
                    onThemeChange={setTheme}
                />
            </div>
        </div>
    );
}
