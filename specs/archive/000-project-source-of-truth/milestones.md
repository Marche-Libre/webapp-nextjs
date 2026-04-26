# Milestones

Imported from `Marche-Libre/le-marche-libre/docs/05-roadmap.md`, GitHub Project
1, and `webapp-nextjs` milestone `MVP-V1`.

## Milestone Map

| Milestone | Duration | Objective | Speckit destination | Exit criteria |
| --- | --- | --- | --- | --- |
| Phase 0 - Freeze and usable audit | 3-5 days | Turn the existing app/backlog into a pilotable baseline | `004-release-readiness` | Scope docs aligned, owners explicit, backlog cleaned, blockers identified |
| Phase 1 - Stabilize blockers | 1-2 weeks | Restore a usable and reproducible base | `001-admission-membre`, `004-release-readiness` | Onboarding blocker fixed, schema reproducible, build mandatory, tests understood |
| Phase 2 - MVP/Beta realignment | 1-2 weeks | Align promised product, backlog, and real code | `001`, `002`, `003`, `004` | US1/US2/US3 are `done` or `rescoped`, beta scope signed, parked features identified |
| Phase 3 - Closed beta | 1 week | Validate real usage with a controlled pilot group | Future Speckit feature after blockers close | First members active, no critical blocker on admission/access/conversations, beta KPIs tracked |
| Phase 4 - Launch decision | 2-3 days | Decide if closed beta can widen | Future Speckit feature after beta evidence | No critical blocker, owners/access stabilized, post-beta backlog prioritized |
| MVP-V1 | GitHub issue milestone | Webapp MVP implementation scope | `001`, `002`, `003` | Admission, profile/search, channels/messages deliver the retained beta contract |

## MVP-V1 Issue Coverage

| Feature | Webapp issues |
| --- | --- |
| Admission membre | `webapp-nextjs#1,#3,#6,#7,#14,#16` |
| Profil et recherche membre | `webapp-nextjs#5,#13,#17,#18,#19` |
| Canaux et messages | `webapp-nextjs#4,#20,#21,#23,#24,#25,#26` |

## Milestone Policy

- Project statuses imported from GitHub are not final local completion status.
- Each milestone item must be revalidated against code and acceptance criteria before being marked complete in Speckit.
- Closed beta and launch decision should become new Speckit features only after Phase 0-2 work is reconciled.
