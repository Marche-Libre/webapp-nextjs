# TASK_00 - SESSION_04 - TODO

## Covers

`TASK_08` - Chat MVP, canaux initiaux et Jobs admin-only.

## Goal

Align chat with the MVP: public channels, Jobs readable by approved members and writable only by admins, and safe channel/message RLS.

## Work Items

- Confirm target Supabase project and rollback plan before migrations.
- Seed or verify initial channels: `general`, `business`, `politique`, `divers`, `jobs`.
- Use idempotent `INSERT ... ON CONFLICT (slug) DO UPDATE` for channel seed data.
- Do not rename or migrate historical `recrutement` content into `jobs` without an explicit history decision.
- Replace permissive `channels`, `channel_members`, and `messages` policies instead of stacking contradictory policies.
- Enforce approved-user access to public channels.
- Enforce private-channel access through `channel_members` for legacy DMs.
- If legacy DMs remain, allow only tightly controlled private DM channel creation.
- Enforce Jobs posting as admin-only in DB and UI.
- Pass admin/channel state to every active message input surface, including full chat and floating chat panel if both still exist.
- Preserve `chat_mention` notification behavior if already present.
- Default recommendation for reactions: allow reactions when the user can read the message/channel, including Jobs, unless explicitly changed.

## Completion

- Approved members can read Jobs.
- Non-admin members cannot post in Jobs through UI or direct client calls.
- Admins can post in Jobs.
- Approved members can post in other public channels.
- Non-approved users cannot read or post chat content.
- Non-admins cannot create public channels.
- Private-channel reads/writes are membership-gated.
- Targeted negative checks cover pending read/post, non-admin Jobs post, non-admin public channel create, and non-member DM read/post.
- `db_flow.md` is updated if implemented policies differ from the reference.

## Dependencies

- `SESSION_01` complete.
- `SESSION_03` admission/admin primitives complete or coordinated.
