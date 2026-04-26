# Research: Project Management Cleanup

## Decision: Local repo becomes the sole active project-management source

**Rationale**: The spec requires localizing planning, tasks, external source
context, and GitHub Project items into this repository. A local source of truth
reduces ambiguity for contributors and keeps project-management history reviewed
through the same repo workflow as code and specs.

**Alternatives considered**:
- Keep GitHub Project as the board: rejected because the spec requires removing
  it as an active dependency.
- Keep the documentation repo as canonical framing: rejected because app work
  needs one local entrypoint after migration.
- Use GitHub issues as the task system: rejected because README says the backlog
  is not representative of the real code/planning state.

## Decision: Use markdown inventories instead of a new database or app surface

**Rationale**: This feature is documentation/process cleanup only. Markdown
files are reviewable, diffable, easy to link from `README.md` and `AGENTS.md`,
and do not introduce runtime behavior or operational dependencies.

**Alternatives considered**:
- Build an internal admin/project-management UI: rejected as product expansion
  and runtime surface change.
- Store task state in Supabase: rejected because it would create schema/RLS work
  outside the cleanup scope.
- Use a separate SaaS tracker: rejected because it preserves an external source
  of truth instead of localizing it.

## Decision: Create one `docs/project-management/README.md` entrypoint

**Rationale**: The spec's first user story requires a contributor to find active
scope, task status, external-source migration status, and archive location from
one starting point. A dedicated entrypoint can index existing root docs,
current-state maps, Spec Kit artifacts, tasks, decisions, verification, and
archive records without moving every source immediately.

**Alternatives considered**:
- Use root `README.md` as the full project-management entrypoint: rejected
  because README also serves product/setup readers and would become overloaded.
- Use `APP_REFINEMENT/` as the entrypoint: rejected because that directory is
  itself part of the messy source material to classify.
- Use only `specs/001-project-management-cleanup/`: rejected because long-term
  project management should outlive this feature spec.

## Decision: Treat external docs/issues/Project items as source records

**Rationale**: External items may contain active product framing, acceptance
criteria, parent issues, and implementation subtasks. Each imported item needs
  provenance, local disposition, and a canonical local destination so external
  links become history rather than required reading.

**Alternatives considered**:
- Copy external content wholesale into one archive file: rejected because it
  would not show active/merged/discarded disposition.
- Leave external items linked only from GitHub: rejected because contributors
  would still need external sources to understand active planning.
- Delete/close everything immediately: rejected because useful decision history
  and owner decisions could be lost.

## Decision: Freeze before deleting the GitHub Project

**Rationale**: Deleting the org GitHub Project is the target outcome, but only
after reviewers confirm the local replacement has full task/status coverage,
external-source disposition coverage, and a replacement pointer. If access,
ownership, or review timing blocks deletion, freezing the project with a pointer
to the local entrypoint satisfies decommissioning without losing traceability.

**Alternatives considered**:
- Delete the Project as soon as local files exist: rejected because reviewers
  need to verify the replacement first.
- Keep the Project permanently as read-only history: rejected because the spec
  sets deletion as the target and requires no active workflow dependency.
- Keep syncing local docs and GitHub Project: rejected because it creates two
  competing sources of truth.

## Decision: Default unclear historical material to archive, not deletion

**Rationale**: The brownfield risk is losing decisions that explain product,
security, or sequencing constraints. Archiving with a reason and replacement
reference preserves context while removing it from the active planning surface.

**Alternatives considered**:
- Delete stale files aggressively: rejected because stale execution notes can
  still contain useful decision history.
- Leave mixed current/stale documents active: rejected because it fails the
  source-of-truth and duplicate-canonical requirements.
- Mark everything as reference: rejected because active tasks and canonical
  decisions need stronger classification.

## Decision: Use explicit lifecycle transitions for local tasks

**Rationale**: Current filenames encode statuses such as TODO, READY, and
STARTED, but contributors need status, priority, scope, criteria, and transition
history inside the canonical record. The spec-defined lifecycle creates a single
reviewable status per task.

**Alternatives considered**:
- Preserve filename-derived status only: rejected because filenames drift from
  content and cannot record transition reasons.
- Use GitHub issue statuses: rejected because active status must be local.
- Use a free-form notes field: rejected because it would not provide a
  consistent board for review.

## Decision: Verification focuses on documentation completeness and no runtime diff

**Rationale**: The feature must not change app behavior. Acceptance is proven by
classification coverage, task field completeness, external-source dispositions,
decommission readiness, archive reasons, and a reviewable record that runtime
files were not changed.

**Alternatives considered**:
- Require app test suite success as the primary gate: rejected because this docs
  cleanup cannot repair known baseline lint/test failures and should not mask
  documentation completeness.
- Skip quality commands entirely without a record: rejected because the
  constitution requires expected gate handling to be documented.
- Treat docs-only diffs as automatically safe: rejected because root guidance
  changes can still mislead future contributors if not reviewed.
