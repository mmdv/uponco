<?php

use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Passport\Client;
use Laravel\Passport\Database\Factories\ClientFactory;
use Laravel\Passport\RefreshToken;
use Laravel\Passport\Token;

/**
 * Give the user an access token for the client, plus a refresh token, the way
 * Passport stores a connection.
 *
 * @param  array<string, mixed>  $attributes
 */
function assistantToken(User $user, Client $client, array $attributes = [], bool $withRefreshToken = true): Token
{
    $token = (new Token)->forceFill([
        'id' => Str::random(80),
        'user_id' => $user->id,
        'client_id' => $client->id,
        'scopes' => '["mcp:use"]',
        'revoked' => false,
        'expires_at' => now()->addDay(),
        'created_at' => now(),
        'updated_at' => now(),
        ...$attributes,
    ]);
    $token->save();

    if ($withRefreshToken) {
        (new RefreshToken)->forceFill([
            'id' => Str::random(80),
            'access_token_id' => $token->id,
            'revoked' => false,
            'expires_at' => now()->addDays(90),
        ])->save();
    }

    return $token;
}

test('the integrations page shows the server url and the connected assistants', function () {
    $this->withoutVite();
    $user = User::factory()->create();
    $claude = ClientFactory::new()->create(['name' => 'Claude']);
    $claudeAgain = ClientFactory::new()->create(['name' => 'Claude']);
    $chatGpt = ClientFactory::new()->create(['name' => 'ChatGPT']);
    $gone = ClientFactory::new()->create(['name' => 'Old app']);

    assistantToken($user, $claude, ['created_at' => now()->subDays(3)]);
    assistantToken($user, $claudeAgain, ['created_at' => now()->subDay()]);
    // The access token has expired but the refresh token still works.
    assistantToken($user, $chatGpt, ['expires_at' => now()->subDay(), 'created_at' => now()->subDays(2)]);
    assistantToken($user, $gone, ['revoked' => true]);
    assistantToken(User::factory()->create(), ClientFactory::new()->create(['name' => 'Someone else\'s']));

    $this->actingAs($user)
        ->get(route('integrations.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/integrations')
            ->where('aiAssistants.serverUrl', url('/mcp'))
            ->has('aiAssistants.connected', 2)
            ->where('aiAssistants.connected.0.name', 'Claude')
            ->where('aiAssistants.connected.0.client_id', $claudeAgain->id)
            ->where('aiAssistants.connected.1.name', 'ChatGPT'));
});

test('disconnecting an assistant revokes every connection of that app', function () {
    $user = User::factory()->create();
    $claude = ClientFactory::new()->create(['name' => 'Claude']);
    $claudeAgain = ClientFactory::new()->create(['name' => 'Claude']);
    $chatGpt = ClientFactory::new()->create(['name' => 'ChatGPT']);
    $first = assistantToken($user, $claude);
    $second = assistantToken($user, $claudeAgain);
    $kept = assistantToken($user, $chatGpt);

    $this->actingAs($user)
        ->delete(route('integrations.ai-assistants.destroy', $claude->id))
        ->assertRedirect(route('integrations.edit'));

    expect($first->refresh()->revoked)->toBeTrue()
        ->and($second->refresh()->revoked)->toBeTrue()
        ->and(RefreshToken::where('access_token_id', $second->id)->value('revoked'))->toBeTruthy()
        ->and($kept->refresh()->revoked)->toBeFalse();
});

test('a user cannot disconnect another user\'s assistant', function () {
    $owner = User::factory()->create();
    $client = ClientFactory::new()->create(['name' => 'Claude']);
    $token = assistantToken($owner, $client);

    $this->actingAs(User::factory()->create())
        ->delete(route('integrations.ai-assistants.destroy', $client->id))
        ->assertNotFound();

    expect($token->refresh()->revoked)->toBeFalse();
});
