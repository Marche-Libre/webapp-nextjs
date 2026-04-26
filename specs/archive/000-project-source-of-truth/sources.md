# Imported Sources

Import date: 2026-04-26  
Active destination: `specs/`  
Purpose: retain provenance from GitHub Project 1, `Marche-Libre/le-marche-libre`,
and `Marche-Libre/webapp-nextjs` before GitHub Project is removed from active
project management.

## Source Summary

| Source | Imported count | Destination |
| --- | ---: | --- |
| GitHub Project 1 items | 26 | This file plus feature specs `001` through `005` |
| `le-marche-libre` docs | 7 | Roadmap, milestones, decisions, release readiness, feature specs |
| `le-marche-libre` issues | 11 | Project index plus feature specs |
| `webapp-nextjs` open issues | 19 | Feature specs and tasks |

## GitHub Project 1 Import

Project: `https://github.com/orgs/Marche-Libre/projects/1`  
Title: `Webapp: Road to MVP`  
Authenticated item count: 26  
Fields observed: status, scope, size, milestone, repository, issue content.

Export provenance:

- Command: `gh project item-list 1 --owner Marche-Libre --format json --limit 100`
- Project URL: `https://github.com/orgs/Marche-Libre/projects/1`
- Linked issue URL convention:
  `le-marche-libre#N` -> `https://github.com/Marche-Libre/le-marche-libre/issues/N`
- Linked issue URL convention:
  `webapp-nextjs#N` -> `https://github.com/Marche-Libre/webapp-nextjs/issues/N`
- Project-item-specific URLs are not exposed by `gh project item-list`; the
  Project URL plus linked issue URL are the retained source references before
  decommission.

| # | Source | Title | Project status | Scope | Size | Milestone | Local destination |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | `webapp-nextjs#14` | MVP - Review admin des demandes | Ready | Current | S | MVP-V1 | `001-admission-membre/tasks.md` |
| 2 | `le-marche-libre#1` | Vision MVP | In review | Current |  |  | `000-project-source-of-truth/decisions.md`, `004-release-readiness/spec.md` |
| 3 | `le-marche-libre#5` | Gouvernance MVP | In review | Current |  |  | `004-release-readiness/spec.md`, `000-project-source-of-truth/decisions.md` |
| 4 | `webapp-nextjs#1` | Bug lors de la finalisation de l'onboarding | Ready | Current | S | MVP-V1 | `001-admission-membre/tasks.md`, `004-release-readiness/tasks.md` |
| 5 | `webapp-nextjs#2` | Landing Page | In progress | Current |  |  | `005-landing-page/spec.md` |
| 6 | `le-marche-libre#4` | Scope MVP | In progress | Current |  |  | `000-project-source-of-truth/roadmap.md`, `004-release-readiness/spec.md` |
| 7 | `webapp-nextjs#3` | MVP - Admission membre | Ready | Current |  | MVP-V1 | `001-admission-membre/spec.md` |
| 8 | `webapp-nextjs#6` | MVP - Onboarding email et parrainage | Ready | Current | S | MVP-V1 | `001-admission-membre/tasks.md` |
| 9 | `webapp-nextjs#4` | MVP - Canaux et messages | Ready | Current |  | MVP-V1 | `003-canaux-messages/spec.md` |
| 10 | `webapp-nextjs#5` | MVP - Profil et recherche membre | Ready | Current |  | MVP-V1 | `002-profil-recherche-membre/spec.md` |
| 11 | `webapp-nextjs#26` | MVP - Reply, mentions et pin | Ready | Current | S | MVP-V1 | `003-canaux-messages/tasks.md` |
| 12 | `webapp-nextjs#21` | MVP - Liste de messages et composer | Ready | Current | S | MVP-V1 | `003-canaux-messages/tasks.md` |
| 13 | `webapp-nextjs#18` | MVP - Recherche membre | Ready | Current | S | MVP-V1 | `002-profil-recherche-membre/tasks.md` |
| 14 | `webapp-nextjs#25` | MVP - Recherche globale des canaux | Ready | Current | S | MVP-V1 | `003-canaux-messages/tasks.md` |
| 15 | `webapp-nextjs#24` | MVP - Permissions du canal Jobs | Ready | Current | XS | MVP-V1 | `003-canaux-messages/tasks.md` |
| 16 | `webapp-nextjs#23` | MVP - Preview de lien | Ready | Current | XS | MVP-V1 | `003-canaux-messages/tasks.md` |
| 17 | `webapp-nextjs#20` | MVP - Shell canaux et navigation | Ready | Current | S | MVP-V1 | `003-canaux-messages/tasks.md` |
| 18 | `webapp-nextjs#19` | MVP - Fiche membre et lien X | Ready | Current | XS | MVP-V1 | `002-profil-recherche-membre/tasks.md` |
| 19 | `webapp-nextjs#17` | MVP - Relation parrain / parraine | Ready | Current | XS | MVP-V1 | `002-profil-recherche-membre/tasks.md` |
| 20 | `webapp-nextjs#16` | MVP - Garde d'acces selon le statut membre | Ready | Current | XS | MVP-V1 | `001-admission-membre/tasks.md` |
| 21 | `webapp-nextjs#7` | MVP - Auth X et session | Ready | Current | S | MVP-V1 | `001-admission-membre/tasks.md` |
| 22 | `webapp-nextjs#13` | MVP - Profil membre editable | Ready | Current | S | MVP-V1 | `002-profil-recherche-membre/tasks.md` |
| 23 | `le-marche-libre#17` | US2 - Profil et recherche membre MVP | Backlog | Current |  |  | `002-profil-recherche-membre/spec.md` |
| 24 | `le-marche-libre#15` | US3 - Canaux et messages MVP | Backlog | Current |  |  | `003-canaux-messages/spec.md` |
| 25 | `le-marche-libre#16` | US1 - Admission membre MVP | Backlog | Current |  |  | `001-admission-membre/spec.md` |
| 26 | `le-marche-libre#3` | Architecture MVP | Backlog | Current |  |  | `004-release-readiness/spec.md` |

Coverage: 26/26 Project items mapped to a local destination.

## Imported Documentation

Repository: `https://github.com/Marche-Libre/le-marche-libre`

| Source doc | Imported value | Local destination |
| --- | --- | --- |
| `docs/00-cadrage.md` | Realignment frame: `webapp-nextjs` as product repo, stabilize existing code, write decisions, backlog/status drift | `000-project-source-of-truth/roadmap.md`, `004-release-readiness/spec.md` |
| `docs/01-diagnostic.md` | SWOT: demand exists, scope/governance weaknesses, divergence and scope creep risks | `004-release-readiness/spec.md`, `decisions.md` |
| `docs/02-prd.md` | MVP/Beta scope, target users, US1/US2/US3 acceptance criteria, out-of-scope list | `001`, `002`, `003`, `004` specs |
| `docs/03-questions-equipe.md` | Product, technical, and organization decisions to resolve | `000-project-source-of-truth/decisions.md` |
| `docs/04-warnings.md` | Critical risks: spec/code drift, schema reproducibility, onboarding bug, quality gates, context loss | `004-release-readiness/spec.md`, `roadmap.md` |
| `docs/05-roadmap.md` | Phase 0-4 roadmap and Now/Next/Later | `milestones.md`, `roadmap.md` |
| `docs/06-etat-webapp-nextjs.md` | Observed app state, implemented surfaces, quality gate results, DB drift, backlog mismatch | `004-release-readiness/spec.md`, feature Brownfield sections |

Coverage: 7/7 docs mapped.

## `le-marche-libre` Issues

| Issue | State | Title | Local destination |
| --- | --- | --- | --- |
| `#1` | open | Vision MVP | `004-release-readiness/spec.md`, `decisions.md` |
| `#2` | closed | Decider : La Main Invisible = module ou produit separe | `sources.md` history only |
| `#3` | open | Architecture MVP | `004-release-readiness/spec.md` |
| `#4` | open | Scope MVP | `roadmap.md`, `004-release-readiness/spec.md` |
| `#5` | open | Gouvernance MVP | `004-release-readiness/spec.md`, `decisions.md` |
| `#6` | closed | Definir le format agile : sprints et rituels | `sources.md` history only |
| `#7` | closed | Definir l'utilisateur cible principal | `sources.md` history only |
| `#8` | closed | Budget et modele economique | `sources.md` history only |
| `#15` | open | US3 - Canaux et messages MVP | `003-canaux-messages/spec.md` |
| `#16` | open | US1 - Admission membre MVP | `001-admission-membre/spec.md` |
| `#17` | open | US2 - Profil et recherche membre MVP | `002-profil-recherche-membre/spec.md` |

Coverage: 11/11 issues represented.

## `webapp-nextjs` Issues

| Issue | State | Title | Local destination |
| --- | --- | --- | --- |
| `#1` | open | Bug lors de la finalisation de l'onboarding | `001-admission-membre/tasks.md`, `004-release-readiness/tasks.md` |
| `#2` | open | Landing Page | `005-landing-page/spec.md` |
| `#3` | open | MVP - Admission membre | `001-admission-membre/spec.md` |
| `#4` | open | MVP - Canaux et messages | `003-canaux-messages/spec.md` |
| `#5` | open | MVP - Profil et recherche membre | `002-profil-recherche-membre/spec.md` |
| `#6` | open | MVP - Onboarding email et parrainage | `001-admission-membre/tasks.md` |
| `#7` | open | MVP - Auth X et session | `001-admission-membre/tasks.md` |
| `#13` | open | MVP - Profil membre editable | `002-profil-recherche-membre/tasks.md` |
| `#14` | open | MVP - Review admin des demandes | `001-admission-membre/tasks.md` |
| `#16` | open | MVP - Garde d'acces selon le statut membre | `001-admission-membre/tasks.md` |
| `#17` | open | MVP - Relation parrain / parraine | `002-profil-recherche-membre/tasks.md` |
| `#18` | open | MVP - Recherche membre | `002-profil-recherche-membre/tasks.md` |
| `#19` | open | MVP - Fiche membre et lien X | `002-profil-recherche-membre/tasks.md` |
| `#20` | open | MVP - Shell canaux et navigation | `003-canaux-messages/tasks.md` |
| `#21` | open | MVP - Liste de messages et composer | `003-canaux-messages/tasks.md` |
| `#23` | open | MVP - Preview de lien | `003-canaux-messages/tasks.md` |
| `#24` | open | MVP - Permissions du canal Jobs | `003-canaux-messages/tasks.md` |
| `#25` | open | MVP - Recherche globale des canaux | `003-canaux-messages/tasks.md` |
| `#26` | open | MVP - Reply, mentions et pin | `003-canaux-messages/tasks.md` |

Coverage: 19/19 open webapp issues represented.

## Archived Local Sources

| Archived source | New status | Notes |
| --- | --- | --- |
| `specs/archive/001-project-management-cleanup/` | provenance only | Previous cleanup output kept for audit history, not active source of truth |
| `specs/archive/docs-project-management/` | provenance only | Previous local project-management docs kept for history, not active source of truth |

## Decommission Checklist

- [X] Project 1 item export read with authenticated GitHub CLI.
- [X] 26/26 Project items mapped above.
- [X] External docs mapped.
- [X] Issues mapped.
- [ ] Owner confirms this import is sufficient.
- [ ] Owner freezes or deletes GitHub Project 1.
- [ ] Final deletion/freeze date recorded here.
