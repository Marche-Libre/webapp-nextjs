# Contract: Local Project Management Documents

These contracts define the required shape of the local replacement documents.
They are markdown contracts for reviewers and future tasks, not application APIs.

## Entrypoint Contract

**Path**: `docs/project-management/README.md`

Must include:
- Active product/project scope pointer.
- Link to current task inventory.
- Link to external-source inventory.
- Link to decision log.
- Link to verification records.
- Link to archive index.
- Statement that the GitHub Project is no longer the active source of truth once
  decommission review passes.
- Last reviewed date.

Must not include:
- Active task status that is not also represented in `tasks.md`.
- Required links to external GitHub sources as active planning dependencies.

## Task Inventory Contract

**Path**: `docs/project-management/tasks.md`

Each task record must use this shape:

```markdown
## TASK-ID - Title

- Priority: P0 | P1 | P2 | P3
- Status: proposed | ready | in-progress | blocked | done | archived
- Purpose:
- Scope:
- Out of scope:
- Completion criteria:
- Related local documents:
- External provenance:
- Dependencies:
- Last reviewed: YYYY-MM-DD
- Next action:

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
```

Rules:
- One task, one status.
- Status must not be inferred only from filename.
- External issue/project links are provenance only.
- Product or app-behavior implementation work discovered during cleanup must be
  recorded as a separate candidate task, not executed inside this feature.

## External Source Inventory Contract

**Path**: `docs/project-management/external-sources.md`

Each external source record must use this shape:

```markdown
## EXT-ID - Source title

- Source type: external-doc | github-issue | github-project-item
- Source owner:
- Source identifier:
- Source URL:
- Import date: YYYY-MM-DD
- Imported value:
- Local destination:
- Disposition: imported-active | merged | archived | discarded-no-unique-value | needs-owner-decision
- Duplicate of:
- Review notes:
- Next action:
```

Rules:
- Every relevant external source has exactly one disposition.
- `discarded-no-unique-value` requires a short reason.
- `needs-owner-decision` requires a named question and recommended next action.
- No active local status may depend on the GitHub Project after decommission
  review.

## Decision Log Contract

**Path**: `docs/project-management/decisions.md`

Each decision must use this shape:

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

Rules:
- Merge/archive/delete decisions must identify the replacement or reason no
  replacement exists.
- Delayed GitHub Project deletion must identify blocker, replacement pointer,
  and next action.
- Decisions that change app behavior are out of scope for this cleanup.

## Archive Index Contract

**Path**: `docs/project-management/archive/README.md`

Each archive entry must use this shape:

```markdown
## ARCHIVE-ID - Archived title

- Original source:
- Archive path:
- Archive date: YYYY-MM-DD
- Archive reason:
- Superseding document:
- Contains decision history: yes | no
- Retention notes:
```

Rules:
- Active navigation may link to archive indexes, but active work cannot require
  reading archived records.
- Archived items that explain active decisions must link back to the active
  decision or canonical document.

## Verification Contract

**Path**: `docs/project-management/verification.md`

Each verification record must use this shape:

```markdown
## VERIFY-ID - Review title

- Date: YYYY-MM-DD
- Reviewer:
- Local document coverage:
- External source coverage:
- Task status coverage:
- Duplicate canonical topics:
- Archive reason coverage:
- GitHub Project dependency check:
- Runtime diff check:
- Quality gate record:
- Open owner decisions:
- Result: passed | passed-with-owner-decisions | failed
```

Rules:
- Passing review requires 100% classification coverage for in-scope documents
  and external sources.
- Passing review requires zero unmarked duplicate canonical active topics.
- Passing review requires no active workflow dependency on the org GitHub
  Project.
- Runtime diff check must confirm that app routes, components, database files,
  permissions, and product behavior were not changed by the cleanup.

## GitHub Project Decommission Contract

**Path**: `docs/project-management/github-project-decommission.md`

Must include:
- GitHub Project name/URL or identifier.
- Local replacement entrypoint.
- Date local replacement was reviewed.
- Disposition coverage summary for Project items.
- Freeze action, deletion action, or deletion blocker.
- Owner responsible for final deletion if delayed.
- Next action and due/review date if delayed.

Rules:
- The target outcome is deletion after local replacement review.
- If deletion is delayed, the project must be frozen with a pointer to
  `docs/project-management/README.md`.
- No local task may use GitHub Project status as its active status.
