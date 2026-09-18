---
paths:
  - app/Concerns/InteractsWithAppointmentBooking.php
---

# Concerns

## appointments.source marks public vs staff bookings
appointments.source (App\Enums\AppointmentSource: Staff|Public, cast on Appointment) records who created the booking. It is set in persistAppointment()/createAppointment() via a $source param defaulting to Staff; PublicAppointmentController::store passes AppointmentSource::Public — every other flow (drawer store, day-view dayStore) keeps the Staff default. It is NOT nullable and NOT a created_by FK on purpose: a nullable FK would go null on user deletion (specialist_id is nullOnDelete here) and miscount deleted-staff bookings as public. Column is default 'staff', so legacy rows read as staff. Serialized in toAppointmentArray() as source; frontend tints public bookings green (emerald) instead of the default blue/primary across all appointment cards (day/week/month card tint, minimal table row tint, dashboard accent bar) + a green "Online booking" text Badge in the details modal. No icon/badge on the small cards — the color is the only cue. Do not reintroduce a per-card badge.
