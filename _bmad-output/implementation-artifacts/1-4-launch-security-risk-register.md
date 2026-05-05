# Epic 1 Launch Security Risk Register (Story 1.4)

Date: 2026-05-03
Story: `1-4-document-launch-blocking-security-risks-and-non-blocking-accepted-beta-risks`
Status: final Story 1.4 artifact

## 1) Executive Launch Posture

Epic 1 local hardening outcomes from Story 1.3 are meaningful, but beta launch confidence is still blocked by F-01: the connected Supabase target does not match the app schema used by the MVP. Until the correct production target is confirmed and app-schema migrations/RLS are verified there, local hardening cannot be represented as production hardening.

Current launch posture:

- Launch blocker(s) exist and must be closed before launch.
- Accepted beta risk candidates are explicitly documented for owner decision; none is accepted until owner sign-off is recorded.
- Post-MVP follow-ups are documented separately to avoid silent scope creep.

## 2) Classification Rules

- `launch blocker`: known unresolved member-only access bypass, admin-only mutation bypass, or production-confidence blocker that prevents safe launch decision.
- `non-blocking accepted beta risk candidate`: known gap that may be tolerated for the initial beta only if explicitly accepted by owner with clear impact and follow-up.
- `post-MVP follow-up`: not required for initial beta launch decision, but intentionally tracked with minimum follow-up.

## 3) Launch Blockers

| ID | Category | Severity | Current evidence | Launch impact | Required pre-launch action | Source references | Decision status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | Production target/schema mismatch | High | Read-only inspection still shows only `public.francophone_pack_members` and migration `001 francophone_pack_members`; app tables (`profiles`, `channels`, `messages`, etc.) absent on connected target. | Production authorization confidence is not established; local hardening cannot be treated as production hardening. | Confirm correct production Supabase target and verify app-schema migrations/RLS against that target before launch go/no-go. | `_bmad-output/implementation-artifacts/1-1-access-security-audit.md`; `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md`; Story 1.4 verification log below. | blocked |

### Locally Addressed or Resolved Outcomes

These entries are not accepted beta risks. They are recorded to show the F-01 to F-14 reconciliation and make private-route, API, and notification outcomes explicit.

| ID | Domain | Current classification | Current evidence | Remaining launch relevance |
| --- | --- | --- | --- | --- |
| F-02 | Profile escalation | Not a remaining beta risk; production confidence covered by F-01 launch blocker. | Story 1.3 locally added trigger/policy hardening for sensitive profile updates. | Verify the same hardening on the correct production target before launch. |
| F-03 | Sponsor approval bypass | Not a remaining beta risk; production confidence covered by F-01 launch blocker. | Story 1.3 locally removed client profile approval and added trusted database transition logic. | Verify the same hardening on the correct production target before launch. |
| F-04 | Chat message write checks | Not a remaining beta risk; production confidence covered by F-01 launch blocker. | Story 1.3 locally added channel write and private membership checks for message insert paths. | Verify the same hardening on the correct production target before launch. |
| F-05 | Channel member write gaps | Not a remaining beta risk; production confidence covered by F-01 launch blocker. | Story 1.3 locally dropped broad `channel_members` insertion and retained admin-managed membership insertion. | Verify the same hardening on the correct production target before launch. |
| F-06 | Non-admin private channel / DM creation | Not a remaining beta risk; production confidence covered by F-01 launch blocker. | Story 1.3 locally disabled client DM creation and dropped non-admin private channel creation. | Verify the same hardening on the correct production target before launch. |
| F-07 | Chat image public URL/storage bypass | Immediate bypass locally mitigated; residual media re-enable path is a post-MVP follow-up. | Story 1.3 locally disabled chat image upload/public URL behavior and blocked direct `messages.image_url` writes. | Do not re-enable chat media before private/member storage policy verification. |
| F-09 | Chat moderation send/edit enforcement | Partially addressed; remaining read/access semantics are tracked as a beta risk candidate below. | Story 1.3 locally blocks banned/muted users from send/edit paths. | Owner must still decide whether `chat_banned` also means no read/access. |
| F-11 | Legal route access | Resolved; not a remaining private-route risk. | Story 1.3 made `/mentions-legales`, `/confidentialite`, and `/cgu` public without exposing member/chat/admin data. | Preserve this public legal-route behavior while keeping private app routes protected. |
| F-12 | `/api/geo/cities` API expectation | Resolved by Story 1.2; not a remaining API risk. | Story 1.2 defined the endpoint as auth/onboarding-compatible, not public for logged-out users. | No pre-launch action unless the API contract changes. |
| Notification ordering | Mention notification side effect | Resolved; not a remaining notification risk. | Story 1.3 changed mention notifications to run only after successful message insert. | No pre-launch action unless message-send semantics change. |

## 4) Non-Blocking Beta Risk Candidates Pending Owner Sign-Off

These are candidates only. `Decision status` remains `owner decision needed` until owner sign-off is recorded.

| ID | Category | Severity | Current evidence | Expected beta impact | Owner decision needed | Minimum post-beta follow-up | Source references | Decision status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-08 | Admin action attribution (`admin actor`/`timestamp`) | Medium | Admin actions enforce admin checks but do not persist explicit actor/timestamp audit fields for membership/moderation decisions. | Lower audit detail for who performed specific admin decisions; operational debugging/compliance trace is weaker. | Accept weaker audit trail for initial 10-30 member beta, or require pre-launch schema/action audit fields. | Add audit fields/table and write-path coverage in admin actions; validate read/reporting path. | `_bmad-output/implementation-artifacts/1-1-access-security-audit.md`; `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`; `src/app/(app)/admin/actions.ts` | owner decision needed |
| F-10 | `message_reactions` realtime publication gap | Low | App subscribes to `message_reactions`, but local migration review does not show publication for that table. | Reactions may not update in realtime; chat core read/send remains functional. | Accept non-realtime reactions for beta if reaction immediacy is non-critical. | Add publication for `message_reactions` or remove realtime expectation from UI/state logic. | `_bmad-output/implementation-artifacts/1-1-access-security-audit.md`; `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md`; `src/components/chat/chat-store.tsx` | owner decision needed |
| F-09 (partial) | Chat moderation semantics (`chat_banned` read/access meaning) | Medium | Story 1.3 hardened send/edit boundaries for banned/muted users locally; read/access semantics for `chat_banned` remain an explicit product/security decision. | Ambiguity in member expectations and moderation policy: ban may mean "cannot post" vs "cannot read/access". | Decide if `chat_banned` means no send/edit only, or no chat read/access at all. | Implement and verify chosen enforcement model across route/data/realtime surfaces. | `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md`; `_bmad-output/implementation-artifacts/1-2-mvp-access-matrix.md` | owner decision needed |
| F-14 (residual) | Older exposed `SECURITY DEFINER` functions | Medium until inventory confirms low risk | Story 1.3 hardened touched trusted functions; broader older `public` exposed `SECURITY DEFINER` surfaces still need full review. | Potential privileged-database hardening debt if unsafe exposed functions remain. | Decide whether residual function review is mandatory pre-launch or explicitly accepted for beta with follow-up. | Run full function inventory/review and harden search paths/access patterns as needed. | `_bmad-output/implementation-artifacts/1-1-access-security-audit.md`; `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md` | owner decision needed |

## 5) Post-MVP Follow-Ups

| ID | Classification | Current evidence | Beta impact rationale | Required follow-up |
| --- | --- | --- | --- | --- |
| F-07 (residual storage hardening track) | post-MVP follow-up | Story 1.2 required either private/member storage policy or disabling upload before beta; Story 1.3 chose the disable-upload mitigation and blocked direct `messages.image_url` writes locally. Private/member-scoped `chat-images` storage policy architecture is not yet delivered. | Upload path is disabled for beta, resolving the immediate media privacy bypass unless media is re-enabled. | Implement private bucket/member policy model (`storage.objects`), signed/private delivery pattern, and end-to-end verification before re-enabling uploads. |
| F-13 | post-MVP follow-up | Database/app types remain reconciliation work after production target alignment. | Types are not treated as security authority for this launch decision. | Regenerate/verify DB types after production schema reconciliation, not before. |
| Supabase broad inventory hardening | post-MVP follow-up | Story-level hardening focused on known findings; full schema/RLS/function/trigger/view/storage inventory remains larger effort. | Scoped beta can proceed only if launch blockers are cleared and accepted risks are explicit. | Execute full inventory + advisor-guided remediation before scaling beyond initial beta cohort. |

## 6) Verification Evidence

### Story 1.4 verification run (2026-05-03)

| Command / Check | Outcome | Baseline evidence | Classification |
| --- | --- | --- | --- |
| Supabase MCP `list_tables(schemas=["public"], verbose=false)` | Returned only `public.francophone_pack_members` (RLS enabled, 1 row). | Matches create-story inspection recorded at 2026-05-03T10:56:09Z in the Story 1.4 guide. | Confirms F-01 persists; not a new regression. |
| Supabase MCP `list_migrations` | Returned only `001 francophone_pack_members`. | Matches create-story inspection recorded at 2026-05-03T10:56:09Z in the Story 1.4 guide. | Confirms F-01 persists; not a new regression. |
| Supabase MCP `get_advisors(type="security")` | Warn: `function_search_path_mutable` on `public.set_updated_at`. | Same connected-target mismatch context as the Story 1.4 guide's prior read-only inspection. | Not app-schema hardening evidence. |
| Supabase MCP `get_advisors(type="performance")` | Warn: `auth_rls_initplan` on `public.francophone_pack_members` policy. | Same connected-target mismatch context as the Story 1.4 guide's prior read-only inspection. | Not app-schema hardening evidence. |
| `npx vitest run src/__tests__/authorization-hardening.test.ts src/__tests__/mvp-route-cleanup.test.ts src/__tests__/auth-url.test.ts` | Passed: 3 files, 21 tests. | Matches Story 1.3 after-review baseline recorded in `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md`. | No new regression. |
| `npm run lint` | Failed: 94 problems (52 errors, 42 warnings). | Matches Story 1.3 after-review baseline count and shape: 94 problems (52 errors, 42 warnings). | Known baseline failure; no Story 1.4-specific regression identified. |
| `npx vitest run` | Failed only on known `src/__tests__/profile-utils.test.ts` availability-label assertions (3 failing tests, 42 passing). | Matches Story 1.3 after-review baseline: 42 passed, 3 failed in `profile-utils.test.ts`. | Known baseline failure; no new regression from Story 1.4 docs-only work. |

### Skipped checks

No additional write-based production verification was run. Reason: connected target mismatch (F-01) and docs-only story scope forbidding runtime/Supabase write changes.

## 7) Owner Decisions and Go/No-Go Notes

### Decisions needed before launch

1. Resolve F-01 by confirming the correct production Supabase target and verifying app-schema migration/RLS state there.
2. Decide whether F-08 is acceptable for beta without stronger admin audit attribution and record the sign-off if accepted.
3. Decide whether F-09 ban semantics must include read/access denial before beta.
4. Confirm acceptance stance for F-10 realtime reaction gap and record the sign-off if accepted.
5. Confirm whether residual F-14 function review is accepted for beta or required pre-launch; record the sign-off if accepted.

### Go/No-Go recommendation (current)

- Current recommendation: **No-Go** while F-01 remains unresolved.
- Conditional Go requires: F-01 closure + explicit owner sign-off recorded for any accepted beta risk candidates.
