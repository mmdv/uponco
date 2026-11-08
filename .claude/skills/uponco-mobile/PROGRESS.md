# Uponco mobile — progress

Updated by the `uponco-mobile` skill at the end of every work session.
Feature IDs refer to `FEATURES.md`.

Status keys: `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` skipped / web-only.
Phase 1 items are API-only (`[x]` = endpoint built + tested); feature items in Phase 3+ are `[x]` only when API is tested and the screen works.

## Current state

- **Phase:** 3 — Core business features (Phase 2 skeleton done; Google sign-in screen deferred)
- **Next task:** Continue Manage (user's priority): Services (SVC-1..5), then team members / business settings; Calendar after.
- **Last session:** 2026-11-08 — Manage tab + Locations (list/add/edit) + Profile sheet

## Phase 0 — Decisions
- [x] Stack: Expo (React Native) + TypeScript + Expo Router — confirmed by user
- [x] Mobile repo location: `/Users/arifmammadov/Desktop/uponco/uponco-mobile` (own git repo, branch `main`)
- [~] Bundle IDs / app name / Apple & Google developer accounts — name "Uponco", ID `com.uponco.app`, scheme `uponco` (defaults, change before Phase 6); no developer accounts yet (needed before Phase 6)
- [x] MVP scope signed off: owner/staff app only; public booking stays web

## Phase 1 — API foundation (this Laravel repo)
- [x] Install Sanctum + `routes/api.php` with `/api/v1` prefix
- [x] Token login / logout / me (AUTH-1, AUTH-8), incl. 2FA step (AUTH-6)
- [-] Register (AUTH-2) — not in MVP (business app; sign-up stays on web)
- [x] Email verification resend (AUTH-5), forgot password (AUTH-4) — links open the web pages
- [x] Google ID-token exchange (AUTH-3) — existing accounts only; needs `GOOGLE_MOBILE_CLIENT_IDS` in .env once the iOS/Android OAuth clients exist
- [x] Legal consent endpoint (AUTH-9)
- [x] Team context: current team + list (in `me`), switch (TEAM-10) — no team creation in MVP
- [x] Device push token storage + Expo push channel (NOTIF-2 backend) — appointment alerts to the assigned specialist
- [x] API error format + validation format agreed and documented in Decisions

## Phase 2 — App skeleton (mobile repo)
- [x] Expo app created (SDK 58, RN 0.88), TS strict, ESLint, Expo Router, React Compiler on
- [x] API client + TanStack Query + secure token storage
- [~] Auth screens: login, forgot, 2FA, verify email done (AUTH-1, AUTH-4..6); login + wrong-password error + log out verified in the simulator (2FA, forgot password and the gate screens not yet clicked through); Google sign-in (AUTH-3) waits for Google OAuth iOS/Android clients + a development build
- [x] Navigation shell: native tabs (Today, Calendar, Customers, Notifications, Manage), one stack per tab; avatar button in every tab header opens the Profile sheet (account, business switch TEAM-10, log out, app version)
- [~] Theming (light/dark) + i18n en/az from device language done; brand accent (X-5) and in-app language switch (SET-7) pending; API messages are English-only (Laravel `HandleLocale` is web-only)
- [-] Onboarding gate + checklist (ONB-1, ONB-2) — not in MVP; teams needing onboarding get a "finish setup on the web" screen

## Phase 3 — Core business features (MVP)
- [~] Dashboard / Today (DASH-1..4): API + screen built; empty state, stats, 7-day bars, share sheet and dark mode checked in the simulator; populated next-up/list/member-schedule views not yet seen (dev DB has no future bookings); DASH-5 quick actions wait for the create flows
- [ ] Calendar views (APPT-1, APPT-2, APPT-12)
- [ ] Appointment detail (APPT-10)
- [ ] Create / edit appointment + slot picker (APPT-3, APPT-4, APPT-5, APPT-11)
- [ ] Reschedule / cancel / status / delete (APPT-6..9)
- [ ] Customers list, detail, CRUD (CUST-1..4)
- [ ] Notification feed + badge (NOTIF-1)
- [ ] Push notifications end-to-end, tap → appointment (NOTIF-2, NOTIF-3)

## Phase 4 — Management features
- [ ] Services + categories (SVC-1..5)
- [x] Locations (LOC-1, LOC-2): list, add, edit — API tested, screens checked in the simulator (creating a real location was not exercised end-to-end to keep dev data clean; covered by API tests). Delete (LOC-3) not built (user asked for list/add/edit)
- [ ] Schedule: team, member, my (SCHED-1..4)
- [ ] Business settings (TEAM-1)
- [ ] Members, invites, permissions, services/locations (TEAM-3..8)
- [ ] Accept invitation deep link (AUTH-10)
- [ ] Branding: logo, colour, share link/QR (BRAND-1, BRAND-2, BRAND-5)
- [ ] Personal settings: profile, avatar, password, Google integration, delete account, your data (SET-1..3, SET-8..10)

## Phase 5 — Post-MVP
- [ ] Passkeys (AUTH-7, SET-5), 2FA management (SET-4)
- [ ] Booking design & languages (BRAND-3, BRAND-4)
- [ ] Delete business, transfer ownership (TEAM-2, TEAM-9)
- [ ] Offline polish (X-4)

## Phase 6 — Release
- [ ] App icons, splash, store screenshots
- [ ] Privacy labels / data safety forms
- [ ] EAS build + TestFlight / internal testing
- [ ] Store submission

## Decisions log
<!-- Append: date — decision — why. Keep it short. -->
- 2026-11-08 — Expo + React Native + TypeScript — reuses the team's React/TS skills and some web types/helpers; Expo handles push, deep links, builds.
- 2026-11-08 — Separate repo at `../uponco-mobile` — keeps Laravel deploys and app releases independent.
- 2026-11-08 — MVP excludes registration and onboarding (user decision): accounts and team setup happen on the web; app is sign-in only.
- 2026-11-08 — MVP = staff app only — customers keep booking on the web; the app shares the booking link (BRAND-5).
- 2026-11-08 — Defaults: app name "Uponco", bundle/package `com.uponco.app`, URL scheme `uponco` — placeholder until store accounts exist.
- 2026-11-08 — API layout: `routes/api.php`, prefix `/api/v1`, names `api.v1.*`; controllers `app/Http/Controllers/Api/V1/**`, requests `app/Http/Requests/Api/V1/**`, resources `app/Http/Resources/V1/**`. JSON errors already forced for `api/*` in `bootstrap/app.php`.
- 2026-11-08 — Token login is stateless: `POST /api/v1/auth/token` {email, password, device_name, code?, recovery_code?}. 2FA account without a code → `200 {"two_factor": true}` (same shape as Fortify's JSON login); client resends with `code` or `recovery_code`. Success → `201 {token, user}`. Uses the web `throttle:login` limiter. Logout `DELETE /api/v1/auth/token` revokes only the current token.
- 2026-11-08 — Tokens don't expire (Sanctum default); revoked on logout. Revisit if a "devices" screen or expiry is wanted.
- 2026-11-08 — Unverified / terms-not-accepted users still get a token; `GET /api/v1/me` returns `email_verified`, `terms_accepted`, `current_team.needs_onboarding` so the app gates screens. Business endpoints should add `verified` middleware.
- 2026-11-08 — Error format: Laravel defaults, forced to JSON for `api/*`. 401 = missing/invalid token (app signs out), 403 = not allowed, 404 = not found, 422 = `{message, errors: {field: [msg]}}`, 429 = rate limited. Success bodies: single resources wrapped in `data`; auth endpoints return `{token, user}`.
- 2026-11-08 — Endpoint map (Phase 1): `POST auth/token`, `POST auth/google`, `POST auth/forgot-password`, `DELETE auth/token`, `POST auth/email/verification-notification`, `GET me`, `PUT me/current-team`, `POST me/legal-consent`, `PUT|DELETE me/push-token` — all under `/api/v1`.
- 2026-11-08 — Google sign-in verifies the ID token with Google's tokeninfo endpoint (no new dependency); accepted audiences = `GOOGLE_CLIENT_ID` + `GOOGLE_MOBILE_CLIENT_IDS`. Like web Google login, it skips the 2FA step. Unknown Google address → 422, no sign-up.
- 2026-11-08 — Push: Expo push service via plain HTTP (`App\Notifications\Channels\ExpoPushChannel`, no SDK). Tokens in `device_push_tokens`, FK to the Sanctum token so logout removes them; `DeviceNotRegistered` tickets delete the token. Push receipts are not polled yet. Tap payload: `data.type = appointment_activity`, `data.appointment_id`.
- 2026-11-08 — Team switch reuses the web rule (403 for a team you're not in); the current team stays stored on the user, so web and app share it.
- 2026-11-08 — Mobile routes live in `src/app/` (SDK 58 template), not `app/`. Gating uses `Stack.Protected` in the root layout, one guard per `sessionGate()` state, so deep links into protected screens redirect safely.
- 2026-11-08 — Tabs use `expo-router/native-tabs` (real UITabBar / Material bottom nav, SF Symbols + Material icons). The Today tab is the `(today)` group so it is the `/` route.
- 2026-11-08 — Token in SecureStore with `WHEN_UNLOCKED_THIS_DEVICE_ONLY` (not restored to a new phone). 2FA keeps email+password in memory only until the code is accepted.
- 2026-11-08 — Teams needing onboarding, unverified emails and unaccepted terms each get a full-screen gate with a "log out" escape; onboarding and sign-up open the web in an in-app browser.
- 2026-11-08 — Switching team drops every cached query except `me` (cached data belongs to the old team).
- 2026-11-08 — Entry route: `src/app/index.tsx` redirects by `sessionGate()`; Today lives at `/today` (not a `(today)` group at `/`). Opening `/` on a protected group showed Expo Router's "Unmatched Route" instead of redirecting.
- 2026-11-08 — Dashboard numbers live in `App\Support\DashboardSummary` (extracted from the web `DashboardController`), used by both web and API. API business routes use `verified` + `EnsureTeamMembership` (same as web) but not `EnsureTeamOnboarded` (it redirects to a web page; the app gates onboarding itself).
- 2026-11-08 — Today screen order: greeting + date → next appointment (big card) → 3 stat tiles → member's own schedule (members only) → 7-day bars → later appointments grouped by day → share booking link (native share sheet). "Today" comes from the server's `is_today` (team timezone), never the device clock. Rows aren't tappable until appointment detail (APPT-10) exists.
- 2026-11-08 — Navigation (user decision): right-most tab is **Manage** (business management hub); account things moved to a **Profile** sheet opened from an avatar button at the top right of every tab. Routes: `src/app/(app)/_layout.tsx` is a Stack holding `(tabs)` + `profile` (modal); tabs live in `src/app/(app)/(tabs)/`.
- 2026-11-08 — Manage is owners/admins only (same as the web `company/*` pages, `EnsureTeamMembership:admin`); members see a short explanation. The hub only lists sections that are built — add a row per new section.
- 2026-11-08 — Locations API: `GET|POST locations`, `GET|PATCH locations/{id}`, `GET locations/options` (countries, services, specialists), `GET locations/address/suggest|resolve` (the web's `AddressLookupController` reused as-is). Saving goes through `App\Actions\Locations\SaveLocation` (shared with the web controller) and `SaveLocationRequest`. Another team's location → 404 (web uses 403).
- 2026-11-08 — Location form is a modal sheet: Cancel / Save in the header, swipe-to-dismiss disabled while there are unsaved edits, Google address search fills the fields (manual typing clears the stored geocode), country via a searchable page-sheet picker, services/specialists as check lists. Send the full payload on PATCH: `SaveLocationRequest` treats a missing `is_active` as false.
- 2026-11-08 — Forms: Cancel on an edited form asks "Discard your changes?" (Keep editing / Discard); picker sheets autofocus their search box.
- 2026-11-08 — No Apple/Google developer accounts yet — develop in simulator / dev builds; accounts required before TestFlight (Phase 6). Apple enrolment can take days, start before Phase 6.

## Session log
<!-- Append: date — what was done — tests run — what's next. Newest at the bottom. -->
- 2026-11-08 — Phase 0: stack, repo location, MVP scope, app identity defaults decided — no tests (decisions only) — next: Sanctum + `/api/v1` foundation.
- 2026-11-08 — Installed Sanctum (`install:api`), `HasApiTokens` on User, token login (with 2FA code / recovery code), logout, `me` with team context; dev DB migrated — `tests/Feature/Api` 17 passed, `tests/Feature/Auth` + `Settings` 82 passed — next: register, verification resend, forgot password endpoints.
- 2026-11-08 — Scope change: no register / onboarding in MVP. Added forgot password, verification resend, Google ID-token sign-in, legal consent, team switch, push token register/remove, Expo push for appointment alerts; dev DB migrated — `tests/Feature/Api` 51 passed; Notifications/Appointments/Auth/Settings 270/271 (1 pre-existing date-dependent failure: PublicBookingTest "per service preview honours the specialist duration override" expects a date label but gets "Tomorrow") — next: Phase 2 Expo app.
- 2026-11-08 — Phase 2: created Expo app (SDK 58) at `../uponco-mobile`; API client, SecureStore token, TanStack Query, en/az i18n; sign-in, 2FA (auto-submit, code/recovery), forgot password; verify-email / terms / finish-setup / session-error gates; native tabs with placeholders; More tab with team switch + log out — `tsc` clean, `expo lint` clean, `expo-doctor` 20/20, iOS bundle exports — not run on a simulator yet — next: simulator run, then Phase 3 Today/dashboard.
- 2026-11-08 — Simulator run (iPhone 17 Pro, iOS 26.5, Expo Go) against `localhost:8000` with fixture user `preview-owner@example.test` (team 7): fixed unmatched `/` start route, centred multi-line button labels, log-out dialog now says Cancel — verified sign-in (token "iPhone 17 Pro" issued), Today shows user/team, native tab bar, More (account, teams, log out → token revoked server-side), wrong password error under the email field — `tsc` + lint clean — next: Phase 3 Today/dashboard.
- 2026-11-08 — Phase 3 Today: extracted `DashboardSummary`; added `GET /api/v1/dashboard` (stats, 7-day trend, upcoming, member schedule, booking URL); Today screen with skeletons, pull-to-refresh, error/retry, empty state, share sheet — `tests/Feature/Api` + web `DashboardTest` 71 passed; mobile `tsc` + lint clean — not yet viewed in the simulator — next: simulator check, then Calendar.
- 2026-11-08 — Simulator check of Today (team 7, owner): empty state, stats 0/41/20, 7-day bars, booking link + native share sheet, dark mode OK; fixed secondary buttons being invisible on cards (now `backgroundSelected`). Dev DB has no future appointments (latest 2026-10-26), so the populated layout wasn't seen.
- 2026-11-08 — Manage + Locations + Profile: extracted `SaveLocation` action; location API + options + address lookup routes; app restructured into `(tabs)` + Profile modal, More → Manage tab, avatar header button; Manage hub, locations list (pull-to-refresh, empty state, Off badge), location form (address search, country picker, assignments); shared ListSection/ListRow, Avatar, SelectField, CheckList — `tests/Feature/Api` + web Location/AddressLookup tests 84 passed; mobile `tsc` + lint clean — not yet viewed in the simulator.
- 2026-11-08 — Simulator check of Manage/Locations/Profile (team 7 owner): avatar button, Manage tab, hub with location count, list, edit sheet pre-filled with assignments, unchanged Save (PATCH round-trip, no DB change), new-location required-field errors, searchable country picker, Profile sheet + Done all OK. Fixed: Cancel now confirms discarding edits; picker search autofocuses. Gotchas: moving route files while Metro runs breaks HMR ("Got unexpected undefined", duplicate `REASharedTransitionBoundary`) — restart with `npx expo start --clear`; typing on the hardware keyboard with nothing focused can hit Expo Go's reload key.
