# Tasks: Canaux et Messages MVP

**Input**: `spec.md`, `plan.md`, sources in `../archive/000-project-source-of-truth/sources.md`  
**Prerequisites**: Admission access gating, channel taxonomy decision, forum beta decision

**Tests**: Required for channel access, Jobs write permissions, admin-only pin, retained search, and message actions.

## Phase 1: Blocking Product Decisions

- [ ] T001 Resolve forum beta position from `DEC-003`: explicit beta, tolerated, hidden, or parked.
- [ ] T002 Resolve launch channel taxonomy from `DEC-004`.
- [ ] T003 Decide retained interactions for Beta 1: reply, mentions, pin, edit/delete, link preview, global search.

## Phase 2: Reconcile Imported Issues With Code

- [ ] T004 Audit current channel shell/navigation against `webapp-nextjs#20` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T005 Audit current message list/composer against `webapp-nextjs#21` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T006 Audit current reply/mentions/pin behavior against `webapp-nextjs#26` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T007 Audit current link preview behavior against `webapp-nextjs#23` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T008 Audit current Jobs channel permissions against `webapp-nextjs#24` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T009 Audit current global channel search against `webapp-nextjs#25` and classify as `done`, `partial`, `missing`, or `rescoped`.
- [ ] T010 Audit parent issue `webapp-nextjs#4` and confirm child issue coverage of retained scope.

## Phase 3: Implementation Tasks

- [ ] T011 Complete launch channel shell/navigation if T004 is partial or missing.
- [ ] T012 Complete message list/composer if T005 is partial or missing.
- [ ] T013 Complete Jobs admin-write/read-for-members permission if T008 is partial or missing.
- [ ] T014 Complete retained message interactions from T003 if missing.
- [ ] T015 Complete retained channel/global search if T009 is partial or missing.
- [ ] T016 Hide, park, or clearly tolerate out-of-scope forum/DM/reaction/report/channel-proposal features according to decisions.

## Phase 4: Verification

- [ ] T017 Add or update tests for approved-member channel access.
- [ ] T018 Add or update tests proving non-admin cannot publish in Jobs.
- [ ] T019 Add or update tests proving admin can publish in Jobs.
- [ ] T020 Add or update tests for retained search opening a found message.
- [ ] T021 Add or update authorization checks for admin-only pin/moderation behavior if retained.
- [ ] T022 Recommend GitHub issue closure/rescope updates for `#4,#20,#21,#23,#24,#25,#26` after local verification.

## Source Links

- `https://github.com/Marche-Libre/le-marche-libre/issues/15`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/4`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/20`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/21`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/23`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/24`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/25`
- `https://github.com/Marche-Libre/webapp-nextjs/issues/26`
