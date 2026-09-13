---
paths:
  - routes/web.php
---

# Routes

## Authed appointments dashboard is at /calendar, public booking at /appointments/{company}
The authenticated appointments dashboard URLs live under `/calendar` (calendar, calendar/day/store, calendar/{appointment}, …) so they never overlap with the public booking routes at `appointments/{company}`. Route NAMES are still `appointments.*` (appointments.index/store/update/day-store/day-update/reschedule/cancel), so route()/Wayfinder call sites are unchanged — only the URL strings differ. If you add authed appointment endpoints, put them under /calendar, not /appointments. Regenerate Wayfinder with `php artisan wayfinder:generate --with-form` after route URL changes.
