# Channels/Messages Tracking Update

**Date**: 2026-04-27
**Scope**: Local classification update for `003-canaux-messages` after
release-readiness review. This is documentation-only tracking; runtime, tests,
routes, Supabase files, dependencies, and generated types are not changed by
this update.

## Local Classification

| Source | Local status | Evidence | Remaining tracking |
| --- | --- | --- | --- |
| `webapp-nextjs#20` | Partial | Chat shell, channel list, DM list, and navigation are implemented. | Remove forum-first drift, hide proposal/DM clutter if out of MVP, and align route targets with canonical chat pages. |
| `webapp-nextjs#21` | Partial | Message list, realtime updates, composer, optimistic send, images, and edit/delete exist. | Add channel-specific composer restrictions and trim non-MVP interactions if they increase beta risk. |
| `webapp-nextjs#26` | Partial | Mentions and admin pin UI exist in some form. | Reply is not implemented as a durable model, pin support appears schema-drifted, and retained interactions need a hard MVP decision. |
| `webapp-nextjs#23` | Rescoped | Existing preview behavior is limited to forum-post embeds rather than generic chat link previews. | Treat generic link preview as parked for Beta 1. |
| `webapp-nextjs#24` | Missing | No `Jobs` launch channel or explicit admin-write/read-for-members policy is implemented in code or migrations. | Either add `Jobs` as a beta-blocking implementation item or rescope the launch taxonomy to current channels. |
| `webapp-nextjs#25` | Partial | Search exists in chat and the global header, with a full-text message index in migrations. | Found results do not open a concrete message reliably and route targets still drift through `/chat?channel=<id>`. |
| `webapp-nextjs#4` | Partial | Parent channels/messages scope is represented by current chat surfaces and the imported child issues. | Keep parent issue open until launch taxonomy, retained interactions, and visibility of out-of-scope surfaces are explicitly resolved. |

## Decisions Reflected

- Beta 1 keeps fixed launch channels and does not treat user-created channel
  proposals as active MVP functionality.
- Forum, DMs, reactions, reports/blocks, and channel proposals are not part of
  the explicit chat MVP promise unless they are separately retained by a release
  decision.
- Generic link preview is parked for Beta 1.

## Open Follow-Ups

- Decide whether the launch taxonomy is rescaled to current implemented public
  channels or whether a `Jobs` channel becomes a beta blocker.
- Hide or tolerate non-MVP chat-adjacent surfaces according to the release
  decisions below.
- Add route-safe search result opening for retained message search.
- Reconcile pin/reply expectations with actual schema support before beta.
