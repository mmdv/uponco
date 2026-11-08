<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CreateApiTokenRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Laravel\Fortify\Events\RecoveryCodeReplaced;
use Laravel\Fortify\Events\TwoFactorAuthenticationFailed;
use Laravel\Fortify\Fortify;

class AuthTokenController extends Controller
{
    /**
     * Exchange credentials (and a two-factor code when the account has 2FA
     * enabled) for a Sanctum token for the mobile app.
     *
     * Stateless counterpart of the Fortify web login: the client sends the
     * password again together with the code instead of keeping a session.
     */
    public function store(CreateApiTokenRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email')->value())->first();

        if (! $user || ! $user->hasPassword() || ! Hash::check($request->string('password')->value(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if ($user->hasEnabledTwoFactorAuthentication()) {
            if (blank($request->input('code')) && blank($request->input('recovery_code'))) {
                return response()->json(['two_factor' => true]);
            }

            $this->verifyTwoFactor($request, $user);
        }

        $token = $user->createToken($request->string('device_name')->value());

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => new UserResource($user),
        ], Response::HTTP_CREATED);
    }

    /**
     * Revoke the token the request was made with (mobile logout).
     */
    public function destroy(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    /**
     * Validate the TOTP or recovery code, consuming a used recovery code the
     * same way Fortify's two-factor challenge does.
     *
     * @throws ValidationException
     */
    protected function verifyTwoFactor(CreateApiTokenRequest $request, User $user): void
    {
        $recoveryCode = $request->string('recovery_code')->value();

        if ($recoveryCode !== '') {
            $matchedCode = collect($user->recoveryCodes())
                ->first(fn (string $code): bool => hash_equals($code, $recoveryCode));

            if ($matchedCode !== null) {
                $user->replaceRecoveryCode($matchedCode);
                event(new RecoveryCodeReplaced($user, $matchedCode));

                return;
            }

            event(new TwoFactorAuthenticationFailed($user));

            throw ValidationException::withMessages([
                'recovery_code' => [__('The provided two factor recovery code was invalid.')],
            ]);
        }

        $isValidCode = app(TwoFactorAuthenticationProvider::class)->verify(
            Fortify::currentEncrypter()->decrypt($user->two_factor_secret),
            $request->string('code')->value(),
        );

        if (! $isValidCode) {
            event(new TwoFactorAuthenticationFailed($user));

            throw ValidationException::withMessages([
                'code' => [__('The provided two factor authentication code was invalid.')],
            ]);
        }
    }
}
