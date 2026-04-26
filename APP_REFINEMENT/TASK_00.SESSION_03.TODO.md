# TASK_00 - SESSION_03 - TODO

## Covers

- `TASK_04` - Admission X, email, parrain unique et statuts.
- `TASK_05` - Admin approve, refuse, rebasculer et bypass.

## Why Same Session

Admission semantics and admin transitions are tightly coupled. Normal approval, rejection, re-approval, sponsorship validation, and bypass audit must be implemented together so sponsor approval cannot accidentally become final account approval.

## Goal

Stabilize the MVP admission flow and controlled admin account transitions.

## DB/RLS Work Items

- Confirm target Supabase project and backup/rollback plan before migrations.
- Lock down sensitive `profiles` fields: `status`, `is_admin`, `sponsored_by`, `sponsor_approved`, moderation fields, and other system/admin-only fields.
- Do not rely on row-level RLS alone for column protection; use controlled server actions/RPCs, column privileges, or triggers that reject forbidden changes.
- Replace broad sponsor/profile update paths so sponsors cannot update final account status.
- Enforce one active sponsorship request per candidate with a precise definition of active, likely `pending` or `approved`.
- Prevent self-sponsorship.
- Ensure `attempt_number` is server/DB-controlled, not client-provided.
- Apply `accept_referrals = false` consistently in all sponsor-selection paths.
- Reconcile legacy `invitations` with `sponsorship_requests` or explicitly mark the legacy path as tolerated/deferred.
- Keep `profiles.sponsored_by` synchronized with the approved sponsorship request where required by admin approval rules.

## App/Admin Work Items

- Keep X auth as the only MVP auth path.
- Require email before final admission when X does not provide it.
- Ensure sponsor approval approves sponsorship only and keeps `profiles.status = 'pending'`.
- Centralize admin transitions in server actions or controlled RPCs.
- Verify current admin from a trusted DB source.
- Allow `pending -> approved`, `pending -> rejected`, `rejected -> approved`, and `approved -> rejected` under documented conditions.
- Require valid approved sponsorship for normal approval.
- Add separate sponsorship-bypass action with confirmation, required reason, and audit.
- Audit normal approval, reject, reapprove, and sponsorship bypass.
- Update `/en-attente`, `/parrainages`, and `/admin/utilisateurs` to show clear admission and sponsorship states.
- Align admission notifications with `sponsor_request` and `account_approved`; do not add out-of-scope rejection notifications unless explicitly decided.

## Completion

- Pending users cannot access the app.
- Rejected users see a clear state, not a redirect loop.
- Sponsor approval never sets `profiles.status = 'approved'`.
- Admin can approve a pending/rejected user with valid sponsorship.
- Admin cannot normally approve without valid sponsorship.
- Admin can bypass sponsorship only through the audited bypass action.
- Non-admin users cannot change privileged profile/admission fields through client Supabase.
- Sponsor cannot approve final account access.
- Targeted negative checks cover self-approval, sponsor final approval, self-sponsorship, forged request status, and non-admin admin actions.
- `db_flow.md` and `app_flow.md` are updated if the implemented behavior differs from the reference docs.

## Dependencies

- `SESSION_01` complete.
- `SESSION_02` complete or a safe admin testing path is explicitly documented.
