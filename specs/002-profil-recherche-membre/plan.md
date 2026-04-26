# Implementation Plan: Profil et Recherche Membre MVP

**Branch**: `002-profil-recherche-membre` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-profil-recherche-membre/spec.md`

## Summary

Reconcile and stabilize the member profile/search MVP: editable core profile,
member card with X link, sponsor relation visibility, and simple member search.
Begin with code/schema audit because the webapp already appears to implement much
of this but may not align with the PRD or migrations.

## Technical Context

**Language/Version**: Next.js / React / TypeScript, Supabase-backed app  
**Primary Dependencies**: Existing profile, member detail, search, and sponsorship data paths  
**Storage**: Existing Supabase profile/sponsor-related objects; `profiles_public` risk must be resolved  
**Testing**: Profile edit, member-card visibility, member-search, and privacy checks  
**Target Platform**: Web app Beta 1  
**Project Type**: Brownfield web application feature stabilization  
**Performance Goals**: Search and profile card interactions feel immediate for beta-scale member count  
**Constraints**: Do not expand rich profile scope before Beta 1 stabilization  
**Scale/Scope**: Approved-member profile editing, member search, card display

## Constitution Check

- **Core-flow priority**: PASS. Member discovery is part of the beta core.
- **Supabase reproducibility**: REQUIRES REVIEW. `profiles_public` drift is a release-readiness blocker.
- **Authorization integrity**: REQUIRES REVIEW. Sponsor/private fields must not leak.
- **Next.js 16 source-of-truth**: REQUIRED before route/server-action edits.
- **Brownfield blast radius**: PASS. Affected profile/search surfaces are identified.
- **Quality gates**: REQUIRES PROJECT DECISION from `004-release-readiness`.

## Project Structure

### Documentation (this feature)

```text
specs/002-profil-recherche-membre/
+-- spec.md
+-- plan.md
+-- tasks.md
```

### Source Code (repository root)

```text
app/                 # profile/member/search routes where present
components/          # profile forms, cards, search UI where present
lib/                 # profile/search helpers where present
supabase/            # schema/RLS changes if needed
tests/               # profile/search and privacy tests
```

**Structure Decision**: Treat the current implementation as a brownfield baseline
to classify before adding behavior. Profile expansion is not allowed unless moved
through product scope decisions.

## Imported Source Mapping

| Source | Imported status | Local interpretation |
| --- | --- | --- |
| `le-marche-libre#17` | Backlog | Product user story and acceptance criteria |
| `webapp-nextjs#5` | Ready | Parent implementation issue |
| `webapp-nextjs#13` | Ready, S | Editable profile task |
| `webapp-nextjs#17` | Ready, XS | Sponsor relation task |
| `webapp-nextjs#18` | Ready, S | Member search task |
| `webapp-nextjs#19` | Ready, XS | Member card and X link task |

## Execution Order

1. Audit current profile/search implementation and classify imported tasks.
2. Resolve `profiles_public` reproducibility in coordination with release readiness.
3. Confirm sponsor relation visibility rules.
4. Fill missing Beta 1 gaps only.
5. Add privacy and profile/search verification.

## Open Decisions

- Sponsor relation visibility for self/admin/other members.
- Whether current profile enrichment remains visible during beta.
- Whether member detail remains standalone or is accessed only through chat/search surfaces.
