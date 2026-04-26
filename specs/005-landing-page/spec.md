# Feature Specification: Landing Page

**Feature Branch**: `005-landing-page`  
**Created**: 2026-04-26  
**Status**: Imported from GitHub Project 1  
**Input**: Import separate Project item `webapp-nextjs#2` into Speckit so it is no longer tracked only in GitHub Project.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor Understands the Product (Priority: P2)

A visitor wants to immediately understand what Le Marche Libre is and what action they can take next.

**Why this priority**: The landing page helps acquisition, but it is not listed as a core Beta 1 blocker compared with admission, profile/search, channels/messages, and release readiness.

**Independent Test**: A first-time visitor can explain the product and identify the call to action after viewing the landing page.

**Acceptance Scenarios**:

1. **Given** a visitor opens the landing page, **When** the page loads, **Then** the product proposition is immediately understandable.
2. **Given** a visitor wants to continue, **When** they look for the next action, **Then** a clear call to action is visible.
3. **Given** the beta scope is closed/private, **When** the visitor reads the landing page, **Then** the access expectation is not misleading.

### Edge Cases

- The landing page promises features parked for Beta 1.
- The call to action conflicts with closed-beta admission.
- Existing legal/product pages already cover part of the message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing page MUST communicate what Le Marche Libre is in plain language.
- **FR-002**: The landing page MUST include one clear primary call to action.
- **FR-003**: The landing page MUST not promise features outside the signed beta scope.
- **FR-004**: The landing page MUST align with closed-beta access if the launch remains private.
- **FR-005**: This feature MUST be classified as beta-blocking, separate, or parked during release-readiness review.

### Key Entities

- **Visitor**: A non-member or candidate viewing the product entrypoint.
- **Call to Action**: The primary next step, such as request access or sign in.
- **Product Proposition**: Short explanation of the private club/network value.

## Brownfield Context *(mandatory)*

- **Current behavior**: The repository README and imported audit report state a landing page and legal pages are already present.
- **Affected surface**: Landing page copy, CTA, public entrypoint, possible legal/product links.
- **Compatibility risks**: Landing messaging can over-promise parked features or imply open access when the product is closed beta.
- **Out of scope**: Redesigning the whole marketing site, SEO program, or public launch campaign.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time reviewer can state the product proposition after reading the hero section.
- **SC-002**: The page has exactly one primary CTA aligned with the current access model.
- **SC-003**: No landing copy promises out-of-scope features listed in the PRD.

## Assumptions

- Landing Page is imported because it exists in GitHub Project, not because it is necessarily a Beta 1 blocker.
- Release readiness will decide whether this work is parked or scheduled before beta.
