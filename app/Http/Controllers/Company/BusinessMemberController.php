<?php

namespace App\Http\Controllers\Company;

use App\Actions\Teams\CreateTeam;
use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\CreateBusinessMemberRequest;
use App\Http\Requests\Teams\UpdateTeamMemberRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BusinessMemberController extends Controller
{
    /**
     * Add a new member directly to the current team.
     */
    public function store(CreateBusinessMemberRequest $request, CreateTeam $createTeam): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('addMember', $team);

        $validated = $request->validated();

        $name = Str::squish($validated['name'].' '.($validated['surname'] ?? ''));

        DB::transaction(function () use ($team, $createTeam, $validated, $name): void {
            $member = User::create([
                'name' => $name,
                'email' => $validated['email'],
                'password' => $validated['password'],
            ]);

            $member->forceFill(['email_verified_at' => now()])->save();

            $createTeam->handle($member, isPersonal: true);

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
        $team = $request->user()->currentTeam;

        Gate::authorize('updateMember', $team);

        $newRole = TeamRole::from($request->validated('role'));

        $team->memberships()
            ->where('user_id', $user->id)
            ->firstOrFail()
            ->update(['role' => $newRole]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member role updated.')]);

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
            $user->switchTeam($user->personalTeam());
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member removed.')]);

        return back();
    }
}
