---
paths:
  - routes/web.php
  - routes/api.php
---

# Routes

## Authed appointments dashboard is at /calendar, public booking at /appointments/{company}
The authenticated appointments dashboard URLs live under `/calendar` (calendar, calendar/day/store, calendar/{appointment}, …) so they never overlap with the public booking routes at `appointments/{company}`. Route NAMES are still `appointments.*` (appointments.index/store/update/day-store/day-update/reschedule/cancel), so route()/Wayfinder call sites are unchanged — only the URL strings differ. If you add authed appointment endpoints, put them under /calendar, not /appointments. Regenerate Wayfinder with `php artisan wayfinder:generate --with-form` after route URL changes.

## Mobile API lives under /api/v1 with Sanctum tokens
routes/api.php serves the Expo mobile app only: prefix `v1`, route names `api.v1.*`, auth `auth:sanctum` (bearer tokens, no SPA cookies). Controllers in app/Http/Controllers/Api/V1, requests in app/Http/Requests/Api/V1, responses via app/Http/Resources/V1 — never Inertia. Reuse the web's Actions/Form Requests/app/Support helpers and permission checks instead of duplicating logic. Token login (`api.v1.auth.token.store`) uses the Fortify `throttle:login` limiter and re-verifies 2FA statelessly. Roadmap/progress: .claude/skills/uponco-mobile/PROGRESS.md.
