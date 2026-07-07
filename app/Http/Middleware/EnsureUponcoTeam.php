<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUponcoTeam
{
    /**
     * The name of the single operator team that may access the backoffice.
     */
    public const OPERATOR_TEAM_NAME = 'Uponco';

    /**
     * Restrict access to members of the operator team ("Uponco"). Membership on
     * the current team is already guaranteed by EnsureTeamMembership.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(
            $request->user()?->currentTeam?->name === self::OPERATOR_TEAM_NAME,
            403,
        );

        return $next($request);
    }
}
