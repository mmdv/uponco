# Uponco MCP — progress

Tracks the work in `PLAN.md`. Update it at the end of every work session.

Status keys: `[ ]` not started · `[~]` in progress · `[x]` done and tested · `[-]` skipped.

## Current state

- **Phase:** 3 — Write tools (code done and tested; not deployed yet)
- **Next task:** Deploy, start a new Claude chat and try booking, rescheduling, cancelling and a day off on a test business. Then Phase 4 (Settings → Integrations, rate limit, write log).
- **Last session:** 2026-11-15 — Phase 3 built: six write tools, `FormRequestBridge`, `AppointmentSource::Assistant`, tests. Phase 2 deployed and used from Claude.

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
- [x] Connected from Claude at https://uponco.com/mcp (2026-11-15, after creating the Passport keys on production)
- [ ] Connected from ChatGPT over a public HTTPS URL

## Phase 2 — Read tools

All extend `App\Mcp\Tools\BusinessTool`; appointments are shown through `App\Mcp\AppointmentData` (times in the business timezone, with offset). Tests: `tests/Feature/Mcp/AppointmentToolsTest.php`, `BusinessToolsTest.php`, plus a `tools/list` check in `ConnectTest.php`.

- [x] `get-business-overview` — active services, locations, specialists (with role, `is_you`), `you_see_all_appointments`
- [x] `list-appointments` — `from`/`to` (max 42 days), `specialist_id`, `customer_id`, `include_cancelled`; members only see their own
- [x] `get-appointment` — details plus `can` (reschedule, cancel, mark/undo no-show); "not found" for anything the user may not see
- [x] `find-available-slots` — `service_id`, `date`, `days` (max 7), optional `specialist_id` (default: everyone who offers the service); free times only
- [x] `get-working-hours` — `from`/`to` (max 62 days), `specialist_id`; days without hours are `day_off`; members only their own, admins anyone
- [x] `search-customers` — name/email/phone, 20 results, `more_results`

## Phase 3 — Write tools

Tests: `tests/Feature/Mcp/AppointmentWriteToolsTest.php`, `WorkingHoursToolsTest.php`.

- [x] Bridge from tool arguments to `SaveAppointmentRequest` — `App\Mcp\FormRequestBridge` runs any form request (route parameters and user included); also used for `SaveMemberScheduleRequest`
- [x] `book-appointment` — `service_id`, `date` + `time` (business timezone), optional `specialist_id` (default: you), `location_id` (auto when only one fits), `customer_id` or new customer details, `notes`; customer emailed
- [x] `reschedule-appointment` — `RescheduleAppointment` action; upcoming, booked, with a specialist only
- [x] `cancel-appointment` — `CancelAppointment` action, `#[IsDestructive]`; customer emailed
- [x] `set-working-hours` — range + optional `weekdays` + `hours` blocks; replaces those days; returns `appointments_outside_hours`
- [x] `set-day-off` — range + optional `weekdays`; never cancels bookings, returns them in `appointments_outside_hours`
- [x] `mark-no-show` — past only, `no_show: false` undoes it; no email
- [x] Decide: `AppointmentSource::Assistant` — added (see Decisions)

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
- 2026-11-15 — Business tools extend `BusinessTool`, which runs `AccountReadiness` before `handleForBusiness()`, so a new tool cannot forget the gates.
- 2026-11-15 — AI bookings are stored with `source = assistant` (`AppointmentSource::Assistant`, label "AI assistant") so they can be counted. The column is a string, so no migration; the web shows them like staff bookings (only `public` gets the green tint).
- 2026-11-15 — Write tools take `date` + `time` in the business timezone (not ISO instants), so the assistant cannot get the UTC offset wrong.
- 2026-11-15 — Permission failures return a tool error the assistant can relay ("You can only see your own …"); appointments the user may not see return "Appointment not found." so their existence does not leak.

## Notes for production

- Run `php artisan migrate` (five `oauth_*` tables).
- Passport keys: run `php artisan passport:keys` once on the server, or set `PASSPORT_PRIVATE_KEY` / `PASSPORT_PUBLIC_KEY` in the environment. `storage/*.key` is git-ignored.
- The app must be served from the domain root: OAuth discovery is at `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/mcp`.
- Schedule `passport:purge` (not done yet — add in Phase 4).
