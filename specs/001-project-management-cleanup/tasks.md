# Tasks: Project Management Cleanup

**Input**: Design documents from `/Users/maxi/www/marchelibre/specs/001-project-management-cleanup/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/local-project-management.md`, `quickstart.md`

**Tests**: Automated app tests are not requested for this documentation-only cleanup. Verification is handled through review records in `docs/project-management/verification.md`, including no-runtime-change evidence and quality-gate skip/run notes.

**Organization**: Tasks are grouped by user story so each story can be implemented and reviewed independently. All work is docs/process work only; do not change app routes, UI, Supabase files, dependencies, package locks, generated types, tests, or runtime behavior. Any discovered product or runtime work must become a separate candidate task in `docs/project-management/tasks.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after prerequisite phase work is complete because it edits different files or independent records
- **[Story]**: User story label from `spec.md`
- **File paths**: Every task includes the local file path that must be created or updated

## Phase 1: Setup (Shared Documentation Structure)

**Purpose**: Create the local project-management surface required by the plan.

- [X] T001 Create the local project-management directory by adding initial entry files at `docs/project-management/README.md` and `docs/project-management/archive/README.md`
- [X] T002 [P] Create the active product framing skeleton at `docs/project-management/product-framing.md`
- [X] T003 [P] Create the current-state and local document inventory skeleton at `docs/project-management/current-state.md`
- [X] T004 [P] Create the canonical local task inventory skeleton at `docs/project-management/tasks.md`
- [X] T005 [P] Create the external source inventory skeleton at `docs/project-management/external-sources.md`
- [X] T006 [P] Create the cleanup decision log skeleton at `docs/project-management/decisions.md`
- [X] T007 [P] Create the verification record skeleton at `docs/project-management/verification.md`
- [X] T008 [P] Create the GitHub Project decommission record skeleton at `docs/project-management/github-project-decommission.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the local record contracts and scope guard before any source is classified or imported.

**Critical**: No user story work should begin until this phase is complete.

- [X] T009 [P] Document the docs-only scope guard, local source-of-truth rule, and no-runtime-change boundary in `docs/project-management/README.md`
- [X] T010 [P] Document the document taxonomy, classification values, and cleanup action rules in `docs/project-management/current-state.md`
- [X] T011 [P] Document the Task Record template, lifecycle statuses, allowed transitions, and required transition history in `docs/project-management/tasks.md`
- [X] T012 [P] Document the External Source Record template, provenance fields, and disposition values in `docs/project-management/external-sources.md`
- [X] T013 [P] Document the Cleanup Decision template and merge/archive/delete/owner-decision rules in `docs/project-management/decisions.md`
- [X] T014 [P] Document the Verification Record checklist, coverage counts, runtime diff check, and quality-gate record format in `docs/project-management/verification.md`
- [X] T015 [P] Document the GitHub Project decommission gate, replacement pointer requirement, deletion target, and delayed-deletion blocker fields in `docs/project-management/github-project-decommission.md`

**Checkpoint**: Local record formats are defined and ready for inventory, import, normalization, archive, and review work.

---

## Phase 3: User Story 1 - Find the Current Source of Truth (Priority: P1)

**Goal**: A contributor can start from one entrypoint and find active scope, current-state maps, task inventory, external-source inventory, decisions, verification, and archive location.

**Independent Test**: A contributor unfamiliar with the cleanup can start at `docs/project-management/README.md` and identify the active product framing, active cleanup plan, current task board, imported external-source inventory, and archived material in under 10 minutes.

### Implementation for User Story 1

- [X] T016 [US1] Build Start Here navigation with links to product framing, current-state maps, task inventory, external-source inventory, decision log, verification records, archive index, and decommission record in `docs/project-management/README.md`
- [X] T017 [US1] Inventory and classify root planning documents `README.md`, `AGENTS.md`, `CLAUDE.md`, `app_flow.md`, `db_flow.md`, `design.md`, and `design-system/marchélibre/MASTER.md` in `docs/project-management/current-state.md`
- [X] T018 [US1] Inventory and classify Spec Kit artifacts under `specs/001-project-management-cleanup/` including `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `checklists/requirements.md`, and `contracts/local-project-management.md` in `docs/project-management/current-state.md`
- [X] T019 [US1] Record the canonical active product scope, beta-scope references, and current-state map destinations in `docs/project-management/product-framing.md`
- [X] T020 [US1] Record keep, merge, reference, rename, archive, delete, or owner-decision entries for duplicate local planning topics in `docs/project-management/decisions.md`
- [X] T021 [P] [US1] Add a concise local project-management pointer to `docs/project-management/README.md` from the root project overview in `README.md`
- [X] T022 [P] [US1] Add an agent-facing pointer to `docs/project-management/README.md` and the docs-only scope boundary in `AGENTS.md`
- [X] T023 [US1] Follow every Start Here link and record the US1 navigation review result in `docs/project-management/verification.md`

**Checkpoint**: User Story 1 is complete when the local entrypoint exposes one canonical navigation path and duplicate local planning topics have an explicit disposition or owner-decision record.

---

## Phase 4: User Story 2 - Normalize Tasks and Statuses (Priority: P1)

**Goal**: Every active cleanup task has one local status, one priority, one scope boundary, clear completion criteria, related documents, and reviewable transition history.

**Independent Test**: A maintainer can open `docs/project-management/tasks.md` and determine which items are proposed, ready, in progress, blocked, done, or archived without opening unrelated documents.

### Implementation for User Story 2

- [X] T024 [P] [US2] Inventory and classify all `APP_REFINEMENT/*.md` task and session files as local source documents in `docs/project-management/current-state.md`
- [X] T025 [P] [US2] Record the filename-status mapping from `TODO`, `READY`, and `STARTED` into the local lifecycle statuses and transition rationale in `docs/project-management/decisions.md`
- [X] T026 [US2] Create one canonical Task Record per active `APP_REFINEMENT/` work item with priority, status, purpose, scope, out-of-scope boundary, completion criteria, related documents, last reviewed date, and next action in `docs/project-management/tasks.md`
- [X] T027 [US2] Merge `APP_REFINEMENT/TASK_00.STARTED.md` and `APP_REFINEMENT/TASK_00.SESSION_00.TODO.md` through `APP_REFINEMENT/TASK_00.SESSION_07.TODO.md` into one canonical task with transition history and source references in `docs/project-management/tasks.md`
- [X] T028 [US2] Record unresolved status conflicts, unclear task scope, or missing owner decisions from `APP_REFINEMENT/` as owner-decision-needed entries in `docs/project-management/decisions.md`
- [X] T029 [US2] Mark each `APP_REFINEMENT/*.md` source as active, reference, merged, archived, deleted, or needs-owner-decision after task normalization in `docs/project-management/current-state.md`
- [X] T030 [US2] Add separate candidate Task Records for any discovered app-behavior, product-scope, Supabase, dependency, test-repair, or runtime work and explicitly scope them outside this cleanup in `docs/project-management/tasks.md`
- [X] T031 [US2] Validate active task field coverage, status counts, priority counts, and transition-history coverage in `docs/project-management/verification.md`

**Checkpoint**: User Story 2 is complete when active work is represented by local task records and no status is inferred only from a filename or external board.

---

## Phase 5: User Story 3 - Localize External GitHub Sources (Priority: P2)

**Goal**: External documentation, GitHub issues, and org GitHub Project items are imported as local source records with provenance, disposition, and canonical local destinations.

**Independent Test**: For every relevant external document, issue, or project item, a maintainer can identify whether it was imported, merged, archived, discarded, or left as an explicit owner decision.

### Implementation for User Story 3

- [X] T032 [US3] Refresh and record external documentation source records from `Marche-Libre/le-marche-libre` including `README.md` and `docs/00-cadrage.md` through `docs/06-etat-webapp-nextjs.md` in `docs/project-management/external-sources.md`
- [X] T033 [US3] Refresh and record relevant GitHub issue source records from `Marche-Libre/le-marche-libre` in `docs/project-management/external-sources.md`
- [X] T034 [US3] Refresh and record relevant GitHub issue source records from `Marche-Libre/webapp-nextjs` in `docs/project-management/external-sources.md`
- [X] T035 [US3] Refresh and record org GitHub Project 1 item source records, including title, URL or identifier, status at import time, and source repository when available, in `docs/project-management/external-sources.md`
- [X] T036 [US3] Assign each external source record a local destination and disposition of imported-active, merged, archived, discarded-no-unique-value, or needs-owner-decision in `docs/project-management/external-sources.md`
- [X] T037 [US3] Merge active external product framing and beta-scope value into canonical local framing with source references in `docs/project-management/product-framing.md`
- [X] T038 [US3] Merge external current-state webapp observations into the local current-state map with source references in `docs/project-management/current-state.md`
- [X] T039 [US3] Create local Task Records or candidate parent tasks for active external issues and Project items, with external provenance but local-only active status, in `docs/project-management/tasks.md`
- [X] T040 [US3] Record duplicate, conflicting, discarded, broad, or owner-decision external source outcomes in `docs/project-management/decisions.md`
- [X] T041 [US3] Verify 100% external source disposition coverage and no active dependency on external GitHub sources in `docs/project-management/verification.md`

**Checkpoint**: User Story 3 is complete when every relevant external source has provenance, local destination, disposition, and no active planning status depends on GitHub issues or the GitHub Project.

---

## Phase 6: User Story 4 - Archive Without Losing History (Priority: P3)

**Goal**: Historical planning context is preserved outside the active planning surface, with archive reasons and replacement references where applicable.

**Independent Test**: A contributor can locate archived planning records and understand why they were archived, while active navigation shows only current materials.

### Implementation for User Story 4

- [X] T042 [P] [US4] Define archive categories, retention rules, archive entry format, and active-navigation restrictions in `docs/project-management/archive/README.md`
- [X] T043 [P] [US4] Record initial merge, archive, delete, rename, and owner-decision actions for historical material in `docs/project-management/decisions.md`
- [X] T044 [US4] Move historical local planning files whose useful content is captured and no longer active into `docs/project-management/archive/` with replacement references recorded in `docs/project-management/archive/README.md`
- [X] T045 [US4] Record deleted or deletion-pending documents that have no unique project value, including deletion reason and reviewer, in `docs/project-management/decisions.md`
- [X] T046 [US4] Update active navigation so `docs/project-management/README.md` links only canonical active documents and the archive index, not archived source files as required reading
- [X] T047 [US4] Verify archive reason coverage, replacement-reference coverage, and active-navigation archive boundaries in `docs/project-management/verification.md`

**Checkpoint**: User Story 4 is complete when archived material is discoverable, active navigation is not polluted by historical source files, and deletion/archive actions are reviewable.

---

## Phase 7: Polish & Cross-Cutting Verification

**Purpose**: Reconcile the cleaned state, record evidence, and decommission the GitHub Project only after local replacement review.

- [ ] T048 Reconcile final cleaned-state inventory counts for active, reference, merged, archived, deleted, and needs-owner-decision local documents in `docs/project-management/verification.md`
- [ ] T049 Inspect the final diff for app routes, components, Supabase files, permissions, dependencies, package locks, generated types, tests, and runtime behavior changes, then record the no-runtime-change result in `docs/project-management/verification.md`
- [ ] T050 Record whether `bun run build`, `bun run lint`, and `bunx vitest run` were skipped as docs-only, run successfully, or run with known baseline failures in `docs/project-management/verification.md`
- [ ] T051 Complete the local replacement review checklist, Project item disposition summary, and deletion readiness assessment in `docs/project-management/github-project-decommission.md`
- [ ] T052 After local replacement review, freeze or delete org GitHub Project 1 with a pointer to `docs/project-management/README.md` and record the action, blocker, owner, next action, and review date in `docs/project-management/github-project-decommission.md`
- [ ] T053 Update the source-of-truth statement and last reviewed date after decommission review in `docs/project-management/README.md`
- [ ] T054 Run the `specs/001-project-management-cleanup/quickstart.md` acceptance review and record pass, passed-with-owner-decisions, or failed in `docs/project-management/verification.md`

---

## Dependencies & Execution Order

### Current Phase Status

| Phase / story | Status | Verification / blocker |
|------|--------|------------------------|
| Phase 1 Setup | Complete | T001-T008 complete. |
| Phase 2 Foundational | Complete | T009-T015 complete. |
| Phase 3 US1 | Complete | `VERIFY-US1-2026-04-26`. |
| Phase 4 US2 | Complete | `VERIFY-US2-2026-04-26`. |
| Phase 5 US3 | Complete with owner decision | `VERIFY-US3-2026-04-26`; Project 1 export remainder tracked by `DEC-012` / `EXT-PROJ-005`. |
| Phase 6 US4 | Complete | `VERIFY-US4-2026-04-26`; archive movement and boundary checks complete. |
| Phase 7 Polish | Pending | Do after local replacement review and Project export/decommission review conditions are ready. |

### Phase Dependencies

| Phase | Depends On | Notes |
|------|------------|-------|
| Phase 1 Setup | None | Creates the local documentation surface. |
| Phase 2 Foundational | Phase 1 | Defines contracts and scope guard before classification/import work. |
| Phase 3 US1 | Phase 2 | Complete; canonical entrypoint and local source-of-truth navigation exist. |
| Phase 4 US2 | Phase 2 | Complete; APP_REFINEMENT task status is local. |
| Phase 5 US3 | Phase 2, preferably US1 and US2 | Complete with owner decision; external sources are localized and Project export remainder is explicit. |
| Phase 6 US4 | US1, US2, US3 | Complete; archive actions used classification, task normalization, and external dispositions. |
| Phase 7 Polish | Desired user stories complete | Decommission happens only after local replacement review and Project export coverage. |

### User Story Dependencies

| User Story | Priority | Dependencies | Can Be Delivered Independently |
|------------|----------|--------------|--------------------------------|
| US1 Find the Current Source of Truth | P1 | Phase 2 | Delivered; navigation MVP verified. |
| US2 Normalize Tasks and Statuses | P1 | Phase 2 | Delivered; local task board verified. |
| US3 Localize External GitHub Sources | P2 | Phase 2, then local destinations from US1/US2 | Delivered with owner decision; external provenance/disposition coverage verified. |
| US4 Archive Without Losing History | P3 | US1, US2, US3 | Delivered; source records and classifications now point to archive records. |

### Within Each User Story

| Story | Internal Order |
|-------|----------------|
| US1 | Create navigation, inventory local planning docs, assign canonical destinations, record decisions, update root pointers, verify navigation. |
| US2 | Inventory task/session files, map filename statuses to lifecycle statuses, create canonical task records, record conflicts, capture product/runtime candidates, verify coverage. |
| US3 | Refresh external sources, create source records, assign dispositions, merge active value into local records, verify external coverage. |
| US4 | Define archive rules, record decisions, move or mark historical material, update active navigation, verify archive coverage. |

---

## Parallel Opportunities

| Area | Parallel Tasks |
|------|----------------|
| Setup | T002, T003, T004, T005, T006, T007, and T008 can run after T001. |
| Foundational | T009, T010, T011, T012, T013, T014, and T015 can run in parallel. |
| US1 | T021 and T022 can run in parallel after T016 because they update different root guidance files. |
| US2 | T024 and T025 can run in parallel because one updates local source inventory and one records status mapping decisions. |
| US3 | External source review can be split by source collection, but edits to `docs/project-management/external-sources.md` should be serialized to avoid record conflicts. |
| US4 | T042 and T043 can run in parallel because archive rules and decision entries are separate files. |

## Parallel Example: User Story 1

```text
Task: T021 Add the root README pointer in README.md
Task: T022 Add the agent-facing pointer in AGENTS.md
```

## Parallel Example: User Story 2

```text
Task: T024 Inventory APP_REFINEMENT source files in docs/project-management/current-state.md
Task: T025 Record filename-status lifecycle mapping in docs/project-management/decisions.md
```

## Parallel Example: User Story 3

```text
Source review only: Contributor A reviews Marche-Libre/le-marche-libre docs while Contributor B reviews GitHub issues and Project 1 items.
Merge discipline: Execute T032 through T036 serially when editing docs/project-management/external-sources.md.
```

## Parallel Example: User Story 4

```text
Task: T042 Define archive categories in docs/project-management/archive/README.md
Task: T043 Record archive and deletion decisions in docs/project-management/decisions.md
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 and US2 because both are P1 and together provide the local entrypoint plus the usable local task board.
3. Complete US3 to localize external docs/issues/Project provenance before any archive/decommission work.
4. Stop and validate that `docs/project-management/README.md`, `docs/project-management/tasks.md`, and `docs/project-management/external-sources.md` are independently usable.

### Incremental Delivery

1. Deliver US1 for source-of-truth navigation.
2. Deliver US2 for local task/status normalization.
3. Deliver US3 for external source localization and local provenance. (Complete as of 2026-04-26 with `DEC-012` owner decision.)
4. Deliver US4 for archive cleanup and historical retention. (Complete as of
   2026-04-26 with `VERIFY-US4-2026-04-26`.)
5. Complete Phase 7 only after US4 and after the local replacement review confirms no active dependency on the GitHub Project.

### Decommission Gate

Do not freeze or delete org GitHub Project 1 until `docs/project-management/external-sources.md`, `docs/project-management/tasks.md`, `docs/project-management/decisions.md`, and `docs/project-management/verification.md` show local replacement coverage. If deletion is delayed by access or owner decision, record the blocker and next action in `docs/project-management/github-project-decommission.md`.

## Notes

- Keep all implementation work docs-only.
- Do not edit runtime code, app routes, UI components, Supabase files, generated types, dependency files, package locks, or test behavior for this feature.
- Treat GitHub issues and GitHub Project items as provenance only after localization.
- Record discovered runtime or product work as candidate tasks in `docs/project-management/tasks.md`; do not implement it inside this cleanup.
