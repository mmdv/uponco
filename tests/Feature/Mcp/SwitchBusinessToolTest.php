<?php

use App\Enums\TeamRole;
use App\Mcp\Servers\UponcoServer;
use App\Mcp\Tools\SwitchBusinessTool;
use App\Models\Team;
use App\Models\User;

test('switch-business moves the user to another of their businesses', function () {
    $user = User::factory()->create();
    $other = Team::factory()->create(['name' => 'Second Studio', 'timezone' => 'Asia/Baku']);
    $other->members()->attach($user, ['role' => TeamRole::Admin->value]);

    UponcoServer::actingAs($user)
        ->tool(SwitchBusinessTool::class, ['business_id' => $other->id])
        ->assertOk()
        ->assertStructuredContent([
            'business' => ['id' => $other->id, 'name' => 'Second Studio', 'role' => 'admin', 'timezone' => 'Asia/Baku'],
            'ready' => true,
        ]);

    expect($user->fresh()->current_team_id)->toBe($other->id);
});

test('switch-business refuses a business the user does not belong to', function () {
    $user = User::factory()->create();
    $current = $user->current_team_id;

    UponcoServer::actingAs($user)
        ->tool(SwitchBusinessTool::class, ['business_id' => Team::factory()->create()->id])
        ->assertHasErrors(['Business not found.']);

    expect($user->fresh()->current_team_id)->toBe($current);
});
