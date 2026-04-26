# TASK_00 - SESSION_02 - TODO

## Covers

`TASK_03` - Backup DB et bootstrap des 2 admins.

## Goal

Conserve the 2 existing profiles and promote them to approved onboarded admins without recreating `auth.users`.

## Work Items

- Confirm Supabase project/environment before any DB operation.
- Confirm backup or dump outside the repo.
- Run preflight SQL to verify exactly 2 profiles.
- Create the migration through the Supabase CLI, not by inventing a filename manually.
- Migration must fail if `public.profiles` does not contain exactly 2 rows.
- Set the 2 profiles to `is_admin = true`, `status = 'approved'`, and `onboarding_completed = true`.
- Validate both profiles after migration.

## Completion

- Backup confirmed before migration.
- Preflight confirms exactly 2 profiles.
- Migration is defensive and targeted to this bootstrap scenario.
- No dump containing personal data is committed.
- Both accounts can reach `/admin` after application.

## Do Not Do

- Do not seed or recreate `auth.users`.
- Do not apply to an unconfirmed Supabase project.
- Do not commit database dumps.
- Do not touch `sponsor_approved`.

## Suggested Prompt

Prepare and execute `APP_REFINEMENT/TASK_03.TODO.md` only after project and backup confirmation. Create the defensive migration via Supabase CLI. Do not touch `auth.users`.
