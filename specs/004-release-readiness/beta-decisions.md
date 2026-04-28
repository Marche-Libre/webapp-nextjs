# Beta Decisions Update

**Date**: 2026-04-27
**Scope**: Documentation-only release decisions captured after the release
readiness re-audit. No runtime, route, UI, or Supabase change is applied here.

## T015 GitHub Issue Closure/Rescope Recommendations

- `001-admission-membre`: keep parent issue open; runtime exists but access
  matrix, refused UX, and staging validation remain incomplete.
- `002-profil-recherche-membre`: keep parent open/partial; core surfaces exist,
  but `profiles_public` drift, sponsor privacy, and member-facing X link remain
  unresolved.
- `003-canaux-messages`: keep parent open/partial; core chat exists, but launch
  taxonomy, Jobs permissions, retained interactions, and out-of-scope surfaces
  still need explicit release decisions.
- `005-landing-page`: rescope as separate workstream; do not use it to block
  core beta stabilization unless public messaging must be fixed before invites.

## T016 Forum Beta Position

- **Decision**: Forum is tolerated legacy, not explicit Beta 1 product.
- **Consequence**: Do not expand forum work. Hide or de-emphasize forum in MVP
  navigation when implementation work occurs, but do not perform destructive
  removal during release-readiness tracking.

## T017 Launch Channel Taxonomy

- **Decision**: For Beta 1 planning, current implemented public channels are the
  accepted baseline until a deliberate seeded taxonomy is shipped.
- **Consequence**: Do not claim the PRD taxonomy is already implemented. `Jobs`
  becomes a future blocker only if the team insists it is mandatory at launch.

## T019 Refused-Member UX

- **Decision**: Refused members should be redirected out of the app and shown a
  clear refusal message at the auth boundary rather than silently looping.
- **Current state**: `/en-attente` redirects refused members straight to
  `/connexion`, which hides the refusal reason.
- **Consequence**: Treat the current UX as incomplete and require an explicit
  message/re-entry rule before beta go.

## T020 Minimal Merge/Beta Quality Gate

### Merge Gate

- `npm run build` must pass.
- Changed-scope lint must be clean for touched files.
- Targeted tests for touched beta-critical flows must pass.
- Manual authorization/schema checks are required for auth, admission, role, and
  permissions changes.

### Beta Gate

- Repo-wide build passes.
- Repo-wide lint passes.
- Repo-wide Vitest passes.
- Known schema drift items (`profiles_public`, `specialty_categories.sector`,
  false channel-proposal trigger assumption, notification type drift) are fixed,
  hidden from runtime, or explicitly accepted by owner with risk noted.
- Forum/chat/profile/admission scope decisions are reflected in runtime UX.

## T021 Closed-Beta Go/No-Go Checklist And Signoff Path

Closed beta is **NO-GO** unless all of the following are true:

- Product owner accepts the retained beta scope.
- Technical owner accepts the runtime state of auth, profile, chat, and
  navigation.
- Schema/Supabase owner accepts reproducibility and authorization state.
- Access owners for GitHub, Supabase, Vercel, and X OAuth are known.
- Admission/auth flow works on the target environment.
- Anonymous/pending/rejected/approved/admin access routing is validated.
- Core chat read/send behavior works on retained launch channels.
- No public-facing page promises parked or hidden product surfaces.

**Signoff path**:

1. Technical/schema review marks blockers resolved or explicitly accepted.
2. Product owner reviews retained scope and public messaging.
3. Beta go/no-go is recorded in `004-release-readiness` before invites are sent.
