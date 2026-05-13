# Story 2.3: Capture Required Admission and Profile Information

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to provide only the information needed for admission and member recognition,
so that I can submit an access request without unnecessary friction or unclear data collection.

## Acceptance Criteria

1. Given a candidate has authenticated with X and lacks a complete admission/profile request, when they reach the admission or onboarding information form, then the form collects only information needed for X identity checking, manual admission, member recognition, sponsor/parrain tracking where supported, beta operations, and access control.
2. Validation errors are inline where practical and written in user-facing language.
3. The candidate can submit an access request for manual review.
4. Submitted state maps to the existing admission/status source of truth or records schema uncertainty as an implementation blocker.
5. If existing schema, RLS, generated types, policies, functions, triggers, views, or migrations do not support this behavior, the implementation documents the blocker/risk, affected PRD requirement, user impact, and proposed minimal follow-up before adding migrations or accepting beta risk.
6. No destructive database changes are made without explicit approval.

## Tasks / Subtasks

- [x] Audit current admission/profile state before editing (AC: 1, 3, 4, 5, 6)
  - [x] Read every file listed in `Current State of Files To Audit`; confirm current behavior still matches this guide before making changes.
  - [x] Trace the current authenticated candidate path after X callback: `/auth/callback` creates or finds a `profiles` row, non-approved users route to `/en-attente`, and `/onboarding` is currently reserved for approved-but-not-onboarded users.
  - [x] Identify which current `profiles` fields are safe for a pending candidate to self-update under the local migrations and generated-like types.
  - [x] Record any production schema/RLS uncertainty honestly; do not assume local migrations are applied to production.
- [x] Define the minimal admission/profile request data contract (AC: 1, 4, 5)
  - [x] Reuse existing `profiles` fields where supported: X identity from `x_handle`/`avatar_url`, `first_name`, `last_name`, `full_name`, `specialty_ids`, `specialty_category_id` or `specialty_category_ids` where already present, `location`, `bio`, `sponsored_by`, `sponsor_approved`, and existing `sponsorship_requests` where needed.
  - [x] Keep the required fields minimal for admission review and member recognition. Recommended MVP minimum: display name or first/last name, professional/category context, location or country/city context, short motivation/context text using an existing safe text field if no dedicated field exists, and optional sponsor/parrain handle through existing sponsorship request behavior.
  - [x] Do not add future-only fields for broad annuaire, jobs/offers, private DMs, E2E encryption, Nostr, AI, Lightning, media, polls, or platformization.
  - [x] If no existing field can safely store a required admission motivation/context, document the schema blocker and propose the smallest additive migration before adding it.
- [x] Implement or adapt the candidate-facing admission information form (AC: 1, 2, 3)
  - [x] Prefer a small form on the current pending boundary (`/en-attente`) or a nearby component under `src/components/sponsorship`/`src/components/auth` rather than opening `/onboarding` to pending users, unless route-state analysis proves a safer minimal path.
  - [x] Do not reuse `OnboardingWizard` wholesale for pending candidates. It is marked archived/potentially unused, is approved-user-only today, includes post-approval discovery/invite steps, and can over-collect beyond this story.
  - [x] If reusing pieces from `OnboardingWizard`, extract only the minimal field/UI patterns needed and preserve the approved-user onboarding flow for Story 2.5.
  - [x] Keep user-facing copy French-first, explicit, and human: X sign-in starts a manual admission request; submitting does not grant immediate membership.
  - [x] Show existing X identity context from the authenticated profile/session without letting users edit authorization-relevant fields.
  - [x] Preserve sponsor/parrain tracking through existing `ml-referral`, `sponsored_by`, `sponsor_approved`, `sponsorship_requests`, and invitation flows unless a concrete blocker is found.
- [x] Save submission through authorized, minimal Supabase paths (AC: 3, 4, 5, 6)
  - [x] Use existing Supabase helpers only: `src/lib/supabase/server.ts` for Server Components/Server Actions, `src/lib/supabase/client.ts` only for browser interactions that already require a Client Component.
  - [x] Prefer a Server Action for the admission/profile submission if adding a new form mutation. Verify auth and profile ownership inside the Server Action even if the page is protected.
  - [x] Update only safe self-editable profile fields. Do not let candidates update `status`, `is_admin`, `sponsored_by`, `sponsor_approved`, `onboarding_completed`, `chat_banned`, `chat_muted_until`, role fields, or access-control fields.
  - [x] Treat `profiles.status = "pending"` as the existing submitted/manual-review source of truth if the schema has no separate `submitted_at` or `admission_request_completed` field. If this is insufficient to distinguish incomplete and submitted requests, document the schema gap before adding fields.
  - [x] After successful submit, keep the candidate on an explicit pending/manual-review state and avoid redirecting them to `/chat` or approved onboarding.
  - [x] Do not perform destructive SQL or production Supabase writes without explicit owner approval.
- [x] Preserve route and access boundaries (AC: 3, 4, 6)
  - [x] Pending and rejected users must remain blocked from protected `(app)` routes and member data.
  - [x] `/onboarding` must still redirect non-approved users to `/en-attente` unless this story deliberately changes the route contract with tests and clear rationale.
  - [x] Approved/not-onboarded users must still reach `/onboarding`; approved/onboarded users must still reach `/chat`.
  - [x] Do not delete or rename `/en-attente`, `/onboarding`, `/rejoindre`, `/inscription`, `/connexion`, `/chat`, legal routes, or legacy protected routes.
- [x] Add focused tests and verification (AC: 1, 2, 3, 4, 5, 6)
  - [x] Add targeted source-inspection or behavior-level tests under `src/__tests__` for the admission form route/state contract and forbidden sensitive-field updates.
  - [x] Extend `src/__tests__/auth-session-middleware.test.ts` only if middleware route behavior changes.
  - [x] Add component/action tests only if they can run without live X OAuth or production Supabase writes.
  - [x] Run targeted Vitest for new/changed tests and record exact commands/outcomes.
  - [x] Run `npm run lint` if practical and classify known baseline failures separately from new regressions.
  - [x] If running the full suite, classify known `src/__tests__/profile-utils.test.ts` availability-label failures as baseline unless changed.

### Review Findings

- [x] [Review][Patch] Validate category-only specialty submissions [src/app/(auth)/en-attente/actions.ts:89]
- [x] [Review][Patch] Support display-name-only profiles in the name requirement [src/app/(auth)/en-attente/actions.ts:54]
- [x] [Review][Patch] Add behavior-level coverage for admission action and branch edge cases [src/__tests__/admission-profile-request.test.ts:23]

## Dev Notes

### Story Scope

Story 2.3 is the candidate admission/profile information capture story. It should let an X-authenticated, non-approved candidate provide the minimum information needed for manual review and later member recognition, then remain in a clear manual-review/pending state. It is not an approval workflow, refused-state redesign, complete onboarding redesign, route-boundary enforcement pass, schema/RLS overhaul, admin review UI, public copy story, or member discovery expansion. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.3: Capture Required Admission and Profile Information`]

The implementation must be the smallest brownfield-safe change set needed to satisfy the acceptance criteria. Do not change dependencies, package locks, generated types, Supabase migrations, RLS policies, X provider configuration, or environment variable names unless a concrete blocker is found and explicit owner approval is obtained for production-impacting work. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`]

### Epic 2 Context

Epic 2 owns private club entry, X auth, admission data capture, pending/refused/onboarding/approved routing, and route blocking for non-member states. Story 2.1 aligned public/access copy with closed-beta manual admission. Story 2.2 preserved X OAuth and returning-session routing, including `/rejoindre` redirects for already authenticated users. Story 2.3 now fills the gap after X authentication: pending candidates need a minimal profile/admission request before manual admin review. [Source: `_bmad-output/planning-artifacts/epics.md#Epic 2: Private Club Entry, Identity, and Admission`; Source: `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md#Completion Notes List`; Source: `_bmad-output/implementation-artifacts/2-2-preserve-x-sign-in-and-returning-session-behavior.md#Completion Notes List`]

Cross-story boundaries in Epic 2:

- Story 2.4 will refine explicit pending and refused status UX; keep this story focused on the request form and submitted pending state.
- Story 2.5 will route approved users through onboarding or `/chat`; do not solve approved-user onboarding loops here except to preserve them.
- Story 2.6 will enforce the full admission-state route matrix; this story should preserve existing guards and test changed boundaries only.
- Epic 4 will build owner/admin candidate review; this story should provide data for review, not build the full admin operation.

### Product and UX Requirements

The candidate should understand that X identity plus the form creates a manual admission request, not automatic membership. User-facing copy should be French-first, explicit, and avoid database terms such as `rejected` or schema jargon. [Source: `_bmad-output/planning-artifacts/prd.md#Admission and Onboarding`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`]

Data collection must stay limited to authentication, manual admission, member recognition, beta operations, sponsor/parrain tracking where supported, and access control. Do not collect broad future-profile, marketplace, jobs/offers, DM, or analytics fields just because they exist in the brownfield schema. [Source: `_bmad-output/planning-artifacts/prd.md#Privacy and Compliance`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns`]

Inline validation should use user-facing language and be practical rather than overbuilt. Critical form states should cover empty/missing required fields, saving/submitting, failed save, submitted/pending review, and schema/runtime uncertainty where discovered. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Loading and Empty States`]

Mobile usability matters because candidates may arrive from X links. Preserve existing responsive patterns, avoid broad layout rewrites, and verify the touched admission flow on mobile-sized layouts if practical. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`]

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

- Use Server Components for server-side admission/profile reads.
- Use Server Actions for new form submissions where feasible; always verify authentication and authorization inside the action.
- Use Client Components only for browser interaction and inline form state where needed.
- Use existing Supabase helpers; do not create ad hoc clients.
- Keep mutation paths minimal and local. Do not introduce GraphQL, tRPC, a separate REST backend, Prisma, Drizzle, Redux, Zustand, TanStack Query, a new service layer, or a new design system.

[Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`; Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`; Source: `node_modules/next/dist/docs/01-app/02-guides/forms.md#How-it-works`]

### Current State of Files To Audit

`src/app/auth/callback/route.ts`

- Current state: Exchanges X OAuth code, reads current user, queries `profiles(status, onboarding_completed)`, routes approved users to `/chat` or `/onboarding`, and routes all other users to `/en-attente`. It also processes `ml-referral` by setting `profiles.sponsored_by` and inserting into `sponsorship_requests` when possible.
- What this story may change: Nothing expected unless it must distinguish missing/incomplete admission request from submitted pending state and the schema supports it safely.
- Preserve: X OAuth `exchangeCodeForSession`, cookie writes on final response, referral cookie behavior, existing direct `createServerClient` cookie-adapter exception, no service-role key, no destructive DB change.

`src/app/(auth)/en-attente/page.tsx`

- Current state: Server Component for authenticated non-approved users. It reads `profiles(id,status,onboarding_completed,x_handle,sponsor_approved)`, shows an explicit refused state for `status === "rejected"`, redirects approved users to `/chat` or `/onboarding`, then shows pending/invitation/sponsorship request UI.
- What this story changes: Primary likely target. Add or integrate a minimal admission/profile information form for pending candidates who lack required request information, while preserving pending/refused boundaries and existing sponsorship/invitation content.
- Preserve: Refused users stay explicit at `/en-attente`; approved users redirect out; pending users do not access member routes; user-facing copy remains French-first.

`src/components/sponsorship/waiting-page-client.tsx`

- Current state: Client component lets pending users choose sponsor request or wait for admin review. It delegates sponsor handle capture to `SponsorRequestForm`.
- What this story may change: Integrate the admission/profile form into the pending flow, or show it before/alongside sponsor choice if required fields are missing.
- Preserve: Existing sponsor/wait choice semantics unless the new admission request state makes them clearer; do not remove manual admin review fallback.

`src/components/sponsorship/sponsor-request-form.tsx`

- Current state: Client form lets a pending user submit up to two sponsor handle attempts. It checks the sponsor handle against approved `profiles`, inserts into `sponsorship_requests`, and uses generic success text for privacy.
- What this story may change: Only if sponsor/parrain tracking needs to be sequenced with admission request submission or copy clarified.
- Preserve: Privacy-preserving handle lookup, self-sponsor rejection, max attempts behavior, existing `sponsorship_requests` schema, no candidate updates to trusted sponsorship fields.

`src/components/sponsorship/invitation-card.tsx`

- Current state: Client component updates `invitations.status` and `accepted_by`; Story 1.3 hardening removed direct profile approval from this component and relies on database triggers for trusted sponsorship updates.
- What this story may change: None expected.
- Preserve: Do not reintroduce direct candidate updates to `profiles.sponsored_by`, `sponsor_approved`, or `status` from client code.

`src/components/sponsorship/status-poller.tsx`

- Current state: Client component polls `profiles(status, sponsor_approved)`, redirects approved users to `/chat`, and refreshes pending server data otherwise.
- What this story may change: Possibly copy only if admission request submission adds a clearer pending state.
- Preserve: Polling must not infer approval from sponsor or profile completion; only `status === "approved"` should trigger approved routing.

`src/app/onboarding/page.tsx`

- Current state: Server Component for approved-not-onboarded users only. It redirects unauthenticated/missing profile to `/connexion`, non-approved users to `/en-attente`, onboarded users to `/chat`, then renders `OnboardingWizard` with profile, specialties, countries, sponsor, and approved member previews.
- What this story may change: None expected unless naming/copy must clarify that this is post-approval onboarding.
- Preserve: Non-approved users must not reach approved onboarding unless this story intentionally changes route contracts with tests. Do not break Story 2.5's approved-user onboarding responsibility.

`src/components/onboarding/onboarding-wizard.tsx`

- Current state: Large archived/potentially-unused Client Component for approved users. It uses browser Supabase updates directly for profile fields, marks `onboarding_completed` true, inserts a welcome notification, and redirects to `/chat`. It includes post-approval discovery and invite steps that exceed Story 2.3.
- What this story may change: Avoid editing if possible. If reusing UI patterns, extract minimally or copy local field patterns into a new smaller pending-admission component.
- Preserve: Do not let pending candidates set `onboarding_completed` or redirect to `/chat`. Do not import broad discovery/member matching into pending admission.

`src/lib/types/database.ts`

- Current state: Defines `Profile` with fields including `first_name`, `last_name`, `specialty_ids`, `specialty_category_id`, `specialty_category_ids`, `location`, `bio`, `x_handle`, `avatar_url`, `status: "pending" | "approved" | "rejected"`, sponsorship fields, `onboarding_completed`, and richer profile fields. It is generated-like and may not perfectly prove production schema.
- What this story may change: None expected unless generated types are explicitly regenerated by an approved schema story.
- Preserve: Do not manually edit types to fake schema support.

`src/lib/profile-utils.ts`

- Current state: Provides visibility helpers, country constants, availability options, profile completeness calculation, and specialty display. Current completeness is broad and includes post-approval profile fields such as years experience, skills, website, daily rate, and avatar.
- What this story may change: Only if a small admission-request completeness helper is useful and kept focused. Do not reuse `getProfileCompleteness()` as the admission-required-field definition without narrowing it.
- Preserve: Existing member profile completeness tests and behavior unless directly required.

`src/app/(app)/admin/users/page.tsx`

- Current state: Admin pending-candidate list selects `profiles.*` plus sponsor handle/name, displays avatar, X handle, full name/email fallback, created date, sponsor state, and approve/reject controls.
- What this story may change: Usually none. If the admission form stores fields that are already selected by `*`, admin review may naturally surface some of them only if existing UI renders them. Full candidate detail/review belongs to Epic 4, so do not overbuild admin UI here.
- Preserve: Admin-only route boundaries, existing server helper, approval/refusal controls.

`src/app/(app)/admin/actions.ts`

- Current state: Server Actions approve/reject users after checking current user is admin. They update `profiles.status` only. Additional chat moderation actions also verify admin.
- What this story may change: None expected. Admission submission must not call these actions or expose admin mutations to candidates.
- Preserve: Candidate form must not update admission status to approved/rejected or mutate roles/access.

`src/lib/supabase/middleware.ts` and root `middleware.ts`

- Current state: Session refresh and route-state redirects. Public routes include `/`, `/connexion`, `/inscription`, `/en-attente`, `/rejoindre`, legal routes, and `/auth/*`. Signed-out protected access redirects to `/connexion`; pending/rejected users route to `/en-attente`; approved/not-onboarded users route to `/onboarding`; approved/onboarded users on auth-entry routes route to `/chat`.
- What this story may change: None expected if the admission form lives inside `/en-attente`. If route behavior changes, extend `src/__tests__/auth-session-middleware.test.ts`.
- Preserve: Legal/public access, rejected explicit `/en-attente` boundary, signed-out protected redirect, approved `/chat` destination.

`supabase/migrations/00001_initial_schema.sql`

- Current state: Creates `profiles` with `status` default `pending`, X identity fields, and broad self-update policy later hardened by Story 1.3 migration.
- What this story may change: No migration expected unless a required admission field is missing.
- Preserve: Do not destructively alter profiles or admission status values.

`supabase/migrations/00003_sponsorship_system.sql`

- Current state: Adds `referral_code`, `sponsored_by`, `sponsor_approved`, improves `handle_new_user()` X metadata fallback, and originally allowed sponsors to update sponsored users before later hardening.
- What this story may change: No migration expected.
- Preserve: Sponsor/parrain tracking semantics; do not rely on sponsor approval as admission approval.

`supabase/migrations/00011_sponsorship_requests.sql`

- Current state: Adds `sponsorship_requests` with `requester_id`, `sponsor_handle`, `sponsor_id`, `status`, `attempt_number`, RLS for requester/sponsor/admin select/update, and updated_at trigger.
- What this story may change: No migration expected unless request completion needs explicit schema support.
- Preserve: Request identity fields and attempt semantics.

`supabase/migrations/00014_onboarding.sql`

- Current state: Adds `profiles.onboarding_completed` and `looking_for`; also adds forum introduction support.
- What this story may change: No migration expected.
- Preserve: `onboarding_completed` remains post-approval onboarding state, not candidate request submission.

`supabase/migrations/00015_profile_enhancements.sql` and `00016_multi_specialties.sql`

- Current state: Add split name, experience, country, availability, skills, daily rate, website, visibility, and `specialty_ids`; migrate old specialty fields.
- What this story may change: No migration expected.
- Preserve: Do not require broad post-approval profile fields for admission unless product scope explicitly requires them.

`supabase/migrations/00008_specialty_categories.sql` and `00017_countries_and_cities.sql`

- Current state: Specialty categories/specialties are public-readable. Countries/cities tables exist locally, but countries/cities RLS policy support was not found in the loaded migration snippet; verify before relying on authenticated or public reads in production.
- What this story may change: Prefer existing data reads if current RLS supports them; otherwise use simpler inputs or document blocker.
- Preserve: Do not add database policies without explicit schema/RLS scope approval.

`supabase/migrations/20260503065247_harden_authorization_boundaries.sql`

- Current state: Adds `private` schema, hardens `public.is_admin()`, adds `prevent_sensitive_profile_update()` to block non-admin/non-trusted updates to `status`, `is_admin`, `chat_banned`, `chat_muted_until`, `sponsored_by`, and `sponsor_approved`, replaces self-update profile policy with safe self-update plus trigger enforcement, and adds trusted sponsorship/invitation triggers.
- What this story may change: No migration expected.
- Preserve: Candidate admission form must respect these sensitive-field boundaries and should not bypass them.

### Data Contract Guidance

Existing local schema can support a minimal request without adding tables if product accepts `profiles.status = "pending"` as submitted/manual-review state and safe profile fields as the request payload. Candidate-editable/safe fields are likely `first_name`, `last_name`, `full_name`, `specialty_ids`, `specialty_category_id`, `specialty_category_ids` if present, `location`, `bio`, `visibility`, and possibly `looking_for`. Verify production schema/RLS before relying on any field. [Source: `src/lib/types/database.ts`; Source: `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`]

Do not treat these as candidate-editable: `status`, `is_admin`, `sponsored_by`, `sponsor_approved`, `onboarding_completed`, `chat_banned`, `chat_muted_until`, roles, channel memberships, or admin/audit fields. [Source: `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`; Source: Supabase security checklist]

Do not use `user.user_metadata` or `raw_user_meta_data` for authorization. It may be used only as display/admission context fallback for X handle/avatar/name when non-authoritative. [Source: Supabase security checklist; Source: `_bmad-output/implementation-artifacts/2-2-preserve-x-sign-in-and-returning-session-behavior.md#Anti-Patterns To Avoid`]

If the implementation needs a durable distinction between `pending but form incomplete` and `pending submitted for manual review`, the current loaded schema does not show an obvious dedicated field such as `admission_request_completed` or `admission_submitted_at`. In that case, stop and document the schema/RLS blocker, affected FR9/FR10, user impact, and proposed smallest additive migration before adding schema. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.3: Capture Required Admission and Profile Information`; Source: `_bmad-output/planning-artifacts/architecture.md#Data Architecture`]

### Latest Technical Notes

Next.js 16 forms guidance says Server Actions can be called from forms, receive `FormData`, and must always verify authentication and authorization inside each Server Action even if the form is only rendered on an authenticated page. Use `useActionState` or `useFormStatus` for pending/error UI where a Client Component form is needed. [Source: `node_modules/next/dist/docs/01-app/02-guides/forms.md#How-it-works`; Source: `node_modules/next/dist/docs/01-app/02-guides/forms.md#Pending-states`]

Supabase SSR guidance says browser code should use the browser client helper, server code should use a request-bound server client, and server-side auth protection must not trust spoofable session data alone. This project currently uses `auth.getUser()` in existing helpers and route code; follow the existing helper pattern and do not create ad hoc clients. [Source: `https://supabase.com/docs/guides/auth/server-side/nextjs.md` fetched 2026-05-05; Source: `_bmad-output/project-context.md#Technical Implementation Rules`]

Supabase security checklist reminders for this story: never expose service-role keys in client code, never use `user_metadata` for authorization, remember RLS `UPDATE` needs a matching `SELECT` policy, and keep privileged/security-definer code out of exposed schemas unless already audited. [Source: Supabase skill security checklist]

### Testing Requirements

Minimum targeted tests:

- If adding a Server Action, test or source-inspect that it uses `src/lib/supabase/server.ts`, verifies current authenticated user, updates only safe profile fields, and does not update `status`, `is_admin`, `sponsored_by`, `sponsor_approved`, or `onboarding_completed`.
- If adding/updating pending admission UI, test or source-inspect that `/en-attente` still contains explicit pending/refused behavior and does not redirect pending users to `/chat` or `/onboarding`.
- If changing middleware, extend `src/__tests__/auth-session-middleware.test.ts` for pending/rejected/approved route outcomes.
- If touching public/access copy, run `npx vitest run src/__tests__/public-access-positioning.test.ts src/__tests__/mvp-route-cleanup.test.ts`.

Suggested verification commands:

- `npx vitest run <new-or-changed-test-file>`
- `npx vitest run src/__tests__/auth-session-middleware.test.ts` if route behavior changes
- `npx vitest run src/__tests__/authorization-hardening.test.ts` if candidate/profile update boundaries are touched or asserted
- `npm run lint` if practical

Known baseline from recent stories:

- Story 2.2 targeted auth/session/public route tests passed.
- Full `npx vitest run` has known baseline failures in `src/__tests__/profile-utils.test.ts` availability-label assertions unless changed.
- `npm run lint` has a known baseline shape around 94 problems (52 errors, 42 warnings), including pre-existing `<img>` warnings in UI files. Classify new issues separately. [Source: `_bmad-output/implementation-artifacts/2-2-preserve-x-sign-in-and-returning-session-behavior.md#Debug Log References`]

### Previous Story Intelligence

Story 2.2 changed only `src/lib/supabase/middleware.ts` and `src/__tests__/auth-session-middleware.test.ts` to route approved/onboarded authenticated users from `/rejoindre` to `/chat`. It explicitly preserved X OAuth, existing Supabase helpers, referral behavior, and pending/refused status boundaries. Story 2.3 must build on that by keeping `/rejoindre` as an access entry for signed-out users and `/en-attente` as the non-approved boundary after authentication. [Source: `_bmad-output/implementation-artifacts/2-2-preserve-x-sign-in-and-returning-session-behavior.md#Completion Notes List`]

Story 2.2 recorded that manual runtime verification with live authenticated cookies was not executed. Do not claim live X OAuth or production-session verification for Story 2.3 unless actually performed. [Source: `_bmad-output/implementation-artifacts/2-2-preserve-x-sign-in-and-returning-session-behavior.md#Completion Notes List`]

Story 2.1 review showed that public/access copy needed correction for overpromising automatic membership and broad discovery. For Story 2.3, keep admission form copy narrow: candidate request, manual review, no immediate member access, and only needed data. [Source: `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md#Review Findings`]

Epic 1 carry-forward remains active: refused users must see explicit refused state at `/en-attente`, authorization must fail closed, and verification records must distinguish baseline failures from regressions. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`]

### Git Intelligence Summary

Recent commits before this story:

- `6f309cc fix: preserve returning session routing for rejoindre`
- `e33c9ea Merge pull request #30 from Marche-Libre/story/2-1-public-access-positioning`
- `2dad6b6 fix: resolve story 2.1 review findings`
- `c8da915 fix: align public access positioning with closed beta admission`
- `71d8c98 docs: create story 2.1 public access guide`

Recent implementation pattern: create a comprehensive BMad story, implement minimal scoped changes, add targeted Vitest/source-inspection or behavior-level tests, run review patches, record baseline failures honestly, and update sprint status. Follow the same discipline: no dependency churn, no unverified completion claims, no broad refactors, and exact verification logs. [Source: `git log -5 --oneline`; Source: `git show --stat --oneline -5` on 2026-05-05]

### Anti-Patterns To Avoid

- Do not open `/chat` or protected app routes to pending, refused, logged-out, or non-member users.
- Do not let candidates set `status`, `is_admin`, `sponsored_by`, `sponsor_approved`, `onboarding_completed`, roles, access, ban/mute fields, channel memberships, or admin-only fields.
- Do not use `user_metadata` for authorization or admission-state decisions.
- Do not infer approval from sponsor presence, `sponsor_approved`, profile completion, referral cookie, client-side state, or submitted form state.
- Do not redirect refused users to `/connexion` in a way that hides refused status or creates a login loop.
- Do not reuse the full archived `OnboardingWizard` for pending admission if it collects post-approval discovery/invite data or sets `onboarding_completed`.
- Do not add Prisma, Drizzle, tRPC, GraphQL, NextAuth, Redux, Zustand, TanStack Query, a separate backend, or a new design system.
- Do not add schema migrations, generated type changes, production SQL, or destructive Supabase writes without explicit owner approval.
- Do not promise forum, annuaire, jobs/offers, broad search, DMs, E2E encryption, Nostr, AI, Lightning, media, polls, or platformization as current MVP functionality.
- Do not claim the admission request is complete if the schema cannot distinguish incomplete and submitted states and no blocker/risk is documented.

### References

- `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`
- `_bmad-output/project-context.md#Technology Stack & Versions`
- `_bmad-output/planning-artifacts/epics.md#Story 2.3: Capture Required Admission and Profile Information`
- `_bmad-output/planning-artifacts/epics.md#Epic 2: Private Club Entry, Identity, and Admission`
- `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`
- `_bmad-output/planning-artifacts/prd.md#Admission and Onboarding`
- `_bmad-output/planning-artifacts/prd.md#Privacy and Compliance`
- `_bmad-output/planning-artifacts/architecture.md#Data Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`
- `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md`
- `_bmad-output/implementation-artifacts/2-2-preserve-x-sign-in-and-returning-session-behavior.md`
- `node_modules/next/dist/docs/01-app/02-guides/forms.md`
- `https://supabase.com/docs/guides/auth/server-side/nextjs.md`
- `src/app/auth/callback/route.ts`
- `src/app/(auth)/en-attente/page.tsx`
- `src/components/sponsorship/waiting-page-client.tsx`
- `src/components/sponsorship/sponsor-request-form.tsx`
- `src/components/sponsorship/invitation-card.tsx`
- `src/components/sponsorship/status-poller.tsx`
- `src/app/onboarding/page.tsx`
- `src/components/onboarding/onboarding-wizard.tsx`
- `src/lib/profile-utils.ts`
- `src/lib/types/database.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/(app)/admin/users/page.tsx`
- `src/app/(app)/admin/actions.ts`
- `src/__tests__/auth-session-middleware.test.ts`
- `src/__tests__/authorization-hardening.test.ts`
- `supabase/migrations/00001_initial_schema.sql`
- `supabase/migrations/00003_sponsorship_system.sql`
- `supabase/migrations/00008_specialty_categories.sql`
- `supabase/migrations/00011_sponsorship_requests.sql`
- `supabase/migrations/00014_onboarding.sql`
- `supabase/migrations/00015_profile_enhancements.sql`
- `supabase/migrations/00016_multi_specialties.sql`
- `supabase/migrations/00017_countries_and_cities.sql`
- `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`

## Change Log

| Date       | Change                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-05 | Created comprehensive Story 2.3 developer guide for candidate admission/profile information capture and schema guardrails. |
| 2026-05-05 | Implemented pending admission/profile request form, safe Server Action submission, and focused guardrail tests.            |
| 2026-05-05 | Resolved code-review findings for category validation, display-name support, and behavior-level action tests.             |

## Dev Agent Record

### Agent Model Used

openai/gpt-5.5

### Debug Log References

- `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` failed: Python 3.11+ / `tomllib` unavailable; customization resolved manually from skill defaults, with no team/user override files present.
- `npx vitest run "src/__tests__/admission-profile-request.test.ts"` red phase: 3 failing tests before implementation.
- `npx vitest run "src/__tests__/admission-profile-request.test.ts"` after implementation: 3 passed.
- `npx vitest run "src/__tests__/admission-profile-request.test.ts" "src/__tests__/auth-session-middleware.test.ts" "src/__tests__/authorization-hardening.test.ts"`: 21 tests passed.
- `npm run lint`: failed at documented baseline, 94 problems (52 errors, 42 warnings); no new-file lint errors after fix.
- `npm run lint -- "src/app/(auth)/en-attente/page.tsx" "src/app/(auth)/en-attente/actions.ts" "src/components/auth/admission-profile-form.tsx" "src/__tests__/admission-profile-request.test.ts"`: passed.
- `npx vitest run`: run during validation and final completion check; 59 passed, 3 failed in `src/__tests__/profile-utils.test.ts`; failures match documented baseline availability-label expectations and were not touched.
- `npx vitest run "src/__tests__/admission-profile-request.test.ts"`: passed after review patches, 7 tests.
- `npm run lint -- "src/app/(auth)/en-attente/actions.ts" "src/components/auth/admission-profile-form.tsx" "src/__tests__/admission-profile-request.test.ts"`: passed after review patches.

### Completion Notes List

- Audited all story-listed auth, sponsorship, onboarding, type, profile utility, admin, middleware, and local migration files before editing.
- Confirmed current candidate path remains X callback to `/en-attente` for non-approved users, with `/onboarding` reserved for approved/not-onboarded users.
- Added a small `/en-attente` admission/profile form that collects only name, professional context, location, and short review context while showing X identity as non-editable context.
- Added a Server Action that re-verifies the authenticated user, requires `profiles.status = "pending"`, and updates only safe self-editable profile fields.
- Preserved existing sponsor/parrain invitation and sponsorship request flows; no route removals, schema migrations, dependency changes, destructive SQL, production writes, or generated type edits were made.
- Documented schema uncertainty: without a dedicated submitted flag, `profiles.status = "pending"` remains the existing submitted/manual-review source of truth for this MVP story.
- Resolved review findings by validating category-only specialty submissions server-side, adding a `displayName`/nom d'usage path, and adding behavior-level Server Action tests for category validation, display-name-only submission, and non-pending rejection.

### File List

- `_bmad-output/implementation-artifacts/2-3-capture-required-admission-and-profile-information.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/(auth)/en-attente/page.tsx`
- `src/app/(auth)/en-attente/actions.ts`
- `src/components/auth/admission-profile-form.tsx`
- `src/__tests__/admission-profile-request.test.ts`
