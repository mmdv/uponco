<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkController extends Controller
{
    /**
     * Email a password reset link from the app's "forgot password" screen.
     *
     * The link opens the web reset page, so the reset itself is the same flow
     * as on the web. The response does not say whether the address has an
     * account, so the endpoint cannot be used to discover users.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $status = Password::broker(config('fortify.passwords'))->sendResetLink(
            $request->only('email'),
        );

        if ($status === Password::RESET_THROTTLED) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => __(Password::RESET_LINK_SENT),
        ], Response::HTTP_ACCEPTED);
    }
}
