# Admission Tracking Update

**Date**: 2026-04-26
**Scope**: Local tracking update after `001-admission-membre` RLS/auth/sponsor
hardening commit `c1b475a`. This is documentation-only tracking; runtime,
Supabase, test, generated-type, dependency, and route files are not changed by
this update.

## Local Classification

| Source | Local status | Evidence | Remaining tracking |
| --- | --- | --- | --- |
| `le-marche-libre#16` | Partial | `001-admission-membre` now has refreshed spec/plan/tasks, DB-free test plan, RLS guardrails, and admission implementation fixes. | Manual auth, staging RLS, refused UX, onboarding finalization, admin evidence/idempotency, and full access-guard matrix remain open. |
| `webapp-nextjs#3` | Partial | Admission parent is represented in `001-admission-membre/spec.md`, `plan.md`, `tasks.md`, and the committed hardening work. | Keep parent open until all child acceptance paths are validated or explicitly rescoped. |
| `webapp-nextjs#7` | Partial | `/auth/callback` now retries profile reads and creates referral sponsorship requests without pre-writing `profiles.sponsored_by`. | Real X OAuth first-login manual validation remains required. |
| `webapp-nextjs#6` | Partial | Candidate sponsor submission keeps unknown-sponsor feedback visible; RLS now protects sponsorship request evidence shape. | Approved-user `/onboarding` finalization and minimum email/onboarding acceptance remain unverified. |
| `webapp-nextjs#14` | Partial | Admin actions have mocked authorization tests; profile status bypass is blocked by migration-shape guardrails. | Admin evidence display, idempotent/reversal policy, and live RLS validation remain open. |
| `webapp-nextjs#16` | Partial | Access status model and guard expectations are specified, and DB status bypass guardrails are in place. | Pending/rejected/approved routing matrix tests and refused UX decision remain open. |
| `webapp-nextjs#1` | Unverified blocker | The onboarding finalization bug remains tracked in `001-admission-membre/tasks.md`. | Reproduce/disprove both candidate waiting submission and approved-user onboarding finalization before closure. |

## Decisions Reflected

- DEC-005 admission data model is decided for Beta 1:
  `profiles.status` remains the final access gate, `sponsorship_requests` is
  canonical sponsor evidence, and `invitations` remains compatibility/member
  referral input.
- Repo tests for admission remain DB-free. They mock Supabase clients or
  statically inspect migration files; live Postgres RLS behavior is a
  staging/manual validation item.

## Open Follow-Ups

- Apply/review `supabase/migrations/20260426192341_admission_profile_status_rls.sql`
  in staging and manually validate RLS behavior.
- Manually validate real X OAuth first-login behavior.
- Replace two-write sponsor approval and invitation acceptance with
  transactional server/RPC paths or add rollback/error handling.
- Check staging data for duplicate or blank `profiles.x_handle` values before
  relying on invitation compatibility evidence at scale.
- Resolve refused-member UX.
- Reproduce or disprove approved-user onboarding finalization 500/loop.
