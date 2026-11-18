<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Support\Apple\AppleIdTokenVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class AppleTokenController extends Controller
{
    public function __construct(private AppleIdTokenVerifier $verifier)
    {
        //
    }

    /**
     * Exchange a Sign in with Apple identity token for an API token.
     *
     * Same rules as Google sign-in: match the linked Apple id, else the
     * Apple-verified email (linking the id on first use), and never create an
     * account — businesses sign up on the web. A hidden ("private relay")
     * email can't match an account until the Apple id is linked.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'identity_token' => ['required', 'string'],
            'device_name' => ['required', 'string', 'max:255'],
        ]);

        $identity = $this->verifier->verify($request->string('identity_token')->value());

        if ($identity === null) {
            throw ValidationException::withMessages([
                'identity_token' => [__('Could not sign you in with Apple. Please try again.')],
            ]);
        }

        $user = User::where('apple_id', $identity['id'])->first()
            ?? ($identity['email'] !== null && $identity['email_verified']
                ? User::where('email', $identity['email'])->first()
                : null);

        if ($user === null) {
            throw ValidationException::withMessages([
                'identity_token' => [$identity['is_private_email']
                    ? __('Your Apple ID hides your email, so we can\'t find your Uponco account. Sign in with your email instead, or with Apple again choosing "Share My Email".')
                    : __('No Uponco account uses this Apple ID\'s email. Sign up on the web first.')],
            ]);
        }

        if (blank($user->apple_id)) {
            $user->forceFill(['apple_id' => $identity['id']])->save();
        }

        $token = $user->createToken($request->string('device_name')->value());

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => new UserResource($user),
        ], Response::HTTP_CREATED);
    }
}
