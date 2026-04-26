# User Stories

Consolidated from `Marche-Libre/le-marche-libre#16,#17,#15`, PRD scope, and
GitHub Project 1. The detailed Speckit feature specs are the executable source
of truth.

## Overview

| User story | Priority | Feature spec | Parent implementation issue | Status source |
| --- | --- | --- | --- | --- |
| US1 - Admission membre MVP | P1 | `../001-admission-membre/spec.md` | `webapp-nextjs#3` | Project status imported as `Backlog` for story, `Ready` for implementation parent |
| US2 - Profil et recherche membre MVP | P1 | `../002-profil-recherche-membre/spec.md` | `webapp-nextjs#5` | Project status imported as `Backlog` for story, `Ready` for implementation parent |
| US3 - Canaux et messages MVP | P1 | `../003-canaux-messages/spec.md` | `webapp-nextjs#4` | Project status imported as `Backlog` for story, `Ready` for implementation parent |

## US1 - Admission Membre MVP

Source: `https://github.com/Marche-Libre/le-marche-libre/issues/16`

**User story**: As a candidate coming from X, I want to request club access and be reviewed so I can join the platform.

**Includes**:

- X auth only.
- Onboarding / registration tunnel.
- Email notification or contact collection as retained for Beta 1.
- Sponsor handle input.
- `pending`, `approved`, and `refused` access states.
- App access only after approval.

**Acceptance criteria**:

- A candidate can sign in with X.
- The tunnel collects at minimum email and sponsor information.
- An admin can approve or refuse an access request.
- A non-approved candidate cannot access the app.

**Imported implementation issues**:

- `webapp-nextjs#1` - onboarding finalization bug.
- `webapp-nextjs#3` - Admission parent.
- `webapp-nextjs#6` - Onboarding email and sponsorship.
- `webapp-nextjs#7` - Auth X and session.
- `webapp-nextjs#14` - Admin review.
- `webapp-nextjs#16` - Access guard by member status.

## US2 - Profil et Recherche Membre MVP

Source: `https://github.com/Marche-Libre/le-marche-libre/issues/17`

**User story**: As an approved member, I want a simple profile and member search so I can present myself and find other members.

**Includes**:

- X-based profile: handle and photo.
- Editable core fields: name, first name, bio.
- Member card accessible from avatar or search result.
- X profile link.
- Sponsor/sponsored relation in the data model.
- Simple member search.

**Acceptance criteria**:

- An approved member can edit name, first name, and bio.
- Another member can open the card and see the X link.
- The sponsor/sponsored relation is stored and retrievable according to privacy rules.
- A member can find another member through simple search.

**Imported implementation issues**:

- `webapp-nextjs#5` - Profile/search parent.
- `webapp-nextjs#13` - Editable profile.
- `webapp-nextjs#17` - Sponsor relation.
- `webapp-nextjs#18` - Member search.
- `webapp-nextjs#19` - Member card and X link.

## US3 - Canaux et Messages MVP

Source: `https://github.com/Marche-Libre/le-marche-libre/issues/15`

**User story**: As an approved member, I want to exchange in thematic channels so I can find information and opportunities.

**Includes**:

- Chat interface with channel list.
- Target launch channels: `General`, `Business`, `Politique`, `Divers`, `Jobs` unless owner decision changes taxonomy.
- Admin-only channel creation.
- Read and participate for approved members.
- Reply with scroll/open behavior if retained.
- Mentions.
- One pinned message per channel, admin only.
- Edit/delete own messages.
- Link preview if retained.
- Search over retained MVP channels.
- Jobs channel admin-write only.

**Acceptance criteria**:

- An approved member can read and post in allowed channels.
- Only admins can create channels.
- Only admins can publish in Jobs.
- Retained message interactions are documented and testable.
- Search can find retained MVP channel content and open a result.

**Imported implementation issues**:

- `webapp-nextjs#4` - Channels/messages parent.
- `webapp-nextjs#20` - Channel shell/navigation.
- `webapp-nextjs#21` - Message list/composer.
- `webapp-nextjs#23` - Link preview.
- `webapp-nextjs#24` - Jobs permissions.
- `webapp-nextjs#25` - Global channel search.
- `webapp-nextjs#26` - Reply, mentions, pin.

## Non-Core Imported Feature

| Feature | Source | Destination | Note |
| --- | --- | --- | --- |
| Landing Page | `webapp-nextjs#2` | `../005-landing-page/spec.md` | Imported from Project 1 but beta-blocking status is undecided. |
