---
paths:
  - app/Models/Team.php
---

# Models

## No operator/backoffice concept — Uponco is a normal bookable team
The platform "operator" team + backoffice were removed (Sept 2026). Deleted: BackofficeController, EnsureUponcoTeam middleware, OperatorTeamSeeder, the Backoffice request dir, backoffice routes, the `backoffice/*` frontend pages, TeamFactory::operator(), and the `teams.is_operator` column (dropped by migration). Team::isPubliclyBookable() now only checks filled(name) && filled(timezone) — there is no operator exclusion. The "uponco" team (slug 'uponco', id 4) is now a normal publicly-bookable team; its public page lives at /appointments/uponco. Backoffice/admin will be handled elsewhere. Do not reintroduce is_operator; 'uponco' stays reserved in App\Rules\TeamName only to protect the brand name.
