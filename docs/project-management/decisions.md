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
