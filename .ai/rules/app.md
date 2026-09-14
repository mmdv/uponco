---
paths:
  - 'app/**'
---

# App

## Per-member permission overrides on team_members.permissions
Members can be granted permissions beyond their role. Overrides are stored as a JSON array in team_members.permissions (Membership casts it to 'array'). Check access with $user->hasTeamPermission($team, TeamPermission::X), which unions role-derived perms (TeamRole::permissions()) with the stored overrides (Membership::hasPermission). Grantable-per-member perms come from TeamPermission::grantable(); wire new ones into TeamRole for Owner/Admin too.

Appointment visibility (calendar + dashboard + mutation guard) is now gated by TeamPermission::ViewAllAppointments, NOT teamRole()->isAtLeast(Admin) — do not revert to the role check (AppointmentController index/dayWindow/authorizeAppointment, DashboardController $specialistId). Admin/Owner get it via role.

Always write overrides via Membership::update(['permissions' => [...]]) so the array cast encodes them; a raw json_encode string via ->attach() pivot data does NOT round-trip through the cast on read (returns a string, breaks in_array). Member edit UI: Permissions section on company/business/members edit page, endpoint company.business.members.permissions.update.
