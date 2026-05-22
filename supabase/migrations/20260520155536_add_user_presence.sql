create table if not exists public.user_presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now()
);

alter table public.user_presence enable row level security;

create policy "Approved members can read approved member presence"
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
        where subject.id = public.user_presence.user_id
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
