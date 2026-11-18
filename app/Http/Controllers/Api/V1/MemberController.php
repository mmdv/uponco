<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Teams\AddTeamMember;
use App\Actions\Teams\RemoveTeamMember;
use App\Actions\Teams\SyncMemberAssignments;
use App\Actions\Teams\TransferOwnership;
use App\Actions\Teams\UpdateMemberAccount;
use App\Actions\Teams\UpdateMemberProfile;
use App\Actions\Users\ManageAvatar;
use App\Enums\TeamPermission;
use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\CreateBusinessMemberRequest;
use App\Http\Requests\Company\SyncMemberLocationsRequest;
use App\Http\Requests\Company\SyncMemberServicesRequest;
use App\Http\Requests\Company\UpdateBusinessMemberAccountRequest;
use App\Http\Requests\Company\UpdateBusinessMemberProfileRequest;
use App\Http\Requests\Company\UpdateMemberPermissionsRequest;
use App\Http\Requests\Settings\AvatarUpdateRequest;
use App\Http\Requests\Teams\TransferTeamOwnershipRequest;
use App\Http\Requests\Teams\UpdateTeamMemberRequest;
use App\Models\Location;
use App\Models\Service;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Support\Teams\MemberAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/**
 * Team members for the mobile app (TEAM-3..8): the same people, rules and
 * actions as the web Business → Members pages. Reached only by owners and
 * admins (route middleware); finer checks use the team permissions, and only
 * the owner may manage the owner.
 */
class MemberController extends Controller
{
    /**
     * Everyone on the team, pending invitations, and what the user may do.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $team = $user->currentTeam;

        return response()->json([
            'data' => [
                'members' => $team->members()
                    ->orderBy('name')
                    ->get()
                    ->map(fn (User $member): array => [
                        'id' => $member->id,
                        'name' => $member->name,
                        'email' => $member->email,
                        'avatar' => $member->avatar,
                        'role' => $member->pivot->role->value,
                        'role_label' => $member->pivot->role->label(),
                    ])
                    ->values(),
                'invitations' => $team->invitations()
                    ->whereNull('accepted_at')
                    ->latest()
                    ->get()
                    ->map(fn (TeamInvitation $invitation): array => [
                        'code' => $invitation->code,
                        'email' => $invitation->email,
                        'role' => $invitation->role->value,
                        'role_label' => $invitation->role->label(),
                        'created_at' => $invitation->created_at?->toIso8601String(),
                        'expired' => $invitation->isExpired(),
                    ])
                    ->values(),
                'can' => [
                    'add' => $user->hasTeamPermission($team, TeamPermission::AddMember),
                    'invite' => $user->hasTeamPermission($team, TeamPermission::CreateInvitation),
                    'cancel_invitation' => $user->hasTeamPermission($team, TeamPermission::CancelInvitation),
                ],
                'roles' => TeamRole::assignable(),
            ],
        ]);
    }

    /**
     * Add a member directly, with a password the admin sets (TEAM-4).
     */
    public function store(CreateBusinessMemberRequest $request, AddTeamMember $addTeamMember): JsonResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('addMember', $team);

        $member = $addTeamMember->handle($team, $request->validated());

        return response()->json(['data' => $this->detail($request->user(), $team, $member)], 201);
    }

    /**
     * One member's role, profile, permissions and assignments (TEAM-5..7).
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $team = MemberAccess::authorize($request->user(), $user);

        return response()->json(['data' => $this->detail($request->user(), $team, $user)]);
    }

    /**
     * Change a member's role (member ↔ admin). The owner's role is changed
     * only by transferring ownership.
     */
    public function updateRole(UpdateTeamMemberRequest $request, User $user): JsonResponse
    {
        $team = MemberAccess::authorize($request->user(), $user);

        abort_if($team->owner()?->is($user), 403, __('Transfer ownership to change the owner\'s role.'));

        $team->memberships()
            ->where('user_id', $user->id)
            ->firstOrFail()
            ->update(['role' => TeamRole::from($request->validated('role'))]);

        return response()->json(['data' => $this->detail($request->user(), $team, $user)]);
    }

    /**
     * Name and public booking profile.
     */
    public function updateProfile(UpdateBusinessMemberProfileRequest $request, User $user, UpdateMemberProfile $updateMemberProfile): JsonResponse
    {
        $team = MemberAccess::authorize($request->user(), $user);

        $updateMemberProfile->handle($user, $request->validated());

        return response()->json(['data' => $this->detail($request->user(), $team, $user->refresh())]);
    }

    /**
     * Login email (a new one must be verified again).
     */
    public function updateAccount(UpdateBusinessMemberAccountRequest $request, User $user, UpdateMemberAccount $updateMemberAccount): JsonResponse
    {
        $team = MemberAccess::authorize($request->user(), $user);

        $updateMemberAccount->handle($user, $request->validated());

        return response()->json(['data' => $this->detail($request->user(), $team, $user)]);
    }

    /**
     * Extra permissions on top of the member's role.
     */
    public function updatePermissions(UpdateMemberPermissionsRequest $request, User $user): JsonResponse
    {
        $team = MemberAccess::authorize($request->user(), $user);

        $team->memberships()
            ->where('user_id', $user->id)
            ->firstOrFail()
            ->update(['permissions' => $request->permissions()]);

        return response()->json(['data' => $this->detail($request->user(), $team, $user)]);
    }

    /**
     * The services this member offers.
     */
    public function updateServices(SyncMemberServicesRequest $request, User $user, SyncMemberAssignments $syncMemberAssignments): JsonResponse
    {
        $team = MemberAccess::authorize($request->user(), $user);

        $syncMemberAssignments->services($team, $user, $request->ids());

        return response()->json(['data' => $this->detail($request->user(), $team, $user)]);
    }

    /**
     * The locations this member works at.
     */
    public function updateLocations(SyncMemberLocationsRequest $request, User $user, SyncMemberAssignments $syncMemberAssignments): JsonResponse
    {
        $team = MemberAccess::authorize($request->user(), $user);

        $syncMemberAssignments->locations($team, $user, $request->ids());

        return response()->json(['data' => $this->detail($request->user(), $team, $user)]);
    }

    /**
     * Take a member off the team (TEAM-8). Never the owner.
     */
    public function destroy(Request $request, User $user, RemoveTeamMember $removeTeamMember): Response
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('removeMember', $team);

        abort_unless($user->belongsToTeam($team), 404);
        abort_if($team->owner()?->is($user), 403, __('The team owner cannot be removed.'));

        $removeTeamMember->handle($team, $user);

        return response()->noContent();
    }

    /**
     * A member's photo (square JPEG/PNG/WebP up to 2 MB).
     */
    public function updateAvatar(AvatarUpdateRequest $request, User $user, ManageAvatar $manageAvatar): JsonResponse
    {
        $team = MemberAccess::authorize($request->user(), $user);

        $manageAvatar->store($user, $request->file('avatar'));

        return response()->json(['data' => $this->detail($request->user(), $team, $user->refresh())]);
    }

    public function destroyAvatar(Request $request, User $user, ManageAvatar $manageAvatar): JsonResponse
    {
        $team = MemberAccess::authorize($request->user(), $user);

        $manageAvatar->remove($user);

        return response()->json(['data' => $this->detail($request->user(), $team, $user->refresh())]);
    }

    /**
     * TEAM-9: the owner hands the business to another member (current
     * password required when the account has one) and becomes an admin.
     */
    public function transferOwnership(TransferTeamOwnershipRequest $request, TransferOwnership $transferOwnership): Response
    {
        $actor = $request->user();

        $transferOwnership->handle($actor->currentTeam, $actor, $request->newOwner());

        return response()->noContent();
    }

    /**
     * @return array<string, mixed>
     */
    protected function detail(User $actor, Team $team, User $member): array
    {
        $membership = $member->teamMembership($team);
        $role = $membership?->role;
        $profile = $member->profile()->first();
        $isOwner = $role === TeamRole::Owner;

        return [
            'id' => $member->id,
            'name' => $member->name,
            'email' => $member->email,
            'avatar' => $member->avatar,
            'role' => $role?->value,
            'role_label' => $role?->label(),
            'permissions' => array_values($membership?->permissions ?? []),
            'profile' => [
                'email' => $profile?->email,
                'phone' => $profile?->phone,
                'job_title' => $profile?->job_title,
                'description' => $profile?->description,
            ],
            'services' => $team->services()
                ->with('category:id,name')
                ->orderBy('title')
                ->get()
                ->map(fn (Service $service): array => [
                    'id' => $service->id,
                    'title' => $service->title,
                    'category' => $service->category?->name,
                ])
                ->values(),
            'service_ids' => $member->services()
                ->whereIn('services.id', $team->services()->select('services.id'))
                ->pluck('services.id')
                ->values(),
            'locations' => $team->locations()
                ->orderBy('name')
                ->get()
                ->map(fn (Location $location): array => [
                    'id' => $location->id,
                    'name' => $location->name,
                    'city' => $location->city,
                ])
                ->values(),
            'location_ids' => $member->locations()
                ->where('locations.team_id', $team->id)
                ->pluck('locations.id')
                ->values(),
            'grantable_permissions' => array_map(
                fn (TeamPermission $permission): string => $permission->value,
                TeamPermission::grantable(),
            ),
            'can' => [
                'change_role' => ! $isOwner,
                'remove' => ! $isOwner && $actor->hasTeamPermission($team, TeamPermission::RemoveMember),
                'make_owner' => ! $isOwner && $actor->ownsTeam($team),
            ],
        ];
    }
}
