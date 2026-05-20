# Implementation Prep: User Presence and Last Activity

Status: prepared, not approved for runtime implementation

Source RFC: `plans/is-user-online.md`

## Decision Gate

Do not start runtime implementation until the product owner explicitly approves
this feature despite the MVP freeze. The RFC still states that it does not
validate implementation.

Before implementation, confirm these product decisions:

- Label: use `Actuellement en ligne` for live presence and `Derniere activite ...` for fallback.
- Multi-tab behavior: accept one heartbeat per visible tab, throttled to at least 60 seconds.
- Opt-out: exclude from V1.
- UI scope: drawer only; do not touch chat layout, member list, or hover card in V1.

## External Docs Checked

- Supabase Realtime Authorization docs: private channels require
  `config: { private: true }`, policies on `realtime.messages`, and disabling
  public channel access in Realtime settings.
- Supabase Presence docs: clients publish a presence payload and consume
  `sync`, `join`, and `leave`; the merged Presence state is best-effort and
  client-authored.

Relevant current docs:

- https://supabase.com/docs/guides/realtime/authorization/
- https://supabase.com/docs/guides/realtime/presence/

## Current Code Fit

Use these existing project boundaries:

- `src/app/(app)/layout.tsx` already renders `AppShell` only for authenticated,
  approved, onboarded profiles.
- `src/components/layout/app-shell.tsx` is the correct provider placement point.
  Add `PresenceProvider currentUserId={profile.id}` as the parent of
  `MemberProfileDrawerProvider`.
- `src/components/membres/member-profile-drawer.tsx` is the only V1 UI surface.
- `src/components/membres/member-profile-drawer-context.tsx` can remain a drawer
  open/close context; it should not become a presence store.
- `src/components/ui/avatar.tsx` currently uses `availability_status` dots. Do
  not overload that prop for online presence.
- `src/lib/types/database.ts` is the current app type file. Add a small
  `UserPresence` type there unless generated Supabase types replace it first.

Current drawer implementation note:

- The drawer has no request-id or cancellation guard. Adding the presence read
  must also protect the existing profile/categories/sponsor flow from stale
  responses when users open member A then member B quickly.

## Intended File Changes

Expected app files:

- Add `src/components/presence/presence-provider.tsx`.
- Add `src/components/presence/presence-indicator.tsx` or keep a local drawer
  subcomponent if it stays drawer-only.
- Add `src/lib/presence.ts` for heartbeat, read helpers, and label formatting.
- Update `src/components/layout/app-shell.tsx` to place the provider around
  `MemberProfileDrawerProvider`.
- Update `src/components/membres/member-profile-drawer.tsx` to read
  `user_presence.last_seen_at` on open and render the live/fallback status.
- Update `src/lib/types/database.ts` with `UserPresence`.
- Add focused tests under `src/__tests__`.

Expected Supabase file:

- Create a migration with `supabase migration new <descriptive_name>` at
  implementation time. Do not invent the timestamped filename manually.

Do not change in V1:

- `src/app/(app)/chat/layout.tsx`
- `src/components/chat/member-list.tsx`
- `src/components/chat/user-hover-card.tsx`
- `profiles`, `profiles_public`, or `profiles.updated_at`
- package files or dependencies

## Migration Draft

Use this as a starting point, then verify against the target database before
committing.

```sql
create table public.user_presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now()
);

alter table public.user_presence enable row level security;

create policy "Approved members and admins can read approved member presence"
on public.user_presence
for select
to authenticated
using (
  (
    exists (
      select 1
      from public.profiles viewer
      where viewer.id = (select auth.uid())
        and viewer.status = 'approved'
        and viewer.onboarding_completed = true
    )
    and exists (
      select 1
      from public.profiles subject
      where subject.id = user_presence.user_id
        and subject.status = 'approved'
    )
  )
  or (select public.is_admin())
);

create policy "Approved members can insert own presence"
on public.user_presence
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles viewer
    where viewer.id = (select auth.uid())
      and viewer.status = 'approved'
      and viewer.onboarding_completed = true
  )
);

create policy "Approved members can update own presence"
on public.user_presence
for update
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles viewer
    where viewer.id = (select auth.uid())
      and viewer.status = 'approved'
      and viewer.onboarding_completed = true
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles viewer
    where viewer.id = (select auth.uid())
      and viewer.status = 'approved'
      and viewer.onboarding_completed = true
  )
);
```

Realtime policy draft:

```sql
create policy "Approved members can listen to member presence"
on realtime.messages
for select
to authenticated
using (
  (select realtime.topic()) = 'presence:members'
  and realtime.messages.extension = 'presence'
  and exists (
    select 1
    from public.profiles viewer
    where viewer.id = (select auth.uid())
      and viewer.status = 'approved'
      and viewer.onboarding_completed = true
  )
);

create policy "Approved members can track member presence"
on realtime.messages
for insert
to authenticated
with check (
  (select realtime.topic()) = 'presence:members'
  and realtime.messages.extension = 'presence'
  and exists (
    select 1
    from public.profiles viewer
    where viewer.id = (select auth.uid())
      and viewer.status = 'approved'
      and viewer.onboarding_completed = true
  )
);
```

Implementation must also verify Supabase Realtime settings so public channel
access is not left open for this channel model.

## Provider Contract

`PresenceProvider` should:

- Be a client component.
- Accept `currentUserId: string`.
- Use `createClient()` from `src/lib/supabase/client.ts`.
- Join `presence:members` with private channel config.
- Track only `{ user_id, online_at }`.
- Derive a stable online lookup from Presence state.
- Expose a narrow hook such as `useIsMemberOnline(memberId: string | null)`.
- Avoid broad consumers so `AppShell` and chat do not rerender on every sync.
- Send a heartbeat at startup, then every 60 to 120 seconds.
- On `visibilitychange`, heartbeat immediately only if the document becomes
  visible and the last heartbeat is older than 60 seconds.
- Clean up interval, `visibilitychange` listener, `channel.untrack()`, and
  `supabase.removeChannel(channel)`.
- Degrade silently when Realtime or heartbeat writes fail.

## Drawer Contract

`MemberProfileDrawer` should:

- Fetch profile, categories, sponsor, and presence under one request id.
- Ignore every async result whose request id is no longer current.
- Read `user_presence.last_seen_at` only when the drawer opens or retries.
- Preserve cached profile/category behavior, but do not cache stale presence as
  an online signal.
- Render `Actuellement en ligne` when `useIsMemberOnline(profile.id)` is true.
- Render rounded `Derniere activite ...` only when offline and
  `last_seen_at` exists.
- Keep declared availability visually separate, ideally with the label
  `Disponibilite declaree`.
- Make the online dot decorative when adjacent text is visible.

Suggested fallback labels:

- `< 1h`: `Derniere activite recemment`
- Same local day: `Derniere activite aujourd'hui`
- `<= 7d`: `Derniere activite cette semaine`
- `> 7d`: `Derniere activite il y a plus d'une semaine`

## Test Plan

Database and Realtime:

- Approved onboarded user can read approved users' presence.
- Approved onboarded user cannot write another user's presence.
- Approved onboarded user can insert/update own presence.
- Pending, rejected, logged-out, no-profile, and approved-not-onboarded users
  cannot read or write `public.user_presence`.
- Approved/admin read behavior matches the final decision.
- Realtime Presence private channel allows approved onboarded users and rejects
  pending/rejected/anonymous users.

App tests:

- Presence label formatter covers the four rounded labels and null fallback.
- Drawer ignores stale profile/presence responses when `memberId` changes.
- Drawer keeps declared availability separate from online presence.
- Provider cleanup calls interval/listener/channel cleanup paths.

Manual QA:

- Two approved accounts in two browsers show online in the drawer.
- Closing one tab does not mark offline while another tab remains active.
- Reload and Realtime reconnect do not break the drawer.
- Offline/Realtime failure shows no online dot and falls back to last activity.

Known baseline guidance:

- `npm run lint` has existing baseline failures in this project.
- Full Vitest has historically had `profile-utils.test.ts` availability-label
  baseline failures. Re-run and classify instead of assuming a clean baseline.

## Recommended Implementation Order

1. Get product owner approval for the decision gate.
2. Verify Supabase Realtime docs and project Realtime settings again.
3. Create the migration with table RLS and `realtime.messages` policies.
4. Add app types and presence helper functions.
5. Add provider and wire it in `AppShell`.
6. Add drawer request-id protection and presence read.
7. Render drawer-only UI status, keeping availability separate.
8. Add focused unit/source tests.
9. Run targeted verification and record baseline failures separately.

