<?php

use App\Mcp\Servers\UponcoServer;
use Illuminate\Support\Facades\Route;
use Laravel\Mcp\Facades\Mcp;

// OAuth discovery and client self-registration for AI clients (Claude,
// ChatGPT, …). Registration is public by design and creates a row per client,
// so it is throttled; the limit is generous because a hosted assistant's
// users all arrive from the same few IP addresses.
Route::middleware('throttle:60,1')->group(function (): void {
    Mcp::oauthRoutes();
});

// The Uponco MCP server. Passport's `api` guard resolves the user from the
// OAuth access token; account gates (verified email, team, onboarding) are
// checked inside the tools — see App\Mcp\AccountReadiness. Rate limited per
// user by the `mcp` limiter (AppServiceProvider::configurePassport).
Mcp::web('/mcp', UponcoServer::class)
    ->middleware(['auth:api', 'throttle:mcp'])
    ->name('mcp.uponco');
