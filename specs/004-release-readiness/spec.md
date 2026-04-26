# Feature Specification: Release Readiness and Backlog Realignment

**Feature Branch**: `004-release-readiness`  
**Created**: 2026-04-26  
**Status**: Imported from roadmap, risks, governance, audit, and Project items  
**Input**: Import roadmap phases, risk register, governance questions, architecture/scope/vision Project items, and webapp audit into Speckit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintainer Freezes and Reclassifies Work (Priority: P1)

A maintainer needs to freeze new feature expansion and classify existing work as release blocker, MVP gap, parked feature, done, partial, or missing.

**Why this priority**: The audit says the code is ahead of specs while the backlog still shows many open issues, so execution cannot be trusted until status is reconciled.

**Independent Test**: The maintainer can open the Speckit features and determine which items are blockers, retained MVP work, parked, or waiting on owner decisions.

**Acceptance Scenarios**:

1. **Given** an imported GitHub issue is open, **When** it is reviewed against code, **Then** it is classified as done, partial, missing, parked, or rescoped.
2. **Given** a feature exists in code but is outside Beta 1 scope, **When** backlog is realigned, **Then** it is marked tolerated, hidden, or parked.

---

### User Story 2 - Technical Owner Restores Reproducibility (Priority: P1)

A technical/schema owner needs the app and database state to be reproducible enough for beta maintenance.

**Why this priority**: The audit identifies schema drift and non-green quality gates as critical risks.

**Independent Test**: A reviewer can follow documented environment/schema steps and understand which DB objects are versioned, missing, or explicitly blocked.

**Acceptance Scenarios**:

1. **Given** the app references DB objects, **When** reproducibility is reviewed, **Then** missing views/tables/columns are listed and assigned a remediation path.
2. **Given** quality commands are run, **When** they fail, **Then** failures are documented with owner decision on the minimal beta gate.

---

### User Story 3 - Owner Decides Beta Gate (Priority: P1)

An owner needs clear go/no-go criteria for closed beta so the team stops expanding scope before the critical path is stable.

**Why this priority**: Closed beta should start only after admission, access, conversations, ownership, and blockers are under control.

**Independent Test**: The owner can read the beta gate and make a go/no-go decision without consulting GitHub Project.

**Acceptance Scenarios**:

1. **Given** release blockers are listed, **When** a blocker remains open, **Then** beta go is blocked unless the owner explicitly accepts the risk.
2. **Given** the team wants to delete GitHub Project, **When** the Speckit import is verified, **Then** project deletion can be approved separately.

### Edge Cases

- Build passes but lint and tests fail.
- Production/preproduction DB has objects missing from migrations.
- Current code contains features outside the PRD.
- GitHub Project status conflicts with observed code reality.
- Ownership of Supabase, GitHub org, Vercel, or X OAuth is unclear.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST classify active work into release blockers, MVP gaps, parked features, and owner decisions.
- **FR-002**: The project MUST stop using GitHub Project status as active project state after import.
- **FR-003**: The project MUST define owners for product, technical execution, schema/Supabase, and critical admin access before beta.
- **FR-004**: The project MUST define a minimal quality gate before merge/beta.
- **FR-005**: The project MUST reconcile schema objects referenced by code but not confirmed in versioned migrations.
- **FR-006**: The project MUST document and prioritize critical risks from the imported risk register.
- **FR-007**: The project MUST decide how to handle features already coded but outside Beta 1 scope.
- **FR-008**: The project MUST update or recommend closure/rescope for imported GitHub issues based on code evidence.
- **FR-009**: The project MUST define beta go/no-go criteria.
- **FR-010**: GitHub Project decommission MUST wait for source coverage review and explicit owner confirmation.

### Key Entities

- **Release Blocker**: Issue or risk that blocks closed beta unless accepted explicitly.
- **MVP Gap**: Retained Beta 1 capability that is missing or incomplete.
- **Parked Feature**: Existing or requested behavior outside Beta 1 execution.
- **Owner**: Person accountable for product, technical, schema, or access decisions.
- **Quality Gate**: Required verification set before merge or beta.

## Brownfield Context *(mandatory)*

- **Current behavior**: Audit says the app is an advanced prototype with auth, onboarding, forum, directory, profile, notifications, sponsorships, admin, and chat; build passes, lint fails, vitest partially fails, CI absent, schema not fully reproducible.
- **Affected surface**: Planning, issue status, release gate, schema reproducibility plan, quality gate policy, owner/access decisions.
- **Compatibility risks**: Continuing implementation without status reconciliation can duplicate work, ignore real blockers, or ship features outside product promise.
- **Out of scope**: Direct code fixes unless spawned by feature specs; deleting GitHub Project without owner confirmation; expanding product scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of imported Project items have a Speckit destination and no active dependency on GitHub Project status.
- **SC-002**: All release blockers have an owner, destination feature, and next action.
- **SC-003**: The schema reproducibility review lists every known missing object from the audit with a remediation status.
- **SC-004**: The beta quality gate is explicitly selected and recorded.
- **SC-005**: The owner can make a closed-beta go/no-go decision from Speckit without opening GitHub Project.

## Assumptions

- The team wants closed beta before public launch.
- The code audit from `06-etat-webapp-nextjs.md` is treated as source evidence until rechecked.
- Speckit import does not automatically close GitHub issues; closure/rescope remains a follow-up action after owner review.
