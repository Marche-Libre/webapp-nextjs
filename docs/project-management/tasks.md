# Local Task Records

## Task Record Template

```markdown
## TASK-ID - Title

- Priority: P0 | P1 | P2 | P3
- Status: proposed | ready | in-progress | blocked | done | archived
- Purpose:
- Scope:
- Out of scope:
- Completion criteria:
- Related local documents:
- External provenance:
- Dependencies:
- Last reviewed: YYYY-MM-DD
- Next action:

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
```

## Lifecycle Rules

Allowed transitions:

- `proposed -> ready`
- `ready -> in-progress`
- `in-progress -> blocked`
- `in-progress -> done`
- `blocked -> ready`
- `blocked -> in-progress`
- Any status -> `archived` (with reason)

Transition history is required for every record. Baseline imports can use
`n/a -> <status>` for the first normalization entry.

## Filename Status Normalization (APP_REFINEMENT)

| Filename token | Local lifecycle status | Rationale |
| --- | --- | --- |
| `TODO` | `proposed` | Work idea is defined but not yet explicitly prepared in local canonical board. |
| `READY` | `ready` | Work has explicit preconditions and can move to execution. |
| `STARTED` | `in-progress` | Workstream was already opened and should not be treated as backlog-only. |

## Normalized APP_REFINEMENT Work Items

## TASK-APP-00 - MVP Framing and Session Backbone

- Priority: P0
- Status: in-progress
- Purpose: Keep one canonical local record for MVP framing and the
  cross-session execution backbone previously spread across
  `TASK_00.STARTED.md` and session files.
- Scope: MVP framing constraints, execution order, and open runtime workstream
  sequencing captured from `TASK_00` source documents.
- Out of scope: Implementing runtime changes, migrations, route updates, or UI
  changes inside this cleanup.
- Completion criteria: One canonical record exists; session sources are merged;
  transition history reflects status evidence from source files.
- Related local documents:
  `docs/project-management/archive/app-refinement/TASK_00.STARTED.md`,
  `docs/project-management/archive/app-refinement/TASK_00.SESSION_00.TODO.md`,
  `docs/project-management/archive/app-refinement/TASK_00.SESSION_01.READY.md`,
  `docs/project-management/archive/app-refinement/TASK_00.SESSION_02.TODO.md`,
  `docs/project-management/archive/app-refinement/TASK_00.SESSION_03.READY.md`,
  `docs/project-management/archive/app-refinement/TASK_00.SESSION_04.TODO.md`,
  `docs/project-management/archive/app-refinement/TASK_00.SESSION_05.TODO.md`,
  `docs/project-management/archive/app-refinement/TASK_00.SESSION_06.TODO.md`,
  `docs/project-management/archive/app-refinement/TASK_00.SESSION_07.TODO.md`,
  `docs/project-management/decisions.md`
- External provenance: none (local source material)
- Dependencies: Owner decision on whether framing is still active vs reference-only.
- Last reviewed: 2026-04-26
- Next action: Resolve owner decision DEC-006, then move to `ready` or
  `archived` explicitly.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | proposed | in-progress | `TASK_00.STARTED.md` marks the workstream as started. | Normalize session files into one canonical record. |
| 2026-04-26 | in-progress | ready | Session files `SESSION_01` and `SESSION_03` include READY checkpoints. | Confirm if READY checkpoints were superseded. |
| 2026-04-26 | ready | in-progress | Later session files (`SESSION_02`, `SESSION_04`..`SESSION_07`) remain TODO and keep execution open. | Keep canonical status in-progress pending owner review. |

## TASK-APP-01 - Generate app_flow.md Reference Map

- Priority: P0
- Status: proposed
- Purpose: Maintain current and target app route/guard/redirect map.
- Scope: Route status classification, redirect matrix, flow diagrams, and known
  drift documentation.
- Out of scope: Changing routes, middleware, redirects, or navigation behavior.
- Completion criteria: `app_flow.md` remains current and separates observed vs
  target state.
- Related local documents:
  `docs/project-management/archive/app-refinement/TASK_01.TODO.md`,
  `app_flow.md`
- External provenance: none (local source material)
- Dependencies: `TASK-APP-02` for DB/RLS context when behavior coupling exists.
- Last reviewed: 2026-04-26
- Next action: Re-triage for `ready` when runtime implementation window opens.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from filename token `TODO`. | Promote to `ready` after owner scheduling review. |

## TASK-APP-02 - Generate db_flow.md Reference Map

- Priority: P1
- Status: proposed
- Purpose: Maintain current and target schema/RLS map before migration work.
- Scope: Table classification, RLS risk inventory, ERD, migration backlog notes.
- Out of scope: Applying migrations or changing DB runtime behavior.
- Completion criteria: `db_flow.md` stays aligned with observed schema and known
  MVP target constraints.
- Related local documents:
  `docs/project-management/archive/app-refinement/TASK_02.TODO.md`,
  `db_flow.md`
- External provenance: none (local source material)
- Dependencies: Access to current migration set and Supabase review context.
- Last reviewed: 2026-04-26
- Next action: Promote to `ready` after owner review of migration priority.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from filename token `TODO`. | Promote to `ready` after owner scheduling review. |

## TASK-APP-03 - Backup DB and Bootstrap Existing Admins

- Priority: P0
- Status: proposed
- Purpose: Safely bootstrap two existing profiles as approved onboarding-ready
  admins.
- Scope: Backup confirmation, defensive migration design, targeted validation.
- Out of scope: Recreating `auth.users`, broad seeding, or unrelated schema
  changes.
- Completion criteria: Backup + preflight checks + guarded migration + admin
  access verification.
- Related local documents: `docs/project-management/archive/app-refinement/TASK_03.TODO.md`
- External provenance: none (local source material)
- Dependencies: Confirmed Supabase target environment and backup availability.
- Last reviewed: 2026-04-26
- Next action: Keep proposed until execution window and owner approval.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from filename token `TODO`. | Promote to `ready` after environment/backup confirmation. |

## TASK-APP-04 - Admission Flow Hardening

- Priority: P0
- Status: proposed
- Purpose: Stabilize X/email/sponsor/admin admission semantics for MVP.
- Scope: DB/RLS hardening for admission fields, sponsor/admin separation, wait
  state clarity, audited bypass behavior.
- Out of scope: Unrelated product feature expansion.
- Completion criteria: Sponsor cannot grant final access, admin approval rules
  are enforced, one active sponsorship request per candidate, clear pending vs
  rejected UX.
- Related local documents: `docs/project-management/archive/app-refinement/TASK_04.TODO.md`
- External provenance: none (local source material)
- Dependencies: `TASK-APP-02`, `TASK-APP-03`.
- Last reviewed: 2026-04-26
- Next action: Promote to `ready` after admission security design review.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from filename token `TODO`. | Promote to `ready` after admission security signoff. |

## TASK-APP-05 - Admin Approval, Rejection, Reapproval, Bypass

- Priority: P0
- Status: proposed
- Purpose: Centralize and secure admin admission transitions with auditability.
- Scope: Controlled server/RPC actions, transition rules, UI controls, audit
  trail requirements.
- Out of scope: Notification expansion beyond agreed MVP minimum.
- Completion criteria: Valid transition controls, audited bypass with reason,
  non-admin failure paths.
- Related local documents: `docs/project-management/archive/app-refinement/TASK_05.TODO.md`
- External provenance: none (local source material)
- Dependencies: `TASK-APP-04`.
- Last reviewed: 2026-04-26
- Next action: Promote to `ready` after owner confirms bypass/rejection policy.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from filename token `TODO`. | Promote to `ready` after admin-policy decision review. |

## TASK-APP-06 - Navigation Refocus and Forum/Directory Withdrawal

- Priority: P0
- Status: proposed
- Purpose: Shift visible MVP surface to `/chat` while preserving controlled
  legacy behavior.
- Scope: Redirect strategy, navigation cleanup, forum/member legacy handling.
- Out of scope: Destructive DB drops of forum/legacy tables.
- Completion criteria: Main navigation no longer exposes forum/standalone
  directory; `/forum*` and `/membres` have controlled behavior.
- Related local documents:
  `docs/project-management/archive/app-refinement/TASK_06.TODO.md`,
  `app_flow.md`
- External provenance: none (local source material)
- Dependencies: `TASK-APP-01`, `TASK-APP-07`, `TASK-APP-08`.
- Last reviewed: 2026-04-26
- Next action: Promote to `ready` after owner confirms `/membres/[id]` stance.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from filename token `TODO`. | Promote to `ready` after navigation decision review. |

## TASK-APP-07 - Simplified Profile, Member Detail, and Chat Search

- Priority: P1
- Status: proposed
- Purpose: Preserve member discovery/detail without standalone directory.
- Scope: Chat member search, profile essentials, member detail access, privacy
  constraints for sponsorship/private fields.
- Out of scope: Full profile feature redesign.
- Completion criteria: Search by handle/name variants, defined member detail
  surface, no sponsorship data leakage to other members.
- Related local documents: `docs/project-management/archive/app-refinement/TASK_07.TODO.md`
- External provenance: none (local source material)
- Dependencies: `TASK-APP-06` and owner decision on member-detail destination.
- Last reviewed: 2026-04-26
- Next action: Promote to `ready` after DEC-008 owner decision.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from filename token `TODO`. | Promote to `ready` after member-detail product decision. |

## TASK-APP-08 - Chat MVP Channels and Jobs Admin-Only Posting

- Priority: P0
- Status: proposed
- Purpose: Enforce channel/message access model for MVP chat and Jobs write
  restrictions.
- Scope: Channel seeding strategy, RLS replacement, UI enforcement signals.
- Out of scope: Historical recruitment-content migration without owner decision.
- Completion criteria: Approved users can read Jobs, only admins can post Jobs,
  private-channel membership controls are enforced.
- Related local documents: `docs/project-management/archive/app-refinement/TASK_08.TODO.md`
- External provenance: none (local source material)
- Dependencies: `TASK-APP-02`, `TASK-APP-04`.
- Last reviewed: 2026-04-26
- Next action: Promote to `ready` once policy replacement plan is approved.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from filename token `TODO`. | Promote to `ready` after policy-hardening review. |

## TASK-APP-09 - Message Moderation, Soft Delete, Edit/Delete, Pin

- Priority: P0
- Status: proposed
- Purpose: Stabilize author and admin message actions with secure moderation.
- Scope: Minimal schema alignment, controlled mutations, tombstone behavior,
  pin permissions, search exclusions for deleted messages.
- Out of scope: Full moderation event archive unless explicitly approved.
- Completion criteria: Non-admin cannot pin/moderate; deleted content is not
  exposed; user reports remain functional where retained.
- Related local documents: `docs/project-management/archive/app-refinement/TASK_09.TODO.md`
- External provenance: none (local source material)
- Dependencies: `TASK-APP-04`, `TASK-APP-08`.
- Last reviewed: 2026-04-26
- Next action: Promote to `ready` after moderation security review.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from filename token `TODO`. | Promote to `ready` after moderation security review. |

## TASK-APP-10 - Final RLS Hardening and Cleanup Verification

- Priority: P0
- Status: proposed
- Purpose: Complete final security hardening and staged cleanup verification.
- Scope: RLS hardening lots, negative checks, UI cleanup sequencing, non-MVP
  surface withdrawal after security stabilization.
- Out of scope: Destructive DB drops mixed with security-hardening work.
- Completion criteria: Critical negative checks pass, chat/admission/admin flows
  remain functional, and cleanup is staged without destructive coupling.
- Related local documents: `docs/project-management/archive/app-refinement/TASK_10.TODO.md`
- External provenance: none (local source material)
- Dependencies: `TASK-APP-03`, `TASK-APP-04`, `TASK-APP-08`, `TASK-APP-09`.
- Last reviewed: 2026-04-26
- Next action: Promote to `ready` after prior hardening slices complete.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from filename token `TODO`. | Promote to `ready` after upstream dependencies are complete. |

## Candidate Runtime/Product Work (Out of Scope for This Cleanup)

## CAND-001 - Forum-Centric Redirect Removal to Chat-Centric Defaults

- Priority: P1
- Status: proposed
- Purpose: Remove remaining runtime `/forum` default redirects and align
  auth/onboarding/admin fallbacks with `/chat`.
- Scope: Middleware, callback, onboarding, settings-close, and legacy fallback
  runtime updates.
- Out of scope: Documentation-only cleanup implementation.
- Completion criteria: Runtime redirect matrix matches target app flow and avoids
  forum-first defaults.
- Related local documents: `app_flow.md`, `docs/project-management/archive/app-refinement/TASK_01.TODO.md`, `docs/project-management/archive/app-refinement/TASK_06.TODO.md`
- External provenance: none
- Dependencies: Product confirmation of legacy `/forum*` behavior.
- Last reviewed: 2026-04-26
- Next action: Open implementation ticket outside this cleanup.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Discovered during current-state route inventory. | Schedule runtime implementation separately. |

## CAND-002 - Supabase Drift: `profiles_public` Source-of-Truth Alignment

- Priority: P1
- Status: proposed
- Purpose: Resolve drift where app code references `profiles_public` but no
  matching migration-backed view was confirmed.
- Scope: Schema audit, migration or code-path alignment decision, reproducible
  environment proof.
- Out of scope: Documentation-only cleanup implementation.
- Completion criteria: `profiles_public` usage is fully reproducible from
  versioned migrations or removed from runtime paths.
- Related local documents: `db_flow.md`, `docs/project-management/archive/app-refinement/TASK_02.TODO.md`
- External provenance: none
- Dependencies: Supabase owner review.
- Last reviewed: 2026-04-26
- Next action: Open Supabase implementation task outside this cleanup.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Discovered during schema/RLS inventory. | Schedule Supabase reproducibility remediation task. |

## CAND-003 - Notification Type Constraint Alignment

- Priority: P1
- Status: proposed
- Purpose: Align DB notification type constraints with runtime notification
  types expected by onboarding/admin/chat flows.
- Scope: Constraint review for `welcome`, `sponsor_request`, `account_approved`,
  and `chat_mention`; migration and runtime parity validation.
- Out of scope: Documentation-only cleanup implementation.
- Completion criteria: Notification writes do not fail due to type drift.
- Related local documents: `db_flow.md`, `docs/project-management/archive/app-refinement/TASK_04.TODO.md`, `docs/project-management/archive/app-refinement/TASK_05.TODO.md`
- External provenance: none
- Dependencies: Product confirmation of accepted notification set.
- Last reviewed: 2026-04-26
- Next action: Open Supabase/runtime alignment task outside this cleanup.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Discovered from mismatch between flow docs and DB check constraints. | Schedule schema constraint update task. |

## CAND-004 - Admission RLS Hardening Execution

- Priority: P0
- Status: proposed
- Purpose: Implement the admission-field hardening and privileged transition
  controls documented in archived APP_REFINEMENT task sources.
- Scope: `profiles` and `sponsorship_requests` hardening, server-controlled
  transitions, audited bypass action.
- Out of scope: Documentation-only cleanup implementation.
- Completion criteria: Non-admin and sponsor escalation paths are blocked in DB
  and server layers.
- Related local documents: `docs/project-management/archive/app-refinement/TASK_04.TODO.md`, `docs/project-management/archive/app-refinement/TASK_05.TODO.md`
- External provenance: none
- Dependencies: Supabase migration execution window and rollback plan.
- Last reviewed: 2026-04-26
- Next action: Open runtime security implementation task outside this cleanup.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Explicitly discovered as runtime/security work outside docs scope. | Schedule controlled implementation with rollback plan. |

## CAND-005 - Baseline Quality Gate Repair (`lint` and `vitest`)

- Priority: P2
- Status: proposed
- Purpose: Address known baseline failures reported in root project status.
- Scope: Investigate and repair `bun run lint` and `bunx vitest run` baseline
  failures outside docs cleanup scope.
- Out of scope: Documentation-only cleanup implementation.
- Completion criteria: Quality gates pass or known residual failures are
  explicitly documented with owner plan.
- Related local documents: `README.md`
- External provenance: none
- Dependencies: Runtime/code-change implementation window.
- Last reviewed: 2026-04-26
- Next action: Open dedicated quality-repair task outside this cleanup.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Existing baseline issue listed in root status overview. | Schedule focused lint/test repair work. |

## External-Origin Candidate Runtime/Product Work (US3)

## CAND-006 - External Admission MVP Epic Localization

- Priority: P0
- Status: proposed
- Purpose: Convert external admission-epic issue set into one local candidate parent task while keeping execution out of this cleanup.
- Scope: Admission parent and child issue chain from `webapp-nextjs#3`, `#6`, `#7`, `#14`, `#16` and story anchor `le-marche-libre#16`.
- Out of scope: Runtime admission implementation in this cleanup.
- Completion criteria: External admission issue set is represented locally with provenance and no active status dependency on GitHub.
- Related local documents: `docs/project-management/external-sources.md`, `docs/project-management/product-framing.md`, `docs/project-management/decisions.md`
- External provenance: `EXT-ISSUE-WA-003`, `EXT-ISSUE-WA-006`, `EXT-ISSUE-WA-007`, `EXT-ISSUE-WA-014`, `EXT-ISSUE-WA-016`, `EXT-ISSUE-LM-016`, `EXT-PROJ-001`
- Dependencies: Owner confirmation of external story status and runtime execution window.
- Last reviewed: 2026-04-26
- Next action: Decompose into implementation tickets outside this cleanup.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from external issue set during US3 localization. | Keep local-only status and plan runtime execution separately. |

## CAND-007 - External Profile/Search MVP Epic Localization

- Priority: P1
- Status: proposed
- Purpose: Convert external profile/search issue set into one local candidate parent task while keeping execution out of this cleanup.
- Scope: Parent and subtask chain from `webapp-nextjs#5`, `#13`, `#17`, `#18`, `#19` and story anchor `le-marche-libre#17`.
- Out of scope: Runtime profile/search implementation in this cleanup.
- Completion criteria: External profile/search issue set is represented locally with provenance and no active status dependency on GitHub.
- Related local documents: `docs/project-management/external-sources.md`, `docs/project-management/product-framing.md`, `docs/project-management/decisions.md`
- External provenance: `EXT-ISSUE-WA-005`, `EXT-ISSUE-WA-013`, `EXT-ISSUE-WA-017`, `EXT-ISSUE-WA-018`, `EXT-ISSUE-WA-019`, `EXT-ISSUE-LM-017`, `EXT-PROJ-002`
- Dependencies: Owner confirmation of member-detail scope and runtime execution window.
- Last reviewed: 2026-04-26
- Next action: Decompose into implementation tickets outside this cleanup.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from external issue set during US3 localization. | Keep local-only status and plan runtime execution separately. |

## CAND-008 - External Channels/Messages MVP Epic Localization

- Priority: P0
- Status: proposed
- Purpose: Convert external channels/messages issue set into one local candidate parent task while keeping execution out of this cleanup.
- Scope: Parent and subtask chain from `webapp-nextjs#4`, `#20`, `#21`, `#23`, `#24`, `#25`, `#26` and story anchor `le-marche-libre#15`.
- Out of scope: Runtime channels/messages implementation in this cleanup.
- Completion criteria: External channels/messages issue set is represented locally with provenance and no active status dependency on GitHub.
- Related local documents: `docs/project-management/external-sources.md`, `docs/project-management/product-framing.md`, `docs/project-management/decisions.md`
- External provenance: `EXT-ISSUE-WA-004`, `EXT-ISSUE-WA-020`, `EXT-ISSUE-WA-021`, `EXT-ISSUE-WA-023`, `EXT-ISSUE-WA-024`, `EXT-ISSUE-WA-025`, `EXT-ISSUE-WA-026`, `EXT-ISSUE-LM-015`, `EXT-PROJ-003`
- Dependencies: Owner confirmation of forum/jobs/reply scope and runtime execution window.
- Last reviewed: 2026-04-26
- Next action: Decompose into implementation tickets outside this cleanup.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from external issue set during US3 localization. | Keep local-only status and plan runtime execution separately. |

## CAND-009 - External Onboarding Blocker Localization

- Priority: P0
- Status: proposed
- Purpose: Preserve the open onboarding blocker from external tracking as a local candidate blocker record.
- Scope: Runtime follow-up for `webapp-nextjs#1` (`500` on onboarding finalization) and related Project tracking proxy.
- Out of scope: Runtime bug fix implementation in this cleanup.
- Completion criteria: Blocker is tracked locally with provenance and explicit out-of-scope execution boundary.
- Related local documents: `docs/project-management/external-sources.md`, `docs/project-management/current-state.md`, `docs/project-management/decisions.md`
- External provenance: `EXT-ISSUE-WA-001`, `EXT-DOC-006`, `EXT-DOC-008`, `EXT-PROJ-004`
- Dependencies: Runtime owner assignment and reproducible failing scenario.
- Last reviewed: 2026-04-26
- Next action: Open dedicated runtime bugfix ticket outside this cleanup.

### Transition History

| Date | From | To | Reason | Next action |
|------|------|----|--------|-------------|
| 2026-04-26 | n/a | proposed | Imported from external blocker record during US3 localization. | Keep local-only status and plan runtime bugfix separately. |
