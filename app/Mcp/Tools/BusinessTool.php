<?php

namespace App\Mcp\Tools;

use App\Mcp\AccountReadiness;
use App\Models\Team;
use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool;

/**
 * A tool that works on the connected user's current business. It checks the
 * account gates first (see {@see AccountReadiness}) and hands the ready user
 * and team to {@see handleForBusiness()}, so no tool can skip them.
 */
abstract class BusinessTool extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response|ResponseFactory
    {
        /** @var User $user */
        $user = $request->user();

        if ($blocker = AccountReadiness::blocker($user)) {
            return Response::error($blocker);
        }

        return $this->handleForBusiness($request, $user, $user->currentTeam);
    }

    /**
     * Run the tool for a user whose account and business are ready.
     */
    abstract protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory;

    /**
     * The business timezone every date and time is read and written in.
     */
    protected function timezone(Team $team): string
    {
        return $team->timezone ?: config('app.timezone');
    }
}
