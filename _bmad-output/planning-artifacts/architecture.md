---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/brownfield-mvp-speckit-distillate.md
  - _bmad-output/project-context.md
workflowType: 'architecture'
project_name: 'webapp-nextjs'
user_name: 'Maxime'
date: '2026-04-30'
lastStep: 8
status: 'complete'
completedAt: '2026-04-30'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines 50 functional requirements across the closed-beta community loop. Architecturally, these requirements cluster into the following capability areas:

- Public access and positioning: public pages, legal pages, access CTA, and copy that accurately presents a private closed-beta club.
- Identity and authentication: X sign-in, X profile association, returning-session behavior, and signed-out route boundaries.
- Admission and onboarding: required admission/profile information, manual review, pending/refused/approved states, onboarding completion, and state-based routing.
- Member chat experience: approved-member access to `/chat`, admin-defined topic channels, message reading, message sending, and daily community participation.
- Admin admission and access operations: candidate review, approve/refuse actions, member status/role visibility, role/access management, suspension/removal, troubleshooting, and auditability where supported.
- Channel administration: owner/admin-defined topic channels, channel availability management, and exclusion of user-created channel proposals from MVP.
- Authorization and protected access: member-only route/data protection and admin-only mutation protection across UI, server, database, direct query, API, and realtime paths.
- Migration and beta operations: selected X cohort tracking, conversion/activation/engagement observation, and reduced dependency on manual database edits.
- Scope parking: future candidates such as E2E encryption, private DMs, Nostr, AI, Lightning, media, polls, and platformization remain out of MVP unless explicitly promoted.

Architecturally, the system should be organized around a small number of stable concepts: authenticated identity, app profile, admission status, onboarding/profile completion, member access, admin role, channel, message, and operational audit/risk visibility.

**Non-Functional Requirements:**

The NFRs are architecture-shaping rather than incidental.

Security is the primary driver. Pending, refused, logged-out, and non-member users must be blocked from member-only routes, chat data, message APIs, and realtime/private data paths. Non-admin users must be blocked from admission, role, user, access, and channel management actions. These boundaries must be enforced outside visible UI through trusted server/database-controlled paths.

Reliability is focused on route/state correctness. X sign-in, auth callback handling, admission-state routing, onboarding completion, and chat entry must avoid blocking errors and redirect loops. Approved onboarded users should consistently land on `/chat`; approved not-onboarded users should reach onboarding; pending and refused users should reach explicit status boundaries.

Operational readiness matters because beta operation should not rely on routine manual Supabase edits. Admins need app-visible status, role, admission, onboarding/profile, access, and troubleshooting information.

Performance requirements are practical MVP targets. Public access, auth callback, admission status, onboarding, and chat entry should load without user-visible blocking delays for the initial 10 to 30 approved-user cohort. Chat read/send should feel responsive enough for daily conversation.

Privacy and compliance requirements require private handling of admission, profile, role, and private community data. Public pages must not expose private member content, profiles, chat messages, admin data, or admission data. Data collection should stay limited to authentication, manual admission, member recognition, beta operations, and access control.

Accessibility requirements are pragmatic closed-beta safeguards: readable text, understandable primary actions, explicit text for admission states, recoverable blocking errors, and mobile usability for chat/admission flows.

**Scale & Complexity:**

The project is a brownfield full-stack web app with medium-high architectural complexity. The complexity comes less from user volume and more from security-sensitive state transitions, Supabase schema/RLS uncertainty, chat/realtime behavior, and legacy feature drift.

- Primary domain: full-stack private community web app.
- Complexity level: medium-high.
- Estimated architectural components: public/auth routing, session/admission guard layer, profile/onboarding model, chat/channel subsystem, admin operations subsystem, Supabase data/RLS layer, beta operations/observability layer, and legacy-route containment strategy.

Important complexity indicators:

- Real-time or near-real-time chat behavior is required or already partially implemented.
- Multi-tenancy is not an MVP requirement; the current product is one private club, with platformization deferred.
- Regulatory/compliance complexity is moderate: GDPR/privacy basics for sensitive community data.
- Integration complexity is moderate: Supabase Auth/database/realtime plus X OAuth identity continuity.
- User interaction complexity is concentrated in chat, search/context, admission status, and admin review/troubleshooting.
- Data complexity is high for the MVP because admission, profiles, sponsors, roles, channels, messages, notifications, and policies must align across product language, code, migrations, production schema, and generated types.

### Technical Constraints & Dependencies

The architecture must preserve the existing brownfield Next.js/Supabase implementation rather than introduce a rewrite, separate backend, separate SPA, or new design system before MVP.

Known technical constraints:

- Next.js `16.2.1` App Router with React `19.2.4`.
- TypeScript strict mode with `@/*` imports from `src`.
- Supabase via existing project helpers:
  - `src/lib/supabase/server.ts` for server code.
  - `src/lib/supabase/client.ts` for browser code.
  - `src/lib/supabase/middleware.ts` for session refresh/auth redirects.
- Existing environment contract:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- App routes live under `src/app`; protected app routes use `(app)` and auth-facing routes use `(auth)`.
- Route, redirect, middleware/proxy, Server Action, route handler, and caching changes require checking installed Next.js 16 docs first.
- Connected Supabase database is production-impacting. Inspect before writes; avoid writes by default; never destructive SQL without explicit owner approval and backup/rollback confidence.
- MVP runtime center is `/chat`.
- Existing legacy routes such as `/forum`, `/membres`, and `/membres/[id]` may remain directly accessible unless an explicit story authorizes removal or redirection.
- Existing French routes such as `/en-attente` are tolerated/current; user-facing copy is French-first and i18n-ready, while new/changed software identifiers should prefer English when practical.
- Existing UI foundation should be preserved. No new design system or broad UI redesign before MVP.
- Verification must distinguish baseline failures from new regressions.

Important unresolved dependencies:

- Supabase schema/RLS audit for profiles, admission status, sponsors/parrainage, channels, messages, notifications, roles, admin actions, views, functions, triggers, policies, migrations, and generated types.
- Admission data model mapping from product concepts to actual tables/fields.
- Admin approval/refusal implementation and authorization guarantees.
- Chat routing/search/deep-link architecture, especially `/chat`, `/chat/[slug]`, and remaining `/chat?channel=` links.
- Launch channel taxonomy and any channel-specific write restrictions such as a read-only jobs/offers channel.
- Lightweight moderation support, including message deletion/tombstones and report capture, subject to schema and RLS audit.
- Route/access matrix validation across anonymous, pending, refused, approved not-onboarded, approved onboarded, admin, and non-admin admin-access fallback states.

### Cross-Cutting Concerns Identified

The architectural decisions need to address these concerns consistently across implementation work:

- Admission state machine: logged out, no profile/incomplete request, pending, refused/rejected, approved not-onboarded, approved onboarded, suspended/removed if supported, admin/non-admin.
- Route guards and redirects: `/chat` as approved-member home, onboarding boundary, explicit pending/refused boundary at `/en-attente`, safe non-admin admin fallback, and no redirect loops.
- Supabase RLS and server/database authorization: UI hiding is insufficient; policies/actions/functions must enforce member/admin boundaries.
- Profile privacy and identity continuity: X handle/avatar/profile context must support admission and member trust without leaking sensitive private data.
- Admin operation safety: approve/refuse, role/access changes, channel management, troubleshooting, and auditability should be deliberate, authorized, and app-operable.
- Chat consistency: channel list, message read/send, composer state, realtime updates, search context, replies/mentions, moderation, and mobile usability must support the daily social loop.
- Brownfield containment: legacy forum, annuaire, jobs/offers, channel proposals, broad discovery, private DMs, and future platform features should be parked or hidden without destructive removal unless explicitly approved.
- Schema reproducibility: production schema, migrations, generated types, app assumptions, and tests must be reconciled before relying on security-sensitive behavior.
- French-first UX with stable technical identifiers: public/admission/status copy should be French-first and human, while technical route/code conventions should remain deliberate and consistent.
- Verification discipline: build/lint/tests/manual checks must record exact commands, outcomes, and whether failures are baseline or new regressions.

## Starter Template Evaluation

### Primary Technology Domain

The primary technology domain is a brownfield full-stack Next.js/Supabase web application.

This is not a greenfield project. The architecture should treat the existing repository as the starter foundation and should not initialize a new starter template for MVP work.

### Starter Options Considered

**Existing brownfield Next.js/Supabase app**

The existing app already provides the relevant foundation:

- Next.js App Router under `src/app`.
- React and TypeScript strict mode.
- Tailwind CSS styling.
- ESLint and Vitest setup.
- Supabase Auth/database integration.
- Existing server, browser, and middleware Supabase helpers.
- Existing public, auth, protected app, chat, profile, admin, and legal routes.
- Existing brownfield data model, migrations, generated types, and runtime behavior that must be audited rather than replaced.

This option best fits the MVP because the goal is stabilization, not re-platforming.

**Current `create-next-app`**

Current Next.js starter guidance supports TypeScript, Tailwind CSS, ESLint, App Router, Turbopack, `@/*` aliases, and agent guidance defaults.

This aligns with the existing app's general shape, but using it would create a parallel greenfield foundation and does not solve the brownfield MVP risks: admission state, route guards, Supabase RLS, production schema drift, chat behavior, and legacy feature containment.

It is useful as a reference for current Next.js conventions, not as an initialization path.

**Supabase SSR Next.js setup**

Current Supabase SSR guidance confirms the project direction: use `@supabase/ssr`, separate browser/server clients, cookie-backed SSR session handling, and server-side authorization checks.

This should reinforce the existing helper pattern rather than replace it. The project should continue using `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, and `src/lib/supabase/middleware.ts`.

**Create T3 App**

Create T3 App is a maintained full-stack TypeScript Next.js starter, but it is not appropriate for this MVP. It introduces architectural choices such as tRPC, Prisma, and NextAuth-oriented patterns that conflict with the existing Supabase Auth/database architecture and would expand scope.

### Selected Starter: Existing Brownfield Repository

**Rationale for Selection:**

The selected foundation is the current `webapp-nextjs` repository.

The architecture must preserve and stabilize the existing Next.js/Supabase app because:

- The MVP is brownfield stabilization, not greenfield creation.
- The app already contains the runtime surfaces that must be fixed: X auth, admission routing, onboarding, `/chat`, admin, profiles, notifications, and legal/public pages.
- The highest risks are schema/RLS correctness, route/access matrix behavior, and legacy feature drift; a new starter would not reduce those risks.
- Project context explicitly forbids broad refactors, feature expansion, runtime rewrites, and dependency/design-system churn without owner approval.
- Existing direct access to legacy routes must be preserved unless a story explicitly authorizes removal.
- Supabase is production-connected, so architecture must audit and harden the current implementation rather than replace it casually.

**Initialization Command:**

No starter initialization command should be run for MVP architecture.

```bash
# Not applicable: use the existing brownfield repository as the foundation.
```

**Architectural Decisions Provided by Foundation:**

**Language & Runtime:**

The project uses TypeScript strict mode, Next.js App Router, React, and `@/*` imports from `src`.

**Styling Solution:**

The project uses Tailwind CSS 4 and existing UI/component patterns. No new design system or styling stack should be introduced for MVP.

**Build Tooling:**

The project uses the existing Next.js build pipeline and configured package scripts. Next.js 16 behavior should be verified against installed docs before route, middleware/proxy, redirect, route-handler, Server Action, or caching changes.

**Testing Framework:**

The project uses Vitest with tests under `src/__tests__`, plus ESLint. Verification must distinguish baseline failures from regressions.

**Code Organization:**

Architecture should preserve current organization:

- App Router routes under `src/app`.
- Protected routes under `(app)`.
- Auth-facing routes under `(auth)`.
- Shared components under `src/components`.
- UI primitives under `src/components/ui`.
- Supabase helpers under `src/lib/supabase`.
- Supabase migrations under `supabase/migrations`.

**Development Experience:**

Development should continue from the existing repository, with minimal, scoped changes. Implementation stories should start with audit and hardening tasks, not starter initialization.

**Note:** The first implementation story should not initialize a project. It should verify the current foundation: route/access matrix, Supabase schema/RLS/migration reproducibility, auth/admission helpers, and chat/admin security boundaries.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Data architecture uses the existing Supabase PostgreSQL project, migrations, generated types, RLS policies, and current schema as the system of record, subject to audit before security-sensitive reliance.
- Authentication remains Supabase Auth with X OAuth as the MVP identity path.
- Authorization must be enforced server-side and database-side, not only through UI hiding.
- The admission/member access model must be treated as an explicit state machine that drives routing, data access, and admin operations.
- `/chat` is the approved-member app center.
- The MVP remains a single private club, not a multi-tenant platform.
- Existing brownfield route structure and UI foundation are preserved unless explicit owner-approved stories change them.

**Important Decisions (Shape Architecture):**

- Use existing Supabase helper boundaries for server, browser, and middleware/session refresh code.
- Use App Router route groups and server-side route guards for protected flows.
- Prefer Server Components and server-side authorization checks for sensitive data access.
- Use client components only where browser interaction, realtime subscriptions, or chat UI interactivity require them.
- Keep API surface minimal and local to existing Next.js/Supabase patterns: Server Actions, Route Handlers, Supabase RPCs/functions, or direct Supabase calls only where already appropriate and secured.
- Verification is part of architecture: route/access matrix, RLS behavior, build/lint/tests, and manual auth checks must be recorded with baseline/regression distinction.

**Deferred Decisions (Post-MVP):**

- Multi-tenancy and paid meta-club platform architecture.
- True group end-to-end encryption.
- Private 1:1 messages.
- Nostr, Lightning, AI participants, AI shared memory, media libraries, polls, and broad platform features.
- Full design-system redesign, dark mode strategy, PWA installability, and comprehensive accessibility audit.
- Broad route unification or deletion of legacy routes.
- Dependency upgrades unless needed for a specific security or launch blocker.

### Data Architecture

**Decision: Use existing Supabase PostgreSQL as the MVP data layer.**

The database choice is already determined by the brownfield implementation. Architecture work should audit and stabilize the current Supabase schema rather than introduce another database, ORM, or data service.

**Version Context:**

- Current project context: `@supabase/supabase-js ^2.100.1`, `@supabase/ssr ^0.9.0`.
- Latest verified packages: `@supabase/supabase-js 2.105.1`, `@supabase/ssr 0.10.2`.

**Rationale:**

The MVP risks are schema/RLS correctness, reproducibility, and authorization, not database selection. Introducing Prisma, Drizzle, a separate backend database, or a new schema layer would expand scope and obscure production reality.

**Data Modeling Approach:**

Use the existing production schema as discovered truth, then map product concepts to actual tables/fields:

- Authenticated identity.
- Profile.
- X profile context.
- Admission status.
- Sponsor/parrain relationship.
- Onboarding/profile completion.
- Role/admin status.
- Access removal/suspension if supported.
- Channel.
- Message.
- Notification.
- Moderation/reporting record if retained.
- Audit timestamps/admin actor fields where supported.

Where the schema does not support a required MVP concept clearly, record it as a schema/RLS discovery item or beta risk before implementing behavior.

**Data Validation Strategy:**

Validation should exist at the boundary where data mutates:

- Client forms may provide usability validation.
- Server Actions, Route Handlers, or RPCs must validate security-sensitive mutations.
- Database constraints/RLS must enforce access boundaries for member/admin data.
- User-facing language should use product terms such as pending, approved, and refused, while database terms may remain `pending`, `approved`, and `rejected` if already implemented.

**Migration Approach:**

Migrations are controlled and audit-first.

- Inventory production schema, policies, functions, triggers, views, generated types, and migrations before new migration work.
- Do not perform destructive SQL without explicit owner approval, environment confirmation, and rollback confidence.
- Prefer small additive migrations for MVP blockers.
- Reconcile generated types with production before relying on type assumptions.
- Treat missing objects such as suspected `profiles_public` drift as launch-risk findings until verified.

**Caching Strategy:**

Default to correctness over caching for MVP.

- Do not cache authenticated/private/member/admin data unless explicitly proven safe.
- Avoid caching responses that depend on Supabase auth cookies or admission state.
- Public landing/legal pages can use normal static or cached behavior if they do not expose private data.
- Chat, admission status, admin review, and profile/member data should favor fresh server/database checks.

### Authentication & Security

**Decision: Supabase Auth with X OAuth remains the authentication method.**

X identity is a product requirement for admission continuity with the existing community. Supabase Auth remains the implementation foundation.

**Authorization Pattern:**

Use layered authorization:

- Middleware/proxy/session refresh keeps auth state current.
- Server-side guards route users by auth, admission, onboarding, and role state.
- Server Actions/Route Handlers/RPCs enforce mutation authorization.
- Supabase RLS enforces database access boundaries.
- UI hiding is only a convenience and must not be treated as security.

**Admission State Machine:**

Architecture should standardize these states for implementation reasoning:

- Logged out.
- Authenticated with no profile or incomplete request.
- Pending.
- Refused/rejected.
- Approved but not onboarded.
- Approved and onboarded.
- Suspended/removed if supported by current schema.
- Admin and non-admin role overlays.

Routing and access decisions must be derived from this state machine.

**Route Security Decision:**

- Approved and onboarded users route to `/chat`.
- Approved but not-onboarded users route to onboarding/profile completion.
- Pending users route to explicit waiting state.
- Refused users route to explicit refused state, currently tolerated at `/en-attente`.
- Logged-out users only reach public/auth-appropriate routes.
- Non-admin users attempting admin access fall back safely, preferably to `/chat` if approved.

**Data Encryption Approach:**

Use platform-level transport/security defaults for MVP. Do not introduce application-level E2E encryption before MVP. True group E2E encryption is a future architecture decision because it affects moderation, search, admin operations, and message recovery.

**API Security Strategy:**

- Do not expose service-role keys or private credentials to client code.
- Assume all `NEXT_PUBLIC_` variables are browser-visible.
- Use `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`.
- Prefer existing Supabase helpers over ad hoc clients.
- Sensitive mutations should flow through server-authorized paths or audited RPCs, not arbitrary client writes.

### API & Communication Patterns

**Decision: Preserve the existing Next.js/Supabase communication model.**

Do not introduce GraphQL, tRPC, a separate REST backend, or a dedicated WebSocket service for MVP.

**Allowed Communication Patterns:**

- Server Components for server-side data reads where appropriate.
- Server Actions for form/mutation flows where already aligned with Next.js 16 guidance.
- Route Handlers for HTTP endpoints where needed.
- Supabase browser client for client-side realtime/chat subscriptions where required.
- Supabase RPC/functions only when they improve authorization or transactional safety and are audited.

**API Documentation Approach:**

For MVP, document security-sensitive contracts in BMad architecture/stories rather than creating a separate public API spec.

Minimum contracts to document:

- Admission state routing contract.
- Admin approval/refusal contract.
- Role/access mutation contract.
- Channel read/write contract.
- Message read/send/delete/report contract.
- Notification contract if touched.

**Error Handling Standards:**

Errors should be explicit and state-aware.

- Auth/admission errors should route to clear user-facing states, not loops.
- Refused users should see product language, not database terminology.
- Admin actions should return clear outcomes: approved, refused, unchanged, failed, or needs technical follow-up.
- Chat send failures should be recoverable with retry or clear failure state.
- Security failures should not leak private data or policy internals.

**Rate Limiting Strategy:**

No new broad rate-limiting system is selected for MVP. Abuse protection should rely first on closed-beta admission, Supabase/RLS authorization, and minimal exposed mutation surfaces. Add targeted rate limits only if a specific beta risk or endpoint abuse vector is identified.

### Frontend Architecture

**Decision: Preserve existing React/Next.js frontend architecture and UI foundation.**

No broad redesign, new component library, or global state overhaul before MVP.

**Version Context:**

- Current project context: Next.js `16.2.1`, React `19.2.4`.
- Latest verified packages: Next.js `16.2.4`, React `19.2.5`.
- Architecture does not require upgrading for MVP unless a separate implementation story approves it.

**State Management Approach:**

Use the simplest local/server state model already present.

- Server-rendered state for auth/admission/protected layout decisions.
- Local component state for UI interactions.
- Supabase realtime/client state for chat where required.
- Avoid adding Redux, Zustand, TanStack Query, or another state layer unless a concrete repeated problem requires it.

**Component Architecture:**

- Reuse existing components and UI primitives.
- Extract components only when repeated usage or clarity requires it.
- Keep beta-critical component states explicit: admission status, channel active/unread/loading/error, message sending/sent/failed/deleted, admin action pending/success/failure.
- Preserve accessibility basics and mobile usability.

**Routing Strategy:**

- Keep App Router.
- Keep `/chat` and `/chat/[slug]` as canonical chat route surfaces for now.
- Treat remaining `/chat?channel=` links as tolerated legacy until chat routing/search architecture is explicitly resolved.
- Do not delete `/forum`, `/membres`, or `/membres/[id]` as part of MVP architecture.
- Existing French routes are tolerated; new or changed route identifiers should prefer English only when safe and explicitly scoped.

**Performance Optimization:**

Reliability beats optimization for MVP.

- Do not introduce broad memoization, code-splitting, or bundle work unless a measured beta-critical issue exists.
- Keep chat interactions responsive enough for 10 to 30 beta users.
- Avoid caching authenticated/private/admission/admin data in ways that risk stale or leaked access.

### Infrastructure & Deployment

**Decision: Preserve existing deployment assumptions and avoid infrastructure redesign before MVP.**

The architecture assumes the existing Next.js/Supabase deployment path remains in place.

**Hosting Strategy:**

Keep current web hosting and Supabase project arrangement unless a specific launch blocker requires change. Vercel-style deployment is compatible with the current Next.js architecture, but deployment details should be verified from actual project settings before release.

**CI/CD Pipeline Approach:**

Do not add Husky/pre-commit hooks during MVP stabilization unless explicitly approved.

Minimum release verification should include:

- Build.
- Changed-scope lint for touched files or repo-wide lint if feasible.
- Targeted tests for touched beta-critical flows.
- Manual route/access matrix checks for auth/admission/role changes.
- Supabase schema/RLS checks for database/security changes.

**Environment Configuration:**

Use the existing environment contract:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Do not introduce alternate env names such as `NEXT_PUBLIC_SUPABASE_ANON_KEY` unless the env contract is explicitly changed.

**Monitoring and Logging:**

No new observability platform is selected for MVP. For beta readiness, prioritize operational visibility in the app/admin flows and clear verification records. Add structured logging or monitoring only where it directly reduces launch risk.

**Scaling Strategy:**

The MVP target is the initial 10 to 30 approved-user cohort. Architecture should not block later migration of the broader 300+ X group, but scaling work is not part of MVP unless security, reliability, or chat responsiveness fails for the beta cohort.

### Decision Impact Analysis

**Implementation Sequence:**

1. Audit current route/access matrix against the admission state machine.
2. Audit Supabase schema, RLS, migrations, generated types, functions, triggers, and views for admission, profiles, sponsors, roles, channels, messages, notifications, admin actions, and moderation.
3. Stabilize auth/admission/onboarding routing around `/chat`, `/onboarding`, and explicit pending/refused states.
4. Harden admin approval/refusal, role/access, and channel-management actions.
5. Verify approved-member chat read/send and channel visibility.
6. Resolve or explicitly risk-accept schema/RLS drift before beta.
7. Add only targeted UX/component fixes for beta-critical admission, chat, and admin clarity.
8. Record build/lint/test/manual verification outcomes with baseline/regression distinction.

**Cross-Component Dependencies:**

- Admission state drives routing, chat access, profile visibility, admin troubleshooting, and RLS policy expectations.
- Supabase schema/RLS audit must precede confident admin, chat, moderation, sponsor, and profile implementation.
- Chat UX depends on route strategy, channel model, message permissions, realtime behavior, and search/deep-link decisions.
- Admin operations depend on reliable role checks, admission model mapping, auditability fields, and safe mutation paths.
- Public landing and auth flows depend on closed-beta positioning, X identity, and state routing.
- Legacy-route containment depends on preserving direct access while removing MVP navigation promises and defaults.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**

The main implementation conflict points are naming, Supabase access boundaries, admission-state handling, route defaults, admin mutation paths, chat routing, legacy feature containment, user-facing terminology, test placement, and verification discipline.

These rules are intended to prevent different AI agents from making incompatible implementation choices while working on the same brownfield MVP.

### Naming Patterns

**Database Naming Conventions:**

Agents must not invent new database naming conventions before schema audit.

Use the existing Supabase schema naming as discovered truth. Where existing database names use snake_case, continue snake_case for database tables, columns, policies, functions, triggers, and migrations.

Examples:

- Use existing `profiles`, `channels`, `messages`, or discovered table names rather than inventing `Users`, `appUsers`, or `memberProfiles`.
- Use `user_id`, `profile_id`, `channel_id`, and `created_at` style names for new database fields if additive migrations are approved.
- Use database status values already present, such as `pending`, `approved`, and `rejected`, unless a migration explicitly changes the data contract.

Product/UI language may differ from database language. The UI should say refused/refusé where appropriate, while the database may continue using `rejected`.

**API Naming Conventions:**

Do not introduce a broad new REST or RPC naming scheme for MVP.

When Route Handlers are needed, use clear resource-oriented paths under the existing App Router structure. Prefer existing route/action patterns over new API namespaces.

Rules:

- Use kebab-case or existing App Router path naming for URL segments.
- Use English route identifiers for new or changed technical route names when safe and explicitly scoped.
- Preserve existing French routes such as `/en-attente` unless a story approves route migration.
- Do not introduce `/api/v1` or a public API hierarchy unless a specific implementation story requires it.

**Code Naming Conventions:**

Use TypeScript/React conventions already present in the codebase.

Rules:

- Components: `PascalCase`, for example `AdmissionStatusScreen`.
- Hooks: `useCamelCase`, for example `useChatChannel`.
- Functions and variables: `camelCase`, for example `getAdmissionState`, `userId`.
- Types and interfaces: `PascalCase`, for example `AdmissionState`.
- Constants: follow existing local convention; use `UPPER_SNAKE_CASE` only for true constants or env-like values.
- Files: follow the surrounding folder convention before introducing a new one.

Agents must read nearby files before naming new files, components, or helpers.

### Structure Patterns

**Project Organization:**

Agents must preserve the existing project organization.

Rules:

- App Router routes remain under `src/app`.
- Protected app routes remain under the `(app)` route group.
- Auth-facing routes remain under the `(auth)` route group.
- Shared components remain under `src/components`.
- UI primitives remain under `src/components/ui`.
- Supabase helpers remain under `src/lib/supabase`.
- Tests remain under `src/__tests__` unless a file already has a nearby established test pattern.
- Supabase migrations remain under `supabase/migrations`.

Do not create new top-level architecture folders such as `services`, `repositories`, `domain`, or `backend` unless a later architecture decision explicitly introduces them.

**File Structure Patterns:**

When adding or changing code:

- Prefer editing existing files over creating new abstractions.
- Prefer a small helper in the same feature area over a global utility.
- Prefer existing exported helpers over new utility wrappers.
- Keep server/client boundaries explicit.
- Only files with `"use client"` may use browser APIs, client hooks, or Supabase browser helpers.

Do not create ad hoc Supabase clients. Use:

- `src/lib/supabase/server.ts` for server code.
- `src/lib/supabase/client.ts` for browser code.
- `src/lib/supabase/middleware.ts` for session refresh/auth redirects.

### Format Patterns

**API Response Formats:**

For MVP, avoid creating a universal API response wrapper unless the existing code already uses one in the touched area.

Server Actions and Route Handlers should return the simplest existing local pattern, but must distinguish:

- Success.
- Validation failure.
- Unauthorized or forbidden action.
- Not found.
- Unexpected failure.

Security-sensitive failures should not leak private data, policy internals, SQL details, or admin-only context.

Admin action outcomes should map to clear product states:

- Approved.
- Refused.
- Unchanged.
- Failed.
- Needs technical follow-up.

**Data Exchange Formats:**

Rules:

- Use ISO strings for date/time values crossing JSON boundaries.
- Preserve Supabase/database snake_case fields at database boundaries.
- Use camelCase in TypeScript UI/domain logic where mapping already exists or is local and explicit.
- Do not silently rename persisted fields without migration and generated type updates.
- Treat `null` and missing values deliberately in admission/profile/admin flows.
- Do not infer approval from partial data such as sponsor presence, profile completion, or client-side state.

### Communication Patterns

**Event System Patterns:**

No new broad event bus is selected for MVP.

Agents should not introduce custom event systems, global pub/sub, or cross-app event naming unless required by a specific story.

For chat realtime:

- Use existing Supabase realtime patterns if already implemented.
- Keep event payload assumptions aligned with current message/channel schema.
- Validate pending/refused/non-member access through database/server policy, not client subscription filtering alone.

**State Management Patterns:**

Do not add a new global state library for MVP.

Use:

- Server-side state for auth/admission/protected layout decisions.
- Local component state for UI interactions.
- Existing Supabase realtime/client state for chat interactivity.
- Existing form state patterns for onboarding/admission/admin actions.

Admission state must be treated as a single conceptual state machine even if current implementation reads multiple fields.

Canonical reasoning states:

- Logged out.
- Authenticated with no profile or incomplete request.
- Pending.
- Refused/rejected.
- Approved but not onboarded.
- Approved and onboarded.
- Suspended/removed if supported.
- Admin/non-admin as role overlays.

### Process Patterns

**Error Handling Patterns:**

Errors must be explicit, user-safe, and state-aware.

Rules:

- Pending and refused users must not be redirected into confusing login loops.
- Refused users must see a clear refused state, currently tolerated at `/en-attente`.
- User-facing copy should use product language, not database labels like `rejected`.
- Chat send failures should be recoverable where feasible.
- Admin mutation failures should be visible and not silently ignored.
- Authorization failures should fail closed.

Logging/debug output must not expose secrets, service-role keys, private admission details, or private member/chat data.

**Loading State Patterns:**

Loading states should be local and flow-specific unless an existing global pattern exists.

Critical flows requiring explicit loading/error states:

- X auth callback.
- Admission-state check.
- Onboarding/profile completion.
- Chat channel/message loading.
- Message send/retry.
- Admin candidate review.
- Admin approve/refuse/access changes.

Loading states must not temporarily expose member-only data to unauthorized users.

### Enforcement Guidelines

**All AI Agents MUST:**

- Read `_bmad-output/project-context.md` and this architecture document before implementation.
- Reuse existing Supabase helpers and never create ad hoc clients.
- Preserve `/chat` as the approved-member destination unless the owner changes the MVP contract.
- Preserve explicit pending/refused boundaries and avoid redirect loops.
- Enforce member/admin boundaries server-side and database-side, not only in UI.
- Treat Supabase production database work as inspect-first and non-destructive by default.
- Preserve legacy direct routes unless removal is explicitly approved.
- Keep changes minimal and brownfield-safe.
- Record verification commands and distinguish baseline failures from regressions.

**Pattern Enforcement:**

- Pattern violations should be documented in the relevant story or implementation notes.
- If a story requires breaking one of these patterns, it must explicitly call out the exception and rationale.
- If implementation discovers that an architecture pattern conflicts with production schema or existing runtime behavior, stop and record the discrepancy before making broad changes.
- New patterns should be added to this architecture document or project context only after owner approval.

### Pattern Examples

**Good Examples:**

- Use `createClient` from the existing server Supabase helper in a Server Component or Server Action rather than importing `createServerClient` directly in a feature file.
- Route an approved onboarded user to `/chat` instead of `/forum`.
- Show refused users a clear French-first refused message while preserving `rejected` as a database value if that is the existing schema.
- Add a targeted test under `src/__tests__` for a route/access matrix behavior.
- Hide a parked feature from navigation while preserving its direct route if removal is not approved.
- Read installed Next.js 16 docs before changing middleware/proxy, redirects, route handlers, Server Actions, or caching behavior.

**Anti-Patterns:**

- Creating a new Supabase browser/server client directly inside a random component.
- Granting access because a user has a sponsor or completed profile without checking approved member status.
- Redirecting refused users to `/connexion` with no refused explanation.
- Reintroducing `/forum` as the default approved-user destination.
- Deleting `/forum`, `/membres`, or historical migrations because they are not MVP navigation items.
- Adding Prisma, tRPC, Redux, Zustand, a new design system, or a separate backend without explicit scope approval.
- Performing destructive SQL or production Supabase writes without explicit approval and rollback confidence.
- Caching authenticated admission/admin/chat responses in a way that can leak stale or private access.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
webapp-nextjs/
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── BMAD-migration-road-to-mvp.md
├── app_flow.md
├── db_flow.md
├── design.md
├── design-baseline.json
├── future-scaling-ideas.md
├── package.json
├── package-lock.json
├── bun.lock
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── middleware.ts
├── public/
│   ├── flags/
│   ├── images/
│   └── *.svg
├── docs/
├── design-system/
├── specs/
├── _bmad/
├── _bmad-output/
│   ├── project-context.md
│   └── planning-artifacts/
│       ├── prd.md
│       ├── ux-design-specification.md
│       ├── brownfield-mvp-speckit-distillate.md
│       └── architecture.md
├── supabase/
│   └── migrations/
└── src/
    ├── __tests__/
    │   ├── auth-url.test.ts
    │   ├── mvp-route-cleanup.test.ts
    │   ├── notifications.test.ts
    │   └── profile-utils.test.ts
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── icon.png
    │   ├── apple-icon.png
    │   ├── api/
    │   │   └── geo/
    │   ├── auth/
    │   │   └── callback/
    │   ├── cgu/
    │   ├── confidentialite/
    │   ├── mentions-legales/
    │   ├── rejoindre/
    │   ├── onboarding/
    │   │   └── page.tsx
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── connexion/
    │   │   ├── inscription/
    │   │   └── en-attente/
    │   └── (app)/
    │       ├── layout.tsx
    │       ├── chat/
    │       │   ├── layout.tsx
    │       │   ├── page.tsx
    │       │   └── [slug]/
    │       ├── admin/
    │       │   ├── actions.ts
    │       │   ├── layout.tsx
    │       │   ├── loading.tsx
    │       │   ├── page.tsx
    │       │   └── utilisateurs/
    │       ├── forum/
    │       ├── membres/
    │       ├── notifications/
    │       ├── parametres/
    │       ├── parrainages/
    │       ├── profil/
    │       └── tableau-de-bord/
    ├── components/
    │   ├── admin/
    │   ├── auth/
    │   ├── chat/
    │   ├── favorites/
    │   ├── forum/
    │   ├── home/
    │   ├── layout/
    │   ├── legal/
    │   ├── lightswind/
    │   ├── membres/
    │   ├── notifications/
    │   ├── onboarding/
    │   ├── profile/
    │   ├── sponsorship/
    │   ├── theme/
    │   └── ui/
    ├── hooks/
    │   ├── use-confetti.ts
    │   ├── use-mobile.tsx
    │   └── use-toast.tsx
    ├── lib/
    │   ├── auth-url.ts
    │   ├── notifications.ts
    │   ├── profile-utils.ts
    │   ├── utils.ts
    │   ├── utils.js
    │   ├── utils.d.ts
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── middleware.ts
    │   │   └── server.ts
    │   └── types/
    │       └── database.ts
    └── lightswind.css
```

### Architectural Boundaries

**API Boundaries:**

The project does not use a separate backend service for MVP. API and mutation boundaries live inside the Next.js application and Supabase.

- Public route boundary: `src/app/page.tsx`, legal routes, `/rejoindre`, auth-facing routes, and auth callback.
- Protected app boundary: `src/app/(app)/layout.tsx` and protected route groups.
- Auth boundary: root `middleware.ts`, `src/lib/supabase/middleware.ts`, `src/app/auth/callback`, and auth-facing routes under `src/app/(auth)`.
- Admin mutation boundary: `src/app/(app)/admin/actions.ts` and any existing admin-specific server paths.
- Existing API route boundary: `src/app/api/geo`.
- Database boundary: Supabase schema, RLS, functions, triggers, views, generated types, and migrations under `supabase/migrations/`.

Agents must not introduce a new backend boundary, public API hierarchy, or RPC layer unless a story explicitly requires it.

**Component Boundaries:**

Components are organized by existing feature folders.

- Chat UI belongs in `src/components/chat`.
- Admin UI belongs in `src/components/admin`.
- Auth UI belongs in `src/components/auth`.
- Onboarding UI belongs in `src/components/onboarding`.
- Profile/member UI belongs in `src/components/profile` and `src/components/membres`.
- Layout/navigation belongs in `src/components/layout`.
- Generic primitives belong in `src/components/ui`.

Feature components should not import directly from unrelated feature internals unless an existing pattern already does so. Shared UI should move only to `src/components/ui` when genuinely generic.

**Service Boundaries:**

The app does not currently have a formal service/repository/domain layer. Agents must not create one preemptively.

Existing service-like boundaries are:

- `src/lib/supabase/server.ts` for server Supabase access.
- `src/lib/supabase/client.ts` for browser Supabase access.
- `src/lib/supabase/middleware.ts` for session refresh/auth redirects.
- `src/lib/auth-url.ts` for auth URL logic.
- `src/lib/notifications.ts` for notification helpers.
- `src/lib/profile-utils.ts` for profile helper logic.
- `src/lib/types/database.ts` for generated Supabase types.

New shared helpers should stay close to the feature unless repeated usage justifies placement under `src/lib`.

**Data Boundaries:**

Data access must respect four boundaries:

- Public data: landing/legal/access content, no private member/chat/admin data.
- Auth/session data: handled through Supabase Auth and middleware/session helpers.
- Member data: requires approved-member access and RLS/server-side enforcement.
- Admin data and mutations: require admin authorization and database/server enforcement.

Supabase RLS is the final data boundary. UI hiding and route protection are necessary but insufficient.

### Requirements to Structure Mapping

**Feature Mapping:**

Public access and positioning:

- Routes: `src/app/page.tsx`, `src/app/rejoindre`, `src/app/cgu`, `src/app/confidentialite`, `src/app/mentions-legales`.
- Components: `src/components/home`, `src/components/legal`.
- Requirements: FR1-FR4.

Identity and authentication:

- Routes: `src/app/(auth)/connexion`, `src/app/(auth)/inscription`, `src/app/auth/callback`.
- Helpers: `src/lib/auth-url.ts`, `src/lib/supabase/*`, root `middleware.ts`.
- Components: `src/components/auth`.
- Requirements: FR5-FR8.

Admission and onboarding:

- Routes: `src/app/(auth)/en-attente`, `src/app/onboarding`.
- Components: `src/components/onboarding`, `src/components/auth`.
- Data: profile/admission tables and generated types after Supabase audit.
- Requirements: FR9-FR16.

Member chat experience:

- Routes: `src/app/(app)/chat`, `src/app/(app)/chat/[slug]`.
- Components: `src/components/chat`.
- Data: channels, messages, realtime subscriptions, message policies.
- Requirements: FR17-FR22.

Admin admission and access operations:

- Routes: `src/app/(app)/admin`, `src/app/(app)/admin/utilisateurs`.
- Actions: `src/app/(app)/admin/actions.ts`.
- Components: `src/components/admin`.
- Requirements: FR23-FR31.

Channel administration:

- Routes/actions: admin routes and admin actions.
- Components: `src/components/admin`, `src/components/chat`.
- Data: channel tables/policies/functions after audit.
- Requirements: FR32-FR35.

Authorization and protected access:

- Root middleware: `middleware.ts`.
- Supabase middleware helper: `src/lib/supabase/middleware.ts`.
- Protected layout: `src/app/(app)/layout.tsx`.
- Admin layout: `src/app/(app)/admin/layout.tsx`.
- Supabase RLS/migrations: `supabase/migrations`.
- Tests: `src/__tests__/mvp-route-cleanup.test.ts` and future route/access tests.
- Requirements: FR36-FR42.

Migration and beta operations:

- Admin/user routes: `src/app/(app)/admin`, `src/app/(app)/admin/utilisateurs`.
- Profile/status helpers: `src/lib/profile-utils.ts`, generated database types.
- Documentation: `_bmad-output/planning-artifacts/*`.
- Requirements: FR43-FR47.

Scope parking and future candidates:

- Legacy routes: `src/app/(app)/forum`, `src/app/(app)/membres`, `src/app/(app)/tableau-de-bord`.
- Legacy components: `src/components/forum`, `src/components/membres`.
- Planning docs: PRD, architecture, distillate.
- Requirements: FR48-FR50.

### Integration Points

**Internal Communication:**

- Server-rendered routes read auth/admission/member/admin state through existing Supabase server helpers.
- Client components handle browser-only UI interactions and chat realtime where required.
- Admin actions mutate admission, roles, access, and channels only through authorized server/database paths.
- Components communicate through props and local state unless an existing shared pattern exists.
- Cross-feature state should not be globalized without a concrete repeated need.

**External Integrations:**

- Supabase Auth for sessions and X OAuth identity.
- Supabase PostgreSQL/RLS for app data authorization.
- Supabase Realtime where chat currently requires live updates.
- X OAuth through Supabase provider configuration.
- Deployment platform, likely Vercel-style, must be verified from actual project settings before release.

No Nostr, Lightning, AI provider, payment provider, media provider, or separate WebSocket service is part of MVP architecture.

**Data Flow:**

1. Public visitor reaches landing/access/legal/auth routes.
2. User starts X auth through the existing Supabase Auth path.
3. Auth callback/session refresh establishes authenticated state.
4. App resolves profile/admission/onboarding/role state.
5. Route guards send the user to public/auth, pending/refused, onboarding, `/chat`, or admin-safe fallback.
6. Approved members read/send chat data through member-authorized Supabase paths.
7. Admin users perform candidate/user/channel actions through authorized server/database mutation paths.
8. Supabase RLS and constraints enforce final access boundaries.
9. Tests and manual verification validate route/access outcomes.

### File Organization Patterns

**Configuration Files:**

Root-level configuration remains at the repository root:

- `package.json`, lock files, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.json`, `vitest.config.ts`.
- Environment files stay root-level and must not be committed with secrets.
- BMad configuration and output remain under `_bmad` and `_bmad-output`.

**Source Organization:**

- Routes stay under `src/app`.
- Feature components stay under `src/components/<feature>`.
- Shared hooks stay under `src/hooks`.
- Shared library helpers stay under `src/lib`.
- Supabase generated types stay under `src/lib/types/database.ts`.
- Supabase clients stay under `src/lib/supabase`.

**Test Organization:**

Tests currently live in `src/__tests__`.

Future tests should default there unless the project adopts and documents a different pattern. Route/access matrix, auth URL, notifications, profile utility, and MVP cleanup tests should stay aligned with existing test organization.

**Asset Organization:**

Static assets stay under `public`.

App icons and App Router metadata assets may remain under `src/app` where Next.js conventions require them.

### Development Workflow Integration

**Development Server Structure:**

Development runs from the existing Next.js app. Agents should not create a separate dev server, backend process, or package workspace for MVP work.

**Build Process Structure:**

The build process uses the existing Next.js and TypeScript configuration. Agents must read installed Next.js 16 docs before changing route, middleware/proxy, redirect, route-handler, Server Action, or caching behavior.

**Deployment Structure:**

Deployment should package the existing Next.js application and depend on the configured Supabase project and environment variables.

Release-readiness depends on:

- App build.
- Lint/test baseline status.
- Route/access matrix verification.
- Supabase schema/RLS audit or explicit accepted risk.
- Production environment variable correctness.
- X OAuth callback behavior in target environment.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

The architecture is coherent for a brownfield MVP stabilization effort. The major decisions reinforce each other:

- Existing Next.js/Supabase repository remains the foundation.
- Supabase Auth with X OAuth supports the product identity requirement.
- Supabase PostgreSQL/RLS remains the data/security boundary.
- `/chat` as approved-member center aligns PRD, UX, route cleanup, and implementation patterns.
- Existing route/component structure is preserved, avoiding rewrite risk.
- Deferred future features are consistently excluded from MVP decisions.

No contradictory technology decisions were found. The version checks show newer package versions exist, but the architecture correctly avoids making upgrades part of MVP scope without an explicit story.

**Pattern Consistency:**

The implementation patterns support the architectural decisions:

- Supabase helper reuse prevents inconsistent auth/session clients.
- Admission state machine prevents route and access ambiguity.
- Naming rules preserve database/product-language separation.
- Structure rules preserve brownfield boundaries.
- Process rules enforce explicit pending/refused/admin/chat states.
- Anti-patterns directly target known historical drift such as `/forum` defaults and refused-user redirect loops.

**Structure Alignment:**

The project structure supports the architecture:

- `src/app` contains the relevant App Router route boundaries.
- `(auth)` and `(app)` groups map to auth-facing and protected app flows.
- `src/components/<feature>` maps to existing UI domains.
- `src/lib/supabase` provides the required Supabase helper boundary.
- `supabase/migrations` remains the schema/reproducibility boundary.
- `src/__tests__` matches existing test placement.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**

No epics were used as active input, so coverage was validated against PRD FR categories.

All major feature areas have architectural support:

- Public access and positioning.
- X auth and identity.
- Admission and onboarding.
- Approved-member chat.
- Admin admission/access operations.
- Channel administration.
- Authorization/protected access.
- Migration and beta operations.
- Scope parking and future-candidate separation.

**Functional Requirements Coverage:**

All 50 PRD functional requirements are architecturally supported by route, component, data, auth, admin, chat, or governance boundaries.

Not all FRs are implementation-ready at schema level yet, but this is correctly captured as audit-first architecture rather than hidden certainty.

**Non-Functional Requirements Coverage:**

NFR coverage is strong:

- Security: server/database enforcement, RLS audit, no UI-only authorization.
- Reliability: route/access matrix and explicit state routing.
- Performance: MVP-scale reliability over premature optimization.
- Scalability: initial 10-30 member cohort supported, 300+ migration deferred.
- Accessibility: practical beta-critical safeguards.
- Integration: Supabase Auth/database/realtime and X OAuth retained.
- Privacy/compliance: private data boundaries and public/private separation.
- Operational readiness: admin state visibility and reduced manual DB edits emphasized.

### Implementation Readiness Validation ✅

**Decision Completeness:**

Critical decisions are documented with rationale and relevant version context. The architecture is explicit that package upgrades are not automatically part of MVP scope.

**Structure Completeness:**

The structure is specific to the actual repository and maps requirements to concrete directories/files. It avoids generic greenfield placeholders.

**Pattern Completeness:**

The main AI-agent conflict points are addressed:

- Naming.
- Supabase client usage.
- Admission state.
- Route defaults.
- Admin mutations.
- Chat routing.
- Legacy feature containment.
- Data formats.
- Error/loading handling.
- Test placement.
- Verification discipline.

### Gap Analysis Results

**Critical Gaps:**

No architecture-document gap blocks implementation handoff.

The critical implementation risks are intentionally documented as first-priority discovery/hardening work:

- Supabase schema/RLS/migration/generated-type audit.
- Admission model mapping to actual tables/fields.
- Admin mutation authorization verification.
- Route/access matrix validation.
- Chat read/send/channel permission verification.

These are not architecture gaps; they are implementation discovery gates.

**Important Gaps:**

- The exact production deployment platform/settings are not verified in this architecture document.
- The exact launch channel taxonomy is still undecided.
- The exact moderation schema/path is not confirmed.
- The exact sponsor/parrain database relationship requires audit.
- The exact status field/source of truth requires audit.

These should be resolved in implementation stories or technical discovery tasks, not guessed in architecture.

**Nice-to-Have Gaps:**

- Future route-language convergence plan.
- Post-MVP design-system plan.
- Post-MVP observability strategy.
- Post-MVP accessibility audit plan.
- Post-MVP scaling plan for 300+ members.

### Validation Issues Addressed

The validation found no contradiction requiring architecture changes.

The main risk is overconfidence: several areas depend on production schema/RLS audit. The architecture handles this by making audit-first discovery the first implementation priority and forbidding destructive or assumption-based Supabase changes.

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION WITH AUDIT-FIRST GATES

**Confidence Level:** Medium-high.

Confidence is high for architecture direction and consistency rules. Confidence remains medium for implementation detail until Supabase production schema/RLS, route/access behavior, and admin/chat mutation paths are audited.

**Key Strengths:**

- Brownfield-safe and MVP-scoped.
- Clear `/chat`-centered route contract.
- Strong security and RLS emphasis.
- Explicit AI-agent consistency rules.
- Concrete mapping to actual repository structure.
- Clear separation between MVP and future candidates.
- Avoids hidden rewrites, new starters, or new architectural layers.

**Areas for Future Enhancement:**

- Formal deployment/observability strategy.
- Full route-language convergence.
- Comprehensive accessibility review.
- Post-MVP design-system refresh.
- E2E encryption and private DM architecture.
- Multi-tenant platform architecture if the club model succeeds.

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure and boundaries.
- Refer to this document for all architectural questions.
- Stop and ask if production schema/runtime behavior contradicts the architecture.
- Do not expand MVP scope without owner approval.

**First Implementation Priority:**

The first implementation step should be technical discovery, not feature construction:

1. Audit route/access matrix against the admission state machine.
2. Audit Supabase schema/RLS/migrations/generated types for admission, profiles, sponsors, roles, channels, messages, notifications, admin actions, and moderation.
3. Record gaps as implementation blockers, accepted beta risks, or scoped follow-up stories.
