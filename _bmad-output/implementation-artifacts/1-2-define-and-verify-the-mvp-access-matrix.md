# Story 1.2: Define and Verify the MVP Access Matrix

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the owner,
I want each user state to have an explicit route and data-access expectation,
so that pending, refused, logged-out, non-member, approved, and admin users cannot fall into ambiguous or unsafe behavior.

## Acceptance Criteria

1. Given the canonical MVP user states logged-out, incomplete/no profile, pending, refused/rejected, approved-not-onboarded, approved-onboarded, suspended/removed if supported, admin, and non-admin attempting admin access, when the developer defines the MVP access matrix, then every state has explicit expected outcomes for public routes, auth routes, `/en-attente`, onboarding, `/chat`, admin routes, legacy member routes, channel data, message data, admin mutations, direct query paths, API paths, storage paths, and realtime paths where those paths exist.
2. Each matrix entry states expected behavior, current observed behavior from Story 1.1 or source inspection, evidence source, decision status, and implementation status using explicit labels: `expected allow`, `expected deny`, `expected redirect`, `expected explicit-status`, `verified`, `unverified`, `blocked by schema/runtime uncertainty`, or `requires owner decision`.
3. Pending and refused users have explicit status-boundary expectations at `/en-attente` and must not be routed into silent login loops.
4. Approved onboarded users are expected to reach `/chat`; approved-not-onboarded users are expected to reach `/onboarding`; non-admin admin access is expected to fall back safely to `/chat` for approved members.
5. Direct route, direct Supabase query, API, storage, and realtime expectations are included wherever Story 1.1 identified existing access paths or uncertainty.
6. Story 1.1 findings are consumed without reopening broad discovery: each launch blocker, accepted beta risk candidate, and follow-up-story input is mapped to either Story 1.2 expectation decisions, Story 1.3 hardening input, Story 1.4 risk documentation input, or an explicitly non-blocking rationale.
7. No runtime code, route behavior, Supabase migrations, generated types, dependencies, package locks, tests, or UI are changed unless the owner explicitly re-scopes this story.
8. Verification commands and outcomes are recorded, including whether failures are baseline failures or new regressions.

## Tasks / Subtasks

- [x] Create the canonical MVP access matrix artifact (AC: 1, 2, 5, 6)
  - [x] Create `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`.
  - [x] Use a matrix schema with: `Surface`, `User state / actor`, `Expected behavior`, `Observed behavior`, `Evidence source`, `Decision status`, `Implementation status`, `Finding / follow-up`, and `Owner decision needed`.
  - [x] Include a summary, scope/non-goals, canonical state definitions, route/layout matrix, data/RLS matrix, admin-action matrix, API/Server Action matrix, storage/realtime matrix, Story 1.1 finding map, Story 1.3 handoff, and verification outcomes.
  - [x] Keep this story documentation/verification-first. Do not change runtime behavior unless the owner explicitly changes scope.
- [x] Define canonical user/admission/role states (AC: 1, 2, 3, 4)
  - [x] Cover logged-out, authenticated with no profile, authenticated with incomplete profile/request, pending, refused/rejected, approved-not-onboarded, approved-onboarded, suspended/removed if supported, admin, and non-admin attempting admin access.
  - [x] Use `profiles.status`, `profiles.onboarding_completed`, `profiles.is_admin`, `profiles.chat_banned`, and `profiles.chat_muted_until` as current evidence sources, while noting any schema uncertainty.
  - [x] Preserve product language: user-facing refused state is `refused`, while current database value is `rejected`.
- [x] Define route and layout expectations (AC: 1, 2, 3, 4, 5)
  - [x] Public/auth/status/legal/referral: `/`, `/connexion`, `/inscription`, `/rejoindre`, `/auth/*`, `/en-attente`, `/mentions-legales`, `/confidentialite`, `/cgu`.
  - [x] Onboarding and app routes: `/onboarding`, `/chat`, `/chat/[slug]`, `/tableau-de-bord`, `/profil`, `/parametres`, `/notifications`, `/parrainages`, `/membres`, `/membres/[id]`, `/forum`, `/forum/[categorySlug]`, `/forum/posts/[postId]`, `/forum/posts/nouveau`.
  - [x] Admin routes: `/admin`, `/admin/users`, and any admin child route currently present.
  - [x] Define legal pages as expected-public surfaces because FR2 requires public legal and terms access; record current middleware behavior as an implementation gap if logged-out access redirects.
  - [x] Record that direct legacy member routes remain preserved but member-only unless a future story explicitly changes them.
- [x] Define data, direct query, and RLS expectations (AC: 1, 2, 5, 6)
  - [x] Cover `profiles`, `channels`, `channel_members`, `messages`, `message_reactions`, `notifications`, `sponsorship_requests`, `invitations`, `user_reports`, `user_blocks`, forum tables, `countries`, `cities`, and `channel_proposals`.
  - [x] Make explicit that private 1:1 DMs are not in the MVP roadmap and non-admin private-channel creation should remain blocked.
  - [x] Separate current expectation decisions from current implementation gaps. For example, Story 1.2 defines that users must not self-approve; Story 1.3 hardens the `profiles` UPDATE RLS bypass.
  - [x] Keep F-01 production target mismatch as a blocking confidence condition for any production-specific schema/RLS claim.
- [x] Define admin action and sensitive mutation expectations (AC: 1, 2, 4, 5, 6)
  - [x] Cover `approveUser`, `rejectUser`, `muteUser`, `unmuteUser`, `banFromChat`, and `unbanFromChat` from `src/app/(app)/admin/actions.ts`.
  - [x] Define expected behavior for non-admin attempts, direct Data API equivalents, sponsor-driven approval attempts, profile self-update attempts, and channel-management attempts.
  - [x] Define sponsor authority for MVP: sponsors may provide referral/context support, but sponsor-driven profile approval must not bypass admin admission.
  - [x] Record admin actor/timestamp attribution as an accepted beta risk candidate or Story 1.4 input if not launch-blocking.
- [x] Define API, storage, and realtime expectations (AC: 1, 2, 5, 6)
  - [x] Define `/api/geo/cities` as expected auth/onboarding-compatible support data, not required for logged-out public access; record current middleware behavior and any onboarding impact.
  - [x] Define chat message realtime expectations for pending/refused/logged-out/non-member users and approved members.
  - [x] Define `message_reactions` realtime as non-blocking for beta unless message reading/sending depends on it; record missing local publication as accepted risk candidate or follow-up.
  - [x] Define notification realtime expectations: recipients only receive/read/update their own notifications.
  - [x] Define `chat-images` media privacy expectation: private chat media must not rely on unaudited public URLs for beta; mark storage policy coverage as launch-blocking until Story 1.3 or a storage-specific story resolves or disables media upload.
- [x] Map all Story 1.1 findings to next action (AC: 6)
  - [x] F-01 through F-07 must remain launch-blocker inputs unless disproven or explicitly reclassified by the owner.
  - [x] F-02 through F-07 should feed Story 1.3 hardening, with production confirmation still blocked by F-01.
  - [x] F-08 through F-10 and F-14 should be mapped to accepted beta risk candidate or Story 1.4 input with rationale.
  - [x] F-11 and F-12 should be resolved by this story as expectation decisions: legal pages are expected public; `/api/geo/cities` is expected auth/onboarding-compatible unless a runtime implementation story later chooses to make it public.
  - [x] F-13 should remain a schema/type follow-up unless Story 1.2 needs to block on generated types.
- [x] Verify and record outcomes (AC: 2, 8)
  - [x] Run `npm run lint` if practical and record whether failures are baseline or story-caused.
  - [x] Run `npx vitest run src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts` and record the result.
  - [x] If running full tests, use `npx vitest run` and classify known baseline `profile-utils.test.ts` failures separately.
  - [x] Because this is documentation/verification-first, investigate any new runtime/test failure before moving to review.

### Review Findings

- [x] [Review][Patch] Verification outcomes are still placeholders despite completed claims [`_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md:266`]
- [x] [Review][Patch] Canonical state coverage is inconsistent and misses the incomplete-profile/request state [`_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md:17`]
- [x] [Review][Patch] Suspended or removed users are defined but not mapped through explicit route/data/realtime expectations [`_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md:43`]
- [x] [Review][Patch] Legal-route expectations still contradict the story's resolved F-11 decision [`_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md:74`]
- [x] [Review][Patch] `/api/geo/cities` logged-out behavior is documented inconsistently across sections [`_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md:89`]
- [x] [Review][Patch] `invitations` uses an unsupported implementation-status label [`_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md:166`]

## Dev Notes

### Story Scope

Story 1.2 is the expectation-setting bridge between Story 1.1 audit findings and Story 1.3 hardening. It should produce the canonical expected access matrix and decision record, not close bypasses. Runtime fixes belong in Story 1.3 unless the owner explicitly changes scope. [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.2: Define and Verify the MVP Access Matrix`; Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Handoff to Story 1.2`]

The deliverable is `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`. Do not create a separate top-level docs folder. BMad output is the active planning and implementation source of truth. [Source: `_bmad/bmm/config.yaml`; Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]

This story should not modify app routes, UI, Supabase files, dependencies, package locks, generated types, tests, or runtime behavior. If the developer finds that a matrix expectation cannot be safely defined without changing runtime behavior, record the blocker and hand it to Story 1.3 or Story 1.4. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`]

### Canonical Decisions Already Known

- `/chat` is the approved-onboarded member app center. Approved onboarded users should consistently route to `/chat`. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]
- Approved-not-onboarded users should route to `/onboarding`. Pending/refused users should route to `/en-attente`. Refused users must not be silently redirected to login or trapped in a loop. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Experience Principles`]
- Non-admin users attempting admin access should fall back safely, preferably to `/chat` if approved. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]
- Private 1:1 DMs are not in the MVP roadmap. Non-admin private-channel creation should be treated as out of scope and blocked. [Source: user clarification during Story 1.1 review; Source: `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`; Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- Legal pages are expected to be public because FR2 requires visitors to access legal and terms pages from the public site. Current middleware behavior may not match this expectation. [Source: `_bmad-output/planning-artifacts/epics.md#Functional Requirements`; Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- `/api/geo/cities` is expected to support authenticated approved-not-onboarded onboarding flows. It does not need to be public for logged-out users unless a future public form uses it. [Source: `src/app/onboarding/page.tsx`; Source: `src/app/api/geo/cities/route.ts`; Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- Sponsor authority for MVP is referral/context support only. Admin admission remains the expected approval boundary; sponsor-driven `profiles.status = "approved"` is a hardening input for Story 1.3. [Source: `_bmad-output/planning-artifacts/prd.md#Technical Success`; Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- Chat media should be treated as private community data. If `chat-images` cannot be proven member/private, beta media upload should be disabled or treated as launch-blocked until storage policy is defined. [Source: `_bmad-output/planning-artifacts/prd.md#Domain-Specific Requirements`; Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- UI hiding is not a security boundary. Expectations must account for direct route, direct query/Data API, API, storage, and realtime paths where they exist. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`; Source: `_bmad-output/planning-artifacts/prd.md#Technical Success`]

### Required Matrix Shape

Use this minimum schema for each row in `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`:

| Surface | User state / actor | Expected behavior | Observed behavior | Evidence source | Decision status | Implementation status | Finding / follow-up | Owner decision needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

Suggested labels:

- Expected behavior: `expected allow`, `expected deny`, `expected redirect`, `expected explicit-status`, or a short precise sentence.
- Decision status: `decided`, `requires owner decision`, or `blocked by schema/runtime uncertainty`.
- Implementation status: `verified`, `unverified`, `confirmed bypass`, `unsupported by schema`, `accepted beta risk candidate`, or `not applicable`.

Do not blur expectation and implementation. Example: the expectation may be `pending users deny message reads`; current implementation may be `verified locally by RLS` or `blocked by F-01 production mismatch`. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Data Access and RLS Matrix`]

### Previous Story Intelligence

Story 1.1 completed a documentation-only access/security audit and is now `done`. It created `_bmad-output/implementation-artifacts/1-1-access-security-audit.md` and moved sprint tracking for Story 1.1 to `done`. [Source: `_bmad-output/implementation-artifacts/1-1-audit-route-data-admin-api-and-realtime-authorization-boundaries.md#Dev Agent Record`; Source: `_bmad-output/implementation-artifacts/sprint-status.yaml`]

Story 1.1 review made these important corrections that Story 1.2 must preserve:

- F-06 is not conditional anymore: private DMs are not in the MVP roadmap, so non-admin private-channel creation remains blocker-level. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- Local findings and production confidence must stay separated. F-02 through F-07 are confirmed in local migrations/source, while production confirmation is blocked until F-01 is resolved. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Executive Summary`; Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- Search evidence is preserved in Story 1.1 and should be reused rather than repeating open-ended discovery. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Reproducible Search Scope Notes`]
- Story 1.1 identified no local SQL views, multiple local triggers, multiple local SQL functions, and `SECURITY DEFINER` functions in exposed `public`. Story 1.2 should include expectations only where those objects affect access decisions. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Functions, Views, and Triggers Coverage`]

### Story 1.1 Findings to Consume

Launch blockers:

- F-01: Connected Supabase project does not match local app schema; production inspection showed only `francophone_pack_members` and migration `001 francophone_pack_members`. This blocks production confidence. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-02: Local `profiles` own-update RLS can permit self-approval/admin/access escalation through direct Data API. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-03: Sponsor policy and client path can approve requester `profiles.status` from the browser, bypassing admin admission if active. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-04: Local `messages` INSERT policy does not check private-channel membership or channel write permission. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-05: Local `channel_members` INSERT policy allows arbitrary membership creation by approved users. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-06: Local `channels` INSERT permits approved users to create private channels even though private DMs are out of MVP scope. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-07: `chat-images` storage policy coverage is unverified from audited local migrations and the connected Supabase target. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]

Accepted beta risk candidates or follow-up inputs:

- F-08: Admin actor/timestamp attribution is incomplete. Decide if Story 1.4 risk documentation is enough. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-09: `chat_banned` and `chat_muted_until` are written by admin actions but not enforced in chat send/read paths found by source inspection. Story 1.2 must define the expected enforcement model. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-10: `message_reactions` realtime subscription exists, but local migrations do not add that table to realtime publication. Treat realtime reaction updates as non-blocking unless chat read/send relies on them. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-11: Legal routes exist but are not in the middleware public allowlist. Story 1.2 should define legal pages as expected public and record the current mismatch as follow-up. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-12: `/api/geo/cities` access expectation is unclear because middleware does not make `/api/*` public. Story 1.2 should define it as auth/onboarding-compatible support data and record any mismatch or owner-facing impact. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-13: `src/lib/types/database.ts` is hand-maintained and not a full generated Supabase `Database` type. Treat as follow-up unless it blocks matrix certainty. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]
- F-14: Local migrations include `SECURITY DEFINER` functions in `public`; review during database hardening. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`]

### Current Source Behavior to Reference

Route and status boundaries:

- `src/lib/supabase/middleware.ts`: public allowlist is `/`, `/connexion`, `/inscription`, `/en-attente`, `/rejoindre`, and `/auth/*`; unauthenticated protected access redirects to `/connexion`; rejected users redirect to `/en-attente` except `/en-attente` and `/connexion`; pending users redirect to `/en-attente`; approved-not-onboarded users redirect to `/onboarding`; approved-onboarded users on public/auth/status routes redirect to `/chat`. [Source: `src/lib/supabase/middleware.ts:38-102`]
- `src/app/(app)/layout.tsx`: protected app layout redirects missing user/profile to `/connexion`, pending/rejected to `/en-attente`, approved-not-onboarded to `/onboarding`, and otherwise renders `AppShell`. [Source: `src/app/(app)/layout.tsx:11-42`]
- `src/app/onboarding/page.tsx`: requires user/profile, rejects non-approved users to `/en-attente`, redirects completed users to `/chat`, and loads profile/specialty/member/country data needed by onboarding. [Source: `src/app/onboarding/page.tsx:5-75`]
- `src/app/(auth)/en-attente/page.tsx`: requires auth, shows explicit rejected/refused copy for `status === "rejected"`, redirects approved users to `/chat` or `/onboarding`, and otherwise shows pending/sponsorship state. [Source: `src/app/(auth)/en-attente/page.tsx:10-180`]
- `src/app/(app)/admin/layout.tsx`: requires authenticated user, selects `profiles.is_admin`, and redirects non-admins to `/chat`. [Source: `src/app/(app)/admin/layout.tsx:9-26`]
- `src/app/auth/callback/route.ts`: exchanges OAuth code, defaults to `/chat`, routes approved users to `/chat` or `/onboarding`, otherwise writes referral/sponsorship data where applicable and routes to `/en-attente`. [Source: `src/app/auth/callback/route.ts:8-136`]

Data/API/realtime/sensitive mutations:

- `src/app/(app)/admin/actions.ts`: `approveUser`, `rejectUser`, `muteUser`, `unmuteUser`, `banFromChat`, and `unbanFromChat` all check authenticated admin in app code before updating `profiles`. [Source: `src/app/(app)/admin/actions.ts:5-113`]
- `src/app/(app)/chat/layout.tsx`: server-loads public channels, private DM memberships/channels, approved members, and initial messages. Private DM support exists in code even though it is outside MVP roadmap. [Source: `src/app/(app)/chat/layout.tsx:15-123`]
- `src/components/chat/chat-store.tsx`: client reads messages/reactions, subscribes to `messages` INSERT/UPDATE by channel, subscribes to `message_reactions`, and loads older messages. [Source: `src/components/chat/chat-store.tsx:75-245`]
- `src/components/chat/message-input.tsx`: client inserts directly into `messages`, uploads directly to `chat-images`, uses public URLs, and sends mention notifications. [Source: `src/components/chat/message-input.tsx:38-83`; Source: `src/components/chat/message-input.tsx:182-207`]
- `src/components/sponsorship/parrainages-tabs.tsx`: sponsor UI can update `sponsorship_requests.status` and requester `profiles.status = "approved"` from the browser. Story 1.2 should define sponsor authority before Story 1.3 hardens this. [Source: `src/components/sponsorship/parrainages-tabs.tsx:47-74`]
- `src/components/membres/member-profile.tsx`: private DM button can insert `channels` and `channel_members` from the browser. Story 1.2 should state this is outside MVP scope and expected to be blocked. [Source: `src/components/membres/member-profile.tsx:85-160`]
- `src/app/api/geo/cities/route.ts`: route handler returns city suggestions from remote APIs, static fallback, and Supabase fallback `countries`/`cities`; no explicit route-local auth check. Middleware currently decides whether `/api/*` is public. [Source: `src/app/api/geo/cities/route.ts:363-416`; Source: `src/lib/supabase/middleware.ts:38-54`]

### Architecture and Framework Guardrails

- Active stack: Next.js `16.2.1`, React `19.2.4`, TypeScript strict mode, Tailwind CSS 4, Vitest, ESLint, `@supabase/ssr ^0.9.0`, and `@supabase/supabase-js ^2.100.1`. [Source: `package.json`; Source: `_bmad-output/project-context.md#Technology Stack & Versions`]
- Use existing Supabase helpers only: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, and `src/lib/supabase/middleware.ts`. Do not introduce ad hoc clients or alternate env names. [Source: `_bmad-output/project-context.md#Technical Implementation Rules`; Source: `_bmad-output/planning-artifacts/architecture.md#Technical Constraints & Dependencies`]
- Do not introduce GraphQL, tRPC, Prisma, Drizzle, a separate REST backend, dedicated WebSocket service, Redux, Zustand, or a new design system for this MVP story. [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`; Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]
- If runtime route, redirect, middleware/proxy, Server Action, Route Handler, or caching behavior is re-scoped into this story, the developer must first read the relevant installed Next.js 16 docs in `node_modules/next/dist/docs/`. This should not normally be needed for Story 1.2. [Source: `AGENTS.md`; Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]
- Supabase/database actions are production-impacting. Inspect before writes, avoid writes by default, and never run destructive SQL without explicit approval and rollback confidence. Story 1.2 should not perform Supabase writes. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`]

### UX Requirements Relevant to the Matrix

- Admission status screens must clearly explain pending, refused/rejected, approved-but-onboarding-required, logged-out/auth error, and blocked/no-access states. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Experience Principles`; Source: `_bmad-output/planning-artifacts/epics.md#UX Design Requirements`]
- Pending and refused states must feel intentional and explicit rather than like broken routing. Refused copy should avoid database terminology such as `rejected`. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Desired Emotional Response`; Source: `_bmad-output/planning-artifacts/epics.md#UX Design Requirements`]
- Approved members should land naturally in `/chat`, and every approved-member path should make chat feel like the app home rather than a dashboard, forum, or directory. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Experience Principles`; Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]
- Legal/public pages must not expose private member content, profiles, chat messages, admin screens, or admission data. [Source: `_bmad-output/planning-artifacts/prd.md#SEO Strategy`; Source: `_bmad-output/planning-artifacts/prd.md#Domain-Specific Requirements`]

### Verification Guidance

`package.json` has no `test` script. Use `npx vitest run ...` directly for tests. [Source: `package.json`]

Known verification state from Story 1.1:

- `npm run lint` failed with 95 baseline lint problems across runtime files. Story 1.2 should record this as baseline if unchanged. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Verification Outcomes`]
- `npx vitest run src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts` passed 2 files and 12 tests during Story 1.1. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Verification Outcomes`]
- `npx vitest run` failed on baseline `src/__tests__/profile-utils.test.ts` availability-label assertions. Do not treat that as Story 1.2-caused unless runtime code changes unexpectedly occur. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Verification Outcomes`]

Relevant tests:

- `src/__tests__/mvp-route-cleanup.test.ts`: source-inspection coverage for `/chat` defaults, admin fallback to `/chat`, hidden legacy navigation, channel proposal hiding, and explicit refused state. [Source: `src/__tests__/mvp-route-cleanup.test.ts`]
- `src/__tests__/auth-url.test.ts`: OAuth callback URL behavior and public origin selection. [Source: `src/__tests__/auth-url.test.ts`]
- `src/__tests__/profile-utils.test.ts`: baseline failing test file from Story 1.1 full Vitest run. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Verification Outcomes`]

### Project Structure Notes

- Story file belongs at `_bmad-output/implementation-artifacts/1-2-define-and-verify-the-mvp-access-matrix.md`.
- Expected matrix artifact belongs at `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`.
- Do not modify `src/`, `supabase/`, package files, generated types, or tests for this story unless owner explicitly re-scopes it.
- If a future implementation story changes route or access behavior, preserve current organization: routes under `src/app`, protected routes under `(app)`, auth-facing routes under `(auth)`, components under `src/components`, Supabase helpers under `src/lib/supabase`, tests under `src/__tests__`, and migrations under `supabase/migrations`. [Source: `_bmad-output/planning-artifacts/architecture.md#Architectural Decisions Provided by Foundation`]

### Git Intelligence Summary

Recent work before Story 1.2 includes MVP routing alignment and Story 1.1 audit finalization. Useful patterns:

- Existing route expectations are tested through source-inspection tests in `src/__tests__/mvp-route-cleanup.test.ts`; they are useful for verification evidence but do not prove runtime authorization. [Source: recent commits `feat: align MVP routing with chat`, `Fix: auth and chat redirection`; Source: `src/__tests__/mvp-route-cleanup.test.ts`]
- BMad implementation artifacts are the active source of truth after Speckit migration; do not update retired Speckit specs for Story 1.2. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: recent branch merge into `dev`]
- Documentation-only stories should record baseline failures rather than attempting opportunistic runtime cleanup. [Source: `_bmad-output/implementation-artifacts/1-1-audit-route-data-admin-api-and-realtime-authorization-boundaries.md#Completion Notes List`]

### References

- `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`
- `_bmad-output/planning-artifacts/epics.md#Story 1.2: Define and Verify the MVP Access Matrix`
- `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`
- `_bmad-output/planning-artifacts/prd.md#Technical Success`
- `_bmad-output/planning-artifacts/prd.md#Domain-Specific Requirements`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Technical Constraints & Dependencies`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Experience Principles`
- `_bmad-output/implementation-artifacts/1-1-access-security-audit.md`
- `_bmad-output/implementation-artifacts/1-1-audit-route-data-admin-api-and-realtime-authorization-boundaries.md`
- `src/lib/supabase/middleware.ts`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/admin/layout.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/(auth)/en-attente/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/api/geo/cities/route.ts`
- `src/app/(app)/admin/actions.ts`
- `src/app/(app)/chat/layout.tsx`
- `src/components/chat/chat-store.tsx`
- `src/components/chat/message-input.tsx`
- `src/components/sponsorship/parrainages-tabs.tsx`
- `src/components/membres/member-profile.tsx`
- `src/__tests__/mvp-route-cleanup.test.ts`
- `src/__tests__/auth-url.test.ts`
- `package.json`

## Change Log

| Date | Change |
| --- | --- |
| 2026-05-02 | Created comprehensive Story 1.2 developer guide for the MVP access matrix. |
| 2026-05-02 | Implemented Story 1.2: created canonical MVP access matrix artifact, defined all user states, route/layout/data/admin/API/storage/realtime expectations, mapped all F-01 through F-14 findings, recorded verification outcomes (lint: 95 baseline; vitest targeted: 12/12 pass; vitest full: 33/36 pass, 3 baseline failures). Status: review. |
| 2026-05-02 | Addressed code review findings: resolved verification placeholders, incomplete-profile/request state, suspended/removed expectations, legal-route contradictions, geo API inconsistency, and unsupported status label. Status: done. |

## Dev Agent Record

### Agent Model Used

gpt-5.5

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Canonical MVP access matrix created at `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md` covering:
  - 10 canonical user states with explicit profile field definitions
  - 50+ route matrix entries across public, auth, legal, onboarding, app, and admin surfaces
  - 30+ data/RLS expectation entries covering all local migration-backed tables
  - 15+ admin mutation and sensitive path expectations
  - 12+ API/storage/realtime expectations
  - Complete F-01 through F-14 finding map to Story 1.3/1.4/owner decisions
  - Story 1.3 hardening priority list refined with expectation decisions
  - Story 1.4 risk documentation inputs prepared
- Verification outcomes recorded:
  - `npm run lint`: 95 baseline problems (52 errors, 43 warnings) — unchanged from Story 1.1 baseline
  - `npx vitest run src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts`: 12/12 passed
  - `npx vitest run`: 33/36 passed; 3 failures in `profile-utils.test.ts` are baseline (availability label assertions), not story-caused
- Key decisions requiring owner confirmation:
  1. `chat-images` storage must have member/private policy defined, or media upload disabled before beta (F-07)
  2. Chat media public URLs mean anyone with URL can access images — must be member/private for beta
- No runtime code, routes, UI, Supabase files, dependencies, package locks, generated types, tests, or behavior were changed.

### File List

- `_bmad-output/implementation-artifacts/1-2-define-and-verify-the-mvp-access-matrix.md`
- `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
