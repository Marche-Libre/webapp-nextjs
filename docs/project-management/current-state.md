# Current State Inventory

## Document Taxonomy

| Primary category | Meaning | Typical canonical destination |
| --- | --- | --- |
| `product-framing` | Scope framing and MVP boundaries | `docs/project-management/product-framing.md` |
| `current-state-map` | Observed app/database state documentation | `app_flow.md`, `db_flow.md` |
| `feature-spec` | Feature requirements and acceptance scope | `specs/*/spec.md` |
| `implementation-plan` | Execution plan and task decomposition | `specs/*/plan.md`, `specs/*/tasks.md` |
| `task-inventory` | Canonical local task lifecycle records | `docs/project-management/tasks.md` |
| `external-source` | Imported external docs/issues/project records | `docs/project-management/external-sources.md` |
| `decision-log` | Reviewable cleanup decisions | `docs/project-management/decisions.md` |
| `verification-record` | Coverage and quality-gate evidence | `docs/project-management/verification.md` |
| `archive` | Historical planning records | `docs/project-management/archive/` |
| `reference` | Supporting context not canonical for active status | Source files linked from canonical records |

## Classification Values

| Classification | Meaning | Required follow-up |
| --- | --- | --- |
| `active` | Canonical active document for a topic | Keep links current from Start Here |
| `reference` | Useful supporting context, not canonical status | Keep pointer to canonical local record |
| `merged` | Content captured into a canonical local record | Record replacement destination |
| `archived` | Historical value retained outside active surface | Record archive reason and replacement if any |
| `deleted` | No unique project value retained | Record deletion reason and reviewer |
| `needs-owner-decision` | Ambiguous/conflicting status or ownership | Record explicit decision question and next action |

## Cleanup Action Rules

- Keep exactly one canonical active record per topic.
- If multiple files cover the same active topic, merge status into one
  canonical record and mark source files `merged`.
- Use `needs-owner-decision` when local evidence conflicts or scope authority is
  unclear.
- Do not infer active task status from filenames once normalized records exist.

## Root Planning Documents (US1)

| Source path | Primary category | Classification | Canonical for / replacement | Last reviewed | Notes |
| --- | --- | --- | --- | --- | --- |
| `README.md` | `reference` | `reference` | `docs/project-management/README.md` | 2026-04-26 | Root overview remains useful but no longer carries canonical task status. |
| `AGENTS.md` | `reference` | `active` | Agent execution entrypoint with local PM pointer | 2026-04-26 | Keeps execution guardrails and direct link to Start Here. |
| `CLAUDE.md` | `reference` | `reference` | `AGENTS.md` | 2026-04-26 | Lightweight pointer file; not canonical for planning state. |
| `app_flow.md` | `current-state-map` | `active` | Current route/guard/redirect map | 2026-04-26 | Active reality map; runtime source review only. |
| `db_flow.md` | `current-state-map` | `active` | Current schema/RLS map | 2026-04-26 | Active reality map; runtime source review only. |
| `design.md` | `reference` | `needs-owner-decision` | Pending canonical design-source decision | 2026-04-26 | Overlaps with design-system master guidance. |
| `design-system/marchélibre/MASTER.md` | `reference` | `needs-owner-decision` | Pending canonical design-source decision | 2026-04-26 | Overlaps with `design.md`; owner decision required. |

## Spec Kit Artifacts (US1)

| Source path | Primary category | Classification | Canonical for / replacement | Last reviewed | Notes |
| --- | --- | --- | --- | --- | --- |
| `specs/001-project-management-cleanup/spec.md` | `feature-spec` | `reference` | `docs/project-management/*` records | 2026-04-26 | Requirement provenance. |
| `specs/001-project-management-cleanup/plan.md` | `implementation-plan` | `active` | This cleanup execution plan | 2026-04-26 | Active while feature is in progress. |
| `specs/001-project-management-cleanup/tasks.md` | `implementation-plan` | `active` | Task execution checklist for feature implementation | 2026-04-26 | Canonical execution checklist for this feature. |
| `specs/001-project-management-cleanup/research.md` | `reference` | `reference` | Decision rationale provenance | 2026-04-26 | Supports why cleanup structure was chosen. |
| `specs/001-project-management-cleanup/data-model.md` | `reference` | `reference` | Local record model definitions | 2026-04-26 | Defines entity/lifecycle language used in docs. |
| `specs/001-project-management-cleanup/quickstart.md` | `reference` | `reference` | Reviewer implementation guidance | 2026-04-26 | Acceptance-review playbook. |
| `specs/001-project-management-cleanup/checklists/requirements.md` | `reference` | `reference` | Requirements quality checklist provenance | 2026-04-26 | Checklist passed before implementation. |
| `specs/001-project-management-cleanup/contracts/local-project-management.md` | `reference` | `reference` | Markdown record contract definitions | 2026-04-26 | Contract source for local PM docs. |

## APP_REFINEMENT Source Documents (US2)

| Source file | Filename status token | Post-normalization classification | Canonical local destination | Last reviewed | Notes |
| --- | --- | --- | --- | --- | --- |
| `APP_REFINEMENT/TASK_00.STARTED.md` | `STARTED` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-00`) | 2026-04-26 | Parent framing/workstream merged into canonical task record. |
| `APP_REFINEMENT/TASK_00.SESSION_00.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-00`) | 2026-04-26 | Session guidance captured in transition history and notes. |
| `APP_REFINEMENT/TASK_00.SESSION_01.READY.md` | `READY` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-00`) | 2026-04-26 | Ready checkpoint captured in transition history. |
| `APP_REFINEMENT/TASK_00.SESSION_02.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-00`) | 2026-04-26 | Runtime execution scope kept out of cleanup. |
| `APP_REFINEMENT/TASK_00.SESSION_03.READY.md` | `READY` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-00`) | 2026-04-26 | Ready checkpoint captured in transition history. |
| `APP_REFINEMENT/TASK_00.SESSION_04.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-00`) | 2026-04-26 | Runtime execution scope kept out of cleanup. |
| `APP_REFINEMENT/TASK_00.SESSION_05.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-00`) | 2026-04-26 | Runtime execution scope kept out of cleanup. |
| `APP_REFINEMENT/TASK_00.SESSION_06.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-00`) | 2026-04-26 | Runtime execution scope kept out of cleanup. |
| `APP_REFINEMENT/TASK_00.SESSION_07.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-00`) | 2026-04-26 | Runtime execution scope kept out of cleanup. |
| `APP_REFINEMENT/TASK_01.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-01`) | 2026-04-26 | Canonical status moved to local Task Record. |
| `APP_REFINEMENT/TASK_02.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-02`) | 2026-04-26 | Canonical status moved to local Task Record. |
| `APP_REFINEMENT/TASK_03.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-03`) | 2026-04-26 | Canonical status moved to local Task Record. |
| `APP_REFINEMENT/TASK_04.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-04`) | 2026-04-26 | Canonical status moved to local Task Record. |
| `APP_REFINEMENT/TASK_05.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-05`) | 2026-04-26 | Canonical status moved to local Task Record. |
| `APP_REFINEMENT/TASK_06.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-06`) | 2026-04-26 | Canonical status moved to local Task Record. |
| `APP_REFINEMENT/TASK_07.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-07`) | 2026-04-26 | Canonical status moved to local Task Record. |
| `APP_REFINEMENT/TASK_08.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-08`) | 2026-04-26 | Canonical status moved to local Task Record. |
| `APP_REFINEMENT/TASK_09.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-09`) | 2026-04-26 | Canonical status moved to local Task Record. |
| `APP_REFINEMENT/TASK_10.TODO.md` | `TODO` | `merged` | `docs/project-management/tasks.md` (`TASK-APP-10`) | 2026-04-26 | Canonical status moved to local Task Record. |

## External Current-State Observations (US3)

Imported from `EXT-DOC-008` (`le-marche-libre/docs/06-etat-webapp-nextjs.md`)
and localized to local canonical records:

| Observation imported | Source record | Canonical local destination | Localization result |
| --- | --- | --- | --- |
| Webapp is an advanced prototype, not a blank MVP skeleton | `EXT-DOC-008` | `docs/project-management/product-framing.md` | Scope language updated to stabilization-first framing. |
| Backlog status drifts from runtime reality | `EXT-DOC-008` | `docs/project-management/tasks.md` | External-origin candidate parent tasks (`CAND-006`..`CAND-009`) created. |
| Quality signal: build OK, lint/vitest not fully green in external audit snapshot | `EXT-DOC-008` | `docs/project-management/tasks.md`, `docs/project-management/verification.md` | Preserved as provenance only; no runtime fixes executed. |
| DB reproducibility drift (missing views/tables/columns in migrations) | `EXT-DOC-008` | `db_flow.md`, `docs/project-management/tasks.md` (`CAND-002`) | Kept as runtime follow-up candidate, not implemented in cleanup. |
| Onboarding finalization blocker tracked externally (`webapp-nextjs#1`) | `EXT-DOC-006`, `EXT-ISSUE-WA-001` | `docs/project-management/tasks.md` (`CAND-009`) | Local candidate task created with external provenance. |

## Classification Summary (Current In-Scope Local Sources)

| Classification | Count |
| --- | --- |
| `active` | 5 |
| `reference` | 8 |
| `merged` | 19 |
| `archived` | 0 |
| `deleted` | 0 |
| `needs-owner-decision` | 2 |

Total in-scope local sources inventoried: 34.
