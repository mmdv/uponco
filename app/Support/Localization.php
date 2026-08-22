<?php

namespace App\Support;

/**
 * The single source of truth for the platform's locale configuration.
 *
 * Everything that needs to know which languages exist, which are enabled, or
 * which is the default reads it from here rather than reaching into
 * `config('localization')` directly, so the shape stays consistent across the
 * locale middleware, the shared Inertia props and per-team settings.
 */
class Localization
{
    /**
     * The codes of every locale that is enabled for selection.
     *
     * @return list<string>
     */
    public static function enabledCodes(): array
    {
        return array_keys(array_filter(
            config('localization.available'),
            fn (array $locale): bool => $locale['enabled'] ?? false,
        ));
    }

    /**
     * The enabled locales as UI-ready option rows.
     *
     * @return list<array{code: string, name: string, native: string}>
     */
    public static function options(): array
    {
        return static::optionsFor(static::enabledCodes());
    }

    /**
     * The given codes as UI-ready option rows, restricted to enabled locales
     * and ordered by the configuration.
     *
     * @param  list<string>  $codes
     * @return list<array{code: string, name: string, native: string}>
     */
    public static function optionsFor(array $codes): array
    {
        return collect(config('localization.available'))
            ->filter(fn (array $locale, string $code): bool => ($locale['enabled'] ?? false) && in_array($code, $codes, true))
            ->map(fn (array $locale, string $code): array => [
                'code' => $code,
                'name' => $locale['name'],
                'native' => $locale['native'],
            ])
            ->values()
            ->all();
    }

    /**
     * The locale used when a visitor's preference can't be determined.
     */
    public static function default(): string
    {
        return config('localization.default');
    }
}
