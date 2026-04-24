# Repository Guidelines

## Project Structure & Module Organization
The app uses the App Router under `src/app`, with route groups such as `(app)` and `(auth)`. Shared UI lives in `src/components`, organized by feature (`chat`, `forum`, `profile`) plus reusable primitives in `src/components/ui`. Put hooks in `src/hooks`, cross-cutting helpers and Supabase clients in `src/lib`, and database migrations in `supabase/migrations`. Static files belong in `public/`.

## Build, Test, and Development Commands
Use the existing npm scripts unless you are intentionally changing package-manager support.

- `npm run dev`: start the local Next.js server on port 3000.
- `npm run build`: create a production build and surface route/runtime issues.
- `npm run start`: serve the production build locally.
- `npm run lint`: run ESLint 9 with the Next core-web-vitals and TypeScript configs.
- `npx vitest run`: execute the current test suite.
- `npx vitest --watch`: run tests in watch mode while developing.

## Coding Style & Naming Conventions
Write strict TypeScript with 2-space indentation, double quotes, and semicolons, matching the existing files. Prefer the `@/` alias for imports from `src`. Keep component filenames kebab-case (`app-shell.tsx`) and component exports PascalCase (`AppShell`). Follow Next App Router conventions for `page.tsx`, `layout.tsx`, `loading.tsx`, and `route.ts`.

## Testing Guidelines
Vitest runs in `jsdom`. Place tests in `src/__tests__` and use `*.test.ts` naming, as in `src/__tests__/notifications.test.ts`. Prioritize utility logic, state helpers, and Supabase-facing code; mock external clients instead of making live calls. Run `npx vitest run` and `npm run lint` before opening a PR.

## Commit & Pull Request Guidelines
Recent history follows conventional commits such as `feat: ...` and `fix: ...`; keep that format and keep each commit scoped to one change. PRs should include a short problem statement, the chosen approach, verification commands, and screenshots for visible UI changes. Call out any migration, auth, or environment-variable changes explicitly.

## Next.js Agent Note
This repo is on Next.js `16.2.1`, not older App Router behavior. Before changing framework APIs, routing, or rendering behavior, read the relevant guide in `node_modules/next/dist/docs/` and follow current deprecation guidance.
