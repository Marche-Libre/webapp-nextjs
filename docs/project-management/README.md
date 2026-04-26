# Project Management - Start Here

This directory is the local source of truth for project-management records in
this repository.

## Scope Guard

- This cleanup is docs-only.
- Do not change app routes, UI, Supabase files, dependencies, package locks,
  generated types, tests, or runtime behavior in this cleanup.
- If product or runtime work is discovered, create a candidate Task Record in
  [tasks.md](./tasks.md). Do not implement it here.

## Local Source-of-Truth Rule

- Active planning status must be readable from local records in this directory.
- `APP_REFINEMENT/*.md` and other legacy planning files are source material,
  not canonical active status after normalization.
- External GitHub docs/issues/Project items are handled in US3; until then they
  remain provenance inputs and are not imported as active local status records.

## No-Runtime-Change Boundary

Before closing a cleanup slice, confirm the diff remains documentation-only and
that app behavior is unchanged.

## Start Here Navigation

1. [Product Framing](./product-framing.md)
2. [Current State Inventory](./current-state.md)
3. [Task Records](./tasks.md)
4. [External Source Records](./external-sources.md)
5. [Cleanup Decisions](./decisions.md)
6. [Verification Records](./verification.md)
7. [Archive Index](./archive/README.md)
8. [GitHub Project Decommission Record](./github-project-decommission.md)

## Working Notes

- Active cleanup scope in this MVP execution: Phase 1, Phase 2, US1, US2.
- External source import (US3) and GitHub Project decommission (Phase 7) are
  intentionally deferred.

## Last Reviewed

- 2026-04-26
