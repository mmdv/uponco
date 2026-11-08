<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Support\Google\GoogleIdTokenVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class GoogleTokenController extends Controller
{
    public function __construct(private GoogleIdTokenVerifier $verifier)
    {
        //
    }

    /**
     * Exchange an ID token from native Google sign-in for an API token.
     *
     * Matches accounts the same way the web Google login does (Google id, then
     * the Google-verified email, linking the id on first use). Unlike the web it
     * never creates an account: the mobile app is sign-in only, so businesses
     * sign up on the web first.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'id_token' => ['required', 'string'],
            'device_name' => ['required', 'string', 'max:255'],
        ]);

        $identity = $this->verifier->verify($request->string('id_token')->value());

        if ($identity === null) {
            throw ValidationException::withMessages([
                'id_token' => [__('Could not sign you in with Google. Please try again.')],
            ]);
        }

        $user = User::where('google_id', $identity['id'])
            ->orWhere('email', $identity['email'])
            ->first();

        if ($user === null) {
            throw ValidationException::withMessages([
                'id_token' => [__('No Uponco account uses this Google address. Sign up on the web first.')],
            ]);
        }

        if (blank($user->google_id)) {
            $user->forceFill(['google_id' => $identity['id']])->save();
        }

        $token = $user->createToken($request->string('device_name')->value());

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => new UserResource($user),
        ], Response::HTTP_CREATED);
    }
}
