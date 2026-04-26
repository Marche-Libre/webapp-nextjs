# Product Framing

## Canonical Active Product Scope (Local)

The current local framing for cleanup and stabilization is:

- Stabilize the existing Next.js + Supabase product without broad rebuild.
- Keep auth/admission/chat/admin flows coherent for MVP stabilization.
- Keep project-management status local and reviewable in this repository.
- Preserve historical planning context while avoiding active-status drift across
  multiple file sets.

## Canonical Beta-Scope References

| Topic | Canonical local record | Supporting source references |
| --- | --- | --- |
| Cleanup scope and constraints | [README.md](./README.md) | `specs/001-project-management-cleanup/spec.md`, `specs/001-project-management-cleanup/plan.md` |
| MVP framing baseline | [tasks.md](./tasks.md) (`TASK-APP-00`) | `APP_REFINEMENT/TASK_00.STARTED.md`, `APP_REFINEMENT/TASK_00.SESSION_00.TODO.md` |
| Current app route and redirect map | `app_flow.md` | `APP_REFINEMENT/TASK_01.TODO.md` |
| Current Supabase schema and RLS map | `db_flow.md` | `APP_REFINEMENT/TASK_02.TODO.md` |

## Current-State Map Destinations

Use these documents when reviewing implementation reality:

- App flow map: `app_flow.md`
- DB/RLS map: `db_flow.md`
- Local source inventory and classification: [current-state.md](./current-state.md)

## Out of Scope for This Cleanup Slice

- Runtime implementation from `APP_REFINEMENT` tasks.
- External-source import from GitHub docs/issues/project items.
- GitHub Project decommission execution.

## Last Reviewed

- 2026-04-26
