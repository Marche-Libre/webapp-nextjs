# Tasks: Profil et Recherche Membre MVP

**Input**: `spec.md`, `plan.md`, sources in `../archive/000-project-source-of-truth/sources.md`  
**Prerequisites**: Release-readiness schema reproducibility review for profile objects

**Tests**: Required for profile edit, search, member-card access, and private sponsor-field visibility.

## Phase 1: Reconcile Imported Issues With Code

- [ ] T001 Audit current editable profile implementation against `webapp-nextjs#13` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T002 Audit current sponsor relation storage/retrieval against `webapp-nextjs#17` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T003 Audit current member search against `webapp-nextjs#18` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T004 Audit current member card/X link behavior against `webapp-nextjs#19` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T005 Audit current parent profile/search issue `webapp-nextjs#5` and record whether all child tasks cover the MVP scope.

## Phase 2: Blocking Decisions and Schema Checks

- [ ] T006 Resolve or document `profiles_public` reproducibility with `004-release-readiness`.
- [ ] T007 Confirm sponsor relation visibility rule for normal members, self, and admins.
- [ ] T008 Decide whether standalone member detail remains a beta surface or is only reachable through search/chat.

## Phase 3: Implementation Tasks

- [ ] T009 Complete core profile editing for name, first name, and bio if T001 is partial or missing.
- [ ] T010 Complete member card bio and X link display if T004 is partial or missing.
- [ ] T011 Complete sponsor relation storage/retrieval if T002 is partial or missing.
- [ ] T012 Complete simple member search for retained MVP fields if T003 is partial or missing.
- [ ] T013 Park or hide profile features beyond Beta 1 if they add release risk.

## Phase 4: Verification

- [ ] T014 Add or update tests for profile editing persistence.
- [ ] T015 Add or update tests for member card visibility and X link.
- [ ] T016 Add or update tests for member search happy path and empty state.
- [ ] T017 Add or update privacy checks for sponsor/private fields.
- [ ] T018 Recommend GitHub issue closure/rescope updates for `#5,#13,#17,#18,#19` after local verification.

## Source Links

- `https://github.com/Marche-Libre/le-marche-libre/issues/17`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/5`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/13`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/17`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/18`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/19`
