# Sprint Change Proposal - Epic Planning Cleanup

**Date:** 2026-05-01
**Project:** webapp-nextjs
**Target Artifact:** `_bmad-output/planning-artifacts/epics.md`
**Mode:** Batch
**Status:** Approved and applied

## 1. Issue Summary

Implementation readiness found that the BMad planning set is nearly ready for execution, but `epics.md` needs one cleanup pass before story execution starts.

The trigger is `_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-30.md`, which marked overall readiness as **NEEDS WORK before Phase 4 implementation starts**. The issue is not missing PRD coverage: all 50 functional requirements are covered. The issue is implementation-readiness hygiene in the story plan.

Evidence from the readiness report:

- Verification-only stories are modeled as standalone user stories instead of being integrated into functional story acceptance criteria, story Definition of Done, or release-readiness checks.
- Epic 6 mixes product-visible scope containment with process/governance work.
- Story 1.1 is valid audit-first work for this brownfield security MVP, but it needs a bounded concrete deliverable.
- Schema-dependent stories need a standard missing-schema handling criterion to prevent unapproved migrations or silent risk acceptance.

## 2. Impact Analysis

### Epic Impact

Epic 1 is affected because Story 1.1 must be tightened into a concrete access/security matrix deliverable, and Story 1.4 should not remain a standalone verification-only story. Authorization regression expectations should move into Story 1.3, Story 1.5, and a release-readiness/Definition of Done guardrail.

Epic 2 is affected because Story 2.7 is verification-only and should be merged into admission-routing functional stories. Story 2.3 also needs schema-gap handling for admission/profile source-of-truth uncertainty.

Epic 3 is affected because Story 3.6 is verification-only and should be merged into chat functional stories. Chat schema/realtime gaps must be treated as explicit blockers, risks, or follow-up inputs instead of implied completion.

Epic 4 is affected because Story 4.7 is verification-only and should be merged into admin functional stories. Stories 4.4, 4.5, and 4.6 need stronger schema-gap handling because admin troubleshooting, access removal/suspension, and channel operations depend on discovered production schema/RLS support.

Epic 5 is affected because Story 5.5 is verification-only and should be merged into beta learning stories. Stories 5.1 and 5.3 need standard schema-gap criteria for cohort tracking and activation/message attribution.

Epic 6 is the most affected. Stories 6.1, 6.4, and 6.5 are process/governance items and should become guardrails/Definition of Done/release-readiness checks, not implementation stories. Stories 6.2 and 6.3 remain valid product-visible implementation stories.

### Story Impact

Stories proposed for removal as standalone implementation stories:

- Story 1.4: Add Targeted Authorization Regression Tests
- Story 2.7: Add Admission Flow Regression Coverage
- Story 3.6: Add Chat Flow Regression Coverage
- Story 4.7: Add Admin Operations Regression Coverage
- Story 5.5: Add Beta Learning Verification Records
- Story 6.1: Maintain the MVP vs Future Candidate Inventory
- Story 6.4: Block New Dependencies and Redesign Work Unless Explicitly Approved
- Story 6.5: Add Scope Containment Verification Records

Stories proposed for targeted acceptance-criteria updates:

- Story 1.1
- Story 1.3
- Story 1.5
- Story 2.3
- Story 2.4
- Story 2.5
- Story 2.6
- Story 3.2
- Story 3.3
- Story 3.4
- Story 3.5
- Story 4.1
- Story 4.2
- Story 4.3
- Story 4.4
- Story 4.5
- Story 4.6
- Story 5.1
- Story 5.2
- Story 5.3
- Story 5.4
- Story 6.2
- Story 6.3

### Artifact Conflicts

PRD: no PRD scope change is required. The PRD remains aligned and complete.

Architecture: no architecture direction change is required. Architecture already supports audit-first Supabase/RLS work, route/access matrix validation, `/chat` as app center, and scope containment.

UX: no UX design change is required. UX already supports explicit status states, chat-first behavior, admin operational clarity, and scope containment.

Epics: `epics.md` must be corrected before sprint planning and story creation continue.

Sprint status: `_bmad-output/implementation-artifacts/sprint-status.yaml` must be regenerated after `epics.md` is approved and updated, because removed/merged stories currently appear as backlog entries.

### Technical Impact

This is a documentation-only planning correction. It must not change app routes, UI, Supabase files, dependencies, package locks, generated types, tests, or runtime behavior.

## 3. Recommended Approach

Recommended path: **Direct Adjustment**.

Rationale:

- The PRD, UX, and architecture are aligned; no MVP redefinition is needed.
- The issue is localized to story-plan structure and implementation guardrails in `epics.md`.
- No rollback is relevant because no implementation work has started from these stories.
- The cleanup reduces execution risk before `bmad-create-story` generates Story 1.1.

Effort estimate: Low to Medium.

Risk level: Low, if the change remains documentation-only and `sprint-status.yaml` is regenerated afterward.

Timeline impact: short planning cleanup pass before story creation. This prevents larger downstream rework from verification-only or governance-only stories being implemented as product work.

## 4. Detailed Change Proposals

### Proposal A: Add Epic-Level Implementation Guardrails

Artifact: `_bmad-output/planning-artifacts/epics.md`
Section: after Epic List, before detailed Epic 1 stories

OLD:

```markdown
## Epic 1: Trust, Authorization, and Launch Safety
```

NEW:

```markdown
## Implementation Guardrails and Definition of Done

These guardrails apply to every implementation story unless a story explicitly says otherwise.

- Verification is part of each functional story's Definition of Done. Build, lint, targeted tests, manual checks, Supabase inspection, or release-readiness checks must be recorded with exact commands/outcomes where relevant, and failures must be classified as baseline failures or new regressions.
- Verification-only work should not be split into separate implementation stories unless it produces distinct cross-cutting evidence that cannot reasonably belong to a functional story.
- If existing schema, RLS, generated types, policies, functions, triggers, views, or migrations do not support a required behavior, the story must document the blocker/risk, affected requirement, and proposed minimal follow-up before adding migrations or accepting beta risk.
- Any Supabase/database action is production-impacting: inspect before writes, avoid writes by default, and never perform destructive SQL without explicit owner approval and rollback confidence.
- Scope containment is mandatory: do not add dependencies, change package locks, introduce a design system/global state/backend layer, redesign broadly, promote future integrations, delete legacy routes/data, or expand MVP scope unless explicitly approved by the owner and reflected in planning artifacts.
- Future-only capabilities remain excluded from MVP unless explicitly promoted by the owner. This includes full 300+ member migration, E2E encryption, private DMs, Nostr, AI, Lightning, media libraries, polls, advanced moderation, self-serve community creation, and platformization.
- `/chat` remains the approved-member app center. Parked or legacy surfaces may be hidden/deprioritized from navigation, but direct route access, tables, migrations, and historical data must not be removed unless explicitly authorized by a story.

## Epic 1: Trust, Authorization, and Launch Safety
```

Rationale: This converts process/governance stories into enforceable planning guardrails without consuming implementation story capacity.

### Proposal B: Tighten Story 1.1 Into a Bounded Access/Security Matrix Deliverable

Artifact: `_bmad-output/planning-artifacts/epics.md`
Story: 1.1
Section: Acceptance Criteria

OLD:

```markdown
**Then** the audit records which paths are protected, which paths are uncertain, and which paths are confirmed bypass risks
**And** the audit distinguishes app-code findings from Supabase schema/RLS findings
**And** no destructive Supabase writes or schema changes are performed
**And** any production-impacting inspection command is documented with outcome and risk
**And** findings are categorized as blocker, accepted beta risk candidate, or follow-up story input.
```

NEW:

```markdown
**Then** the audit produces a concrete MVP access/security matrix covering user states, routes, data access, admin actions, API/Server Action paths, realtime paths, and Supabase schema/RLS/migration/type assumptions
**And** each matrix entry states expected behavior, observed behavior where inspected, evidence source, and status: verified, uncertain, confirmed bypass, unsupported by schema, or not applicable
**And** the audit distinguishes app-code findings from Supabase schema/RLS/generated-type/migration findings
**And** no destructive Supabase writes or schema changes are performed
**And** any production-impacting inspection command is documented with outcome and risk
**And** findings are categorized as launch blocker, accepted beta risk candidate, or follow-up story input
**And** the output is actionable enough for Story 1.2 to define expectations and Story 1.3 to harden confirmed bypasses without reopening open-ended discovery.
```

Rationale: Story 1.1 remains valid because this brownfield MVP needs audit-first security work, but the output becomes bounded and implementation-ready.

### Proposal C: Merge Verification-Only Stories Into Functional Stories and DoD

Artifact: `_bmad-output/planning-artifacts/epics.md`
Stories: 1.4, 2.7, 3.6, 4.7, 5.5, 6.5

OLD:

```markdown
### Story 1.4: Add Targeted Authorization Regression Tests
### Story 2.7: Add Admission Flow Regression Coverage
### Story 3.6: Add Chat Flow Regression Coverage
### Story 4.7: Add Admin Operations Regression Coverage
### Story 5.5: Add Beta Learning Verification Records
### Story 6.5: Add Scope Containment Verification Records
```

NEW:

```markdown
Remove these as standalone implementation stories. Move their verification expectations into:

- The global Implementation Guardrails and Definition of Done section.
- Story 1.3 and Story 1.5 for authorization hardening and launch-risk evidence.
- Stories 2.4, 2.5, and 2.6 for admission-state routing verification.
- Stories 3.2 through 3.5 for chat access/read/send/return-loop verification.
- Stories 4.1 through 4.6 for admin operation and non-admin restriction verification.
- Stories 5.1 through 5.4 for beta learning, privacy-boundary, and unavailable-data verification.
- Stories 6.2 and 6.3 for public promise and navigation containment verification.
```

Rationale: Verification must happen with the behavior it protects, not after a separate backlog item that can be deferred.

### Proposal D: Convert Epic 6 Process Stories Into Guardrails and Keep Product-Visible Stories

Artifact: `_bmad-output/planning-artifacts/epics.md`
Epic: 6

OLD:

```markdown
### Story 6.1: Maintain the MVP vs Future Candidate Inventory
### Story 6.2: Keep Public Product Promises Within MVP Scope
### Story 6.3: Contain Parked Legacy Features in Navigation
### Story 6.4: Block New Dependencies and Redesign Work Unless Explicitly Approved
### Story 6.5: Add Scope Containment Verification Records
```

NEW:

```markdown
### Story 6.1: Keep Public Product Promises Within MVP Scope
### Story 6.2: Contain Parked Legacy Features in Navigation
```

Rationale: Public promise cleanup and navigation containment are product-visible runtime/documentation outcomes. Inventory maintenance, dependency blocking, and verification records are guardrails/Definition of Done, not implementation stories.

### Proposal E: Add Standard Schema-Gap Handling Criteria to Schema-Dependent Stories

Artifact: `_bmad-output/planning-artifacts/epics.md`
Stories: 2.3, 4.4, 4.5, 4.6, 5.1, 5.3, and any other story that depends on discovered production schema/RLS support

OLD example:

```markdown
**And** any missing schema support for cohort tracking is documented as a beta operational risk or follow-up story
```

NEW standard criterion:

```markdown
**And** if existing schema, RLS, generated types, policies, functions, triggers, views, or migrations do not support this behavior, the story documents the blocker/risk, affected PRD requirement, user impact, and proposed minimal follow-up before adding migrations or accepting beta risk
```

Rationale: This prevents implementers from either overbuilding unapproved migrations or silently accepting schema gaps.

### Proposal F: Update Story Numbering and Sprint Status After Approval

Artifact: `_bmad-output/planning-artifacts/epics.md` and `_bmad-output/implementation-artifacts/sprint-status.yaml`

OLD:

```yaml
1-4-add-targeted-authorization-regression-tests: backlog
2-7-add-admission-flow-regression-coverage: backlog
3-6-add-chat-flow-regression-coverage: backlog
4-7-add-admin-operations-regression-coverage: backlog
5-5-add-beta-learning-verification-records: backlog
6-1-maintain-the-mvp-vs-future-candidate-inventory: backlog
6-4-block-new-dependencies-and-redesign-work-unless-explicitly-approved: backlog
6-5-add-scope-containment-verification-records: backlog
```

NEW:

```markdown
After `epics.md` is approved and updated, rerun `bmad-sprint-planning` to regenerate sprint status from the corrected story set.
```

Rationale: Manual sprint-status edits are more error-prone than regeneration after canonical epic cleanup.

## 5. Implementation Handoff

### Scope Classification

**Moderate** planning correction.

This is not a runtime implementation change and does not require PM/Architect replanning because PRD, UX, and architecture remain aligned. It does require backlog/story reorganization before implementation agents begin.

### Handoff Recipients

Product Owner / Developer agents.

Responsibilities:

- Product Owner approves the Sprint Change Proposal and confirms that the cleanup should be applied to `epics.md`.
- Developer or planning agent applies the approved documentation-only edits to `epics.md`.
- Sprint planning agent regenerates `_bmad-output/implementation-artifacts/sprint-status.yaml` after `epics.md` is corrected.
- Implementation readiness agent reruns readiness validation against corrected PRD, UX, architecture, and epics.
- Story creation starts with corrected Story 1.1 after readiness passes.

### Success Criteria

- Verification-only stories are no longer standalone backlog items unless deliberately retained as cross-cutting evidence work.
- Epic 6 contains only product-visible implementation stories; governance/process expectations live in guardrails/Definition of Done.
- Story 1.1 has a bounded access/security matrix deliverable.
- Schema-dependent stories include explicit missing-schema handling criteria.
- `sprint-status.yaml` is regenerated from corrected epics.
- A subsequent `bmad-check-implementation-readiness` run reports the planning set ready for implementation or identifies only new concrete issues.

## 6. Checklist Status

### 1. Understand the Trigger and Context

- [x] 1.1 Triggering story identified: not a runtime story; triggered by implementation readiness report before Story 1.1 creation.
- [x] 1.2 Core problem defined: story-plan hygiene issue, not PRD/UX/architecture mismatch.
- [x] 1.3 Evidence gathered: readiness report lines on major issues and recommendations.

### 2. Epic Impact Assessment

- [x] 2.1 Current epic impact assessed: Epic 1 requires bounded audit scope and integrated verification.
- [x] 2.2 Epic-level changes identified: Epic 6 restructuring and guardrails addition.
- [x] 2.3 Remaining epics reviewed: Epics 2-5 need verification/schema-gap cleanup.
- [x] 2.4 New/obsolete epics evaluated: no new epic needed; no epic removed.
- [x] 2.5 Epic order reviewed: order remains valid.

### 3. Artifact Conflict and Impact Analysis

- [x] 3.1 PRD conflicts checked: none; PRD remains valid.
- [x] 3.2 Architecture conflicts checked: none; architecture supports this cleanup.
- [x] 3.3 UX conflicts checked: none; UX supports this cleanup.
- [x] 3.4 Other artifacts checked: sprint-status requires regeneration after approved epic edits.

### 4. Path Forward Evaluation

- [x] 4.1 Direct Adjustment: viable, low/medium effort, low risk.
- [N/A] 4.2 Potential Rollback: not relevant; no implementation rollback required.
- [N/A] 4.3 PRD MVP Review: not required; MVP scope remains stable.
- [x] 4.4 Recommended path selected: Direct Adjustment.

### 5. Sprint Change Proposal Components

- [x] 5.1 Issue summary created.
- [x] 5.2 Epic impact and artifact adjustments documented.
- [x] 5.3 Recommended path documented.
- [x] 5.4 PRD MVP impact and action plan documented.
- [x] 5.5 Handoff plan established.

### 6. Final Review and Handoff

- [x] 6.1 Checklist completion reviewed through approved proposal.
- [x] 6.2 Proposal accuracy approved by owner.
- [x] 6.3 Explicit approval obtained on 2026-05-01.
- [!] 6.4 Sprint status update deferred to the next `bmad-sprint-planning` run after this applied epic cleanup.
- [x] 6.5 Handoff confirmed: rerun implementation readiness, then sprint planning, then create Story 1.1.

## 7. Approval Request

Owner approval received on 2026-05-01. The approved documentation-only cleanup was applied to `_bmad-output/planning-artifacts/epics.md`.

Next routing:

- Run `bmad-check-implementation-readiness` against the corrected planning set.
- Run `bmad-sprint-planning` to regenerate `_bmad-output/implementation-artifacts/sprint-status.yaml` from corrected epics.
- Run `bmad-create-story` for corrected Story 1.1 after readiness passes.
