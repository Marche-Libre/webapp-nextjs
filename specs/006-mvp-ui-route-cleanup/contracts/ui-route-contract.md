# UI Route Contract: MVP UI Route Cleanup

## Purpose

This contract defines the observable route and UI behavior that implementation must preserve or change. It is a user-facing contract, not an API schema.

## Default Destinations

| Source | User state | Expected destination |
| --- | --- | --- |
| Public or auth page return | Approved and onboarded | `/chat` |
| OAuth callback | Approved and onboarded | `/chat` |
| OAuth callback | Approved and not onboarded | `/onboarding` |
| OAuth callback | Pending | `/en-attente` |
| Onboarding completion | Approved user completing onboarding | `/chat` |
| Waiting status refresh | Approved and onboarded | `/chat` |
| Waiting status refresh | Approved and not onboarded | `/onboarding` |
| Admin route fallback | Non-admin approved member | `/chat` |
| Settings close/back | Approved member | `/chat` |
| App logo/sidebar home action | Approved member | `/chat` |

## Visible Navigation Contract

- The main member navigation must include Chat as a retained MVP entry.
- The main member navigation must not include Forum as a visible MVP entry.
- The main member navigation must not include Annuaire as a visible MVP entry.
- Direct URLs for `/forum`, `/membres`, and `/membres/[id]` must remain controlled and accessible according to existing rules.

## Chat UI Contract

- `/chat` remains a visible canonical chat route.
- `/chat/[slug]` remains a visible canonical channel route.
- Chat channel list must not display a proposal list.
- Chat channel list must not display proposal vote actions.
- Chat channel list must not display a "Proposer un salon" action or proposal form.
- Existing channel visibility controls may remain.
- Existing DMs may remain if removal would require a refactor, but this feature must not add new visible DM entry points.

## Public Landing Contract

- Public landing and footer must not present Forum as an available Beta 1 product surface.
- Public landing and footer must not present Annuaire as an available Beta 1 product surface.
- Public landing must not present offers/jobs as available Beta 1 functionality.
- Public messaging may still describe verified professionals, admission, network trust, and chat-centered collaboration.

## Chat Link Contract

- If an internal message/channel link already has a channel slug, it must use `/chat/[slug]`.
- If only a channel ID is available and adding a slug requires broad data-shape changes, the existing behavior may remain temporarily and must be documented as tolerated follow-up.

## Refused User Contract

- A rejected authenticated user must not be silently redirected to `/connexion` without context.
- A rejected authenticated user must see a clear refusal state or controlled exit path.
- Existing admin refusal status remains the source of truth.

## Forbidden Changes

- Do not remove `/forum`, `/membres`, or `/membres/[id]`.
- Do not modify Supabase migrations, RLS policies, schema, generated types, or storage configuration.
- Do not change dependencies or package lock files.
- Do not implement jobs/offers.
- Do not redesign the UI or refactor chat/forum/annuaire/notifications broadly.
