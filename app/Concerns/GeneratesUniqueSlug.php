<?php

namespace App\Concerns;

use Illuminate\Support\Str;

/**
 * Keeps a `slug` column unique within the owning team.
 *
 * Mirrors {@see GeneratesUniqueTeamSlugs}, but scoped to `team_id` so two teams
 * can both have a "haircut" service. Soft-deleted rows are counted because they
 * still occupy the unique index.
 */
trait GeneratesUniqueSlug
{
    /**
     * Generate a slug for `$source` that is unique within the team.
     */
    public static function generateUniqueSlug(string $source, int $teamId, ?int $excludeId = null): string
    {
        $defaultSlug = Str::slug($source);

        // A name made entirely of characters Str::slug strips (e.g. an
        // all-emoji title) would otherwise produce an empty, unroutable slug.
        if ($defaultSlug === '') {
            $defaultSlug = 'item';
        }

        $query = static::withTrashed()
            ->where('team_id', $teamId)
            ->where(function ($query) use ($defaultSlug) {
                $query->where('slug', $defaultSlug)
                    ->orWhere('slug', 'like', $defaultSlug.'-%');
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $existingSlugs = $query->pluck('slug');

        $maxSuffix = $existingSlugs
            ->map(function (?string $slug) use ($defaultSlug): ?int {
                if ($slug === $defaultSlug) {
                    return 0;
                } elseif ($slug !== null && preg_match('/^'.preg_quote($defaultSlug, '/').'-(\d+)$/', $slug, $matches)) {
                    return (int) $matches[1];
                }

                return null;
            })
            ->filter(fn (?int $suffix) => $suffix !== null)
            ->max();

        return $maxSuffix === null
            ? $defaultSlug
            : $defaultSlug.'-'.($maxSuffix + 1);
    }
}
