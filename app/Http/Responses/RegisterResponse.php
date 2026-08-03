<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false], 201);
        }

        // Users who registered via an invitation already sit on an onboarded team,
        // so send them straight to the dashboard; everyone else onboards first.
        $team = $request->user()?->currentTeam;

        return redirect($team !== null && ! $team->needsOnboarding() ? '/dashboard' : '/onboard');
    }
}
