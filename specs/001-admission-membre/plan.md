# Implementation Plan: Admission Membre MVP

**Branch**: `001-admission-membre` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-admission-membre/spec.md`

## Summary

Stabilize the MVP admission path: X authentication, onboarding email/sponsor
collection, admin review, and access guard by member status. Begin by reconciling
the imported issue set with the real code because the audit says much of this is
already implemented but not cleanly closed.

## Technical Context

**Language/Version**: Next.js / React / TypeScript, Supabase-backed app  
**Primary Dependencies**: Existing auth, onboarding, profile, admin, and Supabase data paths  
**Storage**: Existing Supabase profile/admission tables and related policies  
**Testing**: Focused admission flow tests, authorization/RLS checks, build/lint/vitest gate per release-readiness policy  
**Target Platform**: Web app Beta 1  
**Project Type**: Brownfield web application feature stabilization  
**Performance Goals**: Admission request and review complete without blocking user feedback  
**Constraints**: No broad auth expansion; no uncontrolled schema changes; preserve private access model  
**Scale/Scope**: Candidate onboarding, admin review, protected-route gating

## Constitution Check

- **Core-flow priority**: PASS. Admission is a beta-critical flow.
- **Supabase reproducibility**: REQUIRES REVIEW. Admission depends on profile/sponsorship schema and RLS.
- **Authorization integrity**: REQUIRES REVIEW. Admin review and access guards must be server/database enforced.
- **Next.js 16 source-of-truth**: REQUIRED before route/middleware edits.
- **Brownfield blast radius**: PASS. Known surfaces are listed in spec Brownfield Context.
- **Quality gates**: REQUIRES PROJECT DECISION. Gate policy is tracked in `004-release-readiness`.

## Project Structure

### Documentation (this feature)

```text
specs/001-admission-membre/
+-- spec.md
+-- plan.md
+-- tasks.md
```

### Source Code (repository root)

```text
app/                 # auth, onboarding, protected routes, admin surfaces
components/          # admission/admin UI where present
lib/                 # auth/session/admin helpers where present
supabase/            # migrations/RLS/functions if schema changes are required
tests/               # focused tests for admission utilities and flows
```

**Structure Decision**: Do not design new architecture until current admission
implementation and schema drift are audited. Prefer smallest fixes and rescope
already-implemented issues before adding new behavior.

## Imported Source Mapping

| Source | Imported status | Local interpretation |
| --- | --- | --- |
| `le-marche-libre#16` | Backlog | Product user story and acceptance criteria |
| `webapp-nextjs#3` | Ready | Parent implementation issue |
| `webapp-nextjs#7` | Ready, S | Auth X and session task |
| `webapp-nextjs#6` | Ready, S | Onboarding email and sponsorship task |
| `webapp-nextjs#14` | Ready, S | Admin review task |
| `webapp-nextjs#16` | Ready, XS | Access guard task |
| `webapp-nextjs#1` | Ready, S | Critical onboarding bug/blocker |

## Execution Order

1. Reproduce or disprove `webapp-nextjs#1` on the current code and DB state.
2. Audit existing admission implementation and classify imported tasks as done, partial, missing, or rescoped.
3. Resolve admission model decision (`invitation` vs `sponsorship_requests` or both).
4. Fix critical blocker and missing Beta 1 gaps.
5. Add or update tests for status-based access and admin authorization.
6. Record issue closure/rescope recommendations after code evidence.

## Open Decisions

- Refused-member UX.
- Admission data model simplification.
- Minimal quality gate before merge/beta.
