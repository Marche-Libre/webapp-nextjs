# Implementation Plan: Project Management Cleanup

**Branch**: `2026-app-refinement` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-management-cleanup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Localize all project-management context into this repository without changing app
behavior. The replacement system will use local markdown inventories and review
records for active scope, task lifecycle, imported external sources, decisions,
verification, archives, and GitHub Project decommissioning. External GitHub docs,
issues, and Project items are treated as migration inputs with provenance, not
future sources of truth.

## Current Implementation State

Last updated: 2026-04-26

| Phase / story | State | Notes |
| --- | --- | --- |
| Phase 1 Setup | Complete | Local project-management document surface exists. |
| Phase 2 Foundational | Complete | Record contracts, taxonomy, lifecycle, and scope guard are defined. |
| US1 Find the Current Source of Truth | Complete | Start Here navigation and local source inventory are usable. |
| US2 Normalize Tasks and Statuses | Complete | APP_REFINEMENT task/session status is represented locally. |
| US3 Localize External GitHub Sources | Complete with owner decision | External docs/issues/Project proxies are localized; Project 1 full card export remains an owner decision before decommission. |
| US4 Archive Without Losing History | Next | Archive rules and movement/deletion decisions are the next logical implementation slice. |
| Phase 7 Polish & Cross-Cutting Verification | Blocked until US4 and Project export review | Do not freeze/delete the GitHub Project until local replacement review and Project item export coverage are resolved. |

Current active responsibilities:

- Keep runtime/product work as candidate Task Records only.
- Execute US4 next to define archive rules, move historical material, and verify
  archive boundaries.
- Resolve `DEC-012` with an owner-authenticated Project 1 export before Phase 7
  decommission work.
- Do not change app routes, UI, Supabase files, dependencies, package locks,
  generated types, tests, or runtime behavior in this cleanup.

## Technical Context

**Language/Version**: Markdown documentation and Spec Kit artifacts in this
Next.js 16 / React 19 / TypeScript repository; no application code changes are
planned.
**Primary Dependencies**: Local filesystem, Git, Spec Kit conventions, GitHub
web/CLI/API exports at implementation time for source capture, and existing repo
guidance in `README.md`, `AGENTS.md`, `app_flow.md`, `db_flow.md`, and
`APP_REFINEMENT/`.
**Storage**: Versioned repository files only. Proposed active replacement
storage is `docs/project-management/` plus existing `specs/` feature artifacts
and an archive under `docs/project-management/archive/`.
**Testing**: Documentation review against the acceptance checklist, source
inventory completeness checks, link/path checks where feasible, plus unchanged
baseline awareness for `bun run build`, `bun run lint`, and `bunx vitest run`.
**Target Platform**: Repository maintainers and contributors working locally or
through GitHub review.
**Project Type**: Brownfield documentation/process cleanup inside a web
application repo.
**Performance Goals**: A new contributor can find active scope, task inventory,
external-source inventory, and archive location in under 10 minutes.
**Constraints**: No route, component, database, permission, UI behavior,
dependency, or product-scope change. External GitHub sources must be localized
before the GitHub Project is retired or deleted.
**Scale/Scope**: All in-scope local planning/task/status documents, external
docs from `Marche-Libre/le-marche-libre`, relevant GitHub issues in the app and
documentation repos, and org GitHub Project 1 items.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Core-flow priority**: PASS. The work protects stabilization by reducing
  planning ambiguity and explicitly forbids product expansion or runtime changes.
- **Supabase reproducibility**: N/A. No schema, RLS, trigger, function,
  realtime, storage, or generated-type changes are in scope; any discovered
  database issue becomes a separate candidate task.
- **Authorization integrity**: N/A. No auth, admission, profile, admin, chat, or
  notification implementation changes are in scope.
- **Next.js 16 source-of-truth**: N/A. The plan does not change routing,
  middleware, caching, server actions, metadata, or app structure. If
  implementation later proposes app-code edits, the relevant installed docs in
  `node_modules/next/dist/docs/` must be checked before that separate work.
- **Brownfield blast radius**: PASS. Affected surface is limited to
  project-management documentation: `README.md`, `AGENTS.md`, `app_flow.md`,
  `db_flow.md`, `APP_REFINEMENT/`, `specs/`, external docs/issues/project
  exports, local archive docs, and review records.
- **Quality gates**: PASS. Expected runtime quality commands remain `bun run
  build`, `bun run lint`, and `bunx vitest run`. Because this feature should
  only change docs, reviewers verify that no runtime files changed; if commands
  are run, results must be recorded as baseline signals and not as cleanup
  success substitutes.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-management-cleanup/
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- contracts/
|   +-- local-project-management.md
+-- tasks.md                 # Created by /speckit.tasks, not by this plan
```

### Source Code (repository root)

```text
docs/
+-- project-management/
    +-- README.md            # Start Here entrypoint
    +-- product-framing.md   # Active product/beta-scope framing index
    +-- current-state.md     # Current-state map index and canonical refs
    +-- tasks.md             # Active local task inventory and lifecycle
    +-- external-sources.md  # Imported docs/issues/project item ledger
    +-- decisions.md         # Cleanup, product, sequencing decisions
    +-- verification.md      # Review evidence for cleaned state
    +-- github-project-decommission.md
    +-- archive/
        +-- README.md        # Archive index and retention rules

APP_REFINEMENT/              # Existing source material to classify/merge/archive
specs/                       # Spec Kit feature specs and implementation plans
README.md                    # Existing project context, may link to Start Here
AGENTS.md                    # Agent context reference to this plan
app_flow.md                  # Current-state source, likely active/reference
db_flow.md                   # Current-state source, likely active/reference
```

**Structure Decision**: Use `docs/project-management/` as the local replacement
project-management surface because it keeps active planning separate from app
runtime code while allowing root guidance (`README.md`, `AGENTS.md`) and Spec
Kit artifacts (`specs/`) to point to one canonical entrypoint. Existing source
documents are not moved until they are inventoried and assigned a disposition.

## Phase 0: Research

Research decisions are recorded in [research.md](./research.md). All
clarifications are resolved for planning purposes; the only remaining unknowns
are owner decisions to be explicitly tracked during implementation, not blockers
to creating the plan.

## Phase 1: Design and Contracts

Data entities and lifecycle rules are recorded in [data-model.md](./data-model.md).
The local markdown interface contracts are recorded in
[contracts/local-project-management.md](./contracts/local-project-management.md).
Reviewer and implementation guidance is recorded in [quickstart.md](./quickstart.md).

## Phase Execution Responsibilities

### Completed Through US3

- Phase 1 and Phase 2 created the local records and contracts.
- US1 established the canonical local project-management entrypoint.
- US2 normalized local APP_REFINEMENT work into Task Records.
- US3 imported and localized external docs, relevant issue chains, and Project
  item proxies into `docs/project-management/external-sources.md`,
  `product-framing.md`, `current-state.md`, `tasks.md`, `decisions.md`, and
  `verification.md`.

### Next: US4 Archive Slice

US4 should be executed before Phase 7. Its responsibility is to move or mark
historical planning material without losing decision history:

- Define archive categories and retention rules in
  `docs/project-management/archive/README.md`.
- Record archive/delete/rename/owner-decision outcomes in
  `docs/project-management/decisions.md`.
- Move historical local planning files only after useful content is captured.
- Update active navigation so active readers do not have to inspect archived
  records.
- Record archive coverage in `docs/project-management/verification.md`.

### Later: Phase 7

Phase 7 remains a final reconciliation/decommission slice:

- Reconcile final inventory counts.
- Confirm the diff is docs-only.
- Record quality-gate skip/run status.
- Complete `github-project-decommission.md`.
- Freeze or delete GitHub Project 1 only after local replacement review and
  Project item export coverage are resolved.

## Post-Design Constitution Check

- **Core-flow priority**: PASS. The design improves planning clarity for
  stabilization work and still excludes app behavior changes.
- **Supabase reproducibility**: N/A. The data model is documentation-only and
  has no database impact.
- **Authorization integrity**: N/A. The contracts define local markdown records,
  not auth or permission behavior.
- **Next.js 16 source-of-truth**: N/A. The contracts do not touch Next.js app
  structure.
- **Brownfield blast radius**: PASS. The design names the affected docs and
  requires a no-runtime-change verification record.
- **Quality gates**: PASS. The quickstart requires reviewers to record whether
  runtime files changed and whether baseline commands were skipped or run.

## Complexity Tracking

No constitution violations are required for this plan.
