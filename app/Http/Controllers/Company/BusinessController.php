<?php

namespace App\Http\Controllers\Company;

use App\Actions\Teams\DeleteTeam;
use App\Enums\BusinessCategory;
use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\DeleteBusinessRequest;
use App\Http\Requests\Teams\SaveTeamRequest;
use App\Models\Team;
use App\Models\User;
use App\Support\LocationOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    public function __construct(private DeleteTeam $deleteTeam) {}

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
            'deletionSummary' => DeleteTeam::summary($team),
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

        return to_route('company.business.edit');
    }

    /**
     * Delete the current team.
     */
    public function destroy(DeleteBusinessRequest $request): RedirectResponse
    {
        $user = $request->user();
        $team = $user->currentTeam;

        $fallbackTeam = $user->fallbackTeam($team);

        $this->deleteTeam->handle($team, $user);

        if ($fallbackTeam) {
            $user->switchTeam($fallbackTeam);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team deleted.')]);

        return to_route('dashboard');
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
            'isOwner' => $user->ownsTeam($team),
        ]);
    }

    /**
     * Transform a team into its array representation for the frontend.
     *
     * @return array{id: int, name: string, slug: string, isPersonal: bool, timezone: ?string, businessCategory: ?string, businessCategoryOther: ?string, logoUrl: ?string}
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
            'businessCategoryOther' => $team->business_category_other,
            'logoUrl' => $team->logoUrl(),
        ];
    }
}
