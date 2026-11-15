<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Teams\InviteTeamMember;
use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\CreateBusinessInvitationRequest;
use App\Models\TeamInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/**
 * Invite people by email and cancel pending invitations (TEAM-4), as on the
 * web Business → Members page.
 */
class InvitationController extends Controller
{
    public function store(CreateBusinessInvitationRequest $request, InviteTeamMember $inviteTeamMember): JsonResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('inviteMember', $team);

        $invitation = $inviteTeamMember->handle(
            $team,
            $request->user(),
            $request->validated('email'),
            TeamRole::from($request->validated('role')),
        );

        return response()->json([
            'data' => [
                'code' => $invitation->code,
                'email' => $invitation->email,
                'role' => $invitation->role->value,
                'role_label' => $invitation->role->label(),
                'created_at' => $invitation->created_at?->toIso8601String(),
                'expired' => false,
            ],
        ], 201);
    }

    public function destroy(Request $request, TeamInvitation $invitation): Response
    {
        $team = $request->user()->currentTeam;

        abort_unless($invitation->team_id === $team->id, 404);

        Gate::authorize('cancelInvitation', $team);

        $invitation->delete();

        return response()->noContent();
    }
}
