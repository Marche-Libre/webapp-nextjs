# Feature Specification: Project Management Cleanup

**Feature Branch**: `001-project-management-cleanup`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: User description: "Define a brownfield project-management cleanup feature. Goal: clean up messy project management, planning docs, tasks, issues, and documentation without changing app behavior. The spec should define current problems, target structure, document taxonomy, task/status lifecycle, how GitHub issues should map to local docs, what should be archived, merged, renamed, or deleted, and acceptance criteria for a cleaned-up project state. Updated direction: retire the GitHub Project as the project-management source of truth and localize planning, documentation, tasks, and imported context into this repository. External sources include Marche-Libre/le-marche-libre and Marche-Libre org Project 1, which currently centralizes documentation and app work."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find the Current Source of Truth (Priority: P1)

A project contributor needs to understand the current product scope, cleanup
priorities, and next actionable work without reading every historical task file
or guessing which document is authoritative.

**Why this priority**: The project cannot safely continue stabilization work if
contributors cannot distinguish active plans from stale notes.

**Independent Test**: A contributor unfamiliar with the cleanup can start from
the project entrypoint and identify the active product framing, active cleanup
plan, current task board, imported external-source inventory, and archived
material in under 10 minutes.

**Acceptance Scenarios**:

1. **Given** the repository contains several planning and task documents, **When**
   a contributor opens the project documentation entrypoint, **Then** they see
   one canonical navigation path to active scope, current-state maps, tasks,
   external-source imports, and archives.
2. **Given** two documents appear to describe the same decision or task, **When**
   a contributor checks their classification, **Then** one is clearly marked as
   canonical and the other is merged, archived, or deleted with a recorded
   reason.

---

### User Story 2 - Normalize Tasks and Statuses (Priority: P1)

A project maintainer needs every cleanup task to have one owner-facing status,
one priority, one scope, and clear completion criteria, instead of statuses being
implied by filenames or scattered session notes.

**Why this priority**: Task ambiguity causes duplicate work, incorrect sequencing,
and accidental product changes during cleanup.

**Independent Test**: A maintainer can review the task inventory and determine
which items are proposed, ready, in progress, blocked, done, or archived without
opening unrelated documents.

**Acceptance Scenarios**:

1. **Given** a task currently exists as multiple session files, **When** the
   cleanup is complete, **Then** the active task has a single canonical record
   and historical session details are merged or archived.
2. **Given** a task changes status, **When** the status is updated, **Then** the
   task record includes the new status, date, reason, and next expected action.

---

### User Story 3 - Localize External GitHub Sources (Priority: P2)

A maintainer needs planning context from the external documentation repository,
GitHub issues, and the org GitHub Project imported into this repository so local
files become the only active project-management source of truth.

**Why this priority**: README.md identifies the GitHub backlog as not yet
representative of the real code and planning state, and current planning is
spread across multiple GitHub locations.

**Independent Test**: For every relevant external document, issue, or project
item, a maintainer can identify whether it was imported, merged, archived,
discarded, or left as an explicit owner decision.

**Acceptance Scenarios**:

1. **Given** a GitHub Project item or external documentation file contains
   active project-management value, **When** the cleanup is complete, **Then**
   its useful content exists in a canonical local document with a source
   reference.
2. **Given** the org GitHub Project previously served as the centralized board,
   **When** the cleanup is complete, **Then** the local repository contains the
   active task/status system and the GitHub Project is marked retired, frozen,
   or ready for deletion with a local replacement reference.
3. **Given** a GitHub issue duplicates a local task or imported decision, **When**
   the cleanup is complete, **Then** the local record identifies the canonical
   local task and records the external issue only as provenance.

---

### User Story 4 - Archive Without Losing History (Priority: P3)

A future contributor needs historical planning context to remain available
without polluting the active planning surface.

**Why this priority**: The current cleanup must reduce noise while preserving
decision history that may explain product and security constraints.

**Independent Test**: A contributor can locate archived planning records and
understand why they were archived, while active navigation shows only current
materials.

**Acceptance Scenarios**:

1. **Given** a document is outdated but contains useful decision history, **When**
   it is removed from the active planning surface, **Then** it is moved to an
   archive category with a short reason and replacement reference.
2. **Given** a document contains no unique project value, **When** cleanup is
   complete, **Then** it is deleted or marked for deletion with the reason
   recorded in the cleanup log.

---

### Edge Cases

- A document contains both current decisions and stale execution notes.
- Multiple task files use contradictory statuses for the same work.
- A GitHub Project item is valid but broader than any single local task.
- A GitHub issue contains useful acceptance criteria but should not remain an
  active tracker after localization.
- An external documentation file conflicts with a newer local decision.
- An archived document is referenced by an active document.
- A document name implies an obsolete status that no longer matches its content.
- A cleanup action would require changing app behavior; the action must be
  rejected or moved to a separate product-change feature.

## Requirements *(mandatory)*

### Current Problems

- Active planning context is split across multiple root documents and
  APP_REFINEMENT task/session files.
- Some file names encode status, but status is not consistently represented as
  a reviewable field inside the work item.
- Session notes, task definitions, decisions, and completion evidence are mixed
  together, making it hard to know what is still actionable.
- README.md states that GitHub issues are not yet representative of the real
  project state.
- Product and planning documentation is also spread across the external
  `Marche-Libre/le-marche-libre` repository.
- The org GitHub Project currently centralizes items from both the documentation
  project and this app project, making it an external board dependency.
- There is no single cleaned-state inventory showing active, merged, archived,
  deleted, and unresolved planning artifacts.
- There is no explicit rule for when to archive historical context versus merge,
  rename, or delete it.

### Target Structure

The cleaned project state MUST expose these top-level information areas through
one project-management entrypoint:

- **Start Here**: canonical navigation for scope, task status, external-source
  migration status, and archive.
- **Product Framing**: active product and beta-scope decisions that guide work.
- **Current-State Maps**: observed app, data, and operational state documents.
- **Feature Specs and Plans**: Spec Kit feature artifacts for future work.
- **Task Inventory**: active work items with lifecycle status and completion
  criteria.
- **External Source Inventory**: imported documents, GitHub issues, and GitHub
  Project items with their local disposition.
- **Decision Log**: important product, sequencing, cleanup, and archival
  decisions.
- **Verification Records**: evidence that cleanup acceptance criteria were met.
- **Archive**: historical material retained outside the active planning surface.

### Document Taxonomy

Each in-scope document MUST be assigned exactly one primary category:

- **Active**: currently authoritative for a topic or task.
- **Reference**: useful context, but not the authoritative source for active
  work.
- **Merged**: content has been incorporated into a canonical document.
- **Archived**: retained for history, no longer active.
- **Deleted**: contains no unique project value and is removed or marked for
  removal.
- **Needs owner decision**: requires a maintainer decision before final
  classification.

### Task and Status Lifecycle

Tasks MUST use a single lifecycle status:

- **Proposed**: captured but not yet ready for execution.
- **Ready**: scoped, sequenced, and clear enough to execute.
- **In progress**: actively being worked.
- **Blocked**: cannot proceed until a named decision, dependency, or external
  condition is resolved.
- **Done**: completion criteria have been met and reviewed.
- **Archived**: no longer active, retained only for history or traceability.

Allowed transitions MUST preserve reviewability: proposed to ready, ready to in
progress, in progress to blocked or done, blocked to ready or in progress, and
any non-active status to archived with a reason.

### External Source Migration Rules

- External documentation, GitHub issues, and GitHub Project items MUST be treated
  as migration sources, not future sources of truth.
- Every imported external source MUST retain provenance: source repository or
  project, item title, URL or identifier, import date, and final local
  disposition.
- Active local work MUST be represented by local task records, not by GitHub
  Project status.
- A broad external issue or project item MAY become a local parent task, but its
  active subtasks MUST be represented locally.
- Duplicate external items MUST identify the canonical local task, decision, or
  archive record.
- After migration, the GitHub Project MUST be decommissioned. If deletion is
  delayed by access or owner decision, it MUST be frozen with a pointer to the
  local project-management entrypoint and tracked locally as pending deletion.
- GitHub issues MAY remain as historical links or code-hosting references, but
  they MUST NOT be required to understand active planning status.

### Cleanup Action Rules

- **Archive** when material has historical or decision value but is no longer
  active.
- **Merge** when two or more documents describe the same active topic and one
  canonical source can retain the useful content.
- **Rename** when a document remains active but its name implies the wrong
  category, status, or scope.
- **Delete** only when the material has no unique decision, context, acceptance,
  or traceability value.
- **Needs owner decision** when the cleanup action would change scope, remove a
  potentially important decision, or conflict with external product framing.

### Functional Requirements

- **FR-001**: The project MUST have one documented entrypoint for active project
  management materials.
- **FR-002**: The cleanup MUST classify every planning, task, external-source,
  and project-status document as one of: active, reference, merged, archived,
  deleted, or needs owner decision.
- **FR-003**: The cleanup MUST define a document taxonomy with at least these
  categories: product framing, current-state maps, feature specifications,
  implementation plans, task inventory, external source inventory, decisions,
  verification records, and archive.
- **FR-004**: The cleanup MUST identify one canonical document for each active
  topic and remove ambiguity from duplicate or overlapping documents.
- **FR-005**: The cleanup MUST define a task lifecycle with these statuses:
  proposed, ready, in progress, blocked, done, and archived.
- **FR-006**: Each active task MUST include a title, purpose, priority, status,
  scope boundary, completion criteria, related local documents, external-source
  provenance when relevant, and last reviewed date.
- **FR-007**: Status transitions MUST record the date, reason, and next expected
  action.
- **FR-008**: Every in-scope external document, GitHub issue, and GitHub Project
  item MUST map to a local disposition: imported as active, merged into an active
  document, archived as historical context, discarded as no unique value, or
  needs owner decision.
- **FR-009**: The org GitHub Project MUST be removed as an active dependency by
  the end of cleanup. The target outcome is deletion; if deletion is delayed, a
  local decommission record MUST identify the blocker, replacement pointer, and
  next action.
- **FR-010**: The cleanup MUST define when a document should be archived, merged,
  renamed, or deleted.
- **FR-011**: The cleanup MUST preserve decision history when deleting or merging
  documents would otherwise remove the reason for a product, security, or
  sequencing decision.
- **FR-012**: The cleanup MUST produce a final cleaned-state inventory that lists
  active documents, archived documents, deleted documents, unresolved owner
  decisions, and external-source migration status.
- **FR-013**: The cleanup MUST NOT require or introduce any change to app routes,
  database behavior, user interface behavior, user permissions, or product scope.
- **FR-014**: Any discovered app-behavior or product-scope problem MUST be
  recorded as a separate candidate feature or issue rather than handled inside
  this cleanup.
- **FR-015**: External GitHub sources MUST NOT remain required reading for active
  project planning after their content has been localized.
- **FR-016**: The cleanup MUST define acceptance criteria that a reviewer can
  apply without knowing prior planning history.

### Key Entities *(include if feature involves data)*

- **Project Document**: A local planning, status, task, decision, verification,
  or reference file. Key attributes include title, category, canonical status,
  lifecycle status when applicable, owner decision state, replacement reference,
  and last reviewed date.
- **Task Record**: A work item represented locally. Key attributes include
  priority, lifecycle status, scope, completion criteria, dependencies, related
  documents, and external-source provenance.
- **External Source Record**: A migrated source from the documentation repo,
  GitHub issue, or GitHub Project. Key attributes include source location, title,
  imported value, canonical local destination, disposition, and import date.
- **Archive Record**: A retained historical item. Key attributes include archive
  reason, date, superseding document, and whether it contains decision history.
- **Cleanup Decision**: A recorded decision to keep, merge, rename, archive, or
  delete a document or external item. Key attributes include rationale, date,
  affected items, and reviewer.

## Brownfield Context *(mandatory)*

- **Current behavior**: The repo contains active project context in README.md,
  AGENTS.md, app_flow.md, db_flow.md, the Spec Kit constitution, and a set of
  APP_REFINEMENT task/session files. README.md states that the GitHub backlog is
  not yet representative of the real code state. Several task files encode
  status in filenames such as TODO, READY, and STARTED, while session files also
  carry task state and decision history. External planning context also exists
  in `Marche-Libre/le-marche-libre`, observed with README.md and docs files from
  `docs/00-cadrage.md` through `docs/06-etat-webapp-nextjs.md`. The org GitHub
  Project 1 was observed with 26 items across the documentation repo and the app
  repo, including product framing, governance, MVP scope, user stories, parent
  implementation issues, and subtask issues.
- **Affected surface**: Project-management documentation, local planning files,
  task/session files, external documentation imports, GitHub issue/project
  imports, archive conventions, and reviewer acceptance criteria. No app routes,
  components, database objects, permissions, or runtime behavior are in scope.
- **Compatibility risks**: Important decisions may be lost if task files are
  deleted instead of archived or merged. Active task order may become ambiguous
  if statuses are renamed without a transition rule. External GitHub sources may
  become misleading if they remain active after local replacements exist.
- **Out of scope**: Product refocus implementation, route changes, schema/RLS
  changes, UI cleanup, code deletion, dependency changes, test repair, and any
  runtime behavior modification. This feature may define retiring the GitHub
  Project, but it does not perform product implementation work from project
  items.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A contributor unfamiliar with the project can identify the active
  project scope, task inventory, external-source inventory, and archive location
  in under 10 minutes.
- **SC-002**: 100% of in-scope planning and task documents are classified as
  active, reference, merged, archived, deleted, or needs owner decision.
- **SC-003**: 100% of active tasks have a lifecycle status, completion criteria,
  related local documents, and external-source provenance when relevant.
- **SC-004**: 0 active topics have more than one unmarked canonical document.
- **SC-005**: 100% of archived documents include an archive reason and replacement
  reference when a replacement exists.
- **SC-006**: 100% of in-scope external documentation files, GitHub issues, and
  GitHub Project items have a local disposition.
- **SC-007**: Reviewers can verify that no app behavior change was made as part
  of the cleanup.
- **SC-008**: No unresolved owner-decision item remains without a named decision
  question and recommended next action.
- **SC-009**: No active project-management workflow depends on the org GitHub
  Project after localization.

## Assumptions

- The cleanup covers project-management and planning artifacts in this repo plus
  external planning context from `Marche-Libre/le-marche-libre`, GitHub issues,
  and the org GitHub Project.
- This repo becomes the canonical planning and execution source for the app
  after localization.
- Local documents remain acceptable as canonical references when they describe
  repo-specific current state or cleanup execution.
- Historical context should be preserved when it explains a decision, risk,
  sequencing constraint, or rejected option.
- The default action for unclear historical material is archive with a reason,
  not deletion.
- A GitHub issue or project item may be retained as provenance, but not as the
  required active status record for local work.
