# TASK_00 - SESSION_01 - READY

## Covers

- `TASK_02` - Generer `db_flow.md`.
- `TASK_01` - Generer `app_flow.md`.

## Why Same Session

Both documents are preflight references. They must exist before migration, RLS, admission, redirect, navigation, or cleanup work. DB is reviewed first because schema/RLS is the highest risk, then app flow is documented before touching `/forum`.

## Work Order

1. Create `db_flow.md` from `APP_REFINEMENT/TASK_02.TODO.md`.
2. Create `app_flow.md` from `APP_REFINEMENT/TASK_01.TODO.md`.

## `db_flow.md` Requirements

- Document current Supabase schema and target MVP schema separately.
- Inventory migrations, tables, columns, relations, RLS policies, helper functions, grants, and realtime exposure where relevant.
- Classify each known table as `keep`, `adapt`, `archive later`, or `unknown`.
- Include `profiles`, `sponsorship_requests`, `invitations`, `channels`, `channel_members`, `messages`, `message_reactions`, and `notifications` in the explicit RLS risk review.
- Include forum/proposals/legacy tables in the archive/freeze discussion.
- Include an ERD Mermaid diagram using real table and column names.
- List required migrations without applying them.
- Defer destructive DB changes.

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

## Completion

- `db_flow.md` exists and satisfies `TASK_02` completion criteria.
- `app_flow.md` exists and satisfies `TASK_01` completion criteria.
- No diagram or target flow makes `/forum` the main MVP destination.
- No migration, RLS, redirect, route, or navigation change is applied.

## Do Not Do

- Do not apply migrations.
- Do not modify RLS.
- Do not change app behavior.
- Do not delete routes, tables, columns, forum code, or annuaire code.

## Suggested Prompt

Create `db_flow.md` and `app_flow.md` from `APP_REFINEMENT/TASK_02.TODO.md` and `APP_REFINEMENT/TASK_01.TODO.md`. Read migrations, DB-facing code, routes, guards, redirects, and navigation. Do not apply migrations or change app behavior.
