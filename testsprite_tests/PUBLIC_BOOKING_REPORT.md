# Public Booking Page — TestSprite Report

**Target:** `/appointments/zz-schedule-preview` (team 7, "ZZ Schedule Preview", owner `preview-owner@example.test`)
**Date:** 2026-09-05 · **Scope:** public booking page only (unauthenticated)
**Tests:** 30 executed across two runs (6 signed-cancellation cases excluded — a `signed` URL is bound to the app host and cannot survive TestSprite's tunnel).

## Result

| Verdict | Count | IDs |
|---|---|---|
| ✅ Passed | 27 | TC001, TC004, TC005, TC007–TC011, TC014–TC018, TC020–TC026, TC028, TC030–TC033, TC035, TC036 |
| ⚠️ False positive | 3 | TC002, TC013, TC027 |
| 🐞 Real product finding | 1 | (surfaced by run 1's blocked cases) |

Net: the booking flow works. One genuine product gap found; three "failures" were test-harness artifacts, disproven in the browser.

## 🐞 Finding — a specialist with no location dead-ends an on-site booking

Picking an on-site service and then a specialist who is attached to **no location** leaves the Location card showing "No locations available." with **Continue permanently disabled** — no path forward and no explanation.

- Root cause: `resources/js/lib/appointments.ts:51` filters locations by `location.specialist_ids.includes(specialistId)` — a strict pairwise intersection. A specialist attached to a service but to no location is offered in the picker, then is incompatible with every location that service runs at.
- On the fixture this was Specialist A (attached to 3 services, 0 locations). I attached Specialist A to "Preview studio" and the 7 dependent tests then passed.
- Product-level: nothing stops a real team from assigning a specialist to a service without a location. The wizard should either hide such a specialist or fall back to the service's locations, rather than dead-end. **Left for a product decision.**

## ⚠️ False positives (verified in-browser, not bugs)

TC002 / TC013 / TC027 claimed the specialist list "doesn't narrow" after choosing a service. The generated Playwright clicked the collapsed Service **card header** (pointer-intercepted, service never selected) and then asserted on the pre-selection state via positional XPath. Direct browser check:

- On arrival: Preview Owner, Sam Idris, Specialist A, B, C, D (all six) — correct.
- After selecting "Men's Haircut": **Specialist A, Specialist B only** — correct.

Narrowing works. `booking-flow.tsx:153` passes the already-narrowed `availableSpecialists`; `getAvailableOptions` (`appointments.ts:58`) filters correctly.

## Coverage confirmed passing

Individual booking end-to-end · online-delivery booking with no location · group-class capacity ("{n} left") staying open after a booking while an individual slot disappears · empty-day "No times available" state · day-strip ↔ calendar toggle · back-navigation preserving selections · service/specialist/location deep links locked + back link · unknown-slug 404s · name/contact/email validation (client-side, no post) · Azerbaijani persisting across reload · theme switch · copy booking link · mobile viewport.

## Environment changes made for the run

- Enabled service 14 "Online Lecture (Latvian)" — **permanent**, per your choice.
- Attached Specialist A (user 10) to location "Preview studio" — fixture consistency fix (see Finding).
- Seeded 09:00–17:00 availability for the 5 service-carrying specialists across 2026-09-05…09-18, **leaving 2026-09-11 empty** for the empty-state test.
- Route throttles on the public booking routes were temporarily raised, then **restored to 60/10**.
- `public/hot` was moved aside to serve built assets, then **restored**.
- **9 real test bookings** (ids 40–48) were created on team 7 and persist — see cleanup note.
