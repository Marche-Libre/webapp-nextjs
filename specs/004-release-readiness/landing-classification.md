# Landing Classification Update

**Date**: 2026-04-27
**Scope**: Local classification update for `005-landing-page` after
release-readiness review. This is documentation-only tracking; runtime, CTA
copy, routes, tests, and UI are not changed by this update.

## Local Classification

- **Status**: Separate
- **Why not parked**: The landing page is the active public entrypoint at `/`.
- **Why not current beta-blocking**: The critical beta path remains auth,
  admission, profile, chat, permissions, and release gating. Landing corrections
  matter, but they should not block stabilization work unless public messaging is
  required before issuing beta invites.

## Evidence

- The current landing CTA points toward signup, which is directionally correct
  for a closed product entrypoint.
- The current copy still implies a smoother and broader access model than the
  actual sponsorship-based closed beta.
- The page still references legacy or out-of-scope surfaces such as forum and
  annuaire.

## Decision

- Keep Landing Page as a separate feature from the MVP-critical release path.
- Require copy/CTA realignment before public-facing beta communications, but do
  not treat the feature as the primary blocker while core access and
  authorization remain unstable.

## Follow-Ups

- Align CTA copy with closed-beta sponsorship/admission reality.
- Remove or rewrite references to parked/legacy product surfaces.
- Ensure the public entrypoint does not promise forum/annuaire as signed beta
  value.
