---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# webapp-nextjs - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for webapp-nextjs, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Visitors can understand that Le Marche Libre is a private closed-beta club with manual admission.
FR2: Visitors can access legal and terms pages from the public site.
FR3: Visitors can start the app access flow from the public site.
FR4: Public pages can avoid presenting parked or future-only capabilities as current product promises.
FR5: Candidates can sign in with X to associate their app account with an X identity.
FR6: The system can retain enough X profile context to support manual admission review.
FR7: Existing users can return to the app without repeating unnecessary authentication steps.
FR8: Signed-out users can access only public and authentication-appropriate routes.
FR9: Candidates can provide required admission and profile information after X sign-in.
FR10: Candidates can submit an access request for manual review.
FR11: Pending users can see a clear pending state while waiting for review.
FR12: Refused users can see a clear refused state without being redirected into a confusing login loop.
FR13: Approved users who have not completed required onboarding can complete the required profile/onboarding flow.
FR14: Approved onboarded users can enter the private member app.
FR15: The system can distinguish pending, approved, refused, and approved-not-onboarded user states.
FR16: The system can route users according to their authentication, admission, onboarding, and role state.
FR17: Approved members can access the chat-centered member app.
FR18: Approved members can view admin-defined topic channels.
FR19: Approved members can open a topic channel and read messages.
FR20: Approved members can send messages in allowed topic channels.
FR21: Approved members can return to the app and resume participation in the community.
FR22: The app can support the selected beta cohort using chat as the primary member destination.
FR23: Owner/admin users can view candidates awaiting manual review.
FR24: Owner/admin users can inspect candidate profile and X identity context needed for admission decisions.
FR25: Owner/admin users can approve candidates.
FR26: Owner/admin users can refuse candidates.
FR27: Owner/admin users can view member admission status, role, onboarding/profile completion state, and access state.
FR28: Owner/admin users can manage user roles needed for beta operation.
FR29: Owner/admin users can remove or suspend member access for operational safety.
FR30: Owner/admin users can troubleshoot member access problems through app-visible status and role information where supported.
FR31: The system can associate admission and role changes with an admin actor and timestamp where supported by the current data model.
FR32: Owner/admin users can define the topic channels available to the beta community.
FR33: Owner/admin users can update core channel availability needed for beta operation.
FR34: Non-admin users cannot create, rename, or manage channels unless explicitly allowed by a future requirement.
FR35: The system can keep user-created channel proposal functionality out of the MVP member experience.
FR36: Pending users cannot access member-only routes, channel data, message data, or private community pages.
FR37: Refused users cannot access member-only routes, channel data, message data, or private community pages.
FR38: Logged-out users cannot access member-only routes, channel data, message data, or private community pages.
FR39: Non-member users cannot access member-only routes, channel data, message data, or private community pages.
FR40: Non-admin users cannot perform admission, role-management, user-management, access-management, or channel-management actions.
FR41: The system can enforce member and admin boundaries outside the visible UI, including server/database-protected access paths.
FR42: The system can prevent private chat or member data from being exposed through direct route, query, API, or realtime access by unauthorized users.
FR43: Owner/admin users can identify or track the selected X community cohort used for closed-beta migration.
FR44: The team can determine whether selected invitees completed X authentication, admission approval, and chat access.
FR45: The team can observe whether approved beta members activate by sending messages.
FR46: The team can evaluate whether the app is viable as the replacement for the X group using migration, activation, engagement, and qualitative feedback.
FR47: Normal beta operation can be performed without relying on direct manual database edits for admission, roles, access, or core channel tasks.
FR48: The PRD can retain future product candidates separately from current MVP scope.
FR49: Future-only capabilities can remain excluded from the MVP unless explicitly promoted into current scope.
FR50: MVP planning can distinguish current launch requirements from future candidates such as E2E encryption, private 1:1 messages, Nostr, AI, Lightning, media, polls, and meta-club platformization.

### NonFunctional Requirements

NFR1: Pending, refused, logged-out, and non-member users must be blocked from member-only routes, private chat data, message APIs, and realtime/private data access paths.
NFR2: Non-admin users must be blocked from admission, role-management, user-management, access-management, and channel-management actions.
NFR3: Member/admin authorization must be enforced outside the visible UI through trusted server/database-controlled access paths.
NFR4: Supabase RLS policies, functions, views, triggers, generated types, and migrations affecting admission, profiles, roles, channels, messages, and notifications must be audited or explicitly accepted as launch risk before beta.
NFR5: Sensitive credentials, service-role keys, and private secrets must not be exposed to client-side code.
NFR6: Access removal or suspension must reliably prevent future member-only access for the affected user.
NFR7: Invited beta users must be able to complete X sign-in, admission-state routing, onboarding/profile completion, and chat entry without recurring blocking errors.
NFR8: Approved onboarded users must consistently route to `/chat`; approved not-onboarded users must route to onboarding; pending/refused users must route to explicit status boundaries.
NFR9: The app must avoid redirect loops in auth, onboarding, pending, refused, and approved-user flows.
NFR10: Chat read/send must work reliably enough for the initial 10 to 30 user beta cohort.
NFR11: Normal beta operations must not depend on direct manual database edits for admission, role, access, or core channel tasks.
NFR12: Public access, auth callback, admission status, onboarding, and chat entry pages should load without user-visible blocking delays for the initial beta cohort.
NFR13: Chat message sending and reading should feel responsive enough to sustain daily conversation in the selected beta cohort.
NFR14: Performance optimization beyond beta usability is not an MVP goal unless a performance issue blocks authentication, admission, or chat usage.
NFR15: The MVP must support the initial selected beta cohort of 10 to 30 approved users.
NFR16: The system should not make architectural choices that obviously prevent later migration of the broader 300+ member X group, but full-scale migration is not required for MVP.
NFR17: Future scaling toward broader migration must be preceded by security, schema/RLS, and operational readiness review.
NFR18: Public access, authentication, pending/refused states, onboarding, chat, and admin-critical flows must use readable text and clear actionable controls.
NFR19: Critical admission and access states must not rely only on ambiguous visuals; users must be able to understand whether they are pending, refused, approved, or blocked.
NFR20: MVP accessibility targets are practical closed-beta usability targets, not formal WCAG certification.
NFR21: X authentication must provide sufficient identity continuity for admission review and member recognition.
NFR22: Supabase Auth/session handling must remain aligned with the existing project helpers and environment contract.
NFR23: External integrations beyond X auth and Supabase, including Nostr, Lightning, AI providers, media services, and Invidious, are not MVP dependencies.
NFR24: Admission, profile, role, and private-message data must be treated as private community data.
NFR25: Public pages must not expose private member content, private profiles, chat messages, or admin/admission data.
NFR26: Data collection for MVP should stay limited to information needed for authentication, manual admission, member recognition, beta operations, and access control.
NFR27: GDPR/privacy expectations for pending, refused, approved, and inactive users must be clarified before broad migration beyond the initial beta cohort.
NFR28: Owner/admin users must be able to operate the beta using app-visible status, role, admission, and access information.
NFR29: Build, lint, test, and manual verification outcomes must distinguish baseline failures from new regressions.
NFR30: Beta launch must not proceed if there is a known unresolved bypass for member-only access or admin-only actions.
NFR31: Production-connected Supabase actions must be treated as production-impacting, with inspection before writes and no destructive changes without explicit owner approval.

### Additional Requirements

- The project must use the existing brownfield Next.js/Supabase repository as the implementation foundation; no starter initialization or greenfield rewrite is part of MVP.
- The first implementation story should verify the current foundation rather than initialize a project: route/access matrix, Supabase schema/RLS/migration reproducibility, auth/admission helpers, and chat/admin security boundaries.
- Next.js `16.2.1`, React `19.2.4`, TypeScript strict mode, App Router, Tailwind CSS 4, Vitest, and ESLint remain the active stack unless a later approved story changes them.
- Existing Supabase helpers are mandatory boundaries: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, and `src/lib/supabase/middleware.ts`.
- Environment variables must stay aligned with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`; do not introduce alternate env names without explicit scope approval.
- The connected Supabase database is production-impacting; inspect before writes and never perform destructive SQL without explicit approval and rollback confidence.
- Supabase schema/RLS/migrations/generated types must be audited for admission, profiles, sponsors/parrainage, roles, channels, messages, notifications, admin actions, functions, triggers, views, policies, and moderation before relying on security-sensitive behavior.
- Product concepts must be mapped to actual tables/fields before implementation: authenticated identity, profile, X profile context, admission status, onboarding/profile completion, role/admin status, access removal/suspension, channel, message, notification, moderation/reporting, and audit fields.
- Admission/member access must be implemented as an explicit state machine covering logged out, no profile/incomplete request, pending, refused/rejected, approved not-onboarded, approved onboarded, suspended/removed if supported, and admin/non-admin overlays.
- Approved onboarded users route to `/chat`; approved not-onboarded users route to onboarding/profile completion; pending/refused users route to explicit status boundaries; non-admin admin access falls back safely.
- `/chat` and `/chat/[slug]` remain canonical chat route surfaces for now; remaining `/chat?channel=` links are tolerated legacy until explicitly resolved.
- Existing legacy routes such as `/forum`, `/membres`, and `/membres/[id]` must not be deleted as part of MVP unless a story explicitly authorizes removal.
- Member/admin authorization must be layered through middleware/session refresh, server-side route guards, authorized Server Actions/Route Handlers/RPCs, Supabase RLS, and UI hiding only as convenience.
- Sensitive mutations should flow through server-authorized paths or audited RPCs; arbitrary client writes must not be trusted for admission, roles, access, channel management, or protected message operations.
- Authenticated/private/member/admin data should not be cached unless explicitly proven safe; public landing/legal pages may use normal public caching if they expose no private data.
- No GraphQL, tRPC, separate REST backend, dedicated WebSocket service, Prisma, Drizzle, Redux, Zustand, or new design system should be introduced for MVP without explicit approval.
- Use Server Components and server-side authorization checks for sensitive data access; use client components only for browser interaction, realtime subscriptions, or chat UI interactivity.
- Implementation must preserve current project structure: routes under `src/app`, protected routes under `(app)`, auth routes under `(auth)`, components under `src/components`, tests under `src/__tests__`, Supabase migrations under `supabase/migrations`.
- New code must prefer existing helpers and small scoped changes over broad abstractions or top-level service/repository/domain folders.
- Route, redirect, middleware/proxy, Server Action, route handler, and caching changes must check installed Next.js 16 docs first.
- Errors must be explicit and state-aware: refused users see product language, chat send failures are recoverable where feasible, admin mutation failures are visible, and authorization failures fail closed without leaking private data.
- Loading states must not temporarily expose member-only data to unauthorized users.
- Admin action outcomes should distinguish approved, refused, unchanged, failed, and needs technical follow-up.
- Build, lint, tests, manual route/access checks, and Supabase checks must record exact commands and distinguish baseline failures from new regressions.
- Release readiness depends on app build, lint/test baseline, route/access matrix verification, Supabase schema/RLS audit or accepted risk, production environment correctness, and X OAuth callback behavior.
- Current implementation gaps to resolve in stories include production deployment settings, launch channel taxonomy, moderation schema/path, sponsor/parrain relationship, and the exact admission status source of truth.

### UX Design Requirements

UX-DR1: Preserve the existing project UI foundation for MVP, including current Tailwind styles, UI primitives, layouts, and component patterns; do not introduce a new design system or broad visual redesign.
UX-DR2: Public pages must clearly communicate that Le Marche Libre is a private closed-beta club with manual review and must not imply open self-service access or parked future features.
UX-DR3: Approved members should land naturally in `/chat`, and every approved-member path should make chat feel like the app home rather than a dashboard, forum, or directory.
UX-DR4: The chat experience must make new activity, active/relevant channels, unread/reply/mention signals, and conversation context visible enough for members to know what changed without X-level chaos.
UX-DR5: Chat channel list UI must support active channel, unread/new activity, empty channel, loading, unavailable/error states, and semantic link/button behavior with clear current state.
UX-DR6: Message items must show avatar, display name, X handle when available, timestamp, body, reply/context marker, and relevant send/edit/error state.
UX-DR7: Message item states must cover normal, own message, sending, sent, failed, edited, deleted/tombstone, reply target, and mentioned/highlighted where supported by current implementation.
UX-DR8: Message composer must remain close to the conversation and support empty, focused, typing, sending, sent, failed/retry, and disabled/no-permission states.
UX-DR9: Chat send feedback must make sending, sent, failed, and retry/recover paths clear enough to avoid user uncertainty.
UX-DR10: Search must be preserved as a product need for finding answers, people, channels, and previous messages with contextual results, but detailed search pattern work may be deferred beyond the immediate MVP pass.
UX-DR11: Search result items, when implemented, must expose matched text, channel/person context, timestamps where relevant, and enough surrounding context to prevent disorientation.
UX-DR12: Replies and mentions should preserve conversation context so users can understand history without losing their place.
UX-DR13: Admission status screens must clearly explain pending, refused/rejected, approved-but-onboarding-required, logged-out/auth error, and blocked/no-access states.
UX-DR14: Pending and refused states must feel intentional, human, and explicit rather than like broken routing; refused copy should avoid database terminology such as `rejected`.
UX-DR15: Admission, onboarding, and blocked states must communicate state through text, not only color or iconography, and primary next actions must be keyboard reachable.
UX-DR16: Approved users must not be trapped in onboarding loops, and approved-not-onboarded users must understand what profile/onboarding steps remain.
UX-DR17: Admission and onboarding forms should collect only information needed for X identity checking, manual admission, member recognition, sponsor/parrain tracking, beta operations, and access control.
UX-DR18: Form validation should be inline where practical and written in user-facing language rather than technical schema language.
UX-DR19: Candidate review row/detail UI must show X identity, avatar, handle, profile information, sponsor/context, current admission state, and relevant timestamps where available.
UX-DR20: Admin approval, refusal, access removal/suspension, and message deletion/tombstoning actions must be deliberate, protected, and use confirmations where the action has access, role, admission, or message-visibility consequences.
UX-DR21: Admin feedback must clearly show whether an action approved, refused, failed, did nothing, or requires technical follow-up.
UX-DR22: User status inspector UI must expose admission state, onboarding/profile completion, role, access/suspension state where supported, and a beta risk note when the app cannot resolve an issue.
UX-DR23: Non-admin users who attempt admin access should be routed safely, preferably to `/chat` if they are approved members.
UX-DR24: The app must work on mobile for public access, X sign-in entry, auth callback/admission routing, pending/refused states, onboarding, chat reading, message composition, and send/retry.
UX-DR25: Desktop layouts should support denser channel/sidebar scanning, admin review, troubleshooting, and longer reading/writing sessions without making desktop the only viable experience.
UX-DR26: Use existing project breakpoints and fix only beta-critical responsive blockers; conceptual checks should include 375px mobile, 768px tablet, 1024px desktop, and 1440px desktop.
UX-DR27: Critical text must remain readable, primary actions must be understandable, focus states should remain visible, and touch targets in chat/admission flows should remain usable on mobile.
UX-DR28: Loading and empty states must be calm, human, and explicit for auth, admission-state checks, chat loading, admin review loading, no messages, no pending candidates, missing onboarding data, unavailable admin data, and chat temporarily unavailable.
UX-DR29: Chat should bias toward social readability and familiar X/Discord/WhatsApp-like density where feasible, avoiding unnecessary empty space or dashboard-like layouts in beta-critical chat interactions.
UX-DR30: Member identity cues should preserve X-native familiarity through avatar, handle, display name, and lightweight profile context without turning MVP member discovery into a full annuaire.
UX-DR31: Broader dark mode, PWA installability, formal WCAG audit, full responsive redesign, and X-like post-MVP visual refresh are deferred and must not block MVP stabilization.

### FR Coverage Map

FR1: Epic 2 - Closed-beta/private-club positioning
FR2: Epic 2 - Public legal and terms access
FR3: Epic 2 - Public access flow start
FR4: Epic 2 - Avoid parked/future feature promises in public positioning
FR5: Epic 2 - X sign-in identity association
FR6: Epic 2 - X profile context for admission
FR7: Epic 2 - Returning session behavior
FR8: Epic 2 - Signed-out route boundaries
FR9: Epic 2 - Admission/profile information capture
FR10: Epic 2 - Manual review request submission
FR11: Epic 2 - Pending state UX
FR12: Epic 2 - Refused state UX without login loop
FR13: Epic 2 - Approved-not-onboarded completion flow
FR14: Epic 2 - Approved onboarded app entry
FR15: Epic 2 - Admission/onboarding state distinction
FR16: Epic 2 - State-based routing
FR17: Epic 3 - Approved-member chat access
FR18: Epic 3 - Admin-defined topic channels visible to members
FR19: Epic 3 - Channel open/read messages
FR20: Epic 3 - Send messages in allowed channels
FR21: Epic 3 - Return participation loop
FR22: Epic 3 - Chat as beta primary destination
FR23: Epic 4 - Admin pending-candidate list
FR24: Epic 4 - Candidate profile/X context review
FR25: Epic 4 - Candidate approval
FR26: Epic 4 - Candidate refusal
FR27: Epic 4 - Member status/role/onboarding/access visibility
FR28: Epic 4 - Role management
FR29: Epic 4 - Access removal/suspension
FR30: Epic 4 - Admin troubleshooting
FR31: Epic 4 - Admin actor/timestamp attribution where supported
FR32: Epic 4 - Admin-defined beta channels
FR33: Epic 4 - Core channel availability updates
FR34: Epic 4 - Non-admin channel-management restriction
FR35: Epic 4 - User-created channel proposals excluded from MVP
FR36: Epic 2 - Pending users blocked from private access
FR37: Epic 2 - Refused users blocked from private access
FR38: Epic 2 - Logged-out users blocked from private access
FR39: Epic 2 - Non-member users blocked from private access
FR40: Epic 1 - Non-admin admin-action blocking
FR41: Epic 1 - Server/database member/admin boundary enforcement
FR42: Epic 1 - Prevent private data exposure through direct access paths
FR43: Epic 5 - Selected X cohort tracking
FR44: Epic 5 - Migration completion visibility
FR45: Epic 5 - Activation/message observation
FR46: Epic 5 - Viability evaluation from beta signals
FR47: Epic 4 - Normal beta operations without direct DB edits
FR48: Epic 6 - Future candidates retained separately
FR49: Epic 6 - Future-only capabilities excluded unless promoted
FR50: Epic 6 - MVP vs future candidate distinction

## Epic List

### Epic 1: Trust, Authorization, and Launch Safety
Members, admins, and the owner can trust that private routes, chat data, member data, and admin-only actions are protected beyond visible UI hiding before the beta relies on them.

**FRs covered:** FR40, FR41, FR42

**Implementation notes:** This epic should start first and remain a cross-cutting gate for later epics. Stories should audit and harden route/access behavior, Supabase schema/RLS/migrations/types, server/database authorization, direct query/API/realtime paths, and admin mutation boundaries. It should not become a late polish phase.

### Epic 2: Private Club Entry, Identity, and Admission
Visitors and candidates can understand the private closed-beta promise, sign in with X, submit required admission/profile information, and reach the correct pending, refused, onboarding, or approved state without confusing loops.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR36, FR37, FR38, FR39

**Implementation notes:** This epic owns public positioning, legal/access entry, X auth, admission data capture, state resolution, onboarding routing, pending/refused UX, and route blocking for pending/refused/logged-out/non-member users. It should carry UX requirements for explicit state text, mobile-safe access flows, and French-first product language.

### Epic 3: Approved Member Chat Home
Approved members can use `/chat` as the primary app center, view admin-defined channels, read messages, send messages, and return to participate in the beta community.

**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22

**Implementation notes:** This epic should preserve `/chat` as the MVP home and focus on reliable channel visibility, message read/send, composer feedback, mobile usability, and return participation before richer social features. It depends on the authorization gates from Epic 1 and approved-member routing from Epic 2.

### Epic 4: Admin Admission, Access, and Channel Operations
Owner/admin users can review candidates, manage admission and member access, troubleshoot user state, manage beta roles, and control core topic channels without relying on routine direct database edits.

**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR47

**Implementation notes:** This epic combines the beta operations the owner needs in the app: candidate review, approve/refuse, role/access management, troubleshooting, auditability where supported, and admin-defined channel availability. Non-admin restrictions and protected mutations must inherit Epic 1 security gates.

### Epic 5: Beta Migration Tracking and Product Learning
The owner and team can identify the selected X cohort, observe migration completion, activation, and engagement, and decide whether the app can replace the X group based on beta evidence.

**FRs covered:** FR43, FR44, FR45, FR46

**Implementation notes:** This epic should stay lightweight and owner-value-focused. It may use existing admission, chat, and admin data rather than introducing a full analytics platform unless a later story explicitly requires it.

### Epic 6: MVP Scope Containment and Future Candidate Discipline
The team can keep the MVP focused on closed-beta launch value while preserving future product candidates separately and preventing parked features from leaking into current product promises or navigation priorities.

**FRs covered:** FR48, FR49, FR50

**Implementation notes:** This epic captures product-visible scope containment outcomes: public copy avoids future-feature promises and legacy features/routes are contained without destructive removal unless explicitly approved. Process governance, verification records, dependency blocking, and future-candidate inventory discipline are handled by the global implementation guardrails rather than standalone implementation stories.

## Implementation Guardrails and Definition of Done

These guardrails apply to every implementation story unless a story explicitly says otherwise.

- Verification is part of each functional story's Definition of Done. Build, lint, targeted tests, manual checks, Supabase inspection, or release-readiness checks must be recorded with exact commands/outcomes where relevant, and failures must be classified as baseline failures or new regressions.
- Verification-only work should not be split into separate implementation stories unless it produces distinct cross-cutting evidence that cannot reasonably belong to a functional story.
- If existing schema, RLS, generated types, policies, functions, triggers, views, or migrations do not support a required behavior, the story must document the blocker/risk, affected requirement, and proposed minimal follow-up before adding migrations or accepting beta risk.
- Any Supabase/database action is production-impacting: inspect before writes, avoid writes by default, and never perform destructive SQL without explicit owner approval and rollback confidence.
- Scope containment is mandatory: do not add dependencies, change package locks, introduce a design system/global state/backend layer, redesign broadly, promote future integrations, delete legacy routes/data, or expand MVP scope unless explicitly approved by the owner and reflected in planning artifacts.
- Future-only capabilities remain excluded from MVP unless explicitly promoted by the owner. This includes full 300+ member migration, E2E encryption, private DMs, Nostr, AI, Lightning, media libraries, polls, advanced moderation, self-serve community creation, and platformization.
- `/chat` remains the approved-member app center. Parked or legacy surfaces may be hidden/deprioritized from navigation, but direct route access, tables, migrations, and historical data must not be removed unless explicitly authorized by a story.

## Epic 1: Trust, Authorization, and Launch Safety

Members, admins, and the owner can trust that private routes, chat data, member data, and admin-only actions are protected beyond visible UI hiding before the beta relies on them.

### Story 1.1: Audit Route, Data, Admin, API, and Realtime Authorization Boundaries

As the owner,
I want a verified map of current private-route, chat-data, API, realtime, and admin-action authorization behavior,
So that beta launch work starts from known security facts instead of assumptions.

**Acceptance Criteria:**

**Given** the existing brownfield app and production-connected Supabase project
**When** the developer audits auth/admission route guards, protected layouts, admin routes/actions, chat/channel/message access paths, API route handlers, Server Actions, realtime paths, migrations, generated types, RLS policies, functions, views, and triggers
**Then** the audit produces a concrete MVP access/security matrix covering user states, routes, data access, admin actions, API/Server Action paths, realtime paths, and Supabase schema/RLS/migration/type assumptions
**And** each matrix entry states expected behavior, observed behavior where inspected, evidence source, and status: verified, uncertain, confirmed bypass, unsupported by schema, or not applicable
**And** the audit distinguishes app-code findings from Supabase schema/RLS/generated-type/migration findings
**And** no destructive Supabase writes or schema changes are performed
**And** any production-impacting inspection command is documented with outcome and risk
**And** findings are categorized as launch blocker, accepted beta risk candidate, or follow-up story input
**And** the output is actionable enough for Story 1.2 to define expectations and Story 1.3 to harden confirmed bypasses without reopening open-ended discovery.

### Story 1.2: Define and Verify the MVP Access Matrix

As the owner,
I want each user state to have an explicit route and data-access expectation,
So that pending, refused, logged-out, non-member, approved, and admin users cannot fall into ambiguous or unsafe behavior.

**Acceptance Criteria:**

**Given** the canonical MVP user states logged-out, incomplete/no profile, pending, refused/rejected, approved-not-onboarded, approved-onboarded, suspended/removed if supported, admin, and non-admin attempting admin access
**When** the developer defines the route, data, action, direct query, API, and realtime access matrix for public routes, auth routes, `/en-attente`, onboarding, `/chat`, admin routes, channel data, message data, and admin mutations
**Then** each state has an expected allow, deny, redirect, or explicit-status outcome
**And** refused and pending users have explicit status boundaries instead of login loops
**And** approved onboarded users are expected to reach `/chat`
**And** non-admin admin access falls back safely
**And** direct route, query, API, and realtime expectations are included where those paths exist
**And** the matrix identifies which expectations are already verified, unverified, or blocked by schema/runtime uncertainty.

### Story 1.3: Harden Server and Database Authorization for Confirmed Bypasses

As the owner,
I want confirmed member/admin bypasses closed through trusted server and database checks,
So that unauthorized users cannot reach private content or perform admin-only actions even if UI links are hidden.

**Acceptance Criteria:**

**Given** Story 1.1 or Story 1.2 identifies a confirmed route, action, data, API, realtime, or RLS authorization bypass
**When** the developer applies the smallest brownfield-safe guard using existing Supabase helpers, current Next.js 16 guidance, and database/RLS changes only when explicitly scoped and approved
**Then** the bypass is closed for the affected user states
**And** UI hiding is not treated as the security boundary
**And** refused users are not redirected into a confusing login loop
**And** non-admin users cannot execute the affected admin mutation path
**And** database/RLS enforcement is updated or explicitly recorded as still blocking launch when app-code hardening alone cannot close the bypass
**And** tests or manual verification confirm the fix without introducing unrelated route changes.

### Story 1.4: Document Launch-Blocking Security Risks and Non-Blocking Accepted Beta Risks

As the owner,
I want remaining security uncertainty separated into launch blockers and explicitly non-blocking accepted beta risks,
So that beta launch decisions are deliberate rather than hidden in implementation notes.

**Acceptance Criteria:**

**Given** authorization audits, access matrix checks, tests, and hardening work have been completed for the current Epic 1 scope
**When** the developer summarizes remaining private-route, chat-data, admin-action, RLS, schema, realtime/API, and generated-type risks
**Then** each risk is marked as launch blocker, non-blocking accepted beta risk candidate, or post-MVP follow-up
**And** known unresolved member-only access bypasses or admin-only action bypasses are classified as launch-blocking and are not accepted as beta risks
**And** accepted risk candidates include rationale and expected impact
**And** verification commands and outcomes are recorded with baseline/regression distinction.

## Epic 2: Private Club Entry, Identity, and Admission

Visitors and candidates can understand the private closed-beta promise, sign in with X, submit required admission/profile information, and reach the correct pending, refused, onboarding, or approved state without confusing loops.

### Story 2.1: Align Public Access Positioning With Closed-Beta Admission

As a visitor,
I want the public access path to clearly explain that Le Marche Libre is a private closed-beta club with manual admission,
So that I understand what I am applying for before starting sign-in.

**Acceptance Criteria:**

**Given** a visitor reaches the public landing, legal, or access entry surfaces
**When** they read the page copy or choose the primary access action
**Then** the product clearly communicates private club, closed-beta, and manual-review expectations
**And** legal/terms/privacy pages remain accessible from public surfaces
**And** parked or future-only features are not presented as current MVP promises
**And** the primary access action starts the app access flow without implying automatic membership
**And** the flow remains usable on mobile widths used by beta candidates.

### Story 2.2: Preserve X Sign-In and Returning Session Behavior

As a candidate,
I want to sign in with X and return to the app without unnecessary repeated authentication,
So that my app account remains connected to the X identity admins use for admission review.

**Acceptance Criteria:**

**Given** a signed-out candidate starts the access flow
**When** they choose X sign-in
**Then** the app uses the existing Supabase Auth/X OAuth path and configured auth URL behavior
**And** enough X identity context is retained or surfaced for admission review where supported by the current data model
**And** returning authenticated users do not repeat unnecessary sign-in steps
**And** signed-out users remain limited to public and auth-appropriate routes
**And** no ad hoc Supabase client or alternate environment variable contract is introduced.

### Story 2.3: Capture Required Admission and Profile Information

As a candidate,
I want to provide only the information needed for admission and member recognition,
So that I can submit an access request without unnecessary friction or unclear data collection.

**Acceptance Criteria:**

**Given** a candidate has authenticated with X and lacks a complete admission/profile request
**When** they reach the admission or onboarding information form
**Then** the form collects only information needed for X identity checking, manual admission, member recognition, sponsor/parrain tracking where supported, beta operations, and access control
**And** validation errors are inline where practical and written in user-facing language
**And** the candidate can submit an access request for manual review
**And** submitted state maps to the existing admission/status source of truth or records schema uncertainty as an implementation blocker
**And** if existing schema, RLS, generated types, policies, functions, triggers, views, or migrations do not support this behavior, the story documents the blocker/risk, affected PRD requirement, user impact, and proposed minimal follow-up before adding migrations or accepting beta risk
**And** no destructive database changes are made without explicit approval.

### Story 2.4: Show Explicit Pending and Refused Admission States

As a candidate,
I want to clearly understand whether my request is pending or refused,
So that blocked access feels intentional rather than broken.

**Acceptance Criteria:**

**Given** a user has pending admission status
**When** they attempt to access private app routes or return after sign-in
**Then** they see an explicit pending state explaining manual review and no member access yet
**And** they cannot access member-only routes, channel data, message data, or private community pages.

**Given** a user has refused/rejected admission status
**When** they attempt to access private app routes or return after sign-in
**Then** they see an explicit refused state using product language rather than database terminology
**And** they are not silently redirected to login or trapped in a redirect loop
**And** they cannot access member-only routes, channel data, message data, or private community pages.

### Story 2.5: Route Approved Users Through Onboarding or Into Chat

As an approved user,
I want the app to send me to onboarding if my profile is incomplete or `/chat` if I am ready,
So that I can complete required setup and reach the private community without confusion.

**Acceptance Criteria:**

**Given** an approved user has not completed required onboarding/profile steps
**When** they enter the app
**Then** they are routed to onboarding/profile completion
**And** the UI explains what remains to be completed
**And** they are not trapped in an onboarding loop once required steps are complete.

**Given** an approved onboarded user enters the app
**When** their state is resolved
**Then** they are routed to `/chat` as the primary member destination
**And** the routing decision uses trusted server/session/admission state rather than client-only assumptions.

### Story 2.6: Enforce Admission-State Route Boundaries

As the owner,
I want each admission state to be routed and blocked consistently,
So that pending, refused, logged-out, and non-member users cannot reach private app content.

**Acceptance Criteria:**

**Given** logged-out, pending, refused, non-member, approved-not-onboarded, and approved-onboarded states exist in the app
**When** each state attempts to access public routes, auth routes, `/en-attente`, onboarding, `/chat`, and protected app routes
**Then** each state receives the expected allow, deny, redirect, or explicit-status outcome from the MVP access matrix
**And** pending, refused, logged-out, and non-member users cannot access member-only routes, channel data, message data, or private community pages
**And** approved not-onboarded users reach onboarding rather than `/chat`
**And** approved onboarded users reach `/chat`
**And** verification distinguishes baseline failures from new regressions.

## Epic 3: Approved Member Chat Home

Approved members can use `/chat` as the primary app center, view admin-defined channels, read messages, send messages, and return to participate in the beta community.

### Story 3.1: Make `/chat` the Approved Member Home

As an approved onboarded member,
I want `/chat` to be the natural destination after entering the app,
So that I immediately reach the private community conversation instead of legacy surfaces.

**Acceptance Criteria:**

**Given** an approved onboarded member enters the protected app
**When** routing resolves their state
**Then** `/chat` is the primary member destination
**And** navigation, sidebar/logo defaults, and app entry points do not route approved members to `/forum` or other parked surfaces
**And** legacy routes remain directly accessible unless an explicit story authorizes removal
**And** unauthorized users still cannot reach member-only chat content.

### Story 3.2: Show Admin-Defined Topic Channels

As an approved member,
I want to see available topic channels clearly,
So that I can choose the right conversation instead of one chaotic group thread.

**Acceptance Criteria:**

**Given** an approved member opens `/chat`
**When** channel data loads
**Then** the member sees admin-defined topic channels available to the beta community
**And** active/current channel state is clear
**And** loading, empty, unavailable, and error states are explicit and do not expose private data to unauthorized users
**And** channel entries are semantic links or buttons with usable focus/current-state behavior
**And** the layout remains usable on mobile and desktop.

### Story 3.3: Read Messages in an Allowed Channel

As an approved member,
I want to open a channel and read messages with clear identity and context,
So that I can follow the private community conversation.

**Acceptance Criteria:**

**Given** an approved member has access to a topic channel
**When** they open that channel
**Then** messages for that channel are displayed only to authorized approved members
**And** each message shows available identity cues such as avatar, display name, X handle when available, timestamp, and message body
**And** message list loading, empty, deleted/tombstone, and unavailable states are explicit where supported
**And** the message layout supports readable scanning on mobile and desktop
**And** unauthorized direct route, query, API, or realtime access remains blocked by Epic 1 security expectations.

### Story 3.4: Send Messages With Clear Composer Feedback

As an approved member,
I want to write and send a message in an allowed channel with clear feedback,
So that I know whether my contribution was sent, failed, or needs retry.

**Acceptance Criteria:**

**Given** an approved member can post in a channel
**When** they type and send a message
**Then** the composer uses the existing chat implementation patterns and sends the message through authorized paths
**And** the UI indicates sending, sent, failed, and retry/recover states where supported
**And** the message appears in the correct channel context after successful send
**And** disabled/no-permission states prevent sending when access is not allowed
**And** failed sends do not silently drop user input where recovery is feasible
**And** unauthorized users cannot send through client-side bypasses.

### Story 3.5: Preserve Conversation Context for Return Participation

As an approved member,
I want to return to the app and quickly understand where to continue,
So that the private group feels alive and easier to follow than the X group.

**Acceptance Criteria:**

**Given** an approved member returns to `/chat`
**When** channels and messages are available
**Then** the interface makes current channel, recent activity, and conversation context clear enough to resume participation
**And** unread/new activity, replies, mentions, or equivalent context cues are shown where supported by the current implementation
**And** search/reply/context needs that are not implemented are documented as follow-up or beta risk rather than implied as complete
**And** parked forum, annuaire, jobs/offers, proposal, or broad discovery surfaces are not promoted as the primary member loop
**And** the experience remains usable for the initial 10 to 30 approved beta users.

## Epic 4: Admin Admission, Access, and Channel Operations

Owner/admin users can review candidates, manage admission and member access, troubleshoot user state, manage beta roles, and control core topic channels without relying on routine direct database edits.

### Story 4.1: Show Pending Candidate Review Queue

As an owner/admin,
I want to view candidates awaiting manual review with enough identity context,
So that I can decide who belongs in the private beta community.

**Acceptance Criteria:**

**Given** an authorized owner/admin opens the admin admission area
**When** pending candidates exist
**Then** the admin can see a pending-candidate list with available X identity, avatar, handle, profile information, sponsor/context where supported, current admission state, and relevant timestamps
**And** empty/loading/error states are clear and operational
**And** non-admin users cannot view the candidate queue
**And** private candidate data is not exposed through client-only filtering or direct route access.

### Story 4.2: Approve Candidate Access

As an owner/admin,
I want to approve a candidate deliberately,
So that a trusted person can continue onboarding or enter the private chat if ready.

**Acceptance Criteria:**

**Given** an authorized owner/admin is reviewing a pending candidate
**When** the admin confirms approval
**Then** the candidate admission state is updated to approved through an authorized server/database path
**And** the action result is visible as approved, failed, unchanged, or needs technical follow-up
**And** the admission change is associated with an admin actor and timestamp where supported by the current data model
**And** non-admin users cannot approve candidates through UI, direct route, action, API, or database bypass
**And** no direct manual database edit is required for normal approval.

### Story 4.3: Refuse Candidate Access

As an owner/admin,
I want to refuse a candidate deliberately,
So that the private club boundary is preserved and the candidate sees a clear refused state.

**Acceptance Criteria:**

**Given** an authorized owner/admin is reviewing a pending candidate
**When** the admin confirms refusal
**Then** the candidate admission state is updated to refused/rejected through an authorized server/database path
**And** the user-facing state maps to refused product language rather than raw database terminology
**And** the action result is visible as refused, failed, unchanged, or needs technical follow-up
**And** the admission change is associated with an admin actor and timestamp where supported by the current data model
**And** non-admin users cannot refuse candidates through UI, direct route, action, API, or database bypass.

### Story 4.4: Inspect Member Status and Troubleshoot Access

As an owner/admin,
I want to inspect a user's admission, onboarding, role, and access state,
So that I can resolve beta access problems without guessing or editing Supabase manually.

**Acceptance Criteria:**

**Given** an authorized owner/admin opens a user/member detail or troubleshooting view
**When** they inspect a user
**Then** the admin can see current admission state, onboarding/profile completion state, role, access/suspension state where supported, X/profile context where supported, and relevant timestamps
**And** the view distinguishes product state issues from schema/runtime uncertainty
**And** if existing schema, RLS, generated types, policies, functions, triggers, views, or migrations do not support this behavior, the story documents the blocker/risk, affected PRD requirement, user impact, and proposed minimal follow-up before adding migrations or accepting beta risk
**And** if the app cannot resolve the issue, the limitation is recorded as a beta operational risk
**And** non-admin users cannot access the troubleshooting view or private user state.

### Story 4.5: Manage Beta Roles and Access Removal

As an owner/admin,
I want to update beta roles and remove or suspend member access when needed,
So that the owner can operate the closed beta safely without direct database edits.

**Acceptance Criteria:**

**Given** an authorized owner/admin is managing a user
**When** they change a supported role or remove/suspend access with deliberate confirmation
**Then** the change is applied through an authorized server/database path
**And** access removal/suspension reliably prevents future member-only access for the affected user where supported by the current schema
**And** the action result is visible as changed, failed, unchanged, or needs technical follow-up
**And** role/access changes are associated with an admin actor and timestamp where supported
**And** if existing schema, RLS, generated types, policies, functions, triggers, views, or migrations do not support this behavior, the story documents the blocker/risk, affected PRD requirement, user impact, and proposed minimal follow-up before adding migrations or accepting beta risk
**And** unsupported state transitions are blocked or recorded as beta risks rather than silently improvised
**And** non-admin users cannot perform role or access changes.

### Story 4.6: Manage Core Beta Channel Availability

As an owner/admin,
I want to define and update the topic channels available to beta members,
So that the community has useful topic separation without relying on manual database edits.

**Acceptance Criteria:**

**Given** an authorized owner/admin opens channel management
**When** they create, update, enable, disable, or otherwise manage supported core beta channels
**Then** the channel availability changes are applied through authorized paths
**And** approved members see the updated available channels in `/chat` where appropriate
**And** non-admin users cannot create, rename, or manage channels unless a future requirement explicitly allows it
**And** user-created channel proposal functionality remains outside the MVP member experience
**And** if existing schema, RLS, generated types, policies, functions, triggers, views, or migrations do not support this behavior, the story documents the blocker/risk, affected PRD requirement, user impact, and proposed minimal follow-up before adding migrations or accepting beta risk
**And** unsupported channel operations are blocked or recorded as beta risks rather than silently improvised.

## Epic 5: Beta Migration Tracking and Product Learning

The owner and team can identify the selected X cohort, observe migration completion, activation, and engagement, and decide whether the app can replace the X group based on beta evidence.

### Story 5.1: Identify the Selected X Beta Cohort

As the owner,
I want to identify which X community members are part of the selected beta cohort,
So that migration progress is measured against the intended invite group.

**Acceptance Criteria:**

**Given** the owner has selected a 10 to 30 person beta cohort from the X community
**When** the cohort is represented in the app or admin-operational records
**Then** the owner/admin can distinguish selected beta invitees from other authenticated or pending users
**And** the representation uses existing profile/admission/admin data where feasible
**And** if existing schema, RLS, generated types, policies, functions, triggers, views, or migrations do not support this behavior, the story documents the blocker/risk, affected PRD requirement, user impact, and proposed minimal follow-up before adding migrations or accepting beta risk
**And** no broad analytics platform or public growth-loop feature is introduced.

### Story 5.2: Track Migration Completion to Approved Chat Access

As the owner,
I want to know whether selected invitees completed X authentication, admission approval, and reached chat,
So that I can measure whether migration from the X group is working.

**Acceptance Criteria:**

**Given** selected beta invitees exist in the app or admin-operational records
**When** the owner/admin reviews migration progress
**Then** the owner/admin can determine which selected invitees have authenticated with X, submitted admission/profile information where required, been approved, completed onboarding where required, and reached `/chat` where observable
**And** each step uses existing app state or explicitly documented manual verification when not observable
**And** the output supports the 7-day migration conversion learning goal
**And** tracking does not expose private member/admission data to unauthorized users.

### Story 5.3: Observe Approved Member Activation

As the owner,
I want to see whether approved beta members send at least one message,
So that I can measure early activation and whether members are participating.

**Acceptance Criteria:**

**Given** approved beta members are using chat
**When** the owner/admin reviews activation signals
**Then** the owner/admin can determine whether each approved beta member has sent at least one message where supported by message data
**And** activation counts can support the 7-day activation learning goal
**And** private message contents are not exposed unnecessarily when only activation status is needed
**And** if existing schema, RLS, generated types, policies, functions, triggers, views, or migrations do not support this behavior, the story documents the blocker/risk, affected PRD requirement, user impact, and proposed minimal follow-up before adding migrations or accepting beta risk
**And** any gap in message attribution, privacy boundary, or data availability is documented as beta risk or follow-up.

### Story 5.4: Summarize Engagement and Viability Signals

As the owner,
I want to summarize migration, activation, message activity, and qualitative observations,
So that I can decide whether the app is viable as the X group replacement.

**Acceptance Criteria:**

**Given** beta migration and chat activity data are available or partially available
**When** the owner reviews beta status
**Then** the summary can show migration completion, activation, basic message activity such as daily message count where available, and qualitative feedback notes or manual observations where needed
**And** the summary supports evaluation against PRD success criteria without promising full analytics accuracy
**And** unavailable metrics are clearly marked as unavailable or manually tracked rather than silently omitted
**And** broader 300+ member migration remains explicitly out of MVP scope.

## Epic 6: MVP Scope Containment and Future Candidate Discipline

The team can keep the MVP focused on closed-beta launch value while preserving future product candidates separately and preventing parked features from leaking into current product promises or navigation priorities.

### Story 6.1: Keep Public Product Promises Within MVP Scope

As a visitor or candidate,
I want public product copy to describe what Le Marche Libre actually offers in the closed beta,
So that I am not misled by future-only or parked feature promises.

**Acceptance Criteria:**

**Given** public landing, access, legal, and auth-facing pages are visible to non-members
**When** page copy, CTAs, navigation labels, or feature claims are reviewed
**Then** they present private-club, X-native identity, manual admission, and chat-centered beta value without implying open access or unbuilt future capabilities
**And** parked capabilities such as marketplace/jobs flows, broad annuaire, AI, Nostr, Lightning, DMs, E2E encryption, polls, or platformization are not presented as current MVP functionality
**And** legal/terms/privacy access remains coherent with private closed-beta positioning
**And** copy changes preserve French-first user-facing language where applicable.

### Story 6.2: Contain Parked Legacy Features in Navigation

As an approved member,
I want the MVP navigation to guide me toward the chat-centered beta experience,
So that legacy or parked features do not distract from the core community loop.

**Acceptance Criteria:**

**Given** approved members use the protected app navigation, sidebar, logo links, and default destinations
**When** navigation surfaces are reviewed or updated
**Then** `/chat` remains the primary app center and default member destination
**And** parked surfaces such as forum, broad member discovery/annuaire, jobs/offers, channel proposals, broad search/discovery, and non-essential admin UX are hidden or deprioritized where needed
**And** direct access to legacy routes is preserved unless a story explicitly authorizes route removal or redirection
**And** scope-containment changes do not delete route files, tables, migrations, or historical data.
