<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Mcp\ConnectedAssistants;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Disconnecting an AI assistant (Claude, ChatGPT, …) from the "AI assistants"
 * section of Settings → Integrations.
 */
class AiAssistantController extends Controller
{
    /**
     * Revoke the app's access. It has to be connected again (and approved on
     * the consent screen) before it can act for the user.
     */
    public function destroy(Request $request, string $client): RedirectResponse
    {
        abort_unless(ConnectedAssistants::disconnect($request->user(), $client), 404);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('AI assistant disconnected.')]);

        return to_route('integrations.edit');
    }
}
