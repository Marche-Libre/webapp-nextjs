# Roadmap

Imported from `Marche-Libre/le-marche-libre/docs/05-roadmap.md` and updated so
Speckit is the active source of truth.

## Now

| Priority | Work | Destination | Why now |
| --- | --- | --- | --- |
| P0 | Fix onboarding finalization blocker | `001-admission-membre` | `webapp-nextjs#1` blocks a core admission path |
| P0 | Restore schema reproducibility | `004-release-readiness` | Current repo may not rebuild production/preproduction DB state |
| P0 | Reclassify GitHub Project and issue backlog into Speckit | `000-project-source-of-truth` | Required before deleting GitHub Project |
| P0 | Decide beta scope and parked features | `004-release-readiness` | Forum/chat/jobs/reply/scope drift blocks clear execution |
| P1 | Confirm owners and access responsibilities | `004-release-readiness` | Needed for Supabase, GitHub, Vercel, and OAuth operations |

## Next

| Priority | Work | Destination | Notes |
| --- | --- | --- | --- |
| P0 | Complete retained Admission MVP | `001-admission-membre` | Auth X, onboarding, admin review, access guard |
| P1 | Complete retained Profile/Search MVP | `002-profil-recherche-membre` | Editable profile, X link, sponsor relation, search |
| P0 | Complete retained Channels/Messages MVP | `003-canaux-messages` | Shell, messages, Jobs permissions, search, retained interactions |
| P1 | Execute closed beta prep | Future Speckit feature | Invite controlled pilot after blockers close |
| P2 | Instrument minimal beta KPIs | Future Speckit feature | Approved users, complete profiles, first message, retention J7 |

## Later

| Work | Status |
| --- | --- |
| AI matching | Out of scope until beta stabilized |
| Advanced moderation backoffice | Later unless required by beta incidents |
| Monetization/payment | Later |
| Native mobile app | Later |
| Rich profile expansion | Parked unless beta scope changes |

## Release Blockers

| Blocker | Destination | Source |
| --- | --- | --- |
| Onboarding finalization 500/loop | `001-admission-membre` | `webapp-nextjs#1`, warnings doc |
| Supabase schema not reproducible | `004-release-readiness` | webapp audit doc |
| Lint and vitest not green | `004-release-readiness` | webapp audit doc |
| Backlog status does not match real code | `004-release-readiness` | roadmap and audit docs |
| Undefined technical/schema/access owners | `004-release-readiness` | questions and governance docs |

## Roadmap Rule

Do not open new feature expansion until Now items are reconciled and GitHub Project
has been verified as fully imported into Speckit.
