/**
 * design-sync shim for `@/localisation`.
 *
 * The real module builds its tree with Vite's `import.meta.glob`, which esbuild
 * cannot evaluate — under the IIFE bundle it becomes `{}.glob(...)` and throws at
 * module init, taking the whole design-system bundle down. This shim imports the
 * same JSON files statically so previews render real copy instead of raw keys.
 *
 * Wired via `compilerOptions.paths` in .design-sync/tsconfig.ds-sync.json. Imports
 * are relative on purpose: esbuild does not apply tsconfig `paths` to files it
 * reaches through node_modules, and the package dir is a symlink into this repo.
 * Regenerate when a locale or namespace is added.
 */
type TranslationTree = Record<string, unknown>;
type LocaleBundle = Record<string, TranslationTree>;

export type Translations = Record<string, LocaleBundle>;

import en_appointments from "../../resources/js/localisation/en/appointments.json";
import en_auth from "../../resources/js/localisation/en/auth.json";
import en_booking from "../../resources/js/localisation/en/booking.json";
import en_company from "../../resources/js/localisation/en/company.json";
import en_customers from "../../resources/js/localisation/en/customers.json";
import en_dashboard from "../../resources/js/localisation/en/dashboard.json";
import en_data from "../../resources/js/localisation/en/data.json";
import en_features from "../../resources/js/localisation/en/features.json";
import en_legal from "../../resources/js/localisation/en/legal.json";
import en_locations from "../../resources/js/localisation/en/locations.json";
import en_nav from "../../resources/js/localisation/en/nav.json";
import en_notifications from "../../resources/js/localisation/en/notifications.json";
import en_pricing from "../../resources/js/localisation/en/pricing.json";
import en_schedule from "../../resources/js/localisation/en/schedule.json";
import en_settings from "../../resources/js/localisation/en/settings.json";
import en_welcome from "../../resources/js/localisation/en/welcome.json";
import az_appointments from "../../resources/js/localisation/az/appointments.json";
import az_auth from "../../resources/js/localisation/az/auth.json";
import az_booking from "../../resources/js/localisation/az/booking.json";
import az_company from "../../resources/js/localisation/az/company.json";
import az_customers from "../../resources/js/localisation/az/customers.json";
import az_dashboard from "../../resources/js/localisation/az/dashboard.json";
import az_data from "../../resources/js/localisation/az/data.json";
import az_features from "../../resources/js/localisation/az/features.json";
import az_legal from "../../resources/js/localisation/az/legal.json";
import az_locations from "../../resources/js/localisation/az/locations.json";
import az_nav from "../../resources/js/localisation/az/nav.json";
import az_notifications from "../../resources/js/localisation/az/notifications.json";
import az_pricing from "../../resources/js/localisation/az/pricing.json";
import az_schedule from "../../resources/js/localisation/az/schedule.json";
import az_settings from "../../resources/js/localisation/az/settings.json";
import az_welcome from "../../resources/js/localisation/az/welcome.json";

export const translations: Translations = {
    en: {
        "appointments": en_appointments as TranslationTree,
        "auth": en_auth as TranslationTree,
        "booking": en_booking as TranslationTree,
        "company": en_company as TranslationTree,
        "customers": en_customers as TranslationTree,
        "dashboard": en_dashboard as TranslationTree,
        "data": en_data as TranslationTree,
        "features": en_features as TranslationTree,
        "legal": en_legal as TranslationTree,
        "locations": en_locations as TranslationTree,
        "nav": en_nav as TranslationTree,
        "notifications": en_notifications as TranslationTree,
        "pricing": en_pricing as TranslationTree,
        "schedule": en_schedule as TranslationTree,
        "settings": en_settings as TranslationTree,
        "welcome": en_welcome as TranslationTree,
    },
    az: {
        "appointments": az_appointments as TranslationTree,
        "auth": az_auth as TranslationTree,
        "booking": az_booking as TranslationTree,
        "company": az_company as TranslationTree,
        "customers": az_customers as TranslationTree,
        "dashboard": az_dashboard as TranslationTree,
        "data": az_data as TranslationTree,
        "features": az_features as TranslationTree,
        "legal": az_legal as TranslationTree,
        "locations": az_locations as TranslationTree,
        "nav": az_nav as TranslationTree,
        "notifications": az_notifications as TranslationTree,
        "pricing": az_pricing as TranslationTree,
        "schedule": az_schedule as TranslationTree,
        "settings": az_settings as TranslationTree,
        "welcome": az_welcome as TranslationTree,
    },
};
