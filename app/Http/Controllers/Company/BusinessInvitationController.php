<?php

namespace App\Http\Controllers\Company;

use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\CreateBusinessInvitationRequest;
use App\Models\TeamInvitation;
use App\Notifications\Teams\TeamInvitation as TeamInvitationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class BusinessInvitationController extends Controller
{
    /**
     * Invite a new member to the current team.
     */
    public function store(CreateBusinessInvitationRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('inviteMember', $team);

        $invitation = $team->invitations()->create([
            'email' => $request->validated('email'),
            'role' => TeamRole::from($request->validated('role')),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(3),
        ]);

        Notification::route('mail', $invitation->email)
            ->notify(new TeamInvitationNotification($invitation));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invitation sent.')]);

        return back();
    }

    /**
     * Cancel a pending invitation for the current team.
     */
    public function destroy(Request $request, TeamInvitation $invitation): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        abort_unless($invitation->team_id === $team->id, 404);

        Gate::authorize('cancelInvitation', $team);

        $invitation->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invitation cancelled.')]);

        return back();
    }
}
