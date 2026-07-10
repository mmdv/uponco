/**
 * Eagerly bundles every translation file under this folder. Files follow the
 * `{locale}/{namespace}.json` convention, so adding a language is as simple as
 * duplicating a locale folder and translating the JSON — it is picked up here
 * automatically with no registration.
 */
type TranslationTree = Record<string, unknown>;

/** namespace (e.g. "welcome") -> nested translation tree */
type LocaleBundle = Record<string, TranslationTree>;

/** locale code (e.g. "en") -> its namespaces */
export type Translations = Record<string, LocaleBundle>;

const modules = import.meta.glob<{ default: TranslationTree }>('./*/*.json', {
    eager: true,
});

export const translations: Translations = {};

for (const path in modules) {
    const match = path.match(/^\.\/([^/]+)\/([^/]+)\.json$/);

    if (!match) {
        continue;
    }

    const [, locale, namespace] = match;

    translations[locale] ??= {};
    translations[locale][namespace] = modules[path].default;
}
