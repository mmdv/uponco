---
paths:
  - 'app/Mcp/**'
---

# Mcp

## MCP server: Passport OAuth beside Sanctum, gates inside tools
The MCP server (routes/ai.php, POST /mcp, App\Mcp\Servers\UponcoServer) authenticates with Passport's `api` guard; the mobile API stays on Sanctum. User keeps ONLY Sanctum's HasApiTokens — do not add Passport's HasApiTokens/OAuthenticatable: the two traits clash (createToken/tokens/withAccessToken signatures) and Passport's guard only duck-types withAccessToken/currentAccessToken, which Sanctum's trait satisfies (proved by tests/Feature/Mcp/ConnectTest full OAuth flow).

Account gates (verified email, current team membership, onboarding) are NOT HTTP middleware on /mcp: every business tool must call App\Mcp\AccountReadiness::blocker($user) and return Response::error() with its message, so the assistant can tell the user what to fix. Tools are thin wrappers over app/Actions + app/Support — never duplicate booking rules. Tool names are kebab-case; read tools carry #[IsReadOnly].

bootstrap/app.php forces JSON errors for `mcp` so a tokenless client gets 401 + WWW-Authenticate (starts OAuth) instead of a login redirect. Plan/progress: .ai/mcp/PLAN.md, .ai/mcp/PROGRESS.md.
