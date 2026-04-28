# Implementation Plan: MVP UI Route Cleanup

**Branch**: `004-mvp-ui-route-cleanup` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-mvp-ui-route-cleanup/spec.md`

## Summary

Refocus the Beta/MVP experience on `/chat` by changing default post-admission destinations, hiding non-MVP entry points, and cleaning public messaging while preserving direct access to legacy routes. The implementation should be a minimal brownfield cleanup in existing route guards, redirects, navigation arrays, chat sidebar UI, and landing copy. It must not remove routes, change Supabase schema/RLS, change dependencies, or refactor forum/chat/member systems.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.2.1 App Router, React 19.2.4  
**Primary Dependencies**: `next`, `react`, `@supabase/ssr`, `@supabase/supabase-js`, `lucide-react`, Tailwind CSS 4, existing UI components  
**Storage**: Existing Supabase Auth and Postgres data only; no schema, RLS, migration, generated type, or seed change  
**Testing**: Existing `npm run build`; changed-scope lint review; targeted Vitest only if touched behavior maps to existing tests or new low-blast-radius tests are added  
**Target Platform**: Closed-beta web app on Next.js App Router  
**Project Type**: Brownfield web application UI/route cleanup  
**Performance Goals**: No new data-loading path on initial app shell; no additional network call for hidden channel proposals; route changes remain instant for normal client navigation  
**Constraints**: Keep `/forum`, `/membres`, `/membres/[id]`, `/chat`, and `/chat/[slug]`; no Supabase files; no package/lock changes; no broad refactor; no route deletion; no UI redesign  
**Scale/Scope**: Route/default destination cleanup across auth, onboarding, waiting, admin fallback, sidebar/logo/settings, chat channel list, public landing, and obvious chat-link generation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Core-flow priority**: PASS. The plan stabilizes admission-to-chat, onboarding completion, waiting approval, settings, admin fallback, and visible MVP navigation before any product expansion.
- **Supabase reproducibility**: PASS. No schema, RLS, trigger, function, realtime, storage, generated type, migration, or seed change is planned. Existing `channel_proposals` data is hidden from MVP UI, not modified.
- **Authorization integrity**: PASS. The plan touches admission/status routing and admin fallback UX only; it preserves existing server-side access checks and does not weaken RLS or client-side-only authorization boundaries.
- **Next.js 16 source-of-truth**: PASS. Relevant installed docs reviewed: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`, `01-app/02-guides/redirecting.md`, `01-app/03-api-reference/04-functions/redirect.md`, `01-app/03-api-reference/02-components/link.md`, and `01-app/01-getting-started/04-linking-and-navigating.md`.
- **Brownfield blast radius**: PASS. Current route drift is captured in `app_flow.md` and `specs/004-release-readiness/phase-2-audit.md`; affected routes/components are listed below.
- **Quality gates**: PASS. Expected gate is `npm run build` passing. Constitution signals `bun run build`, `bun run lint`, and `bunx vitest run` remain relevant; known baseline from release-readiness is build pass, lint fail, and Vitest fail, so implementation tasks must distinguish baseline from regressions.

## Project Structure

### Documentation (this feature)

```text
specs/006-mvp-ui-route-cleanup/
+-- spec.md
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- contracts/
|   +-- ui-route-contract.md
+-- checklists/
    +-- requirements.md
```

### Source Code (repository root)

```text
src/
+-- app/
|   +-- page.tsx                         # Public landing footer composition
|   +-- auth/callback/route.ts            # OAuth callback post-login destination
|   +-- onboarding/page.tsx               # Already-onboarded destination
|   +-- (auth)/en-attente/page.tsx        # Pending, approved, rejected UX
|   +-- (app)/layout.tsx                  # Protected app admission fallback
|   +-- (app)/admin/layout.tsx            # Non-admin fallback
|   +-- (app)/chat/page.tsx               # Canonical chat root retained
|   +-- (app)/chat/[slug]/page.tsx        # Canonical chat slug retained
|   +-- (app)/forum/**                    # Legacy route retained
|   +-- (app)/membres/**                  # Legacy/member detail routes retained
+-- components/
|   +-- layout/sidebar.tsx                # Main nav and logo destination
|   +-- layout/settings-shell.tsx         # Settings close destination
|   +-- layout/header.tsx                 # Obvious chat search links with slug
|   +-- onboarding/onboarding-wizard.tsx  # Finish destination and welcome link/copy
|   +-- sponsorship/status-poller.tsx     # Approved waiting destination
|   +-- chat/channel-list.tsx             # Hide proposal UI and forum back link
|   +-- home/animated-features.tsx        # Public feature promises
|   +-- home/animated-steps.tsx           # Public Beta 1 promise
+-- lib/
    +-- supabase/middleware.ts            # Auth/status default redirects
```

**Structure Decision**: Use existing App Router pages, route handlers, middleware helper, and presentational components in place. Do not introduce new route groups, data abstractions, Supabase migrations, or package dependencies.

## Brownfield Implementation Notes

- Replace forum-first default destinations with `/chat` in the existing redirect points captured by `app_flow.md`.
- Hide Forum and Annuaire from the main member navigation by editing the existing navigation item arrays, while leaving route files and direct access intact.
- Hide chat channel proposal surfaces by removing the visible proposal section/button/form/vote flow from the chat list UI. Avoid querying proposal tables if the UI no longer displays them.
- Clean landing copy and footer links so the public surface no longer promises Forum, Annuaire, or offers/jobs as Beta 1 available features.
- Convert obvious `/chat?channel=...` links to `/chat/[slug]` where the channel slug is already available in the current data shape. Do not expand data loading solely to fix a link.
- Add explicit refused-user UX at the auth/status boundary. Do not silently redirect rejected authenticated users to `/connexion`.
- Leave historical forum links in notifications, embeds, forum pages, member recent activity, and legacy content unless they are direct MVP default destinations.

## Verification Strategy

- Required: `npm run build` must pass after implementation.
- Targeted checks: inspect changed files for changed-scope lint issues; run existing targeted tests only if affected by changed code.
- Manual smoke scenarios: approved/onboarded default to `/chat`; onboarding completion; waiting approved flow; rejected user state; sidebar/logo/settings/admin fallback; chat proposals hidden; landing copy; direct `/forum`, `/membres`, `/membres/[id]` access.
- Supabase safety: verify `git diff -- supabase package.json package-lock.json bun.lock yarn.lock pnpm-lock.yaml` shows no unintended changes.

## Post-Design Constitution Check

- **Core-flow priority**: PASS. Design artifacts keep the cleanup focused on beta-critical admission-to-chat and visible scope reduction.
- **Supabase reproducibility**: PASS. Data model is behavioral only and explicitly forbids schema/RLS/migration changes.
- **Authorization integrity**: PASS. Contracts require preserving existing access checks and adding only clearer rejected-state UX.
- **Next.js 16 source-of-truth**: PASS. Research records the relevant Next.js docs and chooses minimal edits over middleware-to-proxy migration.
- **Brownfield blast radius**: PASS. The source-code structure and quickstart list all affected route/UI areas.
- **Quality gates**: PASS. Build and targeted verification are documented, with known baseline lint/Vitest risks separated from regression checks.

## Complexity Tracking

No constitution violations requiring justification.
