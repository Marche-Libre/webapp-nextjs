# Research: MVP UI Route Cleanup

## Decision 1: Keep implementation in existing routes and components

**Decision**: Modify the existing App Router route handlers, server pages, client components, and Supabase middleware helper in place.

**Rationale**: The feature is a brownfield cleanup, not a new architecture. Existing files already own the relevant redirects, navigation items, landing copy, and chat proposal UI. Minimal edits reduce risk and preserve legacy direct routes.

**Alternatives considered**: Add a central route constants module. Rejected because this would touch many consumers and increase blast radius. Add new app routes or route groups. Rejected because the spec requires preserving existing route behavior, not restructuring it.

## Decision 2: Do not migrate `middleware` to Next.js 16 `proxy` in this feature

**Decision**: Keep the current middleware structure and only adjust destination values and rejected-user routing behavior where necessary.

**Rationale**: Next.js 16 docs state the middleware file convention is deprecated in favor of `proxy`, but this feature is a route cleanup with an explicit no-refactor constraint. Renaming middleware to proxy would be an infrastructure change with a wider validation surface than required.

**Alternatives considered**: Rename middleware to proxy now. Rejected because it is not necessary to satisfy MVP route cleanup and would mix framework migration with product-scope cleanup.

## Decision 3: Use `/chat` as default destination and `/chat/[slug]` only when slug exists

**Decision**: Default redirects and generic controls should go to `/chat`. Specific channel links should use `/chat/[slug]` only where the channel slug is already present in the current data.

**Rationale**: The spec keeps `/chat` and `/chat/[slug]` as canonical visible routes. `/chat` is the safest default because it does not require channel lookup. Header message search already loads channel slug and can link to `/chat/[slug]`; mention notification generation currently has only a channel ID and should not trigger a data-shape refactor during this cleanup.

**Alternatives considered**: Convert every `/chat?channel=...` by adding extra Supabase lookups or passing new props through message flows. Rejected because FR-014 allows tolerant follow-up when minimal correction is not available.

## Decision 4: Hide channel proposals at the UI boundary without data deletion

**Decision**: Remove visible proposal sections, buttons, forms, and vote actions from the chat list MVP UI, and avoid fetching proposal data if nothing displays it.

**Rationale**: The spec says proposals are hidden for Beta 1 and explicitly forbids Supabase changes. Hiding the UI while preserving tables/data keeps compatibility and avoids schema/RLS risk.

**Alternatives considered**: Drop proposal tables, disable RLS paths, or migrate data. Rejected because Supabase/schema changes are out of scope. Leave proposals visible but de-emphasized. Rejected because acceptance criteria require no visible proposal controls.

## Decision 5: Preserve legacy direct routes and contextual legacy links

**Decision**: Keep `/forum`, `/membres`, and `/membres/[id]` route files and access rules intact. Do not remove contextual forum links in historical notifications, embeds, forum pages, or member recent activity unless they act as default MVP destinations.

**Rationale**: The product decision is to hide legacy surfaces from MVP entry points, not delete compatibility. Historical links and bookmarks must remain controlled.

**Alternatives considered**: Redirect `/forum` and `/membres` to `/chat`. Rejected because the current spec explicitly says routes remain directly accessible. Delete legacy nav and routes together. Rejected because route deletion is out of scope.

## Decision 6: Show rejected status at the auth/status boundary

**Decision**: Route authenticated rejected users to an explicit refused state, preferably on `/en-attente`, rather than redirecting silently to `/connexion`.

**Rationale**: Release decisions require a clear refusal message. `/en-attente` already owns admission status UX and is allowed by middleware, making it the lowest-blast-radius place to display pending, approved, and rejected status.

**Alternatives considered**: Add a new `/refuse` route. Rejected because the spec excludes route expansion/refactor and the existing status page can handle it. Use query-only messaging on `/connexion`. Rejected because authenticated rejected users may be redirected away from auth routes by middleware.

## Decision 7: Quality gate uses build plus focused regression checks

**Decision**: Require `npm run build` after implementation, changed-scope lint review, and targeted tests only where relevant existing tests or low-blast-radius new tests apply.

**Rationale**: The user acceptance criteria require `npm run build`. Release-readiness docs record repo-wide lint and Vitest as known failing baselines, so tasks must avoid conflating baseline failures with regressions.

**Alternatives considered**: Require full lint and full Vitest as blockers for this cleanup. Rejected because baseline failures are known and broader than this feature, though they remain beta-gate signals.
