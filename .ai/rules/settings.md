---
paths:
  - 'app/Http/Requests/Settings/**'
---

# Settings

## OAuth-only accounts have no password — never hard-gate on one
Google sign-up (GoogleAuthController) creates users with password = null, so any flow that unconditionally requires current_password/password locks them out. Guard password rules with $this->user()->hasPassword() (User::hasPassword() = filled(password)) and only require the password when true — done in AccountDeleteRequest, AccountUpdateRequest, TransferTeamOwnershipRequest. The settings/security route is deliberately NOT behind a password-confirm gate (no RequirePassword middleware): its sensitive actions (email change, password update) each re-check the current password in their own request body, so a page-level gate would be redundant and would lock out passwordless accounts. Frontend reads the shared Inertia prop auth.hasPassword (HandleInertiaRequests) to hide password fields and the whole change-password section for accounts with no password. Policy chosen: the live OAuth session is sufficient re-auth; no password is ever required for accounts that have none.
