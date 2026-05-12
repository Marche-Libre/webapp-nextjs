# Story 2.5: Route Approved Users Through Onboarding or Into Chat

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an approved user,
I want the app to send me to onboarding if my profile is incomplete or `/chat` if I am ready,
so that I can complete required setup and reach the private community without confusion.

## Acceptance Criteria

1. Given an approved user has not completed required onboarding/profile steps, when they enter the app through auth callback, public/auth entry routes, `/en-attente`, `/chat`, or another protected app route, then they are routed to `/onboarding`.
2. The onboarding UI explains what remains to be completed in user-facing language and does not look like an access error, pending state, or refused state.
3. Once required onboarding/profile steps are complete, the user is not trapped in an onboarding loop and is routed to `/chat`.
4. Given an approved onboarded user enters the app, when their state is resolved, then they are routed to `/chat` as the primary member destination.
5. Approved-user routing decisions use trusted server/session/profile state, including `profiles.status` and `profiles.onboarding_completed`, rather than client-only assumptions, X metadata, sponsor state, referral cookies, or profile field presence alone.
6. Existing pending/refused/logged-out/non-member boundaries remain intact: this story must not open `/chat` or protected app content to non-approved users.

## Tasks / Subtasks

- [x] Audit current approved-user route decisions before editing (AC: 1, 3, 4, 5, 6)
  - [x] Read every file listed in `Current State of Files To Audit`; confirm current behavior still matches this story before making changes.
  - [x] Trace approved/not-onboarded and approved/onboarded users through `/auth/callback`, `/`, `/connexion`, `/inscription`, `/rejoindre`, `/en-attente`, `/onboarding`, `/chat`, and representative protected `(app)` routes.
  - [x] Read installed Next.js 16 docs before changing middleware/proxy, redirects, route handlers, Server Actions, or caching behavior.
  - [x] Preserve Story 2.4 pending/refused status boundaries and Story 2.3 admission/profile request scope.
- [x] Stabilize approved-not-onboarded routing to `/onboarding` (AC: 1, 2, 5, 6)
  - [x] Ensure route decisions check `profile.status === "approved"` and `profile.onboarding_completed !== true` before sending users to onboarding.
  - [x] Do not route pending, rejected, missing-profile, or signed-out users into approved onboarding.
  - [x] Keep `/onboarding` outside the protected `(app)` group unless a stronger existing pattern is found; it must remain reachable by approved/not-onboarded users without rendering member app shell.
  - [x] Make onboarding copy/state clear about remaining setup, using existing onboarding UI patterns rather than a redesign.
- [x] Stabilize approved-onboarded routing to `/chat` (AC: 3, 4, 5)
  - [x] Ensure approved/onboarded users entering public/auth/status entry routes are redirected to `/chat`.
  - [x] Ensure approved/onboarded users who revisit `/onboarding` or `/en-attente` are sent to `/chat`.
  - [x] Ensure onboarding completion persists `onboarding_completed: true` only for the current user and sends the user to `/chat` after a successful save.
  - [x] Preserve `/chat` and `/chat/[slug]` as canonical chat surfaces; do not reintroduce `/forum`, `/membres`, or dashboard defaults as member home.
- [x] Prevent loop and stale-state regressions (AC: 1, 2, 3, 4, 6)
  - [x] Check for conflicts between root middleware, `src/lib/supabase/middleware.ts`, `/auth/callback`, `/en-attente`, `/onboarding`, and protected `(app)` layout redirects.
  - [x] Ensure protected `(app)` layout renders `AppShell` only for `profile.status === "approved"` users who have completed onboarding; pending, rejected, missing-profile, unknown, suspended, removed, or otherwise non-approved statuses must not render protected app content.
  - [x] Avoid caching authenticated admission/onboarding decisions in a way that can produce stale access or loops.
  - [x] If client-side onboarding completion remains necessary, pair it with a server-trusted redirect/check on reload; do not rely on client state as the authority.
- [x] Add focused tests and verification (AC: 1, 2, 3, 4, 5, 6)
  - [x] Extend `src/__tests__/auth-session-middleware.test.ts` for approved/not-onboarded access to `/chat` and protected routes, not only `/rejoindre`.
  - [x] Add or update focused coverage for `src/app/(app)/layout.tsx` so protected app content is default-denied unless the profile is approved and onboarded.
  - [x] Add or update focused source-inspection or behavior tests for `/onboarding` and onboarding completion route-to-chat behavior.
  - [x] Preserve or strengthen `src/__tests__/mvp-route-cleanup.test.ts` guardrails that keep approved-member defaults on `/chat`.
  - [x] Run targeted Vitest commands for changed tests and record exact outcomes.
  - [x] Run targeted lint on changed files if practical; classify known baseline failures separately from regressions.

## Dev Notes

### Story Scope

Story 2.5 is the approved-user routing and onboarding-loop story. It ensures approved users split correctly into two states: approved/not-onboarded users complete `/onboarding`, and approved/onboarded users enter `/chat`. It is not a full route/access matrix story, admin approval workflow, schema/RLS overhaul, onboarding redesign, chat feature story, or legacy-route deletion story. Story 2.6 owns comprehensive route-boundary enforcement across all states. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.5: Route Approved Users Through Onboarding or Into Chat`; Source: `_bmad-output/planning-artifacts/epics.md#Story 2.6: Enforce Admission-State Route Boundaries`]

Epic 2 owns private-club entry, X auth, admission data capture, pending/refused/onboarding/approved routing, and route blocking for pending/refused/logged-out/non-member users. Story 2.5 depends on Story 2.4 keeping pending/refused states explicit at `/en-attente` and must not weaken those boundaries. [Source: `_bmad-output/planning-artifacts/epics.md#Epic 2: Private Club Entry, Identity, and Admission`; Source: `_bmad-output/implementation-artifacts/2-4-show-explicit-pending-and-refused-admission-states.md#Completion Notes List`]

### Product and UX Requirements

Approved users who have not completed required onboarding/profile steps must be able to complete onboarding, and approved onboarded users must enter the private member app. Approved onboarded users should consistently route to `/chat`; approved not-onboarded users should route to onboarding; pending/refused users should route to explicit status boundaries. Redirect loops in auth, onboarding, pending, refused, and approved-user flows are launch blockers. [Source: `_bmad-output/planning-artifacts/prd.md#Functional Requirements`; Source: `_bmad-output/planning-artifacts/prd.md#NonFunctional Requirements`]

The UX target is explicit state handling: users must know whether they are pending, refused, approved but not onboarded, or approved and ready for chat. Approved users must not be trapped in onboarding loops, and approved onboarded users should naturally land in `/chat`. Preserve the brownfield UI foundation and fix only beta-critical clarity issues. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Navigation & Information Architecture`; Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]

### Architecture Compliance

Active stack and constraints:

- Next.js `16.2.1` App Router with React `19.2.4`.
- TypeScript strict mode with `@/*` imports from `src`.
- Supabase via `@supabase/ssr ^0.9.0` and `@supabase/supabase-js ^2.100.1`.
- Existing Supabase helpers are mandatory: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, and `src/lib/supabase/middleware.ts`.
- Tests live under `src/__tests__`; use `npx vitest run ...` directly for targeted tests.
- Do not change dependencies, package locks, generated types, migrations, Supabase files, or runtime routes outside the story scope.

[Source: `_bmad-output/project-context.md#Technology Stack & Versions`; Source: `_bmad-output/project-context.md#Technical Implementation Rules`; Source: `_bmad-output/planning-artifacts/architecture.md#Technical Constraints & Dependencies`]

Admission routing must follow the architecture state machine:

- Logged out.
- Authenticated with no profile or incomplete request.
- Pending.
- Refused/rejected.
- Approved but not onboarded.
- Approved and onboarded.
- Suspended/removed if supported by current schema.
- Admin/non-admin overlays.

Route decisions for this story are only the approved branches: approved/not-onboarded routes to onboarding/profile completion; approved/onboarded routes to `/chat`. UI hiding is not security. Middleware/proxy/session refresh, server-side guards, authorized server mutations, and Supabase RLS remain layered boundaries. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]

Next.js 16 notes:

- Middleware is now called Proxy in the docs; existing project code still uses `middleware.ts`.
- Proxy can do request-aware redirects but is not a full authorization solution and should not be used for slow data fetching.
- `redirect()` in Server Components terminates rendering and returns a temporary redirect outside Server Actions.
- If changing route redirects, proxy/middleware, route handlers, Server Actions, or caching, read the installed docs first, especially `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`, and `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`.

[Source: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`; Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]

### Current State of Files To Audit

`src/lib/supabase/middleware.ts`

- Current state: Refreshes Supabase session, defines public/legal routes, redirects signed-out protected requests to `/connexion`, queries `profiles(status,onboarding_completed)`, sends rejected and pending users to `/en-attente`, sends approved/not-onboarded users to `/onboarding`, and sends approved/onboarded users from `/`, `/connexion`, `/inscription`, `/rejoindre`, or `/en-attente` to `/chat`.
- What this story may change: Strengthen approved/not-onboarded routing coverage for `/chat` and protected routes if tests reveal a gap; tighten loop prevention if `/onboarding` or auth-entry routes conflict.
- Preserve: Legal pages must remain public and outside app-home redirects; pending/rejected must stay on `/en-attente`; signed-out protected access must redirect to `/connexion`; approved/onboarded defaults must stay `/chat`.

`middleware.ts`

- Current state: Root middleware delegates to `updateSession()` and uses a matcher that excludes static/image asset paths.
- What this story may change: Usually nothing. If matcher/proxy behavior changes, re-check installed Next.js 16 docs.
- Preserve: Single root middleware/proxy entry and existing matcher intent.

`src/app/(app)/layout.tsx`

- Current state: Server protected layout reads current user/profile through the server Supabase helper, redirects missing/unauthenticated users to `/connexion`, pending/rejected users to `/en-attente`, approved/not-onboarded users to `/onboarding`, and then renders `AppShell`. This means known pending/rejected statuses are blocked, but any unexpected non-approved status would currently fall through unless middleware intercepts it first.
- What this story should change: Align the layout with the trusted route-state contract by default-denying protected app rendering unless `profile.status === "approved"` and `profile.onboarding_completed === true`.
- Preserve: Pending/rejected must never render protected app shell; approved/not-onboarded must not render member app shell; approved/onboarded users must be allowed through.

`src/app/auth/callback/route.ts`

- Current state: Exchanges X OAuth code, reads user, queries `profiles(status,onboarding_completed)`, routes approved users to `/chat` or `/onboarding`, routes others to `/en-attente`, and handles `ml-referral` for non-approved users.
- What this story may change: Usually nothing unless callback-to-onboarding/chat is inconsistent with server route guards.
- Preserve: Cookie write behavior on final response, X OAuth exchange, referral cookie handling, no service-role key, no routing based on X metadata or sponsor/referral data.

`src/app/(auth)/en-attente/page.tsx`

- Current state: Authenticated status boundary for pending/refused users. It returns explicit refused UI for `profile.status === "rejected"`, redirects approved users with `profile.onboarding_completed ? "/chat" : "/onboarding"`, and renders pending/manual-review UI plus Story 2.3 admission/profile and sponsor flows for pending users.
- What this story may change: Usually no copy work. Verify the approved redirect remains correct and does not trap approved users on `/en-attente`.
- Preserve: Story 2.4 explicit pending/refused states, Story 2.3 admission form, sponsor/parrain flows, no member data exposure.

`src/app/onboarding/page.tsx`

- Current state: Server Component for approved/not-onboarded users. It redirects signed-out or missing-profile users to `/connexion`, non-approved users to `/en-attente`, and onboarded users to `/chat`; then fetches specialty categories, member count, sponsor info, member previews, and countries before rendering `OnboardingWizard`.
- What this story may change: Primary place to clarify onboarding state and loop prevention. Consider whether required profile/onboarding steps are clear and whether redirect checks remain server-trusted.
- Preserve: Non-approved users cannot access onboarding; onboarded users redirect to `/chat`; use the existing server Supabase helper; no broad onboarding redesign.

`src/components/onboarding/onboarding-wizard.tsx`

- Current state: Client Component with an 8-step onboarding flow. It uses the browser Supabase helper to update profile fields and, on finish, updates `profiles.onboarding_completed` for `profile.id`, inserts a welcome notification with `link: "/chat"`, then hard-redirects `window.location.href = "/chat"`.
- What this story may change: Improve clear "remaining setup" copy, add/recover failure state, or harden finish behavior if needed. If changing mutations, keep them scoped to the current user/profile and do not introduce status/admin/access updates.
- Preserve: Existing UI primitives, `/chat` post-completion destination, no dependency changes. Note that this component is currently rendered by `src/app/onboarding/page.tsx` despite the `@ARCHIVED - Potentially unused` comment, so treat it as the active onboarding UI unless code audit proves otherwise.

`src/__tests__/auth-session-middleware.test.ts`

- Current state: Behavior tests cover approved/onboarded redirects from auth entry routes to `/chat`, approved/not-onboarded `/rejoindre` to `/onboarding`, pending/rejected `/rejoindre` to `/en-attente`, pending/rejected protected-route blocking, signed-out public `/rejoindre`, signed-out protected redirect, and approved/onboarded protected access.
- What this story should change: Add approved/not-onboarded attempts to `/chat` and representative protected routes to assert `/onboarding`; consider approved/not-onboarded auth entry routes beyond `/rejoindre`.
- Preserve: Existing pending/refused and signed-out expectations.

`src/__tests__/mvp-route-cleanup.test.ts`

- Current state: Source-inspection guardrail verifies approved/onboarded defaults to `/chat`, onboarding and related surfaces point back to `/chat`, hidden forum/annuaire navigation, refused explicit state, pending explicit boundary, and legal pages outside auth/app-home redirects.
- What this story may change: Strengthen approved-user routing and onboarding-loop assertions if implementation changes touch `/onboarding`, callback, middleware, or wizard.
- Preserve: `/chat` as member home; no `/forum` or `/membres` member defaults.

`src/__tests__/admission-profile-request.test.ts`

- Current state: Story 2.3 tests verify pending `/en-attente` admission form behavior, approved-only onboarding boundary, safe profile request Server Action fields, and non-pending rejection.
- What this story may change: Usually none. Run it if touching `/en-attente`, onboarding boundary expectations, or admission/profile form code.
- Preserve: Admission form scope and forbidden sensitive-field coverage.

### Data and Security Boundaries

Admission state source of truth remains `profiles.status`, with known local values `pending`, `approved`, and `rejected`. Onboarding state source of truth is `profiles.onboarding_completed === true`. For this story, "required onboarding/profile steps complete" means this boolean is true; do not infer routing readiness from individual profile fields. Product copy may explain the visible wizard/profile steps, while code may continue using the existing database values. [Source: `src/lib/types/database.ts`; Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`]

Do not infer approved routing from `user_metadata`, X handle presence, referral cookies, sponsor presence, `sponsor_approved`, form completion, profile field completeness, or client-side state. These can support display or admission review context but are not authority for member access. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`; Source: `_bmad-output/implementation-artifacts/2-4-show-explicit-pending-and-refused-admission-states.md#Anti-Patterns To Avoid`]

Do not update `status`, `is_admin`, `sponsored_by`, `sponsor_approved`, roles, access-control fields, or channel/message permissions from onboarding. If the current wizard keeps client-side profile updates, verify they are user-owned fields and either rely on documented Supabase RLS for current-user scoping or move completion through a server-trusted mutation/check. Document any RLS uncertainty. This story does not authorize schema migrations, production SQL, generated type changes, or destructive Supabase writes. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md#Data Contract Guidance`]

### Previous Story Intelligence

Story 2.4 implemented explicit pending/refused states in:

- `src/app/(auth)/en-attente/page.tsx`
- `src/components/sponsorship/status-poller.tsx`
- `src/__tests__/mvp-route-cleanup.test.ts`
- `src/__tests__/status-poller.test.tsx`

It preserved approved redirects from `/en-attente` to `/chat` or `/onboarding`, kept pending/refused users blocked from protected routes, and documented that production schema/RLS parity remains intentionally unassumed. Do not undo the explicit pending/refused copy or redirect refused users to `/connexion` except through deliberate user action. [Source: `_bmad-output/implementation-artifacts/2-4-show-explicit-pending-and-refused-admission-states.md#Completion Notes List`]

Story 2.4 verification baseline:

- `npx vitest run src/__tests__/mvp-route-cleanup.test.ts src/__tests__/admission-profile-request.test.ts src/__tests__/auth-session-middleware.test.ts` passed.
- `npx vitest run` failed only on known baseline `src/__tests__/profile-utils.test.ts` availability-label assertions.
- Targeted lint on changed Story 2.4 files passed.

[Source: `_bmad-output/implementation-artifacts/2-4-show-explicit-pending-and-refused-admission-states.md#Debug Log References`]

### Git Intelligence Summary

Recent commits before this story:

- `a58dba1 feat: show explicit admission status states`
- `2eee16c feat: capture admission profile requests`
- `6f309cc fix: preserve returning session routing for rejoindre`
- `e33c9ea Merge pull request #30 from Marche-Libre/story/2-1-public-access-positioning`
- `2dad6b6 fix: resolve story 2.1 review findings`

Recent pattern: keep changes small, preserve brownfield routes, add focused Vitest/source-inspection coverage, record exact command outcomes, classify baseline failures honestly, and avoid dependency/schema churn. [Source: `git log --oneline -5`; Source: `git show --name-only --oneline -1`]

### Testing Requirements

Minimum targeted tests:

- `npx vitest run src/__tests__/auth-session-middleware.test.ts`
  - Required if changing `src/lib/supabase/middleware.ts` or root `middleware.ts`.
  - Add approved/not-onboarded `/chat` and representative protected-route redirect coverage if missing.
- `npx vitest run src/__tests__/mvp-route-cleanup.test.ts`
  - Required if changing `/chat` defaults, `/onboarding`, `/en-attente`, callback routing, sidebar/logo defaults, or onboarding finish routing.
  - Strengthen or add guardrails for protected layout default-deny behavior if `src/app/(app)/layout.tsx` changes.
- `npx vitest run src/__tests__/admission-profile-request.test.ts`
  - Required if touching `/en-attente`, admission form boundaries, or onboarding approved-only guard assertions.
- Add a focused onboarding test if implementation changes `src/app/onboarding/page.tsx` or `src/components/onboarding/onboarding-wizard.tsx` in ways not covered by existing tests.
- Run targeted lint on changed files if practical, for example `npm run lint -- "src/app/onboarding/page.tsx" "src/components/onboarding/onboarding-wizard.tsx" "src/lib/supabase/middleware.ts" "src/__tests__/auth-session-middleware.test.ts"`.

Verification notes:

- Do not claim live X OAuth, production session, production Supabase, realtime, or manual browser verification unless actually performed.
- If running full `npx vitest run`, classify the known `src/__tests__/profile-utils.test.ts` availability-label failures as baseline unless this story changes that file.
- If running full `npm run lint`, classify the known broader lint baseline separately from new issues.

### Anti-Patterns To Avoid

- Do not route pending, rejected, missing-profile, logged-out, or non-member users to `/onboarding` as if they were approved.
- Do not route approved/not-onboarded users into `/chat` because they have X metadata, a sponsor, an invitation, profile fields, or client-side state.
- Do not route approved/onboarded users to `/forum`, `/membres`, `/tableau-de-bord`, or other parked surfaces as the default member home.
- Do not remove `/en-attente`, `/onboarding`, `/connexion`, `/inscription`, `/rejoindre`, `/chat`, legal routes, or legacy protected routes.
- Do not add schema migrations, generated types, dependencies, package-lock changes, production SQL, or destructive Supabase operations.
- Do not use service-role keys or secret keys in client code.
- Do not cache authenticated admission/onboarding/member state in a way that can leak or stale-route access.
- Do not redesign onboarding broadly; improve only the beta-critical clarity or loop behavior needed for the ACs.

### References

- `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`
- `_bmad-output/project-context.md#Technology Stack & Versions`
- `_bmad-output/project-context.md#Technical Implementation Rules`
- `_bmad-output/planning-artifacts/epics.md#Story 2.5: Route Approved Users Through Onboarding or Into Chat`
- `_bmad-output/planning-artifacts/epics.md#Story 2.6: Enforce Admission-State Route Boundaries`
- `_bmad-output/planning-artifacts/prd.md#Functional Requirements`
- `_bmad-output/planning-artifacts/prd.md#NonFunctional Requirements`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Navigation & Information Architecture`
- `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md`
- `_bmad-output/implementation-artifacts/2-4-show-explicit-pending-and-refused-admission-states.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`
- `middleware.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/(app)/layout.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/(auth)/en-attente/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/components/onboarding/onboarding-wizard.tsx`
- `src/__tests__/auth-session-middleware.test.ts`
- `src/__tests__/mvp-route-cleanup.test.ts`
- `src/__tests__/admission-profile-request.test.ts`

## Change Log

| Date       | Change                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 2026-05-06 | Created comprehensive Story 2.5 developer guide for approved onboarding/chat routing.            |
| 2026-05-06 | Tightened readiness notes for protected-layout default-deny, onboarding completion source of truth, active wizard usage, and client mutation scoping. |
| 2026-05-06 | Implemented approved-user onboarding/chat routing hardening, onboarding clarity copy, and focused guardrail tests. |

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npx vitest run src/__tests__/auth-session-middleware.test.ts src/__tests__/mvp-route-cleanup.test.ts` failed red phase with expected failures for protected-layout default-deny coverage and onboarding setup copy.
- `npx vitest run src/__tests__/auth-session-middleware.test.ts src/__tests__/mvp-route-cleanup.test.ts` passed after implementation: 2 files, 23 tests.
- `npx vitest run src/__tests__/admission-profile-request.test.ts` passed: 1 file, 7 tests.
- `npm run lint -- src/app/(app)/layout.tsx ...` first failed in zsh because the `(app)` path was unquoted.
- `npm run lint -- 'src/app/(app)/layout.tsx' src/components/onboarding/onboarding-wizard.tsx src/__tests__/auth-session-middleware.test.ts src/__tests__/mvp-route-cleanup.test.ts` passed.
- `npx vitest run` failed only on known baseline `src/__tests__/profile-utils.test.ts` availability-label assertions: expected `Disponible` / `En mission`, received current labels `Disponible pour une mission` / `Actuellement en mission`.

### Completion Notes List

- Audited the listed route decision files and Next.js 16 proxy/redirect docs before runtime edits.
- Tightened `src/app/(app)/layout.tsx` so protected app content renders only after `profile.status === "approved"` and `onboarding_completed === true`; all non-approved statuses go to `/en-attente`, and approved/not-onboarded users go to `/onboarding`.
- Kept existing middleware, auth callback, `/en-attente`, and `/onboarding` server route contracts intact because they already split approved users by trusted profile status and onboarding state.
- Clarified the first onboarding screen as approved-user setup work, with explicit profile steps and `/chat` destination copy.
- Added middleware and source-inspection tests for approved/not-onboarded protected-route redirects, protected-layout default-deny behavior, and onboarding setup copy. Full Vitest still has the documented baseline `profile-utils` label failures unrelated to this story.

### File List

- `_bmad-output/implementation-artifacts/2-5-route-approved-users-through-onboarding-or-into-chat.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/__tests__/auth-session-middleware.test.ts`
- `src/__tests__/mvp-route-cleanup.test.ts`
- `src/app/(app)/layout.tsx`
- `src/components/onboarding/onboarding-wizard.tsx`
