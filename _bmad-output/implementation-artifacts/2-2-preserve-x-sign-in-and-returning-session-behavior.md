# Story 2.2: Preserve X Sign-In and Returning Session Behavior

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to sign in with X and return to the app without unnecessary repeated authentication,
so that my app account remains connected to the X identity admins use for admission review.

## Acceptance Criteria

1. Given a signed-out candidate starts the access flow, when they choose X sign-in, then the app uses the existing Supabase Auth/X OAuth path and configured auth URL behavior.
2. Enough X identity context is retained or surfaced for admission review where supported by the current data model.
3. Returning authenticated users do not repeat unnecessary sign-in steps.
4. Signed-out users remain limited to public and auth-appropriate routes.
5. No ad hoc Supabase client or alternate environment variable contract is introduced.

## Tasks / Subtasks

- [x] Audit current X OAuth and returning-session behavior before editing (AC: 1, 2, 3, 4, 5)
  - [x] Read every file listed in `Current State of Files To Audit`; confirm current behavior still matches this guide before making changes.
  - [x] Manually trace signed-out `/inscription`, `/rejoindre`, and `/connexion` X OAuth entry, `/auth/callback`, and authenticated returns to `/`, `/connexion`, `/inscription`, `/rejoindre`, `/en-attente`, `/onboarding`, and `/chat`.
  - [x] Record whether each observed behavior is verified, baseline-broken, or changed by this story.
- [x] Preserve and harden the existing Supabase X OAuth entry path (AC: 1, 5)
  - [x] Keep `provider: "x"` in existing sign-in calls.
  - [x] Keep `getAuthCallbackUrl()` as the single redirect URL helper unless the story proves a concrete callback bug.
  - [x] Use `src/lib/supabase/client.ts` for browser OAuth entry; do not import `createBrowserClient` or `@supabase/supabase-js` directly in feature files.
  - [x] If adding error handling or loading feedback, keep it local to existing auth components and avoid broad redesign.
- [x] Ensure returning authenticated users avoid unnecessary re-authentication (AC: 3)
  - [x] Verify approved/onboarded users who reach public/auth entry routes are routed to `/chat` without seeing another sign-in prompt.
  - [x] Verify the exact authenticated `/rejoindre` matrix: approved/onboarded -> `/chat`; approved/not-onboarded -> `/onboarding`; pending -> `/en-attente`; rejected/refused -> `/en-attente`; signed-out remains allowed to view `/rejoindre`.
  - [x] Verify approved/not-onboarded users route to `/onboarding`, pending users to `/en-attente`, and refused users to explicit refused state at `/en-attente` for other auth/public entry routes.
  - [x] Check `/rejoindre` specifically; current middleware public route handling does not include it in the approved/onboarded auth-page redirect list. If this creates a repeat-sign-in prompt for returning approved users, apply the smallest route-state fix in `src/lib/supabase/middleware.ts`.
  - [x] Preserve public/legal route access and existing legacy direct routes unless directly required by this story.
- [x] Preserve or surface X identity context for admission review (AC: 2)
  - [x] Confirm current profile/session data sources for X identity: `profiles.x_handle`, `profiles.avatar_url`, Supabase `user.user_metadata` display fallbacks, and the `handle_new_user()` trigger metadata mapping in migrations.
  - [x] Verify the admin candidate review surface selects and renders enough X identity context for pending users: handle, avatar, display name/email fallback, sponsor handle/name, and admission status.
  - [x] Do not use `user_metadata` as an authorization source; it may be used only as display/admission context fallback where data is non-authoritative.
  - [x] Treat `profiles.x_handle` as missing if it is `null` where possible or an empty string; current types mark it as a required string, so an empty string can still be a broken identity-context state.
  - [x] If `profiles.x_handle` is missing after OAuth callback and current schema/RLS allows a safe non-destructive update, document and implement the smallest safe population path using the established fallback order: `x_handle`, `user_name`, `preferred_username`. For avatar, use `avatar_url` then `picture` if supported. If not supported, record the blocker/risk rather than inventing schema or relying on unsafe assumptions.
  - [x] Preserve referral cookie and sponsorship-request behavior unless a direct session/auth bug is found.
- [x] Keep signed-out route boundaries intact (AC: 4)
  - [x] Verify signed-out users cannot access protected `(app)` routes and are redirected to `/connexion`.
  - [x] Preserve public routes: `/`, `/connexion`, `/inscription`, `/rejoindre`, `/en-attente`, `/mentions-legales`, `/confidentialite`, `/cgu`, and `/auth/*`.
  - [x] Preserve security headers currently set by `src/lib/supabase/middleware.ts`.
- [x] Add/update targeted tests (AC: 1, 3, 4, 5)
  - [x] Keep `src/__tests__/auth-url.test.ts` covering `NEXT_PUBLIC_SITE_URL`, local browser origin, protocol normalization, and fallback callback URL behavior.
  - [x] Add source-inspection or behavior-level coverage for middleware returning-session routes, especially approved/onboarded auth-entry redirects and signed-out protected-route blocking.
  - [x] Extend `src/__tests__/public-access-positioning.test.ts` only if preserving OAuth entry strings belongs naturally there; otherwise prefer a focused auth/session test under `src/__tests__`.
  - [x] Avoid tests that require live X OAuth or production Supabase writes.
- [x] Verify and record baseline/regression status (AC: 1, 2, 3, 4, 5)
  - [x] Run `npx vitest run src/__tests__/auth-url.test.ts` plus any new/changed focused test file.
  - [x] Run `npx vitest run src/__tests__/public-access-positioning.test.ts src/__tests__/mvp-route-cleanup.test.ts` if auth/public route assertions are touched.
  - [x] Run `npm run lint` if practical and classify known baseline failures separately from new regressions.
  - [x] If a runtime server is available, manually verify the return-session flow with existing authenticated cookies; otherwise record the manual verification gap honestly.

## Dev Notes

### Story Scope

Story 2.2 is an auth/session preservation story. It should keep the X OAuth path working, prevent returning authenticated users from being asked to sign in again unnecessarily, and preserve enough X identity context for manual admission review. It is not a redesign of admission forms, a new auth provider, a Supabase schema rewrite, a public copy cleanup story, or a complete route-boundary enforcement pass. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.2: Preserve X Sign-In and Returning Session Behavior`]

The implementation must be the smallest brownfield-safe change set needed to satisfy the acceptance criteria. Do not change dependencies, package locks, generated types, Supabase migrations, RLS policies, X provider configuration, or environment variable names unless a concrete launch-blocking issue is found and owner approval is obtained for production-impacting work. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`]

### Epic 2 Context

Epic 2 owns private club entry, X auth, admission data capture, pending/refused/onboarding/approved routing, and route blocking for non-member states. Story 2.1 already aligned public/access copy with manual closed-beta admission; Story 2.2 must preserve the runtime X sign-in/session behavior behind that copy. [Source: `_bmad-output/planning-artifacts/epics.md#Epic 2: Private Club Entry, Identity, and Admission`; Source: `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md#Completion Notes List`]

Cross-story boundaries in Epic 2:

- Story 2.3 will capture required admission/profile information; do not add new admission fields here unless required to retain existing X identity context.
- Story 2.4 will refine explicit pending/refused states; preserve `/en-attente` behavior and refused-state boundary.
- Story 2.5 will route approved users through onboarding or into `/chat`; this story may fix returning-session prompts but should not redesign onboarding.
- Story 2.6 will enforce the complete admission-state route matrix; this story must not claim all route/data boundaries are solved unless specifically verified.

### Product and UX Requirements

X authentication is central to MVP identity continuity. The product needs candidates to sign in with X so admins can connect the app account to known X-native community context for manual admission review. [Source: `_bmad-output/planning-artifacts/prd.md#Identity and Authentication`; Source: `_bmad-output/planning-artifacts/prd.md#Integration Requirements`]

Returning users should not hit confusing re-authentication loops. Approved onboarded users should land on `/chat`; approved not-onboarded users should reach onboarding; pending/refused users should reach explicit status boundaries; signed-out users should only access public and auth-appropriate routes. [Source: `_bmad-output/planning-artifacts/prd.md#Reliability`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`; Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]

User-facing copy remains French-first where touched, but this story should only change copy where it directly prevents repeated-auth confusion or clarifies X sign-in state. Preserve the existing MVP UI foundation and mobile-safe auth entry layout. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation`; Source: `_bmad-output/project-context.md#Code Organization And UI`]

### Architecture Compliance

Active stack and constraints:

- Next.js `16.2.1` App Router with React `19.2.4`.
- TypeScript strict mode with `@/*` imports from `src`.
- Supabase via `@supabase/ssr ^0.9.0` and `@supabase/supabase-js ^2.100.1`.
- Browser Supabase access must use `src/lib/supabase/client.ts`.
- Server Supabase access must use `src/lib/supabase/server.ts` or the existing approved SSR cookie-adapter exceptions in `src/app/auth/callback/route.ts` and `src/lib/supabase/middleware.ts`.
- Middleware/session refresh must use `src/lib/supabase/middleware.ts` and root `middleware.ts` unless a specific approved Next.js 16 proxy migration story exists.
- Environment variables must remain `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`.

[Source: `_bmad-output/project-context.md#Technology Stack & Versions`; Source: `_bmad-output/planning-artifacts/architecture.md#Technical Constraints & Dependencies`; Source: `package.json`]

Allowed communication patterns for this story are existing Client Component OAuth calls, the existing `/auth/callback` Route Handler, middleware/session refresh, Server Component route guards, and Supabase reads/updates only through existing helpers or existing SSR client boundaries. The direct `createServerClient` usage in `src/app/auth/callback/route.ts` and `src/lib/supabase/middleware.ts` is an existing cookie-adapter exception because those files must read/write request and response cookies; do not create new direct Supabase clients outside those patterns. Do not introduce GraphQL, tRPC, NextAuth, Prisma, Drizzle, a new REST API hierarchy, a service layer, or a global state library. [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`; Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`]

### Latest Technical Notes

Supabase and Next.js current-doc constraints for this story: keep OAuth provider `x`; keep the PKCE callback exchange through `exchangeCodeForSession`; use the existing publishable-key env contract; do not downgrade server auth checks to `getSession()`; never use user-editable `user_metadata` for authorization; do not migrate `middleware.ts` to `proxy.ts`; preserve `NextResponse.redirect` in `/auth/callback` unless a minimal fix requires otherwise. [Source: `https://supabase.com/docs/guides/auth/social-login/auth-twitter.md` fetched 2026-05-05; Source: `https://supabase.com/docs/guides/auth/server-side/nextjs.md` fetched 2026-05-05; Source: Supabase skill security checklist; Source: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md#middleware-to-proxy`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`]

### Current State of Files To Audit

`src/app/rejoindre/page.tsx`

- Current state: Client access page using `useSearchParams`, optional `ref`, `ml-referral` cookie, `createClient()` from `src/lib/supabase/client.ts`, and `supabase.auth.signInWithOAuth({ provider: "x", options: { redirectTo: getAuthCallbackUrl() } })`. The route is public and wrapped in `<Suspense>` because it uses `useSearchParams`.
- What this story may change: Add minimal returning-session handling only if middleware cannot cover `/rejoindre`, or improve local OAuth error/loading feedback if current behavior creates repeated-auth confusion.
- Preserve: `provider: "x"`, `getAuthCallbackUrl()`, referral cookie behavior, Suspense boundary, mobile-safe card layout, French-first copy from Story 2.1.

`src/app/(auth)/inscription/page.tsx`

- Current state: Client auth entry page with direct X OAuth through existing browser Supabase helper and `getAuthCallbackUrl()`.
- What this story may change: Minimal loading/error handling or copy only if needed for sign-in/session clarity.
- Preserve: Existing OAuth provider/callback helper, no ad hoc Supabase client, Story 2.1 closed-beta wording.

`src/app/(auth)/connexion/page.tsx`

- Current state: Client login page delegates X OAuth button to `OAuthButtons` and links non-members to `/inscription`.
- What this story may change: Only if returning-session copy or link behavior directly causes repeated-auth confusion.
- Preserve: `OAuthButtons`, `/inscription` access request link, layout pattern.

`src/components/auth/oauth-buttons.tsx`

- Current state: Client component with local `loading` state, `createClient()` from browser helper, `signInWithOAuth({ provider: "x", options: { redirectTo: getAuthCallbackUrl() } })`, disabled button while loading.
- What this story may change: Add minimal error recovery if needed; preserve button semantics and X provider.
- Preserve: Existing browser helper, `getAuthCallbackUrl()`, local loading state, no service-layer abstraction.

`src/app/auth/callback/route.ts`

- Current state: Route Handler reads `code`, creates a Supabase SSR client directly with `createServerClient`, exchanges the code with `exchangeCodeForSession`, reads the user, queries `profiles(status, onboarding_completed)`, then routes approved/onboarded to `/chat`, approved/not-onboarded to `/onboarding`, and all other profiles to `/en-attente`. It handles referral cookie, sponsor lookup, `sponsorship_requests` insert, and clears `ml-referral`.
- What this story may change: Fix only proven callback/session bugs or X identity-context persistence gaps. If refactoring to use the existing server helper is not straightforward because this route must collect cookies before creating the final redirect response, preserve the current explicit `createServerClient` pattern.
- Preserve: Code exchange, cookie writes on final redirect response, referral/sponsor behavior unless proven buggy, no destructive DB changes, no service-role key, no secret exposure.

`src/lib/auth-url.ts`

- Current state: Central helper builds `/auth/callback` from local browser origin on localhost-like hosts, otherwise `NEXT_PUBLIC_SITE_URL`, falling back to `https://le-marche-libre.vercel.app`. It normalizes missing protocol to `https://`.
- What this story may change: Only if callback URL behavior is proven wrong for returning sessions or deployed OAuth; preserve existing tests if changed.
- Preserve: Env contract and existing fallback behavior unless explicitly justified.

`src/lib/supabase/middleware.ts`

- Current state: Session refresh and route-state redirect layer. Public routes include `/`, `/connexion`, `/inscription`, `/en-attente`, `/rejoindre`, legal routes, and `/auth/*`. Signed-out protected access redirects to `/connexion`. Authenticated non-legal routes query `profiles(status, onboarding_completed)`. Rejected users are sent to `/en-attente` except `/connexion`; pending users to `/en-attente`; approved/not-onboarded to `/onboarding`; approved/onboarded users on `/`, `/connexion`, `/inscription`, or `/en-attente` redirect to `/chat`.
- What this story may change: Add `/rejoindre` to the approved/onboarded auth-entry redirect condition if returning approved users can currently see the sign-in/request page again. Consider whether approved/not-onboarded and pending users should also avoid `/rejoindre` repeat sign-in by existing pending/onboarding checks.
- Preserve: Legal route public access, rejected explicit `/en-attente` boundary, security headers, signed-out protected redirect, no broad route matrix rewrite.

`middleware.ts`

- Current state: Thin root middleware wrapper exporting `middleware(request)` and matcher.
- What this story may change: None expected.
- Preserve: Do not migrate to `proxy.ts` in this story.

`src/app/(auth)/en-attente/page.tsx`

- Current state: Server Component reads user, profile `id,status,onboarding_completed,x_handle,sponsor_approved`, and uses `profiles.x_handle` or `user.user_metadata?.user_name/preferred_username` for display. Rejected users see an explicit refused state. Approved users redirect to `/chat` or `/onboarding`. Pending users see invitation/sponsorship state.
- What this story may change: Only if X identity context is not surfaced enough for admission review display; do not redesign pending/refused UX.
- Preserve: Refused state at `/en-attente`, no login loop, no authorization based on `user_metadata`.

`src/app/(app)/layout.tsx`

- Current state: Protected app layout reads authenticated user and full profile; redirects unauthenticated/no profile to `/connexion`, pending/rejected to `/en-attente`, approved/not-onboarded to `/onboarding`, then renders `AppShell`.
- What this story may change: None expected unless a returning-session regression is found.
- Preserve: Protected route guard, pending/refused boundaries, approved/not-onboarded onboarding redirect.

`src/app/onboarding/page.tsx`

- Current state: Server Component redirects unauthenticated to `/connexion`, missing profile to `/connexion`, non-approved to `/en-attente`, onboarded approved users to `/chat`, and renders `OnboardingWizard` for approved not-onboarded users.
- What this story may change: None expected.
- Preserve: Onboarding state routing; do not redesign or add fields for Story 2.2.

`src/lib/supabase/client.ts`

- Current state: Exports `createClient()` using `createBrowserClient` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- What this story may change: None expected.
- Preserve: This remains the only browser Supabase client helper.

`src/lib/supabase/server.ts`

- Current state: Exports async `createClient()` using Next.js 16 async `cookies()` and `createServerClient`; `setAll` ignores Server Component cookie-write failures because middleware refreshes sessions.
- What this story may change: None expected.
- Preserve: Async cookies pattern; do not introduce synchronous cookie access.

`src/lib/types/database.ts`

- Current state: `Profile` includes `x_handle`, `avatar_url`, `status: "pending" | "approved" | "rejected"`, `sponsored_by`, `sponsor_approved`, and `onboarding_completed`. It does not expose a separate durable raw X OAuth identity table/type.
- What this story may change: None expected unless generated types are explicitly regenerated by an approved schema story.
- Preserve: Do not manually edit generated-like types to fake schema support.

`src/app/(app)/admin/utilisateurs/page.tsx`

- Current state: Server Component uses the existing server Supabase helper, selects pending profiles with `*, sponsor:profiles!sponsored_by(x_handle, full_name)`, renders avatar from `user.avatar_url`, handle from `user.x_handle`, display fallback from `user.full_name || user.email`, sponsor handle/name context, created date, and approval/refusal controls. The all-users table renders handle links to `https://x.com/${user.x_handle}`.
- What this story may change: Only if AC2 verification shows admin admission review lacks required X identity context because `x_handle`/`avatar_url` are missing, empty, or not safely surfaced.
- Preserve: Admin-only protection inherited from `(app)/admin` boundaries, existing server helper, pending candidate list, sponsor context, and approve/refuse controls. Do not redesign admin operations in this story.

`supabase/migrations/00001_initial_schema.sql` and `supabase/migrations/00003_sponsorship_system.sql`

- Current state: Initial `handle_new_user()` inserted `x_handle` from `raw_user_meta_data->>'x_handle'` only. Migration `00003_sponsorship_system.sql` replaced it with fallback extraction: `x_handle`, `user_name`, `preferred_username`; avatar extraction: `avatar_url`, `picture`; then inserts `profiles(id, email, full_name, x_handle, avatar_url, referral_code, sponsored_by)`. Production schema may differ until verified.
- What this story may change: No migration expected. If runtime behavior shows the trigger is missing/incorrect in production, document the schema drift as a blocker or follow-up requiring owner-approved Supabase work.
- Preserve: Do not edit migrations or apply production SQL during Story 2.2 without explicit approval.

`src/__tests__/auth-url.test.ts`

- Current state: Covers local browser origin, `NEXT_PUBLIC_SITE_URL`, protocol normalization, and fallback Vercel callback URL.
- What this story may change: Add cases only if `getAuthCallbackUrl()` changes.
- Preserve: Existing callback URL contract.

### Testing Requirements

Minimum targeted tests:

- `npx vitest run src/__tests__/auth-url.test.ts`
- A focused middleware/session test if middleware returning-session behavior changes.
- `npx vitest run src/__tests__/public-access-positioning.test.ts src/__tests__/mvp-route-cleanup.test.ts` if public/auth route strings or source-inspection assertions are touched.

Suggested coverage additions:

- Approved/onboarded authenticated user on `/rejoindre` should not be offered another X sign-in if middleware can route them to `/chat`.
- Exact authenticated `/rejoindre` matrix: approved/onboarded -> `/chat`, approved/not-onboarded -> `/onboarding`, pending -> `/en-attente`, rejected -> `/en-attente`, signed-out -> allowed.
- Signed-out access to protected paths should still redirect to `/connexion`.
- Rejected users should still reach `/en-attente` and not be redirected into a login loop.
- OAuth entry files should continue to contain `provider: "x"` and `getAuthCallbackUrl()`.
- Browser/server code should continue using existing Supabase helpers and env names.
- Admin pending-candidate review should select/render `x_handle`, `avatar_url`, display fallback, sponsor handle/name, and current admission state without requiring live X OAuth.

Known baseline from recent stories:

- Story 2.1 targeted public positioning tests passed after review patches.
- Full `npx vitest run` has known baseline failures in `src/__tests__/profile-utils.test.ts` availability-label assertions unless changed.
- `npm run lint` has a known baseline shape around 94 problems (52 errors, 42 warnings), including pre-existing `<img>` warnings in some UI files. Classify new issues separately. [Source: `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md#Debug Log References`]

### Previous Story Intelligence

Story 2.1 changed public/access/legal copy and explicitly preserved runtime auth mechanics. It updated `/inscription` and `/rejoindre` copy while preserving Supabase X OAuth, `getAuthCallbackUrl()`, referral cookie behavior, and returning-session mechanics. Story 2.2 must recheck those same files because they are now auth-critical and were recently edited. [Source: `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md#Completion Notes List`]

Review findings from Story 2.1 show that auth/access wording and public hero/search copy needed multiple correction passes. For Story 2.2, do not assume existing copy or state messages are correct without reading current files; however, prioritize runtime/session behavior over copy polish. [Source: `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md#Review Findings`]

Story 2.1 accepted a residual responsive risk because runtime 375px viewport verification was explicitly bypassed by the owner. Do not claim manual viewport verification in Story 2.2 unless actually performed. [Source: `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md#Completion Notes List`]

Epic 1 carry-forward remains active: refused users must see explicit refused state at `/en-attente`, authorization must fail closed, and verification records must distinguish baseline failures from regressions. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`]

### Git Intelligence Summary

Recent commits before this story:

- `e33c9ea Merge pull request #30 from Marche-Libre/story/2-1-public-access-positioning`
- `2dad6b6 fix: resolve story 2.1 review findings`
- `c8da915 fix: align public access positioning with closed beta admission`
- `71d8c98 docs: create story 2.1 public access guide`
- `5208027 docs: finalize story 1.4 launch risk register`

Recent implementation pattern: create a comprehensive BMad story, implement minimal scoped runtime/copy changes, add targeted source-inspection or focused Vitest coverage, run review patches, and update sprint status. Follow the same discipline: small changes, no dependency churn, exact verification logs, and honest baseline classification. [Source: `git log -5 --oneline` and `git show --stat --oneline -5` on 2026-05-05]

### Anti-Patterns To Avoid

- Do not replace Supabase Auth or add NextAuth, Auth.js, Firebase Auth, Clerk, custom JWTs, password auth, email magic links, or another provider.
- Do not change X OAuth provider from `x` or add the deprecated Twitter OAuth 1.0a path.
- Do not create ad hoc Supabase clients in components, route handlers, or helpers; the only direct `createServerClient` exceptions are the existing cookie-adapter patterns in `/auth/callback` and middleware.
- Do not introduce `NEXT_PUBLIC_SUPABASE_ANON_KEY`, service-role keys, secret keys, or alternate env names.
- Do not use `user_metadata` for authorization or admission-state decisions.
- Do not infer approval from sponsor presence, referral cookie, profile completion, or client-only state.
- Do not redirect refused users to `/connexion` in a way that hides refused status or creates a login loop.
- Do not delete or migrate routes such as `/rejoindre`, `/inscription`, `/connexion`, `/en-attente`, `/chat`, `/forum`, `/membres`, or legal routes.
- Do not convert `middleware.ts` to `proxy.ts` as part of this story.
- Do not add schema migrations, generated type changes, or production Supabase writes without explicit owner approval.
- Do not claim X profile context is durably retained unless verified in current schema/runtime behavior.

### References

- `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`
- `_bmad-output/project-context.md#Technology Stack & Versions`
- `_bmad-output/planning-artifacts/epics.md#Story 2.2: Preserve X Sign-In and Returning Session Behavior`
- `_bmad-output/planning-artifacts/epics.md#Epic 2: Private Club Entry, Identity, and Admission`
- `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`
- `_bmad-output/planning-artifacts/prd.md#Identity and Authentication`
- `_bmad-output/planning-artifacts/prd.md#Reliability`
- `_bmad-output/planning-artifacts/prd.md#Integration Requirements`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`
- `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md`
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`
- `https://supabase.com/docs/guides/auth/social-login/auth-twitter.md`
- `https://supabase.com/docs/guides/auth/server-side/nextjs.md`
- `src/app/rejoindre/page.tsx`
- `src/app/(auth)/inscription/page.tsx`
- `src/app/(auth)/connexion/page.tsx`
- `src/components/auth/oauth-buttons.tsx`
- `src/app/auth/callback/route.ts`
- `src/lib/auth-url.ts`
- `src/lib/supabase/middleware.ts`
- `middleware.ts`
- `src/app/(auth)/en-attente/page.tsx`
- `src/app/(app)/admin/utilisateurs/page.tsx`
- `src/app/(app)/layout.tsx`
- `src/app/onboarding/page.tsx`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/types/database.ts`
- `src/__tests__/auth-url.test.ts`
- `supabase/migrations/00001_initial_schema.sql`
- `supabase/migrations/00003_sponsorship_system.sql`

## Change Log

| Date       | Change                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| 2026-05-05 | Created comprehensive Story 2.2 developer guide for X OAuth, returning sessions, and identity-context guardrails. |
| 2026-05-05 | Implemented Story 2.2 auth-session fix for `/rejoindre` returning users, added focused middleware coverage, and recorded baseline verification results. |
| 2026-05-05 | Expanded middleware coverage from source inspection to behavior-level auth-route matrix tests after independent review feedback. |
| 2026-05-05 | Completed final focused review with no blockers and marked Story 2.2 done. |

## Dev Agent Record

### Agent Model Used

openai/gpt-5.5

### Debug Log References

- `npx vitest run src/__tests__/auth-session-middleware.test.ts` (initially failed before middleware fix, then passed)
- `npx vitest run src/__tests__/auth-url.test.ts src/__tests__/auth-session-middleware.test.ts` (passed)
- `npx vitest run src/__tests__/public-access-positioning.test.ts src/__tests__/mvp-route-cleanup.test.ts` (passed)
- `npx vitest run src/__tests__/auth-session-middleware.test.ts src/__tests__/auth-url.test.ts` (passed after behavior-level middleware test expansion: 14 tests)
- `npx vitest run src/__tests__/public-access-positioning.test.ts src/__tests__/mvp-route-cleanup.test.ts` (passed after behavior-level middleware test expansion: 13 tests)
- `npx vitest run src/__tests__/auth-session-middleware.test.ts src/__tests__/auth-url.test.ts src/__tests__/public-access-positioning.test.ts src/__tests__/mvp-route-cleanup.test.ts` (passed final focused verification: 27 tests)
- Final focused review subagent found no blockers; noted untracked files must be included before commit/merge.
- `npx vitest run` (final check: baseline failures in `src/__tests__/profile-utils.test.ts`; 56 tests passed, 3 baseline failures)
- `npm run lint` (final check: baseline 94 problems / 52 errors / 42 warnings, unchanged by this story)

### Completion Notes List

- Verified all audit targets listed in Story 2.2 Dev Notes and confirmed existing X OAuth flow still uses `provider: "x"` with `getAuthCallbackUrl()` through approved Supabase helpers.
- Applied the smallest returning-session fix in `src/lib/supabase/middleware.ts` by adding `/rejoindre` to approved+onboarded auth-entry redirects to `/chat`.
- Added behavior-level coverage in `src/__tests__/auth-session-middleware.test.ts` for the `/rejoindre` auth matrix, adjacent auth-entry redirects, signed-out public access, signed-out protected-route blocking, and pending/rejected protected-route blocking.
- Verified targeted regression tests pass for auth URL logic, behavior-level middleware routing, and route/public positioning assertions.
- Full suite/lint baseline remains pre-existing (`profile-utils` label assertions and existing lint backlog); no new failures introduced by this story change.
- Independent review findings were addressed with behavior-level middleware tests; final focused review found no blockers.
- Manual runtime verification with live authenticated cookies was not executed in this run; this is an explicitly recorded verification gap.

### File List

- src/lib/supabase/middleware.ts
- src/__tests__/auth-session-middleware.test.ts
- _bmad-output/implementation-artifacts/2-2-preserve-x-sign-in-and-returning-session-behavior.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
