<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeamOnboarded
{
    /**
     * Redirect to the onboarding gate until the current team has its core
     * details (name, category and timezone) filled in.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $team = $request->user()?->currentTeam;

        if ($team !== null && $team->needsOnboarding()) {
            return to_route('onboard.show');
        }

        return $next($request);
    }
}
