<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Teams\DeleteTeam;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use App\Models\Team;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class SecurityController extends Controller
{
    /**
     * Show the user's security settings page.
     */
    public function edit(TwoFactorAuthenticationRequest $request): Response
    {
        $props = [
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
            'canManagePasskeys' => Features::canManagePasskeys(),
            'passkeys' => Features::canManagePasskeys()
                ? $request->user()
                    ->passkeys()
                    ->select(['id', 'name', 'credential', 'created_at', 'last_used_at'])
                    ->latest()
                    ->get()
                    ->map(fn ($passkey) => [
                        'id' => $passkey->id,
                        'name' => $passkey->name,
                        'authenticator' => $passkey->authenticator,
                        'created_at_diff' => $passkey->created_at->diffForHumans(),
                        'last_used_at_diff' => $passkey->last_used_at?->diffForHumans(),
                    ])
                    ->values()
                    ->all()
                : [],
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'ownedTeams' => $this->ownedTeamsImpact($request->user()),
        ];

        if (Features::canManageTwoFactorAuthentication()) {
            $request->ensureStateIsValid();

            $props['twoFactorEnabled'] = $request->user()->hasEnabledTwoFactorAuthentication();
            $props['requiresConfirmation'] = Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm');
        }

        return Inertia::render('settings/security', $props);
    }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        $request->user()->update([
            'password' => $request->password,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Password updated.')]);

        return back();
    }

    /**
     * Summarise the teams the user owns so the delete-account dialog can spell
     * out what deleting the account will destroy or block.
     *
     * `solo` teams (the user is the only member) are deleted with the account;
     * `shared` teams block deletion until ownership is transferred away.
     *
     * @return array{solo: list<array{name: string, summary: array<string, int>}>, shared: list<array{name: string, memberCount: int}>}
     */
    protected function ownedTeamsImpact(User $user): array
    {
        $teams = $user->ownedTeams()->withCount('memberships')->get();

        return [
            'solo' => $teams
                ->filter(fn (Team $team): bool => $team->memberships_count === 1)
                ->map(fn (Team $team): array => [
                    'name' => $team->name,
                    'summary' => DeleteTeam::summary($team),
                ])
                ->values()
                ->all(),
            'shared' => $teams
                ->filter(fn (Team $team): bool => $team->memberships_count > 1)
                ->map(fn (Team $team): array => [
                    'name' => $team->name,
                    'memberCount' => $team->memberships_count,
                ])
                ->values()
                ->all(),
        ];
    }
}
