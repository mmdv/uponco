<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Teams\DeleteTeam;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AccountDeleteRequest;
use App\Http\Requests\Settings\AccountUpdateRequest;
use App\Http\Requests\Settings\AvatarUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AccountController extends Controller
{
    /**
     * Update the user's login email address.
     */
    public function update(AccountUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->safe()->only('email'));

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Account updated.')]);

        return to_route('security.edit');
    }

    /**
     * Store or replace the user's profile picture.
     */
    public function updateAvatar(AvatarUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $previousPath = $user->avatar_path;

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar_path' => $path]);

        if ($previousPath && $previousPath !== $path) {
            Storage::disk('public')->delete($previousPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile picture updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Remove the user's profile picture.
     */
    public function destroyAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        $previousPath = $user->avatar_path;

        $user->update(['avatar_path' => null]);

        if ($previousPath) {
            Storage::disk('public')->delete($previousPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile picture removed.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(AccountDeleteRequest $request, DeleteTeam $deleteTeam): RedirectResponse
    {
        $user = $request->user();

        // Teams the user solely owns have nobody to inherit them, so they are
        // deleted along with the account. Shared teams were blocked in the
        // request until the user transferred ownership.
        $soloOwnedTeams = $user->ownedTeams()
            ->withCount('memberships')
            ->get()
            ->filter(fn ($team): bool => $team->memberships_count === 1);

        Auth::logout();

        DB::transaction(function () use ($user, $soloOwnedTeams, $deleteTeam): void {
            $soloOwnedTeams->each(fn ($team) => $deleteTeam->handle($team, $user));

            $user->delete();
        });

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
