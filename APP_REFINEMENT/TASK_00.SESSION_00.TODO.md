# TASK_00 - SESSION_00 - TODO

## Covers

`TASK_00` - Cadrage MVP.

## Role

Reference only. The master MVP framing document is preserved as `APP_REFINEMENT/TASK_00.STARTED.md` and should stay untouched unless a product decision changes.

## Purpose

Keep the baseline decisions visible for all sessions:

- No full rebuild.
- Keep the 2 existing profiles and make them admins.
- X auth only.
- Sponsor validates sponsorship; admin validates final access.
- Chat is the MVP core.
- Forum and standalone annuaire are not active MVP products.
- DB/RLS is the main risk.

## Triage

| Item | Priority | Effort | Risk | Status | Rationale |
| --- | --- | --- | --- | --- | --- |
| Preserve MVP framing | P0 | S | Low | Done | Master decisions are documented in `TASK_00.STARTED.md`. |
| Keep baseline visible across sessions | P0 | S | Low | Done | This session file summarizes the key constraints for future sessions. |
| Avoid implementation work | P0 | S | Low | Done | `TASK_00` is framing-only and should not trigger code, DB, route, or RLS changes. |
| Re-open only on product decision change | P1 | S | Medium | Watch | Re-opening is only needed if MVP scope changes materially. |

## Execution Order

### Now

No action required. Treat `TASK_00` as completed framing/reference.

### Next

Proceed with `TASK_00.SESSION_01.READY.md`, which covers:

1. `TASK_02` - generate `db_flow.md`.
2. `TASK_01` - generate `app_flow.md`.

### Later

Re-open `TASK_00` only if one of these changes:

- Auth scope changes from X-only.
- Sponsorship model changes from single sponsor.
- Forum or standalone annuaire becomes active MVP scope.
- Chat stops being the MVP core.
- DB/RLS risk model changes materially.

## Reopen Criteria

This file should remain stable unless a product decision changes. If reopened, update `TASK_00.STARTED.md` first, then mirror only the relevant summary here.

## Completion

- No implementation work.
- Re-open only if the MVP framing changes.
