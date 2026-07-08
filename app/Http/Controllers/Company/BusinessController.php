<?php

namespace App\Http\Controllers\Company;

use App\Enums\BusinessCategory;
use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\DeleteBusinessRequest;
use App\Http\Requests\Company\SaveTeamLogoRequest;
use App\Http\Requests\Teams\SaveTeamRequest;
use App\Models\Team;
use App\Models\User;
use App\Support\LocationOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    /**
     * Show the current team's general business settings.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam;

        return Inertia::render('company/business/general', [
            'team' => $this->toTeamArray($team),
            'permissions' => $user->toTeamPermissions($team),
            'timezones' => LocationOptions::timezones(),
            'businessCategories' => BusinessCategory::options(),
        ]);
    }

    /**
     * Update the current team's name.
     */
    public function update(SaveTeamRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('update', $team);

        DB::transaction(function () use ($request, $team): void {
            $locked = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $locked->update($request->validated());
        });

        $team->refresh();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team updated.')]);

        return to_route('company.business.edit', ['current_team' => $team->slug]);
    }

    /**
     * Store or replace the current team's logo.
     */
    public function updateLogo(SaveTeamLogoRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $path = $request->file('logo')->store('team-logos', 'public');

        DB::transaction(function () use ($team, $path): void {
            $locked = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $previousPath = $locked->logo_path;

            $locked->update(['logo_path' => $path]);

            if ($previousPath && $previousPath !== $path) {
                Storage::disk('public')->delete($previousPath);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Logo updated.')]);

        return to_route('company.business.edit', ['current_team' => $team->slug]);
    }

    /**
     * Remove the current team's logo.
     */
    public function destroyLogo(Request $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('update', $team);

        DB::transaction(function () use ($team): void {
            $locked = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $previousPath = $locked->logo_path;

            $locked->update(['logo_path' => null]);

            if ($previousPath) {
                Storage::disk('public')->delete($previousPath);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Logo removed.')]);

        return to_route('company.business.edit', ['current_team' => $team->slug]);
    }

    /**
     * Delete the current team.
     */
    public function destroy(DeleteBusinessRequest $request): RedirectResponse
    {
        $user = $request->user();
        $team = $user->currentTeam;

        $fallbackTeam = $user->fallbackTeam($team);

        DB::transaction(function () use ($user, $team): void {
            User::where('current_team_id', $team->id)
                ->where('id', '!=', $user->id)
                ->each(function (User $affectedUser) use ($team): void {
                    $fallback = $affectedUser->fallbackTeam($team);

                    if ($fallback) {
                        $affectedUser->switchTeam($fallback);
                    }
                });

            $team->invitations()->delete();
            $team->memberships()->delete();
            $team->delete();
        });

        $user->switchTeam($fallbackTeam);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team deleted.')]);

        return to_route('dashboard', ['current_team' => $fallbackTeam->slug]);
    }

    /**
     * Show the current team's members and invitations.
     */
    public function members(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam;

        return Inertia::render('company/business/members', [
            'team' => $this->toTeamArray($team),
            'members' => $team->members()->get()->map(fn (User $member): array => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'avatar' => $member->avatar ?? null,
                'role' => $member->pivot->role->value,
                'role_label' => $member->pivot->role->label(),
            ]),
            'invitations' => $team->invitations()
                ->whereNull('accepted_at')
                ->get()
                ->map(fn ($invitation): array => [
                    'code' => $invitation->code,
                    'email' => $invitation->email,
                    'role' => $invitation->role->value,
                    'role_label' => $invitation->role->label(),
                    'created_at' => $invitation->created_at->toISOString(),
                ]),
            'permissions' => $user->toTeamPermissions($team),
            'availableRoles' => TeamRole::assignable(),
        ]);
    }

    /**
     * Transform a team into its array representation for the frontend.
     *
     * @return array{id: int, name: string, slug: string, isPersonal: bool, timezone: ?string, businessCategory: ?string, logoUrl: ?string}
     */
    protected function toTeamArray(Team $team): array
    {
        return [
            'id' => $team->id,
            'name' => $team->name,
            'slug' => $team->slug,
            'isPersonal' => $team->is_personal,
            'timezone' => $team->timezone,
            'businessCategory' => $team->business_category?->value,
            'logoUrl' => $team->logoUrl(),
        ];
    }
}
