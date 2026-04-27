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

- Status: open
- Question: Is the forum part of the explicit beta promise, tolerated if stable, or parked/hidden?
- Source: `03-questions-equipe.md`, `06-etat-webapp-nextjs.md`.
- Blocks: `004-release-readiness`, `003-canaux-messages` scope boundary.

## DEC-004 - Launch Channel Taxonomy

- Status: open
- Question: Are launch channels exactly `General`, `Business`, `Politique`, `Divers`, `Jobs`, or does current code taxonomy become accepted?
- Source: PRD, `03-questions-equipe.md`, webapp audit.
- Blocks: `003-canaux-messages` implementation and acceptance tests.

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

- Status: open
- Question: What should a refused member see after login?
- Source: PRD and `03-questions-equipe.md`.
- Blocks: `001-admission-membre` acceptance completion.

## DEC-007 - Technical Owner and Schema Owner

- Status: open
- Question: Who owns `webapp-nextjs` technical direction and Supabase schema reproducibility?
- Source: governance, roadmap, warnings.
- Blocks: `004-release-readiness` execution.

## DEC-008 - Minimal Quality Gate

- Status: open
- Question: What is the required gate before merge/beta: build, vitest, lint, manual review, or staged target?
- Source: `03-questions-equipe.md`, warnings, webapp audit.
- Blocks: release readiness and beta go/no-go.

## DEC-009 - Admin Access Ownership

- Status: open
- Question: Who owns GitHub org, Supabase, Vercel, and X OAuth admin access?
- Source: `03-questions-equipe.md`, warnings.
- Blocks: release readiness and operational safety.
