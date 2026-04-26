# Tasks: Admission Membre MVP

**Input**: `spec.md`, `plan.md`, sources in `../archive/000-project-source-of-truth/sources.md`  
**Prerequisites**: Release-readiness decisions on quality gate and owner access where relevant

**Tests**: Required for access status, admin review authorization, waiting-page
sponsor submission, and approved-user onboarding finalization.

## Phase 1: Reconcile Imported Issues With Code

- [ ] T001 Audit current X auth/session implementation against `webapp-nextjs#7` and classify as `done`, `partial`, `missing`, or `rescoped`; include `/connexion`, `/inscription`, `/rejoindre`, `src/app/auth/callback/route.ts`, profile auto-creation, session reuse evidence, and the reported first-login redirects-to-`/connexion` then second-login-enters-app bug.
- [ ] T002 Audit current candidate sponsor collection against `webapp-nextjs#6` and classify as `done`, `partial`, `missing`, or `rescoped`; include `/en-attente`, `SponsorRequestForm`, `sponsorship_requests`, referral-cookie flow, and invitation acceptance.
- [ ] T003 Audit current approved-member onboarding against `webapp-nextjs#6` and classify separately from candidate admission; include `/onboarding`, `OnboardingWizard`, required/optional fields, and final redirect.
- [ ] T004 Audit current admin request review against `webapp-nextjs#14` and classify as `done`, `partial`, `missing`, or `rescoped`; include `/admin`, `/admin/utilisateurs`, `approveUser`, `rejectUser`, displayed sponsor evidence, and status reversal behavior.
- [ ] T005 Audit current access guard by member status against `webapp-nextjs#16` and classify as `done`, `partial`, `missing`, or `rescoped`; include middleware and `(app)/layout.tsx`.
- [ ] T006 Reproduce or disprove `webapp-nextjs#1` for both candidate waiting submission and approved-user onboarding completion using the current app and Supabase state.
- [ ] T006a Reproduce or disprove the first X OAuth login callback bug where the first successful login returns to `/connexion` and a second login enters the app.

## Phase 2: Blocking Decisions

- [x] T007 Resolve admission data model decision from `DEC-005`: Beta 1 canonical model is `profiles.status` plus `sponsorship_requests`; `invitations` remains member-referral compatibility feeding the same status path.
- [x] T008 Resolve status terminology: runtime status remains `rejected`; product/spec language may call this `refused` only as a documented alias.
- [ ] T009 Resolve refused-member UX decision from `DEC-006`: keep redirect-to-login, show a dedicated refused page, or show a recoverable appeal/contact state.
- [ ] T010 Confirm admin/reviewer roles and access ownership before privileged action changes.
- [ ] T011 Confirm whether `/onboarding` should stay post-approval profile completion or be simplified/replaced for Beta 1.

## Phase 3: Implementation Tasks

- [ ] T012 Fix waiting-page sponsor request submission if T006 confirms an error/loop before admin review.
- [ ] T013 Fix approved-user onboarding finalization 500/loop if T006 confirms the bug still exists.
- [ ] T014 Implement or complete minimum email and sponsor-handle validation if T002 is partial or missing; avoid client-only validation for any security-relevant rule, and keep unknown-sponsor non-disclosing feedback visible after submit.
- [x] T014a Fix unknown-sponsor non-disclosing feedback visibility in `src/components/sponsorship/sponsor-request-form.tsx` and cover it in `src/__tests__/sponsor-request-form.test.tsx`.
- [ ] T015 Implement or complete admin approve/refuse request handling if T004 is partial or missing; define idempotent transitions and whether approved/rejected users can be reversed.
- [ ] T016 Implement or complete pending/rejected/approved route guarding if T005 is partial or missing, including the first-login callback/session routing regression.
- [x] T016a Add first-login callback profile-read retry and referral request-only behavior in `src/app/auth/callback/route.ts`; manual X OAuth verification remains required.
- [ ] T017 Ensure non-admin users cannot perform admin admission actions at the server/database boundary, including RLS verification that users cannot self-update `profiles.status`.
- [x] T017a Add admission RLS migration guardrails in `supabase/migrations/20260426192341_admission_profile_status_rls.sql` for profile admission fields, requester insert shape, approved-sponsor handle/id consistency, pending-only sponsor request decisions, sponsor confirmation scope, invitation insert/acceptance identity, and `x_handle` immutability for self-profile updates.
- [ ] T018 Align admin list/review evidence with the selected data model so reviewers can see sponsor request/invitation context without relying on hidden fields.
- [ ] T019 If `OnboardingWizard` remains in scope, either remove the `@ARCHIVED - Potentially unused` ambiguity from the plan/code comments or replace it with the selected Beta 1 completion path.

## Phase 4: Verification

- [ ] T020 Add or update tests for pending/rejected/approved access behavior and redirect loops.
- [ ] T021 Add or update tests for admin-only approval/refusal behavior and non-admin rejection at server/database boundary.
- [ ] T022 Add or update a regression check for candidate sponsor request submission.
- [ ] T023 Add or update a regression check for approved-user onboarding finalization.
- [ ] T023a Add or update a regression check for the first X OAuth login callback path so successful callback reaches the correct destination on the first attempt.
- [x] T024 Add or update a DB-free static migration check for the selected sponsorship/invitation model and relevant RLS policies in `src/__tests__/admission-rls-migration.test.ts`, prioritizing non-admin status mutation, self-sponsorship, approved sponsor evidence, request identity rewrites, pending-only sponsor decisions, invitation forgery prevention, and sponsor profile mutation scope.
- [ ] T025 Run the agreed quality gate from `004-release-readiness` and record result.
- [ ] T026 Recommend GitHub issue closure/rescope updates for `#1,#3,#6,#7,#14,#16` after local verification.
- [ ] T027 Apply/review `supabase/migrations/20260426192341_admission_profile_status_rls.sql` in staging and manually validate live Postgres RLS because repo tests must not call the DB.
- [ ] T028 Replace the current two-write sponsor approval and invitation acceptance flows in `src/components/sponsorship/parrainages-tabs.tsx` and `src/components/sponsorship/invitation-card.tsx` with transactional server/RPC paths or add rollback/error handling for split request/invitation/profile state.
- [ ] T029 Manually validate real X OAuth first-login behavior after the callback retry change.
- [ ] T030 Check staging data for duplicate or blank `profiles.x_handle` values before relying on invitation compatibility evidence at scale.

## Current-State Evidence To Preserve

- Home exists at `src/app/page.tsx`; do not create a replacement admission landing page for this feature.
- Candidate waiting/admission exists at `src/app/(auth)/en-attente/page.tsx` and `src/components/sponsorship/sponsor-request-form.tsx`.
- Approved-user onboarding exists at `src/app/onboarding/page.tsx` and `src/components/onboarding/onboarding-wizard.tsx`.
- Admin review exists at `src/app/(app)/admin/page.tsx`, `src/app/(app)/admin/utilisateurs/page.tsx`, and `src/app/(app)/admin/actions.ts`.
- Status guards exist in `src/lib/supabase/middleware.ts` and `src/app/(app)/layout.tsx`.
- Admission tables/fields exist across `supabase/migrations/00001_initial_schema.sql`, `00003_sponsorship_system.sql`, `00004_invitations_chat_forum.sql`, `00011_sponsorship_requests.sql`, `00014_onboarding.sql`, and `00020_profiles_schema_alignment.sql`.
- Admission RLS hardening is captured in `supabase/migrations/20260426192341_admission_profile_status_rls.sql`.
- Repo tests for this feature must mock database clients or inspect SQL files statically; do not add tests that connect to Supabase/Postgres.

## Source Links

- `https://github.com/Marche-Libre/le-marche-libre/issues/16`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/1`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/3`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/6`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/7`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/14`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/16`
