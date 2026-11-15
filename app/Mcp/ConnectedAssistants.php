<?php

namespace App\Mcp;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Laravel\Passport\RefreshToken;
use Laravel\Passport\Token;

/**
 * The AI assistants (Passport OAuth clients) a user has connected to the MCP
 * server, and disconnecting them. Assistants register a new client every
 * time someone connects, so connections are grouped by the app's name: one
 * "Claude" row, however often the user reconnected.
 */
class ConnectedAssistants
{
    /**
     * The apps that can still act for the user: they hold an unexpired access
     * token, or a live refresh token to get a new one. Most recent first.
     *
     * @return array<int, array{client_id: string, name: string, last_active_at: string}>
     */
    public static function for(User $user): array
    {
        return self::liveTokens($user)
            ->with('client:id,name')
            ->get()
            ->filter(fn (Token $token): bool => $token->client !== null)
            ->groupBy(fn (Token $token): string => $token->client->name)
            ->map(function (Collection $tokens, string $name): array {
                $latest = $tokens->sortByDesc('created_at')->first();

                return [
                    // Any one of the app's clients; disconnecting covers them all.
                    'client_id' => $latest->client_id,
                    'name' => $name,
                    // Tokens are renewed daily, so the newest one tells when the app was last used.
                    'last_active_at' => $latest->created_at->toIso8601String(),
                ];
            })
            ->sortByDesc('last_active_at')
            ->values()
            ->all();
    }

    /**
     * Revoke every token the user gave the app with this client id's name, so
     * all of that app's connections stop working at once. Returns false when
     * the user has no connection with that client.
     */
    public static function disconnect(User $user, string $clientId): bool
    {
        $client = Token::query()
            ->where('user_id', $user->getAuthIdentifier())
            ->where('client_id', $clientId)
            ->with('client:id,name')
            ->first()
            ?->client;

        if ($client === null) {
            return false;
        }

        $tokenIds = Token::query()
            ->where('user_id', $user->getAuthIdentifier())
            ->whereHas('client', fn (Builder $query) => $query->where('name', $client->name))
            ->pluck('id');

        Token::query()->whereKey($tokenIds)->update(['revoked' => true]);
        RefreshToken::query()->whereIn('access_token_id', $tokenIds)->update(['revoked' => true]);

        return true;
    }

    /**
     * @return Builder<Token>
     */
    protected static function liveTokens(User $user): Builder
    {
        return Token::query()
            ->where('user_id', $user->getAuthIdentifier())
            ->where('revoked', false)
            ->where(function (Builder $query): void {
                $query->where('expires_at', '>', now())
                    ->orWhereExists(fn ($refresh) => $refresh
                        ->from((new RefreshToken)->getTable())
                        ->whereColumn('access_token_id', (new Token)->getTable().'.id')
                        ->where('revoked', false)
                        ->where('expires_at', '>', now()));
            });
    }
}
