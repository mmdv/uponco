---
paths:
  - app/Http/Controllers/AppointmentController.php
---

# Controllers

## Past-only actions (no-show, delete) invert the isPast guard
authorizeAppointment(Request, Appointment, bool $requirePast = false) gates by team + own/ViewAllAppointments, then time: default (edit/cancel/reschedule/update) aborts if isPast; past-only actions pass requirePast:true which aborts UNLESS isPast. No-show and delete are past-only and use it.

Status: AppointmentStatus now has NoShow ('no_show') alongside Booked/Cancelled. A no-show is a past appointment the customer missed; like cancelled it is excluded by scopeBooked() (frees slot, drops from totals) but is recorded on purpose for reporting. Model has markNoShow()/markBooked()/isNoShow(). updateStatus endpoint (PATCH calendar/{appointment}/status, appointments.status) only allows booked|no_show and sends NO customer email. destroy endpoint (DELETE calendar/{appointment}, appointments.destroy) SOFT-deletes.

index() must load whereIn('status',[Booked,NoShow]) — NOT ->booked() — so past no-shows stay visible for undo; cancelled + soft-deleted stay hidden.

Frontend: Appointment.status is serialized; no-show cards/rows get a rose tint that overrides the source (green/blue) tint; details modal + minimal table dropdown carry Mark/Undo no-show + Delete, gated by canManagePast = isPast && (admin||own). Regenerate Wayfinder with `php artisan wayfinder:generate --with-form` (plain generate drops .form variants and breaks tsc).
