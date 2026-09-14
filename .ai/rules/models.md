---
paths:
  - app/Models/Team.php
  - app/Models/Appointment.php
---

# Models

## No operator/backoffice concept — Uponco is a normal bookable team
The platform "operator" team + backoffice were removed (Sept 2026). Deleted: BackofficeController, EnsureUponcoTeam middleware, OperatorTeamSeeder, the Backoffice request dir, backoffice routes, the `backoffice/*` frontend pages, TeamFactory::operator(), and the `teams.is_operator` column (dropped by migration). Team::isPubliclyBookable() now only checks filled(name) && filled(timezone) — there is no operator exclusion. The "uponco" team (slug 'uponco', id 4) is now a normal publicly-bookable team; its public page lives at /appointments/uponco. Backoffice/admin will be handled elsewhere. Do not reintroduce is_operator; 'uponco' stays reserved in App\Rules\TeamName only to protect the brand name.

## Specialist link is nullOnDelete + name snapshot for history
appointments.specialist_id is nullable with ON DELETE SET NULL (not cascade): deleting a user preserves their past appointments as team/customer history instead of destroying them. Only DeleteTeam (team_id cascade) purges appointments. So $appointment->specialist can be null on historical rows — never read ->specialist->name directly; use $appointment->specialistDisplayName() (live user → specialist_name snapshot → "Former specialist"). The snapshot is filled by Appointment::booted() saving hook (refreshes only when specialist_id is dirty or snapshot empty). Frontend: Appointment.specialist.id and specialist_id are number|null; null-specialist appointments are preview-only (not reschedulable). Do NOT restore cascadeOnDelete on specialist_id.

## Team slug is decoupled from name — never re-add the updating() re-slug hook
Team::boot() only seeds the slug on creating() (when empty). It deliberately does NOT regenerate the slug when the name changes — do not re-add a static::updating() hook that re-slugs on isDirty('name'). Team names may now duplicate (the teams.name unique index was dropped, Sep 2026); only the slug is unique. The slug is user-editable on /company/business/general via SaveTeamRequest ('slug' rule: unique + App\Rules\TeamName reserved-name check), and onboarding (OnboardController@update) explicitly re-slugs from the entered name via Team::generateUniqueTeamSlug(). Reintroducing the updating() hook would silently overwrite a user's custom slug whenever they edit their team name.
