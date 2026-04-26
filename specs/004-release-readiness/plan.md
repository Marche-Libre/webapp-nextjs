# Implementation Plan: Release Readiness and Backlog Realignment

**Branch**: `004-release-readiness` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-release-readiness/spec.md`

## Summary

Turn the imported roadmap, risks, governance questions, architecture/scope items,
and webapp audit into an actionable release-readiness plan. This feature owns the
freeze/audit, backlog realignment, schema reproducibility, quality gate, owner
decisions, and beta go/no-go criteria.

## Technical Context

**Language/Version**: Next.js / React / TypeScript app with Supabase backend  
**Primary Dependencies**: Existing app code, Supabase migrations, GitHub issue provenance, Speckit feature specs  
**Storage**: Existing Supabase schema and versioned migrations; no schema changes in this planning import  
**Testing**: Build/lint/vitest policy selection, schema reproducibility review, manual release checklist  
**Target Platform**: Closed-beta web app  
**Project Type**: Brownfield release stabilization and project-management realignment  
**Performance Goals**: Contributors can determine blockers and next actions without GitHub Project  
**Constraints**: No feature expansion until blockers and owner decisions are resolved  
**Scale/Scope**: MVP/Beta 1 readiness across admission, profile/search, channels/messages, infra and governance

## Constitution Check

- **Core-flow priority**: PASS. This feature protects admission, profile/search, and channels/messages before expansion.
- **Supabase reproducibility**: PASS as planning; implementation tasks must convert drift into migrations or documented bootstrap.
- **Authorization integrity**: PASS as planning; admission/chat/admin risks are routed to feature specs.
- **Next.js 16 source-of-truth**: N/A until runtime edits are planned.
- **Brownfield blast radius**: PASS. This feature exists to map brownfield state and risk.
- **Quality gates**: PASS. Defining the gate is a first-class task.

## Project Structure

### Documentation (this feature)

```text
specs/004-release-readiness/
+-- spec.md
+-- plan.md
+-- tasks.md
```

### Source Code (repository root)

```text
README.md            # project status pointer only if needed
app_flow.md          # route/current-state evidence input
db_flow.md           # schema/current-state evidence input
supabase/            # future migration work spawned by this plan
tests/               # future quality-gate repair work spawned by this plan
```

**Structure Decision**: Keep release readiness as a Speckit feature that governs
what must be true before runtime implementation and beta. Do not mix this with
the old `docs/project-management` system.

## Imported Source Mapping

| Source | Imported value | Local interpretation |
| --- | --- | --- |
| `00-cadrage.md` | Stabilize existing repo, realign code/backlog/ownership | Release strategy |
| `01-diagnostic.md` | Demand exists, but vision/scope/governance weaknesses | Owner decisions and risk |
| `02-prd.md` | Beta 1 scope and out-of-scope list | Scope baseline for feature specs |
| `03-questions-equipe.md` | Product/technical/org questions | Decisions backlog |
| `04-warnings.md` | Critical risks | Release blockers |
| `05-roadmap.md` | Phase 0-4 roadmap | Milestones and roadmap |
| `06-etat-webapp-nextjs.md` | App/code/schema/test audit | Brownfield baseline |
| `le-marche-libre#1,#3,#4,#5` | Vision, architecture, scope, governance | Release-readiness decisions |

## Execution Order

1. Confirm product/technical/schema/access owners.
2. Freeze new feature expansion except blocker fixes and realignment.
3. Re-run or update app/schema/quality audit if needed.
4. Classify imported issues as done, partial, missing, parked, or rescoped.
5. Define minimal quality gate and beta go/no-go criteria.
6. Prepare GitHub issue closure/rescope recommendations.
7. Approve GitHub Project deletion only after source coverage review.

## Open Decisions

- Forum beta status.
- Channel taxonomy.
- Admission data model.
- Refused-member UX.
- Technical/schema/access owners.
- Minimal quality gate.
- Team capacity over the next 4 weeks.
