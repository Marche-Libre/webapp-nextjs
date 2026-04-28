# Profile/Search Tracking Update

**Date**: 2026-04-27
**Scope**: Local classification update for `002-profil-recherche-membre` after
release-readiness review. This is documentation-only tracking; runtime, tests,
routes, Supabase files, dependencies, and generated types are not changed by
this update.

## Local Classification

| Source | Local status | Evidence | Remaining tracking |
| --- | --- | --- | --- |
| `webapp-nextjs#13` | Partial | `/profil` already uses `ProfileEditAll`, which persists `first_name`, `last_name`, recomputed `full_name`, and `bio`. | Keep MVP fields, add explicit save/error feedback, and park richer profile editing fields that increase beta risk. |
| `webapp-nextjs#17` | Partial | Sponsor relation is stored and retrieved through `sponsored_by`, `sponsor_approved`, sponsorship requests, invitations, admin tables, and parrainages surfaces. | Remove unauthorized sponsor visibility on member-facing pages and confirm self/admin-only visibility rule. |
| `webapp-nextjs#18` | Partial | Member search exists in the global header and the annuaire surface, with filtering over `full_name` and `x_handle`. | Normalize query handling, include retained MVP identifiers, and open the intended member detail instead of the annuaire shell. |
| `webapp-nextjs#19` | Partial | Member detail and directory cards already expose bio and identity. | Add a member-facing X link and keep sponsor/private fields out of normal member views. |
| `webapp-nextjs#5` | Partial | The profile/search parent scope is represented by the existing child issues and current routes/components. | Keep parent issue open until `profiles_public` drift, sponsor privacy, and MVP search/detail behavior are resolved or explicitly rescoped. |

## Decisions Reflected

- Beta 1 keeps profile editing to identity-first fields: `full_name`,
  `first_name`, `last_name`, and `bio`.
- Standalone annuaire behavior at `/membres` is not treated as active MVP
  product; it is a legacy surface to hide, tolerate, or rescope depending on
  the final release implementation.
- Sponsor relation storage is retained, but sponsor visibility on public member
  views is not accepted as MVP behavior.

## Open Follow-Ups

- Resolve `profiles_public` reproducibility with versioned schema or remove the
  runtime dependency from `/membres` and `/membres/[id]`.
- Limit sponsor visibility to self/admin unless a stricter product decision is
  recorded.
- Add a member-facing X link on card/detail surfaces.
- Define whether `/membres/[id]` remains a beta-visible route or only an
  internal detail surface reachable from retained search/chat flows.
