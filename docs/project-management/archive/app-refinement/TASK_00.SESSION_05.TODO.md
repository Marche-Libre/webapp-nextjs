# TASK_00 - SESSION_05 - TODO

## Covers

- `TASK_07` - Profil simple, fiche membre et recherche dans chat.
- `TASK_06` - Refocus navigation et retrait forum/annuaire standalone.

## Why Same Session

The annuaire cannot be removed safely until member search and member-detail access are preserved inside or from the chat experience.

## Goal

Preserve member discovery while moving the visible MVP product surface to `/chat`.

## Member/Profile Work Items

- Keep profile MVP fields usable: X handle, avatar/photo, first name, last name, full name, bio, and derived X link.
- Add or verify simple member search inside chat.
- Search by `x_handle`, `full_name`, `first_name`, and `last_name`.
- Normalize `@`, casing, and spaces in member search.
- Preserve member detail access through `/membres/[id]` or replace it with an explicit chat drawer/modal.
- Audit `profiles_public` or server-side profile selection.
- Avoid exposing email, phone, or sponsorship details to other members.
- Keep sponsorship visible only to self and admins.

## Navigation/Legacy Work Items

- Replace active post-auth/post-onboarding destinations from `/forum` to `/chat` after `app_flow.md` is complete.
- Remove Forum from visible main navigation.
- Remove standalone Annuaire from visible main navigation.
- Point app logo/default app home to `/chat`.
- Redirect `/membres` to `/chat`; preserve or replace `/membres/[id]` explicitly.
- Add controlled legacy behavior for `/forum` and `/forum/*`, with a documented context-loss behavior for old post links.
- Cover known surfaces: middleware, OAuth callback, onboarding, `/en-attente`, status polling, settings close, admin non-admin redirect, sidebar, logo, chat back button, dashboard, landing/footer links, notifications, `PostEmbed`, and `ml-favorites`.
- Do not drop forum or annuaire DB tables in this session.

## Completion

- `/profil` still supports first name, last name, bio, X handle/photo, and working X link.
- Chat has member search with normalization.
- Member search opens a defined member detail surface.
- Main navigation no longer exposes Forum or standalone Annuaire.
- Auth/onboarding/admission flows land on `/chat`.
- `/forum*` does not produce uncontrolled 404s.
- `/membres` is not a standalone product surface.
- `/membres/[id]` is explicitly kept or replaced.
- Sponsorship/private profile data does not leak to other members.
- Lint and build pass.
- `app_flow.md` is updated if implemented routes differ from the reference.

## Dependencies

- `SESSION_01` complete.
- `SESSION_04` chat structure understood.
