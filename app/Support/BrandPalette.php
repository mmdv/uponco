<?php

namespace App\Support;

use App\Models\Team;

/**
 * The colours a team's customer-facing surfaces are painted with.
 *
 * Only the primary is stored; the accent is always derived from it, so the
 * booking page, the embeddable widget and the settings preview cannot drift
 * apart.
 */
class BrandPalette
{
    /** The platform blue, used by every team that hasn't picked its own. */
    public const DEFAULT_PRIMARY = '#0063ff';

    /** How much of the primary shows through in the accent wash. */
    protected const ACCENT_ALPHA = 0.1;

    /**
     * The palette for a team, falling back to the platform default.
     *
     * @return array{primary: string, accent: string}
     */
    public static function forTeam(Team $team): array
    {
        return static::fromPrimary($team->brandPrimaryColor());
    }

    /**
     * The palette derived from a primary colour.
     *
     * @return array{primary: string, accent: string}
     */
    public static function fromPrimary(?string $primary): array
    {
        $primary = static::normalise($primary) ?? static::DEFAULT_PRIMARY;

        return [
            'primary' => $primary,
            'accent' => static::accent($primary),
        ];
    }

    /**
     * The accent: the primary at 10% opacity, so it reads as a soft wash over
     * whichever background the visitor's theme paints behind it.
     */
    public static function accent(string $primary): string
    {
        $hex = ltrim(static::normalise($primary) ?? static::DEFAULT_PRIMARY, '#');

        [$red, $green, $blue] = [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2)),
        ];

        return sprintf('rgba(%d, %d, %d, %s)', $red, $green, $blue, static::ACCENT_ALPHA);
    }

    /**
     * Reduce a colour to a lowercase `#rrggbb` string, or null when it isn't
     * one. Shorthand `#rgb` is expanded so stored values stay uniform.
     */
    public static function normalise(?string $color): ?string
    {
        if (blank($color)) {
            return null;
        }

        $hex = ltrim(trim($color), '#');

        if (preg_match('/^[0-9a-fA-F]{3}$/', $hex) === 1) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        if (preg_match('/^[0-9a-fA-F]{6}$/', $hex) !== 1) {
            return null;
        }

        return '#'.strtolower($hex);
    }
}
