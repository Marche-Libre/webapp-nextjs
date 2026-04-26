# Data Model: Project Management Cleanup

This model describes local markdown records, not database tables.

## Project Document

Represents a local planning, status, task, decision, verification, archive, or
reference file.

**Fields**
- `id`: Stable local identifier, normally the relative path.
- `title`: Human-readable document title.
- `primary_category`: One of `product-framing`, `current-state-map`,
  `feature-spec`, `implementation-plan`, `task-inventory`, `external-source`,
  `decision-log`, `verification-record`, `archive`, or `reference`.
- `classification`: One of `active`, `reference`, `merged`, `archived`,
  `deleted`, or `needs-owner-decision`.
- `canonical_for`: Topic or task for which this document is authoritative, if
  any.
- `replacement_reference`: Local path to the canonical replacement when merged,
  archived, renamed, or deleted.
- `archive_reason`: Required when `classification` is `archived`.
- `deletion_reason`: Required when `classification` is `deleted`.
- `last_reviewed`: Date of last classification review.
- `reviewer`: Person or role that made or reviewed the classification.
- `notes`: Short rationale or migration note.

**Relationships**
- May reference many `Task Record` entries.
- May be superseded by one canonical `Project Document`.
- May be provenance for one or more `Cleanup Decision` entries.

**Validation Rules**
- Every in-scope document has exactly one `classification`.
- `active` documents must identify what they are canonical for.
- `merged`, `archived`, and `deleted` documents must record a reason.
- `needs-owner-decision` documents must record the decision question and next
  action.

## Task Record

Represents one active or historical work item tracked locally.

**Fields**
- `id`: Stable local task identifier.
- `title`: Task title.
- `purpose`: Why the work exists.
- `priority`: `P0`, `P1`, `P2`, or `P3`.
- `status`: One of `proposed`, `ready`, `in-progress`, `blocked`, `done`, or
  `archived`.
- `scope_boundary`: What is included and explicitly excluded.
- `completion_criteria`: Reviewable checklist or acceptance criteria.
- `dependencies`: Local task/document IDs or owner decisions that block work.
- `related_documents`: Local paths for specs, plans, maps, decisions, or archive
  records.
- `external_provenance`: External source IDs if imported from docs/issues/project
  items.
- `last_reviewed`: Date of last task review.
- `next_action`: Expected next action.
- `transition_history`: Dated status changes with reason and actor/reviewer.

**Relationships**
- May be derived from many `External Source Record` entries.
- May produce one or more `Cleanup Decision` entries.
- May point to verification evidence in `Verification Record`.

**State Transitions**
- `proposed` -> `ready`
- `ready` -> `in-progress`
- `in-progress` -> `blocked`
- `in-progress` -> `done`
- `blocked` -> `ready`
- `blocked` -> `in-progress`
- Any non-active or obsolete item -> `archived` with reason

**Validation Rules**
- Each active task has one status, one priority, one scope boundary, completion
  criteria, related local documents, and last reviewed date.
- Every status transition records date, reason, and next action.
- External source links may be provenance but not the active status record.

## External Source Record

Represents an imported source from `Marche-Libre/le-marche-libre`, a GitHub
issue, or org GitHub Project 1.

**Fields**
- `id`: Stable local import identifier.
- `source_type`: `external-doc`, `github-issue`, or `github-project-item`.
- `source_owner`: Repository, organization project, or source collection.
- `source_identifier`: Path, issue number, project item ID, URL, or export ID.
- `title`: Source title at import time.
- `import_date`: Date imported or refreshed.
- `imported_value`: Short summary of useful planning value.
- `canonical_local_destination`: Local task, decision, project document, archive
  record, or owner-decision record.
- `disposition`: One of `imported-active`, `merged`, `archived`,
  `discarded-no-unique-value`, or `needs-owner-decision`.
- `duplicate_of`: Canonical local record when the source duplicates local work.
- `review_notes`: Rationale for disposition.

**Relationships**
- May map to one `Task Record`, `Project Document`, `Archive Record`, or
  `Cleanup Decision`.
- May be grouped under a broad parent task if the external item is larger than a
  single local task.

**Validation Rules**
- Every relevant external source receives exactly one disposition.
- `discarded-no-unique-value` requires a rationale.
- `needs-owner-decision` requires a named decision question and recommended next
  action.
- The GitHub Project cannot remain the canonical destination for any active
  task.

## Archive Record

Represents historical material retained outside the active planning surface.

**Fields**
- `id`: Stable archive identifier.
- `source_path_or_id`: Original local path or external source ID.
- `archive_path`: Local archive location.
- `archive_date`: Date archived.
- `archive_reason`: Why the item is no longer active.
- `superseding_document`: Local replacement path, if any.
- `contains_decision_history`: Boolean.
- `retention_notes`: Notes for future contributors.

**Validation Rules**
- Archive records must be discoverable from the archive index.
- Archived items with replacements must link to the replacement.
- Active navigation must not require reading archived records.

## Cleanup Decision

Represents a reviewable decision to keep, merge, rename, archive, delete, freeze,
or decommission a project-management source.

**Fields**
- `id`: Stable decision identifier.
- `date`: Decision date.
- `decision_type`: `keep`, `merge`, `rename`, `archive`, `delete`, `freeze`,
  `decommission`, or `owner-decision-needed`.
- `affected_items`: Local paths or external source IDs.
- `rationale`: Reason for the decision.
- `reviewer`: Maintainer or role that reviewed the decision.
- `resulting_record`: Local task, document, archive record, or external-source
  record created/updated by the decision.
- `next_action`: Required for pending owner decisions or delayed deletion.

**Validation Rules**
- Decisions that remove active surfaces must name the local replacement.
- Decisions that delay GitHub Project deletion must name the blocker and next
  action.
- Decisions that would change product or app behavior are out of scope and must
  create a separate candidate feature/task.

## Verification Record

Represents evidence that the cleaned state satisfies acceptance criteria.

**Fields**
- `id`: Stable verification identifier.
- `date`: Verification date.
- `reviewer`: Person or role performing review.
- `coverage_summary`: Counts of active/reference/merged/archived/deleted/owner
  decision items.
- `external_source_summary`: Counts by source type and disposition.
- `task_summary`: Counts by lifecycle status and priority.
- `no_runtime_change_check`: Statement of checked diffs and result.
- `quality_gate_record`: Results or explicit skip rationale for `bun run build`,
  `bun run lint`, and `bunx vitest run`.
- `open_owner_decisions`: Remaining questions and next actions.
- `review_result`: `passed`, `passed-with-owner-decisions`, or `failed`.

**Validation Rules**
- Verification cannot pass while an active topic has multiple unmarked canonical
  documents.
- Verification cannot pass while the GitHub Project is still required for active
  workflow status.
- Any unresolved owner decision must have a named question and next action.
