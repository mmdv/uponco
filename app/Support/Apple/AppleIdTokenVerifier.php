<?php

namespace App\Support\Apple;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Verifies a Sign in with Apple identity token from the phone.
 *
 * The token is a JWT signed with one of Apple's published keys; this checks
 * the signature and expiry, that Apple issued it, and that it was issued for
 * one of our app's bundle ids.
 */
class AppleIdTokenVerifier
{
    protected const KEYS_URL = 'https://appleid.apple.com/auth/keys';

    protected const ISSUER = 'https://appleid.apple.com';

    protected const KEYS_CACHE_KEY = 'apple-sign-in-keys';

    /**
     * Return the Apple identity for a valid token, or null if it is invalid.
     *
     * @return array{id: string, email: ?string, email_verified: bool, is_private_email: bool}|null
     */
    public function verify(string $identityToken): ?array
    {
        $keys = $this->keys();

        if ($keys === null) {
            return null;
        }

        try {
            $claims = (array) JWT::decode($identityToken, JWK::parseKeySet($keys, 'RS256'));
        } catch (Throwable) {
            return null;
        }

        $isApple = ($claims['iss'] ?? null) === self::ISSUER;
        $isOurApp = in_array($claims['aud'] ?? null, config('services.apple.client_ids', []), true);

        if (! $isApple || ! $isOurApp || blank($claims['sub'] ?? null)) {
            return null;
        }

        return [
            'id' => (string) $claims['sub'],
            'email' => isset($claims['email']) ? (string) $claims['email'] : null,
            'email_verified' => filter_var($claims['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'is_private_email' => filter_var($claims['is_private_email'] ?? false, FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * Apple's public signing keys (a JWK set), cached for a day.
     *
     * @return array<string, mixed>|null
     */
    protected function keys(): ?array
    {
        $cached = Cache::get(self::KEYS_CACHE_KEY);

        if (is_array($cached)) {
            return $cached;
        }

        try {
            $response = Http::timeout(10)->get(self::KEYS_URL);
        } catch (Throwable $e) {
            report($e);

            return null;
        }

        $keys = $response->successful() ? $response->json() : null;

        if (! is_array($keys) || empty($keys['keys'])) {
            return null;
        }

        Cache::put(self::KEYS_CACHE_KEY, $keys, now()->addDay());

        return $keys;
    }
}
