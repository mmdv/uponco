<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUponcoTeam
{
    /**
     * The name given to the operator team when it is seeded. Kept only so the
     * seeder and the reserved-name rule agree; authorization never reads it.
     */
    public const OPERATOR_TEAM_NAME = 'Uponco';

    /**
     * Restrict access to members of the operator team. Membership on the
     * current team is already guaranteed by EnsureTeamMembership.
     *
     * Authorization keys on `teams.is_operator`, which is not fillable and has
     * no route that writes it. It used to compare the team *name*, which any
     * owner can set — so registering and naming your team "Uponco" was enough
     * to reach the backoffice.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->currentTeam?->is_operator === true, 403);

        return $next($request);
    }
}
