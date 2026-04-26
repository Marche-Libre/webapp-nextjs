# GitHub Project Decommission Record

## Decommission Gate Definition

Decommission target: org GitHub Project 1 should be deleted after local
replacement review passes.

Required gate checks before freeze/delete:

- Local replacement entrypoint exists and is reviewable:
  `docs/project-management/README.md`.
- Local task status does not depend on GitHub Project status.
- External source records and dispositions are captured locally (US3/Phase 7).
- Blockers, owner, and next action are recorded if deletion is delayed.

## Tracking Record

- Project identifier:
  Org GitHub Project 1 (exact URL/ID to be captured during US3 import).
- Local replacement entrypoint:
  `docs/project-management/README.md`
- Local replacement review date:
  2026-04-26 (partial review for Phase 1/2/US1/US2 only)
- Project-item disposition summary:
  Pending (US3 not executed; no Project item import/disposition yet).
- Current action state:
  Deletion deferred; do not decommission in this scope.
- Delayed-deletion blocker:
  External source localization and disposition coverage are not complete yet.
- Responsible owner:
  needs-owner-decision
- Next action:
  Execute US3 external-source import and Phase 7 decommission review.
- Next review date:
  2026-05-03
