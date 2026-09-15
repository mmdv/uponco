---
paths:
  - 'resources/js/hooks/booking/**'
---

# Booking

## Public booking is composed sub-hooks behind a context
The public booking flow is split by concern into hooks under resources/js/hooks/booking/ (steps, selection, slot-window, customer-details, submission) plus a use-booking-analytics wrapper. use-appointment-booking.ts is a thin orchestrator that composes them and returns one flat object; BookingProvider/useBooking in components/public-booking/booking-context.tsx shares it, and booking-flow.tsx + the Step* components read from context (no prop drilling). Add new booking state to the matching sub-hook, not the orchestrator — keep each file well under the 400-line ESLint max-lines cap. The orchestrator bridges selection->slots via a ref set in a useEffect (not during render, per the no-ref-access-during-render rule). Sub-hooks are unit-tested with @testing-library/react renderHook in *.test.tsx files that carry a `// @vitest-environment jsdom` docblock; pure logic still lives in @/lib/booking and @/lib/booking-analytics.
