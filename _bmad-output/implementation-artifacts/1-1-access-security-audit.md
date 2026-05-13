# Story 1.1 Access and Security Audit

Date: 2026-05-01
Story: `1-1-audit-route-data-admin-api-and-realtime-authorization-boundaries`
Status: completed for review

## Executive Summary

The local brownfield codebase has layered app-code boundaries for the main MVP states: middleware and protected layouts route logged-out users to `/connexion`, pending/refused users to `/en-attente`, approved-not-onboarded users to `/onboarding`, approved-onboarded users to `/chat`, and non-admin users away from `/admin` to `/chat`.

The local Supabase migrations reveal several security-relevant bypass candidates that should block beta launch unless they are disproven in the real production schema or fixed in Story 1.3. The highest-risk findings are confirmed in local migrations, while production confirmation is blocked until the correct Supabase target is verified. Those local findings include broad `profiles` self-update RLS, private-channel write/member-management gaps, non-admin private-channel creation, sponsor-driven profile update breadth, missing local storage policy coverage for `chat-images`, and schema/type uncertainty with drift candidates.

Read-only production inspection through the configured Supabase connection did not match the local app schema. The connected project exposes only `public.francophone_pack_members` and migration `001 francophone_pack_members`; the app expects `profiles`, `channels`, `messages`, `notifications`, sponsorship, forum, report/block, country/city, and chat storage objects. This is a launch blocker for production confidence unless the MCP connection is intentionally not the app production project.

No destructive Supabase writes, schema changes, storage uploads, auth-flow simulations, migrations, dependency changes, route/UI changes, generated type changes, or runtime code changes were performed.

## Scope and Non-Goals

In scope:

| Area | Included surfaces |
| --- | --- |
| Route/layout boundaries | Middleware, auth/status routes, `(app)` layout, onboarding, `/chat`, admin, member/legacy routes |
| App data access | Chat, profiles, notifications, sponsorship, forum, reports/blocks, city API |
| Sensitive mutations | Admin Server Actions, profile updates, onboarding completion, DM/channel creation, sponsorship approval, chat moderation |
| Realtime/storage | Chat messages, message reactions, notifications, `chat-images` usage |
| Supabase security assumptions | Local migrations, RLS policies, functions, triggers, realtime publication, generated/app types, read-only production metadata |

Out of scope:

| Area | Reason |
| --- | --- |
| Runtime hardening | Story 1.1 is audit-only; fixes belong in Story 1.3 unless explicitly re-scoped |
| Defining final expected matrix | Story 1.2 owns canonical expected behavior refinement |
| Destructive or write-based production probes | Forbidden by story and project guardrails |
| Generated type refresh | Forbidden for this documentation story |
| UI redesign or route cleanup | Not part of this story |

## User, Admission, and Role States

| State | Definition used for audit | Expected MVP boundary |
| --- | --- | --- |
| Logged-out | No Supabase user session | Public/auth/legal only; protected routes redirect to `/connexion` |
| Authenticated with no/incomplete profile | User exists but no usable `profiles` row or incomplete request | Fail closed to auth/status boundary; no member data |
| Pending | `profiles.status` is `pending` or non-approved/non-rejected in middleware | `/en-attente`; no member-only routes/data/realtime |
| Refused/rejected | `profiles.status = 'rejected'` | Explicit refused state at `/en-attente`; no login loop; no member-only routes/data/realtime |
| Approved-not-onboarded | `profiles.status = 'approved'` and `onboarding_completed !== true` | `/onboarding`; no normal app entry except onboarding needs |
| Approved-onboarded | `profiles.status = 'approved'` and `onboarding_completed === true` | `/chat` as app center; member data as allowed |
| Suspended/removed | `chat_banned`, `chat_muted_until`, or future access fields if supported | Access removal/suspension should prevent future access where supported |
| Admin | Approved/onboarded user with `profiles.is_admin = true` | Admin routes/actions allowed through server/database checks |
| Non-admin attempting admin access | Authenticated member without `is_admin` | `/admin` redirects safely to `/chat`; admin mutations blocked beyond UI |

## Route and Layout Access Matrix

| Surface | User state / actor | Expected behavior | Observed behavior | Evidence source | Status | Finding category | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `middleware.ts` matcher | All HTTP requests except static/image/favicon/common image assets | Session refresh route gate applies broadly | Delegates to `updateSession`; matcher excludes static assets only | `middleware.ts:1-12` | verified | follow-up story input | Story 1.2 should decide whether any API/static exceptions need explicit matrix entries |
| `src/lib/supabase/middleware.ts` public allowlist | Logged-out | Public/auth/status/referral routes allowed; protected routes redirect to `/connexion` | Public routes are `/`, `/connexion`, `/inscription`, `/en-attente`, `/rejoindre`, and `/auth/*`; unauthenticated protected access redirects to `/connexion` | `src/lib/supabase/middleware.ts:38-54` | verified | follow-up story input | Story 1.2 should confirm legal pages and `/api/geo/cities` public/private expectations |
| Middleware status routing | Pending | Redirect to `/en-attente` | Non-approved/non-rejected profiles are treated as pending and redirected to `/en-attente` | `src/lib/supabase/middleware.ts:64-81` | verified | follow-up story input | Story 1.2 should define no-profile and unexpected-status behavior explicitly |
| Middleware status routing | Refused/rejected | Redirect to explicit refused boundary, not login loop | Rejected users redirect to `/en-attente`, except `/en-attente` and `/connexion` | `src/lib/supabase/middleware.ts:65-74` | verified | follow-up story input | Preserve in hardening stories |
| Middleware onboarding routing | Approved-not-onboarded | Redirect to `/onboarding` | Approved users without onboarding completion redirect to `/onboarding` | `src/lib/supabase/middleware.ts:83-88` | verified | follow-up story input | Story 1.2 should define allowed onboarding support API/data |
| Middleware app-home routing | Approved-onboarded | Auth/public/status returns to `/chat` | Approved/onboarded users on `/`, `/connexion`, `/inscription`, `/en-attente` redirect to `/chat` | `src/lib/supabase/middleware.ts:90-102` | verified | follow-up story input | None |
| `(app)` layout | Logged-out/no profile | Redirect to `/connexion` | Uses `auth.getUser`; redirects missing user/profile to `/connexion` | `src/app/(app)/layout.tsx:11-28` | verified | follow-up story input | Story 1.2 should define no-profile handling if authenticated user lacks profile |
| `(app)` layout | Pending/refused | Redirect to `/en-attente` | Explicit checks for `pending` and `rejected` route to `/en-attente` | `src/app/(app)/layout.tsx:30-36` | verified | follow-up story input | Preserve refused copy behavior |
| `(app)` layout | Approved-not-onboarded | Redirect to `/onboarding` | Approved users with incomplete onboarding redirect to `/onboarding` | `src/app/(app)/layout.tsx:38-40` | verified | follow-up story input | None |
| `(app)` member routes | Logged-out/pending/refused/not-onboarded | Protected by parent layout | Routes under `(app)` inherit `(app)` layout gate | `src/app/(app)/layout.tsx`; route glob inspection | verified | follow-up story input | Story 1.2 should define direct legacy route expectations |
| `/onboarding` | Logged-out | Redirect to `/connexion` | Server page redirects when no user | `src/app/onboarding/page.tsx:7-21` | verified | follow-up story input | None |
| `/onboarding` | Pending/refused | Redirect to `/en-attente` | Server page redirects if status is not approved | `src/app/onboarding/page.tsx:13-21` | verified | follow-up story input | None |
| `/onboarding` | Approved-onboarded | Redirect to `/chat` | Server page redirects completed profiles to `/chat` | `src/app/onboarding/page.tsx:20-21` | verified | follow-up story input | None |
| `/en-attente` | Logged-out | Redirect to `/connexion` | Server page redirects when no user | `src/app/(auth)/en-attente/page.tsx:13-17` | verified | follow-up story input | None |
| `/en-attente` | Refused/rejected | Show explicit refused state | Returns refused page with product copy and no member data | `src/app/(auth)/en-attente/page.tsx:37-67` | verified | follow-up story input | UX copy is ASCII in source but French-first; not a security issue |
| `/en-attente` | Approved | Redirect to `/chat` or `/onboarding` | Approved users are redirected based on onboarding completion | `src/app/(auth)/en-attente/page.tsx:69-71` | verified | follow-up story input | None |
| `/auth/callback` | OAuth return | Exchange code, set cookies, route by profile status | Callback routes approved to `/chat` or `/onboarding`; non-approved to `/en-attente`; performs referral writes for pending/new users | `src/app/auth/callback/route.ts:8-136` | verified | follow-up story input | Referral writes depend on RLS; verify in Story 1.2/1.3 if production schema matches |
| `/admin` layout | Logged-out | Redirect to `/connexion` | Checks `auth.getUser` and redirects missing user | `src/app/(app)/admin/layout.tsx:9-15` | verified | follow-up story input | None |
| `/admin` layout | Non-admin member | Redirect to `/chat` | Selects `is_admin`; non-admin redirects to `/chat` | `src/app/(app)/admin/layout.tsx:16-24` | verified | follow-up story input | Must still rely on RLS/Server Actions for direct mutations |
| Legal routes | Logged-out | Public | Middleware public allowlist does not include `/mentions-legales`, `/confidentialite`, `/cgu`, so logged-out access would redirect to `/connexion` | `src/lib/supabase/middleware.ts:38-47`; route glob inspection | uncertain | follow-up story input | Story 1.2 or Epic 2 should decide whether legal pages must be public in middleware |
| `/api/geo/cities` | Logged-out/onboarding candidate | Expected unknown; likely needed during onboarding | Route handler uses server Supabase client, but middleware does not list `/api/*` public; logged-out requests redirect to `/connexion` | `src/app/api/geo/cities/route.ts`; `src/lib/supabase/middleware.ts:38-54` | uncertain | follow-up story input | Story 1.2 should define API public/private expectation |

## Data Access and RLS Matrix

| Surface | User state / actor | Expected behavior | Observed behavior | Evidence source | Status | Finding category | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `profiles` SELECT local RLS | Pending/refused/logged-out/non-member | Private profile data should not leak; user can read own status | Local policy allows approved profiles, own profile, or admin | `supabase/migrations/00001_initial_schema.sql:104-107` | uncertain | follow-up story input | Story 1.2 must define approved member directory visibility and profile privacy |
| `profiles` UPDATE local RLS | Any authenticated user | Users must not self-escalate admission/admin/access fields | Local own-profile update policy only checks `id = auth.uid()` in `USING` and `WITH CHECK`, without column scoping for sensitive fields | `supabase/migrations/00001_initial_schema.sql:109-112` | confirmed bypass | launch blocker | Direct client profile write surfaces are tracked separately in the admin/mutation matrix |
| Sponsor profile UPDATE local RLS | Sponsor | Sponsor should only approve sponsorship state, not arbitrary profile fields | Local sponsor policy allows UPDATE on sponsored profiles with only `sponsored_by = auth.uid()`, without column scoping for profile fields | `supabase/migrations/00003_sponsorship_system.sql:80-84` | confirmed bypass | launch blocker | The client sponsorship approval path is tracked separately in the admin/mutation matrix |
| `channels` SELECT local RLS | Approved users | Public channels visible to approved; private channels visible to members only | Migration `00012` refines private channel visibility to channel membership | `supabase/migrations/00012_dm_system.sql:43-58` | verified | follow-up story input | Production mismatch prevents runtime confidence |
| `channels` INSERT local RLS | Non-admin approved users | Non-admin users should not create private channels because private DMs are out of MVP scope | Local policy allows approved users to create private channels | `supabase/migrations/00012_dm_system.sql:60-68`; PRD FR34 | confirmed bypass | launch blocker | Story 1.3 should remove or constrain non-admin channel creation because private DMs are out of MVP scope |
| `channel_members` INSERT local RLS | Approved users | Users should not add arbitrary memberships or expose private channels | Local policy checks only approved status, not self-membership, creator authority, or recipient consent | `supabase/migrations/00012_dm_system.sql:31-39` | confirmed bypass | launch blocker | Direct private-channel creation surfaces are tracked separately in the API/Server Action matrix |
| `messages` SELECT local RLS | Pending/refused/logged-out | No message access | Local policy requires approved status and public channel or private membership after `00012` | `supabase/migrations/00012_dm_system.sql:70-93` | verified | follow-up story input | Production mismatch prevents runtime confidence |
| `messages` INSERT local RLS | Approved user outside private channel | Cannot write into channels where not allowed | Local insert policy from `00004` checks only `author_id = auth.uid()` and approved status; `00012` does not replace INSERT policy | `supabase/migrations/00004_invitations_chat_forum.sql:125-133`; `supabase/migrations/00012_dm_system.sql:70-93` | confirmed bypass | launch blocker | Story 1.3 should add channel membership/public-channel checks to message INSERT |
| `messages` UPDATE/DELETE local RLS | Message author/admin | Own edits/deletes allowed; admin moderation allowed | Local policies allow author or admin update/delete | `supabase/migrations/00004_invitations_chat_forum.sql:135-141` | verified | follow-up story input | If pinning must be admin-only, Story 1.2/1.3 should split that behavior from general message edits |
| `message_reactions` local RLS | Pending/refused/logged-out | No reaction read/write | Local policies require approved status and own user id for insert/delete | `supabase/migrations/00004_invitations_chat_forum.sql:154-177` | uncertain | follow-up story input | No realtime publication found for `message_reactions`; private channel membership not checked directly |
| `notifications` local RLS | Notification recipient | Recipient reads/updates own notifications; actor inserts notifications | Local insert policy fixed to `actor_id = auth.uid()`; read/update own only | `supabase/migrations/00005_notifications.sql:16-28`; `supabase/migrations/00019_fix_notifications_insert_rls.sql:1-10` | verified | follow-up story input | App onboarding welcome insert omits `actor_id`, likely fails under current RLS |
| `sponsorship_requests` local RLS | Requester/sponsor/admin | Requester sees own; sponsor sees addressed; admin sees all | Local policies match requester/sponsor/admin pattern | `supabase/migrations/00011_sponsorship_requests.sql:20-61` | verified | follow-up story input | Sponsor update side effects to `profiles` remain separate blocker |
| `invitations` local RLS | Approved users/invitees/admin | Invitations scoped to inviter, invitee handle, or admin | Local policies allow invite creation by approved users and update by invited handle/admin | `supabase/migrations/00004_invitations_chat_forum.sql:28-59` | uncertain | follow-up story input | Handle-based authorization should be reviewed for collision/change risk |
| Forum tables local RLS | Approved members | Legacy forum data should be member-only if routes remain accessible | Local forum category/tag/post/reply policies generally require approved status for read/write, admin for category/tag management | `supabase/migrations/00004_invitations_chat_forum.sql:194-376` | verified | follow-up story input | Parked feature still directly reachable under `(app)` layout |
| `channel_proposals` local RLS | Approved users | MVP excludes proposal UI; direct access should not reintroduce current-scope feature | Local RLS still allows approved users to view/create proposals | `supabase/migrations/00009_channel_proposals.sql:16-39` | uncertain | accepted beta risk candidate | If hidden from UI, direct table access may be acceptable beta risk or follow-up containment |
| `user_reports` and `user_blocks` local RLS | Approved members/admin | Report/block scoped to current user; admin can review reports | Local RLS allows own report creation, own report viewing/admin viewing, own block management | `supabase/migrations/00007_user_reports_and_blocks.sql:12-43` | verified | follow-up story input | Report insert includes `message_id` in app but migration excerpt lacks that column; schema drift check needed |
| Production schema via MCP | All app states | Production should contain app tables/policies or correct target project | Read-only list shows only `public.francophone_pack_members` and no app MVP tables | Supabase MCP `list_tables`, `list_migrations` on 2026-05-01 | unsupported by schema | launch blocker | Confirm MCP target project or reconcile migrations before beta launch |

## Admin Action and Sensitive Mutation Matrix

| Surface | User state / actor | Expected behavior | Observed behavior | Evidence source | Status | Finding category | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `approveUser` Server Action | Admin | Approve candidate only after authenticated admin check | Calls `auth.getUser`, selects caller `is_admin`, returns access denied if false, updates `profiles.status = 'approved'` | `src/app/(app)/admin/actions.ts:5-38` | verified | follow-up story input | DB RLS must still prevent direct non-admin equivalent |
| `rejectUser` Server Action | Admin | Refuse candidate only after authenticated admin check | Same admin check, updates `profiles.status = 'rejected'` | `src/app/(app)/admin/actions.ts:40-73` | verified | follow-up story input | Missing admin actor/timestamp audit fields |
| Chat mute/unmute/ban/unban Server Actions | Admin | Only admin can mutate access/moderation state | Shared `verifyAdmin` checks `profiles.is_admin`; updates `chat_muted_until` or `chat_banned` | `src/app/(app)/admin/actions.ts:75-113` | verified | follow-up story input | Chat send/read path does not appear to enforce these fields |
| Admin dashboard/profile listing | Admin | Admin can view candidate/member status | Admin layout gates route; pages query broad profile rows | `src/app/(app)/admin/layout.tsx`; `src/app/(app)/admin/page.tsx`; `src/app/(app)/admin/users/page.tsx` | verified | follow-up story input | Production RLS must support admin reads |
| Admin mutation auditability | Admin | Admin decisions should be actor/timestamped where supported | Actions update status/access fields without admin actor/timestamp fields | `src/app/(app)/admin/actions.ts`; PRD FR31 | unsupported by schema | accepted beta risk candidate | Story 1.4 or Epic 4 should decide if auditability blocks beta |
| Direct profile update through Supabase client | Non-admin authenticated user | Self-service profile flows should only expose safe profile fields or rely on trusted server/database controls for sensitive fields | Profile edit and onboarding components write directly to `profiles` from the browser rather than through a server-only mutation path | `src/components/onboarding/onboarding-wizard.tsx`; `src/components/profile/profile-edit-all.tsx`; `src/components/profile/profile-edit-form.tsx` | verified | follow-up story input | The paired local RLS blocker is tracked separately in the data/RLS matrix as F-02 |
| Sponsorship approval client path | Sponsor | Sponsor UI should not directly drive admission-state changes unless intentionally authorized by product and trusted enforcement paths | Client updates `sponsorship_requests.status` and then attempts to update the requester's `profiles.status = 'approved'` from the browser | `src/components/sponsorship/parrainages-tabs.tsx:47-69` | verified | follow-up story input | The paired local sponsor-profile RLS blocker is tracked separately in the data/RLS matrix as F-03 |

## API, Server Action, Storage, and Realtime Matrix

| Surface | User state / actor | Expected behavior | Observed behavior | Evidence source | Status | Finding category | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/app/api/geo/cities/route.ts` | Candidate/onboarding user | City suggestions should work where onboarding needs them without leaking private data | Route reads GeoNames or fallback `countries`/`cities`; middleware likely protects it unless public path exception exists | `src/app/api/geo/cities/route.ts`; `src/lib/supabase/middleware.ts` | uncertain | follow-up story input | Story 1.2 should decide public vs authenticated API access |
| Direct private-channel creation client path | Approved member | Browser flows should not create private channels or memberships outside approved MVP/server-controlled paths | `member-profile` writes to `channels` and `channel_members` from the browser, so authorization depends on database-side controls | `src/components/membres/member-profile.tsx` | verified | follow-up story input | The paired local RLS blockers are tracked separately in the data/RLS matrix as F-05 and F-06 |
| Admin Server Actions | Non-admin | Non-admin cannot execute admin mutations through the documented server action entry points | `auth.getUser` and `verifyAdmin` checks reject non-admin callers before the server actions perform updates | `src/app/(app)/admin/actions.ts` | verified | follow-up story input | Direct non-server mutation risk is a separate schema/RLS issue tracked in the data/RLS matrix |
| Chat realtime `messages` | Pending/refused/non-member | No private realtime data | App subscribes to `messages` INSERT/UPDATE; local migration adds `messages` to realtime publication and RLS should apply to reads | `src/components/chat/chat-store.tsx:102-161`; `supabase/migrations/00004_invitations_chat_forum.sql:143-144` | uncertain | follow-up story input | Verify realtime/RLS behavior against correct production project |
| Chat realtime `message_reactions` | Pending/refused/non-member | No private reaction data | App subscribes to `message_reactions`, but no local `ALTER PUBLICATION` found for `message_reactions` | `src/components/chat/chat-store.tsx:152-158`; migration grep | unsupported by schema | accepted beta risk candidate | Add publication or remove subscription expectation if reactions realtime is non-blocking |
| Notifications realtime | Recipient | Recipient receives own notifications only | App filters by `user_id`; local migration adds `notifications` to realtime publication; RLS read/update own | `src/components/layout/sidebar.tsx:88-110`; `src/components/notifications/notification-provider.tsx:101-163`; `supabase/migrations/00010_notification_sponsor_type.sql:6-7` | verified | follow-up story input | Verify against correct production project |
| `chat-images` upload client path | Approved member | Browser media upload should only rely on explicitly defined storage access rules | The app uploads directly to `chat-images` and uses public URLs from the browser | `src/components/chat/message-input.tsx:182-207` | verified | follow-up story input | Storage-policy coverage remains a separate schema/configuration issue tracked in F-07 |
| Supabase docs/reference check | Developer | Current Supabase guidance can inform audit methodology for RLS/storage/realtime review | Supabase docs search was used as methodology support during the audit, not as direct evidence for repo or production findings | Supabase docs search on 2026-05-01; Supabase skill security checklist | verified | follow-up story input | Use current docs again before Story 1.3 database hardening |

## Functions, Views, and Triggers Coverage

| Surface | User state / actor | Expected behavior | Observed behavior | Evidence source | Status | Finding category | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Local SQL functions in migrations | N/A | Audit should inventory function-based auth and side-effect surfaces that can affect access or data integrity | Local migrations define `public.handle_updated_at()`, multiple `public.handle_new_user()` variants, `public.is_admin()`, `public.handle_new_forum_reply()`, and `public.update_sponsorship_requests_updated_at()`; several are `SECURITY DEFINER` in `public` | migration grep for `CREATE FUNCTION` and `SECURITY DEFINER` across `00001`-`00020` | verified | follow-up story input | F-14 covers the security review concern; production parity remains blocked by F-01 |
| Local SQL views in migrations | N/A | Audit should identify any view-based access surfaces if they exist | No local `CREATE VIEW` or `CREATE OR REPLACE VIEW` definitions were found in migrations `00001` through `00020` | migration grep for `CREATE VIEW` across `00001`-`00020` | verified | follow-up story input | If the correct Supabase target is confirmed later, production catalogs should still be checked for manually created views |
| Local SQL triggers in migrations | N/A | Audit should identify trigger-driven side effects that can influence writes, timestamps, or automatic row creation | Local triggers found for `updated_at` maintenance on `profiles`, `annonces`, `offres_emploi`, `invitations`, `messages`, `forum_posts`, `forum_replies`, and `sponsorship_requests`, plus `on_auth_user_created` and `on_forum_reply_created` side-effect triggers | migration grep for `CREATE TRIGGER` and `updated_at` across `00001`, `00004`, and `00011` | verified | follow-up story input | Production trigger parity is still unverified until F-01 is resolved |

## Supabase Schema, RLS, Migration, and Type Assumptions

| Surface | User state / actor | Expected behavior | Observed behavior | Evidence source | Status | Finding category | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Local migrations as intended app schema source | N/A | The active Supabase target should reflect the intended app schema before launch decisions rely on it | App code references local migration objects, but the connected Supabase MCP target does not match the local schema | App code inspection; Supabase MCP `list_tables`, `list_migrations` | uncertain | launch blocker | Confirm Supabase project connection and migration target before hardening |
| `profiles.status` as admission source of truth | N/A | Admission routing and access checks should read one canonical status field consistently | Middleware, layouts, callback, admin actions, onboarding, and tests all use `profiles.status` | Route/layout/action/test inspection | verified | follow-up story input | Story 1.2 should make canonical |
| `profiles.is_admin` as admin source of truth | N/A | Admin access checks should use a single protected admin flag | Admin layout, admin actions, and `public.is_admin()` all use `profiles.is_admin` | Admin route/action inspection; local function inspection | verified | follow-up story input | Must be protected from self-update bypass |
| `onboarding_completed` as approved-member entry gate | N/A | Approved-member entry should consistently depend on the onboarding completion flag | Middleware, `(app)` layout, onboarding page, callback, and tests all use `onboarding_completed` | Route/layout/callback/test inspection | verified | follow-up story input | Must be protected enough to prevent unsafe app entry |
| `chat_banned` and `chat_muted_until` as suspension fields | N/A | Suspension/access-removal fields should be enforced anywhere chat access or chat sending is controlled | Migration `00020` adds the fields and admin actions write them, but no chat send/read enforcement was found in audited sources | `00020_profiles_schema_alignment.sql`; `src/app/(app)/admin/actions.ts`; chat source inspection | unsupported by schema | accepted beta risk candidate | Epic 4/Story 1.3 should define enforcement |
| `src/lib/types/database.ts` as schema authority | N/A | App schema types should accurately represent the database contract if used as authority | `src/lib/types/database.ts` is a hand-maintained type collection, not a full generated Supabase `Database` type | `src/lib/types/database.ts` inspection | unsupported by schema | follow-up story input | Do not rely on it for RLS/table completeness; regenerate only in scoped story |
| Local functions in exposed schema | N/A | Exposed-schema functions should be reviewed for security posture, especially `SECURITY DEFINER` usage | Multiple local functions exist in `public`, and several are `SECURITY DEFINER` | migration grep for `CREATE FUNCTION` and `SECURITY DEFINER` across `00001`-`00020` | uncertain | accepted beta risk candidate | Story 1.3 should review function placement/search_path before DB hardening |
| Realtime publication coverage for subscribed tables | N/A | Realtime publication should include all tables the app expects to receive via subscriptions | Local migrations add `messages` and `notifications`, but no `message_reactions` publication change was found | migration grep across `00001`-`00020`; chat/notification source inspection | unsupported by schema | accepted beta risk candidate | Decide if reactions realtime is launch-critical |
| Storage policy coverage for chat images | N/A | Chat media storage should have defined bucket and policy coverage before beta use | The app uses `chat-images`, but no local bucket/policy migration was found in audited migrations | `src/components/chat/message-input.tsx`; migration grep across `00001`-`00020` | unsupported by schema | launch blocker | Define media privacy/storage access before launch or disable media upload |

## Production-Impacting Inspection Log

| Timestamp UTC | Command/tool | Type | Outcome | Risk |
| --- | --- | --- | --- | --- |
| 2026-05-01T19:52:13Z | `date -u +%Y-%m-%dT%H:%M:%SZ` | Local shell read | Captured current timestamp for tracking | None |
| 2026-05-01T19:52Z (exact seconds not captured) | Supabase MCP `list_tables(schemas=['public'], verbose=true)` | Production metadata read-only | Returned only `public.francophone_pack_members`; expected app tables absent | Production-impacting read-only; no writes |
| 2026-05-01T19:52Z (exact seconds not captured) | Supabase MCP `list_migrations` | Production metadata read-only | Returned only migration `001 francophone_pack_members`; local migrations `00001` through `00020` absent | Production-impacting read-only; no writes |
| 2026-05-01T19:52Z (exact seconds not captured) | Supabase MCP `get_advisors(type='security')` | Production advisor read-only | One warning: `public.set_updated_at` has mutable `search_path` | Production-impacting read-only; no writes |
| 2026-05-01T19:52Z (exact seconds not captured) | Supabase MCP `get_advisors(type='performance')` | Production advisor read-only | One warning: `auth_rls_initplan` on `public.francophone_pack_members` policy | Production-impacting read-only; no writes |
| 2026-05-01T19:52Z (exact seconds not captured) | Supabase docs search for RLS/realtime/storage | External documentation read | Used as audit methodology support only; not treated as direct evidence for codebase or production findings | No production risk |

## Reproducible Search Scope Notes

| Search area | Scope preserved for this audit | Result used in audit |
| --- | --- | --- |
| Route inventory scope | Public/auth/status/legal routes inspected from `src/app/page.tsx`, `src/app/(auth)/connexion/page.tsx`, `src/app/(auth)/inscription/page.tsx`, `src/app/rejoindre/page.tsx`, `src/app/mentions-legales/page.tsx`, `src/app/confidentialite/page.tsx`, `src/app/cgu/page.tsx`, `src/app/(auth)/en-attente/page.tsx`, and `src/app/onboarding/page.tsx`; protected/member/admin surfaces inspected from `src/app/(app)/layout.tsx`, `src/app/(app)/chat/page.tsx`, `src/app/(app)/chat/[slug]/page.tsx`, `src/app/(app)/chat/layout.tsx`, `src/app/(app)/tableau-de-bord/page.tsx`, `src/app/(app)/profil/page.tsx`, `src/app/(app)/parametres/page.tsx`, `src/app/(app)/notifications/page.tsx`, `src/app/(app)/parrainages/page.tsx`, `src/app/(app)/membres/page.tsx`, `src/app/(app)/membres/[id]/page.tsx`, `src/app/(app)/forum/page.tsx`, `src/app/(app)/forum/[categorySlug]/page.tsx`, `src/app/(app)/forum/posts/[postId]/page.tsx`, `src/app/(app)/forum/posts/nouveau/page.tsx`, `src/app/(app)/admin/layout.tsx`, `src/app/(app)/admin/page.tsx`, `src/app/(app)/admin/users/page.tsx`, and `src/app/api/geo/cities/route.ts` | This is the preserved scope behind earlier `route glob inspection` references |
| Migration inspection scope | Local migration set `supabase/migrations/00001_initial_schema.sql` through `supabase/migrations/00020_profiles_schema_alignment.sql` | All local schema/RLS/function/trigger/publication/storage claims are limited to this inspected migration range |
| Negative search claim: views | Searched the local migration scope for `CREATE VIEW` and `CREATE OR REPLACE VIEW` | No local SQL view definitions were found in migrations `00001` through `00020` |
| Negative search claim: realtime publication for `message_reactions` | Searched the local migration scope for publication changes involving `message_reactions`, including `ALTER PUBLICATION` statements | No local publication change for `message_reactions` was found in migrations `00001` through `00020` |
| Negative search claim: storage policy coverage for `chat-images` | Searched the local migration scope for `chat-images`, storage bucket creation, and storage policy definitions | No local migration-backed bucket/policy setup for `chat-images` was found in migrations `00001` through `00020` |

## Findings

| ID | Category | Severity | Finding | Evidence | Recommended next action |
| --- | --- | --- | --- | --- | --- |
| F-01 | launch blocker | High | Connected Supabase project does not match local app schema. Production inspection shows only `francophone_pack_members`, not app tables such as `profiles`, `channels`, `messages`, or `notifications`. | Supabase MCP `list_tables`; `list_migrations` | Confirm MCP/project target immediately; reconcile production schema/migrations before launch decisions |
| F-02 | launch blocker | High | Local `profiles` own-update RLS permits authenticated users to update their own row without column restrictions, enabling possible self-approval/admin/access escalation through direct Data API. This is confirmed in local migrations; production confirmation is blocked until F-01 is resolved. | `00001_initial_schema.sql:109-112` | Story 1.3: restrict sensitive fields via RLS/RPC/server-authorized mutation paths |
| F-03 | launch blocker | High | Sponsor policy and client path can approve a requester's profile status from the client, bypassing admin-only admission if sponsor RLS is active. This is confirmed in local migrations and source code; production confirmation is blocked until F-01 is resolved. | `00003_sponsorship_system.sql:80-84`; `parrainages-tabs.tsx:51-69` | Story 1.2 define sponsor authority; Story 1.3 restrict profile updates |
| F-04 | launch blocker | High | Local `messages` INSERT policy does not check private-channel membership or channel write permission. This is confirmed in local migrations; production confirmation is blocked until F-01 is resolved. | `00004_invitations_chat_forum.sql:125-133`; `00012_dm_system.sql:70-93` | Story 1.3 add channel membership/public-channel checks for INSERT |
| F-05 | launch blocker | High | Local `channel_members` INSERT policy allows any approved user to create channel memberships without verifying self/recipient/channel authority. This is confirmed in local migrations; production confirmation is blocked until F-01 is resolved. | `00012_dm_system.sql:31-39` | Story 1.3 move DM membership creation behind authorized RPC/server path or tighten RLS |
| F-06 | launch blocker | Medium | Local `channels` INSERT permits approved users to create private channels even though private DMs are out of MVP scope. This is confirmed in local migrations; production confirmation is blocked until F-01 is resolved. | `00012_dm_system.sql:60-68`; PRD FR34 | Story 1.3 should constrain non-admin private-channel creation before beta |
| F-07 | launch blocker | Medium | `chat-images` storage policy coverage is unverified from the audited local migrations and the currently connected Supabase target. This is a local configuration-evidence blocker, and production confirmation remains blocked until F-01 is resolved. | `message-input.tsx:198-205`; migration grep | Define storage privacy and policies or disable media upload before beta |
| F-08 | accepted beta risk candidate | Medium | Admin approve/refuse/access changes are not actor/timestamp attributed in current actions/schema. | `admin/actions.ts`; PRD FR31 | Decide in Epic 4/Story 1.4 whether this blocks beta |
| F-09 | accepted beta risk candidate | Medium | `chat_banned` and `chat_muted_until` are written by admin actions but not enforced in chat send/read paths found by source inspection. | `00020_profiles_schema_alignment.sql`; `admin/actions.ts`; grep results | Define access-removal/suspension enforcement story |
| F-10 | accepted beta risk candidate | Low | App subscribes to `message_reactions` realtime, but local migrations do not add that table to realtime publication. | `chat-store.tsx:152-158`; migration grep | Add publication if reaction realtime is required |
| F-11 | follow-up story input | Medium | Legal pages exist but middleware public allowlist does not include legal routes. | `src/app/mentions-legales/page.tsx`; `middleware.ts` allowlist | Epic 2/Story 1.2 should decide legal public access path |
| F-12 | follow-up story input | Medium | `/api/geo/cities` access expectation is unclear because middleware does not make `/api/*` public. | `src/app/api/geo/cities/route.ts`; middleware allowlist | Story 1.2 should define route/API expectation for onboarding |
| F-13 | follow-up story input | Medium | `src/lib/types/database.ts` is not a full generated Supabase Database type and may drift from migrations/production. | Type file inspection | Use as app types only; regenerate or replace in scoped schema story |
| F-14 | accepted beta risk candidate | Low | Local migrations include `SECURITY DEFINER` functions in exposed `public` schema, which should be reviewed during database hardening. | migration grep for `CREATE FUNCTION` and `SECURITY DEFINER` across `00001`-`00020` | Review function placement/search_path during DB hardening |

## Handoff to Story 1.2

Story 1.2 should define the canonical expected access matrix before hardening starts. It should explicitly decide:

| Decision area | Question to answer |
| --- | --- |
| Legal pages | Must `/mentions-legales`, `/confidentialite`, and `/cgu` be public despite middleware allowlist? |
| City API | Should `/api/geo/cities` be public, auth-only, or onboarding-only? |
| Sponsor authority | Can sponsors approve access, or only sponsor context before admin approval? |
| Private DMs | Confirm private 1:1 channels remain out of MVP scope and should stay blocked for non-admin users. |
| Channel management | Are any non-admin channel creation paths allowed? |
| Suspension/removal | Should `chat_banned` block all app access, chat send only, or chat read/write? |
| Media privacy | Are chat image URLs allowed to be public, or must they be member/private? |
| Legacy routes | Should forum/member/parrainage routes remain member-only direct-access routes during MVP? |

## Handoff to Story 1.3

Story 1.3 should prioritize confirmed bypasses in this order:

1. Confirm the correct Supabase project/schema target before any hardening.
2. Restrict `profiles` updates so users cannot self-set `status`, `is_admin`, access/moderation fields, sponsor fields, or audit fields.
3. Remove or constrain sponsor-driven `profiles.status = 'approved'` updates unless Story 1.2 explicitly allows them.
4. Add message INSERT RLS checks for public-channel write permission and private-channel membership.
5. Constrain `channel_members` INSERT to authorized membership creation.
6. Constrain non-admin `channels` INSERT because private DMs are not in MVP scope.
7. Define or disable `chat-images` storage access before media use in beta.
8. Add enforcement for `chat_banned` and `chat_muted_until` if access removal/suspension is launch-critical.

## Verification Outcomes

Verification commands run after creating this artifact:

| Command | Outcome | Classification |
| --- | --- | --- |
| `npm run lint` | Failed with 95 existing lint problems across runtime files, including `no-explicit-any`, React Compiler hook/ref rules, unused variables, and `<img>` warnings. No runtime source files were modified by Story 1.1. | Baseline failure, not introduced by this documentation-only story |
| `npx vitest run src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts` | Passed: 2 test files, 12 tests. | Verified targeted route/auth source-inspection and auth URL checks |
| `npx vitest run` | Failed: 1 test file failed, 3 assertions failed in `src/__tests__/profile-utils.test.ts` because expected availability labels differ from current implementation labels. 3 test files passed, 33 tests passed. No runtime source files were modified by Story 1.1. | Baseline failure, not introduced by this documentation-only story |
