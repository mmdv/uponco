---
name: public-booking-qa
description: "Browser QA checklist for the public booking page (v2 design and classic). Use when asked to test, verify, QA or smoke-test public booking / appointments / the booking page — online, group or individual sessions, time slots, services, double booking, cancellation — or after changing resources/js/components/public-booking-v2/**, SlotGenerator, PublicAppointmentController or the booking request/concern."
---

# Public booking QA

End-to-end checks for `/appointments/{company}` driven in the built-in browser.
Every scenario below was run once by hand; repeat the ones the change touches, and
all of them when asked to "test booking".

## 1. Run an isolated server (never book through the user's `composer run dev`)

`.env` has `MAIL_MAILER=resend` + `QUEUE_CONNECTION=database`, and `composer run dev`
runs a `queue:listen` worker — a booking made against it sends a **real email via
Resend**. `php artisan serve` does NOT pass env overrides through to its worker
(only an allowlist: APP_ENV, PATH, …), so `MAIL_MAILER=log php artisan serve` still
sends mail. Use PHP's built-in server from `public/` instead:

```bash
cd public && MAIL_MAILER=log QUEUE_CONNECTION=sync PHP_CLI_SERVER_WORKERS=4 \
  php -S 127.0.0.1:8123 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
```

(run_in_background; Vite on :5173 from the user's dev server is reused via `public/hot`.)
Confirm after the first booking: `grep -c '<customer email>' storage/logs/laravel.log` is ≥1
and `DB::table('jobs')->count()` is 0. Use only `@example.test` customer emails.
`PHP_CLI_SERVER_WORKERS=4` is required for the concurrency checks to be real.
Kill with `lsof -ti tcp:8123 | xargs kill` when done.

Open with `preview_start {url: "http://127.0.0.1:8123/appointments/zz-schedule-preview"}`.
If the pane is hidden, `document.hidden` is true and CSS animations stay at t=0 —
screenshots time out; use `get_page_text`/`javascript_tool`, and call
`el.getAnimations().forEach(a => a.finish())` before measuring layout.

## 2. Fixture: team 7 `zz-schedule-preview` (design = v2, Europe/Riga)

Re-read it each time (`Service::where('team_id',7)->with('specialists','locations')`);
ids can drift. As of 2026-09-29:

| Service (id, slug) | Type | Specialists | Notes |
|---|---|---|---|
| Men's Haircut (11) | individual 30m €20 | A (10) 30m, B (11) **45m override** | per-specialist duration |
| Beard Trim (13) | individual 15m | A, B, Sam Idris (14) | Sam offers only this |
| Group Pilates Class (9, `group-pilates-class`) | group cap 4, 60m, slot_interval 60 | Lisa Berg (12) | |
| Private Pilates Lesson (10) | individual 60m | Lisa Berg | shares Lisa with the group |
| Online Lecture (Latvian) (14, `online-lecture-latvian`) | individual online google_meet | Specialist D (13) | no location |
| Preview haircut (6) | individual 60m | Preview Owner (9), B 30m, Lisa | owner is a specialist |

One location: Preview studio (4). Schedule slots are **date-specific** — seed today and
the next days if missing:
`ScheduleSlot::create(['team_id'=>7,'user_id'=>$id,'date'=>'YYYY-MM-DD','start_time'=>'09:00','end_time'=>'17:00'])`.
Team 4 `uponco` is the **classic** design but is the real demo calendar — browse it,
don't submit bookings there.

Useful hooks: `booking-service-{id}`, `booking-specialist-{id}`, `booking-picker`,
`booking-picker-continue`, `appointment-continue-button`, `booking-day-YYYY-MM-DD`,
`booking-slot-HHMM`, `appointment-save-button`. React inputs need real typing
(`computer type` on a `find` ref), not `.value=`. Skip the phone field (see memory
on react-phone-number-input); email alone satisfies the contact rule.

## 3. Scenarios

Work out expected slots by hand first: team timezone windows, grid =
`slot_interval` or `min(duration, 30)`, last start = window end − duration, past
starts hidden, existing bookings (+ technical break) block overlapping starts.

1. **Catalogue** — service sheet lists every active service with title, category,
   duration, price, description matching the DB; inactive services hidden; category
   chips and counts correct; search filters.
2. **Individual** — Men's Haircut → A: today's slots skip anything overlapping an
   existing booking; B shows the 45‑min grid (last start 16:00 in a 09–17 window).
   Book; success screen + DB row (`start_at` UTC, `source=public`,
   `delivery_type=onsite`, `location_id`), customer created, email in log, reminder
   row only if `start − offset` is in the future.
3. **Group** — Group Pilates: hourly slots with "N left". Book → "N−1 left". Same
   email again → "You have already booked this session…". Fill to capacity → slot
   shows struck-through "Fully booked", disabled. Lisa's Private Pilates must lose
   every start overlapping the group hour.
4. **Online** — Online Lecture: no location step, row has `location_id=null`,
   `delivery_type=online`, `online_meeting_provider=google_meet`; `meeting_url` stays
   null unless the specialist connected Google.
5. **Double booking (two tabs)** — two tabs, identical service/specialist/day/time,
   different customers; submit one then the other. Second must bounce to the date
   step with "That time can't be booked any more", refreshed slots, and keep the
   typed name/email. Exactly one DB row.
6. **True race** — from one page, fire 3 identical POSTs at once with `fetch`
   (JSON body, `X-XSRF-TOKEN` from the cookie) → exactly one row. Group: fire
   capacity+1 at once → exactly `capacity` rows. Both redirect on success *and*
   failure, so assert on the DB, not the response.
7. **Tampered requests** (expect no row): past start, off-grid start (e.g. :07),
   outside working hours, another team's service id, specialist who doesn't offer
   the service. Known gap (2026-09-29): an **online** service POSTed with a
   `location_id` is accepted and stored with that location — the request only
   validates location for onsite services. Booking POST is `throttle:10,1` —
   more than 10/min per IP returns 429, so space the probes out.
8. **Validation** — empty submit → name + "email or phone" errors; invalid email.
9. **Specialist-first** — pick a specialist first; service list narrows to theirs.
   **Single-option auto-pick** — from the plain hub, choosing Men's Haircut must
   select Preview studio for you, and Online Lecture must select Specialist D;
   switching to a service with several specialists drops the auto-picked one.
   The summary's duration follows the specialist (Men's Haircut + B = 45 min).
10. **Deep links** — `/appointments/{company}/service/{slug}` preselects service (+
    single location); `/specialist/{id}`, `/location/{slug}` likewise.
11. **Cancel** — email's signed link (in `laravel.log`) → confirm dialog → cancelled
    page; slot is bookable again; tampered signature or another id → 403; reopening
    shows the cancelled state.
12. **Motion / layout** — desktop sheet is a centred dialog that fades + rises 12px
    (no zoom, no sideways slide); switching choice crossfades; mobile (375×812) is
    full-screen and slides up from the bottom.
13. **Classic regression** — a classic team renders its services and reaches the
    date/time step.

Not yet covered here: technical breaks (no fixture service has one), split shifts,
price ranges/"from" prices, Azerbaijani copy.

## 4. Afterwards

List the appointment ids you created and ask before cancelling/removing them — they
block slots on the shared fixture. Stop the :8123 server.
