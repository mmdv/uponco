---
paths:
  - 'app/Actions/Teams/**'
---

# Teams

## Team deletion hard-deletes via DeleteTeam action
Team still uses SoftDeletes (GeneratesUniqueTeamSlugs needs withTrashed), but real deletion must go through App\Actions\Teams\DeleteTeam::handle(), which forceDelete()s the team so the DB cascadeOnDelete FKs remove members/services/customers/appointments/locations/slots/etc. in one shot, plus deletes the logo file. Never call $team->delete() to delete a team — that only soft-deletes and orphans all child data. Ownership lives only on the team_members.role pivot, so account deletion (AccountController::destroy) force-deletes solo-owned teams and blocks (via AccountDeleteRequest::after) while the user owns a team with other members — they must transfer ownership first (BusinessMemberController::transferOwnership, owner-only).
