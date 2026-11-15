# Uponco MCP — plan

Goal: a user connects their Uponco account to Claude or ChatGPT and then checks
appointments, books, reschedules and cancels them, and sets working hours and
days off, by chatting. Progress is tracked in `PROGRESS.md` next to this file.

## Ground rules

- Built with `laravel/mcp`. The server is a remote (HTTP) MCP server at `/mcp`.
- Auth is OAuth 2.1 through Laravel Passport, because Claude and ChatGPT
  connectors need OAuth. Sanctum stays for the mobile app; Passport is used
  only for MCP.
- Tools are thin wrappers. They reuse the same code as the web app and the
  mobile API (`app/Actions`, `app/Support/Appointments`, form request rules,
  `AppointmentAccess`, `TeamPermission`). No business rule is written twice.
- Tools act on the user's current team and apply the same gates as the API:
  verified email, member of the current team, onboarded team.
- Members only see and change their own appointments unless they have
  `TeamPermission::ViewAllAppointments`, exactly as on the web.
- All dates and times in tool input and output are in the team's timezone.
- Tool names are kebab-case. Read tools are marked read-only; cancel and delete
  are marked destructive so the assistant asks before running them.

## Phase 1 — Foundation and connect flow

- Add `laravel/mcp` (production dependency) and `laravel/passport`.
- Add the `api` guard (Passport) and Passport keys.
- `routes/ai.php`: `Mcp::oauthRoutes()` (throttled) and
  `Mcp::web('/mcp', UponcoServer::class)` behind `auth:api`.
- Consent screen ("Allow <client> to access your Uponco account") in Uponco's
  style.
- Gates: verified email, current team membership, onboarded team.
- One tool: `get-account` (user, current team, role, timezone, today's date).
- Done when: Claude connects as a custom connector, shows the consent screen,
  and `get-account` returns data. Covered by Pest tests and checked with the
  MCP Inspector.

## Phase 2 — Read tools

- `get-business-overview`: services, locations and specialists with the ids the
  other tools need.
- `list-appointments`: date range, optional specialist.
- `get-appointment`: one appointment plus what the user may do with it.
- `find-available-slots`: free start times for a service and specialist.
- `get-working-hours`: a member's hours and days off for a date range.
- `search-customers`.

## Phase 3 — Write tools

- `book-appointment`, `reschedule-appointment`, `cancel-appointment`.
- `set-working-hours`, `set-day-off` (one day or a date range).
- `mark-no-show` (past appointments only).
- Booking and editing are tied to `SaveAppointmentRequest`, an HTTP form
  request. Build a small bridge that creates and validates that request from
  tool arguments so the rules stay in one place.
- `set-day-off` does not cancel existing bookings; it returns the appointments
  still on that day so the assistant can tell the user.
- Booking and cancelling email the customer, as on the web. Tool descriptions
  say so.
- Decision to make: add `AppointmentSource::Assistant` so AI bookings can be
  counted (recommended), or leave them as `Staff`.

## Phase 4 — Product surface

- "AI assistants" section on Settings → Integrations: server URL, connect steps
  for Claude and ChatGPT, list of connected apps, revoke.
- Rate limit on `/mcp` and a log of write actions.
- `switch-team` tool for users in more than one team.

## Phase 5 — Later

- Manage tools (services, customers, locations) for owners and admins.
- Prompts such as "summarize my day".
- Submit to the Claude and ChatGPT connector directories.

## Known constraints

- Claude and ChatGPT can only reach a public HTTPS URL, so the end-to-end
  connect check needs a tunnel or staging.
- OAuth discovery lives at `/.well-known/...` on the domain root. A local app
  served under a sub-path (`/uponco`) may not pass discovery.
