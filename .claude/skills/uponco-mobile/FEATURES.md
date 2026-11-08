# Uponco web — functionality inventory

Source of truth for **what** the mobile app must cover. It describes behaviour,
not web UI: the mobile app should solve the same job with native patterns, not
copy the web layout. Each feature has an ID that `PROGRESS.md` refers to.

Scope tags: **[M]** = in the mobile app, **[M-later]** = mobile after the MVP,
**[Web]** = stays on the web (link out or skip).

Web references point at where to read the real behaviour before building.
If the web code and this file disagree, the code wins: fix this file.

---

## AUTH — Authentication & account access
Web: `app/Actions/Fortify/**`, `app/Http/Controllers/Auth/GoogleAuthController.php`, `resources/js/pages/auth/*`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| AUTH-1 | Email + password login | M | Fortify today (session). Mobile needs token auth. |
| AUTH-2 | Registration (name, email, password) | M-later | Not in MVP: businesses sign up on the web. Creates a personal team; then onboarding gate. |
| AUTH-3 | Google sign-in | M | Web uses Socialite redirect; mobile uses native Google sign-in and exchanges the ID token. MVP: existing accounts only, no sign-up. |
| AUTH-4 | Forgot / reset password | M | Mobile: request the link in-app; reset can complete on web or via deep link. |
| AUTH-5 | Email verification | M | `MustVerifyEmail`; show a "check your inbox" state, resend, refresh. |
| AUTH-6 | Two-factor challenge (TOTP / recovery code) | M | Must work during mobile login. |
| AUTH-7 | Passkeys (login & manage) | M-later | Web has WebAuthn passkeys; native needs platform passkey APIs. |
| AUTH-8 | Logout | M | Revoke the device token + push token. |
| AUTH-9 | Legal consent (terms/privacy acceptance) | M | `LegalConsentController`, `terms-consent-dialog.tsx`; block app use until accepted. |
| AUTH-10 | Accept team invitation | M | `invitations/{invitation}/accept`; deep link from email. |

## ONB — Onboarding
Web: `OnboardController`, `OnboardingController`, `app/Support/OnboardingPayload.php`, `pages/onboard.tsx`, `pages/onboarding.tsx`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| ONB-1 | Onboard gate: business name, type (individual/organisation), timezone, business category (+ "other") | M-later | Not in MVP: a team that still needs onboarding is sent to the web. Required before company pages work (`Team::needsOnboarding()`). |
| ONB-2 | Onboarding checklist: Services, Profile, Schedule steps (pending/completed/skipped) | M-later | `OnboardingStep`, `OnboardingStepStatus`. Mobile: a guided setup card / flow. |

## DASH — Dashboard (home)
Web: `DashboardController`, `pages/dashboard.tsx`, `components/dashboard/*`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| DASH-1 | Stats: customers, total bookings, upcoming, services, locations | M | Booking counts are scoped: members see only their own unless they have `appointment:view-all` (owners/admins by role). Logic in `app/Support/DashboardSummary.php`. |
| DASH-2 | Weekly trend chart | M | |
| DASH-3 | Upcoming appointments list (next 6) | M | Public-page bookings get a green accent, staff ones primary blue (same cue as web). |
| DASH-4 | Member's own schedule summary (non-admins) | M | `ScheduleSummary::forUser`. |
| DASH-5 | Quick actions: create appointment / service / location from dashboard | M | Mobile: header "+" action sheet. Needs the create flows (APPT-3, SVC-2, LOC-2) first. |

## APPT — Calendar & appointments (staff side)
Web: `AppointmentController`, `app/Support/Appointments/*` (`SlotGenerator`, `AppointmentCalendar`, `AppointmentOptions`), `pages/appointments/index.tsx`, `components/appointments/*`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| APPT-1 | Calendar views (day / week / month), timezone-aware | M | Mobile slice 1: Monday-start week strip + day agenda. Month overview and day timeline not built. |
| APPT-2 | Filter by specialist / location | M | Members without `appointment:view-all` only see their own. |
| APPT-3 | Create appointment: service, location, specialist, customer (search or new), time slot, notes | M | Uses available-slot generation; respects working hours. |
| APPT-4 | Day-view quick create / update (tap empty slot) | M | `dayStore`, `dayUpdate`. Mobile: long-press or tap a free slot. |
| APPT-5 | Edit appointment | M | |
| APPT-6 | Reschedule (slot must be free) | M | Mobile: "Reschedule" sheet with the slot picker (same service/specialist/length). Drag-to-move not built. |
| APPT-7 | Cancel appointment | M | Triggers customer notification. |
| APPT-8 | Mark status: booked / no-show (past only) | M | `AppointmentStatus`. Mobile: swipe action. |
| APPT-9 | Delete appointment | M | Confirm destructively. |
| APPT-10 | Appointment detail: customer contact, service, price, delivery (online/onsite), meeting URL, client comment, internal notes, source (staff/public) | M | Tap-to-call / email / open meeting link. |
| APPT-11 | Group sessions (capacity, multiple customers per slot) | M | `ServiceType::Group`, `capacity`. |
| APPT-12 | Working-hours window shading | M | `workingHoursWindow` prop. |
| APPT-13 | Google Calendar sync of appointments | M | Server-side (`GoogleCalendarService`); mobile only shows status. |

## SCHED — Working schedule
Web: `ScheduleController`, `MemberScheduleController`, `app/Support/ScheduleSlotMap.php`, `pages/schedule/*`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| SCHED-1 | Team schedule: per-member, per-date working slots (start/end) | M | `ScheduleSlot` (user, team, date, start_time, end_time). Admin view. |
| SCHED-2 | Edit a member's schedule | M | `schedule/member/{user}`. |
| SCHED-3 | My schedule (member's own) | M | `schedule/my`. |
| SCHED-4 | Copy / repeat patterns across days/weeks | M | Web: "Also apply to" other days in the day editor + "Repeat this week" onto the next 1/2/4 weeks. |

## CUST — Customers
Web: `CustomerController`, `pages/customers/index.tsx`, `components/customers/*`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| CUST-1 | List + search customers | M | Paginate / infinite scroll. |
| CUST-2 | Create / edit customer (name, email, phone) | M | Option: import from device contacts (mobile-only bonus). |
| CUST-3 | Delete customer | M | |
| CUST-4 | Customer detail with appointment history | M | Web shows contact only; mobile adds call/message/WhatsApp/email actions and the last 30 appointments (members: their own only). |

## SVC — Services & categories
Web: `Company/ServiceController`, `Company/ServiceCategoryController`, `app/Support/ServiceOptions.php`, `pages/company/services/index.tsx`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| SVC-1 | List services grouped by category; active toggle | M | |
| SVC-2 | Create / edit service: title, category, price type (fixed/range/free), price/min/max, currency (EUR/USD/AZN), duration, technical break, slot interval, type (individual/group), capacity, delivery (online/onsite), meeting provider (Google Meet automatic / custom manual), description | M | Mobile: one grouped sheet. Per-specialist price/duration overrides (`specialist_pricing`) stay web-only for now and are preserved on save. |
| SVC-3 | Assign specialists & locations to a service | M | |
| SVC-4 | Delete service | M | |
| SVC-5 | Service categories CRUD | M | Create is inline in the service form; rename/delete not built yet. |

## LOC — Locations
Web: `Company/LocationController`, `Company/AddressLookupController`, `GooglePlacesService`, `pages/company/locations/index.tsx`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| LOC-1 | List locations; active toggle | M | |
| LOC-2 | Create / edit: name, country, city, street, unit, postal code, phone; Google Places address suggest/resolve; lat/lng | M | Mobile: native map preview, "use current location". |
| LOC-3 | Delete location | M | Not built yet (not requested in the first Manage slice). |

## TEAM — Business, members & permissions
Web: `Company/BusinessController`, `BusinessMemberController`, `BusinessInvitationController`, `Teams/*`, `pages/company/business/*`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| TEAM-1 | Business general settings: name, type, timezone, category | M | |
| TEAM-2 | Delete business | M-later | Destructive; fine to keep web-only at first. |
| TEAM-3 | Members list (owner/admin/member roles) | M | `TeamRole`. |
| TEAM-4 | Add member directly / invite by email / cancel invitation | M | |
| TEAM-5 | Edit member: profile (email, phone, job title, description), account, avatar | M | Avatar from camera or library. |
| TEAM-6 | Member permissions (`TeamPermission`: team update/delete, member add/update/remove, invitations, view-all appointments) | M | |
| TEAM-7 | Member services & locations assignment | M | |
| TEAM-8 | Remove member | M | |
| TEAM-9 | Transfer ownership | M-later | |
| TEAM-10 | Multiple teams: switch current team (M); create team (M-later) | M | Mobile: in the Profile sheet (avatar button, top right). |

## BRAND — Branding & booking page
Web: `Company/BrandController`, `app/Support/BrandPalette.php`, `pages/company/brand/index.tsx`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| BRAND-1 | Logo upload / remove | M | Camera/library + crop. |
| BRAND-2 | Brand primary colour | M | |
| BRAND-3 | Booking page design (classic / v2) | M-later | Preview opens the public page in an in-app browser. |
| BRAND-4 | Booking page languages (default + available: en, az) | M-later | |
| BRAND-5 | Share booking link / QR code | M | Mobile-only bonus: native share sheet, QR. |
| BRAND-6 | Embeddable widget script | Web | `widget/{company}.js` — no mobile equivalent needed. |

## NOTIF — Notifications
Web: `NotificationController`, `app/Notifications/**`, `Settings/PushNotificationController`, `pages/notifications/index.tsx`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| NOTIF-1 | In-app notification feed (appointment booked / rescheduled / cancelled activity) + mark read | M | `AppointmentActivity` database channel. Badge count on tab. |
| NOTIF-2 | Push notifications for appointment activity | M | Web uses WebPush; mobile needs Expo/APNs/FCM channel + device token storage. Tap opens the appointment. |
| NOTIF-3 | Push notification preferences | M | |
| NOTIF-4 | Customer emails (booked, cancelled, reminder) | Web | Server-side only; no mobile work. |

## SET — Personal settings
Web: `app/Http/Controllers/Settings/*`, `pages/settings/*`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| SET-1 | Profile: name, email | M | |
| SET-2 | Avatar upload / remove | M | |
| SET-3 | Change password | M | |
| SET-4 | Two-factor enable/disable, recovery codes | M-later | |
| SET-5 | Passkeys management | M-later | |
| SET-6 | Appearance (light/dark/system) | M | Default to system on mobile. |
| SET-7 | Language (en / az) | M | |
| SET-8 | Google integration connect / disconnect (Calendar + Meet) | M | OAuth via in-app browser session. |
| SET-9 | Delete account | M | Required by App Store rules for apps with sign-up. |
| SET-10 | "Your data" page | M | Link to web page. |

## PUB — Public booking (customer side)
Web: `PublicAppointmentController`, `BookPublicAppointmentRequest`, `pages/public/appointments/*`, `components/public-booking*`

| ID | Feature | Scope | Notes |
|---|---|---|---|
| PUB-1 | Public booking page per company (service → location → specialist → slot → details), deep links per service/location/specialist | Web | Customers book on the web; the staff app shares the link (BRAND-5). |
| PUB-2 | Customer reminder choice (email/SMS/WhatsApp offsets) | Web | Reminders sent by `SendAppointmentReminders` command. |
| PUB-3 | Customer self-cancel link | Web | |

## MKT — Marketing & legal
| ID | Feature | Scope | Notes |
|---|---|---|---|
| MKT-1 | Home, features, pricing pages | Web | |
| MKT-2 | Terms & privacy | M | Open in in-app browser from settings and sign-up. |

## X — Cross-cutting (mobile app must handle everywhere)
| ID | Concern | Notes |
|---|---|---|
| X-1 | i18n en + az | Web strings live in the frontend translation files; reuse keys where possible. |
| X-2 | Team timezone for all dates | Never use device timezone for appointment times. |
| X-3 | Roles & permissions gate UI and API | Mirror server policies; server is the authority. |
| X-4 | Offline / poor network | Cache last data, show offline banner, queue nothing destructive. |
| X-5 | Brand theming | Team colour as accent. |
