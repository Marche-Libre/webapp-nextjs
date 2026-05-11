<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:react-code-rules -->

# React Code Rules

Use these rules for React code reviews and implementation work.

- Do not define inline methods in JSX. Extract event handlers, callbacks, render helpers, and conditional logic into the component logic before JSX usage, then pass named references.
- Event handlers passed to JSX must be named and memoized with `useCallback`, unless they are module-level functions.
- Callback functions must always use arrow functions assigned to named constants. This includes `useCallback` callbacks, handlers, and callbacks passed to hooks or child components.
- Use named function declarations for component-local non-callback helpers only. Avoid anonymous inline functions for behavior that belongs to the component.
- Memoize coupled helper functions with `useCallback` when they are passed as props, used as hook dependencies, or consumed by memoized values; define the callback itself as an arrow function.
- Type function parameters explicitly. Do not add explicit return types unless the story, a public API boundary, or local type inference weakness requires one.
- Move static constants, static arrays, and static objects outside the component so they are not recreated on every render.
- Memoize coupled derived variables with `useMemo` when they are used by memoized handlers, memoized components, effects, or other memoized values.
- Classnames should stay inline as much as possible.
- Do not recreate heavy objects, arrays, maps, sets, regexes, or config values during render. Hoist static values to module scope and wrap dynamic values in `useMemo` with primitive dependencies where possible.
- Do not define object literals, array literals, or collection transformations inline in JSX props or JSX children.
- Do not call `.map()`, `.filter()`, `.reduce()`, `.sort()`, or similar collection operations inline in JSX. Prepare named variables before the return statement.
- Organize component bodies in this order: state declarations; hooks and fetch/data setup; derived variables; named methods, helpers, events, and handlers; lifecycle hooks such as `useEffect`; then return statements.

<!-- END:react-code-rules -->

<!-- BMAD START -->
For project context, technology constraints, and brownfield operating rules,
start with `_bmad-output/project-context.md`.

Active planning artifacts live in `_bmad-output/planning-artifacts/`:
`prd.md`, `ux-design-specification.md`, `architecture.md`, and `epics.md`.

Implementation tracking lives in
`_bmad-output/implementation-artifacts/sprint-status.yaml`.

GitHub Project 1 and `Marche-Libre/le-marche-libre` are imported sources only.
Do not use GitHub Project status as active task status after the BMad migration.

For documentation-only, BMad migration, or project-management cleanup work, do
not change app routes, UI, Supabase files, dependencies, package locks,
generated types, tests, or runtime behavior.
<!-- BMAD END -->
