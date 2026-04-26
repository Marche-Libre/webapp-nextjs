# TASK_00 - SESSION_07 - TODO

## Covers

`TASK_10` - Durcissement RLS, nettoyage et verification finale.

## Goal

Perform final security hardening and MVP cleanup in small, verifiable lots without mixing destructive DB changes with RLS fixes.

## Work Lots

### Lot 1 - DB Security Inventory

- Inventory real DB policies, grants, functions, and realtime publications.
- Audit `SECURITY DEFINER` functions for fixed `search_path` and controlled grants.
- Confirm `db_flow.md` matches current implementation.

### Lot 2 - RLS Hardening And Negative Checks

- Harden RLS for profiles, sponsorship, invitations, channels, channel members, messages, reactions, notifications, and legacy exposed tables.
- Freeze or restrict forum/proposals/legacy tables while they still exist if they remain exposed.
- Verify the minimal notification set is coherent in DB and app code: `welcome`, `sponsor_request`, `account_approved`, `chat_mention` if already present.
- Add SQL negative tests where feasible; document manual checks only when SQL tests are not practical.

### Lot 3 - MVP UI Cleanup

- Remove remaining visible non-MVP UI after security-critical work is stable.
- Keep legacy redirects.
- Confirm `app_flow.md` matches current implementation.

### Lot 4 - Code Cleanup

- Clean dead code only in small follow-up changes.
- Do not mix cleanup with new RLS fixes.
- Defer destructive DB drops until after backup and a separate migration decision.

## Completion

- Critical negative RLS checks pass or are documented with rationale.
- Chat, sponsorship, admin, notifications, and moderation remain functional.
- Non-MVP surfaces are no longer exposed through main UI.
- Forum/proposals/legacy tables are frozen/restricted or explicitly documented as safe.
- No destructive DB change is mixed with RLS work.
- Lint and build pass.
- `db_flow.md` and `app_flow.md` are current after final changes.

## Dependencies

- `SESSION_03`, `SESSION_04`, `SESSION_05`, and `SESSION_06` complete.
- Backup exists before any destructive DB work.
