# Story 1.2 — MVP Access Matrix

**Date:** 2026-05-02
**Story:** `1-2-define-and-verify-the-mvp-access-matrix`
**Status:** done

## Summary

This document defines the canonical expected access matrix for the Le Marché Libre MVP. Every user state has explicit route, data, and mutation expectations. Current observed behavior from source inspection is recorded alongside expected behavior. Gaps are classified and handed off to the appropriate next action (Story 1.3 hardening, Story 1.4 risk documentation, or accepted beta risk).

## Scope and Non-Goals

**In scope:**

| Area | Surfaces |
| --- | --- |
| Canonical user states | Logged-out, no-profile, incomplete-profile/request, pending, refused, approved-not-onboarded, approved-onboarded, suspended/removed, admin, non-admin-attempting-admin |
| Route/layout boundaries | Public, auth, status, legal, onboarding, app, admin, legacy |
| Data access and RLS | All local migration-backed tables |
| Admin mutations | Server Actions and direct Data API equivalents |
| API, storage, realtime | Route handlers, `chat-images`, message/reaction/notification subscriptions |
| Story 1.1 finding mapping | F-01 through F-14 mapped to next action |

**Out of scope:**

| Area | Reason |
| --- | --- |
| Runtime code changes | Documentation/verification-first; fixes belong in Story 1.3 unless owner re-scopes |
| Supabase writes | Forbidden by brownfield guardrails |
| UI redesign | Not part of this story |
| Production schema confirmation | Blocked by F-01 |

## Canonical User State Definitions

| State | Evidence source fields | Definition |
| --- | --- | --- |
| Logged-out | No Supabase session | `auth.getUser()` returns null |
| Authenticated, no profile | `profiles` row absent after auth | `profiles` SELECT returns nothing |
| Authenticated, incomplete profile/request | `profiles` row exists but required admission/profile fields are incomplete or status is unset | Treat as pending/status-boundary until admission is explicit |
| Pending | `profiles.status` neither `approved` nor `rejected` | Middleware classifies as `isPending` |
| Refused/rejected | `profiles.status = 'rejected'` | Product-facing term is `refused`; DB value is `rejected` |
| Approved-not-onboarded | `profiles.status = 'approved'` AND `onboarding_completed !== true` | Must complete onboarding before app access |
| Approved-onboarded | `profiles.status = 'approved'` AND `onboarding_completed = true` | Full member; `/chat` is home |
| Suspended/removed | `profiles.chat_banned = true` or `chat_muted_until` active | Admin moderation states; currently not enforced in read/send paths |
| Admin | `profiles.is_admin = true` | Can access `/admin` and admin Server Actions |
| Non-admin attempting admin | `profiles.is_admin` false or null | Should be redirected to `/chat` |

## Route and Layout Access Matrix

### Public / Auth / Status Routes

| Surface | User state | Expected behavior | Observed behavior | Evidence source | Decision status | Implementation status | Finding / follow-up | Owner decision needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Logged-out | Allow — public landing | Allow | `middleware.ts:39-54` | decided | verified | None | No |
| `/` | Approved-onboarded | Redirect to `/chat` | Redirect to `/chat` | `middleware.ts:91-102` | decided | verified | None | No |
| `/connexion` | Logged-out | Allow — public login | Allow | `middleware.ts:39-54` | decided | verified | None | No |
| `/connexion` | Approved-onboarded | Redirect to `/chat` | Redirect to `/chat` | `middleware.ts:91-102` | decided | verified | None | No |
| `/inscription` | Logged-out | Allow — public registration | Allow | `middleware.ts:39-54` | decided | verified | None | No |
| `/inscription` | Approved-onboarded | Redirect to `/chat` | Redirect to `/chat` | `middleware.ts:91-102` | decided | verified | None | No |
| `/en-attente` | Logged-out | Redirect to `/connexion` | Redirect (page-level check) | `en-attente/page.tsx:13-17` | decided | verified | Middleware allows `/en-attente` public, but page requires auth | No |
| `/en-attente` | Pending | Allow — pending status page | Allow | `middleware.ts:77-81` | decided | verified | None | No |
| `/en-attente` | Refused/rejected | Allow — explicit refused state | Allow | `middleware.ts:70-74`; `en-attente/page.tsx:37-67` | decided | verified | Product copy uses `refused` language; DB value is `rejected` | No |
| `/en-attente` | Approved-onboarded | Redirect to `/chat` | Redirect | `middleware.ts:91-102`; `en-attente/page.tsx:69-71` | decided | verified | None | No |
| `/en-attente` | Approved-not-onboarded | Redirect to `/onboarding` | Redirect | `en-attente/page.tsx:69-71` | decided | verified | None | No |
| `/rejoindre` | Logged-out | Allow — referral landing | Allow | `middleware.ts:39-54` | decided | verified | Referral cookie handling in callback | No |
| `/rejoindre` | Approved-onboarded | Redirect to `/chat` | Redirect (via middleware catch) | `middleware.ts:91-102` | decided | verified | None | No |
| `/auth/*` | Logged-out | Allow — OAuth callbacks | Allow | `middleware.ts:47` | decided | verified | None | No |
| `/auth/callback` | OAuth return | Exchange code, route by status | Routes approved to `/chat` or `/onboarding`; non-approved to `/en-attente`; writes referral data | `auth/callback/route.ts:8-136` | decided | verified | Writes `sponsored_by` and `sponsorship_requests` from browser cookie | No |
| `/auth/*` | Approved-onboarded | Redirect to `/chat` | Redirect (via middleware catch) | `middleware.ts:91-102` | decided | verified | None | No |

### Legal Routes

| Surface | User state | Expected behavior | Observed behavior | Evidence source | Decision status | Implementation status | Finding / follow-up | Owner decision needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/mentions-legales` | Logged-out | **expected allow** — public legal page required by FR2 | Redirects to `/connexion` (not in middleware allowlist) | `middleware.ts:39-47`; `src/app/mentions-legales/page.tsx` | decided | **confirmed bypass** | F-11: Legal routes not in public allowlist. Story 1.3 should add public-route exceptions. | No |
| `/mentions-legales` | Authenticated approved-onboarded | **expected allow** — legal pages remain public for all visitors | Redirects to `/chat` (via middleware approved-onboarded catch) | `middleware.ts:91-102` | decided | **confirmed bypass** | Same F-11 route fix as logged-out access. | No |
| `/confidentialite` | Logged-out | **expected allow** — public legal page required by FR2 | Redirects to `/connexion` (not in middleware allowlist) | `middleware.ts:39-47`; `src/app/confidentialite/page.tsx` | decided | **confirmed bypass** | Same as `/mentions-legales` | No |
| `/confidentialite` | Authenticated approved-onboarded | **expected allow** — legal pages remain public for all visitors | Redirects to `/chat` | `middleware.ts:91-102` | decided | **confirmed bypass** | Same as `/mentions-legales` | No |
| `/cgu` | Logged-out | **expected allow** — public legal page required by FR2 | Redirects to `/connexion` (not in middleware allowlist) | `middleware.ts:39-47`; `src/app/cgu/page.tsx` | decided | **confirmed bypass** | Same as `/mentions-legales` | No |
| `/cgu` | Authenticated approved-onboarded | **expected allow** — legal pages remain public for all visitors | Redirects to `/chat` | `middleware.ts:91-102` | decided | **confirmed bypass** | Same as `/mentions-legales` | No |

### Onboarding Routes

| Surface | User state | Expected behavior | Observed behavior | Evidence source | Decision status | Implementation status | Finding / follow-up | Owner decision needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/onboarding` | Logged-out | Redirect to `/connexion` | Redirect | `onboarding/page.tsx:7-21` | decided | verified | None | No |
| `/onboarding` | Pending/refused | Redirect to `/en-attente` | Redirect | `onboarding/page.tsx:13-21` | decided | verified | None | No |
| `/onboarding` | Approved-not-onboarded | Allow — complete onboarding | Allow | `middleware.ts:84-88`; `onboarding/page.tsx:19-21` | decided | verified | Loads profiles, specialties, countries, members — all need approved-status RLS | No |
| `/onboarding` | Approved-onboarded | Redirect to `/chat` | Redirect | `onboarding/page.tsx:20-21` | decided | verified | None | No |
| `/api/geo/cities` | Approved-not-onboarded | Allow — onboarding support data | Authenticated access allowed; middleware does not block `/api/*` from approved users | `api/geo/cities/route.ts:363-416`; `middleware.ts` | decided | verified | Works for onboarding users | No |
| `/api/geo/cities` | Logged-out | **expected deny** — not required for public access | Redirects to `/connexion` (not in public allowlist, `/api/*` not listed) | `middleware.ts:39-54` | decided | verified | F-12: Defined as auth/onboarding-compatible, not public | No |

### Protected App Routes

| Surface | User state | Expected behavior | Observed behavior | Evidence source | Decision status | Implementation status | Finding / follow-up | Owner decision needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `(app)` layout (all routes under) | Logged-out | Redirect to `/connexion` | Redirect | `(app)/layout.tsx:11-28` | decided | verified | None | No |
| `(app)` layout | No profile | Redirect to `/connexion` | Redirect | `(app)/layout.tsx:26-28` | decided | verified | None | No |
| `(app)` layout | Incomplete profile/request | Redirect to `/en-attente` unless approved-not-onboarded | Pending-style profile states redirect to `/en-attente`; approved incomplete onboarding redirects to `/onboarding` | `middleware.ts:64-88`; `(app)/layout.tsx:30-40` | decided | verified | Use explicit pending/status-boundary until admission is decided | No |
| `(app)` layout | Pending | Redirect to `/en-attente` | Redirect | `(app)/layout.tsx:30-32` | decided | verified | None | No |
| `(app)` layout | Refused | Redirect to `/en-attente` | Redirect | `(app)/layout.tsx:34-36` | decided | verified | None | No |
| `(app)` layout | Approved-not-onboarded | Redirect to `/onboarding` | Redirect | `(app)/layout.tsx:38-40` | decided | verified | None | No |
| `/chat` | Approved-onboarded | Allow — app center | Allow; server loads public channels, DMs, members, initial messages | `(app)/chat/layout.tsx:15-123` | decided | verified | DM support exists in code despite being outside MVP scope | No |
| `/chat` | Suspended/removed | **expected deny** or explicit blocked state when `chat_banned = true`; muted users may read but not send | Chat ban/mute fields are not enforced in chat read/send paths | `admin/actions.ts:86-113`; `message-input.tsx:38-83` | decided | unverified | F-09: Story 1.3/Epic 4 must enforce chat moderation state if launch-critical | No |
| `/chat/[slug]` | Approved-onboarded | Allow — channel view | Allow (inherited from `(app)` layout) | Route glob inspection | decided | verified | None | No |
| `/chat` | Pending/refused/not-onboarded | Deny — redirected by `(app)` layout | Redirected before reaching page | `(app)/layout.tsx:30-40` | decided | verified | None | No |
| `/tableau-de-bord` | Approved-onboarded | Allow (legacy member route, preserved) | Allow (inherited from `(app)` layout) | Route glob inspection | decided | verified | Parked feature; hidden from nav but route preserved | No |
| `/profil` | Approved-onboarded | Allow — own profile | Allow | Route glob inspection | decided | verified | Profile edit writes directly to `profiles` from browser — RLS must protect | No |
| `/parametres` | Approved-onboarded | Allow | Allow | Route glob inspection | decided | verified | None | No |
| `/notifications` | Approved-onboarded | Allow — own notifications only | Allow | Route glob inspection | decided | verified | RLS restricts to own notifications | No |
| `/parrainages` | Approved-onboarded | Allow — sponsorship management | Allow | Route glob inspection | decided | verified | Sponsor UI can update `profiles.status` from browser — F-03 | No |
| `/membres` | Approved-onboarded | Allow — member directory | Allow | Route glob inspection | decided | verified | Direct DM button inserts `channels`/`channel_members` from browser — F-05, F-06 | No |
| `/membres/[id]` | Approved-onboarded | Allow — member profile view | Allow | Route glob inspection | decided | verified | Same DM creation risk | No |
| `/forum`, `/forum/[categorySlug]`, `/forum/posts/[postId]`, `/forum/posts/nouveau` | Approved-onboarded | Allow (legacy member routes, preserved) | Allow (inherited from `(app)` layout) | Route glob inspection | decided | verified | Parked feature; direct access preserved | No |
| All `(app)` routes | Logged-out/pending/refused/not-onboarded | Deny — redirected before page renders | Redirected by middleware or `(app)` layout | `middleware.ts`; `(app)/layout.tsx` | decided | verified | Defense-in-depth: UI redirects, not DB-enforced | No |

### Admin Routes

| Surface | User state | Expected behavior | Observed behavior | Evidence source | Decision status | Implementation status | Finding / follow-up | Owner decision needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/admin` layout | Logged-out | Redirect to `/connexion` | Redirect | `admin/layout.tsx:9-15` | decided | verified | None | No |
| `/admin` layout | Non-admin | Redirect to `/chat` | Redirect | `admin/layout.tsx:16-24` | decided | verified | UI gate only; DB RLS must still protect mutations | No |
| `/admin` | Admin | Allow | Allow | `admin/layout.tsx:9-26` | decided | verified | None | No |
| `/admin/users` | Admin | Allow | Allow (inherited) | Route glob inspection | decided | verified | None | No |
| `/admin` child routes | Non-admin | Redirect to `/chat` | Redirect (inherited from layout) | Route glob inspection | decided | verified | None | No |

## Data Access and RLS Expectations

All entries reference local migrations `00001` through `00020`. Production confirmation blocked by F-01.

| Table | User state | Expected behavior | Observed behavior (local RLS) | Evidence source | Decision status | Implementation status | Finding / follow-up | Owner decision needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `profiles` SELECT | Own user | Read own profile | Own-profile policy allows read | `00001:104-107` | decided | verified | None | No |
| `profiles` SELECT | Admin | Read all profiles | Admin allowed by policy | `00001:104-107` | decided | verified | None | No |
| `profiles` SELECT | Approved non-admin (directory) | Read approved members only | Policy allows approved profiles OR own OR admin | `00001:104-107` | decided | verified | Approved-member directory visibility is acceptable | No |
| `profiles` SELECT | Pending/refused/logged-out | No profile data leak | Logged-out blocked by auth gate; pending/refused blocked by RLS (not approved, not own) | `00001:104-107` | decided | verified | None | No |
| `profiles` UPDATE | Own user (safe fields) | Update own safe profile fields | Own-update policy checks only `id = auth.uid()` — no column restrictions | `00001:109-112` | decided | **confirmed bypass** | F-02: Users can self-escalate `status`, `is_admin`, etc. | **No — confirmed launch blocker for Story 1.3** |
| `profiles` UPDATE | Sponsor | Update only sponsorship-relevant fields on sponsored profiles | Sponsor policy allows UPDATE on sponsored profiles — no column restrictions | `00003:80-84` | decided | **confirmed bypass** | F-03: Sponsor can set `status = 'approved'` and arbitrary fields | **No — confirmed launch blocker for Story 1.3** |
| `profiles` UPDATE | Admin | Update any profile for admission/moderation | No admin-specific UPDATE policy found; relies on `is_admin` app check + broad own-update RLS | `admin/actions.ts`; `00001:109-112` | decided | verified | Admin actions check `is_admin` in app code, not RLS | No |
| `profiles` UPDATE | Self-approval attempt | **expected deny** — users must not self-set `status = 'approved'` | RLS permits via own-update policy | `00001:109-112` | decided | **confirmed bypass** | F-02 mapped to Story 1.3 | No |
| `profiles` UPDATE | Self-admin escalation | **expected deny** — users must not self-set `is_admin = true` | RLS permits via own-update policy | `00001:109-112` | decided | **confirmed bypass** | F-02 mapped to Story 1.3 | No |
| `channels` SELECT | Approved user (public) | Read public channels | RLS requires approved status for public channels | `00012:43-58` | decided | verified | None | No |
| `channels` SELECT | Approved user (private) | Read private channels where member | RLS checks channel membership after `00012` | `00012:43-58` | decided | verified | None | No |
| `channels` SELECT | Pending/refused/logged-out | No channel data | RLS requires approved status | `00012:43-58` | decided | verified | None | No |
| `channels` INSERT | Admin | Create any channel | Admin bypass via RLS or app-level | `00012:60-68` | decided | verified | None | No |
| `channels` INSERT | Non-admin approved | **expected deny** — private DMs not in MVP scope | RLS allows approved users to create private channels | `00012:60-68` | decided | **confirmed bypass** | F-06: Non-admin can create private channels | **No — confirmed launch blocker for Story 1.3** |
| `channels` INSERT | Pending/refused | **expected deny** | RLS requires approved status | `00012:60-68` | decided | verified | None | No |
| `channel_members` INSERT | Admin | Manage any membership | Admin creates memberships for system channels | `00012:31-39` | decided | verified | None | No |
| `channel_members` INSERT | Approved user | **expected allow only for authorized membership creation** (e.g., joining public channels) | RLS checks only approved status — no self-membership or recipient consent check | `00012:31-39` | decided | **confirmed bypass** | F-05: Arbitrary membership creation by approved users | **No — confirmed launch blocker for Story 1.3** |
| `channel_members` INSERT | Pending/refused | **expected deny** | RLS requires approved status | `00012:31-39` | decided | verified | None | No |
| `messages` SELECT | Approved user (public channel) | Read messages in public channels | RLS requires approved status and public channel or membership | `00012:70-93` | decided | verified | None | No |
| `messages` SELECT | Approved user (private channel) | Read messages where member | RLS checks membership | `00012:70-93` | decided | verified | None | No |
| `messages` SELECT | Pending/refused/logged-out | **expected deny** | RLS requires approved status | `00012:70-93` | decided | verified | None | No |
| `messages` INSERT | Approved user (public channel) | Write in public channels where allowed | RLS checks only `author_id = auth.uid()` and approved status — no channel write permission check | `00004:125-133`; `00012:70-93` | decided | **confirmed bypass** | F-04: INSERT does not check channel membership or write permission | **No — confirmed launch blocker for Story 1.3** |
| `messages` INSERT | Approved user (private channel) | Write only if member | RLS does NOT check private channel membership for INSERT | `00004:125-133` | decided | **confirmed bypass** | F-04 mapped to Story 1.3 | No |
| `messages` INSERT | Pending/refused | **expected deny** | RLS requires approved status | `00004:125-133` | decided | verified | None | No |
| `messages` INSERT | Suspended/removed | **expected deny** for banned users and active muted users | RLS/app send path does not enforce `chat_banned` or `chat_muted_until` | `admin/actions.ts:86-113`; `message-input.tsx:38-83` | decided | unverified | F-09: Add send-path guard if moderation is launch-critical | No |
| `messages` UPDATE/DELETE | Message author | Update/delete own messages | RLS allows author or admin | `00004:135-141` | decided | verified | If pinning must be admin-only, split from general edits | No |
| `messages` UPDATE/DELETE | Admin | Moderate any message | RLS allows admin | `00004:135-141` | decided | verified | None | No |
| `message_reactions` SELECT | Approved user | Read reactions | RLS requires approved status | `00004:154-177` | decided | verified | No realtime publication found for this table | No |
| `message_reactions` INSERT | Own user | Add/remove own reactions | RLS checks own user id | `00004:154-177` | decided | verified | F-10: No realtime publication | No |
| `message_reactions` INSERT | Pending/refused | **expected deny** | RLS requires approved status | `00004:154-177` | decided | verified | None | No |
| `notifications` SELECT | Recipient | Read own notifications only | RLS allows own only | `00005:16-28`; `00019:1-10` | decided | verified | None | No |
| `notifications` UPDATE | Recipient | Update own notifications (mark read) | RLS allows own only | `00005:16-28` | decided | verified | None | No |
| `notifications` INSERT | Actor | Create notifications with `actor_id = auth.uid()` | RLS fixed by `00019`; onboarding welcome insert may omit `actor_id` | `00005:16-28`; `00019:1-10` | decided | verified | App onboarding welcome insert may fail under RLS | No |
| `notifications` INSERT/SELECT/UPDATE | Non-recipient | **expected deny** | RLS restricts to own or actor | `00005:16-28` | decided | verified | None | No |
| `sponsorship_requests` SELECT | Requester | Read own requests | RLS matches requester | `00011:20-61` | decided | verified | None | No |
| `sponsorship_requests` SELECT | Sponsor | Read requests addressed to them | RLS matches sponsor | `00011:20-61` | decided | verified | None | No |
| `sponsorship_requests` SELECT/UPDATE | Admin | Read/update all requests | RLS allows admin | `00011:20-61` | decided | verified | None | No |
| `invitations` SELECT/INSERT | Approved user | Create invitations; read own | RLS allows invite creation by approved; update by handle/admin | `00004:28-59` | decided | unverified | Handle-based authorization collision risk; future schema story input | No |
| Forum tables (SELECT/INSERT/UPDATE/DELETE) | Approved members | Member-only read/write; admin for category/tag management | RLS requires approved status for most ops | `00004:194-376` | decided | verified | Parked feature but direct access preserved | No |
| Forum tables | Pending/refused/logged-out | **expected deny** | RLS requires approved status | `00004:194-376` | decided | verified | None | No |
| `channel_proposals` SELECT/INSERT | Approved users | Direct access allowed by RLS | RLS allows approved users to view/create | `00009:16-39` | decided | verified | F-14 candidate: hidden from UI but directly accessible | No |
| `user_reports` INSERT/SELECT | Reporter | Create and view own reports | RLS allows own report creation and viewing | `00007:12-43` | decided | verified | None | No |
| `user_reports` SELECT | Admin | Review all reports | RLS allows admin | `00007:12-43` | decided | verified | None | No |
| `user_blocks` INSERT/SELECT | Blocker | Manage own blocks | RLS allows own block management | `00007:12-43` | decided | verified | None | No |
| `countries` SELECT | All authenticated | Read country data (onboarding support) | No RLS policy found or public | `onboarding/page.tsx:55-59` | decided | verified | Support data | No |
| `cities` SELECT | All authenticated | Read city data (onboarding support) | No RLS policy found or public | `api/geo/cities/route.ts:157-216` | decided | verified | Support data | No |

## Admin Action and Sensitive Mutation Expectations

| Surface | Actor | Expected behavior | Observed behavior | Evidence source | Decision status | Implementation status | Finding / follow-up | Owner decision needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `approveUser` Server Action | Admin | Approve candidate | Checks `auth.getUser` + `is_admin`; updates `status = 'approved'` | `admin/actions.ts:5-38` | decided | verified | DB RLS must still prevent direct non-admin equivalent | No |
| `approveUser` Server Action | Non-admin | **expected deny** | Returns "Accès refusé" | `admin/actions.ts:24-26` | decided | verified | App-level check only; RLS must enforce | No |
| `approveUser` Server Action | Direct Data API (non-admin) | **expected deny** | Broad own-update RLS permits self-approval | `00001:109-112` | decided | **confirmed bypass** | F-02 mapped to Story 1.3 | No |
| `rejectUser` Server Action | Admin | Refuse candidate | Checks auth + admin; updates `status = 'rejected'` | `admin/actions.ts:40-73` | decided | verified | Missing admin actor/timestamp audit — F-08 | No |
| `rejectUser` Server Action | Non-admin | **expected deny** | Returns "Accès refusé" | `admin/actions.ts:59-61` | decided | verified | App-level only | No |
| `muteUser` / `unmuteUser` | Admin | Set/clear `chat_muted_until` | Checks `verifyAdmin`; updates field | `admin/actions.ts:86-98` | decided | verified | `chat_muted_until` not enforced in chat paths — F-09 | No |
| `banFromChat` / `unbanFromChat` | Admin | Set/clear `chat_banned` | Checks `verifyAdmin`; updates field | `admin/actions.ts:101-113` | decided | verified | `chat_banned` not enforced in chat paths — F-09 | No |
| Sponsorship approval client path | Sponsor | **expected deny for profile status changes** — sponsors provide referral only | Client updates `sponsorship_requests.status` AND `profiles.status = 'approved'` from browser | `parrainages-tabs.tsx:47-74` | decided | **confirmed bypass** | F-03: Sponsor can approve via browser | **No — confirmed launch blocker for Story 1.3** |
| Sponsorship approval client path | Sponsor | Update own sponsorship request status | Client updates `sponsorship_requests.status` | `parrainages-tabs.tsx:51-55` | decided | verified | RLS allows sponsor to update their requests | No |
| Profile self-update (onboarding/edit) | Approved user | Update own safe fields | Components write directly to `profiles` from browser | `onboarding-wizard.tsx`; `profile-edit-form.tsx` | decided | verified | Paired with F-02 RLS bypass | No |
| Profile self-update — `status` field | Any user | **expected deny** — must not self-approve | RLS permits via own-update | `00001:109-112` | decided | **confirmed bypass** | F-02 mapped to Story 1.3 | No |
| Profile self-update — `is_admin` field | Any user | **expected deny** — must not self-escalate to admin | RLS permits via own-update | `00001:109-112` | decided | **confirmed bypass** | F-02 mapped to Story 1.3 | No |
| Profile self-update — `chat_banned` field | Any user | **expected deny** — must not unban self | RLS permits via own-update | `00001:109-112` | decided | **confirmed bypass** | F-02 mapped to Story 1.3 | No |
| Direct DM creation client path | Approved member | **expected deny** — private DMs out of MVP scope | `member-profile.tsx` writes `channels` + `channel_members` from browser | `member-profile.tsx:85-160` | decided | verified | Paired with F-05 and F-06 RLS bypasses | No |
| Chat message INSERT client path | Approved member | Allow in allowed channels | `message-input.tsx` inserts directly into `messages` from browser | `message-input.tsx:38-83` | decided | verified | Paired with F-04 RLS bypass | No |
| Chat image upload client path | Approved member | Allow but storage policy must be defined | `message-input.tsx` uploads to `chat-images` and uses public URLs | `message-input.tsx:182-207` | decided | verified | F-07: No storage policy migration found | **Yes: confirm storage policy or disable upload** |
| `toggleReferrals` client path | Approved member | Toggle own `accept_referrals` | Direct update to `profiles` from browser | `parrainages-tabs.tsx:110-114` | decided | verified | Safe field but same broad RLS applies | No |
| Report/block client path | Approved member | Create reports/blocks | Direct insert from browser | `member-profile.tsx:46-82` | decided | verified | RLS restricts to own operations | No |

## API, Storage, and Realtime Expectations

| Surface | User state | Expected behavior | Observed behavior | Evidence source | Decision status | Implementation status | Finding / follow-up | Owner decision needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/api/geo/cities` | Authenticated approved-not-onboarded | Allow — onboarding support | Server Supabase client used; no route-local auth; middleware allows approved users | `api/geo/cities/route.ts:363-416` | decided | verified | Works for onboarding | No |
| `/api/geo/cities` | Logged-out | **expected deny** — not required for public access | Redirects to `/connexion` via middleware | `middleware.ts:39-54` | decided | verified | F-12 resolved: auth-only is correct | No |
| `/api/geo/cities` | Pending/refused | **expected deny** — redirected by middleware before reaching API | Redirected to `/en-attente` by middleware | `middleware.ts:64-81` | decided | verified | None | No |
| Chat realtime `messages` | Approved-onboarded | Receive INSERT/UPDATE for subscribed channels | App subscribes via `chat-store.tsx`; `messages` in realtime publication | `chat-store.tsx:102-161`; `00004:143-144` | decided | verified | RLS should apply to reads | No |
| Chat realtime `messages` | Pending/refused/logged-out | **expected deny** — no realtime data | Cannot reach `/chat`; no subscription initiated | `middleware.ts`; `chat-store.tsx` | decided | verified | None | No |
| Chat realtime `messages` | Suspended/removed | **expected deny** for banned users; muted users may receive but not send | No explicit chat-ban subscription guard found | `chat-store.tsx:102-161`; `admin/actions.ts:86-113` | decided | unverified | F-09: Define moderation enforcement before beta if required | No |
| Chat realtime `message_reactions` | Approved-onboarded | Receive realtime reaction updates | App subscribes via `chat-store.tsx:152-158` | `chat-store.tsx:152-158` | decided | verified | F-10: No realtime publication for `message_reactions` found in migrations | No — accepted beta risk |
| Chat realtime `message_reactions` | Pending/refused/logged-out | **expected deny** | Cannot reach `/chat` | `middleware.ts` | decided | verified | None | No |
| Notifications realtime | Approved member | Receive own notifications only | App subscribes; `notifications` in realtime publication; RLS read own | `sidebar.tsx:88-110`; `notification-provider.tsx:101-163`; `00010:6-7` | decided | verified | None | No |
| Notifications realtime | Non-recipient | **expected deny** — no access to others' notifications | RLS restricts to own | `00005:16-28` | decided | verified | None | No |
| `chat-images` storage — upload | Approved member | Upload allowed, but storage policy must be defined | Browser uploads to `chat-images` using public URLs | `message-input.tsx:182-207` | decided | verified | F-07: No bucket/policy migration found | **Yes: confirm storage policy or disable** |
| `chat-images` storage — read | Approved member | Read chat media | Public URLs used — no member-only restriction | `message-input.tsx:203-206` | decided | verified | Chat images are accessible via public URL once uploaded | **Yes: must be member/private for beta** |
| `chat-images` storage — read | Logged-out/pending/refused | **expected deny** — private community media | Public URLs mean anyone with URL can access | `message-input.tsx:203-206` | decided | **confirmed bypass** | Media privacy not enforced | **Yes: launch-blocking until resolved** |

## Story 1.1 Finding Map

Every F-## finding is mapped to its next action.

| Finding | Category | Severity | Mapped to | Rationale |
| --- | --- | --- | --- | --- |
| F-01: Production schema mismatch | launch blocker | High | **Blocking precondition for Story 1.3** | Cannot harden production RLS until correct target is confirmed. All production confidence claims are blocked. |
| F-02: `profiles` own-update RLS self-escalation | launch blocker | High | **Story 1.3** | Restrict sensitive fields (`status`, `is_admin`, `chat_banned`, `chat_muted_until`, `sponsored_by`, `sponsor_approved`) via column-scoped RLS or server-authorized mutation path. |
| F-03: Sponsor client can approve profiles | launch blocker | High | **Story 1.3** | Remove or constrain sponsor-driven `profiles.status = 'approved'` updates. Sponsors may manage `sponsorship_requests` only. |
| F-04: `messages` INSERT lacks channel check | launch blocker | High | **Story 1.3** | Add channel membership or public-channel write permission check to message INSERT RLS. |
| F-05: `channel_members` INSERT arbitrary creation | launch blocker | High | **Story 1.3** | Constrain membership creation to authorized paths (self-join public channels, admin-managed, or recipient-consent). |
| F-06: Non-admin private channel creation | launch blocker | Medium | **Story 1.3** | Remove or constrain non-admin `channels` INSERT for private channels since DMs are out of MVP scope. |
| F-07: `chat-images` storage policy unverified | launch blocker | Medium | **Story 1.3 or owner decision** | Define storage bucket policy for member/private access OR disable media upload before beta. |
| F-08: Admin action audit fields missing | accepted beta risk | Medium | **Story 1.4** | Decide if actor/timestamp attribution blocks beta. Recommended: add `admin_id`, `admin_action_at` to `profiles` or separate audit table. |
| F-09: `chat_banned`/`chat_muted_until` not enforced | accepted beta risk | Medium | **Story 1.3 or Epic 4** | Define expected enforcement model: `chat_banned` should block chat access; `chat_muted_until` should block message INSERT. |
| F-10: `message_reactions` no realtime publication | accepted beta risk | Low | **Story 1.3 or accept** | Add publication if reaction realtime is required; otherwise remove subscription. Non-blocking for beta. |
| F-11: Legal routes not in middleware allowlist | follow-up input | Medium | **Story 1.3 (route fix) — expectation decided here** | Legal pages MUST be public. Add `/mentions-legales`, `/confidentialite`, `/cgu` to middleware `publicRoutes`. |
| F-12: `/api/geo/cities` access unclear | follow-up input | Medium | **Resolved by this story** | Define as auth/onboarding-compatible. Current behavior (auth-gated via middleware) is correct. No change needed. |
| F-13: Hand-maintained DB types | follow-up input | Medium | **Future schema story** | Use as app types only; regenerate or replace in scoped schema story. Not blocking for Story 1.3. |
| F-14: `SECURITY DEFINER` functions in public | accepted beta risk | Low | **Story 1.3** | Review function placement and `search_path` during database hardening. |

## Story 1.1 Finding → Story 1.2/1.3/1.4 Handoff Summary

| Next step | Inputs from Story 1.1 | What Story 1.2 decided |
| --- | --- | --- |
| **Story 1.3 hardening** | F-02, F-03, F-04, F-05, F-06, F-07, F-09, F-14 | Expected behaviors defined for all: self-approval denied, sponsor approval denied, message INSERT channel-checked, DM creation blocked, storage policy required, chat ban/mute enforced |
| **Story 1.4 risk documentation** | F-08, F-10 | F-08 (admin audit) and F-10 (reactions realtime) classified as accepted beta risk candidates — document in risk register |
| **Owner decision needed** | F-07 (storage), chat media privacy | Storage policy or disable upload; chat media must be member/private |
| **Resolved by this story** | F-12 (geo API) | Defined as auth-only; current behavior correct |

## Story 1.3 Handoff

Story 1.3 should prioritize confirmed bypasses in this order (consistent with Story 1.1 handoff, refined with Story 1.2 expectations):

1. **Confirm the correct Supabase project** (F-01 blocking precondition).
2. **Restrict `profiles` UPDATE** to exclude sensitive fields: `status`, `is_admin`, `chat_banned`, `chat_muted_until`, `sponsored_by`, `sponsor_approved`, `onboarding_completed`, `accept_referrals`, `accept_dms`, `accept_sponsorship`. Use column-scoped RLS or move to server-authorized mutation paths.
3. **Remove sponsor-driven `profiles.status` updates** from the client. Sponsors manage `sponsorship_requests` only.
4. **Add message INSERT RLS** checks for public-channel write permission and private-channel membership.
5. **Constrain `channel_members` INSERT** to authorized membership creation (self-join public, admin-managed, recipient-consent for private).
6. **Remove or constrain non-admin `channels` INSERT** for private channels (DMs out of MVP scope).
7. **Define or disable `chat-images` storage access** — require member/private policy or disable before beta.
8. **Add `chat_banned` enforcement** in chat read/send paths if access removal is launch-critical.
9. **Add `chat_muted_until` enforcement** in chat send path if mute is launch-critical.

## Story 1.4 Risk Documentation Input

- **F-08:** Admin actions lack actor/timestamp attribution. Acceptable for beta if documented. Recommend adding `admin_id` and `action_at` columns or a separate `admin_actions` audit table post-beta.
- **F-10:** `message_reactions` realtime subscription exists without publication. Acceptable for beta — reactions are non-critical UX. Add publication or remove subscription post-beta.
- **F-14:** `SECURITY DEFINER` functions in exposed `public` schema. Low risk for beta if functions are well-behaved. Review during post-beta hardening.

## Verification Outcomes

| Command | Outcome | Classification |
| --- | --- | --- |
| `npm run lint` | 95 problems (52 errors, 43 warnings) | Baseline from Story 1.1; no runtime files changed in Story 1.2 |
| `npx vitest run src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts` | 12/12 tests passed | Matches Story 1.1 targeted baseline |
| `npx vitest run` | 33/36 tests passed; 3 failures in `profile-utils.test.ts` | Baseline availability-label assertions from Story 1.1; not story-caused |

**Note:** This story is documentation/verification-first. No runtime code was changed. Verification outcomes are recorded from the implementation run and classified against the Story 1.1 baseline.

## Change Log

| Date | Change |
| --- | --- |
| 2026-05-02 | Created canonical MVP access matrix with all user states, route expectations, RLS expectations, admin mutation expectations, API/storage/realtime expectations, Story 1.1 finding map, and Story 1.3/1.4 handoffs. |
