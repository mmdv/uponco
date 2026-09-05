# Uponco — Product & Feature Reference

> **Purpose of this file.** A single, plain-language source of truth for everything Uponco does. It is written to be handed to an AI (or a person) as context for **brand, marketing and social-media content generation**, and as an onboarding reference for the team.
>
> **Keep this file up to date.** Whenever a new feature is added, a feature is removed, or user-facing behavior changes, update the relevant section here in the same pull request. Treat it as part of "done" for any feature work.
>
> _Last reviewed: 2026-09-01_

---

## 1. What Uponco is (the one-liner)

**Uponco is your digital bridge to your customers** — web-based appointment booking and scheduling software for service businesses.

It gives any business that works by appointment its own public booking page and one shared calendar for the whole team. Customers open the booking link, pick a service, a specialist, a day and a free time slot, and confirm — **no phone calls, no back-and-forth messages, and no account needed on the customer's side.**

**Positioning line:** _"Bookings, without the back-and-forth. Share one link. Uponco takes care of the rest."_

### Who it's for
Salons, barbershops, clinics, studios, coaches, consultants, and anyone else who works by appointment. The onboarding offers ~50 business categories across these groups:

- **Hair & barbering** — hairdresser, barbershop
- **Beauty & skincare** — beauty salon, nail salon, lashes & brows, makeup artist, skincare & aesthetics, waxing & hair removal, tattoo studio, piercing studio
- **Wellness & spa** — massage salon, spa
- **Fitness & sport** — fitness & personal training, yoga studio, pilates studio, dance studio, sports coaching
- **Health & medical** — medical clinic, dental clinic, physiotherapy, nutritionist & dietitian, optician, chiropractor & osteopath, speech therapy, alternative medicine
- **Mental health & coaching** — psychologist, psychotherapist, counsellor, life & career coach
- **Pets** — veterinary clinic, pet grooming, dog training
- **Education** — online tutoring, private tutoring, language school, music lessons, driving school
- **Professional services** — consulting, photography, legal services, accounting & tax, real estate, event planning, design & creative
- **Home & auto** — automotive repair, car wash & detailing, cleaning services, repairs & handyman
- **Other** — free-text "what do you do?" for anything not listed

### The core promise (three pillars)
1. **Your own booking page** — customers pick a service, a specialist and a free time slot; no calls, no messages, no account needed.
2. **One calendar for the whole team** — every location, service and team member in one place, with double bookings blocked automatically.
3. **Less admin, more of the actual work** — automatic email confirmations, reminders and a self-serve booking flow mean less time managing the calendar.

---

## 2. Pricing & plans

Uponco is currently **in beta — every feature is free for every business.** No card, nothing to pay.

| Plan | Price | What you get |
|------|-------|--------------|
| **Free** | €0 forever | First **100 appointments free, forever**. Every feature included. No credit card. Your own public booking page and website widget. |
| **Per user** (post-beta) | €5.00 / user / month | Unlimited appointments. €5/month **per team member who takes bookings**. Everything in Free, no feature limits. Cancel anytime — no contract, no lock-in. |

**Pricing rules that matter for content:**
- An "appointment" = any confirmed booking (public page or added by the team). **Cancelled bookings are not counted** against the free 100.
- A "user" = a team member with an Uponco account who takes bookings/manages the calendar. **Customers never need an account and are never charged.**
- Currencies supported: EUR (€, default), USD ($), AZN (₼).

---

## 3. Onboarding — from sign up to first booking (~5 minutes)

The narrative: **"Live in five minutes. No setup fee, no installation, no training day."**

### Step 0 — Account & business type gate
On first entry the user chooses **how they take bookings**:
- **Just me** (Individual) — bookings under your own name / personal brand.
- **A business or organisation** — a team, or bookings under a company name.

Then they provide: **business/personal name**, **category** (from the list above, or a custom "Other"), and **timezone** (with a live local-time preview).

### Step-by-step setup wizard
The guided wizard walks through, in order:
1. **Welcome / intro**
2. **Delivery** — onsite, online, or both
3. **Location** — physical address(es)
4. **Meeting links** — how online meetings are delivered (e.g. Google Meet)
5. **Service** — your first service (name, duration, price)
6. **Profile** — your public work profile
7. **Working hours** — when you're available
8. **Done**

### Three mandatory onboarding steps (a booking can't be taken without them)
- **Set up services** — a team can't take a booking without at least one service.
- **Work profile** — the public specialist profile customers see.
- **Work hours** — availability so Uponco knows which slots are free.

Each step has a status (e.g. pending / complete), tracked per team so progress can be resumed. The dashboard nudges the business through any unfinished setup (add locations, create services, invite team, share your booking link).

---

## 4. The public booking page (the customer-facing product)

Every business gets a **public booking page** at its own shareable link (`/appointments/{company-slug}`). This is the heart of the product.

### The customer's booking flow
1. **Choose your booking details** — service, specialist, and location. Each has rich hints: "Choose a treatment", "Choose who you'll see", "Pick where to visit". Specialists show a **"Next available"** label and an About bio; locations show an address with **Get directions**.
2. **Pick a date & time** — a day strip (next 14 days) plus a full calendar view. Times show as a list; group sessions show **"{count} left"** or **"Fully booked"** capacity.
3. **Your details** — name (required) plus **email and/or phone** (at least one required so the business can reach them), and optional notes ("Anything we should know before your visit…").
4. **Confirmation** — **"You're booked in."** The customer can **add the appointment to their calendar (Google / Apple)** and book another.

**No customer account is ever required.**

### Dedicated deep-link entry points
A business can advertise links that arrive with one choice **pre-selected**, for sharper campaigns:
- `…/service/{service}` — a specific service pre-chosen
- `…/specialist/{specialist}` — a specific team member pre-chosen
- `…/location/{location}` — a specific branch pre-chosen

### Booking page appearance & sharing
- **Light / dark theme** toggle.
- **Multi-language** — the page renders in the business's chosen default language, with a language switcher.
- **Share menu** — copy booking link, native share sheet ("Book with {company}").
- **Brand identity** — the page reflects the business's logo and brand primary color.

### Self-serve cancellation
Customers get a **signed cancellation link**. They can cancel their own appointment (which frees the slot). The flow handles already-cancelled and past appointments gracefully. Cancelling is permanent and frees up the time slot.

### Embeddable website widget
Every business gets a **single `<script>` tag** (`/widget/{company}.js`) it can drop into its own website — the full booking flow, embedded, with **no configuration** to copy. The booking page can also be embedded via iframe.

---

## 5. Appointments (the business-side calendar)

The shared team calendar is where staff manage everything behind the booking page.

- **One shared calendar** for the whole business — every location, service, and team member.
- **Double bookings blocked automatically** — a booked individual slot disappears from availability.
- **Day view** — staff can create and edit appointments directly on a day for a chosen customer (start time, duration, details).
- **Manual booking** — staff can add a booking for a customer (searching existing customers or entering new details) — counts the same as a public booking.
- **Reschedule** — move an appointment to a new time.
- **Cancel** — cancelled appointments are **kept in the database** (for reporting) but no longer occupy a slot or count toward totals.
- **Notes** — internal notes plus the customer's own comment.
- **Delivery per appointment** — onsite (location shared) or online (meeting link).

### Appointment types & configuration
- **Individual** appointments (one-on-one) and **Group** sessions (limited **capacity**, e.g. "6 of 8 spots filled").
- **Online or onsite** delivery — online appointments can auto-generate a meeting link (e.g. Google Meet); onsite bookings share the location.
- **Statuses:** Booked, Cancelled.

---

## 6. Services & service categories

Services are what customers book. Each **service** has:
- Title, description, active/inactive toggle
- **Price type:** Fixed, Range (min–max), or Free — with currency
- **Duration**, **technical break** (buffer after), **slot interval**
- **Service type:** Individual or Group (with **capacity** for groups)
- **Delivery type:** Online or Onsite, plus online meeting provider
- Optional **service category** for grouping

**Service categories** let a business group its services (e.g. "Haircuts", "Color") for a tidier booking page. Services are soft-deleted, so historical appointments always resolve the service they were booked for.

---

## 7. Locations (branches)

A business can run **multiple locations** and manage bookings across every branch from one unified calendar. Each **location** has:
- Name, active/inactive toggle
- Full address (country, city, street, unit, postal code) with **address lookup/autocomplete** (place ID, formatted address, latitude/longitude) so customers get accurate directions
- Phone
- **Services offered at this location** (many-to-many)
- **Specialists who work at this location** (many-to-many)

---

## 8. Team, members, roles & invitations

A business is a **Team** (type: Individual or Organisation). Members belong to teams with roles.

### Roles & permissions
- **Owner** — full control (all permissions), incl. delete team. The owner also counts as a bookable specialist.
- **Admin** — manage company: update team, add/update members, create/cancel invitations. Manages services, locations, brand, business settings.
- **Member** — takes bookings and manages their own calendar; gated out of company management.

### Team management
- **Add a member directly** — create an account for them (name, surname, job title, email, password) and add to the team immediately.
- **Invite a member** — send an email invitation with a role; the invite link routes guests to signup/login and resolves the account state automatically.
- **Pending invitations** — view and cancel invitations not yet accepted.
- **Per-member setup** — each member has a public **profile** (job title, description, avatar), assigned **locations**, assigned **services**, and their own **working hours**.

---

## 9. Scheduling & availability (working hours)

Availability is what turns services + team into a live booking calendar.

- **Per-specialist availability** — each team member sets the hours they work.
- **Week and Month views** for planning.
- **Time blocks** per day, **day off** marking, and **quick presets**.
- **"Repeat this week"** — copy a week's pattern (working days and days off) onto the weeks ahead.
- **Bulk edit** — apply hours to multiple selected days at once ("Also apply to…").
- **My Schedule** — every member manages their own week/month; admins can edit any member's schedule.
- Uponco combines each specialist's hours, service durations, breaks and existing bookings into the real-time free-slot list customers see.

---

## 10. Customers (lightweight CRM)

- A per-team **customer list** — the people the business works with.
- Each customer: name, email, phone. **At least an email or phone** is required so the business can reach them.
- Searchable when booking (staff type to find an existing customer).
- Customers created from public bookings are captured here automatically.

---

## 11. Notifications & communications

### To the customer (email)
- **Booking confirmation** email when an appointment is booked (sent as "{team} via Uponco").
- **Cancellation** email.
- Marketed benefit: **automatic reminders before each appointment** to cut no-shows.

### To the specialist (push notifications)
- **Web push notifications on their phone** when an appointment assigned to them is **booked, rescheduled, or cancelled.**
- Works as an installable app: **"Add Uponco to your Home Screen"** (PWA) — iOS via Safari Share → Add to Home Screen; Android/desktop via browser install.
- Set up per device; multiple devices supported. Handles unsupported browsers and blocked-permission states gracefully.

### In-app
- A **notifications feed** ("Everything that happened to your appointments") with mark-all-read.

---

## 12. Google integration (optional)

- **Connect a Google account** so **online appointments automatically get a Google Meet link** and a Google Calendar event.
- Strictly scoped: Uponco requests only the email address and Calendar events permission, **solely** to create the event and Meet link for online bookings. It does **not** read or change anything else in the calendar.
- **Disconnect at any time** in settings.

---

## 13. Branding & customization

- **Logo** upload (and removal).
- **Brand primary color** — flows through to the public booking page (falls back to platform blue).
- **Multi-language interface** — set the booking page's default language and the set of enabled languages. Currently ships **English (en)** and **Azerbaijani (az)**.
- **Team slug** — a clean, unique URL for the booking page, generated from the business name.

---

## 14. Account, settings & security

- **Profile** — public info shown to customers (job title, description, profile picture, public email that can differ from login email).
- **Account** — change login email (password-confirmed).
- **Appearance** — light/dark/system theme for the app.
- **Password** update.
- **Two-factor authentication (2FA)** — TOTP via authenticator app, with **recovery codes** (view, hide, regenerate).
- **Push notifications** settings (see §11).
- **Integrations** — Google (see §12).
- **Legal consent** — accept current Terms & Privacy (gated dialog before using the app).

---

## 15. Data, privacy & trust (content-ready messaging)

Headline: **"Your data stays yours."** Uponco only asks for what it needs to run bookings and **never sells your data or your customers' data.**

What Uponco collects and why:
- **Account details** (name, email) — to create the account, sign in, send booking notifications.
- **Business details** (company name, logo, locations, services, team, hours) — to build the booking page and compute free slots.
- **Customers' booking details** (name, contact, choices) — to confirm appointments, show them on the calendar, send reminders. **The business owns this data; Uponco only processes it on their behalf.**
- **Google account** — only if connected, only for calendar event + Meet link.

**What Uponco never does:** never uses Google user data for advertising or profiling; never sells data.

---

## 16. Operator backoffice (internal)

An internal **backoffice**, restricted to the Uponco operator team, to manage the platform: delete teams and users. Not a customer-facing feature.

---

## 17. Feature checklist (quick scan for content ideas)

- [x] Public booking page, own shareable link, no customer account
- [x] Service / specialist / location deep-link entry points
- [x] Embeddable website widget (one script tag) + iframe embed
- [x] Individual appointments & group sessions with capacity
- [x] Online (auto meeting link) & onsite delivery
- [x] One shared team calendar, double-booking prevention
- [x] Manual booking, reschedule, cancel; day-view editing
- [x] Multi-location management
- [x] Services with fixed/range/free pricing, duration, breaks, categories
- [x] Per-specialist availability, week/month planning, repeat-week, presets
- [x] Team roles (Owner/Admin/Member), direct add & email invitations
- [x] Lightweight customer list (CRM)
- [x] Email confirmations & cancellations; marketed reminders
- [x] Web push notifications (PWA / add to Home Screen)
- [x] Optional Google Calendar + Google Meet integration
- [x] Branding: logo, brand color, multi-language (en/az)
- [x] 2FA, recovery codes, password & email management
- [x] Data-privacy stance ("your data stays yours")
- [x] ~50 business categories across 11 groups
- [x] Free for first 100 appointments; €5/user/month after beta

---

## 18. Brand voice cues (drawn from the product copy)

- Plain, reassuring, benefit-first: _"Bookings, without the back-and-forth."_
- Speed & simplicity: _"Live in five minutes. No setup fee, no installation, no training day."_
- Low commitment: _"No card, no commitment. Cancel anytime."_
- Customer-friendly: _"no calls, no messages, no account needed."_
- Trust-forward: _"Your data stays yours."_
- Signature metaphor: **"Your digital bridge to your customers."**
