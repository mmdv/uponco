import type { CurrencyCode } from '@/types';

export const DEFAULT_CURRENCY: CurrencyCode = 'EUR';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    EUR: '€',
    USD: '$',
    AZN: '₼',
};

/** Currency to preselect for a new service, based on the active UI language. */
const LOCALE_CURRENCIES: Record<string, CurrencyCode> = {
    az: 'AZN',
};

const amountFormatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

/** The symbol shown beside an amount, falling back to the raw code. */
export function currencySymbol(currency: CurrencyCode): string {
    return CURRENCY_SYMBOLS[currency] ?? currency;
}

/** Format a bare amount with its currency symbol, e.g. `€50`. */
export function formatAmount(
    amount: string | number,
    currency: CurrencyCode,
): string {
    return `${currencySymbol(currency)}${amountFormatter.format(Number(amount))}`;
}

/**
 * The currency a new service should start with. Mirrors `Currency::forLocale()`
 * on the server so an unchanged form round-trips to the same value.
 */
export function defaultCurrencyForLocale(locale: string): CurrencyCode {
    return LOCALE_CURRENCIES[locale] ?? DEFAULT_CURRENCY;
}
