<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false], 200);
        }

        // Complete a pending invitation the user arrived with, so signing in also
        // joins them to the inviting team.
        $code = $request->session()->pull('team_invitation');

        if (is_string($code) && $code !== '') {
            return redirect()->route('invitations.accept', $code);
        }

        return redirect()->intended(Fortify::redirects('login'));
    }
}
