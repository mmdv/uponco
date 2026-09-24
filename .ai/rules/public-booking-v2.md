---
paths:
  - 'resources/js/components/public-booking-v2/**'
---

# Public Booking V2

## Public booking page has switchable designs (v2 is a clone)
The public booking page supports multiple designs per team. Team.booking_page_design (enum App\Enums\BookingPageDesign: classic|v2, null=classic) picks the Inertia component: PublicAppointmentController::renderPage() renders $company->bookingPageDesign()->component() ('public/appointments/book' vs 'public/appointments/book-v2'). components/public-booking-v2/ + pages/public/appointments/book-v2.tsx are an exact clone of the classic tree, meant to be edited in isolation — they reuse the shared hooks/use-appointment-booking, hooks/booking/*, lib/booking, lib/brand untouched; only presentation is duplicated. The design selector on the brand page (company/brand/index.tsx -> company.brand.design.update) is gated by config('booking.design_switching') (default: on outside production, env BOOKING_DESIGN_SWITCHING). Adding a new page entry requires npm run build so it lands in the Vite manifest (tests 500 otherwise).
