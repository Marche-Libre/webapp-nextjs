# Feature Specification: Admission Membre MVP

**Feature Branch**: `001-admission-membre`  
**Created**: 2026-04-26  
**Status**: Imported from GitHub Project 1 and PRD  
**Input**: Import US1 Admission membre MVP from `le-marche-libre#16`, `webapp-nextjs#1,#3,#6,#7,#14,#16`, PRD, roadmap, and webapp audit into Speckit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Candidate Requests Access (Priority: P1)

A candidate coming from X wants to authenticate, provide required onboarding information, and submit an access request so they can join the private club.

**Why this priority**: Admission is the first gate of the product and blocks every member-only experience.

**Independent Test**: A new candidate can sign in with X, complete required onboarding fields, submit sponsor information, and reach a pending state without errors.

**Acceptance Scenarios**:

1. **Given** a candidate has a valid X account, **When** they sign in, **Then** a session is created and reused across the app.
2. **Given** a candidate is onboarding, **When** they submit email and one or more sponsor handles, **Then** validations run and the access request is recorded.
3. **Given** onboarding finalization is submitted, **When** the request succeeds, **Then** the user reaches the expected pending or app access state without a 500 loop.

---

### User Story 2 - Admin Reviews Requests (Priority: P1)

An admin wants to see pending access requests and approve or refuse candidates so membership remains controlled.

**Why this priority**: The MVP promise is a private approved network, not open registration.

**Independent Test**: An admin can review a pending request, approve or refuse it, and observe the candidate's resulting access state.

**Acceptance Scenarios**:

1. **Given** a pending candidate exists, **When** an admin opens the review surface, **Then** the request appears with enough information to decide.
2. **Given** an admin approves a candidate, **When** the candidate signs in again, **Then** they can access approved-member areas.
3. **Given** an admin refuses a candidate, **When** the candidate signs in again, **Then** they see the refused-member experience selected by product decision.

---

### User Story 3 - Access Follows Member Status (Priority: P1)

A signed-in user must be routed according to membership status so pending/refused users cannot access member-only features.

**Why this priority**: Access integrity protects the private network and prevents unfinished onboarding from bypassing review.

**Independent Test**: Pending, refused, and approved accounts are tested against protected routes and see the correct state.

**Acceptance Scenarios**:

1. **Given** a pending user, **When** they access protected content, **Then** they see the waiting state.
2. **Given** a refused user, **When** they access protected content, **Then** they see the selected refused-state experience.
3. **Given** an approved user, **When** they access protected content, **Then** they enter the app.

### Edge Cases

- Onboarding finalization returns a server/database error.
- A candidate enters an invalid or unknown sponsor handle.
- Unknown sponsor feedback is set but not visible after submission, leaving the
  candidate without confirmation.
- The app has both invitation and sponsorship-request mechanisms active.
- An admin tries to approve a request twice or reverse a decision.
- A non-admin attempts to access review actions.
- A non-admin attempts to self-update `profiles.status` directly through the
  Supabase client/API rather than using admin actions.
- X OAuth succeeds but required profile fields are incomplete.
- X OAuth succeeds on first login but the user is redirected back to
  `/connexion`; a second login then enters the app.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Candidates MUST authenticate with X for Beta 1 admission.
- **FR-001a**: After a successful X OAuth callback, the session/profile routing MUST complete on the first login attempt without requiring a second X login.
- **FR-002**: The onboarding flow MUST collect at minimum email and sponsor handle information.
- **FR-003**: The onboarding flow MUST avoid the reported finalization 500/loop and provide a recoverable error state if submission fails.
- **FR-004**: Member status MUST support `pending`, `approved`, and `refused` access states.
- **FR-005**: Pending candidates MUST be blocked from approved-member content.
- **FR-006**: Refused candidates MUST be blocked from approved-member content and shown the selected refusal experience.
- **FR-007**: Approved members MUST be allowed into the app after successful session validation.
- **FR-008**: Admins MUST be able to list and review pending access requests.
- **FR-009**: Admins MUST be able to approve or refuse a request.
- **FR-010**: Non-admin users MUST NOT be able to approve, refuse, or bypass access review.
- **FR-011**: The selected admission data model MUST be explicit before implementation if both invitations and sponsorship requests remain present.

### Key Entities

- **Candidate**: A signed-in X user requesting access.
- **Member Profile**: The local profile carrying identity, onboarding state, and access status.
- **Sponsor Reference**: One or more sponsor handles submitted during onboarding.
- **Access Request**: Reviewable request from a candidate to become an approved member.
- **Admin Review Action**: Approval or refusal decision with authorization controls.

## Brownfield Context *(mandatory)*

- **Current behavior**: The audit reports X auth, callback OAuth, protected routes, waiting page, onboarding, sponsor/invitation flows, and admin review already exist in some form.
- **Affected surface**: Auth/session flow, onboarding pages, protected-route guards, admin review surface, profile/member status data, sponsorship/invitation data, tests for admission utilities.
- **Compatibility risks**: `webapp-nextjs#1` reports onboarding finalization 500/loop. The admission model may be too complex because both `invitations` and `sponsorship_requests` appear in the current state. DB/RLS reproducibility must be checked before hardening.
- **New findings from QA planning**: Unknown-sponsor submission currently hides its non-disclosing success/feedback copy after submit. Profile RLS must be checked first because a broad own-profile update policy may allow non-admin self-approval while `status` lives on `profiles`. A reported OAuth/session bug redirects first X login back to `/connexion`, while the second login enters the app.
- **Out of scope**: Public signup, non-X auth, AI matching, broad profile redesign, payment, or deleting historical admission data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A candidate can complete admission submission without a 500 error in the reviewed test scenario.
- **SC-001a**: A candidate who completes X OAuth reaches the correct pending, onboarding, or app destination on the first callback attempt.
- **SC-002**: Pending, refused, and approved statuses each produce the expected access result in manual or automated checks.
- **SC-003**: Non-admin approval/refusal attempts are rejected in server/database-enforced checks.
- **SC-004**: Admin review can process a pending request in under 3 minutes from the review surface.
- **SC-005**: The admission issue set has a local Speckit task for every imported source issue.

## Assumptions

- X OAuth remains the only Beta 1 authentication method.
- Email and sponsor handles are sufficient minimum onboarding data for Beta 1.
- Exact refused-member UX is an owner decision tracked in `../archive/000-project-source-of-truth/decisions.md`.
- Runtime implementation must verify current code before deciding whether each imported GitHub issue is done, partial, missing, or rescoped.
