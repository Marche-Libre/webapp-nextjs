# TASK_00 - SESSION_06 - TODO

## Covers

`TASK_09` - Moderation messages, soft delete, edit/delete et pin.

## Goal

Stabilize message author actions and admin moderation: edit, soft delete, tombstone display, report, and pin.

## Work Items

- Confirm target Supabase project and rollback plan before migrations.
- Add or verify required message fields: `is_pinned`, `pinned_at`, `pinned_by`, `is_deleted`, `deleted_at`, `deleted_by`, `deleted_by_admin`, and `edited_at`.
- Add or verify `user_reports.message_id` if `user_reports` remains present in the app.
- Keep `messages.content` non-null; for soft delete, remove standard-client access to original content and image.
- Replace direct client message mutations with server actions or controlled RPCs for edit, own delete, admin moderate delete, pin/unpin, and report.
- Ensure deleted messages show tombstones after refresh.
- Ensure deleted messages do not expose content, images, embeds, reactions, or report affordances to standard clients.
- Enforce admin-only pin/moderation in DB, not only UI.
- Exclude deleted messages from message search.
- Defer admin-only deleted-content audit storage unless product/legal need is explicit.

## Completion

- Authors can edit/delete their own non-deleted messages.
- Admins can moderate and pin/unpin.
- Non-admins cannot pin or moderate through direct client calls.
- Deleted content and images are not exposed to standard clients.
- Tombstones render after refresh.
- Search excludes deleted messages.
- `user_reports.message_id` works where report UI remains active.
- Targeted negative checks cover non-admin pin, non-author edit/delete, deleted-content visibility, and report creation rules.
- `db_flow.md` is updated if implemented schema/policies differ from the reference.

## Dependencies

- `SESSION_01` complete.
- `SESSION_03` admin semantics available.
- `SESSION_04` chat RLS complete or coordinated.
