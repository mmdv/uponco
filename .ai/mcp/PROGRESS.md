# Uponco MCP — progress

Tracks the work in `PLAN.md`. Update it at the end of every work session.

Status keys: `[ ]` not started · `[~]` in progress · `[x]` done and tested · `[-]` skipped.

## Current state

- **Phase:** 1 — Foundation and connect flow (code done and tested; live connect checks open)
- **Next task:** Run the app on a public HTTPS URL (tunnel or staging) and connect from Claude and ChatGPT with the URL `<app url>/mcp`. Then start Phase 2 (read tools).
- **Last session:** 2026-11-15 — plan written; Phase 1 built: Passport, `/mcp`, consent screen, `get-account`, tests

## Phase 1 — Foundation and connect flow

- [x] Add `laravel/mcp` (^0.9.7) and `laravel/passport` (^13.11)
- [x] Passport migrations, keys, `api` guard (`User` keeps Sanctum's trait only — see Decisions)
- [x] `routes/ai.php`: OAuth discovery/registration routes (throttled 60/min) + `/mcp` behind `auth:api`
- [x] `UponcoServer` with server instructions
- [x] Gates: verified email, current team membership, onboarded team (`App\Mcp\AccountReadiness`, checked inside tools)
- [x] `get-account` tool
- [x] Consent screen in Uponco's style (`resources/views/mcp/authorize.blade.php`) — checked in the browser 2026-11-15: light, dark, phone width
- [x] Pest tests (`tests/Feature/Mcp`): 401 + discovery, client registration, full consent → token → tool call, gates
- [ ] Checked with the MCP Inspector (`php artisan mcp:inspector mcp`)
- [ ] Connected from Claude over a public HTTPS URL
- [ ] Connected from ChatGPT over a public HTTPS URL

## Phase 2 — Read tools

- [ ] `get-business-overview`
- [ ] `list-appointments`
- [ ] `get-appointment`
- [ ] `find-available-slots`
- [ ] `get-working-hours`
- [ ] `search-customers`

## Phase 3 — Write tools

- [ ] Bridge from tool arguments to `SaveAppointmentRequest`
- [ ] `book-appointment`
- [ ] `reschedule-appointment`
- [ ] `cancel-appointment`
- [ ] `set-working-hours`
- [ ] `set-day-off`
- [ ] `mark-no-show`
- [ ] Decide: `AppointmentSource::Assistant`

## Phase 4 — Product surface

- [ ] "AI assistants" section on Settings → Integrations (URL, steps, connected apps, revoke)
- [ ] Rate limit on `/mcp`
- [ ] Log of write actions
- [ ] `switch-team` tool

## Phase 5 — Later

- [ ] Manage tools (services, customers, locations)
- [ ] Prompts
- [ ] Claude and ChatGPT directory submissions

## Decisions

- 2026-11-15 — OAuth through Passport next to Sanctum (Sanctum stays for the mobile app).
- 2026-11-15 — Tools act on the user's current team.
- 2026-11-15 — `User` does not use Passport's `HasApiTokens` / `OAuthenticatable`: it clashes with Sanctum's trait, and Passport's guard works with Sanctum's (covered by the full-flow test).
- 2026-11-15 — Account gates live inside the tools, not as HTTP middleware, so the assistant gets a message to relay instead of a failed connection.
- 2026-11-15 — Access tokens last 1 day, refresh tokens 90 days (`AppServiceProvider::configurePassport`).
- 2026-11-15 — Passport's device login flow is switched off (`AppServiceProvider::register`); its page 500'd and nothing uses it.
- 2026-11-15 — Any redirect domain may register (`mcp.redirect_domains` default `*`); tighten in Phase 4 if wanted.

## Notes for production

- Run `php artisan migrate` (five `oauth_*` tables).
- Passport keys: run `php artisan passport:keys` once on the server, or set `PASSPORT_PRIVATE_KEY` / `PASSPORT_PUBLIC_KEY` in the environment. `storage/*.key` is git-ignored.
- The app must be served from the domain root: OAuth discovery is at `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/mcp`.
- Schedule `passport:purge` (not done yet — add in Phase 4).
