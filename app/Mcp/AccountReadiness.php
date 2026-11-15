<?php

namespace App\Mcp;

use App\Models\User;

/**
 * The gates an account must pass before MCP tools may touch business data —
 * the same ones the web app and the mobile API apply (verified email, a
 * current team the user belongs to, onboarding finished). They are checked
 * inside the tools rather than as HTTP middleware so the assistant gets a
 * sentence it can relay to the user instead of a failed connection.
 */
class AccountReadiness
{
    /**
     * What still stops the user from using their business through an
     * assistant, or null when nothing does.
     */
    public static function blocker(User $user): ?string
    {
        if (! $user->hasVerifiedEmail()) {
            return __('Verify your email address in Uponco first, then try again.');
        }

        // As on the web: fall back to another team when the current one is gone.
        if (! $user->currentTeam && $team = $user->fallbackTeam()) {
            $user->switchTeam($team);
        }

        $team = $user->currentTeam;

        if ($team === null || ! $user->belongsToTeam($team)) {
            return __('This account is not part of a business in Uponco yet.');
        }

        if ($team->needsOnboarding()) {
            return __('Finish setting up your business in Uponco (name, category and timezone) first, then try again.');
        }

        return null;
    }
}
