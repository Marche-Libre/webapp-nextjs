# Implementation Plan: Canaux et Messages MVP

**Branch**: `003-canaux-messages` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-canaux-messages/spec.md`

## Summary

Reconcile the imported channels/messages MVP with existing chat/forum behavior.
Stabilize the retained Beta 1 channel set, Jobs permissions, message list and
composer, global search, and retained interactions. Park or hide non-beta
surfaces that create release risk.

## Technical Context

**Language/Version**: Next.js / React / TypeScript, Supabase-backed app  
**Primary Dependencies**: Existing chat, channels, messages, search, permissions, and notification paths  
**Storage**: Existing Supabase channel/message tables and RLS policies  
**Testing**: Channel access, Jobs write restriction, message actions, search, and authorization tests  
**Target Platform**: Web app Beta 1  
**Project Type**: Brownfield web application feature stabilization  
**Performance Goals**: Channel navigation, message list, composer, and search usable at closed-beta scale  
**Constraints**: No scope expansion beyond retained Beta 1 interactions  
**Scale/Scope**: Approved-member channel and message experience

## Constitution Check

- **Core-flow priority**: PASS. Conversations are a beta core flow.
- **Supabase reproducibility**: REQUIRES REVIEW. Channels/messages permissions depend on DB/RLS.
- **Authorization integrity**: REQUIRES REVIEW. Jobs/admin-write and pin rules require server/database checks.
- **Next.js 16 source-of-truth**: REQUIRED before route/server-action edits.
- **Brownfield blast radius**: PASS. Existing chat/forum drift is explicitly captured.
- **Quality gates**: REQUIRES PROJECT DECISION from `004-release-readiness`.

## Project Structure

### Documentation (this feature)

```text
specs/003-canaux-messages/
+-- spec.md
+-- plan.md
+-- tasks.md
```

### Source Code (repository root)

```text
app/                 # chat/forum/channel routes where present
components/          # channel shell, message list, composer, search UI
lib/                 # message/channel/search helpers where present
supabase/            # channel/message migrations, seed, RLS if needed
tests/               # messaging and permission tests
```

**Structure Decision**: Audit and adapt existing chat implementation. Do not let
forum/DM/reactions/report features define the Beta 1 promise unless explicitly
retained.

## Imported Source Mapping

| Source | Imported status | Local interpretation |
| --- | --- | --- |
| `le-marche-libre#15` | Backlog | Product user story and acceptance criteria |
| `webapp-nextjs#4` | Ready | Parent implementation issue |
| `webapp-nextjs#20` | Ready, S | Channel shell/navigation |
| `webapp-nextjs#21` | Ready, S | Message list/composer |
| `webapp-nextjs#26` | Ready, S | Reply, mentions, pin |
| `webapp-nextjs#23` | Ready, XS | Link preview |
| `webapp-nextjs#24` | Ready, XS | Jobs permission |
| `webapp-nextjs#25` | Ready, S | Global channel search |

## Execution Order

1. Resolve channel taxonomy and forum beta position.
2. Audit existing chat/channel code and classify imported tasks.
3. Confirm Jobs channel presence and write policy.
4. Complete missing retained MVP behavior only.
5. Park/hide out-of-scope surfaces if they create beta risk.
6. Add authorization and interaction tests.

## Open Decisions

- Forum beta status.
- Launch channel taxonomy.
- Retain vs park reply and generic link preview.
- Treatment of DMs/reactions/report/channel proposals during beta.
