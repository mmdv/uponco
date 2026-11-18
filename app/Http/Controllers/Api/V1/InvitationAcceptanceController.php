<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Teams\AcceptTeamInvitation;
use App\Http\Controllers\Controller;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AUTH-10: the app's side of the invitation email link. Same rules as the web
 * `TeamInvitationController`: only a pending invitation can be accepted, only
 * by the account it was sent to, and accepting verifies that email address.
 */
class InvitationAcceptanceController extends Controller
{
    /**
     * What the invitation is for, so the app can ask before joining.
     */
    public function show(Request $request, TeamInvitation $invitation): JsonResponse
    {
        $user = $request->user();
        $team = $invitation->team;

        return response()->json([
            'data' => [
                'code' => $invitation->code,
                'team' => [
                    'id' => $team->id,
                    'name' => $team->name,
                    'logo_url' => $team->logoUrl(),
                ],
                'inviter' => $invitation->inviter?->name,
                'email' => $invitation->email,
                'role' => $invitation->role->value,
                'role_label' => $invitation->role->label(),
                'status' => $this->status($invitation),
                'for_you' => $this->isFor($user, $invitation),
                'already_member' => $user->belongsToTeam($team),
            ],
        ]);
    }

    /**
     * Join the team and switch to it.
     */
    public function store(Request $request, TeamInvitation $invitation, AcceptTeamInvitation $acceptTeamInvitation): JsonResponse
    {
        $user = $request->user();

        abort_unless($invitation->isPending(), 422, __('This invitation is no longer valid.'));
        abort_unless($this->isFor($user, $invitation), 403, __('This invitation was sent to a different email address.'));

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        $team = $acceptTeamInvitation->handle($user, $invitation);

        return response()->json(['data' => ['team' => ['id' => $team->id, 'name' => $team->name]]]);
    }

    /**
     * @return 'pending'|'accepted'|'expired'
     */
    protected function status(TeamInvitation $invitation): string
    {
        if ($invitation->accepted_at !== null) {
            return 'accepted';
        }

        return $invitation->isExpired() ? 'expired' : 'pending';
    }

    protected function isFor(User $user, TeamInvitation $invitation): bool
    {
        return strtolower($user->email) === strtolower($invitation->email);
    }
}
