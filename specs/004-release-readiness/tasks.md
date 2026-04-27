# Tasks: Release Readiness and Backlog Realignment

**Input**: `spec.md`, `plan.md`, `../archive/000-project-source-of-truth/roadmap.md`, `../archive/000-project-source-of-truth/sources.md`, and `../archive/000-project-source-of-truth/decisions.md`  
**Prerequisites**: Owner availability for product/technical/schema/access decisions

**Tests**: This is a release-governance feature. Runtime tests are selected or repaired by follow-up implementation tasks.

## Phase 1: Owners and Freeze

- [ ] T001 Confirm product owner for beta scope and go/no-go.
- [ ] T002 Confirm technical owner for `webapp-nextjs`.
- [ ] T003 Confirm schema/Supabase owner for reproducibility work.
- [ ] T004 Confirm admin access owners for GitHub org, Supabase, Vercel, and X OAuth.
- [ ] T005 Freeze new feature expansion except blocker fixes and explicit realignment tasks.

## Phase 2: Re-audit Current State

- [X] T006 Re-run or update the route/current-state review from `app_flow.md`. See `phase-2-audit.md`.
- [X] T007 Re-run or update the schema/RLS review from `db_flow.md` and imported audit. See `phase-2-audit.md`.
- [X] T008 Re-run or update build/lint/vitest status on the current branch. See `phase-2-audit.md`.
- [X] T009 Confirm whether `profiles_public`, `countries`, `cities`, `specialty_category_ids`, `specialty_categories.sector`, `chat_muted_until`, and `chat_banned` are reproducible or need migration/bootstrap work. See `phase-2-audit.md`.
- [X] T010 Confirm whether duplicate migration prefixes and channel-proposal trigger assumptions still exist. See `phase-2-audit.md`.

## Phase 3: Backlog Realignment

- [ ] T011 Classify all Admission items from `001-admission-membre` as done, partial, missing, parked, or rescoped after code review.
- [ ] T012 Classify all Profile/Search items from `002-profil-recherche-membre` as done, partial, missing, parked, or rescoped after code review.
- [ ] T013 Classify all Channels/Messages items from `003-canaux-messages` as done, partial, missing, parked, or rescoped after code review.
- [ ] T014 Classify Landing Page from `005-landing-page` as beta-blocking, separate, or parked.
- [ ] T015 Produce GitHub issue closure/rescope recommendations without using GitHub Project status as source of truth.

## Phase 4: Scope and Gate Decisions

- [ ] T016 Resolve forum beta position.
- [ ] T017 Resolve launch channel taxonomy.
- [ ] T018 Resolve admission data model direction.
- [ ] T019 Resolve refused-member UX.
- [ ] T020 Define minimal merge/beta quality gate.
- [ ] T021 Define closed-beta go/no-go checklist and owner signoff path.

## Phase 5: GitHub Project Decommission Readiness

- [ ] T022 Verify `../archive/000-project-source-of-truth/sources.md` has 26/26 Project items mapped.
- [ ] T023 Owner confirms `specs/` replaces GitHub Project as active management.
- [ ] T024 Freeze or delete GitHub Project 1 only after T022 and T023.
- [ ] T025 Record final GitHub Project state/export after T024.

## Source Links

- `https://github.com/Marche-Libre/le-marche-libre/issues/1`
- `https://github.com/Marche-Libre/le-marche-libre/issues/3`
- `https://github.com/Marche-Libre/le-marche-libre/issues/4`
- `https://github.com/Marche-Libre/le-marche-libre/issues/5`
- `https://github.com/Marche-Libre/le-marche-libre/tree/main/docs`
- `https://github.com/orgs/Marche-Libre/projects/1`
