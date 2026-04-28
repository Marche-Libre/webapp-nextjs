# Quickstart: MVP UI Route Cleanup

## Prerequisites

- Current feature pointer: `.specify/feature.json` should reference `specs/006-mvp-ui-route-cleanup`.
- Read `spec.md`, `plan.md`, `research.md`, `data-model.md`, and `contracts/ui-route-contract.md` before implementation.
- Do not edit Supabase files, migrations, generated types, dependency manifests, or package locks.

## Implementation Order

1. Update default route destinations to `/chat` in middleware/helper, OAuth callback, onboarding, waiting status, admin fallback, settings return, logo/sidebar, and chat list back control.
2. Hide Forum and Annuaire from main member navigation while keeping direct routes intact.
3. Hide channel proposal list, vote controls, proposal form, and "Proposer un salon" action in chat.
4. Clean public landing/footer copy to remove Forum, Annuaire, and offers/jobs promises.
5. Convert obvious `/chat?channel=...` links to `/chat/[slug]` where slug is already available.
6. Add explicit refused-user UX so rejected users are not silently sent to `/connexion`.
7. Verify no forbidden files changed.

## Manual Smoke Scenarios

1. Approved and onboarded member returns from `/`, `/connexion`, `/inscription`, or `/en-attente` and lands on `/chat`.
2. Approved non-onboarded member completes onboarding and lands on `/chat`.
3. Pending member remains on `/en-attente`; once approved, status refresh sends onboarded users to `/chat` and non-onboarded users to onboarding.
4. Non-admin member opening `/admin` is sent to `/chat`.
5. Sidebar and logo no longer expose Forum or Annuaire and route the home action to `/chat`.
6. Settings close/back returns to `/chat`.
7. Chat channel list does not show proposals, proposal votes, proposal form, or "Proposer un salon".
8. Public landing and footer do not promise Forum, Annuaire, or offers/jobs as Beta 1 available features.
9. Direct `/forum`, `/membres`, and `/membres/[id]` still load for an approved member under existing guards.
10. Rejected authenticated user sees an explicit refused state or controlled exit, not a silent `/connexion` redirect.

## Verification Commands

```sh
npm run build
```

Use targeted tests when implementation touches behavior covered by existing tests. If running repo-wide lint or Vitest, record known baseline failures separately from regressions.

## Forbidden Diff Check

Before completion, verify no forbidden files were modified:

```sh
git diff -- supabase package.json package-lock.json bun.lock yarn.lock pnpm-lock.yaml
```

This command should produce no output for this feature.
