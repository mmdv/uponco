<?php

namespace App\Mcp\Tools;

use App\Mcp\AccountReadiness;
use App\Models\User;
use Carbon\CarbonImmutable;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get-account')]
#[Title('Get account')]
#[Description('Who is connected and which business they are working in: the user, their role, the business name, its timezone and today\'s date there. Call this first — every date and time in the other tools is in the business timezone.')]
#[IsReadOnly]
#[IsIdempotent]
class GetAccountTool extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        /** @var User $user */
        $user = $request->user();

        $blocker = AccountReadiness::blocker($user);
        $team = $user->currentTeam;
        $timezone = $team?->timezone ?: config('app.timezone');

        return Response::structured([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'business' => $team && $user->belongsToTeam($team) ? [
                'id' => $team->id,
                'name' => $team->name,
                'role' => $user->teamRole($team)?->value,
                'timezone' => $timezone,
                'today' => CarbonImmutable::now($timezone)->toDateString(),
            ] : null,
            'ready' => $blocker === null,
            'blocker' => $blocker,
        ]);
    }
}
