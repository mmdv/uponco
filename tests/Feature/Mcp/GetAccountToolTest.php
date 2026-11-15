<?php

use App\Enums\TeamRole;
use App\Mcp\Servers\UponcoServer;
use App\Mcp\Tools\GetAccountTool;
use App\Models\Team;
use App\Models\User;

test('get-account returns the user and their current business in its timezone', function () {
    $this->travelTo('2026-11-15 22:30:00'); // already the 16th in Baku (UTC+4)

    $user = User::factory()->create();
    $team = Team::factory()->create(['name' => 'Studio North', 'timezone' => 'Asia/Baku']);
    $team->members()->attach($user, ['role' => TeamRole::Member->value]);
    $user->switchTeam($team);

    UponcoServer::actingAs($user)
        ->tool(GetAccountTool::class)
        ->assertOk()
        ->assertStructuredContent([
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
            'business' => [
                'id' => $team->id,
                'name' => 'Studio North',
                'role' => TeamRole::Member->value,
                'timezone' => 'Asia/Baku',
                'today' => '2026-11-16',
            ],
            'ready' => true,
            'blocker' => null,
        ]);
});

test('get-account is not ready until the email is verified', function () {
    $user = User::factory()->unverified()->create();

    UponcoServer::actingAs($user)
        ->tool(GetAccountTool::class)
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('ready', false)
            ->where('blocker', 'Verify your email address in Uponco first, then try again.')
            ->etc());
});

test('get-account is not ready until the business is set up', function () {
    $user = User::factory()->create();
    $user->currentTeam->update(['timezone' => null]);

    UponcoServer::actingAs($user)
        ->tool(GetAccountTool::class)
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('ready', false)
            ->where('blocker', 'Finish setting up your business in Uponco (name, category and timezone) first, then try again.')
            ->etc());
});

test('get-account reports no business for a user without a team', function () {
    $user = User::factory()->create();
    $user->teams()->detach();
    $user->forceFill(['current_team_id' => null])->save();

    UponcoServer::actingAs($user->fresh())
        ->tool(GetAccountTool::class)
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('business', null)
            ->where('ready', false)
            ->where('blocker', 'This account is not part of a business in Uponco yet.')
            ->etc());
});

test('get-account falls back to another business when the current one is gone', function () {
    $user = User::factory()->create();
    $remainingTeam = $user->currentTeam;
    $user->forceFill(['current_team_id' => null])->save();

    UponcoServer::actingAs($user->fresh())
        ->tool(GetAccountTool::class)
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('business.id', $remainingTeam->id)
            ->where('ready', true)
            ->etc());
});
