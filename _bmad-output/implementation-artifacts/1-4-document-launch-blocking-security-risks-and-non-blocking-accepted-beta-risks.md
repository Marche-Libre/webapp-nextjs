# Story 1.4: Document Launch-Blocking Security Risks and Non-Blocking Accepted Beta Risks

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the owner,
I want remaining security uncertainty separated into launch blockers and explicitly non-blocking accepted beta risks,
so that beta launch decisions are deliberate rather than hidden in implementation notes.

## Acceptance Criteria

1. Given authorization audits, access matrix checks, tests, and hardening work have been completed for the current Epic 1 scope, when the developer summarizes remaining private-route, chat-data, admin-action, RLS, schema, realtime/API, and generated-type risks, then each risk is marked as `launch blocker`, `non-blocking accepted beta risk candidate`, or `post-MVP follow-up`.
2. Known unresolved member-only access bypasses or admin-only action bypasses are classified as `launch blocker` and are not accepted as beta risks.
3. The production Supabase target/schema mismatch is classified explicitly; local hardening must not be represented as production hardening until the correct target is confirmed and app-schema migrations/RLS are verified against it.
4. Accepted beta risk candidates include rationale, expected beta impact, owner decision needed if any, and the minimum post-beta follow-up.
5. Story 1.3 hardening outcomes are reflected accurately: profile escalation, sponsor approval bypass, message/channel/member write gaps, non-admin DM creation, chat image public URL usage, legal route access, and mention-notification ordering were locally addressed, but production confidence remains blocked while F-01 persists.
6. Verification commands and outcomes are recorded with baseline/regression distinction, including read-only Supabase inspection, targeted authorization/route tests, lint baseline, full Vitest baseline, and any skipped checks with reason.
7. No runtime code, app routes, UI, Supabase migrations, generated types, dependencies, package locks, or tests are changed by this story unless the owner explicitly re-scopes it.

## Tasks / Subtasks

- [ ] Create the Epic 1 launch security risk register artifact (AC: 1, 2, 3, 4, 5)
  - [ ] Create `_bmad-output/implementation-artifacts/1-4-launch-security-risk-register.md`.
  - [ ] Include sections for executive launch posture, risk classification rules, launch blockers, accepted beta risk candidates, post-MVP follow-ups, verification evidence, and owner decisions.
  - [ ] Do not bury launch blockers in prose; put them in a scannable table with ID, category, severity, current evidence, launch impact, required pre-launch action, and source references.
- [ ] Reconcile Story 1.1, 1.2, and 1.3 findings without reopening broad discovery (AC: 1, 2, 5)
  - [ ] Start from Story 1.1 findings F-01 through F-14 and Story 1.2's finding map.
  - [ ] Apply Story 1.3 final state to each finding: resolved locally, still blocked by production mismatch, accepted-risk candidate, or post-MVP follow-up.
  - [ ] Do not mark any unresolved member-only route/data bypass or admin-only mutation bypass as an accepted beta risk.
- [ ] Classify launch blockers (AC: 2, 3, 5)
  - [ ] Classify F-01 production Supabase target/schema mismatch as the primary remaining launch blocker unless read-only inspection proves the connected target now contains the app schema and migrations.
  - [ ] If the correct production target is still not connected, state that Story 1.3 local migration hardening is not production hardening.
  - [ ] If a new unresolved member/admin bypass is discovered during verification, classify it as launch-blocking and stop short of accepting it as beta risk.
- [ ] Classify non-blocking accepted beta risk candidates (AC: 4)
  - [ ] Include F-08 admin actor/timestamp attribution as an accepted beta risk candidate only if owner accepts weaker audit trail for the small beta.
  - [ ] Include F-10 `message_reactions` realtime publication gap as an accepted beta risk candidate if reactions are non-critical to beta chat read/send.
  - [ ] Include residual F-14 public/exposed `SECURITY DEFINER` function hardening as accepted beta risk or post-MVP follow-up, distinguishing functions already touched by Story 1.3 from older functions still needing review.
  - [ ] Include partial F-09 chat moderation semantics explicitly: Story 1.3 blocks muted/banned users from send/edit, but message/channel SELECT does not currently block `chat_banned`; owner must decide whether chat ban means no send/edit only or no chat read/access.
- [ ] Classify post-MVP follow-ups (AC: 1, 4, 5)
  - [ ] Document private/member-scoped `chat-images` storage as post-MVP only while upload remains disabled and direct `messages.image_url` writes are locally blocked.
  - [ ] Document generated/database type regeneration after production schema reconciliation, not before.
  - [ ] Document broader Supabase schema/RLS/function/trigger/view/storage review before migration beyond the initial 10 to 30 member beta.
- [ ] Record verification evidence (AC: 3, 6)
  - [ ] Run read-only Supabase inspection: tables, migrations, security advisors, and performance advisors; record exact outcomes and whether production still mismatches app schema.
  - [ ] Run `npx vitest run src/__tests__/authorization-hardening.test.ts src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts` and record the result.
  - [ ] Run `npm run lint` and classify known baseline failures versus new regressions.
  - [ ] Run `npx vitest run` if practical and classify the known `profile-utils.test.ts` availability-label baseline separately.
  - [ ] If any verification is skipped, record the reason and residual confidence gap.
- [ ] Preserve documentation-only scope and update tracking (AC: 7)
  - [ ] Update only the Story 1.4 story file, the Story 1.4 risk register artifact, and sprint tracking unless owner explicitly expands scope.
  - [ ] Move Story 1.4 to `review` only after all tasks are complete and the risk register clearly distinguishes blockers from accepted risks.

## Dev Notes

### Story Scope

Story 1.4 is the Epic 1 closeout decision record. It is not a runtime hardening story. Its output should make beta launch posture explicit by separating unresolved launch blockers from accepted beta risk candidates and post-MVP follow-ups. [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.4: Document Launch-Blocking Security Risks and Non-Blocking Accepted Beta Risks`]

The expected implementation artifact is `_bmad-output/implementation-artifacts/1-4-launch-security-risk-register.md`. Keep the artifact under BMad implementation artifacts; do not create a new top-level docs folder. [Source: `_bmad/bmm/config.yaml`; Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]

This story should not change runtime code, app routes, UI, Supabase files, dependencies, package locks, generated types, tests, or behavior. Runtime changes require a later implementation story or explicit owner approval. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]

### Epic 1 Context

Epic 1 exists because members, admins, and the owner need confidence that private routes, chat data, member data, and admin-only actions are protected beyond visible UI hiding before beta relies on the app. Story 1.4 should be treated as the security go/no-go documentation story for Epic 1, not as a general product-risk register. [Source: `_bmad-output/planning-artifacts/epics.md#Epic 1: Trust, Authorization, and Launch Safety`]

Beta launch must not proceed if there is a known unresolved member-only access bypass or admin-only action bypass. This rule is stronger than normal risk acceptance: known access/admin bypasses are blockers, not accepted beta risks. [Source: `_bmad-output/planning-artifacts/prd.md#Operational Readiness`; Source: `_bmad-output/planning-artifacts/epics.md#NonFunctional Requirements`]

### Mandatory Prior Story Inputs

Story 1.1 created `_bmad-output/implementation-artifacts/1-1-access-security-audit.md`, which defines original findings F-01 through F-14. Story 1.2 created `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`, which maps those findings to hardening, Story 1.4 risk documentation, or follow-up. Story 1.3 locally hardened the confirmed bypasses and is now `done`. All three are mandatory source inputs. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md`; Source: `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`; Source: `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md`]

Do not reopen open-ended discovery from scratch. The job is to reconcile the known findings and Story 1.3 final state, run focused verification, and make the remaining launch decision record explicit. [Source: `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`]

### Current Finding Classification Baseline

Use this baseline and update only when current evidence proves it changed:

| Finding | Current Story 1.4 baseline classification | Required handling |
| --- | --- | --- |
| F-01 production Supabase target/schema mismatch | Launch blocker | Connected Supabase still exposes only `public.francophone_pack_members` and migration `001 francophone_pack_members` during create-story read-only inspection on 2026-05-03T10:56:09Z. App tables such as `profiles`, `channels`, `messages`, and storage policy context are absent, so production confidence remains blocked. |
| F-02 profile self-update sensitive fields | Locally hardened, production confidence blocked by F-01 | Story 1.3 added local trigger/policy hardening. Do not claim production hardening until correct target is verified. |
| F-03 sponsor approval/profile update bypass | Locally hardened, production confidence blocked by F-01 | Story 1.3 removed client profile approval and added trusted DB trigger logic. |
| F-04 message INSERT channel/write checks | Locally hardened, production confidence blocked by F-01 | Story 1.3 added channel write/private membership checks locally. |
| F-05 arbitrary `channel_members` insertion | Locally hardened, production confidence blocked by F-01 | Story 1.3 dropped broad policy and retained admin-only membership insertion locally. |
| F-06 non-admin private channel creation | Locally hardened, production confidence blocked by F-01 | Story 1.3 disabled client DM creation and dropped non-admin private channel creation locally. |
| F-07 `chat-images` storage/public URL risk | Locally mitigated by disabling upload; private storage follow-up | Story 1.3 removed client upload/public URL usage and blocks `messages.image_url` locally. Re-enable media only after private/member storage policy work. |
| F-08 missing admin actor/timestamp audit | Accepted beta risk candidate | Document owner acceptance, impact, and follow-up audit fields/table. |
| F-09 `chat_banned`/`chat_muted_until` enforcement | Partially hardened; owner decision needed | Story 1.3 blocks send/edit for banned/muted users locally. It does not block message/channel SELECT for `chat_banned`. Decide whether chat ban means no send/edit only or no read/access. |
| F-10 `message_reactions` realtime publication gap | Accepted beta risk candidate | Non-critical if message read/send does not rely on realtime reactions. |
| F-11 legal route public access | Locally resolved | Story 1.3 made `/mentions-legales`, `/confidentialite`, and `/cgu` public and bypassed authenticated profile redirects. |
| F-12 `/api/geo/cities` expectation | Resolved by Story 1.2 | Auth/onboarding-compatible; not public for logged-out users. |
| F-13 hand-maintained database types | Post-MVP/schema follow-up | Do not use types as security authority; regenerate after production schema reconciliation. |
| F-14 public/exposed `SECURITY DEFINER` functions | Accepted beta risk candidate or post-MVP hardening | Story 1.3 hardened `public.is_admin()` and new trusted functions. Older public functions still need broader review. |

### Current State of Files and Artifacts Likely To Be Updated

`_bmad-output/implementation-artifacts/1-4-launch-security-risk-register.md` does not exist yet. Create it as the main deliverable. It should summarize risk decisions, not duplicate every row of the access matrix. [Source: `_bmad-output/implementation-artifacts/sprint-status.yaml`; Source: `_bmad-output/planning-artifacts/epics.md#Story 1.4: Document Launch-Blocking Security Risks and Non-Blocking Accepted Beta Risks`]

`_bmad-output/implementation-artifacts/1-4-document-launch-blocking-security-risks-and-non-blocking-accepted-beta-risks.md` is this story guide. The dev agent should update its tasks, completion notes, file list, and status during implementation. Preserve the requirements and risk baseline unless new evidence proves a change. [Source: this story]

`_bmad-output/implementation-artifacts/sprint-status.yaml` should move Story 1.4 from `ready-for-dev` to `in-progress` when dev-story starts, then to `review` after implementation. Do not mark Epic 1 done automatically; that is a separate sprint/status decision after Story 1.4 review. [Source: `_bmad-output/implementation-artifacts/sprint-status.yaml#STATUS DEFINITIONS`]

### Current State of Relevant Runtime Files To Reference, Not Modify

Story 1.4 should reference these files for evidence if needed, but should not edit them without re-scope:

- `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`: local Story 1.3 hardening. It adds sensitive profile update triggers, trusted sponsorship/invitation trigger functions, channel read/write permissions, message insert/update policies, immutable message identity/media trigger, and admin-only channel membership insertion. [Source: `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`]
- `src/__tests__/authorization-hardening.test.ts`: static/source tests verifying Story 1.3 hardening. Use for targeted verification. [Source: `src/__tests__/authorization-hardening.test.ts`]
- `src/lib/supabase/middleware.ts`: legal routes are now public and authenticated legal-route visits bypass profile-state redirects. [Source: `src/lib/supabase/middleware.ts:38-62`]
- `src/components/chat/message-input.tsx`: chat image upload/public URL code is removed; mention notifications run only after successful message insert. [Source: `src/components/chat/message-input.tsx:32-63`]
- `src/app/(app)/admin/actions.ts`: admin actions still check admin in app code but do not write admin actor/timestamp audit fields. Reference for F-08. [Source: `_bmad-output/implementation-artifacts/1-1-access-security-audit.md#Admin Action and Sensitive Mutation Matrix`]
- `src/components/chat/chat-store.tsx`: still subscribes to `message_reactions`; local migrations do not add `message_reactions` to realtime publication. Reference for F-10. [Source: `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md#API, Storage, and Realtime Expectations`]

### Supabase and Production Safety Requirements

The connected Supabase database is production-impacting. Story 1.4 may perform read-only inspection and advisors, but must not write data, apply migrations, deploy functions, change storage, or run destructive SQL. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/architecture.md#Data Architecture`]

Read-only create-story inspection on 2026-05-03T10:56:09Z returned:

| Check | Result | Story impact |
| --- | --- | --- |
| Supabase `list_tables(schemas=["public"], verbose=false)` | Only `public.francophone_pack_members`, RLS enabled, 1 row | F-01 still blocks production confidence. |
| Supabase `list_migrations` | Only `001 francophone_pack_members` | App migrations are not visible on the connected target. |
| Supabase security advisors | `function_search_path_mutable` warning for `public.set_updated_at` | Confirms connected target is still not the local app schema and has its own function warning. |
| Supabase performance advisors | `auth_rls_initplan` warning on `public.francophone_pack_members` policy | Not an app-schema risk, but reinforces target mismatch. |

Current Supabase documentation to preserve in the risk register:

- Tables, views, and functions in exposed schemas require RLS or equivalent protection; public-schema objects without RLS can be accessible through the Data API. [Source: Supabase docs `Securing your API`, searched 2026-05-03]
- Storage public buckets make assets publicly accessible to anyone with the URL; private buckets require authenticated download or signed URLs and storage RLS policies. [Source: Supabase docs `Storage Buckets`; Source: Supabase docs `Serving assets from Storage`, searched 2026-05-03]
- Storage upload policies are defined on `storage.objects`; uploads need INSERT policy, and upsert needs SELECT and UPDATE as well. [Source: Supabase docs `Storage Access Control`, searched 2026-05-03]
- Avoid user-editable metadata/JWT claims for authorization; use trusted tables/RLS/server checks. [Source: Supabase skill security checklist]
- Do not put privileged `SECURITY DEFINER` functions in exposed schemas when avoidable; if present, harden search paths and access carefully. [Source: Supabase skill security checklist]

### Architecture and Framework Guardrails

Active stack: Next.js `16.2.1`, React `19.2.4`, TypeScript strict mode, Tailwind CSS 4, Vitest, ESLint, `@supabase/ssr ^0.9.0`, and `@supabase/supabase-js ^2.100.1`. Story 1.4 should not require framework or dependency changes. [Source: `_bmad-output/project-context.md#Technology Stack & Versions`; Source: `_bmad-output/planning-artifacts/architecture.md#Technical Constraints & Dependencies`]

Use existing Supabase helpers in implementation stories and do not introduce ad hoc clients, alternate env names, a new backend, GraphQL, tRPC, Prisma, Drizzle, Redux, Zustand, or a new design system. Story 1.4 should be docs-only, so these are guardrails against accidental scope creep. [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`; Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`]

If runtime route, redirect, middleware/proxy, Server Action, Route Handler, or caching changes are unexpectedly re-scoped into this story, stop and read the installed Next.js 16 docs under `node_modules/next/dist/docs/` first. This story should not normally need those changes. [Source: `AGENTS.md`; Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`]

### UX Requirements Relevant To Risk Decisions

Pending and refused users must retain explicit status boundaries and must not be routed into confusing login loops. Legal pages must remain public and must not expose private member/chat/admin data. Story 1.4 should mention that Story 1.3's legal-route fix supports FR2 and does not weaken private-route boundaries. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Navigation Patterns`; Source: `_bmad-output/planning-artifacts/prd.md#SEO Strategy`]

Accepted beta risks should be written in owner-readable language. Avoid database-only wording when describing product impact. Example: say "admin decisions have weaker audit trail" rather than only "missing `admin_id` column". [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns`; Source: `_bmad-output/planning-artifacts/prd.md#Technical Success`]

### Testing and Verification Requirements

`package.json` has no `test` script. Use `npx vitest run ...` directly. [Source: `package.json`; Source: `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md#Testing Requirements`]

Known baseline from Story 1.3 after review patches:

- `npx vitest run src/__tests__/authorization-hardening.test.ts src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts` passed: 3 files, 21 tests.
- `git diff --check` passed.
- `npm run lint` failed with known baseline shape: 94 problems (52 errors, 42 warnings).
- `npx vitest run` failed only on known baseline `src/__tests__/profile-utils.test.ts` availability-label assertions: 42 passed, 3 failed.

[Source: `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md#Debug Log References`]

For Story 1.4, verification should prove the risk register matches current evidence. It does not need to prove production RLS behavior while F-01 persists; instead, it must state that production RLS confidence is blocked by target mismatch.

### Risk Register Format Guidance

Use compact tables and direct classifications. Suggested minimum sections:

1. Executive launch posture.
2. Classification rules.
3. Launch blockers.
4. Non-blocking accepted beta risk candidates.
5. Post-MVP follow-ups.
6. Verification evidence.
7. Owner decisions and go/no-go notes.

Each risk row should include:

| Field | Required content |
| --- | --- |
| ID | Preserve F-## where applicable; use new IDs only for newly discovered risks. |
| Classification | `launch blocker`, `non-blocking accepted beta risk candidate`, or `post-MVP follow-up`. |
| Current evidence | Cite source files/artifacts and latest verification. |
| Beta impact | Owner-readable impact. |
| Required action | Pre-launch action for blockers, owner acceptance for risk candidates, or follow-up for post-MVP. |
| Decision status | `blocked`, `accepted candidate`, `owner decision needed`, or `follow-up`. |

### Git Intelligence Summary

Recent commits are `fix: harden authorization boundaries`, `Merge story/1-2-mvp-access-matrix into dev`, `docs: finalize story 1.2 access matrix`, `feat: plan story`, and `Merge branch 'story/1-1-authorization-boundaries-audit' into dev`. The established pattern is documentation-first security work, exact verification recording, targeted static tests for brownfield route/security expectations, and explicit baseline failure classification. [Source: `git log --oneline -5` during create-story on 2026-05-03]

The working tree was clean during create-story analysis. If dev-story sees unrelated worktree changes, do not revert them; focus on Story 1.4 artifacts unless conflicts occur. [Source: `git status --short` during create-story on 2026-05-03]

### Project Structure Notes

Expected files to update for Story 1.4 implementation:

- `_bmad-output/implementation-artifacts/1-4-document-launch-blocking-security-risks-and-non-blocking-accepted-beta-risks.md`
- `_bmad-output/implementation-artifacts/1-4-launch-security-risk-register.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

Do not update `src/`, `supabase/`, package files, generated types, tests, app routes, UI, or dependencies for this documentation-only story unless owner explicitly re-scopes it. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/architecture.md#Project Organization`]

### References

- `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`
- `_bmad-output/planning-artifacts/epics.md#Story 1.4: Document Launch-Blocking Security Risks and Non-Blocking Accepted Beta Risks`
- `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`
- `_bmad-output/planning-artifacts/prd.md#Technical Success`
- `_bmad-output/planning-artifacts/prd.md#Operational Readiness`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Data Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Navigation Patterns`
- `_bmad-output/implementation-artifacts/1-1-access-security-audit.md`
- `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`
- `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md`
- `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`
- `src/__tests__/authorization-hardening.test.ts`
- `src/__tests__/mvp-route-cleanup.test.ts`
- `src/__tests__/auth-url.test.ts`
- `src/lib/supabase/middleware.ts`
- `src/components/chat/message-input.tsx`
- Supabase docs: `Securing your API`, `Storage Buckets`, `Serving assets from Storage`, `Storage Access Control`

## Change Log

| Date | Change |
| --- | --- |
| 2026-05-03 | Created comprehensive Story 1.4 developer guide for Epic 1 launch security risk classification. |

## Dev Agent Record

### Agent Model Used

gpt-5.5 (OpenCode, openai/gpt-5.5)

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List

- `_bmad-output/implementation-artifacts/1-4-document-launch-blocking-security-risks-and-non-blocking-accepted-beta-risks.md`
