<?php

namespace App\Mcp\Tools;

use App\Models\Team;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[Name('switch-business')]
#[Title('Switch business')]
#[Description('Work in another of the user\'s businesses (get-account lists them). Every other tool then acts on that business. This also switches the business the user sees in the Uponco app, as the business switcher there does.')]
#[IsIdempotent]
class SwitchBusinessTool extends Tool
{
    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'business_id' => $schema->integer()->description('The business id from get-account.')->required(),
        ];
    }

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->hasVerifiedEmail()) {
            return Response::error(__('Verify your email address in Uponco first, then try again.'));
        }

        $businessId = $request->validate(['business_id' => ['required', 'integer']])['business_id'];
        $team = Team::find($businessId);

        // Same answer for "does not exist" and "not yours".
        if (! $team instanceof Team || ! $user->switchTeam($team)) {
            return Response::error(__('Business not found. get-account lists the businesses you belong to.'));
        }

        return Response::structured([
            'business' => [
                'id' => $team->id,
                'name' => $team->name,
                'role' => $user->teamRole($team)?->value,
                'timezone' => $team->timezone ?: config('app.timezone'),
            ],
            // Not set up yet: the other tools will say what to finish first.
            'ready' => ! $team->needsOnboarding(),
        ]);
    }
}
