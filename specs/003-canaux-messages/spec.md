# Feature Specification: Canaux et Messages MVP

**Feature Branch**: `003-canaux-messages`  
**Created**: 2026-04-26  
**Status**: Imported from GitHub Project 1 and PRD  
**Input**: Import US3 Canaux et messages MVP from `le-marche-libre#15`, `webapp-nextjs#4,#20,#21,#23,#24,#25,#26`, PRD, and webapp audit into Speckit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Member Uses Launch Channels (Priority: P1)

An approved member wants to see the launch channels, navigate between them, read messages, and post where allowed.

**Why this priority**: Conversations are the core retained value after admission.

**Independent Test**: An approved member opens the chat shell, switches channels, reads messages, and sends a message in an allowed channel.

**Acceptance Scenarios**:

1. **Given** an approved member opens chat, **When** launch channels are available, **Then** the channel list and current channel are visible.
2. **Given** an approved member is in a normal channel, **When** they send a message, **Then** the message appears in the channel.
3. **Given** a non-approved user attempts to access channels, **When** access is checked, **Then** they are blocked by admission status.

---

### User Story 2 - Jobs Channel Is Admin-Write (Priority: P1)

An approved member can read Jobs content, but only admins can publish in the Jobs channel.

**Why this priority**: Jobs is explicitly in the PRD and has special permission semantics.

**Independent Test**: Admin and non-admin users are tested against Jobs read/write behavior.

**Acceptance Scenarios**:

1. **Given** an approved non-admin member opens Jobs, **When** they view the channel, **Then** they can read but cannot publish.
2. **Given** an admin opens Jobs, **When** they publish, **Then** the message is accepted.
3. **Given** a non-admin attempts to bypass the UI, **When** they attempt to publish to Jobs, **Then** the server/database rejects it.

---

### User Story 3 - Member Uses Retained Message Interactions (Priority: P2)

An approved member wants to use retained message interactions such as reply, mentions, pin rules, link preview, edit/delete, and search according to the final Beta scope.

**Why this priority**: These interactions improve utility but some are scope-dependent and must not block stabilization if parked.

**Independent Test**: Each retained interaction can be tested independently in a channel without breaking basic messaging.

**Acceptance Scenarios**:

1. **Given** reply remains in scope, **When** a member replies to a message, **Then** the reply relationship and scroll/open behavior work.
2. **Given** mentions remain in scope, **When** a member mentions another member, **Then** the mention is represented without exposing unauthorized data.
3. **Given** an admin pins a message, **When** the channel is viewed, **Then** only one retained pinned message is visible according to rules.
4. **Given** a link is shared, **When** preview is available, **Then** messaging remains usable even if preview fails.
5. **Given** a member searches retained channels, **When** matching content exists, **Then** the member can open the found message.

### Edge Cases

- Current channel taxonomy does not match the PRD launch channels.
- Current code has forum/DM/reactions/report features beyond Beta 1.
- Reply is in PRD but audit says no clear reply model exists.
- Search currently covers only active channel, not global retained channels.
- Link preview exists only for forum embeds, not generic links.
- Jobs channel or admin-write policy is missing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Approved members MUST be able to read and post in allowed launch channels.
- **FR-002**: Launch channel taxonomy MUST be explicitly selected before final implementation.
- **FR-003**: Channel creation MUST be admin-only for Beta 1.
- **FR-004**: Jobs channel MUST be readable by approved members and writable only by admins if retained as a launch channel.
- **FR-005**: Members MUST be able to see message lists and use a composer in allowed channels.
- **FR-006**: Retained message interactions MUST be implemented or explicitly parked: reply, mentions, pin, edit/delete, link preview, and global channel search.
- **FR-007**: Search MUST cover the retained MVP channel scope once finalized.
- **FR-008**: Non-admin users MUST NOT be able to pin/admin-moderate or publish to admin-only Jobs through server/database bypass.
- **FR-009**: Forum, DMs, reactions, reports/blocks, channel proposals, and hidden-channel features MUST be classified as retained, tolerated, hidden, or parked before beta.

### Key Entities

- **Channel**: A retained conversation space with name, permissions, and launch-scope status.
- **Message**: Content posted by an approved member in a channel.
- **Message Interaction**: Reply, mention, pin, edit/delete, preview, or search result behavior retained for Beta 1.
- **Jobs Permission Rule**: Special read/write policy for the Jobs channel.

## Brownfield Context *(mandatory)*

- **Current behavior**: Audit reports chat shell, salon navigation, message list, composer, mentions, admin pin, active-channel search, image upload, reactions, DMs, and forum exist in some form.
- **Affected surface**: Chat routes/components, channel seed/taxonomy, message actions, channel permissions, Jobs policy, search, preview behavior, forum/DM parked-feature decisions.
- **Compatibility risks**: Current seeded channels differ from PRD; reply model may be absent; Jobs channel/admin-write rule may be missing; out-of-scope features can confuse beta if visible.
- **Out of scope**: AI matching, advanced moderation backoffice, monetization, mobile, full forum expansion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An approved member can read and post in an allowed retained channel.
- **SC-002**: A non-admin cannot publish in Jobs if Jobs remains in launch scope.
- **SC-003**: An admin can publish in Jobs if Jobs remains in launch scope.
- **SC-004**: Retained message interactions each have a done/parked decision before beta.
- **SC-005**: Search behavior matches the retained channel scope and can open a found message.

## Assumptions

- Approved-member access is provided by `001-admission-membre`.
- Channel taxonomy and forum beta position are owner decisions tracked in `../archive/000-project-source-of-truth/decisions.md`.
- Existing chat functionality should be adapted, not rebuilt, unless audit proves it is unsafe or unreproducible.
