---
paths:
  - 'resources/js/components/public-booking-v2/**'
---

# Public Booking V2

## Public booking page has switchable designs
The public booking page supports multiple designs per team. Team.booking_page_design (enum App\Enums\BookingPageDesign: classic|v2, null=classic) picks the Inertia component: PublicAppointmentController::renderPage() renders $company->bookingPageDesign()->component() ('public/appointments/book' vs 'public/appointments/book-v2'). components/public-booking-v2/ + pages/public/appointments/book-v2.tsx started as a clone of the classic tree and are edited in isolation (see below) — they reuse the shared hooks/use-appointment-booking, hooks/booking/*, lib/booking, lib/brand; only presentation is separate. The design selector on the brand page (company/brand/index.tsx -> company.brand.design.update) is gated by config('booking.design_switching') (default: on outside production, env BOOKING_DESIGN_SWITCHING). Adding a new page entry requires npm run build so it lands in the Vite manifest (tests 500 otherwise).

## Booking v2 is a hub + search-sheet design, no longer a clone
v2 diverged from classic: step 0 is a hub of ChoiceRows; each opens SelectionSheet (Radix dialog, full-screen on mobile) driven by the shared hook's openCard/openPicker. A tap only selects (step-selection re-pins openCard to the current kind after the hook's nextOpenCard jump); the sheet's footer button moves on via useNextChoice (next-choice.ts). Steps 1–2 show a compact 3-line SummaryBar in the header (tap → hub); there is no progress stepper. Pickers use PickerLayout from picker-parts.tsx (NOT selection-sheet.tsx — that imports use-mobile, whose module-level matchMedia crashes jsdom tests). Search logic is pure in lib/booking-search.ts (accent + Azerbaijani letter folding). The sheet is portalled, so it re-applies brandStyle(company.brand) itself. Copy lives under the `v2.*` keys in localisation/{en,az}/booking.json. Shared hooks gained additive clearSelection/clearAllSelections/openPicker/clearErrors; classic ignores them.
