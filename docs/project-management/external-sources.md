# External Source Records

US3 is deferred in this MVP slice. This file defines the record contract and
provenance rules but does not import external GitHub sources yet.

## External Source Record Template

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

## Provenance Fields

- `source_type`: Defines whether the record came from docs, issues, or GitHub
  Project items.
- `source_owner`: Repository or organization/project owner context.
- `source_identifier`: Path, issue number, item ID, or canonical identifier at
  import time.
- `source_url`: Direct source URL when available.
- `import_date`: Date snapshot was captured.
- `imported_value`: Short statement of unique value brought into local records.
- `local_destination`: Canonical local file/record where active value lives.

## Allowed Dispositions

| Disposition | Meaning | Required note |
| --- | --- | --- |
| `imported-active` | Source value became active local context | Destination record |
| `merged` | Source value merged into existing local record | Duplicate/canonical link |
| `archived` | Source retained as historical context | Archive destination |
| `discarded-no-unique-value` | Source had no unique planning value | Short rationale |
| `needs-owner-decision` | Ambiguous/conflicting source value | Decision question + next action |

## US3 Execution Boundary

- Do not import external sources in Phase 1/2/US1/US2.
- Do not treat GitHub issues or Project item status as canonical local status.
- Execute source import and disposition mapping in US3 only.

## Current Snapshot

- Imported records: 0 (US3 not started).
