<?php

use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Passport\Passport;

/**
 * Give Passport a throwaway signing key pair, so the suite does not depend on
 * the key files in storage/ (which are not in source control).
 */
function usePassportTestKeys(): void
{
    $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
    openssl_pkey_export($key, $privateKey);

    config([
        'passport.private_key' => $privateKey,
        'passport.public_key' => openssl_pkey_get_details($key)['key'],
    ]);
}

/**
 * The JSON-RPC call an MCP client sends to run the get-account tool.
 *
 * @return array<string, mixed>
 */
function getAccountCall(): array
{
    return [
        'jsonrpc' => '2.0',
        'id' => 1,
        'method' => 'tools/call',
        'params' => ['name' => 'get-account', 'arguments' => (object) []],
    ];
}

test('the mcp server rejects a request without a token and points to the oauth metadata', function () {
    // Sent the way MCP clients do, which is not a plain JSON request.
    $response = $this->post('/mcp', getAccountCall(), ['Accept' => 'application/json, text/event-stream']);

    $response->assertUnauthorized();
    expect($response->headers->get('WWW-Authenticate'))
        ->toContain('resource_metadata="'.url('/.well-known/oauth-protected-resource/mcp').'"');
});

test('the oauth metadata tells clients where to register, authorize and get tokens', function () {
    $this->getJson('/.well-known/oauth-protected-resource/mcp')
        ->assertOk()
        ->assertJsonPath('resource', url('/mcp'))
        ->assertJsonPath('authorization_servers.0', url('/'));

    $this->getJson('/.well-known/oauth-authorization-server')
        ->assertOk()
        ->assertJsonPath('authorization_endpoint', url('/oauth/authorize'))
        ->assertJsonPath('token_endpoint', url('/oauth/token'))
        ->assertJsonPath('registration_endpoint', url('/oauth/register'))
        ->assertJsonPath('code_challenge_methods_supported', ['S256']);
});

test('the consent screen sends a guest to log in first', function () {
    $redirectUri = 'https://claude.ai/api/mcp/auth_callback';

    $clientId = $this->postJson('/oauth/register', [
        'client_name' => 'Claude',
        'redirect_uris' => [$redirectUri],
    ])->json('client_id');

    $this->get('/oauth/authorize?'.http_build_query([
        'client_id' => $clientId,
        'redirect_uri' => $redirectUri,
        'response_type' => 'code',
        'code_challenge' => str_repeat('a', 43),
        'code_challenge_method' => 'S256',
    ]))->assertRedirect(route('login'));
});

test('an assistant can register, get the user\'s consent and call a tool as that user', function () {
    usePassportTestKeys();
    $this->withoutVite();

    $user = User::factory()->create();
    $redirectUri = 'https://claude.ai/api/mcp/auth_callback';
    $codeVerifier = Str::random(64);

    $clientId = $this->postJson('/oauth/register', [
        'client_name' => 'Claude',
        'redirect_uris' => [$redirectUri],
    ])->assertCreated()->json('client_id');

    $this->actingAs($user)
        ->get('/oauth/authorize?'.http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'mcp:use',
            'state' => 'opaque-state',
            'code_challenge' => strtr(rtrim(base64_encode(hash('sha256', $codeVerifier, true)), '='), '+/', '-_'),
            'code_challenge_method' => 'S256',
        ]))
        ->assertOk()
        ->assertSee('Connect Claude to '.config('app.name'))
        ->assertSee($user->email);

    $callback = $this->post('/oauth/authorize', ['auth_token' => session('authToken')])
        ->assertRedirectContains($redirectUri)
        ->headers->get('Location');

    parse_str(parse_url($callback, PHP_URL_QUERY), $query);
    expect($query['state'])->toBe('opaque-state');

    $accessToken = $this->post('/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => $clientId,
        'redirect_uri' => $redirectUri,
        'code_verifier' => $codeVerifier,
        'code' => $query['code'],
    ])->assertOk()->json('access_token');

    // A fresh request with only the bearer token, as the assistant sends it.
    $this->app['auth']->forgetGuards();

    $this->flushSession()
        ->withToken($accessToken)
        ->postJson('/mcp', getAccountCall())
        ->assertOk()
        ->assertJsonPath('result.structuredContent.user.email', $user->email)
        ->assertJsonPath('result.structuredContent.ready', true);
});

test('a connected assistant sees only the token owner\'s account', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Passport::actingAs($user, ['mcp:use']);

    $this->postJson('/mcp', getAccountCall())
        ->assertOk()
        ->assertJsonPath('result.structuredContent.user.email', $user->email)
        ->assertJsonPath('result.structuredContent.business.id', $user->currentTeam->id)
        ->assertJsonMissing(['email' => $otherUser->email]);
});

test('the unused device login flow is switched off', function () {
    $this->get('/oauth/device')->assertNotFound();
    $this->postJson('/oauth/device/code')->assertNotFound();
});

test('a connected assistant can list every uponco tool', function () {
    Passport::actingAs(User::factory()->create(), ['mcp:use']);

    $tools = $this->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/list'])
        ->assertOk()
        ->json('result.tools');

    expect(collect($tools)->pluck('name')->sort()->values()->all())->toBe([
        'book-appointment',
        'cancel-appointment',
        'find-available-slots',
        'get-account',
        'get-appointment',
        'get-business-overview',
        'get-working-hours',
        'list-appointments',
        'mark-no-show',
        'reschedule-appointment',
        'search-customers',
        'set-day-off',
        'set-working-hours',
        'switch-business',
    ]);
});

test('the mcp server is rate limited per user', function () {
    Passport::actingAs(User::factory()->create(), ['mcp:use']);

    $this->postJson('/mcp', getAccountCall())
        ->assertOk()
        ->assertHeader('X-RateLimit-Limit', 120);
});
