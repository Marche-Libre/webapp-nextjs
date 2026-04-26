# Cleanup Decisions

## Decision Template

```markdown
## DECISION-ID - Decision title

- Date: YYYY-MM-DD
- Type: keep | merge | rename | archive | delete | freeze | decommission | owner-decision-needed
- Affected items:
- Decision:
- Rationale:
- Reviewer:
- Resulting local record:
- Next action:
```

## Decision Handling Rules

- `keep`: item remains active/reference; canonical destination must be explicit.
- `merge`: source value moved into canonical local record; source is marked
  `merged`.
- `archive`: item moved out of active surface with archive reason and
  replacement reference.
- `delete`: only when no unique value remains; deletion reason required.
- `owner-decision-needed`: use for unresolved conflicts, unclear ownership, or
  scope ambiguity; include explicit next action.

## Decision Records

## DEC-001 - Canonical Start Here Entrypoint

- Date: 2026-04-26
- Type: keep
- Affected items:
  `docs/project-management/README.md`,
  `README.md`,
  `AGENTS.md`
- Decision:
  Use `docs/project-management/README.md` as the canonical project-management
  navigation entrypoint.
- Rationale:
  Keeps active planning context local and avoids status drift across root docs.
- Reviewer: project-maintenance
- Resulting local record: `docs/project-management/README.md`
- Next action: Keep root/agent pointers aligned during later phases.

## DEC-002 - Keep Current-State Maps as Active References

- Date: 2026-04-26
- Type: keep
- Affected items:
  `app_flow.md`,
  `db_flow.md`
- Decision:
  Keep both maps active as reality snapshots; use them as inputs, not active
  task status boards.
- Rationale:
  They capture route and schema drift needed for runtime follow-up planning.
- Reviewer: project-maintenance
- Resulting local record: `docs/project-management/current-state.md`
- Next action: Re-validate map freshness when runtime implementation begins.

## DEC-003 - Merge APP_REFINEMENT Task Sources Into Canonical Local Task Records

- Date: 2026-04-26
- Type: merge
- Affected items:
  `APP_REFINEMENT/TASK_00.STARTED.md`,
  `APP_REFINEMENT/TASK_00.SESSION_00.TODO.md` through
  `APP_REFINEMENT/TASK_00.SESSION_07.TODO.md`,
  `APP_REFINEMENT/TASK_01.TODO.md` through `APP_REFINEMENT/TASK_10.TODO.md`
- Decision:
  Canonical active task status now lives in `docs/project-management/tasks.md`.
  APP_REFINEMENT files are retained as merged source context.
- Rationale:
  Removes filename-driven status ambiguity and creates one local task lifecycle
  surface.
- Reviewer: project-maintenance
- Resulting local record: `docs/project-management/tasks.md`
- Next action: Maintain transitions in local records only.

## DEC-004 - Keep Feature Spec Artifacts as Provenance, Not Active Status Boards

- Date: 2026-04-26
- Type: keep
- Affected items:
  `specs/001-project-management-cleanup/spec.md`,
  `specs/001-project-management-cleanup/plan.md`,
  `specs/001-project-management-cleanup/tasks.md`,
  `specs/001-project-management-cleanup/research.md`,
  `specs/001-project-management-cleanup/data-model.md`,
  `specs/001-project-management-cleanup/quickstart.md`
- Decision:
  Keep Spec Kit artifacts as execution/provenance records while canonical
  ongoing project-management status remains in `docs/project-management/`.
- Rationale:
  Preserves traceability without splitting active status across two systems.
- Reviewer: project-maintenance
- Resulting local record: `docs/project-management/current-state.md`
- Next action: Reclassify after feature completion.

## DEC-005 - Filename-to-Lifecycle Mapping for APP_REFINEMENT Normalization

- Date: 2026-04-26
- Type: keep
- Affected items:
  `APP_REFINEMENT/*.md`,
  `docs/project-management/tasks.md`
- Decision:
  Normalize filename tokens as:
  `TODO -> proposed`,
  `READY -> ready`,
  `STARTED -> in-progress`.
- Rationale:
  Creates deterministic local status mapping and removes implicit filename
  interpretation.
- Reviewer: project-maintenance
- Resulting local record: `docs/project-management/tasks.md`
- Next action: Future status updates must occur in Task Records, not filenames.

## DEC-006 - Owner Decision Needed: TASK_00 Completion vs Active Status

- Date: 2026-04-26
- Type: owner-decision-needed
- Affected items:
  `APP_REFINEMENT/TASK_00.STARTED.md`,
  `APP_REFINEMENT/TASK_00.SESSION_00.TODO.md`,
  `APP_REFINEMENT/TASK_00.SESSION_01.READY.md`,
  `APP_REFINEMENT/TASK_00.SESSION_03.READY.md`
- Decision:
  Owner must decide whether `TASK-APP-00` should remain active `in-progress` or
  be moved to `ready`/`archived` after framing completion.
- Rationale:
  Source files contain mixed signals (`STARTED`, `READY`, and framing marked
  done-like in session summary).
- Reviewer: project-maintenance
- Resulting local record: `docs/project-management/tasks.md` (`TASK-APP-00`)
- Next action: Owner review with explicit final status transition.

## DEC-007 - Owner Decision Needed: Canonical Design Guidance Source

- Date: 2026-04-26
- Type: owner-decision-needed
- Affected items:
  `design.md`,
  `design-system/marchélibre/MASTER.md`
- Decision:
  Owner must choose canonical design authority or merge both into one active
  design source.
- Rationale:
  Both documents provide overlapping guidance and currently create ambiguity for
  contributors.
- Reviewer: project-maintenance
- Resulting local record: `docs/project-management/current-state.md`
- Next action: Decide canonical design source and reclassify the other file.

## DEC-008 - Owner Decision Needed: `/membres/[id]` End-State

- Date: 2026-04-26
- Type: owner-decision-needed
- Affected items:
  `APP_REFINEMENT/TASK_06.TODO.md`,
  `APP_REFINEMENT/TASK_07.TODO.md`,
  `app_flow.md`
- Decision:
  Owner must choose whether member detail remains as route `/membres/[id]` or
  is replaced by a chat-integrated surface.
- Rationale:
  Annuaire removal depends on preserving member discovery/detail behavior.
- Reviewer: project-maintenance
- Resulting local record: `docs/project-management/tasks.md` (`TASK-APP-06`,
  `TASK-APP-07`)
- Next action: Product decision before runtime navigation changes.

## DEC-009 - Owner Decision Needed: `invitations` vs `sponsorship_requests`

- Date: 2026-04-26
- Type: owner-decision-needed
- Affected items:
  `APP_REFINEMENT/TASK_04.TODO.md`,
  `APP_REFINEMENT/TASK_10.TODO.md`,
  `db_flow.md`
- Decision:
  Owner must decide whether `invitations` remains active, becomes legacy-only,
  or is replaced by sponsorship workflow semantics.
- Rationale:
  Concurrent admission pathways can create policy drift and ambiguous runtime
  behavior.
- Reviewer: project-maintenance
- Resulting local record: `docs/project-management/tasks.md` (`CAND-004`)
- Next action: Resolve data-model direction before hardening execution.

## DEC-010 - Merge External Documentation Sources Into Local Canonical Records

- Date: 2026-04-26
- Type: merge
- Affected items:
  `Marche-Libre/le-marche-libre`:
  `README.md`,
  `docs/00-cadrage.md`,
  `docs/02-prd.md`,
  `docs/03-questions-equipe.md`,
  `docs/04-warnings.md`,
  `docs/05-roadmap.md`,
  `docs/06-etat-webapp-nextjs.md`
- Decision:
  External framing/current-state content is localized into
  `product-framing.md`, `current-state.md`, `tasks.md`, and
  `verification.md`; external docs are provenance only after import.
- Rationale:
  Removes active dependency on external docs while preserving traceability.
- Reviewer: project-maintenance
- Resulting local record:
  `docs/project-management/external-sources.md`,
  `docs/project-management/product-framing.md`,
  `docs/project-management/current-state.md`,
  `docs/project-management/tasks.md`
- Next action:
  Re-run targeted refresh if external docs change before decommission review.

## DEC-011 - Merge External Issue Backlog Into Local Candidate Parent Tasks

- Date: 2026-04-26
- Type: merge
- Affected items:
  `Marche-Libre/webapp-nextjs#1,#3,#4,#5,#6,#7,#13,#14,#16,#17,#18,#19,#20,#21,#23,#24,#25,#26`,
  `Marche-Libre/le-marche-libre#15,#16,#17`
- Decision:
  Active external issue chains are localized into candidate local task records
  `CAND-006` through `CAND-009`; GitHub issue state is provenance only.
- Rationale:
  Keeps one local status surface and still preserves external issue lineage.
- Reviewer: project-maintenance
- Resulting local record:
  `docs/project-management/tasks.md` (`CAND-006`..`CAND-009`)
- Next action:
  Create implementation tickets from these candidates outside this cleanup.

## DEC-012 - Owner Decision Needed: Org Project 1 Item Export Completeness

- Date: 2026-04-26
- Type: owner-decision-needed
- Affected items:
  `https://github.com/orgs/Marche-Libre/projects/1`,
  `EXT-PROJ-005`
- Decision:
  Owner must provide authenticated export for unmapped Project 1 items before
  final decommission/freeze execution.
- Rationale:
  Project item list is not publicly readable (`404` anonymously), so only
  inferred/mapped items could be localized in this US3 run.
- Reviewer: project-maintenance
- Resulting local record:
  `docs/project-management/external-sources.md` (`EXT-PROJ-005`),
  `docs/project-management/github-project-decommission.md`
- Next action:
  Export full project item list with card identifiers/status values.

## DEC-013 - Discard External Landing-Page Issue From Cleanup Scope

- Date: 2026-04-26
- Type: delete
- Affected items:
  `Marche-Libre/webapp-nextjs#2`
- Decision:
  Treat landing-page issue as non-unique for this stabilization cleanup and do
  not import it as active or candidate runtime work.
- Rationale:
  It is not a release blocker for current cleanup goals and adds no unique
  localization value.
- Reviewer: project-maintenance
- Resulting local record:
  `docs/project-management/external-sources.md` (`EXT-ISSUE-WA-002`)
- Next action:
  Reconsider only if landing scope becomes part of a separate product effort.
