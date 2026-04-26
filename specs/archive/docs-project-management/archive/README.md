# Project Management Archive Index

This archive is reserved for historical planning material that is no longer
part of the active project-management navigation.

## Archive Categories

| Category | Meaning | Current location |
| --- | --- | --- |
| `merged-task-source` | Historical task/session files whose useful scope, status, and transition value has been captured in canonical Task Records. | `docs/project-management/archive/app-refinement/` |
| `historical-decision-source` | Historical notes that explain why a current decision exists but are not themselves active guidance. | Archive subdirectory named for the source collection. |
| `obsolete-duplicate` | Duplicate planning material with no unique value after merge. | Prefer decision log record; keep a file only when it carries reviewable history. |
| `owner-decision-hold` | Ambiguous historical material that cannot be archived or deleted until an owner resolves the active question. | Keep outside archive until the owner decision is resolved. |

## Retention Rules

- Retain archived planning records that contain task scope, acceptance criteria,
  sequencing notes, risk notes, or decision history for at least the lifetime of
  the active replacement records.
- Do not use archived files as active status boards. Active status belongs in
  `docs/project-management/tasks.md`, active source classification belongs in
  `docs/project-management/current-state.md`, and decisions belong in
  `docs/project-management/decisions.md`.
- Delete only records with no unique project value after the decision log names
  the reviewer, deletion reason, and replacement or no-replacement rationale.
- Keep owner-decision material active or reference-classified until the decision
  is resolved; do not hide unresolved active ambiguity in the archive.

## Active-Navigation Restrictions

- Active navigation may link to this archive index.
- Active navigation must not require contributors to open archived source files
  to determine current scope, task status, external-source disposition, or
  owner decisions.
- Canonical active documents may cite archived files as provenance only when
  they also name the active replacement record.

## Archive Entry Template

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

## Usage Notes

- Active documentation should link to this index, not directly to archived
  source files.
- Archive actions must include a reason and replacement reference.

## ARCH-APPREF-001 - Archived APP_REFINEMENT Task Sources

- Original source: `APP_REFINEMENT/*.md`
- Archive path: `docs/project-management/archive/app-refinement/`
- Archive date: 2026-04-26
- Archive reason:
  Useful task scope, status-token meaning, session sequencing, and discovered
  runtime follow-up value were captured in canonical local Task Records and
  cleanup decisions. The original files are historical provenance, not active
  task status.
- Superseding document:
  `docs/project-management/tasks.md`,
  `docs/project-management/current-state.md`,
  `docs/project-management/decisions.md`
- Contains decision history: yes
- Retention notes:
  Retain while `TASK-APP-00` through `TASK-APP-10`, `CAND-001` through
  `CAND-005`, and related owner decisions remain useful. Replacement references
  are recorded below per source file.

### APP_REFINEMENT Replacement References

| Archived source | Superseding record |
| --- | --- |
| `docs/project-management/archive/app-refinement/TASK_00.STARTED.md` | `docs/project-management/tasks.md` (`TASK-APP-00`), `docs/project-management/decisions.md` (`DEC-006`) |
| `docs/project-management/archive/app-refinement/TASK_00.SESSION_00.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-00`), `docs/project-management/product-framing.md` |
| `docs/project-management/archive/app-refinement/TASK_00.SESSION_01.READY.md` | `docs/project-management/tasks.md` (`TASK-APP-00`), `docs/project-management/decisions.md` (`DEC-006`) |
| `docs/project-management/archive/app-refinement/TASK_00.SESSION_02.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-00`) |
| `docs/project-management/archive/app-refinement/TASK_00.SESSION_03.READY.md` | `docs/project-management/tasks.md` (`TASK-APP-00`), `docs/project-management/decisions.md` (`DEC-006`) |
| `docs/project-management/archive/app-refinement/TASK_00.SESSION_04.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-00`) |
| `docs/project-management/archive/app-refinement/TASK_00.SESSION_05.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-00`) |
| `docs/project-management/archive/app-refinement/TASK_00.SESSION_06.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-00`) |
| `docs/project-management/archive/app-refinement/TASK_00.SESSION_07.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-00`) |
| `docs/project-management/archive/app-refinement/TASK_01.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-01`, `CAND-001`) |
| `docs/project-management/archive/app-refinement/TASK_02.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-02`, `CAND-002`) |
| `docs/project-management/archive/app-refinement/TASK_03.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-03`) |
| `docs/project-management/archive/app-refinement/TASK_04.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-04`, `CAND-003`, `CAND-004`), `docs/project-management/decisions.md` (`DEC-009`) |
| `docs/project-management/archive/app-refinement/TASK_05.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-05`, `CAND-003`, `CAND-004`) |
| `docs/project-management/archive/app-refinement/TASK_06.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-06`, `CAND-001`), `docs/project-management/decisions.md` (`DEC-008`) |
| `docs/project-management/archive/app-refinement/TASK_07.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-07`), `docs/project-management/decisions.md` (`DEC-008`) |
| `docs/project-management/archive/app-refinement/TASK_08.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-08`) |
| `docs/project-management/archive/app-refinement/TASK_09.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-09`) |
| `docs/project-management/archive/app-refinement/TASK_10.TODO.md` | `docs/project-management/tasks.md` (`TASK-APP-10`), `docs/project-management/decisions.md` (`DEC-009`) |
