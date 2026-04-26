# Project Source of Truth

This directory is the active Speckit source of truth for project management.

## Rule

- Active project management lives in `specs/`.
- GitHub Project 1 is an import source, not the active board.
- `Marche-Libre/le-marche-libre` is an import source for product docs, roadmap,
  questions, risks, and user stories.
- Old cleanup records are archived under `specs/archive/` and are not active.
- `.specify/` stays as Speckit tooling/configuration.

## Active Feature Specs

| Directory | Purpose | Primary imported sources |
| --- | --- | --- |
| `specs/001-admission-membre/` | Admission, onboarding, admin review, access guard | `le-marche-libre#16`, `webapp-nextjs#1,#3,#6,#7,#14,#16` |
| `specs/002-profil-recherche-membre/` | Profile, sponsor relation, member detail, search | `le-marche-libre#17`, `webapp-nextjs#5,#13,#17,#18,#19` |
| `specs/003-canaux-messages/` | Channels, messages, Jobs permissions, search, interactions | `le-marche-libre#15`, `webapp-nextjs#4,#20,#21,#23,#24,#25,#26` |
| `specs/004-release-readiness/` | Freeze, schema reproducibility, quality gates, backlog realignment, beta gate | `le-marche-libre` docs `00..06`, Project items for vision/scope/governance/architecture |
| `specs/005-landing-page/` | Landing page project item kept separate from MVP core | `webapp-nextjs#2` |

## Project Index Files

- [milestones.md](./milestones.md): imported roadmap phases and beta gates.
- [roadmap.md](./roadmap.md): Now / Next / Later execution order.
- [user-stories.md](./user-stories.md): consolidated imported US1/US2/US3 view.
- [sources.md](./sources.md): complete import ledger for Project 1, docs, and issues.
- [decisions.md](./decisions.md): open owner/product/technical decisions.
- [spec.md](./spec.md): requirements for the migration away from GitHub Project.
- [plan.md](./plan.md): implementation plan for this source-of-truth structure.
- [tasks.md](./tasks.md): remaining migration/decommission tasks.

## Decommission Rule

Do not delete or freeze GitHub Project 1 until `sources.md` shows 100% imported
coverage and the owner confirms that `specs/` is the accepted source of truth.
