# Quickstart: Project Management Cleanup

Use this guide when implementing or reviewing the cleanup. It is intentionally
documentation-only.

## 1. Confirm Scope

- Work only on project-management documentation, inventories, archives, and
  review records.
- Do not change app routes, components, Supabase migrations, generated types,
  permissions, dependencies, tests, or product behavior.
- If cleanup reveals product or runtime work, create a separate candidate task
  in the local task inventory.

## 2. Build the Local Replacement Skeleton

Create or update:
- `docs/project-management/README.md`
- `docs/project-management/product-framing.md`
- `docs/project-management/current-state.md`
- `docs/project-management/tasks.md`
- `docs/project-management/external-sources.md`
- `docs/project-management/decisions.md`
- `docs/project-management/verification.md`
- `docs/project-management/github-project-decommission.md`
- `docs/project-management/archive/README.md`

Use [contracts/local-project-management.md](./contracts/local-project-management.md)
as the record format.

## 3. Inventory Local Sources

Classify at minimum:
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `app_flow.md`
- `db_flow.md`
- `design.md`
- `design-system/marchélibre/MASTER.md`
- `APP_REFINEMENT/*.md`
- `specs/**/*.md`

For each source, record `active`, `reference`, `merged`, `archived`, `deleted`,
or `needs-owner-decision`.

## 4. Import External Sources

Capture source records for:
- Relevant docs from `Marche-Libre/le-marche-libre`, including the observed
  range `docs/00-cadrage.md` through `docs/06-etat-webapp-nextjs.md`.
- Relevant GitHub issues from the documentation repo.
- Relevant GitHub issues from this app repo.
- Org GitHub Project 1 items.

For each source, record provenance, imported value, local destination, and
disposition. Refresh the external snapshot before decommission review so the
reviewer can tell what was imported and what changed after the initial spec.

## 5. Normalize Tasks

Convert active work into local task records with:
- One priority.
- One lifecycle status.
- Scope and out-of-scope boundaries.
- Completion criteria.
- Related local documents.
- External provenance when relevant.
- Transition history for future status changes.

Session notes and duplicate task files should be merged or archived after their
useful content is captured.

## 6. Archive or Delete Deliberately

- Archive material with historical, decision, risk, or sequencing value.
- Merge duplicates into one canonical document and record the source items.
- Rename active documents whose names imply stale status or scope.
- Delete only material with no unique project value, and record the reason.
- Mark unclear or scope-changing cases as owner decisions.

## 7. Decommission the GitHub Project

After local replacement review:
- Confirm every Project item has a local disposition.
- Confirm no active task depends on Project status.
- Freeze the Project with a pointer to `docs/project-management/README.md`, or
  delete it if the owner has access and review approval.
- If deletion is delayed, record blocker, owner, next action, and review date in
  `github-project-decommission.md`.

## 8. Review Acceptance

Create a verification record showing:
- 100% local document classification coverage.
- 100% external source disposition coverage.
- 100% active task field coverage.
- Zero unmarked duplicate canonical active topics.
- Archive reasons and replacement references where applicable.
- No active project-management dependency on the GitHub Project.
- No app behavior or runtime file change as part of cleanup.

Record whether `bun run build`, `bun run lint`, and `bunx vitest run` were
skipped as docs-only, run successfully, or run with known baseline failures.
