import { useCallback, useEffect, useState } from 'react';

import type { PublicTheme } from '@/components/public-booking/booking-header';

/**
 * The public pages keep their own light/dark preference, separate from the
 * dashboard's appearance so a visitor's choice never affects the team's user.
 */
const THEME_STORAGE_KEY = 'public-booking-appearance';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** The visitor's saved choice, or null while they haven't made one. */
function readStoredTheme(): PublicTheme | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    return stored === 'dark' || stored === 'light' ? stored : null;
}

function readSystemTheme(): PublicTheme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/**
 * The theme a public page renders in: the visitor's own choice when they have
 * made one, and otherwise whatever their system asks for — followed live, so
 * an OS switch to dark reaches a page that is already open.
 */
export function usePublicTheme(): {
    theme: PublicTheme;
    setTheme: (theme: PublicTheme) => void;
} {
    const [preference, setPreference] = useState<PublicTheme | null>(
        readStoredTheme,
    );
    const [systemTheme, setSystemTheme] =
        useState<PublicTheme>(readSystemTheme);

    const theme = preference ?? systemTheme;

    // Follow the system preference for as long as the visitor hasn't overridden
    // it. The listener stays attached either way; `preference` simply wins.
    useEffect(() => {
        const query = window.matchMedia(DARK_QUERY);
        const handleChange = (event: MediaQueryListEvent) =>
            setSystemTheme(event.matches ? 'dark' : 'light');

        query.addEventListener('change', handleChange);

        return () => query.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        root.classList.toggle('dark', theme === 'dark');
        root.style.colorScheme = theme;
    }, [theme]);

    // Only an explicit choice is persisted; the system default is never
    // written, or the page would pin itself to whatever it happened to
    // resolve to on the first visit.
    const setTheme = useCallback((next: PublicTheme) => {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
        setPreference(next);
    }, []);

    return { theme, setTheme };
}
