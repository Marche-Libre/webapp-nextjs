# Story 2.6: Enforce Admission-State Route Boundaries

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the owner,
I want each admission state to be routed and blocked consistently,
so that pending, refused, logged-out, and non-member users cannot reach private app content.

## Acceptance Criteria

1. Given logged-out, authenticated-without-profile, profile-fetch-error, unknown-status, pending, refused/rejected, approved-not-onboarded, approved-onboarded non-admin, and approved-onboarded admin states, when each state attempts to access public/legal routes, auth entry routes, public non-private Route Handlers, `/en-attente`, `/onboarding`, `/chat`, `/chat/[slug]`, representative protected app routes, admin routes, and sensitive mutation/data paths, then each state receives the exact allow, deny, redirect, or explicit-status outcome from the MVP access matrix.
2. Pending, refused/rejected, logged-out, missing-profile, profile-fetch-error, unknown-status, and otherwise non-member users cannot access member-only routes, private community pages, channel data, message data, notifications, member/profile data, private chat subscriptions, sensitive Server Actions, or private Route Handlers.
3. Approved not-onboarded users reach `/onboarding` rather than `/chat` or other protected member content.
4. Approved onboarded users reach `/chat` as the primary member destination, including from public/auth/status entry routes.
5. Non-admin approved members who attempt admin routes or admin mutations fall back or fail safely, preferably to `/chat` for route navigation and an access-denied result for actions; admin users can reach admin routes and invoke admin mutations only when they also satisfy the approved/onboarded member boundary.
6. Verification distinguishes known baseline failures from regressions introduced by this story.

## Tasks / Subtasks

- [x] Confirm the MVP access matrix before editing runtime code (AC: 1, 2, 3, 4, 5)
  - [x] Read every file in `Current State of Files To Audit` and verify the current behavior still matches these notes.
  - [x] Encode the route matrix in notes or tests before changing behavior. Include at minimum: logged-out, authenticated-without-profile, profile-fetch-error, unknown status, pending, rejected, approved/not-onboarded, approved/onboarded non-admin, and approved/onboarded admin.
  - [x] Cover route groups: public landing/legal/access routes, auth entry routes, public/non-private Route Handlers such as `/api/geo/cities`, `/en-attente`, `/onboarding`, `/chat`, `/chat/[slug]`, representative `(app)` routes such as `/profil`, `/notifications`, `/membres`, `/forum`, `/tableau-de-bord`, `/parrainages`, `/admin`, and sensitive mutation/data paths.
  - [x] Treat unknown profile statuses as not approved. Do not add new database status values or migrations for `non-member`, `suspended`, or `removed` unless schema support is already present and story scope explicitly requires it.
  - [x] Treat profile fetch errors and missing/null profiles as separate matrix cases with exact expected redirects. Do not leave either case as "or" behavior in tests.
  - [x] Keep `/api/geo/cities` public if it continues to expose only non-private location suggestions; approved/not-onboarded users must be able to call it from onboarding.
  - [x] Preserve direct access to legacy protected routes for approved/onboarded users unless a later story authorizes hiding or removal.
- [x] Harden route-state decisions only where the matrix exposes a gap (AC: 1, 2, 3, 4)
  - [x] Keep `profiles.status === "approved"` plus `profiles.onboarding_completed === true` as the only member-app allow condition.
  - [x] Keep `profiles.status === "approved"` plus `onboarding_completed !== true` routed to `/onboarding`.
  - [x] Keep pending, rejected, missing-profile, unknown-status, logged-out, and otherwise non-member users out of `(app)` content and chat data.
  - [x] Preserve rejected/refused users seeing an explicit refused state at `/en-attente`; do not silently redirect them to `/connexion` except deliberate sign-in/out navigation that already exists.
  - [x] Preserve legal pages as public and outside app-home redirects.
  - [x] Avoid redirect loops among `/connexion`, `/en-attente`, `/onboarding`, and `/chat`.
- [x] Verify private data and mutation boundaries related to member access (AC: 2, 5)
  - [x] Inventory server-rendered Supabase reads that expose private member/chat/community data in `(app)` routes and confirm they are protected by `src/app/(app)/layout.tsx` plus RLS.
  - [x] Inventory browser Supabase reads/subscriptions in chat components and confirm they rely on database RLS, not client filtering, for unauthorized users.
  - [x] Inventory Server Actions and Route Handlers that could bypass page navigation. Do not rely on Proxy/middleware alone for sensitive actions.
  - [x] For admin-sensitive Server Actions and Route Handlers, verify the invoking user is authenticated, `profiles.is_admin === true`, `profiles.status === "approved"`, and `profiles.onboarding_completed === true`, or record concrete evidence that the specific path is not admission/member/admin sensitive.
  - [x] Do not defer a confirmed sensitive action bypass to Epic 4 unless this story records why it is outside the Story 2.6 admission/member/admin boundary and why it is not launch-blocking.
  - [x] Do not expose service-role keys, private credentials, policy internals, SQL details, private admission notes, or private chat data in logs or user-facing errors.
  - [x] Do not change Supabase migrations, generated types, package files, or production database state unless a confirmed access bypass cannot be fixed at the app guard layer and the owner explicitly approves the database scope.
- [x] Add focused guardrail tests (AC: 1, 2, 3, 4, 5, 6)
  - [x] Extend `src/__tests__/auth-session-middleware.test.ts` for the full route matrix, including authenticated no-profile, profile-fetch-error, unknown status, legal routes, auth routes, `/api/geo/cities`, `/en-attente`, `/onboarding`, `/chat`, `/chat/[slug]`, representative protected routes, and admin route attempts.
  - [x] Strengthen `src/__tests__/mvp-route-cleanup.test.ts` or add a focused access-matrix test under `src/__tests__` for protected layout default-deny behavior and admin fallback expectations.
  - [x] Preserve or strengthen `src/__tests__/authorization-hardening.test.ts` coverage for channel/message RLS and private DM/member-data guardrails if touching chat, Supabase migration expectations, or private data paths.
  - [x] Keep `src/__tests__/admission-profile-request.test.ts` passing if touching `/en-attente`, onboarding boundaries, admission form behavior, or pending/refused states.
  - [x] Add source-inspection checks only where behavior-level testing is impractical in this brownfield app; prefer behavior-level tests for route decisions.
- [x] Verify and record outcomes (AC: 6)
  - [x] Run targeted tests for changed files and record exact commands/outcomes in the Dev Agent Record.
  - [x] Run targeted lint on changed runtime/test files if practical.
  - [x] If running full `npx vitest run`, classify the known `src/__tests__/profile-utils.test.ts` availability-label failures as baseline unless this story changes profile utility behavior.
  - [x] Do not claim production Supabase, live X OAuth, realtime, or manual browser verification unless actually performed.
  - [x] Record changed files, matrix tests added, gaps fixed, intentionally deferred risks, exact commands run, and baseline failures in the Dev Agent Record.

## Dev Notes

### Story Scope

Story 2.6 is the Epic 2 matrix-enforcement story. It verifies and hardens the state-based boundary across signed-out, authenticated-without-profile, profile-fetch-error, unknown-status, pending, refused, approved-not-onboarded, approved-onboarded non-admin, and approved-onboarded admin states. It covers route navigation, public non-private Route Handlers needed by admission/onboarding, sensitive mutation paths, and private data paths only where they enforce the same admission/member/admin boundary. It is not a broad redesign, route deletion story, admin workflow story, chat feature story, or Supabase schema/RLS overhaul unless the matrix reveals a specific launch-blocking bypass that cannot be fixed locally. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.6: Enforce Admission-State Route Boundaries`; Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]

Epic 2 has already established closed-beta entry, X sign-in, admission/profile capture, explicit pending/refused status handling, and approved-user onboarding/chat routing. This story must preserve those behaviors while proving the whole state matrix is consistent. [Source: `_bmad-output/planning-artifacts/epics.md#Epic 2: Private Club Entry, Identity, and Admission`; Source: `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md`; Source: `_bmad-output/implementation-artifacts/2-4-show-explicit-pending-and-refused-admission-states.md`; Source: `_bmad-output/implementation-artifacts/2-5-route-approved-users-through-onboarding-or-into-chat.md`]

### MVP Access Matrix Contract

Use this matrix as the implementation and test target unless a code audit exposes a documented conflict that must be resolved with the product owner.

| State | Public/legal routes | Auth entry routes | Public non-private Route Handlers such as `/api/geo/cities` | `/en-attente` | `/onboarding` | `/chat` and protected member routes | `/admin` routes | Sensitive actions/private data paths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Logged out | Allowed | Allowed | Allowed when handler is explicitly public/non-private | Redirects to `/connexion` from the page guard | Redirects to `/connexion` | Redirects to `/connexion` | Redirects to `/connexion` | Denied; no private data |
| Authenticated, no profile row | Legal allowed; no member redirect loop | Redirects to `/connexion` for sign-in/profile recovery unless the OAuth callback deliberately routes first-time users to `/en-attente` | Allowed when handler is explicitly public/non-private | Redirects to `/connexion` from current page guard unless changed deliberately | Redirects to `/connexion` | Redirects to `/connexion` | Redirects to `/connexion` | Denied; no private data |
| Profile fetch error | Legal allowed; no member redirect loop | Route to sign-in/recovery without loops | Allowed when handler is explicitly public/non-private | Redirects to `/connexion` from current page guard | Redirects to `/connexion` | Redirects to `/connexion` | Redirects to `/connexion` | Denied; no private data; log only safe diagnostics |
| Unknown profile status | Legal allowed | Redirects to `/en-attente`, not member app | Allowed when handler is explicitly public/non-private | Shows pending/manual-review style state; no member data | Redirects to `/en-attente` | Redirects to `/en-attente`; no member data | Redirects to `/en-attente` | Denied; no private data |
| Pending | Legal allowed | Non-legal app/auth/access entry routes to `/en-attente` | Allowed when handler is explicitly public/non-private | Shows explicit pending/manual-review state | Redirects to `/en-attente` | Redirects to `/en-attente`; no member data | Redirects to `/en-attente` | Denied; no private data |
| Refused/rejected | Legal allowed | Refused status remains explicit; `/connexion` may remain reachable for deliberate user action | Allowed when handler is explicitly public/non-private | Shows explicit refused state, not database terminology | Redirects to `/en-attente` | Redirects to `/en-attente`; no member data | Redirects to `/en-attente` | Denied; no private data |
| Approved, not onboarded | Legal allowed | Entry routes redirect to `/onboarding` | Allowed, including `/api/geo/cities` for onboarding city search | Redirects to `/onboarding` | Allowed | Redirects to `/onboarding`; no member app shell/chat | Redirects to `/onboarding` before admin shell | Denied for member/admin-sensitive actions except scoped current-profile onboarding updates |
| Approved, onboarded, non-admin | Legal allowed | Entry routes redirect to `/chat` | Allowed when handler is explicitly public/non-private | Redirects to `/chat` | Redirects to `/chat` | Allowed | Redirects safely to `/chat` | Member actions allowed only through authorized paths; admin actions denied |
| Approved, onboarded, admin | Legal allowed | Entry routes redirect to `/chat` | Allowed when handler is explicitly public/non-private | Redirects to `/chat` | Redirects to `/chat` | Allowed | Allowed | Admin actions allowed only after authenticated + approved + onboarded + admin checks |

For no-profile, profile-fetch-error, and unknown-status cases, the minimum security requirement is fail-closed: no private app content, no channel/message data, no sensitive mutation access, and no redirect loop. Current UX may remain imperfect if it is safe, but the dev agent must make the expected route outcome deterministic in tests before changing product flow. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`; Source: `_bmad-output/planning-artifacts/prd.md#Functional Requirements`; Source: `_bmad-output/planning-artifacts/prd.md#Non-Functional Requirements`]

### Product and UX Requirements

The PRD requires signed-out users to access only public/auth-appropriate routes, approved users to route by onboarding state, and the system to distinguish and route pending, approved, refused, and approved-not-onboarded users. It also requires pending, refused, logged-out, and non-member users to be blocked from member-only routes, channel data, message data, private community pages, direct queries, APIs, and realtime/private data paths. [Source: `_bmad-output/planning-artifacts/prd.md#Functional Requirements`; Source: `_bmad-output/planning-artifacts/prd.md#Non-Functional Requirements`]

UX guidance is explicit-state first: pending, refused, onboarding, approved, blocked, and admin states must not feel like broken routing. Approved users should not be trapped in onboarding loops, approved onboarded users should naturally land in `/chat`, and non-admin admin attempts should fall back safely, preferably to `/chat` for approved members. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Navigation Patterns`]

### Architecture Compliance

Active stack and constraints:

- Next.js `16.2.1` App Router with React `19.2.4`.
- TypeScript strict mode with `@/*` imports from `src`.
- Supabase via `@supabase/ssr ^0.9.0` and `@supabase/supabase-js ^2.100.1`.
- Existing Supabase helpers are mandatory: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, and `src/lib/supabase/middleware.ts`.
- App routes live under `src/app`; protected routes use `(app)` and auth-facing routes use `(auth)`.
- Tests live under `src/__tests__`.
- Do not add dependencies, package-lock churn, generated type changes, Supabase migrations, production SQL, or destructive database operations for this story without explicit owner approval.

[Source: `_bmad-output/project-context.md#Technology Stack & Versions`; Source: `_bmad-output/project-context.md#Technical Implementation Rules`; Source: `_bmad-output/planning-artifacts/architecture.md#Technical Constraints & Dependencies`; Source: `package.json`]

Authorization is layered:

- Middleware/proxy/session refresh keeps auth state current.
- Server-side route guards route by auth, admission, onboarding, and role state.
- Server Actions, Route Handlers, and RPCs enforce sensitive mutation authorization.
- Supabase RLS is the final boundary for database reads/writes and realtime paths.
- UI hiding is only convenience; it is never security.

[Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]

Canonical admission reasoning states are logged out, authenticated with no profile or incomplete request, pending, refused/rejected, approved but not onboarded, approved and onboarded, suspended/removed if supported by schema, plus admin/non-admin overlays. Route and access decisions must derive from this state machine. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`; Source: `_bmad-output/planning-artifacts/architecture.md#State Management Patterns`]

### Next.js 16 Guardrails

Read installed Next.js 16 docs before changing route, redirect, middleware/proxy, Route Handler, Server Action, or caching behavior.

- Middleware is now documented as Proxy; the project still has `middleware.ts`, but docs call the concept Proxy.
- Proxy can perform request-aware redirects and runs before route rendering, but it is not a full session-management or authorization solution.
- Proxy matchers must be constants; matcher mistakes can silently change coverage.
- Server Functions are POST requests to the route where they are used, not separate routes. Do not rely on Proxy/middleware alone for sensitive Server Actions.
- `redirect()` in Server Components throws `NEXT_REDIRECT`, terminates rendering of that route segment, and uses a temporary `307` by default.

[Source: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`]

### Current State of Files To Audit

`src/lib/supabase/middleware.ts`

- Current state: Refreshes Supabase session with `@supabase/ssr`, defines legal/public routes, redirects signed-out protected requests to `/connexion`, reads `profiles(status,onboarding_completed)`, routes rejected users to `/en-attente` except `/connexion`, routes pending and missing/unknown-profile-like states to `/en-attente`, routes approved/not-onboarded users to `/onboarding`, and routes approved/onboarded users from entry/status routes to `/chat`. Legal routes bypass authenticated app-home redirects.
- What this story may change: Add explicit handling/tests for null profile, profile query errors, unknown statuses, `/onboarding`, `/chat/[slug]`, legal routes, public non-private Route Handlers such as `/api/geo/cities`, and admin route attempts if the matrix reveals gaps.
- Preserve: Legal pages public, `/chat` approved/onboarded destination, `/onboarding` approved/not-onboarded destination, `/en-attente` pending/refused boundary, signed-out protected redirect to `/connexion`, security headers, and existing Supabase middleware helper pattern.

`middleware.ts`

- Current state: Root middleware delegates to `updateSession()` and applies a matcher that excludes static/image asset paths but does not exclude `api`.
- What this story may change: May need explicit public non-private Route Handler handling so `/api/geo/cities` remains usable by approved/not-onboarded users during onboarding. If matcher/proxy behavior changes, re-check Next.js 16 Proxy docs and add matcher coverage.
- Preserve: Single root middleware/proxy entry and existing session-refresh delegation.

`src/app/(app)/layout.tsx`

- Current state: Server protected layout reads current user/profile with `src/lib/supabase/server.ts`, redirects missing user/profile to `/connexion`, redirects any `profile.status !== "approved"` to `/en-attente`, redirects approved users with `onboarding_completed !== true` to `/onboarding`, and renders `AppShell` only after approved/onboarded state.
- What this story may change: Usually only tests. If a gap appears, keep the default-deny condition at this central protected boundary.
- Preserve: `AppShell` must never render for pending, rejected, missing-profile, unknown-status, logged-out, or approved/not-onboarded users.

`src/app/(app)/admin/layout.tsx`

- Current state: Nested under the protected `(app)` layout. It reads `is_admin` for the current user and redirects non-admin users to `/chat`.
- What this story may change: Add tests/source checks for approved/onboarded non-admin fallback and approved/onboarded admin access. If touching admin checks, keep using the server Supabase helper and fail closed.
- Preserve: Admin routes stay protected by both the parent member boundary and an admin role boundary. Do not expand admin workflow scope into Epic 4 unless required for the route/action matrix.

`src/app/auth/callback/route.ts`

- Current state: Exchanges the X OAuth code, writes Supabase cookies to the final response, reads `profiles(status,onboarding_completed)`, routes approved users to `/chat` or `/onboarding`, routes non-approved/missing-profile users to `/en-attente`, and handles `ml-referral` for non-approved users.
- What this story may change: Usually nothing unless callback routing conflicts with the matrix.
- Preserve: Cookie write behavior, X OAuth exchange, referral handling, no service-role key, no route decisions based on X metadata, sponsor state, referral cookies, or profile field presence.

`src/app/(auth)/en-attente/page.tsx`

- Current state: Authenticated status boundary. Signed-out users redirect to `/connexion`; profile fetch failure/missing profile redirects to `/connexion`; rejected users see explicit refused UI; approved users redirect to `/chat` or `/onboarding`; pending users see manual-review/admission form and sponsorship flows.
- What this story may change: Possibly missing-profile/no-usable-profile handling if the matrix requires a clearer fail-closed status. Avoid copy churn unless needed for a route-loop or state clarity bug.
- Preserve: Story 2.4 explicit refused/pending UX, Story 2.3 admission/profile form scope, sponsor/parrain flows, no member data exposure to pending/refused users.

`src/app/onboarding/page.tsx`

- Current state: Server page for approved/not-onboarded users. It redirects signed-out or missing-profile users to `/connexion`, non-approved users to `/en-attente`, and onboarded users to `/chat`; then fetches onboarding support data, approved member count, sponsor info, approved member previews, and countries before rendering `OnboardingWizard`.
- What this story may change: Usually tests only. If changing, preserve the approved-only onboarding boundary and do not broaden member-data exposure.
- Preserve: Non-approved users cannot access onboarding; approved/onboarded users redirect to `/chat`; use the server Supabase helper; no onboarding redesign.

`src/components/onboarding/onboarding-wizard.tsx`

- Current state: Active client onboarding flow rendered by `src/app/onboarding/page.tsx`; on completion it updates current profile fields, sets `onboarding_completed: true`, creates a notification linking to `/chat`, and hard-redirects to `/chat`.
- What this story may change: Usually nothing unless loop tests fail.
- Preserve: `/chat` post-completion destination, scoped current-profile updates, no status/admin/access-sensitive mutations.

`src/app/(app)/chat/layout.tsx`

- Current state: Nested under protected `(app)` layout. It reads current user/profile, public channels, private DM channel memberships, approved members, and initial messages for the default channel before rendering `ChatLayout`.
- What this story may change: Usually tests/documentation only. If a bypass is found, fix through central route guard or RLS-aligned checks rather than client filtering.
- Preserve: Parent `(app)` layout remains the first member boundary; channel/message access must also be enforced by RLS.

`src/app/(app)/chat/page.tsx` and `src/app/(app)/chat/[slug]/page.tsx`

- Current state: Client pages; base `/chat` renders through layout defaults, and `[slug]` updates active channel in `ChatChannelProvider`.
- What this story may change: Usually nothing.
- Preserve: `/chat` and `/chat/[slug]` are canonical chat surfaces; do not reintroduce `/forum` or `/membres` as member home.

`src/components/chat/chat-store.tsx`, `src/components/chat/chat-full-page.tsx`, and `src/components/chat/message-input.tsx`

- Current state: Browser Supabase client fetches/searches messages, reactions, mention suggestions, sends messages, and subscribes to realtime. These components assume the user has already passed the member route boundary and depend on Supabase RLS for direct data/subscription security.
- What this story may change: Usually nothing unless a direct client data leak is confirmed. Do not use client-side filtering as the security boundary.
- Preserve: Existing browser helper, no service-role key, no public storage image upload regression, mention notifications only after successful message insert.

Representative protected route files under `src/app/(app)`

- Current state: Routes such as `/profil`, `/notifications`, `/membres`, `/membres/[id]`, `/forum`, `/forum/*`, `/tableau-de-bord`, and `/parrainages` are protected by the parent `(app)` layout. Several child pages also call `getUser()` and query private/profile/forum/member data.
- What this story may change: Usually no child-route edits unless route-matrix tests show private data can render before the parent guard.
- Preserve: Legacy routes may remain directly accessible to approved/onboarded users; they must not be exposed to non-members.

`src/app/(app)/admin/actions.ts`

- Current state: Server Actions verify authenticated user and `profiles.is_admin` before admission/admin/chat moderation mutations. `verifyAdmin()` does not itself check `status` or `onboarding_completed`; parent route protection may not cover all Server Function invocation paths.
- What this story may change: Inventory whether the action checks create an admission/member/admin boundary bypass. Harden sensitive admin actions in this story if they can be invoked without the approved/onboarded member boundary. A follow-up is acceptable only with concrete evidence that the specific action is outside Story 2.6's admission/member/admin boundary and is not launch-blocking.
- Preserve: Existing server Supabase helper, no client admin mutation, no service-role key, no broad admin workflow redesign.

`src/app/api/geo/cities/route.ts`

- Current state: Public city suggestion Route Handler used by onboarding/profile location UX. It reads public/fallback country/city data, not private member/chat/admission data.
- What this story may change: Add explicit middleware/matcher coverage so the route remains reachable when it exposes only public location suggestions, especially for approved/not-onboarded users in onboarding. Do not auth-gate it unless privacy analysis finds private data exposure.

`supabase/migrations/20260503065247_harden_authorization_boundaries.sql`

- Current state: Local migration hardens sensitive profile fields, channel read/write permissions, message read/write policies, private channel membership creation, message unsafe updates, chat bans/mutes, and admin-only policy paths. The migration header says production application is blocked until the connected Supabase target matches this app schema.
- What this story may change: Usually nothing. Use it as local/RLS guardrail context and verify tests, but do not assume production parity without Supabase inspection/owner-approved DB work.
- Preserve: No destructive database changes or migration churn without explicit scope approval.

`src/__tests__/auth-session-middleware.test.ts`

- Current state: Behavior tests cover approved/onboarded entry redirects to `/chat`, approved/not-onboarded redirects to `/onboarding`, pending/rejected protected-route redirects to `/en-attente`, signed-out `/rejoindre` public access, signed-out protected redirect to `/connexion`, and approved/onboarded protected access.
- What this story should change: Expand to the full matrix, especially authenticated no-profile, profile-fetch-error, unknown status, legal routes, auth routes, `/api/geo/cities`, `/en-attente`, `/onboarding`, `/chat/[slug]`, representative protected routes, and admin route attempts.
- Preserve: Existing pending/refused/signed-out/approved expectations.

`src/__tests__/mvp-route-cleanup.test.ts`

- Current state: Source-inspection guardrails for `/chat` defaults, onboarding loop prevention, protected layout default-deny, pending/refused explicit states, public legal routes, hidden legacy navigation, and parked feature promises.
- What this story may change: Add/strengthen source-inspection coverage for matrix invariants that are hard to behavior-test, including admin fallback and central protected-layout default-deny behavior.
- Preserve: `/chat` member home, explicit `/en-attente`, legal route carve-outs, no forum/annuaire default-member-home regression.

`src/__tests__/authorization-hardening.test.ts`

- Current state: Source/migration guardrails for sponsorship/admin-sensitive profile fields, channel read/write permission checks, chat write/private-channel policies, no client-side private DM creation, no public chat image upload, and notifications after successful message insert.
- What this story may change: Run or extend if touching chat, migration expectations, private data paths, direct client Supabase access patterns, or admin-sensitive Server Action authorization.
- Preserve: Existing local security guardrails and no schema churn.

### Data and Security Boundaries

Admission state source of truth is `profiles.status`, currently typed locally as `pending`, `approved`, and `rejected`. Onboarding source of truth is `profiles.onboarding_completed === true`. Approved-member access requires both `status === "approved"` and `onboarding_completed === true`; approved-but-not-onboarded access is limited to onboarding/profile completion. [Source: `src/lib/types/database.ts`; Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`]

Do not infer member access from X metadata, referral cookies, sponsor presence, `sponsor_approved`, profile field completeness, user-owned client state, invitation context, or optimistic UI. Those can support display/admission review only. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`; Source: `_bmad-output/implementation-artifacts/2-4-show-explicit-pending-and-refused-admission-states.md#Anti-Patterns To Avoid`; Source: `_bmad-output/implementation-artifacts/2-5-route-approved-users-through-onboarding-or-into-chat.md#Data and Security Boundaries`]

Private chat/channel/message protection must be layered. Route guards prevent page rendering; Supabase RLS must prevent direct browser queries, Server Actions, Route Handlers, and realtime paths from exposing data to unauthorized users. Sensitive admin actions must enforce the admin role and the approved/onboarded member boundary outside navigation, because Server Functions can be invoked as POST requests and must not depend only on parent layouts. If local migrations/tests and production schema are not known to match, document that as a launch risk rather than pretending verification happened. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`; Source: `_bmad-output/planning-artifacts/prd.md#Non-Functional Requirements`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`]

### Previous Story Intelligence

Story 2.5 completed approved-user routing hardening:

- Tightened `src/app/(app)/layout.tsx` so protected app content renders only for approved/onboarded profiles.
- Confirmed middleware, auth callback, `/en-attente`, and `/onboarding` already split approved users by trusted profile status/onboarding state.
- Clarified onboarding copy as approved-user setup work.
- Added middleware and source-inspection tests for approved/not-onboarded protected-route redirects, protected-layout default-deny behavior, and onboarding setup copy.

Do not undo those changes. Story 2.6 should build on them by expanding from approved-user routing to the complete access matrix. [Source: `_bmad-output/implementation-artifacts/2-5-route-approved-users-through-onboarding-or-into-chat.md#Completion Notes List`; Source: `_bmad-output/implementation-artifacts/2-5-route-approved-users-through-onboarding-or-into-chat.md#File List`]

Story 2.5 verification baseline:

- `npx vitest run src/__tests__/auth-session-middleware.test.ts src/__tests__/mvp-route-cleanup.test.ts` passed after implementation.
- `npx vitest run src/__tests__/admission-profile-request.test.ts` passed.
- Targeted lint on changed Story 2.5 files passed.
- Full `npx vitest run` failed only on known baseline `src/__tests__/profile-utils.test.ts` availability-label assertions.

[Source: `_bmad-output/implementation-artifacts/2-5-route-approved-users-through-onboarding-or-into-chat.md#Debug Log References`]

### Git Intelligence Summary

Recent commits before this story:

- `9521785 feat: route approved users through onboarding or chat`
- `a58dba1 feat: show explicit admission status states`
- `2eee16c feat: capture admission profile requests`
- `6f309cc fix: preserve returning session routing for rejoindre`
- `e33c9ea Merge pull request #30 from Marche-Libre/story/2-1-public-access-positioning`

Recent pattern: small brownfield changes, route/security guardrail tests under `src/__tests__`, no dependency/schema churn unless explicitly scoped, exact verification notes, and honest baseline/regression classification. [Source: `git log --oneline -5`; Source: `git show --name-status --oneline --stat 9521785`]

### Testing Requirements

Minimum targeted verification:

- `npx vitest run src/__tests__/auth-session-middleware.test.ts`
  - Required if changing `src/lib/supabase/middleware.ts`, root `middleware.ts`, route matrix behavior, or matcher assumptions.
  - Expand this test for authenticated no-profile, profile-fetch-error, unknown statuses, legal routes, auth routes, `/api/geo/cities`, `/en-attente`, `/onboarding`, `/chat/[slug]`, protected routes, and admin route attempts.
- `npx vitest run src/__tests__/mvp-route-cleanup.test.ts`
  - Required if changing `/chat` defaults, `/en-attente`, `/onboarding`, protected layout, admin fallback, legal route carve-outs, sidebar/logo defaults, or legacy route visibility.
- `npx vitest run src/__tests__/authorization-hardening.test.ts`
  - Required if touching chat data paths, client Supabase chat reads/writes/subscriptions, local RLS migration expectations, member-profile private data, or admin-sensitive mutation boundaries.
- `npx vitest run src/__tests__/admission-profile-request.test.ts`
  - Required if touching `/en-attente`, pending admission form behavior, profile request boundaries, or onboarding approved-only guards.
- `npx vitest run` can be useful after route/security work; classify the known `src/__tests__/profile-utils.test.ts` availability-label failures as baseline unless this story changes that area.
- Run targeted lint for changed runtime and test files, for example:
  - `npm run lint -- src/lib/supabase/middleware.ts middleware.ts src/__tests__/auth-session-middleware.test.ts src/__tests__/mvp-route-cleanup.test.ts`
  - Quote paths containing route groups, such as `'src/app/(app)/layout.tsx'`, when passing them through zsh.

### Anti-Patterns To Avoid

- Do not treat middleware/proxy as the only authorization boundary for private data, Server Actions, Route Handlers, or realtime.
- Do not leave no-profile, profile-fetch-error, or unknown-status outcomes ambiguous in tests.
- Do not route pending, rejected, missing-profile, unknown-status, logged-out, or non-member users to `/onboarding` as if they were approved.
- Do not route approved/not-onboarded users into `/chat`, `(app)` routes, chat data, or member shell.
- Do not break public non-private Route Handlers such as `/api/geo/cities` for onboarding users unless a privacy analysis proves the handler exposes private data.
- Do not let admin Server Actions rely only on `is_admin` if the invoking user can fail the approved/onboarded member boundary.
- Do not route refused users into a silent login loop; keep explicit refused copy at `/en-attente`.
- Do not route approved/onboarded users to `/forum`, `/membres`, `/tableau-de-bord`, or other parked surfaces as the default member home.
- Do not remove routes, legacy direct access for approved members, public legal pages, `/en-attente`, `/onboarding`, `/connexion`, `/inscription`, `/rejoindre`, `/chat`, or `/chat/[slug]`.
- Do not add schema migrations, generated types, dependencies, package-lock changes, production SQL, or destructive Supabase operations.
- Do not expose service-role keys, private credentials, private admission data, private profile details, or private chat content in client code/logs/errors.
- Do not rely on client-side filtering or UI hiding to block channel/message/member data.
- Do not cache authenticated admission/onboarding/member/admin data in a way that can stale-route or leak access.

### References

- `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`
- `_bmad-output/project-context.md#Technology Stack & Versions`
- `_bmad-output/project-context.md#Technical Implementation Rules`
- `_bmad-output/planning-artifacts/epics.md#Story 2.6: Enforce Admission-State Route Boundaries`
- `_bmad-output/planning-artifacts/prd.md#Functional Requirements`
- `_bmad-output/planning-artifacts/prd.md#Non-Functional Requirements`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`
- `middleware.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/admin/layout.tsx`
- `src/app/(app)/admin/actions.ts`
- `src/app/auth/callback/route.ts`
- `src/app/(auth)/en-attente/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/(app)/chat/layout.tsx`
- `src/components/chat/chat-store.tsx`
- `src/components/chat/chat-full-page.tsx`
- `src/components/chat/message-input.tsx`
- `src/lib/types/database.ts`
- `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`
- `src/__tests__/auth-session-middleware.test.ts`
- `src/__tests__/mvp-route-cleanup.test.ts`
- `src/__tests__/authorization-hardening.test.ts`
- `src/__tests__/admission-profile-request.test.ts`

## Change Log

| Date       | Change |
| ---------- | ------ |
| 2026-05-06 | Created comprehensive Story 2.6 developer guide for admission-state route-boundary enforcement. |
| 2026-05-06 | Refined story matrix for deterministic no-profile/error/unknown-status outcomes, public non-private Route Handler handling, and action-level admin boundary expectations. |
| 2026-05-06 | Implemented middleware/admin boundary hardening and full admission-state route matrix test coverage; verified targeted suites and baseline full-suite failures. |

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npx vitest run src/__tests__/auth-session-middleware.test.ts src/__tests__/mvp-route-cleanup.test.ts src/__tests__/authorization-hardening.test.ts src/__tests__/admission-profile-request.test.ts` (pass)
- `npm run lint -- src/lib/supabase/middleware.ts 'src/app/(app)/admin/actions.ts' src/__tests__/auth-session-middleware.test.ts src/__tests__/mvp-route-cleanup.test.ts src/__tests__/authorization-hardening.test.ts` (pass)
- `npx vitest run` (expected baseline failure only: `src/__tests__/profile-utils.test.ts` 3 availability-label assertions)

### Completion Notes List

- Expanded `src/lib/supabase/middleware.ts` to explicitly separate missing-profile, profile-fetch-error, unknown-status, pending, rejected, approved-not-onboarded, and approved-onboarded outcomes.
- Kept `/api/geo/cities` explicitly public/non-private across logged-out and authenticated flows, including approved-not-onboarded onboarding usage.
- Extended `src/__tests__/auth-session-middleware.test.ts` to cover the full matrix across public/legal/auth routes, `/en-attente`, `/onboarding`, `/chat`, `/chat/[slug]` representative access, protected app routes, and `/admin`.
- Hardened `src/app/(app)/admin/actions.ts` so sensitive admin Server Actions now require authenticated + `is_admin` + `status === "approved"` + `onboarding_completed === true`.
- Strengthened source guardrails in `src/__tests__/mvp-route-cleanup.test.ts` and `src/__tests__/authorization-hardening.test.ts` for public/non-private handler carve-outs and admin action boundary checks.
- No Supabase migrations, generated types, dependency changes, or production database operations were introduced.
- No launch-blocking Story 2.6 risks were deferred; full-suite failures remained limited to the known baseline in `src/__tests__/profile-utils.test.ts`.

### File List

- `_bmad-output/implementation-artifacts/2-6-enforce-admission-state-route-boundaries.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/supabase/middleware.ts`
- `src/app/(app)/admin/actions.ts`
- `src/__tests__/auth-session-middleware.test.ts`
- `src/__tests__/mvp-route-cleanup.test.ts`
- `src/__tests__/authorization-hardening.test.ts`

## Expected Dev Output

When this story returns from dev, the Dev Agent Record must include:

- Changed files.
- Matrix tests added or updated.
- Exact gaps fixed.
- Any intentionally deferred risks, with concrete evidence for why they are outside Story 2.6 or non-launch-blocking.
- Exact commands run and outcomes.
- Baseline failures distinguished from regressions.
