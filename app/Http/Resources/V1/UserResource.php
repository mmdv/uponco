<?php

namespace App\Http\Resources\V1;

use App\Data\UserTeam;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Mirrors what the web app shares on every Inertia page (auth.user,
     * currentTeam, teams, termsConsent) so the mobile app can gate onboarding,
     * email verification and terms acceptance the same way.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currentTeam = $this->currentTeam;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'email_verified' => $this->hasVerifiedEmail(),
            'has_password' => $this->hasPassword(),
            'two_factor_enabled' => $this->hasEnabledTwoFactorAuthentication(),
            'terms_accepted' => $this->hasAcceptedCurrentTerms(),
            'current_team' => $currentTeam ? [
                ...$this->teamToArray($this->toUserTeam($currentTeam)),
                'timezone' => $currentTeam->timezone,
                'needs_onboarding' => $currentTeam->needsOnboarding(),
            ] : null,
            'teams' => $this->toUserTeams(includeCurrent: true)
                ->map(fn (UserTeam $team): array => $this->teamToArray($team))
                ->all(),
        ];
    }

    /**
     * @return array{id: int, name: ?string, slug: string, is_personal: bool, role: ?string, role_label: ?string, is_current: ?bool}
     */
    protected function teamToArray(UserTeam $team): array
    {
        return [
            'id' => $team->id,
            'name' => $team->name,
            'slug' => $team->slug,
            'is_personal' => $team->isPersonal,
            'role' => $team->role,
            'role_label' => $team->roleLabel,
            'is_current' => $team->isCurrent,
        ];
    }
}
