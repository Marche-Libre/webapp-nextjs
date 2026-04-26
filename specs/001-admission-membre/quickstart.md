# Quickstart: Admission Membre MVP Replan

Use this guide before implementing `001-admission-membre`.

## 1. Read Required Context

1. Read `specs/001-admission-membre/spec.md`.
2. Read `specs/001-admission-membre/plan.md`.
3. Read `specs/001-admission-membre/research.md`.
4. Read `specs/001-admission-membre/data-model.md`.
5. Read `specs/001-admission-membre/contracts/admission-flow.md`.
6. For any runtime route, middleware, Server Action, or route-handler change,
   read the relevant installed Next.js docs under `node_modules/next/dist/docs/`.

## 2. Confirm Current App Evidence

Check these files before editing:

- `src/app/page.tsx`
- `src/app/rejoindre/page.tsx`
- `src/app/(auth)/connexion/page.tsx`
- `src/app/(auth)/inscription/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/(auth)/en-attente/page.tsx`
- `src/components/sponsorship/sponsor-request-form.tsx`
- `src/components/sponsorship/invitation-card.tsx`
- `src/app/onboarding/page.tsx`
- `src/components/onboarding/onboarding-wizard.tsx`
- `src/lib/supabase/middleware.ts`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/admin/page.tsx`
- `src/app/(app)/admin/utilisateurs/page.tsx`
- `src/app/(app)/admin/actions.ts`

## 3. Confirm Database Evidence

Review admission-related schema and RLS:

- `supabase/migrations/00001_initial_schema.sql`
- `supabase/migrations/00003_sponsorship_system.sql`
- `supabase/migrations/00004_invitations_chat_forum.sql`
- `supabase/migrations/00011_sponsorship_requests.sql`
- `supabase/migrations/00014_onboarding.sql`
- `supabase/migrations/00020_profiles_schema_alignment.sql`
- `supabase/migrations/20260426192341_admission_profile_status_rls.sql`
- `src/lib/types/database.ts`

## 4. Reproduce Before Fixing

Reproduce or disprove the reported blocker in both places:

1. Candidate signs in with X, reaches `/en-attente`, submits sponsor handle,
   and remains in a stable pending state.
2. Approved not-onboarded user reaches `/onboarding`, completes finalization,
   and reaches the expected app entry without a 500 or redirect loop.

Also test the routing matrix:

- anonymous protected route
- pending profile
- rejected profile
- approved profile with `onboarding_completed = false`
- approved profile with `onboarding_completed = true`

## 5. Implementation Order

1. Resolve owner decisions for refused UX, status transition reversibility, and
   whether `/onboarding` remains post-approval profile completion.
2. Fix only reproduced admission blockers.
3. Harden admin review actions and evidence display.
4. Verify RLS/server-side authorization for non-admin mutation attempts with
   DB-free static tests in the repo and staged/manual checks after applying the
   migration.
5. Add focused mocked tests or static migration checks; do not call Supabase or
   Postgres from repo tests.
6. Record GitHub issue closure/rescope recommendations.

## 6. Verification Commands

Run, or record why a command could not be run:

```bash
bun run build
bun run lint
bunx vitest run
```

If baseline failures exist, document the exact failure and why the admission
change did not worsen it.

Admission-specific DB-free checks:

```bash
bunx vitest run src/__tests__/admin-admission-actions.test.ts src/__tests__/sponsor-request-form.test.tsx src/__tests__/admission-rls-migration.test.ts
bunx eslint src/app/auth/callback/route.ts src/components/sponsorship/sponsor-request-form.tsx src/components/sponsorship/parrainages-tabs.tsx src/__tests__/admin-admission-actions.test.ts src/__tests__/sponsor-request-form.test.tsx src/__tests__/admission-rls-migration.test.ts
```
