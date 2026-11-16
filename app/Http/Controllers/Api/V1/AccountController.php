<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Teams\UpdateMemberAccount;
use App\Actions\Teams\UpdateMemberProfile;
use App\Actions\Users\DeleteAccount;
use App\Actions\Users\ManageAvatar;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AccountDeleteRequest;
use App\Http\Requests\Settings\AccountUpdateRequest;
use App\Http\Requests\Settings\AvatarUpdateRequest;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Support\Teams\OwnedTeamsImpact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Personal settings for the mobile app (SET-1..3, SET-8..10): the same rules
 * and actions as the web Settings pages, for the signed-in user only.
 */
class AccountController extends Controller
{
    /**
     * The booking profile customers see, plus what the account can do.
     */
    public function profile(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->profileArray($request->user())]);
    }

    public function updateProfile(ProfileUpdateRequest $request, UpdateMemberProfile $updateMemberProfile): JsonResponse
    {
        $updateMemberProfile->handle($request->user(), $request->validated());

        return response()->json(['data' => $this->profileArray($request->user()->refresh())]);
    }

    /**
     * Login email; needs the current password, and the new address must be verified.
     */
    public function updateEmail(AccountUpdateRequest $request, UpdateMemberAccount $updateMemberAccount): UserResource
    {
        $updateMemberAccount->handle($request->user(), $request->safe()->only('email'));

        return new UserResource($request->user());
    }

    public function updatePassword(PasswordUpdateRequest $request): Response
    {
        $request->user()->update(['password' => $request->password]);

        return response()->noContent();
    }

    /**
     * A square JPEG/PNG/WebP up to 2 MB (the app crops it square).
     */
    public function updateAvatar(AvatarUpdateRequest $request, ManageAvatar $manageAvatar): UserResource
    {
        $manageAvatar->store($request->user(), $request->file('avatar'));

        return new UserResource($request->user());
    }

    public function destroyAvatar(Request $request, ManageAvatar $manageAvatar): UserResource
    {
        $manageAvatar->remove($request->user());

        return new UserResource($request->user());
    }

    /**
     * What deleting the account would remove, and what blocks it.
     */
    public function deletion(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'requires_password' => $request->user()->hasPassword(),
                'owned_teams' => OwnedTeamsImpact::for($request->user()),
            ],
        ]);
    }

    /**
     * SET-9: delete the account (and teams owned alone). All of the user's
     * tokens go with it, so the app is signed out everywhere.
     */
    public function destroy(AccountDeleteRequest $request, DeleteAccount $deleteAccount): Response
    {
        $deleteAccount->handle($request->user());

        return response()->noContent();
    }

    /**
     * SET-8: the Google account used for Meet links. Connecting runs the web
     * OAuth flow in the browser; the app only shows it and disconnects.
     */
    public function integrations(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'google' => [
                    'connected' => $user->hasGoogleConnected(),
                    'email' => $user->google_account_email,
                ],
                'connect_url' => route('integrations.edit'),
            ],
        ]);
    }

    public function disconnectGoogle(Request $request): Response
    {
        $request->user()->update([
            'google_account_email' => null,
            'google_access_token' => null,
            'google_refresh_token' => null,
            'google_token_expires_at' => null,
        ]);

        return response()->noContent();
    }

    /**
     * @return array<string, mixed>
     */
    protected function profileArray(User $user): array
    {
        $profile = $user->profile()->first();

        return [
            'name' => $user->name,
            'email' => $profile?->email,
            'phone' => $profile?->phone,
            'job_title' => $profile?->job_title,
            'description' => $profile?->description,
        ];
    }
}
