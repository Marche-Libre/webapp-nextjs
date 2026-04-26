# Feature Specification: Profil et Recherche Membre MVP

**Feature Branch**: `002-profil-recherche-membre`  
**Created**: 2026-04-26  
**Status**: Imported from GitHub Project 1 and PRD  
**Input**: Import US2 Profil et recherche membre MVP from `le-marche-libre#17`, `webapp-nextjs#5,#13,#17,#18,#19`, PRD, and webapp audit into Speckit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Member Maintains Core Profile (Priority: P1)

An approved member wants to edit their core profile fields so other members can understand who they are.

**Why this priority**: The network value depends on members being identifiable and credible.

**Independent Test**: An approved member updates name, first name, and bio, then sees the saved values in their own profile.

**Acceptance Scenarios**:

1. **Given** an approved member opens profile editing, **When** they update name, first name, and bio, **Then** the changes are saved and visible.
2. **Given** a profile save fails, **When** the member submits, **Then** the app gives clear feedback without losing entered data.

---

### User Story 2 - Member Opens Another Member Card (Priority: P1)

An approved member wants to open another member's simple card and see bio plus X link.

**Why this priority**: The PRD requires member discovery and identity connection back to X.

**Independent Test**: A member opens another member's card from an avatar or search result and sees bio and X link.

**Acceptance Scenarios**:

1. **Given** a member appears in the app, **When** another approved member opens their card, **Then** the bio and X profile link are visible.
2. **Given** sponsor/private fields exist, **When** another normal member views the card, **Then** private sponsorship data is not leaked.

---

### User Story 3 - Member Searches Members (Priority: P1)

An approved member wants to search for another member by simple profile identifiers.

**Why this priority**: Discovery is part of the beta promise and supports conversations/opportunities.

**Independent Test**: A member searches using a retained MVP identifier and can open the intended member card.

**Acceptance Scenarios**:

1. **Given** approved members exist, **When** a member searches by retained MVP fields, **Then** matching members are displayed.
2. **Given** no result matches, **When** a member searches, **Then** an empty state appears without error.

### Edge Cases

- A profile has X identity but missing editable fields.
- Search returns many members.
- Sponsor relation exists but should only be visible to self/admin.
- The app references `profiles_public` but the object is not reproducible from migrations.
- Profile scope is larger than the PRD and needs parking/rescoping.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Approved members MUST be able to edit core profile fields: name, first name, and bio.
- **FR-002**: The member profile MUST retain X-based identity: handle and photo when available.
- **FR-003**: Members MUST be able to open a simple member card.
- **FR-004**: The member card MUST expose the member bio and X profile link when available.
- **FR-005**: The system MUST store and retrieve sponsor/sponsored relationship data needed by the MVP.
- **FR-006**: Sponsor visibility MUST respect the retained privacy rule and must not leak sensitive sponsorship data to unauthorized members.
- **FR-007**: Approved members MUST be able to search members using the retained MVP search fields.
- **FR-008**: Search MUST provide clear results and empty states.
- **FR-009**: Profile/search implementation MUST resolve or avoid unreproducible `profiles_public` dependencies before beta.
- **FR-010**: Enriched profile features beyond Beta 1 MUST be parked unless explicitly retained.

### Key Entities

- **Member Profile**: Approved member identity, editable core fields, X handle/photo, and public card fields.
- **Member Card**: Readable profile summary for other approved members.
- **Sponsor Relation**: Relationship between sponsor and sponsored member/candidate.
- **Member Search Result**: Result entry that allows opening the member card.

## Brownfield Context *(mandatory)*

- **Current behavior**: Audit reports directory/member profiles, editable profile, member detail, member search, and sponsor relation exist in some form.
- **Affected surface**: Profile editing, member card/detail views, member search, sponsorship relation reads, profile visibility/privacy, schema objects such as `profiles_public`.
- **Compatibility risks**: `profiles_public` appears used by code but not confirmed in migrations. Existing profile scope is larger than the PRD and may need parking rather than expansion.
- **Out of scope**: Full rich profile redesign, availability/skills/rates/website expansion, AI matching, public directory access.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An approved member can update core profile fields and see the saved values.
- **SC-002**: A member can open another member card and see a valid X link when one exists.
- **SC-003**: Member search returns relevant results for the retained MVP search fields.
- **SC-004**: Unauthorized users cannot see private sponsor data.
- **SC-005**: The `profiles_public` dependency is either reproducible from versioned schema or removed from runtime dependency.

## Assumptions

- Only approved members can access member discovery features.
- X handle/photo remain identity anchors for Beta 1.
- Exact sponsor visibility is an owner/product decision if current behavior conflicts with privacy expectations.
- Existing richer profile features can remain only if they do not increase beta risk.
