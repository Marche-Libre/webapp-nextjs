# Product Framing

## Canonical Active Product Scope (Local)

The canonical local framing for cleanup and stabilization is:

- Stabilize the existing Next.js + Supabase product without broad rebuild.
- Keep auth/admission/chat/admin flows coherent for MVP stabilization.
- Treat beta launch as closed-beta-first until release blockers are cleared.
- Keep project-management status local and reviewable in this repository only.
- Preserve historical planning context while avoiding active-status drift across
  multiple file sets.
- Keep runtime/product execution out of this cleanup; track those as candidate
  task records only.

## External Framing Localization (US3)

| External source record | Imported framing value | Canonical local destination |
| --- | --- | --- |
| `EXT-DOC-001` | External docs index and repo-role split | This file |
| `EXT-DOC-002` | Realignment decisions (stabilize first, explicit ownership) | This file + `decisions.md` |
| `EXT-DOC-004` | Beta scope contract (`must-have`, tolerated, out-of-scope) | This file + `tasks.md` candidate section |
| `EXT-DOC-007` | Execution sequencing (`freeze -> stabilize -> realign`) | This file + `tasks.md` candidate section |
| `EXT-DOC-008` | Observed code/backlog drift and release-readiness limits | `current-state.md` + `tasks.md` |

## Canonical Beta-Scope References

| Topic | Canonical local record | Supporting source references |
| --- | --- | --- |
| Cleanup scope and constraints | [README.md](./README.md) | `specs/001-project-management-cleanup/spec.md`, `specs/001-project-management-cleanup/plan.md` |
| MVP framing baseline | [tasks.md](./tasks.md) (`TASK-APP-00`) | `APP_REFINEMENT/TASK_00.STARTED.md`, `APP_REFINEMENT/TASK_00.SESSION_00.TODO.md` |
| External-origin admission MVP backlog | [tasks.md](./tasks.md) (`CAND-006`, `CAND-009`) | `EXT-ISSUE-WA-001`, `EXT-ISSUE-WA-003`, `EXT-ISSUE-WA-006`, `EXT-ISSUE-WA-007`, `EXT-ISSUE-WA-014`, `EXT-ISSUE-WA-016` |
| External-origin profile/search MVP backlog | [tasks.md](./tasks.md) (`CAND-007`) | `EXT-ISSUE-WA-005`, `EXT-ISSUE-WA-013`, `EXT-ISSUE-WA-017`, `EXT-ISSUE-WA-018`, `EXT-ISSUE-WA-019` |
| External-origin channels/messages MVP backlog | [tasks.md](./tasks.md) (`CAND-008`) | `EXT-ISSUE-WA-004`, `EXT-ISSUE-WA-020`, `EXT-ISSUE-WA-021`, `EXT-ISSUE-WA-023`, `EXT-ISSUE-WA-024`, `EXT-ISSUE-WA-025`, `EXT-ISSUE-WA-026` |
| Current app route and redirect map | `app_flow.md` | `APP_REFINEMENT/TASK_01.TODO.md` |
| Current Supabase schema and RLS map | `db_flow.md` | `APP_REFINEMENT/TASK_02.TODO.md` |

## Current-State Map Destinations

Use these documents when reviewing implementation reality:

- App flow map: `app_flow.md`
- DB/RLS map: `db_flow.md`
- Local source inventory and classification: [current-state.md](./current-state.md)

## Out of Scope for This Cleanup Slice

- Runtime implementation from `APP_REFINEMENT` tasks and external issue backlog.
- US4 archive movement/deletion execution.
- GitHub Project decommission execution.

## Last Reviewed

- 2026-04-26
