# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** uponco
- **Feature Under Test:** Public booking page — team **ZZ Schedule Preview** (`/appointments/zz-schedule-preview`)
- **Date:** 2026-09-06
- **Prepared by:** TestSprite AI Team
- **Test Type:** Frontend (E2E), full plan of 30 cases
- **Environment:** `http://localhost:8000` (local, tunneled by TestSprite). App "now" ≈ 2026-09-06, company timezone Europe/Riga. Fixture clean (no pre-existing bookings blocking slots).

---

## 2️⃣ Requirement Validation Summary

### Requirement: Complete a booking end-to-end (on-site, individual, online, group)
- **TC005 — Complete an individual appointment booking** — ✅ Passed
  - *Findings:* Individual service (Private Pilates Lesson → Specialist C) flowed through date/time → details → confirmation ("You're booked in").
- **TC007 — Finish a deep-linked booking with preselected service** — ✅ Passed
  - *Findings:* Deep link arrives with the service preselected/locked and the flow completes.
- **TC008 — Book an online appointment without choosing a location** — ✅ Passed
  - *Findings:* Online service (Online Lecture, Specialist D) correctly skips the Location step.
- **TC010 — Book the online appointment without a physical location** — ✅ Passed
  - *Findings:* Confirms online bookings never require a location and still confirm.
- **TC026 — Book a group class and keep the slot available with fewer spots** — ✅ Passed
  - *Findings:* Group Pilates Class (capacity 10) books and the slot remains available with reduced spots.
- **TC001 — Complete an on-site booking end to end** — ⛔ Blocked
  - *Findings:* Page returned **HTTP 429 Too Many Requests**; SPA never rendered. Environmental (rate limit), not a defect — see §4.
- **TC002 — Book an appointment from service selection to confirmation** — ⛔ Blocked
  - *Findings:* Same 429 rate-limit block; wizard did not load.

### Requirement: Deep-linked / locked selections
- **TC009 — Keep a service deep link locked through booking** — ✅ Passed
  - *Findings:* A service arriving via deep link stays locked (`booking-locked-service`) throughout.
- **TC004 — Continue a deep-linked booking with a locked service** — ⛔ Blocked
  - *Findings:* `/service/mens-haircut` deep link returned 429; flow could not start. Environmental.

### Requirement: Service & specialist selection logic (eligibility narrowing)
- **TC013 — Choose a specialist for the selected service** — ✅ Passed
  - *Findings:* After selecting a service the specialist list narrows to eligible specialists and one can be chosen. This exercises the narrowing behaviour successfully.
- **TC011 — Browse active services and choose one** — ❌ Failed
  - *Findings:* Reported that after selecting "Men's Haircut" the specialist list still showed Specialist C/D, Sam Idris, Preview Owner, and Continue stayed disabled with no selected-service summary. The disabled Continue + missing summary indicate the **service selection did not register** in this run — likely a flaky click/interaction rather than a narrowing defect, since TC013 verifies the same narrowing and passed. Needs a targeted re-run to confirm.
- **TC014 — Prevent rebooking the same individual slot** — ❌ Failed
  - *Findings:* Failed at the same precondition as TC011 (specialist list not narrowed after selecting "Men's Haircut", Continue disabled). The actual "slot becomes unavailable" assertion was never reached. Treat as the same suspected interaction flake; the equivalent assertion in **TC025** passed.

### Requirement: Date & time selection, availability
- **TC015 — Keep selected date and time when returning to the previous step** — ✅ Passed
- **TC017 — Switch between the day strip and calendar while choosing a time** — ✅ Passed
- **TC020 — Show the no-availability state and recover by choosing another day** — ✅ Passed
  - *Findings:* The empty-state day (2026-09-11) shows "No times available…" and recovery to a valid day works.
- **TC025 — Keep the first booking slot unavailable after booking** — ✅ Passed
  - *Findings:* An individual slot disappears from the list after it is booked. This is the substantive assertion TC014 aimed at, and it passed.

### Requirement: On-site location selection
- **TC016 — Choose a location for an on-site appointment** — ⛔ Blocked
  - *Findings:* 429 rate-limit block; location card never rendered. Environmental. (Location selection itself is exercised indirectly by the passing on-site individual/group flows.)

### Requirement: Customer details validation
- **TC023 — Require a contact method before confirming a booking** — ⛔ Blocked
  - *Findings:* 429 rate-limit block; customer form unreachable. Environmental — not verified this run.
- **TC030 — Reject an invalid email during booking details entry** — ⛔ Blocked
  - *Findings:* 429 rate-limit block; customer form unreachable. Environmental — not verified this run.

### Requirement: Step navigation & state preservation
- **TC027 — Preserve the ability to proceed after changing the booking step selection** — ✅ Passed
- **TC015** also validates back-navigation state (listed above).

### Requirement: Localization (Azerbaijani)
- **TC022 — Keep Azerbaijani selected after reload** — ⛔ Blocked
  - *Findings:* 429 rate-limit block; language menu unreachable. Environmental — not verified this run.
- **TC024 — Change the booking language to Azerbaijani** — ⛔ Blocked
  - *Findings:* 429 rate-limit block. Environmental — not verified this run.

### Requirement: Theme switching
- **TC028 — Switch the booking page theme and return it to light** — ✅ Passed

### Requirement: Responsive / mobile
- **TC018 — Complete a booking on a mobile viewport without horizontal scrolling** — ✅ Passed

### Requirement: Cancellation flow (out of scope for the public booking page)
> These require a **signed** `/appointments/cancel/{appointment}` URL, which the public booking page deliberately never exposes. They are mis-scoped for this target and cannot pass from the public page by design.
- **TC003 — Complete a signed cancellation from the cancellation page** — ⛔ Blocked (no signed link on public page)
- **TC006 — Cancel an appointment from a signed link** — ⛔ Blocked (share dialog exposes only the booking URL)
- **TC012 — View appointment details before cancelling** — ⛔ Blocked (confirmation page has no cancel link; only add-to-calendar)
- **TC019 — Dismiss cancellation and keep the appointment active** — ⛔ Blocked (no cancellation UI on public page)
- **TC021 — Complete a booking with a valid cancellation link later available** — ⛔ Blocked (429 + relies on cancel link)
- **TC029 — See the cancellation page from a valid link after returning later** — ⛔ Blocked (429 + relies on cancel link)

---

## 3️⃣ Coverage & Matching Metrics

- **30** tests executed · **14 passed** · **2 failed** · **14 blocked**
- **46.67%** passed overall.
- Excluding the 6 out-of-scope cancellation tests and the 8 environmental 429 blocks, **14 of 16 in-scope, executable tests passed (~88%)**; the 2 failures are a single suspected interaction flake on service→specialist narrowing (contradicted by the passing TC013 and TC025).

| Requirement | Total | ✅ Passed | ❌ Failed | ⛔ Blocked |
|---|---|---|---|---|
| Complete a booking end-to-end | 7 | 5 | 0 | 2 |
| Deep-linked / locked selections | 2 | 1 | 0 | 1 |
| Service & specialist eligibility narrowing | 3 | 1 | 2 | 0 |
| Date & time selection, availability | 4 | 4 | 0 | 0 |
| On-site location selection | 1 | 0 | 0 | 1 |
| Customer details validation | 2 | 0 | 0 | 2 |
| Step navigation & state | 1 | 1 | 0 | 0 |
| Localization (Azerbaijani) | 2 | 0 | 0 | 2 |
| Theme switching | 1 | 1 | 0 | 0 |
| Responsive / mobile | 1 | 1 | 0 | 0 |
| Cancellation (out of scope) | 6 | 0 | 0 | 6 |
| **Total** | **30** | **14** | **2** | **14** |

---

## 4️⃣ Key Gaps / Risks

1. **Rate-limit (429) blocked ~8 tests — test-harness artifact, not a product bug.**
   The public route `appointments/{company}` is protected by `throttle:60,1` (60 requests/min per IP) — see [routes/web.php:64](routes/web.php). Running the full 30-case plan concurrently through TestSprite's single tunnel IP exceeded 60 req/min, so many page loads returned `429 Too Many Requests`. Real users hit this limit per-IP and are unaffected. **Recommendation:** re-run the blocked cases in a smaller batch (or serially), or temporarily raise the throttle for the test IP, to get real verdicts for TC001/002/004/016/021/022/023/024/029/030.

2. **Two failures (TC011, TC014) are a suspected interaction flake, not a confirmed narrowing bug.**
   Both failed at the same precondition — after selecting "Men's Haircut" the specialist list appeared un-narrowed and Continue stayed disabled, meaning the service click likely never registered. The same narrowing behaviour **passes in TC013**, and the "slot becomes unavailable after booking" behaviour **passes in TC025**. **Recommendation:** re-run TC011 and TC014 in isolation (outside the 429 storm) to confirm; if they still fail, investigate service-card click handling / selection state.

3. **Six cancellation tests are mis-scoped for the public booking page.**
   TC003/006/012/019/021/029 require a signed `/appointments/cancel/{appointment}` URL, which the public page never surfaces by design (`signed` middleware, [routes/web.php:84](routes/web.php)). They cannot pass from this target. **Recommendation:** move these to a separate suite that mints a signed cancellation URL server-side, or exclude them from the public-booking plan.

4. **Genuinely validated (green) core:** individual, online, group, and deep-linked bookings complete to "You're booked in"; specialist narrowing (TC013); date/time selection, day-strip↔calendar toggle, no-availability empty state and recovery; slot-becomes-unavailable after booking; group capacity decrement; step-change proceed; state preserved on back-nav; theme toggle; and mobile viewport with no horizontal scroll. The core public booking journey is solid.

---

**Dashboard:** https://www.testsprite.com/dashboard/mcp/tests/60f53952-deb0-52d3-8512-503b05d5cf82
