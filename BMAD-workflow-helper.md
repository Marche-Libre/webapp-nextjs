# BMad Workflow Helper

## Source Of Truth

BMad is the active project-management and implementation source of truth.

Start here:
- `_bmad-output/project-context.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

Historical Speckit material has been extracted into BMad artifacts and deleted. Do not use Speckit as an active workflow.

## Current State

Implementation readiness currently needs one planning cleanup pass before story execution.

Required cleanup from `_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-30.md`:
- Merge verification-only stories into functional stories, Definition of Done, or release-readiness checks.
- Convert Epic 6 process/governance stories into guardrails.
- Tighten Story 1.1 into a bounded access/security matrix deliverable.
- Add schema-gap handling criteria to schema-dependent stories.

## Recommended Next Workflow

1. Run `bmad-correct-course`
   Target: `_bmad-output/planning-artifacts/epics.md`

2. Run `bmad-check-implementation-readiness`
   Confirm PRD, UX, architecture, and epics are ready for implementation.

3. Run `bmad-sprint-planning`
   Regenerate `_bmad-output/implementation-artifacts/sprint-status.yaml`.

4. Run `bmad-create-story`
   Create the next implementation story from corrected Epic 1. Start with Story 1.1.

5. Run `bmad-dev-story`
   Execute the created story. For Story 1.1, produce audit artifacts before runtime fixes.

6. Run `bmad-code-review` or `bmad-checkpoint-preview`
   Use code review for runtime changes. Use checkpoint/adversarial review for documentation or audit-only outputs.

## Implementation Guardrails

- Freeze feature expansion.
- Only allow MVP blockers, security fixes, routing cleanup, Supabase schema/RLS reproducibility work, and launch-readiness work.
- Do not change app routes, UI, Supabase files, dependencies, package locks, generated types, tests, or runtime behavior during documentation-only cleanup.
- Treat the connected Supabase database as production-impacting.
- Inspect before writes.
- Never run destructive SQL without explicit owner approval and rollback confidence.
- Read installed Next.js 16 docs before changing routes, redirects, middleware/proxy, links, Server Actions, route handlers, or caching.

## Story Execution Loop

For each story:
1. Confirm story status in `sprint-status.yaml`.
2. Create or load the story file.
3. Implement only the scoped acceptance criteria.
4. Verify with the smallest relevant checks.
5. Run review.
6. Update story status.
7. Record baseline failures separately from new regressions.

## Immediate Next Move

Run `bmad-correct-course` on `_bmad-output/planning-artifacts/epics.md`.
