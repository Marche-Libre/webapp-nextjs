# Data Model: Admission Membre MVP

This feature uses existing Supabase-backed data objects. Do not introduce a new
admission table unless the owner rejects the selected Beta 1 model.

## Candidate

Signed-in Supabase/X user requesting access.

**Source**: `auth.users` plus `public.profiles`.

**Key fields**:
- `auth.users.id`: Supabase user ID.
- `auth.users.email`: OAuth email when available.
- `auth.users.raw_user_meta_data`: source for X handle/name/avatar during
  profile creation only; do not authorize from user-editable metadata.
- `profiles.id`: local member profile ID, same as auth user ID.
- `profiles.x_handle`: X identity used in admission/referral flows.
- `profiles.email`: stored contact email.
- `profiles.status`: `pending`, `approved`, or `rejected`.

**Validation rules**:
- Candidate must have an authenticated Supabase session.
- Candidate must have a profile row before admission routing can complete.
- Missing X/profile fields are a recoverable admission error, not a redirect
  loop.

## Member Profile

Local user record carrying identity, admission status, admin role, sponsorship,
and onboarding-completion state.

**Existing table**: `public.profiles`.

**Admission fields**:
- `id`
- `email`
- `x_handle`
- `status`: runtime enum `pending | approved | rejected`.
- `is_admin`
- `sponsored_by`
- `sponsor_approved`
- `onboarding_completed`
- `created_at`
- `updated_at`

**Relationships**:
- `sponsored_by` references another `profiles.id`.
- Can have many outgoing `invitations`.
- Can have many incoming/outgoing `sponsorship_requests` depending on role.

**State transitions**:
- New candidate: `pending`, `onboarding_completed = false`.
- Sponsor confirms candidate: `sponsor_approved = true`; status remains
  `pending` until admin decision.
- Admin approves: `status = approved`; user is routed to `/onboarding` if
  `onboarding_completed = false`, otherwise app entry.
- Admin refuses: `status = rejected`; user cannot access member-only routes.
- Reversal from `approved` or `rejected` must be explicitly allowed or blocked
  by implementation decision before admin action changes.

## Sponsorship Request

Canonical Beta 1 evidence that a candidate requested sponsorship from a member.

**Existing table**: `public.sponsorship_requests`.

**Key fields**:
- `id`
- `requester_id`: candidate profile ID.
- `sponsor_handle`: handle entered by candidate or referral flow.
- `sponsor_id`: resolved approved sponsor profile ID, nullable.
- `status`: `pending | approved | rejected`.
- `attempt_number`
- `created_at`
- `updated_at`

**Relationships**:
- `requester_id` references `profiles.id`.
- `sponsor_id` references `profiles.id` when resolved.

**Validation rules**:
- Requester can create only for self.
- Sponsor handle is trimmed and normalized without `@`.
- Candidate cannot sponsor self.
- Unknown sponsor handle must not leak user existence beyond intended product
  copy.
- Existing attempt and pending/approved constraints must be respected.

**State transitions**:
- Candidate submits: `pending`.
- Sponsor approves: request `approved`; profile `sponsor_approved = true` and
  `sponsored_by = sponsor_id`.
- Sponsor rejects: request `rejected`; candidate may submit next allowed
  attempt or wait for admin fallback.
- Admin review consumes request evidence but final access is `profiles.status`.

## Invitation

Compatibility/member-referral input that can establish sponsor context for a
candidate.

**Existing table**: `public.invitations`.

**Key fields**:
- `id`
- `inviter_id`
- `invited_x_handle`
- `status`: `pending | accepted | rejected`.
- `accepted_by`
- `created_at`
- `updated_at`

**Relationships**:
- `inviter_id` references sponsor/member profile.
- `accepted_by` references candidate profile after acceptance.

**Validation rules**:
- Only approved members create invitations.
- Invited candidate can accept/reject when `invited_x_handle` matches their
  profile handle.
- Invitation acceptance may set `profiles.sponsored_by` and
  `profiles.sponsor_approved`, but final admission remains admin-controlled.

## Admin Review Action

Privileged decision to approve or reject a candidate profile.

**Existing implementation**: Server Actions in
`src/app/(app)/admin/actions.ts`.

**Inputs**:
- `target_user_id`
- action: `approve | reject`
- authenticated actor from Supabase session

**Authorization rules**:
- Actor must be authenticated.
- Actor must have `profiles.is_admin = true`.
- Database/RLS must also prevent non-admin status changes.
- Client UI state is not an authorization boundary.

**Outputs**:
- Success/failure result for UI refresh.
- Updated `profiles.status`.
- Optional future audit metadata if a later feature adds review logs.

## Route Access State

Derived state used by middleware and layouts.

**Inputs**:
- authenticated user/session
- `profiles.status`
- `profiles.onboarding_completed`

**Routing matrix**:
- No session + protected route: `/connexion`.
- Pending profile: `/en-attente`.
- Rejected profile: selected refused UX; current runtime redirects to
  `/connexion`.
- Approved + not onboarded: `/onboarding`.
- Approved + onboarded: app entry.

**Invariant**: Pending and rejected users must never reach member-only content.
