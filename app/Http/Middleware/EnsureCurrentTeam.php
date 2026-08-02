<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCurrentTeam
{
    /**
     * Ensure an authenticated user always has a current team resolved.
     *
     * The current team is implicit request context rather than a URL segment,
     * so a user whose current team has gone away falls back to another team
     * they belong to. Teamless users are left alone here; the routes that
     * require a team reject them through EnsureTeamMembership.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->currentTeam && $team = $user->fallbackTeam()) {
            $user->switchTeam($team);
        }

        return $next($request);
    }
}
