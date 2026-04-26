<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template principle 1 -> I. Stabilize Core Flows Before Expansion
- Template principle 2 -> II. Reproducible Supabase and Authorization Integrity
- Template principle 3 -> III. Next.js 16 and React 19 by Current Docs
- Template principle 4 -> IV. Spec-Driven Brownfield Changes
- Template principle 5 -> V. Quality Gates Are Release Criteria
Added sections:
- Product and Technical Boundaries
- Development Workflow
Removed sections:
- None
Templates requiring updates:
- updated: .specify/templates/plan-template.md
- updated: .specify/templates/spec-template.md
- updated: .specify/templates/tasks-template.md
- reviewed: .specify/templates/checklist-template.md
Follow-up TODOs:
- None
-->

# MarcheLibre Webapp Constitution

## Core Principles

### I. Stabilize Core Flows Before Expansion

Work MUST prioritize the beta-critical member journey before adding new product
surface: authentication, admission/sponsorship, onboarding, chat, profile,
notifications, settings, and admin approval. Forum, standalone member directory,
dashboard, channel proposals, and other legacy surfaces MUST be frozen unless a
spec explicitly classifies the work as stabilization, archival, or dependency
cleanup. New features MUST prove they do not increase drift from the current MVP
target of chat-centered member collaboration.

Rationale: the repository already contains a broad prototype. The highest risk
is not missing scope, but unstable core flows and product drift.

### II. Reproducible Supabase and Authorization Integrity

Database behavior MUST be reproducible from versioned Supabase migrations before
it is relied on by application code. Runtime-only objects, manual dashboard
changes, generated database types, RLS policies, triggers, and notification type
constraints MUST be reflected in migrations or documented as explicit blockers.
Any change touching profiles, sponsorship, invitations, channel membership,
messages, notifications, or admin actions MUST include an authorization review
covering RLS, server-side checks, and sensitive-column protection.

Rationale: current docs identify schema drift and high-risk RLS gaps. The
database is part of the product contract, not an implementation detail.

### III. Next.js 16 and React 19 by Current Docs

Implementation work MUST follow the installed Next.js 16 documentation in
`node_modules/next/dist/docs/` before changing routing, middleware, caching,
server actions, metadata, or app structure. Code MUST preserve TypeScript strict
mode and the existing App Router conventions under `src/app`. Deprecated APIs,
training-memory assumptions about older Next.js versions, and unverified
framework patterns MUST NOT be introduced.

Rationale: AGENTS.md explicitly warns that this Next.js version has breaking
changes, so local framework documentation is the source of truth.

### IV. Spec-Driven Brownfield Changes

Every non-trivial change MUST start from the observed current state: affected
routes, guards, redirects, database objects, existing tests, and known product
scope. Specs MUST identify what is kept, adapted, frozen, or removed, and MUST
name any unresolved decisions. Plans MUST minimize blast radius and prefer
existing components, libraries, and Supabase helpers over new architecture.

Rationale: this is a brownfield product with existing behavior. Safe delivery
depends on preserving intended behavior while deliberately correcting drift.

### V. Quality Gates Are Release Criteria

`bun run build`, `bun run lint`, and `bunx vitest run` are mandatory quality
signals. A plan MAY proceed while a known gate is failing only if it documents
the current failure, proves the change does not worsen it, and creates or links
a task to close it. Core-flow, auth, RLS, migration, and redirect changes MUST
include focused automated tests or a documented reason tests are not feasible.

Rationale: README.md states build passes while lint and tests currently fail.
The constitution must prevent normalizing those failures as acceptable release
state.

## Product and Technical Boundaries

The current stack is Next.js 16, React 19, TypeScript strict, Supabase Auth/DB/
Storage/Realtime, Tailwind CSS 4, Vitest, and Testing Library. Specs and plans
MUST treat this stack as fixed unless they include a migration rationale and a
rollback plan.

The beta product direction is stabilization for a closed beta. The default app
entry target is chat-centered; forum-first redirects and links are known drift
until explicitly retained or removed by a spec. Legal pages, authentication
entry points, onboarding, admission, chat, profile/settings, notifications, and
admin approval are part of the core surface.

Data privacy and authorization are mandatory boundaries. Client code MUST NOT
be trusted for admission, role, moderation, private-channel membership, or
sensitive profile fields. Admin and sponsor actions MUST be enforced through
server-side checks and RLS-compatible database policies.

## Development Workflow

Feature specs MUST include a brownfield context section describing the current
behavior, affected files/routes/tables, migration impact, and compatibility
risks. Plans MUST perform the Constitution Check before research and after
design. Tasks MUST be ordered so schema/auth/guard prerequisites are completed
before UI work that depends on them.

For every implementation, the expected verification commands are:

- `bun run build`
- `bun run lint`
- `bunx vitest run`

If a command is skipped or fails due to known baseline issues, the result MUST
be recorded with enough detail for the next contributor to distinguish baseline
failure from regression.

Runtime guidance in `AGENTS.md`, `README.md`, `app_flow.md`, and `db_flow.md`
MUST be treated as active project context until replaced by newer specs.

## Governance

This constitution supersedes conflicting local habits and generic Spec Kit
defaults. Amendments require a documented reason, a semantic version bump, and
a Sync Impact Report listing affected templates and runtime guidance.

Versioning policy:

- MAJOR: removes or redefines a core principle, changes governance authority,
  or changes the required stack/gates in a backward-incompatible way.
- MINOR: adds a principle, adds a required section, or materially expands a
  gate that future specs must satisfy.
- PATCH: clarifies language, fixes inconsistencies, or updates references
  without changing required behavior.

Compliance review is required during planning and before implementation is
considered complete. Any justified violation MUST be documented in the plan's
Complexity Tracking section with the simpler alternative that was rejected.

**Version**: 1.0.0 | **Ratified**: 2026-04-26 | **Last Amended**: 2026-04-26
