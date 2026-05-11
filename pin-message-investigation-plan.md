# Pin Message Investigation Plan

Date: 2026-05-11

## Context

The reported issue is that pinning a message to a chat channel does not appear to work.

Current dirty files at the latest investigation pass:

- `src/components/chat/message-bubble.tsx`
- `src/components/chat/member-list.tsx`
- `src/components/chat/user-hover-card.tsx`

`src/components/chat/message-area.tsx` was previously dirty, but it is no longer dirty.

## Current Finding

`message-bubble.tsx` has been refactored, but the pin persistence path still calls:

```ts
await supabase
  .from("messages")
  .update({ is_pinned: !message.is_pinned })
  .eq("id", message.id);
onMessageUpdated?.();
```

The UI reads and writes `message.is_pinned`, and `src/lib/types/database.ts` declares `Message.is_pinned`.

Local migrations still do not create `public.messages.is_pinned`. The only `is_pinned BOOLEAN` found locally is on `public.forum_posts` in `supabase/migrations/00004_invitations_chat_forum.sql`.

## Likely Root Cause

P1: Schema mismatch. The chat pin UI depends on `messages.is_pinned`, but the local schema history does not define that column for `public.messages`.

Because the Supabase update error is ignored, the action can fail silently.

## Secondary Risk

If `messages.is_pinned` is added, the authorization boundary must explicitly prevent non-admin authors from mutating it through direct Supabase client calls.

The current hardening trigger blocks non-admin changes to `channel_id`, `author_id`, and `image_url`, but not `is_pinned`.

## Execution Plan

1. Confirm production schema read-only: check whether `public.messages.is_pinned` exists in the connected Supabase database.
2. If absent, add a migration for `public.messages.is_pinned boolean not null default false`.
3. Update message update guard/RLS so non-admin authors cannot mutate `is_pinned`.
4. Update `handleTogglePin` to capture `{ error }` and avoid calling `onMessageUpdated` on failure.
5. Add a small regression test around the migration/guard text, matching the current `authorization-hardening.test.ts` style.
6. Run `npm run lint` and the relevant Vitest file.

## Non-Goals

- Do not redesign chat.
- Do not remove existing dirty user changes.
- Do not broaden pin behavior into a new banner unless explicitly requested.
- Do not write production Supabase changes without explicit approval and read-only verification first.
