# Decisions

This file keeps only active decisions required for Speckit execution and GitHub
Project decommission.

## DEC-001 - Speckit Replaces GitHub Project

- Status: decided
- Decision: Active project management lives in `specs/`; GitHub Project 1 is an import source.
- Rationale: The goal is to remove GitHub Project as the source of truth and keep one local Speckit workflow.
- Consequence: Project fields are retained in `sources.md`; future status changes happen in Speckit tasks/specs.

## DEC-002 - GitHub Project Deletion Requires Owner Confirmation

- Status: decided
- Decision: Do not delete or freeze GitHub Project 1 during import.
- Rationale: Deletion is destructive and must happen only after coverage review.
- Next action: Owner verifies 26/26 Project item coverage and confirms deletion/freeze separately.

## DEC-003 - Forum Beta Position

- Status: decided
- Decision: Forum is tolerated legacy, not an explicit Beta 1 product surface.
- Rationale: The current app remains forum-centric, but the retained MVP target
  is chat-centered. Release work should hide or de-emphasize forum rather than
  expand it.
- Source: `03-questions-equipe.md`, `06-etat-webapp-nextjs.md`, release audit.
- Consequence: Forum can remain temporarily if stable, but it must not define
  the beta promise or default destination.

## DEC-004 - Launch Channel Taxonomy

- Status: decided
- Decision: For Beta 1 planning, the currently implemented public channel set is
  accepted as the baseline until a deliberate seeded taxonomy is shipped.
- Rationale: The PRD taxonomy is not what the current migrations/code expose, so
  claiming it today would create a false readiness signal.
- Source: PRD, `03-questions-equipe.md`, webapp audit.
- Consequence: `Jobs` is not considered implemented. It becomes a future blocker
  only if the team insists it is required at launch.

## DEC-005 - Admission Data Model Simplification

- Status: decided
- Decision: Beta 1 keeps `profiles.status` as the final access gate, uses
  `sponsorship_requests` as canonical sponsor evidence, and keeps
  `invitations` as compatibility/member-referral input.
- Rationale: The runtime already gates access through `profiles.status`; the
  skipped admission hardening work showed that sponsor evidence can remain in
  existing tables without adding a third access-request table, but DB hardening
  still requires staging validation before production.
- Source: PRD, `03-questions-equipe.md`, webapp audit.
- Follow-up: Rework or review admission RLS in staging and validate live
  Postgres behavior because repo tests remain DB-free.

## DEC-006 - Refused Member UX

- Status: decided
- Decision: A refused member should be redirected out of the app and shown a
  clear refusal message at the auth boundary instead of silently looping.
- Rationale: The current redirect to `/connexion` hides the refusal state and
  creates ambiguity about whether retrying login can help.
- Source: PRD, `03-questions-equipe.md`, release audit.
- Consequence: Current runtime remains incomplete until a refusal message and
  re-entry rule are implemented.

## DEC-007 - Technical Owner and Schema Owner

- Status: open
- Question: Who owns `webapp-nextjs` technical direction and Supabase schema reproducibility?
- Source: governance, roadmap, warnings.
- Blocks: `004-release-readiness` execution.

## DEC-008 - Minimal Quality Gate

- Status: decided
- Decision: Merge requires build pass, changed-scope lint cleanliness, targeted
  tests for touched beta-critical flows, and manual auth/schema review when
  permissions are affected. Beta requires repo-wide build, lint, and Vitest
  pass, plus explicit resolution or acceptance of known schema drift.
- Rationale: Build already passes, but repo-wide lint and tests are still red;
  a staged gate is the smallest honest rule that stops regressions without
  pretending current debt is gone.
- Source: `03-questions-equipe.md`, warnings, webapp audit.
- Consequence: Teams can merge stabilization work under a scoped gate, but beta
  remains blocked until repo-wide gates and schema drift are addressed.

## DEC-009 - Admin Access Ownership

- Status: open
- Question: Who owns GitHub org, Supabase, Vercel, and X OAuth admin access?
- Source: `03-questions-equipe.md`, warnings.
- Blocks: release readiness and operational safety.
