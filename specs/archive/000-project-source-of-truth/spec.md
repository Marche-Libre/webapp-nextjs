# Feature Specification: Project Source of Truth Migration

**Feature Branch**: `000-project-source-of-truth`  
**Created**: 2026-04-26  
**Status**: Imported source-of-truth baseline  
**Input**: User request to remove GitHub Project as the project-management system by importing GitHub Project 1, `Marche-Libre/le-marche-libre` documentation, user stories, issues, roadmap, and feature work into Speckit in one batch.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import External Project State (Priority: P1)

A maintainer needs the whole GitHub Project and external documentation state imported into Speckit without manually creating one feature at a time.

**Why this priority**: GitHub Project cannot be removed until its content is represented locally with traceable destinations.

**Independent Test**: A reviewer can open `sources.md` and confirm that every Project 1 item, every imported documentation file, and every relevant issue has a local Speckit destination.

**Acceptance Scenarios**:

1. **Given** GitHub Project 1 contains 26 items, **When** the import is complete, **Then** all 26 items appear in `sources.md` with a destination feature or project-index record.
2. **Given** `Marche-Libre/le-marche-libre` contains docs `00..06`, **When** the import is complete, **Then** each doc is represented in roadmap, milestones, decisions, or a feature spec.
3. **Given** product user stories exist as GitHub issues, **When** the import is complete, **Then** the corresponding Speckit feature specs contain their acceptance criteria and source links.

---

### User Story 2 - Use Speckit as the Single Source of Truth (Priority: P1)

A contributor needs one active project-management location and must not have to inspect `docs/project-management`, archived APP_REFINEMENT notes, or GitHub Project columns to know what is next.

**Why this priority**: Multiple active planning surfaces created confusion and duplicated status.

**Independent Test**: Starting from the root README, a contributor reaches `specs/000-project-source-of-truth/README.md` and can identify active milestones, roadmap, user-story features, tasks, sources, and decisions.

**Acceptance Scenarios**:

1. **Given** a contributor opens `README.md`, **When** they follow the project-management pointer, **Then** they land in the Speckit source-of-truth directory.
2. **Given** old cleanup records still exist for provenance, **When** a contributor checks active guidance, **Then** those records are clearly archived and not required for active planning.

---

### User Story 3 - Retire GitHub Project Safely (Priority: P2)

An owner needs GitHub Project to become removable after the Speckit import is verified.

**Why this priority**: The stated goal is to stop using GitHub Project for management while preserving the information currently stored there.

**Independent Test**: A reviewer can compare the Project 1 export against `sources.md` and confirm that each item has a local destination before any destructive action is taken.

**Acceptance Scenarios**:

1. **Given** Project 1 is still online, **When** the import is verified, **Then** the owner can decide to freeze or delete it with a pointer to `specs/000-project-source-of-truth/README.md`.
2. **Given** an imported Project item has a status, scope, size, or milestone field, **When** it is moved to Speckit, **Then** those fields remain visible as imported metadata, not as uncontrolled active status.

### Edge Cases

- A Project item duplicates a product user story and a webapp implementation issue.
- A Project status says `Ready` but the code audit says the feature is already partially implemented.
- A source document says GitHub remains the pilotage system, but the local direction now makes Speckit the source of truth.
- A GitHub issue is not in Project 1 but still matters for product framing history.
- A feature is already implemented in code but needs rescoping rather than implementation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST keep `.specify/` as Speckit tooling and MUST NOT treat it as project-management content.
- **FR-002**: The project MUST use `specs/000-project-source-of-truth/` as the active entrypoint for project management.
- **FR-003**: The import MUST represent all 26 GitHub Project 1 items with source URL, repository, issue number, imported status, scope, size, milestone, and local destination when available.
- **FR-004**: The import MUST represent `Marche-Libre/le-marche-libre` docs `00-cadrage.md` through `06-etat-webapp-nextjs.md`.
- **FR-005**: The import MUST convert core user-story issues into Speckit feature specs instead of leaving them only in GitHub.
- **FR-006**: The import MUST create Speckit feature directories for Admission, Profile/Search, Channels/Messages, Release Readiness, and Landing Page.
- **FR-007**: Each generated feature MUST include `spec.md`, `plan.md`, and `tasks.md`.
- **FR-008**: Old project-management cleanup records MUST be archived and MUST NOT remain the active source of truth.
- **FR-009**: GitHub Project MUST NOT be deleted, frozen, or modified until import coverage is verified and the owner explicitly confirms the action.
- **FR-010**: The migration MUST remain docs/planning-only and MUST NOT change runtime app behavior.

### Key Entities

- **Imported Source**: A GitHub Project item, GitHub issue, or external markdown document with provenance and local destination.
- **Speckit Feature**: A feature directory under `specs/` containing requirements, plan, and tasks.
- **Milestone**: A roadmap phase or GitHub milestone used to organize imported work.
- **Owner Decision**: A question that must be answered before implementation or decommission.

## Brownfield Context *(mandatory)*

- **Current behavior**: Project-management state was split across GitHub Project 1, `Marche-Libre/le-marche-libre`, `docs/project-management`, old `APP_REFINEMENT` archives, and Speckit cleanup artifacts.
- **Affected surface**: Documentation/planning files only: `README.md`, `AGENTS.md`, `specs/`, archived project-management records, and Speckit metadata.
- **Compatibility risks**: Removing GitHub Project without complete import would lose issue statuses, Project fields, and feature grouping. Runtime code is intentionally out of scope.
- **Out of scope**: Implementing app features, changing Supabase schema, fixing tests/lint, deleting GitHub Project without owner confirmation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of GitHub Project 1 items visible in the authenticated export are listed in `sources.md`.
- **SC-002**: 100% of core user-story Project items have a destination Speckit feature directory.
- **SC-003**: A contributor reaches the active source of truth from `README.md` in one link.
- **SC-004**: No active project-management entrypoint points to `docs/project-management` after migration.
- **SC-005**: Git diff for this migration contains no runtime app files, Supabase migrations, dependency manifests, generated types, or tests.

## Assumptions

- Speckit remains the desired workflow and `.specify/` remains installed.
- GitHub Project 1 remains available until the owner verifies the Speckit import.
- Project status fields are imported as historical metadata; implementation readiness is determined by Speckit tasks and code review.
- Closed external issues may be retained in `sources.md` for context but do not become active implementation tasks unless mapped explicitly.
