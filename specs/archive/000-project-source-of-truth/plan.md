# Implementation Plan: Project Source of Truth Migration

**Branch**: `000-project-source-of-truth` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/000-project-source-of-truth/spec.md`

## Summary

Import the current GitHub Project 1, `Marche-Libre/le-marche-libre` docs/issues,
and `webapp-nextjs` implementation issues into Speckit feature directories in one
batch. The active project-management source of truth becomes `specs/`; GitHub
Project becomes an imported source that can be removed only after owner-verified
coverage.

## Technical Context

**Language/Version**: Markdown documentation and Speckit artifacts in a Next.js / Supabase repository  
**Primary Dependencies**: Speckit files under `.specify/`, GitHub CLI authenticated access, local repository files  
**Storage**: Versioned repository markdown files under `specs/`  
**Testing**: Coverage review, source mapping review, `git diff --name-only`, and targeted link/path inspection  
**Target Platform**: Project maintainers using repository-local Speckit workflow  
**Project Type**: Brownfield project-management migration  
**Performance Goals**: A contributor can find roadmap, milestones, user stories, tasks, sources, and decisions in under 5 minutes  
**Constraints**: Docs/planning-only; no app runtime, Supabase, dependency, package-lock, generated-type, or test changes  
**Scale/Scope**: 26 Project items, 7 external docs, current issues from `le-marche-libre` and `webapp-nextjs`

## Constitution Check

- **Core-flow priority**: PASS. The import preserves stabilization-first MVP work before product expansion.
- **Supabase reproducibility**: PASS. Schema drift is captured as Release Readiness planning work, not changed here.
- **Authorization integrity**: PASS. Admission/admin/chat risks are captured in feature specs; no permissions change here.
- **Next.js 16 source-of-truth**: N/A. No app routes, middleware, caching, or server actions are edited.
- **Brownfield blast radius**: PASS. Affected surface is documentation/planning only.
- **Quality gates**: PASS. This migration records known quality gate state but does not claim runtime quality repairs.

## Project Structure

### Documentation (this source-of-truth migration)

```text
specs/
+-- 000-project-source-of-truth/
|   +-- README.md
|   +-- spec.md
|   +-- plan.md
|   +-- tasks.md
|   +-- roadmap.md
|   +-- milestones.md
|   +-- sources.md
|   +-- decisions.md
+-- 001-admission-membre/
|   +-- spec.md
|   +-- plan.md
|   +-- tasks.md
+-- 002-profil-recherche-membre/
|   +-- spec.md
|   +-- plan.md
|   +-- tasks.md
+-- 003-canaux-messages/
|   +-- spec.md
|   +-- plan.md
|   +-- tasks.md
+-- 004-release-readiness/
|   +-- spec.md
|   +-- plan.md
|   +-- tasks.md
+-- 005-landing-page/
|   +-- spec.md
|   +-- plan.md
|   +-- tasks.md
+-- archive/
    +-- 001-project-management-cleanup/
    +-- docs-project-management/
```

### Source Code (repository root)

```text
.specify/      # Speckit tooling/configuration, kept
specs/         # Active project-management source of truth and archived provenance
README.md      # One-link pointer to Speckit source of truth
AGENTS.md      # Agent pointer to Speckit plan and scope guard
```

**Structure Decision**: Keep Speckit tooling in `.specify/`; move active project
management into `specs/`; archive the previous `docs/project-management` output
because it competed with Speckit as a second source of truth.

## Execution Responsibilities

1. Export GitHub Project 1 using authenticated `gh project item-list`.
2. Export external docs from `Marche-Libre/le-marche-libre/docs`.
3. Export issues from `Marche-Libre/le-marche-libre` and `Marche-Libre/webapp-nextjs`.
4. Map Project items to Speckit features and the project index.
5. Generate feature `spec.md`, `plan.md`, and `tasks.md` in one batch.
6. Archive old cleanup artifacts and remove active pointers to them.
7. Verify source coverage and docs-only diff.

## Decommission Gate

GitHub Project 1 may be frozen/deleted only after:

- `sources.md` lists all 26 authenticated Project items.
- Each Project item has a local destination.
- The owner confirms `specs/000-project-source-of-truth/README.md` as the active source of truth.
- A final Project export is retained or referenced before deletion.

## Notes

- Imported Project statuses are metadata, not proof that work is done or ready.
- Feature task lists must be reconciled with code reality before implementation.
- Runtime implementation work starts from the generated feature tasks, not from GitHub Project columns.
