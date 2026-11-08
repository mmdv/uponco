<?php

namespace App\Support\Google;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Verifies a Google ID token produced by native Google sign-in on the phone.
 *
 * Uses Google's tokeninfo endpoint, which checks the signature and expiry;
 * this class then checks the token was issued for one of our OAuth clients
 * and that Google has verified the email address.
 */
class GoogleIdTokenVerifier
{
    protected const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

    /**
     * @var list<string>
     */
    protected const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

    /**
     * Return the Google identity for a valid token, or null if it is invalid.
     *
     * @return array{id: string, email: string, name: ?string}|null
     */
    public function verify(string $idToken): ?array
    {
        try {
            $response = Http::timeout(10)->get(self::TOKENINFO_URL, ['id_token' => $idToken]);
        } catch (Throwable $e) {
            report($e);

            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $claims = $response->json();

        $isOurClient = in_array($claims['aud'] ?? null, $this->allowedClientIds(), true);
        $isGoogleIssuer = in_array($claims['iss'] ?? null, self::ISSUERS, true);
        $isVerifiedEmail = filter_var($claims['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (! $isOurClient || ! $isGoogleIssuer || ! $isVerifiedEmail || blank($claims['sub'] ?? null) || blank($claims['email'] ?? null)) {
            return null;
        }

        return [
            'id' => (string) $claims['sub'],
            'email' => (string) $claims['email'],
            'name' => $claims['name'] ?? null,
        ];
    }

    /**
     * The OAuth client ids a token may be issued for: the mobile clients plus
     * the web client (Expo's Google sign-in can request tokens for it).
     *
     * @return list<string>
     */
    protected function allowedClientIds(): array
    {
        return array_values(array_filter([
            config('services.google.client_id'),
            ...config('services.google.mobile_client_ids', []),
        ]));
    }
}
