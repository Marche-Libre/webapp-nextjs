# Admission Tracking Update

**Date**: 2026-04-26
**Scope**: Local tracking update after the refreshed `001-admission-membre`
planning work. The high-risk RLS/runtime hardening commit `c1b475a` is
explicitly not included in this MVP-safe branch. This is documentation-only
tracking; runtime, Supabase, test, generated-type, dependency, and route files
are not changed by this update.

## Local Classification

| Source | Local status | Evidence | Remaining tracking |
| --- | --- | --- | --- |
| `le-marche-libre#16` | Partial | `001-admission-membre` now has refreshed spec/plan/tasks and a DB-free test plan. | Manual auth, RLS design/staging validation, refused UX, onboarding finalization, admin evidence/idempotency, and full access-guard matrix remain open. |
| `webapp-nextjs#3` | Partial | Admission parent is represented in `001-admission-membre/spec.md`, `plan.md`, and `tasks.md`. | Keep parent open until all child acceptance paths are validated or explicitly rescoped. |
| `webapp-nextjs#7` | Partial | X OAuth and `/auth/callback` exist, but real first-login behavior remains unverified on target env. | Real X OAuth first-login manual validation remains required. |
| `webapp-nextjs#6` | Partial | Candidate sponsor submission exists through the waiting page flow. | Unknown-sponsor feedback, approved-user `/onboarding` finalization, and minimum email/onboarding acceptance remain unverified. |
| `webapp-nextjs#14` | Partial | Admin approval/rejection actions exist. | Admin evidence display, idempotent/reversal policy, sensitive-column protection, and live RLS validation remain open. |
| `webapp-nextjs#16` | Partial | Access status model and guard expectations are specified. | Pending/rejected/approved routing matrix tests, refused UX, and DB-level status bypass guardrails remain open. |
| `webapp-nextjs#1` | Unverified blocker | The onboarding finalization bug remains tracked in `001-admission-membre/tasks.md`. | Reproduce/disprove both candidate waiting submission and approved-user onboarding finalization before closure. |

## Decisions Reflected

- DEC-005 admission data model is decided for Beta 1:
  `profiles.status` remains the final access gate, `sponsorship_requests` is
  canonical sponsor evidence, and `invitations` remains compatibility/member
  referral input.
- Repo tests for admission remain DB-free. Live Postgres RLS behavior is a
  staging/manual validation item before any sensitive migration is accepted.

## Open Follow-Ups

- Do not apply `supabase/migrations/20260426192341_admission_profile_status_rls.sql`
  on production from this branch. Rework or validate admission RLS in staging
  before any DB hardening is accepted.
- Manually validate real X OAuth first-login behavior.
- Replace two-write sponsor approval and invitation acceptance with
  transactional server/RPC paths or add rollback/error handling.
- Check staging data for duplicate or blank `profiles.x_handle` values before
  relying on invitation compatibility evidence at scale.
- Resolve refused-member UX.
- Reproduce or disprove approved-user onboarding finalization 500/loop.
