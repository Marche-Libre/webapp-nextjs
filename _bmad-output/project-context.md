---
project_name: 'webapp-nextjs'
user_name: 'Maxime'
date: '2026-04-28'
sections_completed: ['operating_constraints', 'technology_stack', 'technical_rules', 'usage_guidelines']
status: 'complete'
rule_count: 31
optimized_for_llm: true
existing_patterns_found: 12
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Brownfield MVP Operating Constraints

- This is a brownfield MVP stabilization and BMad migration effort: the app is buggy/overbuilt, current Speckit specs/docs/tasks are messy, and specs, docs, task management, and MVP roadmap planning are moving to a BMad-centric source of truth. Do not add features, redesign flows, or expand scope unless the product owner explicitly approves the change.
- Freeze feature expansion: only MVP blockers, security fixes, routing cleanup, Supabase schema/RLS/migration reproducibility work, and launch-readiness work are allowed.
- Do not delete Speckit yet. Extract useful context from `specs/`, then retire Speckit only after BMad artifacts exist.
- Read relevant installed Next.js 16 docs in `node_modules/next/dist/docs/` before changing Next.js behavior, routes, redirects, links, or middleware/proxy logic.
- Treat `/chat` as the MVP app center unless the product owner changes the MVP contract. Default redirects, onboarding completion, approved-user routing, sidebar/logo links, and primary app navigation should point to `/chat`.
- For MVP, forum, annuaire/member discovery, jobs/offers, channel proposals, broad search/discovery, and non-essential admin UX are parked or hidden, not necessarily deleted. Hiding a feature does not authorize deleting routes, tables, migrations, or historical data.
- Preserve direct access to legacy routes unless a story explicitly authorizes route removal. Do not break bookmarked URLs or remove route files just because the feature is hidden from navigation.
- Rejected users must see an explicit refused state at `/en-attente`; do not silently redirect them to `/connexion`. Preserve this behavior across middleware, protected layouts, and waiting/status UI.
- Supabase schema/RLS cleanup must be deliberate and MCP-first: inventory schema/policies/functions/triggers/views, classify objects, run advisors, verify queries, and only write migrations after scope approval. Never perform destructive DB changes without explicit owner approval and backup/rollback confidence.
- Use the existing Supabase helpers instead of creating ad hoc clients: `src/lib/supabase/server.ts` for server code, `src/lib/supabase/client.ts` for browser code, and `src/lib/supabase/middleware.ts` for session refresh/auth redirects.
- The connected Supabase database is production. Treat all Supabase MCP/CLI/database actions as production-impacting: inspect first, avoid writes by default, never run destructive SQL without explicit owner approval, and verify whether migrations/generated types match production before relying on them.
- Verification must distinguish baseline failures from new regressions. Record the exact command run, outcome, and whether any failure is pre-existing or caused by the current change.
- Husky/pre-commit hooks are a post-MVP consideration; do not add them during MVP stabilization unless explicitly approved.
- For documentation-only, BMad migration, or project-management cleanup work, do not change app routes, UI, Supabase files, dependencies, package locks, generated types, tests, or runtime behavior. Runtime changes require an explicit implementation story or owner approval.
- Manual code edits should be minimal and brownfield-safe: prefer small changes in existing files over new abstractions, and do not refactor unrelated code while fixing MVP blockers.
- Tests are under `src/__tests__`. Existing tests reflect the current over-featured app state and may need redesign when BMad MVP contracts replace Speckit assumptions. Existing MVP route-cleanup tests inspect source files directly; preserve them when useful, but prefer behavior-level tests for new runtime logic when feasible.

## Technology Stack & Versions

- Brownfield Next.js application for Le Marche Libre.
- Next.js `16.2.1` App Router with React `19.2.4`.
- TypeScript `^5` with `strict: true`, `isolatedModules: true`, `moduleResolution: "bundler"`, and `@/*` mapped to `./src/*`.
- Supabase via `@supabase/ssr ^0.9.0` and `@supabase/supabase-js ^2.100.1`.
- Tailwind CSS 4 through `@tailwindcss/postcss`; UI also uses `lucide-react`, `motion`, `framer-motion`, `lightswind`, and `daisyui`.
- ESLint 9 uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Vitest `^4.1.2` runs in `jsdom` with globals enabled.
- Runtime app code lives under `src/`; Supabase migrations live under `supabase/migrations/`.

## Technical Implementation Rules

### TypeScript And Module Boundaries

- Use TypeScript strict mode. Do not bypass types with `any` unless the existing boundary already forces it.
- Use the `@/*` alias for imports from `src/`.
- Keep server/client boundaries explicit: only files with `"use client"` may use browser APIs, React client hooks, or Supabase browser client helpers.
- Prefer existing exported helpers over new utility abstractions.
- Keep env access aligned with existing names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL`. Do not introduce alternate env names such as `NEXT_PUBLIC_SUPABASE_ANON_KEY` unless the env contract is explicitly changed.
- Do not expose Supabase service-role keys, secret keys, or private credentials in client code. In Next.js, assume every `NEXT_PUBLIC_` value is browser-visible.

### Next.js App Router

- App Router route files live under `src/app`; protected app routes use the `(app)` route group and auth-facing routes use `(auth)`.
- Use `redirect()` from `next/navigation` for server-side route guards and `useRouter()` only in client components.

### Code Organization And UI

- Follow existing naming and file organization: App Router pages in `src/app`, shared components in `src/components`, Supabase helpers in `src/lib/supabase`, generic UI primitives in `src/components/ui`.
- Use existing UI primitives and layout patterns before creating new components.
- Add comments only for non-obvious logic; avoid comments that restate the code.
- For frontend work, preserve the existing design system unless the story explicitly calls for UX redesign.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow all rules exactly as documented.
- When in doubt, prefer the more restrictive brownfield/MVP-safe option.
- Update this file if new project-specific patterns emerge.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update it when the technology stack, MVP contract, or Supabase safety rules change.
- Remove or rewrite rules that become outdated after the Speckit-to-BMad migration.

Last Updated: 2026-04-28
