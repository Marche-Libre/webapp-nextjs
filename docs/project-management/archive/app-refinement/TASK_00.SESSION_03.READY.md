# TASK_00 - SESSION_03 - TODO

## Covers

- `TASK_04` - Admission X, email, parrain unique et statuts.
- `TASK_05` - Admin approve, refuse, rebasculer et bypass.

## Target Outcome

Stabilize the MVP admission flow so sponsorship approval and final account approval are clearly separated, enforced by DB/server controls, visible in the UI, and auditable for admin actions.

## Why Same Session

Admission semantics and admin transitions are tightly coupled. Sponsor approval, rejection, re-approval, sponsorship validation, and admin bypass must be implemented together so sponsor approval cannot accidentally become final account approval.

## Priority Model

| Priority | Meaning |
| --- | --- |
| P0 | Security or admission correctness blocker. Must complete in this session. |
| P1 | Required MVP behavior, but can follow P0 once core guarantees are safe. |
| P2 | Useful cleanup or documentation alignment. Defer only if time is constrained. |

## Execution Plan

### Now - P0

| Item | Impact | Urgency | Effort | Risk | Uncertainty | Dependencies | Completion Criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Confirm Supabase target project and rollback/backup plan | High | High | S | High | Low | Admin DB access | Project is confirmed before migrations; rollback path documented. |
| Lock down privileged `profiles` fields | Very high | High | M | High | Medium | Current RLS/schema review | Non-admin/client paths cannot modify `status`, `is_admin`, `sponsored_by`, `sponsor_approved`, moderation fields, or system/admin-only fields. |
| Replace broad sponsor/profile update paths | Very high | High | M | High | Medium | Existing sponsorship flow | Sponsor approval cannot update `profiles.status` or grant final app access. |
| Centralize admin transitions | Very high | High | M | Medium | Medium | Trusted admin verification | Admin approve/reject/reapprove/bypass flows run only through controlled server actions or RPCs. |
| Enforce normal approval requirements | High | High | S/M | Medium | Medium | Sponsorship data consistency | Admin normal approval requires valid approved sponsorship. |
| Prevent client-forged sponsorship data | High | High | M | Medium | Medium | DB constraints or server action | `requester_id`, `status`, and `attempt_number` are server/DB-controlled; self-sponsorship is impossible. |

### Next - P1

| Item | Impact | Urgency | Effort | Risk | Uncertainty | Dependencies | Completion Criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Enforce one active sponsorship request per candidate | High | Medium | M | Medium | Medium | Definition of active request | Only one `pending` or `approved` sponsorship request can exist per candidate. |
| Add audited sponsorship bypass action | High | Medium | M | Medium | Low | Admin transition primitives | Bypass requires admin, explicit action, confirmation, reason, and audit entry. |
| Audit admission transitions | High | Medium | M | Medium | Medium | Audit table/mechanism | Normal approval, rejection, reapproval, and bypass are recorded with admin, target, statuses, action, reason where relevant, and timestamp. |
| Update `/admin/utilisateurs` | High | Medium | M | Medium | Low | Server/admin actions | UI shows sponsorship state; normal approval disabled without valid sponsorship; bypass is separate. |
| Update `/parrainages` | High | Medium | S/M | Medium | Low | Sponsor approval semantics | Sponsor approval only approves sponsorship and explains that admin finalizes access. |
| Update `/en-attente` | Medium | Medium | M | Medium | Medium | Final admission states | Pending, missing email, no sponsor, sponsor pending/refused/approved, and admin rejected states are clear. |

### Later - P2

| Item | Impact | Urgency | Effort | Risk | Uncertainty | Dependencies | Completion Criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Reconcile legacy `invitations` with `sponsorship_requests` | Medium | Low | L | High | High | Product/data decision | Either legacy path is migrated, disabled, or explicitly tolerated/deferred. |
| Align notification scope | Medium | Low | S/M | Low | Medium | Product decision | Keep `sponsor_request` and `account_approved`; do not add rejection notifications unless explicitly decided. |
| Update flow docs | Medium | Low | S | Low | Low | Final implementation | `db_flow.md` and `app_flow.md` reflect implemented behavior if it differs from reference docs. |

## Implementation Order

1. Confirm environment and backup.
2. Inspect current DB/RLS and sensitive update paths.
3. Add/adjust DB protections for privileged profile fields.
4. Add sponsorship request safeguards.
5. Refactor sponsor approval so it never approves account access.
6. Centralize admin approval/rejection/reapproval/bypass.
7. Add audit logging for admin transitions.
8. Update admin, sponsorship, and waiting-state UI.
9. Run targeted negative checks.
10. Update flow documentation if needed.

## Admission Rules

- X auth remains the only MVP auth path.
- Email is required before final admission when X does not provide it.
- New profiles remain `pending` until admin approval.
- Sponsor approval means sponsorship approval only.
- Sponsor approval must not set `profiles.status = 'approved'`.
- Final app access requires `profiles.status = 'approved'`.
- `rejected` is the DB status; `refuse` is only a UI label if used.

## Admin Transition Rules

| Transition | Allowed | Conditions |
| --- | --- | --- |
| `pending -> approved` | Yes | Valid approved sponsorship or audited bypass. |
| `pending -> rejected` | Yes | Admin action. |
| `rejected -> approved` | Yes | Valid approved sponsorship or audited bypass. |
| `approved -> rejected` | Yes | Admin action; access is removed. |
| `approved -> pending` | No | Out of MVP scope unless explicitly decided. |

## DB/RLS Requirements

- Do not rely on row-level RLS alone for column-level protection.
- Use controlled server actions/RPCs, column privileges, triggers, or constraints where appropriate.
- Lock down privileged `profiles` fields: `status`, `is_admin`, `sponsored_by`, `sponsor_approved`, moderation fields, and system/admin-only fields.
- Prevent self-sponsorship.
- Enforce one active sponsorship request per candidate.
- Ensure `attempt_number` is server/DB-controlled.
- Apply `accept_referrals = false` consistently in all sponsor-selection paths.
- Keep `profiles.sponsored_by` synchronized with the approved sponsorship request where required by admin approval rules.

## App/Admin Requirements

- Verify current admin from a trusted DB source.
- Normal approval must reject users without valid approved sponsorship.
- Bypass approval must be a separate action.
- Bypass requires confirmation and a non-empty reason.
- UI must surface server errors instead of only logging them.
- Pending users cannot access the app.
- Rejected users see a clear state, not a redirect loop.

## Audit Requirements

Audit these actions:

- Normal approval.
- Rejection.
- Reapproval.
- Sponsorship bypass.

Minimum audit fields:

- `admin_id`
- `target_user_id`
- `action`
- `previous_status`
- `new_status`
- `reason`
- `created_at`

## Targeted Checks

- Pending users cannot access the app.
- Rejected users see a clear state.
- Sponsor approval never sets `profiles.status = 'approved'`.
- Admin can approve a pending or rejected user with valid sponsorship.
- Admin cannot normally approve without valid sponsorship.
- Admin can bypass sponsorship only through the audited bypass action.
- Non-admin users cannot change privileged admission fields through client Supabase.
- Sponsor cannot approve final account access.
- Self-sponsorship is rejected.
- Forged sponsorship request status is rejected.
- Forged `attempt_number` is ignored or rejected.
- Non-admin admin actions fail.

## Dependencies

- `SESSION_01` complete.
- `SESSION_02` complete or a safe admin testing path is explicitly documented.
- Supabase target project confirmed.
- Backup or rollback plan confirmed before migration work.

## Open Decisions

- Whether admin can act on another admin profile. Recommendation: block by default until a super-admin model exists.
- Whether rejection reason is required. Recommendation: optional for MVP, unlike bypass reason which must be required.
- Whether bypass should modify `sponsor_approved`. Recommendation: no; keep sponsorship state distinct from admission override.
- Whether legacy `invitations` should be migrated, disabled, or tolerated. Recommendation: defer unless it is currently active in the MVP path.

## Suggested Prompt

Execute `APP_REFINEMENT/TASK_00.SESSION_03.TODO.md` after confirming Supabase project and rollback plan. Implement DB/server protections first, then sponsor semantics, then admin transitions, then UI states. Do not allow sponsor approval to grant final account access. Add targeted negative checks and update flow docs if behavior differs from reference.
