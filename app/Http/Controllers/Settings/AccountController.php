<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Teams\UpdateMemberAccount;
use App\Actions\Users\DeleteAccount;
use App\Actions\Users\ManageAvatar;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AccountDeleteRequest;
use App\Http\Requests\Settings\AccountUpdateRequest;
use App\Http\Requests\Settings\AvatarUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AccountController extends Controller
{
    /**
     * Update the user's login email address.
     */
    public function update(AccountUpdateRequest $request, UpdateMemberAccount $updateMemberAccount): RedirectResponse
    {
        $updateMemberAccount->handle($request->user(), $request->safe()->only('email'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Account updated.')]);

        return to_route('security.edit');
    }

    /**
     * Store or replace the user's profile picture.
     */
    public function updateAvatar(AvatarUpdateRequest $request, ManageAvatar $manageAvatar): RedirectResponse
    {
        $manageAvatar->store($request->user(), $request->file('avatar'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile picture updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Remove the user's profile picture.
     */
    public function destroyAvatar(Request $request, ManageAvatar $manageAvatar): RedirectResponse
    {
        $manageAvatar->remove($request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile picture removed.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(AccountDeleteRequest $request, DeleteAccount $deleteAccount): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $deleteAccount->handle($user);

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
