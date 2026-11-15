---
paths:
  - 'app/Mcp/**'
---

# Mcp

## MCP server: Passport OAuth beside Sanctum, gates inside tools
The MCP server (routes/ai.php, POST /mcp, App\Mcp\Servers\UponcoServer) authenticates with Passport's `api` guard; the mobile API stays on Sanctum. User keeps ONLY Sanctum's HasApiTokens — do not add Passport's HasApiTokens/OAuthenticatable: the two traits clash (createToken/tokens/withAccessToken signatures) and Passport's guard only duck-types withAccessToken/currentAccessToken, which Sanctum's trait satisfies (proved by tests/Feature/Mcp/ConnectTest full OAuth flow).

Account gates (verified email, current team membership, onboarding) are NOT HTTP middleware on /mcp: every business tool must call App\Mcp\AccountReadiness::blocker($user) and return Response::error() with its message, so the assistant can tell the user what to fix. Tools are thin wrappers over app/Actions + app/Support — never duplicate booking rules. Tool names are kebab-case; read tools carry #[IsReadOnly].

bootstrap/app.php forces JSON errors for `mcp` so a tokenless client gets 401 + WWW-Authenticate (starts OAuth) instead of a login redirect. Plan/progress: .ai/mcp/PLAN.md, .ai/mcp/PROGRESS.md.

## Business MCP tools extend BusinessTool
Every tool that touches business data extends App\Mcp\Tools\BusinessTool and implements handleForBusiness(Request, User, Team): the base handle() runs AccountReadiness::blocker() first, so tools never call it themselves (only get-account, which reports the blocker, extends Tool directly). Show appointments through App\Mcp\AppointmentData (times converted to the business timezone, with offset). Refuse with Response::error() and a sentence the assistant can relay; for an appointment the user may not see, answer "Appointment not found." so its existence does not leak. Reuse the web/mobile visibility rules (AppointmentAccess, TeamPermission::ViewAllAppointments, admin-or-self for schedules).

## MCP write tools reuse form requests via FormRequestBridge
Write tools never re-implement validation: run the app's own FormRequest with App\Mcp\FormRequestBridge::validate(Request::class, $user, $input, $routeParameters) (e.g. SaveAppointmentRequest for booking, SaveMemberScheduleRequest with ['user' => $member]), then call the same action/concern the web uses (createAppointment with AppointmentSource::Assistant, RescheduleAppointment, CancelAppointment, UpdateAppointmentStatus, SaveMemberSchedule). Tools take `date` + `time` in the business timezone (BusinessTool::businessTime), not ISO instants. Working-hours changes never cancel bookings; they return appointments_outside_hours. AppointmentSource::Assistant ('assistant') marks AI bookings — frontend treats it like staff (only 'public' is tinted).

## MCP write log, rate limit and connected-app grouping
BusinessTool::handle logs every successful tool call that is NOT #[IsReadOnly] as Log::info('MCP write action') with tool, user, team, oauth_client_id and arguments minus customer_name/email/phone/notes — so a new write tool must leave off #[IsReadOnly] and needs no logging code of its own; never log customer contact details. /mcp is throttled by the `mcp` limiter (120/min per user, AppServiceProvider). Claude/ChatGPT register a new Passport client per connect, so App\Mcp\ConnectedAssistants groups tokens by client name and disconnect() revokes all of that app's access + refresh tokens. switch-business extends Tool directly (must work while the current team still needs onboarding).

## Every MCP tool declares all three hints explicitly
Directory review (ChatGPT requires all three, Claude requires title + one) means every tool class carries #[IsReadOnly] or #[IsReadOnly(false)], #[IsDestructive(true|false)] and #[IsOpenWorld(false)] — ConnectTest fails otherwise. Destructive = true for any write that emails a customer or overwrites data; false only for purely additive writes. BusinessTool::isReadOnly reads the attribute's VALUE (IsReadOnly(false) is a write and gets logged). UponcoServer sets $defaultPaginationLength = 50 so tools/list returns every tool on one page — raise it if tools exceed 50. Never name a Tool helper toArray()/name()/description() (clashes with Laravel\Mcp\Server\Tool). Directory checklist: .ai/mcp/DIRECTORY.md.
