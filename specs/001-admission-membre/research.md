# Research: Admission Membre MVP

## Decision: Replan As Brownfield Stabilization

The feature will stabilize the existing admission path instead of designing a
new greenfield flow.

**Rationale**: Current code already includes public entry points, X OAuth,
`/rejoindre?ref=...`, `/en-attente`, `/onboarding`, protected app layouts,
admin review, `profiles.status`, `sponsorship_requests`, and `invitations`.
Adding a parallel admission flow would increase drift and violate the
constitution's brownfield and core-flow constraints.

**Alternatives considered**:
- Build a new admission request table and UI: rejected because it duplicates
  active profile/sponsorship/invitation state.
- Replace the existing home/auth entry: rejected because the public home and
  X OAuth entry already exist and are outside the reported blocker.

## Decision: Candidate Admission Surface Is `/en-attente`

Candidate sponsor collection and pending-state admission work will be treated
as part of `/en-attente` and its sponsorship components. `/onboarding` remains
approved-member profile completion unless the owner explicitly changes the
product direction.

**Rationale**: `src/app/onboarding/page.tsx` redirects every non-approved
profile to `/en-attente`, so candidates cannot use `/onboarding` before admin
approval. The waiting page already handles invitations and sponsorship
requests.

**Alternatives considered**:
- Move sponsor collection into `/onboarding`: rejected for this plan because it
  conflicts with current route guards and would expand blast radius.
- Rename `/en-attente` to onboarding: rejected as unnecessary routing churn for
  Beta 1 stabilization.

## Decision: Canonical Beta 1 Admission Model

Use `profiles.status` plus `sponsorship_requests` as the canonical Beta 1
admission model. Keep `invitations` as a compatibility/member-referral input
that can set `sponsored_by` and `sponsor_approved`, but do not add a third
access-request table.

**Rationale**: `profiles.status` already gates the app and admin review.
`sponsorship_requests` records candidate-declared sponsor evidence and supports
requester/sponsor/admin RLS. `invitations` is already present and used by
members, but it is not sufficient alone because candidates can also declare
sponsors from `/en-attente`.

**Alternatives considered**:
- Invitations only: rejected because current callback and waiting page already
  use sponsorship requests.
- Sponsorship requests only with immediate invitation removal: rejected because
  deleting historical/member referral behavior is out of scope.
- New `access_requests` table: rejected because existing tables cover MVP
  state and adding one would multiply migration/RLS work.

## Decision: Status Terminology

Keep runtime/database status values as `pending`, `approved`, and `rejected`.
Treat product/spec term `refused` as an alias for runtime `rejected`.

**Rationale**: Existing migrations, generated types, admin actions, and route
guards use `rejected`. Introducing both `refused` and `rejected` in runtime code
would create inconsistent access behavior.

**Alternatives considered**:
- Migrate `rejected` to `refused`: rejected for MVP unless a later migration
  explicitly changes all schema, types, policies, data, tests, and UI together.

## Decision: Admin Review Is Hardening, Not New Build

Use the existing admin surface and Server Actions as the implementation base.
Focus implementation on review evidence, status transition rules, non-admin
rejection, RLS verification, and idempotency.

**Rationale**: `/admin`, `/admin/utilisateurs`, `approveUser`, and `rejectUser`
exist. The main risk is whether status mutation is correctly authorized and
whether admins see enough sponsor context to decide.

**Alternatives considered**:
- Build a separate admission admin area: rejected as unnecessary surface area.
- Trust client-side UI hiding: rejected because admission authorization must be
  enforced server-side and by database policy.

## Decision: Next.js Planning Baseline

Implementation must use installed Next.js 16 docs for exact API behavior.
Planning has consulted the installed authentication, redirecting, and
`use server` docs.

**Rationale**: The project explicitly warns that this Next.js version has
breaking changes. Server Actions, redirects, route handlers, and middleware
must follow local docs rather than memory.

**Alternatives considered**:
- Use generic Next.js assumptions: rejected by project instruction.

## Decision: Quality Gate

Expected verification for implementation is `bun run build`, `bun run lint`,
and `bunx vitest run`, plus focused admission tests or SQL/RLS checks. If
baseline failures remain, record the failure and prove the admission change did
not worsen it.

**Rationale**: The constitution defines these as release criteria, while the
release-readiness feature owns baseline cleanup.

**Alternatives considered**:
- Skip tests because the feature is brownfield: rejected because auth,
  admission, admin, and route guards are core-flow/security-sensitive.
