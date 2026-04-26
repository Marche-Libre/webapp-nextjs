# TASK_00 - SESSION_01 - READY

## Goal

Create the two preflight reference documents required before implementation:

- `db_flow.md` - current Supabase schema/RLS inventory and target MVP DB shape.
- `app_flow.md` - current Next.js route/guard/redirect inventory and target MVP app flow.

This session is documentation-only. It must not apply migrations, change RLS, edit redirects, remove routes, or alter navigation behavior.

## Covers

- `TASK_02` - Generer `db_flow.md`.
- `TASK_01` - Generer `app_flow.md`.

## Why Same Session

Both documents are preflight references. They must exist before migration, RLS, admission, redirect, navigation, or cleanup work. DB is reviewed first because schema/RLS is the highest risk, then app flow is documented before touching `/forum`.

## Priority / Risk

| Area | Priority | Effort | Risk | Why |
| --- | --- | --- | --- | --- |
| DB/RLS inventory | P0 | M | High | RLS and schema mistakes can create privilege escalation or data leaks |
| App guards/redirects | P0 | M | High | Existing `/forum` redirects may block MVP flow or create loops |
| `/forum` drift | P0 | M | Medium | Forum must be frozen/legacy, not the MVP destination |
| Mermaid diagrams | P1 | S | Medium | Diagrams must be renderable and use real names |
| Migration list | P1 | S | Medium | Needed for later sessions but must not be applied here |

## Work Order

1. Create `db_flow.md` from `APP_REFINEMENT/TASK_02.TODO.md`.
2. Create `app_flow.md` from `APP_REFINEMENT/TASK_01.TODO.md`.

## Sources To Inspect

### DB Sources

- `supabase/migrations/*.sql`
- Supabase client/server helpers under `src/lib/supabase/**`
- DB-facing notification, sponsorship, chat, profile, onboarding, admin, and member code.
- Any SQL functions, triggers, grants, policies, realtime publication references, and helper RPCs.

### App Sources

- `middleware.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/auth/callback/route.ts`
- `src/app/(auth)/**`
- `src/app/(app)/**`
- `src/app/rejoindre/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/api/geo/cities/**`
- `src/components/layout/**`
- `src/components/onboarding/**`
- `src/components/sponsorship/**`
- `src/components/chat/**`
- `src/components/membres/**`
- `src/lib/notifications.ts`

## Discovery Checklist

### DB

- Inventory every known table from migrations.
- Record real columns, primary keys, foreign keys, indexes, constraints, triggers, functions, grants, policies, and realtime exposure where present.
- Classify every table as `keep`, `adapt`, `archive later`, or `unknown`.
- Separate current schema from target MVP schema.
- Mark target-only fields or policies as required migrations, not current facts.
- Explicitly review RLS risks for `profiles`, `sponsorship_requests`, `invitations`, `channels`, `channel_members`, `messages`, `message_reactions`, and `notifications`.
- Discuss forum/proposal/legacy tables as freeze/archive candidates, not immediate destructive changes.

### App

- Inventory every current route and route handler.
- Assign each route one status: `public`, `auth-only`, `member-only`, `admin-only`, `legacy`, `remove`, or `unknown`.
- List every critical redirect with source, condition, current destination, target destination, and risk or loop potential.
- Document auth, onboarding, sponsorship, admin approval, notifications, navigation, `/forum` drift, `/membres` annuaire vs `/membres/[id]` member detail, legal/public routes, and `/api/geo/cities`.

## `db_flow.md` Requirements

- Document current Supabase schema and target MVP schema separately.
- Inventory migrations, tables, columns, relations, RLS policies, helper functions, grants, and realtime exposure where relevant.
- Classify each known table as `keep`, `adapt`, `archive later`, or `unknown`.
- Include `profiles`, `sponsorship_requests`, `invitations`, `channels`, `channel_members`, `messages`, `message_reactions`, and `notifications` in the explicit RLS risk review.
- Include forum/proposals/legacy tables in the archive/freeze discussion.
- Include an ERD Mermaid diagram using real table and column names.
- List required migrations without applying them.
- Defer destructive DB changes.

## `db_flow.md` Output Contract

- Current Supabase schema.
- Target MVP schema.
- Table classification matrix.
- RLS and permission risk review.
- Helper functions, grants, triggers, policies, and realtime exposure where relevant.
- ERD Mermaid diagram with real table and column names.
- Required migrations list without applying them.
- Explicit statement that destructive DB changes are deferred.

## `app_flow.md` Requirements

- Document current routes and target MVP routes separately.
- Give every route a status: `public`, `auth-only`, `member-only`, `admin-only`, `legacy`, `remove`, or `unknown`.
- List each critical redirect with source, condition, current destination, and target destination.
- Document auth, onboarding, sponsorship, admin approval, notifications, and navigation flows.
- Fully list `/forum` drift.
- Clarify `/membres` annuaire vs `/membres/[id]` member detail.
- Include legal/public routes and `/api/geo/cities` handling.
- Include minimal notifications flow: `welcome`, `sponsor_request`, `account_approved`, `chat_mention` if already present.
- Include renderable Mermaid diagrams requested by `TASK_01`.

## `app_flow.md` Output Contract

- Current route map.
- Target MVP route map.
- Route status table.
- Critical redirect matrix.
- Auth/admission/onboarding/sponsorship/admin/notification/navigation flows.
- Full `/forum` drift inventory.
- `/membres` vs `/membres/[id]` clarification.
- Legal/public routes and `/api/geo/cities` handling.
- Minimal notification flow for `welcome`, `sponsor_request`, `account_approved`, and `chat_mention` if present.
- Renderable Mermaid diagrams requested by `TASK_01`.
- Explicit statement that `/forum` is not the MVP destination.

## Completion

- `db_flow.md` exists and satisfies `TASK_02` completion criteria.
- `app_flow.md` exists and satisfies `TASK_01` completion criteria.
- No diagram or target flow makes `/forum` the main MVP destination.
- No migration, RLS, redirect, route, or navigation change is applied.

## Validation Checklist

- `db_flow.md` exists.
- `app_flow.md` exists.
- Both documents separate current state from target MVP state.
- Every known table has a classification.
- Every known route has a status.
- Mermaid blocks are syntactically renderable.
- No target diagram routes the main MVP experience to `/forum`.
- Migration needs are listed but not applied.
- Redirect, navigation, route, RLS, and schema behavior are unchanged.

## Open Questions / Ambiguities To Preserve

- Whether `/api/geo/cities` should remain public or become protected.
- Whether `invitations` remains active or becomes legacy after sponsorship consolidation.
- Whether `message_reactions` remains in the MVP.
- Whether `chat_mention` notification is already implemented and should be preserved.
- Whether `/membres/[id]` remains an internal member detail route after standalone annuaire removal.

## Handoff To Later Sessions

Later implementation sessions must treat `db_flow.md` and `app_flow.md` as preflight references.

If implementation discovers behavior that differs from these docs, update the relevant flow document instead of silently diverging.

## Do Not Do

- Do not apply migrations.
- Do not modify RLS.
- Do not change app behavior.
- Do not delete routes, tables, columns, forum code, or annuaire code.

## Suggested Prompt

Create `db_flow.md` and `app_flow.md` from `APP_REFINEMENT/TASK_02.TODO.md` and `APP_REFINEMENT/TASK_01.TODO.md`. Read migrations, DB-facing code, routes, guards, redirects, and navigation. Do not apply migrations or change app behavior.
