# Implementation Plan: Admission Membre MVP

**Branch**: `001-admission-membre` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-admission-membre/spec.md`

## Summary

Stabilize the MVP admission path: X authentication, onboarding email/sponsor
collection, admin review, and access guard by member status. Begin by reconciling
the imported issue set with the real code because the audit says much of this is
already implemented but not cleanly closed.

Current app confrontation confirms this is a brownfield stabilization, not a
greenfield implementation. The app already has a public home page, X OAuth
entry points, `/rejoindre?ref=...`, `/en-attente`, `/onboarding`, app/admin
route guards, sponsorship requests, invitation handling, and an admin user
review surface. The implementation plan must therefore focus on verifying,
fixing, and simplifying the existing path before adding new admission UI.

## Technical Context

**Language/Version**: Next.js / React / TypeScript, Supabase-backed app  
**Primary Dependencies**: Existing auth, onboarding, profile, admin, and Supabase data paths  
**Storage**: Existing Supabase profile/admission tables and related policies  
**Testing**: Focused admission flow tests, authorization/RLS checks, build/lint/vitest gate per release-readiness policy  
**Target Platform**: Web app Beta 1  
**Project Type**: Brownfield web application feature stabilization  
**Performance Goals**: Admission request and review complete without blocking user feedback  
**Constraints**: No broad auth expansion; no uncontrolled schema changes; preserve private access model  
**Scale/Scope**: Candidate onboarding, admin review, protected-route gating

**Installed Runtime Baseline**: Next.js `16.2.1`, React `19.2.4`,
`@supabase/ssr`, `@supabase/supabase-js`, Tailwind CSS 4, Vitest.

**Next.js Docs Consulted for Planning**:
`node_modules/next/dist/docs/01-app/02-guides/authentication.md`,
`node_modules/next/dist/docs/01-app/02-guides/redirecting.md`, and
`node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-server.md`.
Before runtime edits, re-check the specific docs for middleware/proxy, route
handlers, Server Actions, and caching touched by the change.

## Constitution Check

- **Core-flow priority**: PASS. Admission is a beta-critical flow.
- **Supabase reproducibility**: REQUIRES REVIEW. Admission depends on profile/sponsorship schema and RLS.
- **Authorization integrity**: REQUIRES REVIEW. Admin review and access guards must be server/database enforced.
- **Next.js 16 source-of-truth**: PARTIAL PASS for planning. Relevant auth,
  redirect, and Server Function docs were consulted; implementation must read
  route/middleware-specific docs before editing those files.
- **Brownfield blast radius**: PASS. Known surfaces are listed in spec Brownfield Context.
- **Quality gates**: REQUIRES PROJECT DECISION. Gate policy is tracked in `004-release-readiness`.

## Constitution Check - Post-Design

- **Core-flow priority**: PASS. Design artifacts keep scope on admission,
  onboarding completion, access guards, and admin review.
- **Supabase reproducibility**: PASS WITH BLOCKERS. Existing migrations are
  identified as the source of truth to verify; any schema/RLS drift must become
  a migration task before runtime reliance.
- **Authorization integrity**: PASS WITH BLOCKERS. Contracts require admin
  Server Action checks and RLS/database verification before closure.
- **Next.js 16 source-of-truth**: PARTIAL PASS. Planning used installed auth,
  redirect, and Server Function docs; implementation tasks must re-check docs
  for any exact route/middleware/API edited.
- **Brownfield blast radius**: PASS. Current routes, guards, data objects, and
  tests are listed in plan, contracts, quickstart, and tasks.
- **Quality gates**: PASS WITH BASELINE DEPENDENCY. Expected commands are
  `bun run build`, `bun run lint`, and `bunx vitest run`; known baseline
  failures must be recorded rather than normalized.

## Project Structure

### Documentation (this feature)

```text
specs/001-admission-membre/
+-- spec.md
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- test-plan.md
+-- contracts/
+-- tasks.md
```

### Source Code (repository root)

```text
src/app/             # auth, onboarding, protected routes, admin surfaces
src/components/      # admission/admin UI where present
src/lib/             # auth/session/admin helpers where present
supabase/            # migrations/RLS/functions if schema changes are required
tests/               # focused tests for admission utilities and flows
```

**Structure Decision**: Do not design new architecture until current admission
implementation and schema drift are audited. Prefer smallest fixes and rescope
already-implemented issues before adding new behavior.

## Generated Artifacts

- `research.md`: Brownfield decisions and rejected alternatives.
- `data-model.md`: Existing admission entities, fields, relationships, and
  status transitions.
- `contracts/admission-flow.md`: Route, action, data, and authorization
  contracts to preserve during implementation.
- `quickstart.md`: Reproduce/audit/implement/verify workflow for this feature.
- `test-plan.md`: Acceptance-criteria test architecture and remaining
  automated, SQL/RLS, and manual checks.

## Current App Confrontation

| Surface | Current evidence | Planning implication |
| --- | --- | --- |
| Public home | `src/app/page.tsx` exists and links to signup/login/app areas. | Admission plan should preserve the existing landing entry, not create a new public journey. |
| X OAuth | `/connexion`, `/inscription`, `/rejoindre`, and `src/app/auth/callback/route.ts` use Supabase X OAuth. | Treat `webapp-nextjs#7` as likely partial/done pending live OAuth and profile-trigger verification. |
| Referral entry | `/rejoindre?ref=` stores `ml-referral`; callback creates a pending `sponsorship_requests` row when sponsor is valid and no longer pre-writes `profiles.sponsored_by`. | Keep referral-cookie callback path in scope for regression testing and preserve request-first sponsor evidence. |
| First X login | User-reported bug: X OAuth callback can redirect back to `/connexion` on first login, while a second login enters the app. | Treat callback/session cookie/profile creation ordering as a blocker regression before closing auth/session work. |
| Waiting state | `/en-attente` supports invitations and sponsorship requests. Rejected users are redirected to `/connexion`. | Refused UX is not truly selected; `rejected` exists in code while spec says `refused`. Normalize terminology or document mapping. |
| Onboarding | `/onboarding` only allows approved users and uses a 9-step profile/community wizard marked `@ARCHIVED - Potentially unused`. | This is post-approval profile completion, not the candidate admission form described by FR-002. Plan must separate candidate sponsor request from approved-member onboarding. |
| Admin review | `/admin` and `/admin/utilisateurs` list pending users; Server Actions approve/reject profiles after checking `is_admin`. | Admin exists; implementation should harden authorization, idempotency, status transitions, and evidence display rather than build a new admin. |
| App guards | Middleware and `(app)/layout.tsx` redirect pending/rejected/approved users. | Access guard exists but needs status matrix tests and loop checks. |
| Data model | `profiles.status` is `pending/approved/rejected`; `invitations` and `sponsorship_requests` both exist; `sponsor_approved` and `sponsored_by` are profile fields. | DEC-005 is the central implementation blocker. The plan should decide the Beta 1 canonical admission request model before schema/UI changes. |
| RLS | Migrations include profile, invitation, and sponsorship RLS; admin Server Actions also check `is_admin`. A new admission RLS migration hardens profile admission fields, request insert/update shape, sponsor confirmation, and invitation acceptance. | Treat migration review and staged/manual validation as required because repo tests must stay DB-free. |

## Revised Design Direction

1. Preserve the existing home page and auth entry points.
2. Treat `/en-attente` as the candidate admission surface for Beta 1 sponsor
   collection, unless a product decision explicitly moves sponsor collection
   into `/onboarding`.
3. Treat `/onboarding` as approved-member profile completion after admin
   approval; reduce or fix the 9-step wizard only if it blocks the approved
   user from entering the app.
4. Use `profiles.status = rejected` as the database/runtime value unless a
   migration explicitly renames it. In product copy and Speckit, map `refused`
   to runtime `rejected`.
5. Choose one canonical Beta 1 admission-review object:
   - preferred: profile status plus `sponsorship_requests` as the candidate
     sponsor evidence;
   - supported compatibility: keep `invitations` only as a member referral
     convenience feeding the same profile status path;
   - avoid adding a third access-request table for MVP.
6. Keep admin approval on existing admin routes, but require status transition
   rules, server-side authorization, and RLS verification before closure.
7. Keep sponsor confirmation evidence-only:
   - requesters can create only pending, requester-owned, non-self sponsorship
     requests;
   - sponsorship request evidence must target an approved sponsor and keep
     `sponsor_handle` consistent with `sponsor_id`;
   - sponsors can update only request status for requests addressed to them;
   - sponsor decisions are pending-only and cannot be flipped after approval or
     rejection through the sponsor path;
   - sponsor profile confirmation can change only `sponsored_by`,
     `sponsor_approved`, and trigger-managed `updated_at`;
   - final access status remains admin-controlled through `profiles.status`.
8. Keep invitation compatibility evidence but harden it:
   - invitation inserts must come from the authenticated inviter, start
     `pending`, and have no `accepted_by`;
   - invited users cannot rewrite inviter/target identity while accepting or
     rejecting;
   - `x_handle` is frozen for self-profile updates because invitation matching
     currently relies on that handle.
9. Keep automated admission tests DB-free by mocking Supabase clients or
   statically inspecting migration files; live RLS behavior is verified in
   staging/manual validation, not unit tests.

## Imported Source Mapping

| Source | Imported status | Local interpretation |
| --- | --- | --- |
| `le-marche-libre#16` | Backlog | Product user story and acceptance criteria |
| `webapp-nextjs#3` | Ready | Parent implementation issue |
| `webapp-nextjs#7` | Ready, S | Auth X and session task |
| `webapp-nextjs#6` | Ready, S | Onboarding email and sponsorship task |
| `webapp-nextjs#14` | Ready, S | Admin review task |
| `webapp-nextjs#16` | Ready, XS | Access guard task |
| `webapp-nextjs#1` | Ready, S | Critical onboarding bug/blocker |

## Execution Order

1. Resolve Beta 1 terminology and model: runtime `rejected` maps to product
   `refused`; `sponsorship_requests` is the canonical candidate sponsor
   evidence; `invitations` remains compatibility/member referral unless owner
   decides otherwise.
2. Reproduce or disprove `webapp-nextjs#1` across both relevant transitions:
   candidate waiting submission on `/en-attente` and approved-user completion
   on `/onboarding`.
3. Audit existing admission implementation and classify imported tasks as done,
   partial, missing, or rescoped using file/route/table evidence.
4. Fix only confirmed Beta 1 gaps: finalization loop/error, sponsor-handle
   validation, first-login callback/session routing, admin status transition
   hardening, RLS guardrails, and guard behavior.
5. Add or update DB-free tests for pending/rejected/approved access, admin
   authorization, sponsor request submission, and migration-shape guardrails.
6. Run the agreed release-readiness quality gate or record baseline failures.
7. Apply/review the migration in staging and manually validate live RLS and X
   OAuth behavior because those checks are intentionally outside repo tests.
8. Record issue closure/rescope recommendations after code evidence.

## Open Decisions

- Refused-member UX: current runtime redirects `rejected` users to `/connexion`;
  owner must decide whether to keep that or add a dedicated refused state.
- Admission data model simplification: recommended direction is
  `profiles.status` plus `sponsorship_requests` as canonical, with
  `invitations` as compatibility/referral input.
- Minimal quality gate before merge/beta.

## Implementation Risks to Carry Forward

- `profile.status !== "approved"` in `/onboarding` sends candidates to
  `/en-attente`, so FR-002 sponsor collection currently belongs to the waiting
  page, not onboarding.
- `OnboardingWizard` writes several optional profile/community objects and then
  inserts a welcome notification. Any failing insert/update could be perceived
  as finalization failure even after `onboarding_completed` succeeds.
- User-reported OAuth regression: after successful X login, first callback can
  route back to `/connexion`; a second login enters the app. Verify callback
  cookie write timing, profile creation/read timing, and middleware interaction.
- Unknown sponsor submission currently has an expected-fail test because the
  non-disclosing feedback copy is hidden after submit.
- Admin actions update `profiles.status` directly; this must be proven safe
  under RLS and protected from non-admin calls, repeated actions, and unintended
  reversal.
- Profile RLS is the highest-risk authorization gap to verify: if a non-admin
  can update their own admission fields, forge self-sponsorship, or use sponsor
  confirmation to mutate requester profile content, app-level admin checks do
  not satisfy FR-010/SC-003.
- Invitation compatibility depends on X handle identity. The migration freezes
  self-profile `x_handle` changes and hardens invitation inserts/acceptance, but
  live data should still be checked for duplicate/blank handles before relying
  on invitation evidence at scale.
- Sponsor approval and invitation acceptance are currently two client-side
  writes; if the profile update fails after the request/invitation status
  update succeeds, the app can show split sponsorship state. A transactional
  server/RPC path is the preferred follow-up.
- `profiles.status` uses `rejected`, while the feature spec uses `refused`.
  Do not introduce both runtime terms.
- The source-of-truth pointer in `AGENTS.md` was realigned to the active
  release-readiness task list and archived import records. Future admission work
  should keep runtime changes separate from project-management cleanup.
