import { usePage } from '@inertiajs/react';
import { useSyncExternalStore } from 'react';

import { translations } from '@/localisation';

export const FALLBACK_LOCALE = 'en';

export type AvailableLocale = {
    code: string;
    name: string;
    native: string;
};

/** Interpolation values injected into `{placeholder}` tokens. */
export type Replacements = Record<string, string | number>;

// The locale the user picked this session. It overrides the server-resolved
// locale so switching is instant (translations are bundled client-side) without
// a full reload. `null` means "follow the server", which keeps SSR consistent.
const listeners = new Set<() => void>();
let overrideLocale: string | null = null;

const subscribe = (callback: () => void): (() => void) => {
    listeners.add(callback);

    return () => {
        listeners.delete(callback);
    };
};

const notify = (): void => listeners.forEach((listener) => listener());

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

/** Persist the chosen locale and re-render every subscriber immediately. */
export function setLocale(locale: string): void {
    overrideLocale = locale;

    // Persist so the server resolves the same locale on the next full load...
    setCookie('locale', locale);

    // Keep the document language in sync for accessibility and styling...
    if (typeof document !== 'undefined') {
        document.documentElement.lang = locale;
    }

    notify();
}

function resolveKey(
    locale: string,
    namespace: string,
    key: string,
): string | undefined {
    const tree = translations[locale]?.[namespace];

    if (!tree) {
        return undefined;
    }

    const value = key.split('.').reduce<unknown>((accumulator, part) => {
        if (accumulator && typeof accumulator === 'object') {
            return (accumulator as Record<string, unknown>)[part];
        }

        return undefined;
    }, tree);

    return typeof value === 'string' ? value : undefined;
}

export type UseLocaleReturn = {
    readonly locale: string;
    readonly availableLocales: AvailableLocale[];
    readonly setLocale: (locale: string) => void;
};

/** The active locale, the locales enabled for the UI, and the setter. */
export function useLocale(): UseLocaleReturn {
    const props = usePage().props;
    const serverLocale = (props.locale as string) ?? FALLBACK_LOCALE;
    const availableLocales = (props.availableLocales as AvailableLocale[]) ?? [];

    const override = useSyncExternalStore(
        subscribe,
        () => overrideLocale,
        () => null,
    );

    return {
        locale: override ?? serverLocale,
        availableLocales,
        setLocale,
    } as const;
}

export type TranslateFn = (key: string, replacements?: Replacements) => string;

export type UseTranslationReturn = {
    readonly t: TranslateFn;
    readonly locale: string;
};

/**
 * Returns a `t(key, replacements?)` translator scoped to a namespace (one JSON
 * file per page, e.g. `useTranslation('welcome')`). Keys use dot paths, missing
 * translations fall back to English then to the key itself, and `{tokens}` in
 * the string are replaced from `replacements`.
 */
export function useTranslation(namespace: string): UseTranslationReturn {
    const { locale } = useLocale();

    const t: TranslateFn = (key, replacements) => {
        const value =
            resolveKey(locale, namespace, key) ??
            resolveKey(FALLBACK_LOCALE, namespace, key) ??
            key;

        if (!replacements) {
            return value;
        }

        return value.replace(/\{(\w+)\}/g, (match, token: string) =>
            token in replacements ? String(replacements[token]) : match,
        );
    };

    return { t, locale } as const;
}
