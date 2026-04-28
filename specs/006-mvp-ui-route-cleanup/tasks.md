# Tasks: MVP UI Route Cleanup

**Input**: Design documents from `/specs/006-mvp-ui-route-cleanup/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-route-contract.md`, `quickstart.md`

**Tests**: Redirect/admission changes require focused automated tests or an explicit documented reason when not feasible. This feature requires `npm run build`, targeted relevant tests when present, and a forbidden-file diff check.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches a different file and has no dependency on incomplete tasks
- **[Story]**: User story label from `spec.md`
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the feature context and protect forbidden surfaces before runtime edits.

- [X] T001 Verify current feature implementation context in specs/006-mvp-ui-route-cleanup/plan.md
- [X] T002 Verify user-facing route contract in specs/006-mvp-ui-route-cleanup/contracts/ui-route-contract.md
- [X] T003 Record the pre-implementation forbidden-file baseline using git diff for supabase package.json package-lock.json bun.lock yarn.lock pnpm-lock.yaml in specs/006-mvp-ui-route-cleanup/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the route and UI baseline that all user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Review current route/default drift inventory in app_flow.md
- [X] T005 Review known release-readiness route and quality baseline in specs/004-release-readiness/phase-2-audit.md
- [X] T006 Review Next.js redirect and navigation constraints referenced in specs/006-mvp-ui-route-cleanup/research.md
- [X] T007 Create focused route-cleanup regression test scaffolding in src/__tests__/mvp-route-cleanup.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Membre approuvé arrive sur le chat (Priority: P1) MVP

**Goal**: Approved and onboarded members land on `/chat` from default post-admission, onboarding, waiting, admin fallback, logo/sidebar, and settings return paths.

**Independent Test**: Exercise the known default-destination flows and confirm they route to `/chat` without routing through Forum.

### Tests for User Story 1

- [X] T008 [US1] Add redirect expectation coverage for approved/onboarded default app entry in src/__tests__/mvp-route-cleanup.test.ts
- [X] T009 [US1] Add redirect expectation coverage for onboarding completion, waiting approval, admin fallback, and settings return in src/__tests__/mvp-route-cleanup.test.ts

### Implementation for User Story 1

- [X] T010 [US1] Change approved/onboarded public-auth default destination from /forum to /chat in src/lib/supabase/middleware.ts
- [X] T011 [US1] Change OAuth callback default and approved/onboarded destination from /forum to /chat in src/app/auth/callback/route.ts
- [X] T012 [US1] Change already-onboarded onboarding page destination from /forum to /chat in src/app/onboarding/page.tsx
- [X] T013 [US1] Change onboarding completion welcome link and hard redirect from /forum to /chat in src/components/onboarding/onboarding-wizard.tsx
- [X] T014 [US1] Change approved waiting-page destination from /forum to /chat in src/app/(auth)/en-attente/page.tsx
- [X] T015 [US1] Change approved status poller destination from /forum to /chat in src/components/sponsorship/status-poller.tsx
- [X] T016 [US1] Change non-admin admin fallback from /forum to /chat in src/app/(app)/admin/layout.tsx
- [X] T017 [US1] Change settings close/back destination from /forum to /chat in src/components/layout/settings-shell.tsx
- [X] T018 [US1] Change sidebar logo destination from /forum to /chat in src/components/layout/sidebar.tsx
- [X] T019 [US1] Change chat channel-list back destination from /forum to /chat in src/components/chat/channel-list.tsx

**Checkpoint**: User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Navigation MVP sans Forum ni Annuaire (Priority: P1)

**Goal**: Main member navigation keeps Chat visible but stops promoting Forum and Annuaire while legacy routes remain directly accessible.

**Independent Test**: Open the app shell on desktop/mobile and confirm Forum and Annuaire are absent from primary navigation while direct `/forum`, `/membres`, and `/membres/[id]` are not deleted.

### Tests for User Story 2

- [X] T020 [US2] Add navigation visibility expectations for Chat, Forum, and Annuaire in src/__tests__/mvp-route-cleanup.test.ts

### Implementation for User Story 2

- [X] T021 [US2] Remove Forum from the main community navigation array while keeping Chat in src/components/layout/sidebar.tsx
- [X] T022 [US2] Remove Annuaire from the main network navigation array while keeping retained entries in src/components/layout/sidebar.tsx
- [X] T023 [P] [US2] Verify legacy forum route files remain present in src/app/(app)/forum/page.tsx
- [X] T024 [P] [US2] Verify legacy member directory route files remain present in src/app/(app)/membres/page.tsx
- [X] T025 [P] [US2] Verify legacy member detail route files remain present in src/app/(app)/membres/[id]/page.tsx

**Checkpoint**: User Story 2 should be fully functional and testable independently.

---

## Phase 5: User Story 3 - Landing publique alignée avec la Beta 1 (Priority: P1)

**Goal**: Public landing and footer stop promising Forum, Annuaire, and offers/jobs as available Beta 1 features.

**Independent Test**: Read landing sections and footer; no public copy or platform link presents Forum, Annuaire, or offers/jobs as Beta 1 available features.

### Tests for User Story 3

- [X] T026 [US3] Add landing copy visibility expectations for Forum, Annuaire, and offers/jobs in src/__tests__/mvp-route-cleanup.test.ts

### Implementation for User Story 3

- [X] T027 [P] [US3] Remove Forum and Annuaire links from the public platform footer in src/app/page.tsx
- [X] T028 [P] [US3] Rewrite public feature cards to avoid Annuaire and offers/jobs promises in src/components/home/animated-features.tsx
- [X] T029 [P] [US3] Rewrite public step-three copy to avoid annonces, annuaire, and offres promises in src/components/home/animated-steps.tsx

**Checkpoint**: User Story 3 should be fully functional and testable independently.

---

## Phase 6: User Story 4 - Chat débarrassé des propositions hors MVP (Priority: P2)

**Goal**: Chat no longer displays proposal lists, proposal votes, proposal forms, or "Proposer un salon" controls.

**Independent Test**: Open chat and confirm the channel list contains retained channels and visibility controls but no proposal UI.

### Tests for User Story 4

- [X] T030 [US4] Add chat proposal visibility expectations in src/__tests__/mvp-route-cleanup.test.ts

### Implementation for User Story 4

- [X] T031 [US4] Remove proposal fetch state, vote handlers, proposal form state, and proposal constants from src/components/chat/channel-list.tsx
- [X] T032 [US4] Remove proposal list, vote controls, proposal form, and Proposer un salon button from src/components/chat/channel-list.tsx

**Checkpoint**: User Story 4 should be fully functional and testable independently.

---

## Phase 7: User Story 5 - Compatibilité legacy et refus explicite (Priority: P2)

**Goal**: Preserve legacy direct routes, convert obvious chat links to canonical slug routes where possible, and show an explicit rejected-user state.

**Independent Test**: Direct legacy routes still exist, header message search opens `/chat/[slug]` when slug is available, and rejected authenticated users see a clear refusal state rather than a silent `/connexion` redirect.

### Tests for User Story 5

- [X] T033 [US5] Add rejected-user admission-state expectations in src/__tests__/mvp-route-cleanup.test.ts
- [X] T034 [US5] Add chat slug-link expectation for message search results in src/__tests__/mvp-route-cleanup.test.ts

### Implementation for User Story 5

- [X] T035 [US5] Preserve rejected authenticated users on the status boundary instead of silently redirecting to /connexion in src/lib/supabase/middleware.ts
- [X] T036 [US5] Render a clear rejected-account state with controlled sign-out or exit copy in src/app/(auth)/en-attente/page.tsx
- [X] T037 [US5] Redirect rejected app-shell access to the explicit status boundary instead of /connexion in src/app/(app)/layout.tsx
- [X] T038 [US5] Change message search result links from /chat?channel=... to /chat/[slug] where channel slug is already selected in src/components/layout/header.tsx
- [X] T039 [US5] Document tolerated remaining /chat?channel=... mention notification link because only channel ID is available in specs/006-mvp-ui-route-cleanup/quickstart.md

**Checkpoint**: User Story 5 should be fully functional and testable independently.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate the full feature, update task state, and ensure forbidden surfaces remain untouched.

- [X] T040 Run targeted route-cleanup tests in src/__tests__/mvp-route-cleanup.test.ts
- [X] T041 Run npm run build and record the result in specs/006-mvp-ui-route-cleanup/quickstart.md
- [X] T042 Run changed-scope lint review for touched files and record any baseline-vs-regression notes in specs/006-mvp-ui-route-cleanup/quickstart.md
- [X] T043 Verify forbidden files were not modified using git diff for supabase package.json package-lock.json bun.lock yarn.lock pnpm-lock.yaml in specs/006-mvp-ui-route-cleanup/quickstart.md
- [X] T044 Verify all acceptance scenarios from specs/006-mvp-ui-route-cleanup/spec.md against specs/006-mvp-ui-route-cleanup/quickstart.md
- [X] T045 Update completed task checkboxes in specs/006-mvp-ui-route-cleanup/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational completion.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational; delivers the core MVP default-destination change.
- **US2 (P1)**: Can start after Foundational; independent except it shares `src/components/layout/sidebar.tsx` with US1, so sidebar tasks must be sequenced after T018.
- **US3 (P1)**: Can start after Foundational; independent public landing cleanup.
- **US4 (P2)**: Can start after Foundational; independent except it shares `src/components/chat/channel-list.tsx` with US1, so proposal-removal tasks must be sequenced after T019.
- **US5 (P2)**: Can start after US1 middleware/app-shell redirects are understood; direct legacy route verification is independent, but rejected routing shares middleware/layout/status files with US1.

### Within Each User Story

- Tests or explicit test scaffolding come before implementation tasks.
- Tasks touching the same file must be executed sequentially.
- Route/default changes should be validated before moving to UI promise cleanup.
- Story complete before marking its checkpoint as satisfied.

### Parallel Opportunities

- T023, T024, and T025 can run in parallel because they only verify different route files.
- T027, T028, and T029 can run in parallel because they touch different landing files.
- US3 can run in parallel with US2 after Foundational if no shared files are edited.
- US4 can run in parallel with US3 after T019 is complete.

---

## Parallel Example: User Story 3

```text
Task: "T027 [US3] Remove Forum and Annuaire links from the public platform footer in src/app/page.tsx"
Task: "T028 [US3] Rewrite public feature cards to avoid Annuaire and offers/jobs promises in src/components/home/animated-features.tsx"
Task: "T029 [US3] Rewrite public step-three copy to avoid annonces, annuaire, and offres promises in src/components/home/animated-steps.tsx"
```

## Parallel Example: User Story 2

```text
Task: "T023 [US2] Verify legacy forum route files remain present in src/app/(app)/forum/page.tsx"
Task: "T024 [US2] Verify legacy member directory route files remain present in src/app/(app)/membres/page.tsx"
Task: "T025 [US2] Verify legacy member detail route files remain present in src/app/(app)/membres/[id]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete US1 route/default destination tasks.
3. Validate approved/onboarded default app entry, onboarding completion, waiting approval, admin fallback, settings return, logo/sidebar, and chat-list back destination.
4. Stop and demo `/chat` as the primary post-admission destination.

### Incremental Delivery

1. Complete US1 to make `/chat` the default destination.
2. Complete US2 to hide Forum and Annuaire from member navigation.
3. Complete US3 to align public landing promises.
4. Complete US4 to hide channel proposal UI.
5. Complete US5 to finalize legacy compatibility, chat slug links, and rejected-user UX.
6. Complete Phase 8 validation and forbidden-file checks.

### Quality Gate Strategy

1. Run targeted test(s) for `src/__tests__/mvp-route-cleanup.test.ts` if added.
2. Run `npm run build`.
3. Inspect changed-scope lint issues for touched files.
4. Confirm no Supabase, migration, dependency, or lock files changed.

## Notes

- Direct route files for `/forum`, `/membres`, and `/membres/[id]` must not be deleted.
- Do not modify Supabase files, migrations, generated types, dependencies, or package locks.
- Leave contextual historical forum links alone unless they are default MVP entry points.
- Convert `/chat?channel=...` only where channel slug already exists in the current data shape.
