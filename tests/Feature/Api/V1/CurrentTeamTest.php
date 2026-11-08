<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('a user can switch to a team they belong to', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Member->value]);
    Sanctum::actingAs($user);

    $this->putJson(route('api.v1.me.current-team.update'), ['team_id' => $team->id])
        ->assertOk()
        ->assertJsonPath('data.current_team.id', $team->id)
        ->assertJsonPath('data.current_team.role', TeamRole::Member->value);

    expect($user->fresh()->current_team_id)->toBe($team->id);
});

test('a user cannot switch to a team they do not belong to', function () {
    $user = User::factory()->create();
    $originalTeamId = $user->current_team_id;
    $otherTeam = Team::factory()->create();
    Sanctum::actingAs($user);

    $this->putJson(route('api.v1.me.current-team.update'), ['team_id' => $otherTeam->id])
        ->assertForbidden();

    expect($user->fresh()->current_team_id)->toBe($originalTeamId);
});

test('switching to a team that does not exist is forbidden', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson(route('api.v1.me.current-team.update'), ['team_id' => 999999])
        ->assertForbidden();
});

test('a team id is required', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson(route('api.v1.me.current-team.update'), [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['team_id']);
});

test('switching teams requires a token', function () {
    $this->putJson(route('api.v1.me.current-team.update'), ['team_id' => 1])->assertUnauthorized();
});
