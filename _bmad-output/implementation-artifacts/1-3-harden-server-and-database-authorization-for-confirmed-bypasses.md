# Story 1.3: Harden Server and Database Authorization for Confirmed Bypasses

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the owner,
I want confirmed member/admin bypasses closed through trusted server and database checks,
so that unauthorized users cannot reach private content or perform admin-only actions even if UI links are hidden.

## Acceptance Criteria

1. Given Story 1.1 and Story 1.2 identified confirmed bypasses F-02 through F-07 and expectation gaps F-09, F-11, and F-14, when the developer hardens authorization, then each touched bypass is either closed by the smallest brownfield-safe change or explicitly recorded as still launch-blocking with evidence and next action.
2. The connected Supabase target is inspected read-only before any database decision; if it still exposes only `public.francophone_pack_members` and migration `001 francophone_pack_members`, the developer must not apply production database writes or migrations and must record the target mismatch as blocking production confidence.
3. Profile self-update and sponsor-update paths cannot set or modify admin/admission/access-sensitive fields through direct client updates, including `status`, `is_admin`, `chat_banned`, `chat_muted_until`, `sponsored_by`, `sponsor_approved`, and any other sensitive field identified in the touched `profiles` update policy or client write surface.
4. Sponsors cannot approve membership by updating a requester's `profiles.status`; sponsor UI may only manage sponsorship request state unless an admin-authorized path is explicitly implemented and verified.
5. Message writes are constrained so approved users can send only in allowed channels: public channels where writing is allowed or private channels where membership is verified. Pending, refused, logged-out, non-member, banned, and actively muted users cannot send through client-side or direct database bypasses.
6. Non-admin users cannot create private channels or arbitrary `channel_members` rows for private DMs because private 1:1 messages are outside MVP scope.
7. `chat-images` media upload/read does not expose private community media through unaudited public URLs. If member-private storage cannot be proven and implemented safely in scope, chat image upload is disabled for beta and the remaining storage policy work is recorded as launch-blocking or follow-up according to owner decision.
8. Public legal pages `/mentions-legales`, `/confidentialite`, and `/cgu` remain accessible to logged-out visitors and approved users without breaking auth, pending/refused, onboarding, or `/chat` routing.
9. UI hiding is not treated as the security boundary; any hidden or disabled client affordance is paired with server/database enforcement or an explicit launch-blocking note.
10. Refused users continue to reach the explicit `/en-attente` refused state and are not redirected into a login loop.
11. Non-admin users cannot execute affected admin mutation paths through Server Actions, direct route access, direct Supabase query/Data API equivalents, storage, or realtime paths where those paths exist.
12. Tests or manual verification confirm the hardening without unrelated route changes, and all verification outcomes distinguish baseline failures from new regressions.

## Tasks / Subtasks

- [x] Confirm target and choose safe hardening path (AC: 1, 2, 12)
  - [x] Run read-only Supabase inspection only: list tables, migrations, and advisors; record exact outputs in this story's Dev Agent Record.
  - [x] If the connected target still lacks app tables (`profiles`, `channels`, `messages`, `storage.objects` policy context), do not apply production SQL through MCP; implement local migration files only if needed and record production confidence as blocked by F-01.
  - [x] Read all touched source and migration files before editing; do not rely only on Story 1.1/1.2 summaries.
- [x] Harden `profiles` update boundaries (AC: 1, 3, 4, 9, 11)
  - [x] Add a local Supabase migration that removes or replaces broad `profiles` UPDATE policies that permit self/sponsor updates of sensitive fields.
  - [x] Preserve legitimate self-service profile/onboarding fields used by existing profile and onboarding forms; do not break approved users editing safe profile information.
  - [x] Preserve admin ability to update admission/moderation fields through trusted admin paths, subject to RLS support.
  - [x] Remove the client-side requester `profiles.status = "approved"` update from `src/components/sponsorship/parrainages-tabs.tsx`; sponsors may update `sponsorship_requests.status` only unless a server-authorized admin path is introduced.
- [x] Harden channel and message database policies (AC: 1, 5, 6, 9, 11)
  - [x] Add or adjust local RLS policies so `messages` INSERT checks author identity, approved status, chat ban/mute state, and channel permission.
  - [x] Constrain `channels` INSERT so non-admin approved users cannot create private channels for DMs during MVP.
  - [x] Constrain `channel_members` INSERT so approved users cannot add arbitrary private-channel memberships; if any self-join/public-channel behavior is retained, define it explicitly in the policy.
  - [x] Review `public.is_admin()` and any `SECURITY DEFINER` functions touched by these policies; set safe `search_path` or record why the function is not changed in this story.
- [x] Remove or disable out-of-scope client bypass affordances (AC: 6, 7, 9)
  - [x] Disable or remove the DM creation button/path in `src/components/membres/member-profile.tsx` for MVP; do not delete legacy routes or historical data.
  - [x] Disable chat image upload in `src/components/chat/message-input.tsx` unless member-private storage is implemented and verified; do not keep `getPublicUrl` for private chat media as the beta path.
  - [x] Preserve text-based message sending and mention behavior unless a security issue requires a targeted adjustment.
- [x] Fix legal public route access safely (AC: 8, 10, 12)
  - [x] Update the central route gate in `src/lib/supabase/middleware.ts` so `/mentions-legales`, `/confidentialite`, and `/cgu` are public for logged-out users.
  - [x] Ensure approved-onboarded users are not forcibly redirected away from legal pages to `/chat`.
  - [x] Preserve existing `/connexion`, `/inscription`, `/en-attente`, `/rejoindre`, `/auth/*`, `/onboarding`, and `/chat` behavior.
- [x] Add targeted tests and verification evidence (AC: 1-12)
  - [x] Add or update tests under `src/__tests__` for legal route allowlist behavior and source-level prevention of sponsor profile approval, DM creation, and public chat image upload if runtime test harnessing is not practical.
  - [x] Add SQL/RLS verification notes for local migration changes; use read-only inspection or local static checks unless owner explicitly approves production writes.
  - [x] Run `npm run lint` and classify existing lint failures against Story 1.1/1.2 baseline.
  - [x] Run `npx vitest run src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts`.
  - [x] Run any new/changed targeted tests directly with `npx vitest run <test-file>`.
  - [x] If running full tests, classify known baseline `src/__tests__/profile-utils.test.ts` failures separately.

### Review Findings

- [x] [Review][Patch] Add a trusted DB/server path for sponsor confirmation instead of client profile writes — Decision: preserve `profiles.sponsored_by` and `profiles.sponsor_approved` as operational profile flags, but update them only through trusted DB/server logic after validated sponsorship request/invitation transitions.
- [x] [Review][Patch] Add explicit channel read/write permissions to the channel model and message policies — Decision: channel settings need read and write permissions with `all` and `admin_only` values; message writes must honor the channel write permission instead of treating every public channel as writable.
- [x] [Review][Patch] Public legal pages are still captured by authenticated profile-status/onboarding redirects [src/lib/supabase/middleware.ts:72]
- [x] [Review][Patch] Disabled chat media can still be inserted and rendered through direct `messages.image_url` writes [supabase/migrations/20260503065247_harden_authorization_boundaries.sql:69]
- [x] [Review][Patch] Muted or banned users can still publish new content by editing existing messages [supabase/migrations/00004_invitations_chat_forum.sql:135]

## Dev Notes

### Story Scope

Story 1.3 is the first Epic 1 runtime hardening story. It should consume Story 1.1 audit facts and Story 1.2 access-matrix decisions without reopening broad discovery. The goal is targeted closure of confirmed bypasses, not schema redesign, UI redesign, feature expansion, or production migration application. [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.3: Harden Server and Database Authorization for Confirmed Bypasses`; Source: `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md#Story 1.3 Handoff`]

Do not apply destructive SQL. Do not apply production DDL through Supabase MCP while F-01 persists. The connected Supabase project was rechecked during story creation and still showed only `public.francophone_pack_members` plus migration `001 francophone_pack_members`; security advisor still reported `public.set_updated_at` mutable `search_path`, and performance advisor still reported `auth_rls_initplan` on `francophone_pack_members`. Treat this as production-target mismatch until the owner confirms otherwise. [Source: Supabase MCP read-only inspection during create-story on 2026-05-02; Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`; Source: `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md#Story 1.1 Finding Map`]

Local migration files are allowed if they are the smallest safe way to express the intended app-schema hardening, but the dev agent must not claim production is hardened unless it verifies the correct production target. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`]

### Confirmed Inputs From Previous Stories

Story 1.1 produced `_bmad-output/implementation-artifacts/1-1-access-security-audit.md`. Story 1.2 produced `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`. Both are done and are mandatory context. [Source: `_bmad-output/implementation-artifacts/1-1-audit-route-data-admin-api-and-realtime-authorization-boundaries.md#Dev Agent Record`; Source: `_bmad-output/implementation-artifacts/1-2-define-and-verify-the-mvp-access-matrix.md#Dev Agent Record`]

The Story 1.3 handoff priority is: confirm target, restrict `profiles` UPDATE, remove sponsor-driven profile approval, harden message INSERT, constrain `channel_members`, constrain private-channel creation, define/disable `chat-images`, enforce `chat_banned`, and enforce `chat_muted_until`. [Source: `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md#Story 1.3 Handoff`]

Launch-blocking or hardening inputs:

- F-01: connected Supabase project mismatch blocks production confidence.
- F-02: `profiles` own-update RLS permits self-approval/admin/access escalation.
- F-03: sponsor policy and client path can approve requester profiles from the browser.
- F-04: `messages` INSERT does not check private-channel membership or channel write permission.
- F-05: `channel_members` INSERT allows arbitrary membership creation by approved users.
- F-06: non-admin private-channel creation is outside MVP and must remain blocked.
- F-07: `chat-images` storage policy is unverified; public URLs leak private media by URL.
- F-09: `chat_banned` and `chat_muted_until` are written but not enforced in chat read/send paths.
- F-11: legal routes must be public but are missing from the middleware public allowlist.
- F-14: `SECURITY DEFINER` functions in `public` need review during database hardening.

[Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Findings`; Source: `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md#Story 1.1 Finding Map`]

### Current State of Files Likely To Be Updated

`src/lib/supabase/middleware.ts` currently creates a Supabase SSR client directly for middleware/session refresh, reads `auth.getUser()`, and uses `publicRoutes = ["/", "/connexion", "/inscription", "/en-attente", "/rejoindre"]` plus `/auth/*`. Logged-out legal pages redirect to `/connexion`, and approved-onboarded users are redirected from landing/auth/status routes to `/chat`. This story should add legal pages to public access without weakening protected app/admin boundaries or refused/pending redirects. [Source: `src/lib/supabase/middleware.ts:38-102`; Source: `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md#Legal Routes`]

`src/app/(app)/layout.tsx` is the protected route guard. It redirects missing users/profiles to `/connexion`, pending/rejected users to `/en-attente`, and approved-not-onboarded users to `/onboarding`, then renders `AppShell`. Preserve this behavior; do not move protected-route security into client components. [Source: `src/app/(app)/layout.tsx:11-42`]

`src/app/(app)/admin/actions.ts` checks `auth.getUser()` and `profiles.is_admin` before `approveUser`, `rejectUser`, `muteUser`, `unmuteUser`, `banFromChat`, and `unbanFromChat`. Preserve app-level admin checks, but do not rely on them as the only boundary because direct Data API equivalents must be blocked by RLS. [Source: `src/app/(app)/admin/actions.ts:5-113`; Source: Next.js production checklist `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md#Security`]

`src/components/sponsorship/parrainages-tabs.tsx` currently lets a sponsor update `sponsorship_requests.status`, and when action is `approved`, it also updates requester `profiles.status = "approved"`, `sponsored_by`, and `sponsor_approved` from the browser. This is the F-03 bypass. Remove or replace only the profile-status update; preserve safe request-state UI where possible. [Source: `src/components/sponsorship/parrainages-tabs.tsx:47-74`; Source: `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md#Admin Action and Sensitive Mutation Expectations`]

`src/components/membres/member-profile.tsx` contains `SendDmButton`, which checks `acceptDms` in the client, creates private `channels`, inserts two `channel_members`, and routes to `/chat/dm-*`. Private DMs are not in MVP scope; disable/remove this path for MVP and pair with RLS hardening so direct queries cannot recreate it. Preserve report/block behavior unless a specific issue is found. [Source: `src/components/membres/member-profile.tsx:85-160`; Source: `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md#Story 1.1 Finding Map`]

`src/components/chat/message-input.tsx` currently inserts messages directly with the browser Supabase client, uploads selected images to `chat-images`, calls `getPublicUrl`, stores URLs in `messages.image_url`, and sends mention notifications. Keep text message send behavior, but ensure database policies enforce allowed-channel sending. Disable image upload unless storage privacy is fully defined and verified; public URLs are not acceptable for private chat media. [Source: `src/components/chat/message-input.tsx:38-83`; Source: `src/components/chat/message-input.tsx:182-207`; Source: Supabase Storage Access Control docs]

`src/app/(app)/chat/layout.tsx` server-loads public channels, private DM memberships/channels, approved members, and initial messages. Because private DMs are parked, do not expand this path; if touched, preserve public channel loading and default channel behavior. Any DM display left in place must not be creatable by non-admins and must remain RLS-protected. [Source: `src/app/(app)/chat/layout.tsx:26-123`]

### Database and RLS Guardrails

Relevant local policies currently include broad `profiles` self/sponsor updates, broad message INSERT, approved-user private channel creation, and approved-user channel membership insertion. These are the concrete local migration surfaces to harden. [Source: `supabase/migrations/00001_initial_schema.sql:104-117`; Source: `supabase/migrations/00003_sponsorship_system.sql:80-84`; Source: `supabase/migrations/00004_invitations_chat_forum.sql:125-133`; Source: `supabase/migrations/00012_dm_system.sql:31-68`]

Supabase current guidance: RLS must be enabled on exposed-schema tables; UPDATE policies use both `USING` and `WITH CHECK`; UPDATE also requires a corresponding SELECT policy; views bypass RLS by default unless `security_invoker = true`; do not use user-editable JWT/user metadata for authorization; security-definer functions should not live in exposed schemas; Storage uses RLS policies on `storage.objects`, and upload requires INSERT while upsert needs SELECT and UPDATE. [Source: Supabase docs search `Row Level Security`; Source: Supabase docs search `Storage Access Control`; Source: Supabase skill security checklist]

For this MVP, prefer additive/replacement hardening migrations over destructive table changes. If a policy must be dropped/recreated, make the migration explicit and reversible by review. Do not invent a new ORM, service layer, or broad RPC system unless a specific policy cannot be made safe otherwise. [Source: `_bmad-output/planning-artifacts/architecture.md#Migration Approach`; Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`]

### Architecture and Framework Guardrails

Active stack: Next.js `16.2.1`, React `19.2.4`, TypeScript strict mode, Tailwind CSS 4, Vitest, ESLint, `@supabase/ssr ^0.9.0`, and `@supabase/supabase-js ^2.100.1`. Use `@/*` imports and existing project structure. [Source: `package.json`; Source: `_bmad-output/project-context.md#Technology Stack & Versions`]

Use existing Supabase helpers only: `src/lib/supabase/server.ts` for server code, `src/lib/supabase/client.ts` for browser code, and `src/lib/supabase/middleware.ts` for session refresh/auth redirects. Do not introduce alternate env names or ad hoc Supabase clients. [Source: `_bmad-output/project-context.md#Technical Implementation Rules`; Source: `_bmad-output/planning-artifacts/architecture.md#Technical Constraints & Dependencies`]

Next.js 16 note: `middleware.ts` and named `middleware` are deprecated in favor of `proxy.ts`/`proxy`, but this story should not perform a middleware-to-proxy migration unless required for the legal route fix. If route pre-render redirects are needed, Next.js docs recommend Proxy/`NextResponse.redirect`; `redirect()` in Server Components throws and should be outside `try/catch`. [Source: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md#middleware-to-proxy`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`; Source: `node_modules/next/dist/docs/01-app/02-guides/redirecting.md`; Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`]

Next.js security guidance says Server Actions must verify authentication and authorization inside each action and must not rely only on Proxy/layout/page-level checks. This supports preserving `verifyAdmin` while adding RLS hardening underneath. [Source: `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md#Security`]

### UX Requirements

Pending and refused states must feel intentional, not like broken routing. Refused users must see product language at `/en-attente`, not database terminology or a login loop. Legal pages must remain public and must not expose private member/chat/admin data. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Navigation Patterns`; Source: `_bmad-output/planning-artifacts/prd.md#SEO Strategy`]

Do not redesign the UI. If a bypass affordance is disabled, use existing UI primitives and concise French-first copy where user-visible. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation`; Source: `_bmad-output/project-context.md#Code Organization And UI`]

### Testing Requirements

`package.json` has no `test` script. Use `npx vitest run ...` directly. Existing relevant tests include `src/__tests__/mvp-route-cleanup.test.ts`, `src/__tests__/auth-url.test.ts`, `src/__tests__/profile-utils.test.ts`, and `src/__tests__/notifications.test.ts`. [Source: `package.json`; Source: `_bmad-output/implementation-artifacts/1-2-define-and-verify-the-mvp-access-matrix.md#Verification Guidance`]

Known baseline from Stories 1.1 and 1.2: `npm run lint` fails with 95 baseline problems; targeted route/auth tests pass 12/12; full Vitest has 3 baseline failures in `profile-utils.test.ts` availability-label assertions. Re-run and classify rather than claiming a clean baseline unless the baseline changed. [Source: `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md#Verification Outcomes`]

Targeted test suggestions:

- Extend `src/__tests__/mvp-route-cleanup.test.ts` or add a focused source-inspection test for legal routes in the public allowlist and approved-user redirect exclusions.
- Add source-inspection tests that fail if `parrainages-tabs.tsx` updates `profiles.status`, if `member-profile.tsx` inserts private DM `channels`/`channel_members`, or if `message-input.tsx` uses `getPublicUrl` for `chat-images` while storage remains unresolved.
- If SQL migration static tests exist or are added minimally, verify new RLS migration text covers `profiles`, `messages`, `channels`, and `channel_members` policies.

### Project Structure Notes

Expected story file: `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md`.

Likely runtime files to update, depending on final implementation choices:

- `src/lib/supabase/middleware.ts`
- `src/components/sponsorship/parrainages-tabs.tsx`
- `src/components/membres/member-profile.tsx`
- `src/components/chat/message-input.tsx`
- `supabase/migrations/<new-hardening-migration>.sql`
- `src/__tests__/<targeted-test>.test.ts` or existing targeted tests

Do not change dependencies, package locks, generated types, broad layouts, app navigation, parked legacy route files, or unrelated runtime behavior. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/architecture.md#Project Organization`]

### Git Intelligence Summary

Recent commits before this story are `Merge story/1-2-mvp-access-matrix into dev`, `docs: finalize story 1.2 access matrix`, `feat: plan story`, `Merge branch 'story/1-1-authorization-boundaries-audit' into dev`, and `docs: finalize story 1.1 authorization audit`. The established pattern is BMad documentation-first, exact verification recording, and review-driven correction of story artifacts before runtime work. [Source: `git log --oneline -5` during create-story]

### References

- `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`
- `_bmad-output/planning-artifacts/epics.md#Story 1.3: Harden Server and Database Authorization for Confirmed Bypasses`
- `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`
- `_bmad-output/planning-artifacts/prd.md#Technical Success`
- `_bmad-output/planning-artifacts/prd.md#Security`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Data Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Navigation Patterns`
- `_bmad-output/implementation-artifacts/1-1-access-security-audit.md`
- `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`
- `src/lib/supabase/middleware.ts`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/admin/actions.ts`
- `src/app/(app)/chat/layout.tsx`
- `src/components/sponsorship/parrainages-tabs.tsx`
- `src/components/membres/member-profile.tsx`
- `src/components/chat/message-input.tsx`
- `supabase/migrations/00001_initial_schema.sql`
- `supabase/migrations/00003_sponsorship_system.sql`
- `supabase/migrations/00004_invitations_chat_forum.sql`
- `supabase/migrations/00012_dm_system.sql`
- `supabase/migrations/00020_profiles_schema_alignment.sql`
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`
- `node_modules/next/dist/docs/01-app/02-guides/redirecting.md`
- `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md`
- Supabase docs: Row Level Security, Securing your API, Storage Access Control

## Change Log

| Date | Change |
| --- | --- |
| 2026-05-02 | Created comprehensive Story 1.3 developer guide for confirmed authorization bypass hardening. |
| 2026-05-03 | Implemented local authorization hardening, disabled out-of-scope client bypasses, fixed public legal route access, and added targeted verification. |
| 2026-05-03 | Resolved code review findings for trusted sponsorship confirmation, channel read/write permissions, legal route access, chat media insert blocking, and muted/banned message edits. |
| 2026-05-03 | Resolved follow-up review blockers for mutable sponsorship/invitation transition fields and failed-send mention notifications. |

## Dev Agent Record

### Agent Model Used

gpt-5.5 (OpenCode, openai/gpt-5.5)

### Debug Log References

- 2026-05-03T06:49:34Z: Story 1.3 activation/context load completed; story key discovered from `_bmad-output/implementation-artifacts/sprint-status.yaml` as first `ready-for-dev` entry.
- 2026-05-03T06:49:34Z: Updated story and sprint tracking from `ready-for-dev` to `in-progress`.
- 2026-05-03T06:49:34Z: Supabase MCP read-only `list_tables(schemas=["public"], verbose=false)` returned `[public.francophone_pack_members]` only, with RLS enabled and 1 row.
- 2026-05-03T06:49:34Z: Supabase MCP read-only `list_migrations` returned only migration `001 francophone_pack_members`.
- 2026-05-03T06:49:34Z: Supabase MCP read-only `get_advisors(type="security")` returned `function_search_path_mutable` for `public.set_updated_at` with remediation `https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable`.
- 2026-05-03T06:49:34Z: Supabase MCP read-only `get_advisors(type="performance")` returned `auth_rls_initplan` for `public.francophone_pack_members` policy `service role manages francophone pack members` with remediation `https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan`.
- 2026-05-03T06:49:34Z: Production confidence remains blocked by F-01 because the connected Supabase target lacks local app tables such as `profiles`, `channels`, `messages`, and storage policy context. No production SQL or migrations were applied.
- 2026-05-03T06:49:34Z: Read source files before runtime edits: `src/lib/supabase/middleware.ts`, `src/components/sponsorship/parrainages-tabs.tsx`, `src/components/membres/member-profile.tsx`, and `src/components/chat/message-input.tsx`.
- 2026-05-03T06:49:34Z: Read local migration files before database hardening edits: `supabase/migrations/00001_initial_schema.sql`, `supabase/migrations/00003_sponsorship_system.sql`, `supabase/migrations/00004_invitations_chat_forum.sql`, `supabase/migrations/00012_dm_system.sql`, and searched the full local migration set for sensitive fields, RLS policies, and `SECURITY DEFINER` functions.
- 2026-05-03T06:49:34Z: Loaded mandatory handoff artifacts `_bmad-output/implementation-artifacts/1-1-access-security-audit.md` and `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`.
- 2026-05-03T06:49:34Z: Checked current Supabase docs for RLS and Storage Access Control. Relevant guidance: RLS must be enabled for exposed schemas; UPDATE combines `USING` and `WITH CHECK` and requires SELECT policy; wrap stable auth helper calls in `select` for performance; storage upload/download are controlled by `storage.objects` policies for private buckets, while public bucket URLs are readable by anyone with the URL.
- 2026-05-03T06:49:34Z: Read Next.js 16 docs for `middleware` to `proxy`, Proxy behavior, and production security guidance. Decision: keep the existing middleware file convention for this narrow story and avoid a middleware-to-proxy migration; route/security changes must still be enforced in Server Actions/RLS, not by middleware alone.
- 2026-05-03T06:52:16Z: RED `npx vitest run src/__tests__/authorization-hardening.test.ts` failed as expected: sponsor UI still wrote `profiles.status = "approved"`; no local hardening migration existed for profile sensitive fields.
- 2026-05-03T06:53:33Z: GREEN `npx vitest run src/__tests__/authorization-hardening.test.ts` passed after removing sponsor-driven profile approval and adding local profile-update hardening migration.
- 2026-05-03T06:54:26Z: RED `npx vitest run src/__tests__/authorization-hardening.test.ts` failed as expected after adding chat RLS assertions; migration did not yet replace broad message/channel/channel-membership insert policies.
- 2026-05-03T06:54:58Z: GREEN `npx vitest run src/__tests__/authorization-hardening.test.ts` passed after adding local message/channel/channel-membership RLS hardening.
- 2026-05-03T06:55:31Z: RED `npx vitest run src/__tests__/authorization-hardening.test.ts` failed as expected after adding client-bypass assertions; member profile still exposed DM creation and chat input still uploaded `chat-images` with public URLs.
- 2026-05-03T06:56:16Z: GREEN `npx vitest run src/__tests__/authorization-hardening.test.ts` passed after removing client-side DM creation and chat image upload/public URL handling.
- 2026-05-03T06:56:55Z: RED `npx vitest run src/__tests__/mvp-route-cleanup.test.ts` failed as expected after adding legal-route allowlist assertions; middleware public routes still lacked `/mentions-legales`, `/confidentialite`, and `/cgu`.
- 2026-05-03T06:57:10Z: GREEN `npx vitest run src/__tests__/mvp-route-cleanup.test.ts` passed after adding legal routes to the public route allowlist while keeping them outside the approved-onboarded `/chat` redirect list.
- 2026-05-03T06:57:39Z: `npm run lint` failed with 94 problems (52 errors, 42 warnings). Classified as existing lint baseline consistent with Story 1.1/1.2's 95-problem baseline; no new lint category was introduced by this story. Existing `message-input.tsx` `no-explicit-any` and React Compiler effect findings remain after line-number shifts from removing image upload code.
- 2026-05-03T06:57:39Z: `npx vitest run src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts` passed: 2 files, 13 tests.
- 2026-05-03T06:57:39Z: `npx vitest run src/__tests__/authorization-hardening.test.ts` passed: 1 file, 5 tests.
- 2026-05-03T06:57:39Z: `npx vitest run` failed only on known baseline `src/__tests__/profile-utils.test.ts` availability-label assertions: 5 files run, 39 passed, 3 failed. Failures match Story 1.1/1.2 baseline labels (`Disponible`/`En mission` expected while implementation returns longer labels), not a Story 1.3 regression.
- 2026-05-03T07:00:15Z: Final Step 9 task re-scan found no unchecked `[ ]` tasks/subtasks in this story file.
- 2026-05-03T07:00:15Z: Final Step 9 `npx vitest run` repeated the same known baseline result: 5 files run, 39 passed, 3 failed in `src/__tests__/profile-utils.test.ts` availability-label assertions. No Story 1.3 regression identified.
- 2026-05-03T09:42:36Z: Code review findings resolved locally after owner decisions: sponsor confirmation uses trusted DB trigger/function logic, channel settings use `read_permission`/`write_permission` values `all` and `admin_only`, legal pages bypass authenticated profile-state redirects, direct `messages.image_url` inserts are blocked while media is disabled, and message UPDATE now enforces approved/not-banned/not-muted/channel-write checks for non-admin authors.
- 2026-05-03T09:42:36Z: `npx vitest run src/__tests__/authorization-hardening.test.ts src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts` passed: 3 files, 19 tests.
- 2026-05-03T09:42:36Z: `npm run lint` still failed with the known baseline shape: 94 problems (52 errors, 42 warnings). No new lint category was identified from the review patches; existing `message-input.tsx` `no-explicit-any` and React Compiler effect findings remain baseline.
- 2026-05-03T09:42:36Z: `npx vitest run` failed only on known baseline `src/__tests__/profile-utils.test.ts` availability-label assertions: 5 files run, 40 passed, 3 failed. Failures match the previously classified baseline labels and are not a Story 1.3 regression.
- 2026-05-03T10:11:16Z: Follow-up review blockers addressed locally: sponsorship request and invitation triggers now freeze non-admin relationship fields before update and use trusted `OLD` relationship values for profile sponsorship side effects.
- 2026-05-03T10:11:16Z: Message update hardening now includes a trigger that prevents non-admin updates to `channel_id`, `author_id`, and `image_url`, and the UPDATE policy `USING` branch checks current/original channel write access before allowing author edits.
- 2026-05-03T10:11:16Z: Chat mention notifications now fire only after the message insert succeeds; failed sends no longer call `notifyMentions`.
- 2026-05-03T10:11:16Z: `npx vitest run src/__tests__/authorization-hardening.test.ts src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts` passed: 3 files, 21 tests.
- 2026-05-03T10:11:16Z: `git diff --check` passed.
- 2026-05-03T10:11:16Z: `npm run lint` still failed with the known baseline shape: 94 problems (52 errors, 42 warnings). No new lint category identified from the follow-up fixes.
- 2026-05-03T10:11:16Z: `npx vitest run` failed only on known baseline `src/__tests__/profile-utils.test.ts` availability-label assertions: 5 files run, 42 passed, 3 failed. Failures match the previously classified baseline labels and are not a Story 1.3 regression.

### Implementation Plan

- Production Supabase writes are blocked by F-01 target mismatch; this story will express database hardening as local migration files only.
- Use the smallest brownfield-safe source edits: remove sponsor-driven profile admission update, disable out-of-scope DM creation and chat image upload affordances, and add legal routes to the existing middleware public-route allowlist.
- Add targeted source/static tests and migration text tests because production RLS cannot be exercised against the connected Supabase target.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Confirmed the connected Supabase target still does not match the app schema. Production hardening confidence remains blocked by F-01; no production database writes were performed.
- Removed the sponsor UI side effect that updated requester `profiles.status`, `sponsored_by`, and `sponsor_approved`; sponsors now only update `sponsorship_requests.status` from this component.
- Added local migration `20260503065247_harden_authorization_boundaries.sql` to drop broad profile self/sponsor update policies, preserve own safe-field updates, preserve admin updates, set a safe `search_path` on `public.is_admin()`, and add a trigger that blocks non-admin changes to profile admission/access-sensitive fields.
- Extended local migration `20260503065247_harden_authorization_boundaries.sql` so `messages` INSERT requires the authenticated author, approved status, no chat ban, no active mute, and allowed channel access; non-admin private-channel creation and arbitrary `channel_members` insertion are blocked by dropping broad approved-user policies and retaining/adding admin-only creation paths.
- Removed the member-profile private DM creation button/path while preserving report/block actions and legacy route files.
- Disabled chat image upload/public URL behavior in `MessageInput`; text message sending and mention suggestions remain intact.
- Added `/mentions-legales`, `/confidentialite`, and `/cgu` to the middleware public route allowlist without adding them to the approved-onboarded app-home redirect condition.
- Added source/static authorization tests for sponsor profile approval, profile/message/channel/member RLS migration coverage, private DM creation, chat image public URL usage, and legal route public allowlisting.
- SQL/RLS verification is static/local only because the connected Supabase target still lacks the app schema. Production confidence remains blocked by F-01 until the correct Supabase target is connected and migrations are verified/applied through the approved release process.
- Verification passed for targeted route/auth and authorization hardening tests. Lint and full Vitest still have classified baseline failures, with no new regression identified from this story.
- Story moved to `review` after all tasks/subtasks were completed, file list was updated, targeted tests passed, and full-suite failures were classified as existing baseline issues.
- Code review findings resolved: sponsor request and invitation acceptance now rely on private trusted trigger functions for profile sponsorship flags; remaining client-side invitation profile writes were removed.
- Channel hardening now adds explicit `read_permission` and `write_permission` columns with `all` and `admin_only` values, and channel/message policies honor those settings.
- Legal pages are public for authenticated pending/refused/not-onboarded users as well as logged-out users, while protected-route redirects remain unchanged for non-legal pages.
- While chat image upload remains disabled, direct `messages.image_url` inserts and non-admin message edits with `image_url` are blocked by local RLS policy text.
- Non-admin message edits now require the author to still be approved, not chat-banned, not actively muted, and allowed to write in the channel.
- Story moved from `review` to `done` after review patch findings were resolved and verification was recorded.
- Follow-up review blockers resolved: sponsorship/invitation trusted transitions no longer trust mutable `NEW` relationship fields from broad UPDATE policies, message updates protect immutable identity/media fields, and mention notifications are only sent after successful inserts.

### File List

- `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/__tests__/authorization-hardening.test.ts`
- `src/components/chat/message-input.tsx`
- `src/components/membres/member-profile.tsx`
- `src/components/sponsorship/invitation-card.tsx`
- `src/components/sponsorship/parrainages-tabs.tsx`
- `src/lib/supabase/middleware.ts`
- `src/__tests__/mvp-route-cleanup.test.ts`
- `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`
