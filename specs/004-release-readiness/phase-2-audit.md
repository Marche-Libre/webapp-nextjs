# Phase 2 Re-audit: Current State

**Date**: 2026-04-26  
**Scope**: Documentation-only re-audit for `specs/004-release-readiness/tasks.md` Phase 2. No runtime routes, Supabase files, dependencies, tests, generated types, or behavior were changed.

## T006 Route / Current-State Review

The current route inventory in `app_flow.md` still matches the app surface observed under `src/app`:

- Public/auth routes: `/`, `/rejoindre`, `/connexion`, `/inscription`, `/auth/callback`, `/en-attente`, `/onboarding`, `/cgu`, `/mentions-legales`, `/confidentialite`, `/api/geo/cities`.
- App routes: `/forum`, `/forum/[categorySlug]`, `/forum/posts/nouveau`, `/forum/posts/[postId]`, `/chat`, `/chat/[slug]`, `/profil`, `/parametres`, `/notifications`, `/parrainages`, `/membres`, `/membres/[id]`, `/admin`, `/admin/utilisateurs`, `/tableau-de-bord`.
- Forum remains the dominant legacy redirect/link target in middleware, auth callback, onboarding, wait-status polling, admin fallback, settings close behavior, sidebar/logo navigation, notification/forum embeds, and member recent activity.
- Chat route-shape drift remains: header and notification paths can still use `/chat?channel=<id>` while canonical chat pages are `/chat` and `/chat/[slug]`.
- Legal pages exist but `app_flow.md` still flags that middleware publicity must be explicitly decided.

## T007 Schema / RLS Review

The current `db_flow.md` schema and RLS risk inventory remains consistent with migrations and app references:

- High-risk write surfaces remain documented for `profiles`, `sponsorship_requests`, `channel_members`, `messages`, and related chat/admission policies.
- `profiles_public` is referenced by `/membres` and `/membres/[id]`, but no `CREATE VIEW profiles_public` migration was found.
- Notification type drift remains documented: app onboarding writes `welcome`, while migrations only added `sponsor_request` to the original notification type set.
- No schema changes were applied as part of this re-audit.

## T008 Quality Command Status

Commands run on the current branch:

| Command | Status | Notes |
| --- | --- | --- |
| `npm run build` | PASS | Next.js build completed successfully. Warning: Next inferred `/Users/maxi/bun.lock` as workspace root and detected `/Users/maxi/www/marchelibre/package-lock.json` as an additional lockfile. |
| `npm run lint` | FAIL | ESLint reported 117 problems: 63 errors and 54 warnings. Main categories include React Compiler/react-hooks rules, `no-explicit-any`, unused variables, and `no-img-element` warnings. |
| `npx vitest run` | FAIL | 2 test files ran; 1 failed. 21/24 tests passed. The 3 failures are label expectation mismatches in `src/__tests__/profile-utils.test.ts` for `getAvailabilityOption`. |

## T009 Reproducibility Status For Known Objects

| Object | Status | Evidence / next action |
| --- | --- | --- |
| `profiles_public` | Needs migration/bootstrap work | Referenced in app code, not found in migrations. Add a versioned view or remove runtime dependency. |
| `countries` | Reproducible | `supabase/migrations/00017_countries_and_cities.sql` creates and seeds countries. |
| `cities` | Reproducible | `00017_countries_and_cities.sql` creates `cities`; `00018_french_cities_bulk_insert.sql` seeds French city data. |
| `specialty_category_ids` | Reproducible | `supabase/migrations/00020_profiles_schema_alignment.sql` adds and backfills the column. |
| `specialty_categories.sector` | Needs migration/bootstrap work | App/types/tests read `sector`, but `supabase/migrations/00008_specialty_categories.sql` creates only `id`, `name`, and `sort_order`. |
| `chat_muted_until` | Reproducible | `00020_profiles_schema_alignment.sql` adds the column. |
| `chat_banned` | Reproducible | `00020_profiles_schema_alignment.sql` adds and backfills the column. |

## T010 Migration Prefixes And Channel Proposal Trigger Assumption

- Duplicate migration prefixes: not currently observed. The migration set runs from `00001` through `00020` without duplicate numeric prefixes.
- Channel-proposal trigger assumption: still exists in code. `src/components/chat/channel-list.tsx` states that channel creation is handled server-side via a DB trigger when the vote threshold is reached, but `supabase/migrations/00009_channel_proposals.sql` creates `channel_proposals` and `channel_votes` without any trigger/function for threshold-based channel creation.

## Phase 2 Result

Phase 2 confirms the previous release-readiness risks are still current: build passes, lint/tests are not green, route defaults are still forum-centric, and schema reproducibility still needs remediation for `profiles_public`, `specialty_categories.sector`, and channel-proposal trigger behavior.
