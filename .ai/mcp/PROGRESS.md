# Uponco MCP — progress

Tracks the work in `PLAN.md`. Update it at the end of every work session.

Status keys: `[ ]` not started · `[~]` in progress · `[x]` done and tested · `[-]` skipped.

## Current state

- **Phase:** 5 — code done and tested; directory submission waiting on your items in `DIRECTORY.md` §2
- **Next task:** Deploy, reconnect Claude (new logo, 18 tools, 3 prompts), add the AI-assistants section to the privacy policy, publish a connector docs page, then submit (see `DIRECTORY.md`).
- **Last session:** 2026-11-15 — Phase 5: customer and service tools, prompts, server logo, explicit tool annotations, one-page tools list, directory checklist. Phase 4 deployed.

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

- [x] "AI assistants" section on Settings → Integrations — server URL with copy button, Claude/ChatGPT steps, connected apps (grouped by app name, last active) with Disconnect. `App\Mcp\ConnectedAssistants`, `Settings\AiAssistantController@destroy` (route `integrations.ai-assistants.destroy`), `components/integrations/ai-assistants-card.tsx`. Tests: `tests/Feature/Integrations/AiAssistantsTest.php`
- [x] Rate limit on `/mcp` — `throttle:mcp`, 120 requests/minute per user (`AppServiceProvider::configurePassport`)
- [x] Log of write actions — `BusinessTool` logs every successful non-read-only tool call to the app log as "MCP write action" (tool, user, team, OAuth client, arguments without customer details/notes, appointment id)
- [x] `switch-team` tool — shipped as `switch-business`; `get-account` now lists `businesses`
- [x] `passport:purge` scheduled daily (`bootstrap/app.php`)

## Phase 5 — Later

Tests: `tests/Feature/Mcp/ManageToolsTest.php`, plus `ConnectTest` (logo, prompts, annotations).

- [x] Customer tools — `add-customer`, `update-customer` (`SaveCustomerRequest` through the bridge; any member, like the Customers page)
- [x] Service tools — `create-service`, `update-service` (`SaveServiceRequest` + `SaveService`; owners/admins only; update keeps unspecified fields and specialists' own price/duration overrides). Locations: not done (geocoding/address flow; do on request)
- [x] Prompts — `summarize-day`, `plan-week`, `book-customer` (`app/Mcp/Prompts`)
- [x] Logo — `#[Icon]` on `UponcoServer` (Claude showed no logo for the custom connector before)
- [x] Every tool sets `readOnlyHint`, `destructiveHint`, `openWorldHint` explicitly (ChatGPT requires all three; Claude requires title + one)
- [x] `tools/list` returns all tools on one page (`$defaultPaginationLength = 50`; the default 15 would have hidden tools)
- [~] Claude and ChatGPT directory submissions — checklist, portal answers, listing text and privacy-policy draft in `.ai/mcp/DIRECTORY.md`; waiting on privacy policy update, docs page, demo account

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
- 2026-11-15 — The switch tool is named `switch-business` (users and the assistant talk about businesses, not teams). It changes the user's current team, so the web app switches too, like the mobile app's switcher.
- 2026-11-15 — Write actions go to the default log, not a separate file: production runs in containers where a local log file would be lost.
- 2026-11-15 — Assistants register a new OAuth client on every connect, so Settings groups connections by client name and Disconnect revokes all of that app's tokens.
- 2026-11-15 — Destructive hint is true for every write that emails a customer or overwrites data (book, reschedule, cancel, no-show, hours, day off, switch business, update customer/service); false only for purely additive writes (add customer, create service).
- 2026-11-15 — Write tools take `date` + `time` in the business timezone (not ISO instants), so the assistant cannot get the UTC offset wrong.
- 2026-11-15 — Permission failures return a tool error the assistant can relay ("You can only see your own …"); appointments the user may not see return "Appointment not found." so their existence does not leak.

## Notes for production

- Run `php artisan migrate` (five `oauth_*` tables).
- Passport keys: run `php artisan passport:keys` once on the server, or set `PASSPORT_PRIVATE_KEY` / `PASSPORT_PUBLIC_KEY` in the environment. `storage/*.key` is git-ignored.
- The app must be served from the domain root: OAuth discovery is at `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/mcp`.
- `passport:purge` runs daily from the scheduler — make sure `schedule:run` runs on the server.
- MCP write actions are in the normal application log, tagged "MCP write action".
