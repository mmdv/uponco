---
name: uponco-mobile
description: "Builds the Uponco native mobile app (Expo / React Native) step by step from the Uponco web app. Use when asked to work on, continue, plan or check progress of the mobile app / native app / iOS / Android app, or to add a mobile API endpoint for it. Reads FEATURES.md (what web does) and PROGRESS.md (what is done), picks the next task, builds the Laravel API part and the mobile screen, then updates progress."
---

# Uponco web → Uponco mobile

Two files next to this one drive the work:

- `FEATURES.md` — everything the web app does, with IDs and scope (M / M-later / Web).
- `PROGRESS.md` — phases, checkboxes, current state, decisions and session log.

The mobile app is **not a port of the web UI**. Same jobs, same data, same rules —
but flows and components follow native mobile conventions. A web page with a table
and a modal may become a list + detail screen + bottom sheet.

## Every session

1. **Read state.** Open `PROGRESS.md` (Current state, Decisions log, last Session log
   entry) and the matching `FEATURES.md` sections. If the user named a task, do that;
   otherwise take "Next task", else the first unchecked item of the earliest open phase.
2. **Check prerequisites.** API before screen. Phase 0 decisions must be settled before
   Phase 2. If the mobile repo path in Decisions doesn't exist yet, ask before creating it.
3. **Read the real web behaviour.** Open the web references listed for the feature
   (controller, Form Request, `app/Support/**`, page/components). Note validation rules,
   permissions/policies, timezone handling and edge cases. If `FEATURES.md` is wrong or
   missing something, fix it.
4. **Design the mobile flow** (briefly, in chat): screens, navigation, native components,
   empty/loading/error/offline states. Ask the user only if a real product choice is open.
5. **Build the API part** in this repo (see API rules), with Pest tests. Run them.
6. **Build the mobile part** in the mobile repo (see Mobile rules). Run `tsc` and lint.
7. **Update `PROGRESS.md`:** tick boxes (`[x]` only when API is tested and the screen
   works), set Current state + Next task, append to Session log (date, what, tests, next),
   and add any decision to the Decisions log.
8. Keep each session to one coherent slice (e.g. "customers list + detail"). Commit only
   when the user asks.

## API rules (Laravel repo)

Follow `CLAUDE.md` and `.ai/rules/**` as for any change here. In addition:

- **Sanctum is not installed.** Adding it is a dependency change — get the user's OK first.
- Routes in `routes/api.php` under `/api/v1`, named `api.v1.*`. Auth with `auth:sanctum`.
- Return Eloquent API Resources (`app/Http/Resources/V1/**`), never Inertia responses.
- **Reuse, don't fork, business logic:** call the same Actions, Form Requests,
  `app/Support/**` helpers (`SlotGenerator`, `AppointmentOptions`, `ScheduleSlotMap`…)
  and policies the web controllers use. If logic lives inside a web controller, extract
  it to a shared class first so web and API stay identical.
- Same authorization as web (roles, `TeamPermission`, member sees own appointments
  unless `appointment:view-all`). Test the forbidden case.
- Datetimes: ISO 8601 with offset, plus the team `timezone` in responses that need it.
- Cursor/page pagination for lists; consistent error shape (422 validation, 403, 404).
- Test every endpoint with Pest feature tests (see `testing-best-practices` skill).
  Run `vendor/bin/pint --dirty --format agent`.

## Mobile rules (mobile repo)

Stack (confirm in Phase 0, then treat as settled):
Expo (latest SDK) · TypeScript strict · Expo Router (file-based, typed routes) ·
TanStack Query for server state · Zustand only if real client state appears ·
react-hook-form + zod · `expo-secure-store` for the token · `expo-notifications` ·
`expo-image` · `expo-localization` + i18n (en, az) · EAS Build/Update.

Native UX conventions:

- Bottom tabs: Today, Calendar, Customers, Notifications, Manage (decided). Account/profile is a
  modal from the avatar at the top right of each tab. Stacks inside tabs; create/edit forms are
  modal sheets with Cancel/Save in the header.
- Reusable UI: `ListSection`/`ListRow` (grouped settings-style lists), `SelectField` (searchable
  picker sheet), `CheckList` (multi-select), `Card`, `Skeleton`, `Avatar`, `Notice`.
- Bottom sheets and action sheets instead of web modals and dropdowns; native date/time
  pickers; swipe actions on list rows (cancel, no-show); long-press for context menus.
- Pull-to-refresh and infinite scroll on lists; skeletons while loading; clear empty
  states with a primary action; optimistic updates with rollback for quick toggles.
- Large touch targets (≥44pt), safe areas, keyboard-avoiding forms, Dynamic Type,
  screen-reader labels, light/dark from system, team brand colour as accent only.
- Haptics on success/destructive confirmation; native share sheet for booking links.
- Tap-to-call/email/maps/meeting links via `Linking`.
- Deep links (`uponco://` + universal links) for invitations, password reset,
  and push notification taps.
- Always show appointment times in the **team timezone**, not the device timezone.
- Respect platform differences (iOS vs Android back behaviour, permissions prompts
  asked in context, not at launch).
- App Store requirements: in-app account deletion, privacy labels, no web-only dead ends.

Code structure (mobile repo, `/Users/arifmammadov/Desktop/uponco/uponco-mobile`, Expo SDK 58):

```
src/app/                 # Expo Router routes ONLY (every file is a screen)
  _layout.tsx            # providers + Stack.Protected gates (signed-out → session → verify-email → terms → finish-setup → app)
  (auth)/                # sign-in, two-factor, forgot-password
  index.tsx              # entry `/`: redirects by sessionGate() (needed — `/` on a protected group shows "Unmatched Route")
  (app)/_layout.tsx      # Stack: (tabs) + profile (modal, opened by the avatar ProfileButton in tab headers)
  (app)/(tabs)/_layout.tsx  # NativeTabs (expo-router/native-tabs): today, calendar, customers, notifications, manage
  (app)/(tabs)/<tab>/_layout.tsx + index.tsx   # each tab is its own Stack (TabStack; pass extra Stack.Screens as children)
  (app)/(tabs)/manage/…  # owners/admins: business hub + sections (locations/ index, new, [id] as modal forms)
src/api/                 # client.ts (fetch + ApiError), types.ts, auth.ts, errors.ts, query-keys.ts
src/auth/                # auth-provider.tsx (token in SecureStore), use-me.ts (me query + sessionGate)
src/components/          # AppText, Button, TextField, Screen, Notice, GateScreen, TabStack…
src/features/<area>/     # per-feature logic & components (appointments, customers…)
src/i18n/                # index.ts, en.json, az.json (reuse wording from the web's resources/js/localisation)
src/constants/theme.ts   # colour tokens (primary #0063FF = web --primary), spacing, radius
```

- Read the mobile repo's `AGENTS.md` first: Expo APIs change every SDK; check the versioned docs
  (`https://docs.expo.dev/versions/v58.0.0/`) instead of memory. Add packages with `npx expo install`.
- Keep API types in one place (`src/api/types.ts`) matching the Laravel Resources.
- Server state via TanStack Query; the `me` query (`queryKeys.me`) drives the gates. A 401 on an
  authed call signs the user out (`setUnauthorizedHandler`).
- Checks before calling a slice done: `npx tsc --noEmit`, `npx expo lint`,
  `npx expo export --platform ios --output-dir <scratchpad>` (bundles), and `npx expo-doctor` after
  dependency changes. Ask the user before running it in the simulator.
- Simulator runs: `npx expo start --ios` (Expo Go) as a background job; Laravel must be on `localhost:8000`.
  Fixture login: `preview-owner@example.test` (team 7, password from the local seed convention).
  Simulator screenshots can lag one action behind — take a second screenshot before concluding a tap failed.
  After moving/renaming route files, restart Metro with `--clear` (HMR otherwise breaks). Tap a text
  field before typing: keys sent with nothing focused can trigger Expo Go's reload.
  Don't create or change dev-DB records while checking without the user's OK (an unchanged Save is fine).
- API base URL: `EXPO_PUBLIC_API_URL` in `.env.local` (default `http://localhost:8000`).

## When unsure

- Behaviour question → the web code is the source of truth.
- UX question → choose the native-feeling option and note it in the Decisions log.
- Product/scope question → ask the user, then record the answer in the Decisions log.
