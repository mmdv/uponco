<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DevicePushToken;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;

class PushTokenController extends Controller
{
    /**
     * Register (or refresh) this device's Expo push token.
     *
     * A token that was registered by another account on the same phone moves
     * to the caller, so pushes always follow whoever is signed in. It is tied
     * to the API token in use, so logging out stops pushes to the device.
     */
    public function store(Request $request): Response
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:255', 'regex:/^Expo(nent)?PushToken\[.+\]$/'],
            'platform' => ['required', Rule::in(['ios', 'android'])],
        ]);

        $accessToken = $request->user()->currentAccessToken();

        DevicePushToken::updateOrCreate(
            ['token' => $data['token']],
            [
                'user_id' => $request->user()->id,
                'personal_access_token_id' => $accessToken instanceof PersonalAccessToken && $accessToken->exists ? $accessToken->id : null,
                'platform' => $data['platform'],
            ],
        );

        return response()->noContent();
    }

    /**
     * Stop pushes to this device (e.g. the user turned notifications off).
     */
    public function destroy(Request $request): Response
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->devicePushTokens()->where('token', $data['token'])->delete();

        return response()->noContent();
    }
}
