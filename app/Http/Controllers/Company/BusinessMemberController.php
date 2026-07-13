<?php

namespace App\Http\Controllers\Company;

use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\CreateBusinessMemberRequest;
use App\Http\Requests\Company\SyncMemberLocationsRequest;
use App\Http\Requests\Company\SyncMemberServicesRequest;
use App\Http\Requests\Company\UpdateBusinessMemberAccountRequest;
use App\Http\Requests\Company\UpdateBusinessMemberProfileRequest;
use App\Http\Requests\Settings\AvatarUpdateRequest;
use App\Http\Requests\Teams\UpdateTeamMemberRequest;
use App\Models\Location;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BusinessMemberController extends Controller
{
    /**
     * Add a new member directly to the current team.
     */
    public function store(CreateBusinessMemberRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('addMember', $team);

        $validated = $request->validated();

        $name = Str::squish($validated['name'].' '.($validated['surname'] ?? ''));

        DB::transaction(function () use ($team, $validated, $name): void {
            $member = User::create([
                'name' => $name,
                'email' => $validated['email'],
                'password' => $validated['password'],
            ]);

            $member->forceFill(['email_verified_at' => now()])->save();

            $team->memberships()->create([
                'user_id' => $member->id,
                'role' => TeamRole::Member,
            ]);

            $member->profile()->create([
                'name' => $name,
                'email' => $validated['email'],
                'job_title' => $validated['job_title'] ?? null,
            ]);

            $member->switchTeam($team);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member added.')]);

        return back();
    }

    /**
     * Update the specified current team member's role.
     */
    public function update(UpdateTeamMemberRequest $request, string $current_team, User $user): RedirectResponse
    {
        $team = $this->authorizeMember($request, $user);

        $newRole = TeamRole::from($request->validated('role'));

        $team->memberships()
            ->where('user_id', $user->id)
            ->firstOrFail()
            ->update(['role' => $newRole]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member role updated.')]);

        return back();
    }

    /**
     * Show the member edit page (account, profile, access, assignments).
     */
    public function edit(Request $request, string $current_team, User $user): Response
    {
        $team = $this->authorizeMember($request, $user);

        $profile = $user->profile;
        $teamLocationIds = $team->locations()->pluck('id');
        $teamServiceIds = $team->services()->pluck('services.id');

        return Inertia::render('company/business/members/edit', [
            'member' => $this->toMemberArray($team, $user),
            'profile' => [
                'name' => $profile?->name ?? $user->name,
                'email' => $profile?->email,
                'phone' => $profile?->phone,
                'job_title' => $profile?->job_title,
                'description' => $profile?->description,
            ],
            'availableRoles' => TeamRole::assignable(),
            'locations' => $team->locations()
                ->orderBy('name')
                ->get()
                ->map(fn (Location $location): array => [
                    'id' => $location->id,
                    'name' => $location->name,
                    'city' => $location->city,
                ]),
            'assignedLocationIds' => $user->locations()
                ->pluck('locations.id')
                ->intersect($teamLocationIds)
                ->values(),
            'services' => $team->services()
                ->with('category:id,name')
                ->orderBy('title')
                ->get()
                ->map(fn (Service $service): array => [
                    'id' => $service->id,
                    'title' => $service->title,
                    'category' => $service->category?->name,
                ]),
            'assignedServiceIds' => $user->services()
                ->pluck('services.id')
                ->intersect($teamServiceIds)
                ->values(),
            'permissions' => $request->user()->toTeamPermissions($team),
        ]);
    }

    /**
     * Update the member's login account information (name and email).
     */
    public function updateAccount(UpdateBusinessMemberAccountRequest $request, string $current_team, User $user): RedirectResponse
    {
        $this->authorizeMember($request, $user);

        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Account updated.')]);

        return back();
    }

    /**
     * Update the member's public booking profile.
     */
    public function updateProfile(UpdateBusinessMemberProfileRequest $request, string $current_team, User $user): RedirectResponse
    {
        $this->authorizeMember($request, $user);

        $user->profile()->updateOrCreate([], $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return back();
    }

    /**
     * Sync the locations this member works at within the current team.
     */
    public function updateLocations(SyncMemberLocationsRequest $request, string $current_team, User $user): RedirectResponse
    {
        $team = $this->authorizeMember($request, $user);

        $user->locations()->detach($team->locations()->pluck('id'));
        $user->locations()->attach($request->ids());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Locations updated.')]);

        return back();
    }

    /**
     * Sync the services this member provides within the current team.
     */
    public function updateServices(SyncMemberServicesRequest $request, string $current_team, User $user): RedirectResponse
    {
        $team = $this->authorizeMember($request, $user);

        $user->services()->detach($team->services()->pluck('services.id'));
        $user->services()->attach($request->ids());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Services updated.')]);

        return back();
    }

    /**
     * Store or replace the member's profile picture.
     */
    public function updateAvatar(AvatarUpdateRequest $request, string $current_team, User $user): RedirectResponse
    {
        $this->authorizeMember($request, $user);

        $previousPath = $user->avatar_path;

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar_path' => $path]);

        if ($previousPath && $previousPath !== $path) {
            Storage::disk('public')->delete($previousPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile picture updated.')]);

        return back();
    }

    /**
     * Remove the member's profile picture.
     */
    public function destroyAvatar(Request $request, string $current_team, User $user): RedirectResponse
    {
        $this->authorizeMember($request, $user);

        $previousPath = $user->avatar_path;

        $user->update(['avatar_path' => null]);

        if ($previousPath) {
            Storage::disk('public')->delete($previousPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile picture removed.')]);

        return back();
    }

    /**
     * Remove the specified member from the current team.
     */
    public function destroy(Request $request, string $current_team, User $user): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('removeMember', $team);

        abort_if($team->owner()?->is($user), 403, __('The team owner cannot be removed.'));

        $team->memberships()
            ->where('user_id', $user->id)
            ->delete();

        if ($user->isCurrentTeam($team)) {
            $fallback = $user->fallbackTeam($team);

            if ($fallback) {
                $user->switchTeam($fallback);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member removed.')]);

        return back();
    }

    /**
     * Ensure the acting user may manage the given member of the current team.
     */
    protected function authorizeMember(Request $request, User $user): Team
    {
        $actor = $request->user();
        $team = $actor->currentTeam;

        Gate::authorize('updateMember', $team);

        abort_unless($user->belongsToTeam($team), 404);

        // Admins may manage members, but only the owner may manage the owner.
        abort_if(
            $team->owner()?->is($user) && ! $team->owner()?->is($actor),
            403,
            __('Only the owner can manage the team owner.'),
        );

        return $team;
    }

    /**
     * Transform a team member into its array representation for the frontend.
     *
     * @return array{id: int, name: string, email: string, avatar: ?string, role: ?string, role_label: ?string}
     */
    protected function toMemberArray(Team $team, User $user): array
    {
        $role = $user->teamRole($team);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'role' => $role?->value,
            'role_label' => $role?->label(),
        ];
    }
}
