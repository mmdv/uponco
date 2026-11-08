<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Resend the email verification link for the signed-in user.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['status' => 'already-verified']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['status' => 'verification-link-sent'], Response::HTTP_ACCEPTED);
    }
}
