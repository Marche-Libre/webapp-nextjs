# GitHub Project Decommission Record

## Decommission Gate Definition

Decommission target: org GitHub Project 1 should be deleted after local
replacement review passes and the `DEC-012` owner-authenticated export review
is complete.

Required gate checks before freeze/delete:

- Local replacement entrypoint exists and is reviewable:
  `docs/project-management/README.md`.
- Local task status does not depend on GitHub Project status.
- External source records and dispositions are captured locally.
- Owner-authenticated Project 1 export has been reviewed to resolve `DEC-012`.
- Blockers, owner, and next action are recorded if deletion is delayed.
- If the export is unavailable, do not freeze, delete, or decommission the
  Project; record the blocker, owner decision, next action, and review date
  instead.

## Tracking Record

- Project identifier:
  Org GitHub Project 1 (`https://github.com/orgs/Marche-Libre/projects/1`).
- Local replacement entrypoint:
  `docs/project-management/README.md`
- Local replacement review date:
  2026-04-26 (Phase 7 local replacement review complete)
- Project-item disposition summary:
  5 Project item records remain localized:
  `EXT-PROJ-001` through `EXT-PROJ-004` are merged into local candidate tasks,
  and `EXT-PROJ-005` remains the unmapped Project 1 remainder pending
  owner-authenticated export review.
- Current action state:
  Local replacement review completed. Freeze/delete/decommission not executed.
- Delayed-deletion blocker:
  No owner-authenticated Project 1 export was available for review, so
  `DEC-012` remains unresolved and unmapped Project 1 items cannot be
  reconciled safely.
- Responsible owner:
  Marche-Libre org/project owner with authenticated Project 1 access
- Next action:
  Provide an owner-authenticated Project 1 export, reconcile any remaining
  items into local records, then rerun decommission review before any
  freeze/delete action.
- Next review date:
  2026-05-03

## Local Replacement Review Checklist

| Check | Result | Evidence |
| --- | --- | --- |
| Start Here entrypoint points to canonical local records | pass | `docs/project-management/README.md` |
| Local task board carries active status | pass | `docs/project-management/tasks.md` |
| External docs/issues/Project provenance is localized | pass | 35/35 external source records have one disposition and one local destination |
| Verification record covers inventory, docs-only diff, and quality-gate handling | pass | `VERIFY-PHASE7-2026-04-26` |
| Active workflow depends on GitHub Project status | no | Local task status is independent of Project columns |
| Owner-authenticated Project 1 export reviewed | blocked | `DEC-012`; no export artifact was available during Phase 7 review |

## Project Item Disposition Summary

| Coverage slice | Count | Notes |
| --- | --- | --- |
| Imported Project item records | 5 | `EXT-PROJ-001`..`EXT-PROJ-005` |
| Merged into local candidate tasks | 4 | `EXT-PROJ-001`..`EXT-PROJ-004` -> `CAND-006`..`CAND-009` |
| Needs owner decision | 1 | `EXT-PROJ-005` remains blocked by `DEC-012` |

## Deletion Readiness Assessment

- Readiness: not ready
- Reason:
  No owner-authenticated Project 1 export was available to review the unmapped
  remainder tracked by `EXT-PROJ-005`.
- Action taken:
  None. Per the Phase 7 decommission gate, do not freeze, delete, or
  decommission org Project 1 until the export review resolves `DEC-012`.
