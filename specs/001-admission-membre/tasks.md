# Tasks: Admission Membre MVP

**Input**: `spec.md`, `plan.md`, sources in `../000-project-source-of-truth/sources.md`  
**Prerequisites**: Release-readiness decisions on quality gate and owner access where relevant

**Tests**: Required for access status, admin review authorization, and onboarding finalization.

## Phase 1: Reconcile Imported Issues With Code

- [ ] T001 Audit current X auth/session implementation against `webapp-nextjs#7` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T002 Audit current onboarding email/sponsor flow against `webapp-nextjs#6` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T003 Audit current admin request review against `webapp-nextjs#14` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T004 Audit current access guard by member status against `webapp-nextjs#16` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T005 Reproduce or disprove onboarding finalization bug `webapp-nextjs#1` using the current app and Supabase state.

## Phase 2: Blocking Decisions

- [ ] T006 Resolve admission data model decision from `DEC-005`: keep both invitations and sponsorship requests, or simplify for Beta 1.
- [ ] T007 Resolve refused-member UX decision from `DEC-006`.
- [ ] T008 Confirm admin/reviewer roles and access ownership before privileged action changes.

## Phase 3: Implementation Tasks

- [ ] T009 Fix onboarding finalization 500/loop if T005 confirms the bug still exists.
- [ ] T010 Implement or complete minimum email and sponsor-handle validation if T002 is partial or missing.
- [ ] T011 Implement or complete admin approve/refuse request handling if T003 is partial or missing.
- [ ] T012 Implement or complete pending/refused/approved route guarding if T004 is partial or missing.
- [ ] T013 Ensure non-admin users cannot perform admin admission actions at the server/database boundary.

## Phase 4: Verification

- [ ] T014 Add or update tests for pending/refused/approved access behavior.
- [ ] T015 Add or update tests for admin-only approval/refusal behavior.
- [ ] T016 Add or update a regression check for onboarding finalization.
- [ ] T017 Run the agreed quality gate from `004-release-readiness` and record result.
- [ ] T018 Recommend GitHub issue closure/rescope updates for `#1,#3,#6,#7,#14,#16` after local verification.

## Source Links

- `https://github.com/Marche-Libre/le-marche-libre/issues/16`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/1`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/3`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/6`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/7`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/14`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/16`
