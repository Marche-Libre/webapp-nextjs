# Tasks: Project Source of Truth Migration

**Input**: `specs/000-project-source-of-truth/spec.md` and authenticated GitHub/source exports  
**Prerequisites**: GitHub CLI access to `Marche-Libre` org Project 1 and repositories

**Tests**: Docs-only migration. Verification is coverage review plus git diff surface inspection.

## Phase 1: Source Export

- [X] T001 Export GitHub Project 1 metadata and confirm it contains 26 items.
- [X] T002 Export Project 1 item fields: title, source repo, issue number, status, scope, size, milestone, URL.
- [X] T003 Export `Marche-Libre/le-marche-libre` docs `00-cadrage.md` through `06-etat-webapp-nextjs.md`.
- [X] T004 Export `Marche-Libre/le-marche-libre` issue list.
- [X] T005 Export `Marche-Libre/webapp-nextjs` issue list.

## Phase 2: Speckit Batch Import

- [X] T006 Create `specs/000-project-source-of-truth/` as the active index.
- [X] T007 Create `specs/001-admission-membre/` from US1 and admission Project items.
- [X] T008 Create `specs/002-profil-recherche-membre/` from US2 and profile/search Project items.
- [X] T009 Create `specs/003-canaux-messages/` from US3 and channels/messages Project items.
- [X] T010 Create `specs/004-release-readiness/` from roadmap, risks, governance, architecture, and audit items.
- [X] T011 Create `specs/005-landing-page/` from the separate landing page Project item.

## Phase 3: Cleanup Active Surface

- [X] T012 Archive previous cleanup Speckit output under `specs/archive/001-project-management-cleanup/`.
- [X] T013 Archive previous `docs/project-management` output under `specs/archive/docs-project-management/`.
- [X] T014 Update root `README.md` to point to the Speckit source of truth.
- [X] T015 Update `AGENTS.md` and `.specify/feature.json` to point to `specs/000-project-source-of-truth/`.

## Phase 4: Verification and Decommission

- [ ] T016 Owner reviews `sources.md` against GitHub Project 1 and confirms 26/26 item coverage.
- [ ] T017 Owner confirms `specs/` replaces GitHub Project for project management.
- [ ] T018 Freeze or delete GitHub Project 1 only after T016 and T017 are complete.
- [ ] T019 If GitHub Project 1 is deleted, record the deletion date and final export location in `sources.md`.

## Checkpoint

The repository is ready to stop using GitHub Project as active management when
T016 and T017 are complete. T018 is intentionally left unchecked because it is a
destructive owner action.
