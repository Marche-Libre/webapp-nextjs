# External Source Records

This file localizes external planning sources for US3.

## Import Snapshot Metadata

- Import date: 2026-04-26
- Docs repo fetch method:
  `git clone --depth 1 git@github.com:Marche-Libre/le-marche-libre.git /tmp/le-marche-libre`
- Docs repo snapshot: `d0548a16ec55e6f16ded6a309d09706bb9b3c2ab` (`2026-04-24 16:46:39 +0200`)
- Webapp issue fetch method:
  `GET https://api.github.com/repos/Marche-Libre/webapp-nextjs/issues?state=all&per_page=100`
- Org Project access check:
  `https://github.com/orgs/Marche-Libre/projects/1` returned `404` for anonymous HTTP;
  item details are partially inferred from linked issue records and prior spec snapshot.

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

## Imported Documentation Sources (Marche-Libre/le-marche-libre)

## EXT-DOC-001 - le-marche-libre README index

- Source type: external-doc
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `README.md @ d0548a16ec55e6f16ded6a309d09706bb9b3c2ab`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/blob/main/README.md`
- Import date: 2026-04-26
- Imported value: Defines the external document set and role split between product repo and framing repo.
- Local destination: `docs/project-management/product-framing.md`
- Disposition: merged
- Duplicate of: `docs/project-management/product-framing.md`
- Review notes: Index value localized into canonical local framing pointers.
- Next action: none

## EXT-DOC-002 - Cadrage realignment (`00-cadrage.md`)

- Source type: external-doc
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `docs/00-cadrage.md @ d0548a16ec55e6f16ded6a309d09706bb9b3c2ab`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/blob/main/docs/00-cadrage.md`
- Import date: 2026-04-26
- Imported value: Confirms stabilization-first strategy, ownership model, and backlog realignment flow.
- Local destination: `docs/project-management/product-framing.md`
- Disposition: merged
- Duplicate of: `docs/project-management/product-framing.md`
- Review notes: Scope and governance statements merged into local canonical framing.
- Next action: none

## EXT-DOC-003 - Diagnostic SWOT (`01-diagnostic.md`)

- Source type: external-doc
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `docs/01-diagnostic.md @ d0548a16ec55e6f16ded6a309d09706bb9b3c2ab`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/blob/main/docs/01-diagnostic.md`
- Import date: 2026-04-26
- Imported value: High-level SWOT framing for team context.
- Local destination: `docs/project-management/decisions.md`
- Disposition: discarded-no-unique-value
- Duplicate of: `docs/project-management/product-framing.md`
- Review notes: No unique actionable cleanup signal beyond already localized framing/risk records.
- Next action: none

## EXT-DOC-004 - PRD beta scope (`02-prd.md`)

- Source type: external-doc
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `docs/02-prd.md @ d0548a16ec55e6f16ded6a309d09706bb9b3c2ab`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/blob/main/docs/02-prd.md`
- Import date: 2026-04-26
- Imported value: Canonical beta scope split (`must-have`, tolerated, out-of-scope) and acceptance framing.
- Local destination: `docs/project-management/product-framing.md`
- Disposition: merged
- Duplicate of: `docs/project-management/product-framing.md`
- Review notes: Scope value merged into local beta framing and candidate task grouping.
- Next action: none

## EXT-DOC-005 - Team decision questions (`03-questions-equipe.md`)

- Source type: external-doc
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `docs/03-questions-equipe.md @ d0548a16ec55e6f16ded6a309d09706bb9b3c2ab`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/blob/main/docs/03-questions-equipe.md`
- Import date: 2026-04-26
- Imported value: Owner-decision backlog (scope, ownership, access, go/no-go criteria).
- Local destination: `docs/project-management/decisions.md`
- Disposition: merged
- Duplicate of: `docs/project-management/decisions.md`
- Review notes: Questions localized as owner-decision records and next actions.
- Next action: none

## EXT-DOC-006 - Risk register (`04-warnings.md`)

- Source type: external-doc
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `docs/04-warnings.md @ d0548a16ec55e6f16ded6a309d09706bb9b3c2ab`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/blob/main/docs/04-warnings.md`
- Import date: 2026-04-26
- Imported value: Critical risks tied to onboarding blocker, schema reproducibility, and quality gates.
- Local destination: `docs/project-management/tasks.md`
- Disposition: merged
- Duplicate of: `docs/project-management/tasks.md`
- Review notes: Runtime/product risks converted to candidate external-origin task records.
- Next action: none

## EXT-DOC-007 - Roadmap phases (`05-roadmap.md`)

- Source type: external-doc
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `docs/05-roadmap.md @ d0548a16ec55e6f16ded6a309d09706bb9b3c2ab`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/blob/main/docs/05-roadmap.md`
- Import date: 2026-04-26
- Imported value: Stabilization sequencing and referenced MVP issue sets.
- Local destination: `docs/project-management/product-framing.md`
- Disposition: merged
- Duplicate of: `docs/project-management/product-framing.md`
- Review notes: Sequence localized; active statuses remain local-only.
- Next action: none

## EXT-DOC-008 - Observed webapp state (`06-etat-webapp-nextjs.md`)

- Source type: external-doc
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `docs/06-etat-webapp-nextjs.md @ d0548a16ec55e6f16ded6a309d09706bb9b3c2ab`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/blob/main/docs/06-etat-webapp-nextjs.md`
- Import date: 2026-04-26
- Imported value: Concrete runtime drift observations, quality-gate signals, and backlog mismatch notes.
- Local destination: `docs/project-management/current-state.md`
- Disposition: imported-active
- Duplicate of: none
- Review notes: Observation set preserved in local current-state map with provenance.
- Next action: re-check against latest app state during future runtime planning.

## Imported GitHub Issues (Marche-Libre/le-marche-libre)

## EXT-ISSUE-LM-015 - Story anchor `#15` (channels/messages)

- Source type: github-issue
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `#15`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/issues/15`
- Import date: 2026-04-26
- Imported value: Story reference used by webapp parent/subtask issue chain for channels/messages.
- Local destination: `docs/project-management/tasks.md` (`CAND-008`)
- Disposition: merged
- Duplicate of: `CAND-008`
- Review notes: Title/state inferred from linked webapp issue bodies; direct issue API inaccessible anonymously.
- Next action: capture direct issue state when owner-authenticated export is available.

## EXT-ISSUE-LM-016 - Story anchor `#16` (admission)

- Source type: github-issue
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `#16`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/issues/16`
- Import date: 2026-04-26
- Imported value: Story reference used by webapp admission parent/subtask issue chain.
- Local destination: `docs/project-management/tasks.md` (`CAND-006`)
- Disposition: merged
- Duplicate of: `CAND-006`
- Review notes: Story mapping captured through webapp issue provenance links.
- Next action: capture direct issue state when owner-authenticated export is available.

## EXT-ISSUE-LM-017 - Story anchor `#17` (profile/search)

- Source type: github-issue
- Source owner: Marche-Libre/le-marche-libre
- Source identifier: `#17`
- Source URL: `https://github.com/Marche-Libre/le-marche-libre/issues/17`
- Import date: 2026-04-26
- Imported value: Story reference used by webapp profile/search parent/subtask issue chain.
- Local destination: `docs/project-management/tasks.md` (`CAND-007`)
- Disposition: merged
- Duplicate of: `CAND-007`
- Review notes: Story mapping captured through webapp issue provenance links.
- Next action: capture direct issue state when owner-authenticated export is available.

## Imported GitHub Issues (Marche-Libre/webapp-nextjs)

## EXT-ISSUE-WA-001 - Onboarding finalization bug (`#1`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#1`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/1`
- Import date: 2026-04-26
- Imported value: Open release blocker on onboarding finalization (`500` loop report).
- Local destination: `docs/project-management/tasks.md` (`CAND-009`)
- Disposition: imported-active
- Duplicate of: none
- Review notes: API state at import: `open`.
- Next action: track as external-origin runtime blocker candidate only.

## EXT-ISSUE-WA-002 - Landing Page (`#2`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#2`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/2`
- Import date: 2026-04-26
- Imported value: Landing-page enhancement request.
- Local destination: `docs/project-management/decisions.md`
- Disposition: discarded-no-unique-value
- Duplicate of: `docs/project-management/product-framing.md`
- Review notes: Not a stabilization blocker for this cleanup scope.
- Next action: none

## EXT-ISSUE-WA-003 - MVP parent: admission (`#3`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#3`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/3`
- Import date: 2026-04-26
- Imported value: Parent issue for admission MVP with explicit subtask set.
- Local destination: `docs/project-management/tasks.md` (`CAND-006`)
- Disposition: imported-active
- Duplicate of: none
- Review notes: API state at import: `open`.
- Next action: keep local status in candidate task record only.

## EXT-ISSUE-WA-004 - MVP parent: channels/messages (`#4`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#4`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/4`
- Import date: 2026-04-26
- Imported value: Parent issue for channels/messages MVP with explicit subtask set.
- Local destination: `docs/project-management/tasks.md` (`CAND-008`)
- Disposition: imported-active
- Duplicate of: none
- Review notes: API state at import: `open`.
- Next action: keep local status in candidate task record only.

## EXT-ISSUE-WA-005 - MVP parent: profile/search (`#5`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#5`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/5`
- Import date: 2026-04-26
- Imported value: Parent issue for profile/search MVP with explicit subtask set.
- Local destination: `docs/project-management/tasks.md` (`CAND-007`)
- Disposition: imported-active
- Duplicate of: none
- Review notes: API state at import: `open`.
- Next action: keep local status in candidate task record only.

## EXT-ISSUE-WA-006 - MVP subtask: onboarding email and sponsorship (`#6`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#6`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/6`
- Import date: 2026-04-26
- Imported value: Admission subtask linked to story `le-marche-libre#16`.
- Local destination: `docs/project-management/tasks.md` (`CAND-006`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-003`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-007 - MVP subtask: auth X and session (`#7`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#7`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/7`
- Import date: 2026-04-26
- Imported value: Admission subtask linked to story `le-marche-libre#16`.
- Local destination: `docs/project-management/tasks.md` (`CAND-006`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-003`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-013 - MVP subtask: profile editable (`#13`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#13`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/13`
- Import date: 2026-04-26
- Imported value: Profile/search subtask linked to story `le-marche-libre#17`.
- Local destination: `docs/project-management/tasks.md` (`CAND-007`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-005`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-014 - MVP subtask: admin review (`#14`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#14`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/14`
- Import date: 2026-04-26
- Imported value: Admission subtask linked to story `le-marche-libre#16`.
- Local destination: `docs/project-management/tasks.md` (`CAND-006`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-003`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-016 - MVP subtask: access guard by member status (`#16`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#16`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/16`
- Import date: 2026-04-26
- Imported value: Admission subtask linked to story `le-marche-libre#16`.
- Local destination: `docs/project-management/tasks.md` (`CAND-006`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-003`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-017 - MVP subtask: sponsor relation (`#17`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#17`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/17`
- Import date: 2026-04-26
- Imported value: Profile/search subtask linked to story `le-marche-libre#17`.
- Local destination: `docs/project-management/tasks.md` (`CAND-007`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-005`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-018 - MVP subtask: member search (`#18`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#18`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/18`
- Import date: 2026-04-26
- Imported value: Profile/search subtask linked to story `le-marche-libre#17`.
- Local destination: `docs/project-management/tasks.md` (`CAND-007`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-005`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-019 - MVP subtask: member card and X link (`#19`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#19`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/19`
- Import date: 2026-04-26
- Imported value: Profile/search subtask linked to story `le-marche-libre#17`.
- Local destination: `docs/project-management/tasks.md` (`CAND-007`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-005`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-020 - MVP subtask: channel shell and navigation (`#20`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#20`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/20`
- Import date: 2026-04-26
- Imported value: Channels/messages subtask linked to story `le-marche-libre#15`.
- Local destination: `docs/project-management/tasks.md` (`CAND-008`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-004`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-021 - MVP subtask: message list and composer (`#21`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#21`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/21`
- Import date: 2026-04-26
- Imported value: Channels/messages subtask linked to story `le-marche-libre#15`.
- Local destination: `docs/project-management/tasks.md` (`CAND-008`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-004`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-023 - MVP subtask: link preview (`#23`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#23`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/23`
- Import date: 2026-04-26
- Imported value: Channels/messages subtask linked to story `le-marche-libre#15`.
- Local destination: `docs/project-management/tasks.md` (`CAND-008`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-004`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-024 - MVP subtask: Jobs channel permissions (`#24`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#24`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/24`
- Import date: 2026-04-26
- Imported value: Channels/messages subtask linked to story `le-marche-libre#15`.
- Local destination: `docs/project-management/tasks.md` (`CAND-008`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-004`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-025 - MVP subtask: global channel search (`#25`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#25`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/25`
- Import date: 2026-04-26
- Imported value: Channels/messages subtask linked to story `le-marche-libre#15`.
- Local destination: `docs/project-management/tasks.md` (`CAND-008`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-004`
- Review notes: API state at import: `open`.
- Next action: none

## EXT-ISSUE-WA-026 - MVP subtask: reply/mentions/pin (`#26`)

- Source type: github-issue
- Source owner: Marche-Libre/webapp-nextjs
- Source identifier: `#26`
- Source URL: `https://github.com/Marche-Libre/webapp-nextjs/issues/26`
- Import date: 2026-04-26
- Imported value: Channels/messages subtask linked to story `le-marche-libre#15`.
- Local destination: `docs/project-management/tasks.md` (`CAND-008`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-004`
- Review notes: API state at import: `open`.
- Next action: none

## Imported Project Item Sources (Marche-Libre org Project 1)

## EXT-PROJ-001 - Project item (inferred) for admission parent work

- Source type: github-project-item
- Source owner: Marche-Libre org Project 1
- Source identifier: `orgs/Marche-Libre/projects/1 :: inferred from webapp-nextjs#3`
- Source URL: `https://github.com/orgs/Marche-Libre/projects/1`
- Import date: 2026-04-26
- Imported value: Project-level tracking proxy for admission parent epic.
- Local destination: `docs/project-management/tasks.md` (`CAND-006`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-003`
- Review notes: Project page not readable anonymously (`404`); status at import inferred from linked issue state (`open`).
- Next action: owner confirms project card identifier/status during decommission review.

## EXT-PROJ-002 - Project item (inferred) for profile/search parent work

- Source type: github-project-item
- Source owner: Marche-Libre org Project 1
- Source identifier: `orgs/Marche-Libre/projects/1 :: inferred from webapp-nextjs#5`
- Source URL: `https://github.com/orgs/Marche-Libre/projects/1`
- Import date: 2026-04-26
- Imported value: Project-level tracking proxy for profile/search parent epic.
- Local destination: `docs/project-management/tasks.md` (`CAND-007`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-005`
- Review notes: Project page not readable anonymously (`404`); status at import inferred from linked issue state (`open`).
- Next action: owner confirms project card identifier/status during decommission review.

## EXT-PROJ-003 - Project item (inferred) for channels/messages parent work

- Source type: github-project-item
- Source owner: Marche-Libre org Project 1
- Source identifier: `orgs/Marche-Libre/projects/1 :: inferred from webapp-nextjs#4`
- Source URL: `https://github.com/orgs/Marche-Libre/projects/1`
- Import date: 2026-04-26
- Imported value: Project-level tracking proxy for channels/messages parent epic.
- Local destination: `docs/project-management/tasks.md` (`CAND-008`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-004`
- Review notes: Project page not readable anonymously (`404`); status at import inferred from linked issue state (`open`).
- Next action: owner confirms project card identifier/status during decommission review.

## EXT-PROJ-004 - Project item (inferred) for onboarding blocker

- Source type: github-project-item
- Source owner: Marche-Libre org Project 1
- Source identifier: `orgs/Marche-Libre/projects/1 :: inferred from webapp-nextjs#1`
- Source URL: `https://github.com/orgs/Marche-Libre/projects/1`
- Import date: 2026-04-26
- Imported value: Project-level tracking proxy for onboarding blocker.
- Local destination: `docs/project-management/tasks.md` (`CAND-009`)
- Disposition: merged
- Duplicate of: `EXT-ISSUE-WA-001`
- Review notes: Project page not readable anonymously (`404`); status at import inferred from linked issue state (`open`).
- Next action: owner confirms project card identifier/status during decommission review.

## EXT-PROJ-005 - Project 1 unmapped item remainder from prior snapshot

- Source type: github-project-item
- Source owner: Marche-Libre org Project 1
- Source identifier: `orgs/Marche-Libre/projects/1 :: snapshot remainder (26 observed total, 4 inferred/mapped)`
- Source URL: `https://github.com/orgs/Marche-Libre/projects/1`
- Import date: 2026-04-26
- Imported value: Represents still-unmapped project items from prior observed snapshot.
- Local destination: `docs/project-management/decisions.md` (`DEC-012`)
- Disposition: needs-owner-decision
- Duplicate of: none
- Review notes: Status at import time unknown because project item list is not publicly readable.
- Next action: owner-authenticated export required before decommission execution.

## Import Summary

| Source type | Record count |
| --- | --- |
| `external-doc` | 8 |
| `github-issue` | 22 |
| `github-project-item` | 5 |
| **Total** | **35** |

| Disposition | Count |
| --- | --- |
| `imported-active` | 5 |
| `merged` | 27 |
| `archived` | 0 |
| `discarded-no-unique-value` | 2 |
| `needs-owner-decision` | 1 |

All imported records have exactly one disposition and one local destination.
