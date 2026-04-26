# Implementation Plan: Landing Page

**Branch**: `005-landing-page` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-landing-page/spec.md`

## Summary

Represent the GitHub Project landing page item as a Speckit feature so it is not
lost when GitHub Project is removed. Treat it as separate from the MVP core until
release readiness decides whether it blocks beta.

## Technical Context

**Language/Version**: Next.js / React / TypeScript  
**Primary Dependencies**: Existing landing/public pages and product copy  
**Storage**: N/A  
**Testing**: Visual/manual review, link/CTA check, copy scope review  
**Target Platform**: Public web entrypoint  
**Project Type**: Brownfield web UI/content feature  
**Performance Goals**: Page loads normally and communicates value immediately  
**Constraints**: Do not promise out-of-scope features or open access if beta is private  
**Scale/Scope**: Landing page message and CTA only

## Constitution Check

- **Core-flow priority**: PASS if scheduled after blockers; not a core-flow blocker by default.
- **Supabase reproducibility**: N/A.
- **Authorization integrity**: N/A unless CTA changes auth/admission behavior.
- **Next.js 16 source-of-truth**: REQUIRED before route/metadata edits.
- **Brownfield blast radius**: PASS. Public landing page only.
- **Quality gates**: Use project gate from `004-release-readiness`.

## Project Structure

### Documentation (this feature)

```text
specs/005-landing-page/
+-- spec.md
+-- plan.md
+-- tasks.md
```

### Source Code (repository root)

```text
app/                 # public landing route where present
components/          # landing components where present
```

**Structure Decision**: Keep this as a separate imported feature because it is a
Project item but not part of the three core MVP user stories.

## Imported Source Mapping

| Source | Imported status | Local interpretation |
| --- | --- | --- |
| `webapp-nextjs#2` | In progress | Separate landing-page feature, beta-blocking status undecided |

## Execution Order

1. Decide whether Landing Page is beta-blocking, separate, or parked in `004-release-readiness`.
2. Audit existing landing page against issue acceptance notes.
3. Align copy and CTA with signed beta scope.
4. Verify copy does not promise out-of-scope features.
