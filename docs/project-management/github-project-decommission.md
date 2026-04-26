# GitHub Project Decommission Record

## Decommission Gate Definition

Decommission target: org GitHub Project 1 should be deleted after local
replacement review passes.

Required gate checks before freeze/delete:

- Local replacement entrypoint exists and is reviewable:
  `docs/project-management/README.md`.
- Local task status does not depend on GitHub Project status.
- External source records and dispositions are captured locally.
- Blockers, owner, and next action are recorded if deletion is delayed.

## Tracking Record

- Project identifier:
  Org GitHub Project 1 (`https://github.com/orgs/Marche-Libre/projects/1`).
- Local replacement entrypoint:
  `docs/project-management/README.md`
- Local replacement review date:
  2026-04-26 (partial review through US3 only; US4/Phase 7 still pending)
- Project-item disposition summary:
  5 Project item records imported in US3:
  `EXT-PROJ-001` through `EXT-PROJ-004` mapped to local candidate tasks, and
  `EXT-PROJ-005` records the unmapped Project 1 remainder as an owner decision.
- Current action state:
  Deletion deferred; do not decommission in this scope.
- Delayed-deletion blocker:
  US4 archive work is not complete, Phase 7 replacement review has not run, and
  `DEC-012` requires an owner-authenticated Project 1 export for unmapped items.
- Responsible owner:
  needs-owner-decision
- Next action:
  Execute US4 archive cleanup, then resolve `DEC-012`, then run Phase 7
  decommission review.
- Next review date:
  2026-05-03
