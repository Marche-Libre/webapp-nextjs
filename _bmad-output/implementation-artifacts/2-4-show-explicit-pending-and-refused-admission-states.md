# Story 2.4: Show Explicit Pending and Refused Admission States

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to clearly understand whether my request is pending or refused,
so that blocked access feels intentional rather than broken.

## Acceptance Criteria

1. Given a user has pending admission status, when they attempt to access private app routes or return after sign-in, then they see an explicit pending state explaining manual review and no member access yet.
2. Pending users cannot access member-only routes, channel data, message data, or private community pages.
3. Given a user has refused/rejected admission status, when they attempt to access private app routes or return after sign-in, then they see an explicit refused state using product language rather than database terminology.
4. Refused/rejected users are not silently redirected to login or trapped in a redirect loop.
5. Refused/rejected users cannot access member-only routes, channel data, message data, or private community pages.

## Tasks / Subtasks

- [x] Audit current pending/refused state handling before editing (AC: 1, 2, 3, 4, 5)
  - [x] Read every file listed in `Current State of Files To Audit`; confirm current behavior still matches this guide before making changes.
  - [x] Trace pending and rejected users through `/auth/callback`, `/en-attente`, protected `(app)` routes, middleware/proxy, `/chat`, and `/onboarding`.
  - [x] Preserve the Story 2.3 admission/profile request form and sponsor/parrain flows; this story refines explicit status states, not the admission form data contract.
  - [x] Record any production schema/RLS uncertainty honestly; do not assume local migrations prove production behavior.
- [x] Improve explicit pending state on `/en-attente` (AC: 1, 2)
  - [x] Ensure pending users see clear French-first copy that says the request is under manual review and private member access is not available yet.
  - [x] Keep the admission/profile form visible where still needed, but make the surrounding state read as pending/manual review rather than generic invitation-only onboarding.
  - [x] Preserve visible next steps: form completion if missing, sponsor/parrain option where supported, admin manual review fallback, and status refresh.
  - [x] Avoid implying automatic access from form submission, sponsor request, sponsor approval, profile completion, or X sign-in.
- [x] Improve explicit refused state on `/en-attente` (AC: 3, 4, 5)
  - [x] Use product language such as refused/not accepted for the closed beta; do not show raw database terms like `rejected` in user-facing copy.
  - [x] Keep refused users on an explicit status boundary instead of redirecting them to `/connexion` except for a deliberate user action such as the existing connection/logout link.
  - [x] Make the refused state firm, human, and understandable; it must not look like a missing profile, auth error, or broken route.
  - [x] Do not add appeal, support, reapplication, admin messaging, or broad account-management flows unless a blocker is found and approved.
- [x] Preserve and verify route/access boundaries (AC: 2, 4, 5)
  - [x] Pending and rejected users must continue to redirect to `/en-attente` from protected `(app)` routes and `/chat`.
  - [x] Approved/not-onboarded users must still reach `/onboarding`; approved/onboarded users must still reach `/chat`.
  - [x] Signed-out protected access must still redirect to `/connexion`, while signed-out public/auth/legal routes remain accessible.
  - [x] Do not remove or rename `/en-attente`, `/onboarding`, `/connexion`, `/inscription`, `/rejoindre`, `/chat`, legal routes, or legacy protected routes.
  - [x] Do not solve the full admission-state matrix here beyond the pending/refused scope; Story 2.6 owns comprehensive matrix enforcement.
- [x] Add focused tests and verification (AC: 1, 2, 3, 4, 5)
  - [x] Extend or add focused tests under `src/__tests__` for explicit pending/refused copy and route outcomes.
  - [x] Keep `src/__tests__/auth-session-middleware.test.ts` aligned if middleware/proxy behavior changes.
  - [x] Preserve `src/__tests__/mvp-route-cleanup.test.ts` refused-state guardrail or replace it with stronger coverage if needed.
  - [x] Run targeted Vitest for changed tests and record exact commands/outcomes.
  - [x] Run targeted lint on changed files if practical; classify known baseline failures separately from regressions.

### Review Findings

- [x] [Review][Patch] Invitation branch bypasses the explicit pending boundary [src/app/(auth)/en-attente/page.tsx:105]
- [x] [Review][Patch] Rejected status polling lacks behavioral coverage [src/components/sponsorship/status-poller.tsx:39]
- [x] [Review][Patch] Sprint status timestamps are internally inconsistent [_bmad-output/implementation-artifacts/sprint-status.yaml:2]

## Dev Notes

### Story Scope

Story 2.4 is the pending/refused admission status UX and boundary story. It should make non-approved admission outcomes clear and deliberate when users return after sign-in or try private routes. It is not a new admission form story, full route-matrix enforcement story, approval workflow, admin refusal workflow, schema/RLS overhaul, onboarding loop fix, public copy story, or member discovery expansion. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.4: Show Explicit Pending and Refused Admission States`]

The safest expected implementation is a small refinement around `/en-attente`, existing middleware/protected-layout redirects, and tests. Story 2.3 already added the pending admission/profile form and should not be undone. Story 2.5 owns approved onboarding/chat routing refinements. Story 2.6 owns comprehensive admission-state route-boundary enforcement. [Source: `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md#Completion Notes List`; Source: `_bmad-output/planning-artifacts/epics.md#Story 2.5: Route Approved Users Through Onboarding or Into Chat`; Source: `_bmad-output/planning-artifacts/epics.md#Story 2.6: Enforce Admission-State Route Boundaries`]

### Epic 2 Context

Epic 2 owns private club entry, X auth, admission data capture, pending/refused/onboarding/approved routing, and route blocking for non-member states. Story 2.1 aligned public access positioning with closed-beta manual admission. Story 2.2 preserved X sign-in and returning-session behavior. Story 2.3 added a minimal pending admission/profile request form. Story 2.4 now makes the pending and refused outcomes unmistakable and verifies they still block private access. [Source: `_bmad-output/planning-artifacts/epics.md#Epic 2: Private Club Entry, Identity, and Admission`; Source: `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md`; Source: `_bmad-output/implementation-artifacts/2-2-preserve-x-sign-in-and-returning-session-behavior.md`; Source: `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md`]

Relevant product requirements:

- Pending users must see a clear pending state while waiting for review. [Source: `_bmad-output/planning-artifacts/prd.md#Admission and Onboarding`]
- Refused users must see a clear refused state without a confusing login loop. [Source: `_bmad-output/planning-artifacts/prd.md#Admission and Onboarding`]
- Pending/refused/logged-out/non-member users must not access member-only routes, channel data, message data, or private community pages. [Source: `_bmad-output/planning-artifacts/prd.md#Authorization and Protected Access`]
- Admission status screens must explain pending, refused/rejected, approved-but-onboarding-required, logged-out/auth error, and blocked/no-access states in text, not only color or iconography. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Status Screen`]

### UX Requirements

Pending state UX should answer: the request exists or can be completed here, manual review is required, member access is not available yet, and the user can wait, provide required info, request sponsorship where supported, or refresh status. It must not imply automatic membership from X sign-in, form submission, profile completeness, sponsor request, or sponsor approval. [Source: `_bmad-output/planning-artifacts/prd.md#Journey 2: Pending Candidate Waits for Manual Review`; Source: `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md#Data Contract Guidance`]

Refused state UX should answer: the beta request was not accepted, the private club boundary is intentional, the user cannot access member content, and the route is not broken. Use French-first product language and avoid raw database terminology such as `rejected`. [Source: `_bmad-output/planning-artifacts/prd.md#Journey 3: Refused Candidate Is Blocked Clearly`; Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`]

Keep the brownfield UI foundation. Improve only beta-critical clarity issues; do not introduce a new design system, redesign the auth shell, or make broad visual changes. Status text must remain readable and primary actions keyboard reachable on mobile and desktop. [Source: `_bmad-output/project-context.md#Technical Implementation Rules`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation`; Source: `_bmad-output/planning-artifacts/prd.md#Accessibility Level`]

### Architecture Compliance

Active stack and constraints:

- Next.js `16.2.1` App Router with React `19.2.4`.
- TypeScript strict mode with `@/*` imports from `src`.
- Supabase via `@supabase/ssr ^0.9.0` and `@supabase/supabase-js ^2.100.1`.
- Tailwind CSS 4 and existing UI/component patterns.
- Tests live under `src/__tests__`; `package.json` has no `test` script, so use `npx vitest run ...` directly.
- Existing environment names must remain `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`.

[Source: `_bmad-output/project-context.md#Technology Stack & Versions`; Source: `_bmad-output/planning-artifacts/architecture.md#Technical Constraints & Dependencies`; Source: `package.json`]

Allowed implementation patterns:

- Use Server Components for server-side auth/admission/profile reads.
- Use `redirect()` from `next/navigation` for server-render route guards.
- Use `NextResponse.redirect()` in `src/lib/supabase/middleware.ts` if proxy/middleware route logic must change.
- Use existing Supabase helpers; do not create ad hoc clients.
- Use Client Components only for browser interaction such as status refresh, form pending state, or sponsor request interaction.
- Do not introduce GraphQL, tRPC, a separate REST backend, Prisma, Drizzle, Redux, Zustand, TanStack Query, a new service layer, or a new design system.

[Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`; Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`]

Next.js 16 notes relevant to this story:

- Middleware is now called Proxy in the docs; existing code still has `middleware.ts`, so read installed docs before changing route, redirect, proxy, Server Action, or caching behavior.
- Proxy should handle fast route/redirect logic and must not be treated as the only authorization boundary.
- Server Functions are POST requests to the route where they are used; always verify auth/authorization inside Server Actions rather than relying on proxy coverage.
- `redirect()` in Server Components terminates rendering and defaults to a temporary redirect outside Server Actions.

[Source: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`]

Supabase notes relevant to this story:

- Server code should use the project server helper and browser code should use the browser helper; do not create random clients.
- Do not expose service-role keys or secret keys in client code.
- Do not use `user_metadata` / `raw_user_meta_data` for authorization decisions. Current code may use X metadata only as display fallback; admission state must come from trusted profile/status data.
- RLS must protect exposed-schema tables; an `UPDATE` requires a corresponding `SELECT` policy, and user-editable JWT metadata is not safe for authorization.
- If any database/RLS gap is discovered, document it as schema/RLS uncertainty unless the story explicitly authorizes a migration. This story does not.

[Source: `https://supabase.com/docs/guides/auth/server-side/nextjs` fetched 2026-05-05; Source: `https://supabase.com/docs/guides/database/postgres/row-level-security` fetched 2026-05-05; Source: Supabase skill security checklist; Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]

### Current State of Files To Audit

`src/app/(auth)/en-attente/page.tsx`

- Current state: Server Component for authenticated non-approved users. It reads the current user via `createClient()` / `auth.getUser()`, fetches `profiles(id,status,onboarding_completed,x_handle,sponsor_approved,first_name,last_name,full_name,specialty_ids,specialty_category_id,location,bio)`, redirects missing users/profiles to `/connexion`, shows a refused card for `profile.status === "rejected"`, redirects approved users to `/chat` or `/onboarding`, loads invitations, sponsorship requests, specialty categories, then renders the Story 2.3 `AdmissionProfileForm`, `WaitingPageClient`, `StatusPoller`, and sponsorship/invitation states.
- What this story likely changes: Primary target for pending/refused copy and status layout. Pending copy currently still says the network is invitation-based and needs a sponsor, which can conflict with manual review/form copy. Refused copy is explicit but can be improved for product tone and clarity.
- Preserve: Authenticated boundary, refused users staying on `/en-attente`, approved redirects, Story 2.3 form, sponsor/parrain flows, no member data exposure, French-first copy.

`src/components/auth/admission-profile-form.tsx`

- Current state: Client Component using `useActionState` with `submitAdmissionProfile`; collects display name, first/last name, professional context, location, and short review context; displays X handle as non-editable context; copy says X sign-in launches an admission request and does not grant immediate access.
- What this story may change: Usually copy only if needed to align the overall pending state. Do not change the data contract unless a clear blocker is found.
- Preserve: Minimal data collection, non-editable X identity display, inline validation messages, server-action submission path, no status/role/onboarding mutation.

`src/app/(auth)/en-attente/actions.ts`

- Current state: Server Action verifies authenticated user with the server Supabase helper, requires `profiles.status === "pending"`, validates minimal form fields, verifies specialty/category IDs, updates only safe profile fields, and revalidates `/en-attente`.
- What this story may change: Nothing expected unless pending/refused state copy needs a small success message adjustment.
- Preserve: Server-side auth/profile check, pending-only mutation, safe-field update list, no updates to `status`, `is_admin`, `sponsored_by`, `sponsor_approved`, `onboarding_completed`, ban/mute fields, roles, or access-control fields.

`src/components/sponsorship/waiting-page-client.tsx`

- Current state: Client component lets pending users choose sponsor request or manual admin wait. The wait state says the request is queued and an admin will review it.
- What this story may change: Copy clarity and sequencing only. It may need to fit under a stronger pending/manual-review heading.
- Preserve: Existing sponsor request choice, manual admin review fallback, no private data access.

`src/components/sponsorship/sponsor-request-form.tsx`

- Current state: Client form checks an approved sponsor handle via the browser Supabase helper, inserts `sponsorship_requests`, shows pending/approved/rejected request states, keeps sponsor lookup privacy generic, and blocks self-sponsor.
- What this story may change: Usually none. Maybe copy for sponsor request statuses if the pending/refused page needs consistency.
- Preserve: Privacy-preserving lookup, max attempt behavior, no candidate updates to trusted sponsorship/admission fields, no inference that sponsor approval equals admission approval.

`src/components/sponsorship/status-poller.tsx`

- Current state: Browser component fetches `profiles(status, sponsor_approved)`, redirects only when `profile.status === "approved"`, refreshes otherwise, and shows "Toujours en attente".
- What this story may change: It currently treats non-approved results as still pending and does not distinguish `rejected` during polling. Consider whether rejected should refresh the page or show a refused result so the server-rendered refused state appears without ambiguity.
- Preserve: Only `status === "approved"` should route to `/chat`; do not infer approval from `sponsor_approved`.

`src/lib/supabase/middleware.ts` and root `middleware.ts`

- Current state: Session refresh and route-state redirects. Public routes include `/`, `/connexion`, `/inscription`, `/en-attente`, `/rejoindre`, legal routes, and `/auth/*`. Signed-out protected access redirects to `/connexion`; rejected users redirect to `/en-attente` unless already on `/en-attente` or `/connexion`; pending users redirect to `/en-attente`; approved/not-onboarded users redirect to `/onboarding`; approved/onboarded users on auth-entry routes redirect to `/chat`.
- What this story may change: Only if tests reveal a pending/refused redirect-loop or route-boundary gap. Existing behavior already covers the core Story 2.4 route outcomes.
- Preserve: Legal/public access, rejected explicit `/en-attente` boundary, signed-out protected redirect, approved `/chat` destination. If changing matcher/proxy behavior, re-check installed Next.js 16 docs.

`src/app/(app)/layout.tsx`

- Current state: Server protected layout verifies user/profile with the server Supabase helper, redirects missing/unauthenticated users to `/connexion`, pending and rejected users to `/en-attente`, approved/not-onboarded users to `/onboarding`, then renders `AppShell` for approved users.
- What this story may change: Usually none unless a protected-layout gap is found.
- Preserve: Pending/rejected cannot render protected app shell or member data.

`src/app/auth/callback/route.ts`

- Current state from Story 2.3 analysis: Exchanges X OAuth code, reads current user, queries `profiles(status,onboarding_completed)`, routes approved users to `/chat` or `/onboarding`, and routes all other users to `/en-attente`; processes `ml-referral` where possible.
- What this story may change: Usually none.
- Preserve: X OAuth exchange, cookie writes on final response, referral cookie behavior, no service-role key, no direct pending/refused UI inside callback.

`src/app/onboarding/page.tsx`

- Current state: Approved-not-onboarded Server Component; redirects unauthenticated/missing profile to `/connexion`, non-approved users to `/en-attente`, onboarded users to `/chat`.
- What this story may change: Usually none.
- Preserve: Non-approved users must not reach approved onboarding. Story 2.5 owns approved onboarding loop clarity.

`src/__tests__/auth-session-middleware.test.ts`

- Current state: Behavior-level tests cover approved/onboarded routing to `/chat`, approved/not-onboarded routing to `/onboarding`, pending and rejected `/rejoindre` to `/en-attente`, pending/rejected protected-route blocking, signed-out public `/rejoindre`, and signed-out protected redirect to `/connexion`.
- What this story may change: Extend if middleware/proxy behavior changes or if route-loop scenarios need stronger coverage.
- Preserve: Existing expectations unless product artifacts explicitly change route contracts.

`src/__tests__/mvp-route-cleanup.test.ts`

- Current state: Source-inspection guardrail verifies refused users redirect to `/en-attente`, `/en-attente` has `profile.status === "rejected"` and explicit refused copy, and the refused state no longer silently redirects to `/connexion`.
- What this story may change: Update expected copy if improving refused language; consider adding explicit pending-state source-inspection if not covered elsewhere.
- Preserve: The test's intent: refused state must remain explicit and not regress into a login loop.

`src/__tests__/admission-profile-request.test.ts`

- Current state: Story 2.3 tests verify the pending admission form renders from `/en-attente`, onboarding remains approved-only, form unavailable branch is explicit, action uses safe helper/fields, and Server Action behavior covers validation and non-pending rejection.
- What this story may change: Update only if copy or route-state assertions change. Do not weaken the safe-field/action guardrails.
- Preserve: Admission form scope and forbidden sensitive-field coverage.

### Data and Security Boundaries

Admission status source of truth remains `profiles.status` with known local values `pending`, `approved`, and `rejected`. Product/UI copy may say pending/refused, while database code may continue to use `pending` and `rejected`. [Source: `src/lib/types/database.ts`; Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`]

Story 2.4 should not add or change schema. If a durable distinction is needed between "pending with incomplete form", "pending submitted", and "refused", Story 2.3 already documented that the current loaded schema lacks an obvious dedicated submitted flag. Document the gap rather than adding schema in this story. [Source: `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md#Data Contract Guidance`]

Never treat these as candidate-editable or client-authoritative: `status`, `is_admin`, `sponsored_by`, `sponsor_approved`, `onboarding_completed`, `chat_banned`, `chat_muted_until`, roles, channel memberships, or admin/audit fields. [Source: `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`; Source: Supabase skill security checklist]

### Previous Story Intelligence

Story 2.3 implemented the pending admission/profile form in:

- `src/app/(auth)/en-attente/page.tsx`
- `src/app/(auth)/en-attente/actions.ts`
- `src/components/auth/admission-profile-form.tsx`
- `src/__tests__/admission-profile-request.test.ts`

It preserved sponsor/parrain invitation and request flows, did not change schema/migrations/dependencies/generated types, and documented schema uncertainty that `profiles.status = "pending"` remains the existing submitted/manual-review source of truth. Do not revert or bypass that work. [Source: `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md#Completion Notes List`; Source: `git show --stat --oneline 2eee16c`]

Story 2.3 review patches added behavior-level coverage for admission action edge cases, validated category-only specialty submissions server-side, and supported display-name-only profiles. If this story touches the form/action, preserve those edge cases. [Source: `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md#Review Findings`]

Known verification baseline from Story 2.3:

- `npx vitest run "src/__tests__/admission-profile-request.test.ts"` passed after review patches.
- `npx vitest run "src/__tests__/admission-profile-request.test.ts" "src/__tests__/auth-session-middleware.test.ts" "src/__tests__/authorization-hardening.test.ts"` passed.
- Full `npx vitest run` had 59 passed and 3 failed in `src/__tests__/profile-utils.test.ts`, matching documented baseline availability-label failures.
- `npm run lint` had a known broader baseline of 94 problems, but targeted lint on Story 2.3 changed files passed.

[Source: `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md#Debug Log References`]

### Git Intelligence Summary

Recent commits before this story:

- `2eee16c feat: capture admission profile requests`
- `6f309cc fix: preserve returning session routing for rejoindre`
- `e33c9ea Merge pull request #30 from Marche-Libre/story/2-1-public-access-positioning`
- `2dad6b6 fix: resolve story 2.1 review findings`
- `c8da915 fix: align public access positioning with closed beta admission`

Recent implementation pattern: create a comprehensive BMad story, make minimal scoped changes, add focused Vitest/source-inspection or behavior-level tests, run review patches, record baseline failures honestly, and update sprint status. Follow the same discipline: no dependency churn, no unverified completion claims, no broad refactors, and exact verification logs. [Source: `git log -5 --oneline`; Source: `git show --name-only --oneline 2eee16c` on 2026-05-05]

### Testing Requirements

Minimum targeted tests:

- Add or update a test asserting pending users see explicit pending/manual-review/no-member-access copy on `/en-attente` or in the relevant pending component.
- Update refused-state tests if copy changes; keep the guarantee that refused users see an explicit refused state and are not silently redirected to `/connexion`.
- Run `npx vitest run src/__tests__/mvp-route-cleanup.test.ts src/__tests__/admission-profile-request.test.ts` if changing `/en-attente` copy/layout or the admission form shell.
- Run `npx vitest run src/__tests__/auth-session-middleware.test.ts` if changing `src/lib/supabase/middleware.ts` or root middleware behavior.
- Run `npx vitest run src/__tests__/authorization-hardening.test.ts` if changing profile/admission action boundaries.
- Run targeted lint on changed files if practical, for example `npm run lint -- "src/app/(auth)/en-attente/page.tsx" "src/components/sponsorship/status-poller.tsx" "src/__tests__/mvp-route-cleanup.test.ts"`.

Verification notes:

- Do not claim live X OAuth, production-session, production Supabase, realtime, or manual browser verification unless actually performed.
- If running full `npx vitest run`, classify the known `src/__tests__/profile-utils.test.ts` availability-label failures as baseline unless this story changes that file.
- If running full `npm run lint`, classify the known broader lint baseline separately from new issues.

### Anti-Patterns To Avoid

- Do not open `/chat` or protected app routes to pending, refused, logged-out, or non-member users.
- Do not redirect refused users to `/connexion` in a way that hides refused status or creates a login loop.
- Do not display raw database terms such as `rejected` to candidates.
- Do not infer approval from sponsor presence, `sponsor_approved`, profile completion, referral cookie, client-side state, submitted form state, or X metadata.
- Do not use `user_metadata` for authorization or admission-state decisions.
- Do not remove or weaken the Story 2.3 admission/profile form, safe Server Action, or tests.
- Do not add schema migrations, generated type changes, production SQL, or destructive Supabase writes.
- Do not add appeal/reapplication/support workflows, admin review UI, onboarding redesign, or full route-matrix enforcement unless explicitly required to satisfy this story.
- Do not add dependencies, package lock changes, a new design system, new state-management library, new service layer, or broad refactors.
- Do not claim private data access is secure based only on UI hiding; route, server, and database boundaries remain layered.

### References

- `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`
- `_bmad-output/project-context.md#Technology Stack & Versions`
- `_bmad-output/planning-artifacts/epics.md#Story 2.4: Show Explicit Pending and Refused Admission States`
- `_bmad-output/planning-artifacts/epics.md#Epic 2: Private Club Entry, Identity, and Admission`
- `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`
- `_bmad-output/planning-artifacts/prd.md#Journey 2: Pending Candidate Waits for Manual Review`
- `_bmad-output/planning-artifacts/prd.md#Journey 3: Refused Candidate Is Blocked Clearly`
- `_bmad-output/planning-artifacts/prd.md#Admission and Onboarding`
- `_bmad-output/planning-artifacts/prd.md#Authorization and Protected Access`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Status Screen`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`
- `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md`
- `_bmad-output/implementation-artifacts/2-2-preserve-x-sign-in-and-returning-session-behavior.md`
- `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-server.md`
- `https://supabase.com/docs/guides/auth/server-side/nextjs`
- `https://supabase.com/docs/guides/database/postgres/row-level-security`
- `src/app/(auth)/en-attente/page.tsx`
- `src/components/auth/admission-profile-form.tsx`
- `src/app/(auth)/en-attente/actions.ts`
- `src/components/sponsorship/waiting-page-client.tsx`
- `src/components/sponsorship/sponsor-request-form.tsx`
- `src/components/sponsorship/status-poller.tsx`
- `src/lib/supabase/middleware.ts`
- `src/app/(app)/layout.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/onboarding/page.tsx`
- `src/__tests__/auth-session-middleware.test.ts`
- `src/__tests__/mvp-route-cleanup.test.ts`
- `src/__tests__/admission-profile-request.test.ts`
- `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`

## Change Log

| Date       | Change                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------- |
| 2026-05-05 | Created comprehensive Story 2.4 developer guide for explicit pending/refused admission status states. |
| 2026-05-05 | Implemented explicit pending/refused state copy refinements, status refresh handling, and focused regression coverage. |

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npx vitest run src/__tests__/mvp-route-cleanup.test.ts` (initial red phase): failed as expected on new pending/refused copy assertions.
- `npx vitest run src/__tests__/mvp-route-cleanup.test.ts src/__tests__/admission-profile-request.test.ts src/__tests__/auth-session-middleware.test.ts`: passed (27/27).
- `npm run lint -- "src/app/(auth)/en-attente/page.tsx" "src/components/sponsorship/status-poller.tsx" "src/__tests__/mvp-route-cleanup.test.ts"`: passed.
- `npx vitest run` (full suite gate): failed only on known baseline `src/__tests__/profile-utils.test.ts` availability-label assertions (3 failures), no new regressions from Story 2.4 changes.
- Code review patch: `npx vitest run src/__tests__/status-poller.test.tsx src/__tests__/mvp-route-cleanup.test.ts src/__tests__/admission-profile-request.test.ts src/__tests__/auth-session-middleware.test.ts`: passed (29/29).
- Code review patch: `npm run lint -- "src/app/(auth)/en-attente/page.tsx" src/components/sponsorship/status-poller.tsx src/__tests__/mvp-route-cleanup.test.ts src/__tests__/status-poller.test.tsx`: passed.

### Completion Notes List

- Updated `/en-attente` pending-state header/copy to explicitly communicate manual review and blocked member access until approval, while preserving Story 2.3 form and sponsor/parrain flow.
- Updated `/en-attente` refused-state copy to clear product-language refusal without exposing raw database terminology; refused users remain on explicit boundary with deliberate logout/login action only.
- Updated `StatusPoller` to handle `rejected` status explicitly by refreshing server-rendered boundary state, reducing ambiguous "still pending" messaging when status changed away from pending.
- Extended `mvp-route-cleanup` guardrails to assert explicit refused phrasing and explicit pending/manual-review boundary copy.
- Verified pending/refused route boundaries remain intact via unchanged middleware/layout routing tests.
- Review patches keep the invitation branch inside the same explicit pending/manual-review boundary, add behavioral poller coverage for rejected status refresh without navigation, and align sprint-status timestamps.
- No schema, migration, RLS policy, or dependency changes were made. Production schema/RLS parity remains intentionally unassumed in this story; verification stayed code/test-level only.

### File List

- `_bmad-output/implementation-artifacts/2-4-show-explicit-pending-and-refused-admission-states.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/(auth)/en-attente/page.tsx`
- `src/components/sponsorship/status-poller.tsx`
- `src/__tests__/mvp-route-cleanup.test.ts`
- `src/__tests__/status-poller.test.tsx`
