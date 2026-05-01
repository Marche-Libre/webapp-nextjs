1. **Freeze the project now**
   Stop feature expansion. Only allow MVP blockers, security fixes, routing cleanup, and launch-readiness work.

2. **Retire Speckit after extraction - DONE**
   Useful information from `specs/` was distilled into BMad planning artifacts, and Speckit has been retired as an active workflow.

3. **Stabilize BMad as the new source of truth**
   BMad is already partly installed: `_bmad/`, BMad Method, Builder, and TEA are present. “Setup BMad” should mean validating config, choosing output locations, and making `_bmad-output/` the new planning/implementation source.

4. **Harvest Speckit into a minimal MVP brief - DONE**
   Speckit was used only as input, not as workflow. Extracted:
   - MVP scope decisions
   - parked/non-MVP features
   - known route/auth bugs
   - schema/RLS findings
   - existing acceptance scenarios

5. **Agree on the MVP contract**
   Produce one short BMad MVP document answering:
   - What ships in 2 days?
   - What is explicitly hidden/parked?
   - What user journeys must work?
   - What DB state is required?
   - What is the launch go/no-go checklist?

6. **Recommended MVP scope from current evidence**
   Likely ship:
   - public landing
   - auth/login
   - member admission/onboarding
   - waiting/approved/refused states
   - `/chat` as the core app destination
   - minimal profile/settings only if needed for onboarding/chat identity

   Likely park/hide:
   - forum
   - annuaire/member discovery
   - jobs/offers
   - channel proposals
   - broad search/discovery
   - non-essential admin UX

7. **Create BMad planning artifacts**
   Suggested BMad sequence:
   - `bmad-generate-project-context` for brownfield project context - DONE
   - `bmad-distillator` on `specs/` to preserve useful knowledge - DONE
   - `bmad-create-prd` for the lean MVP PRD - DONE
   - `bmad-create-ux-design` only for minimal route/nav/copy cleanup - DONE
   - `bmad-create-architecture` focused on Supabase/auth/schema decisions - DONE
   - `bmad-create-epics-and-stories` - DONE
   - `bmad-check-implementation-readiness` - DONE
   - `bmad-sprint-planning` - DONE

8. **Do DB cleanup safely, not emotionally**
   Use Supabase MCP for inspection and verification. Sequence:
   - inventory schema, policies, functions, triggers, views
   - classify tables/columns as `MVP keep`, `legacy keep`, `park`, `remove later`, `danger`
   - run advisors
   - identify reproducibility gaps
   - write migrations only after scope is signed off
   - never destructively change production without backup and explicit approval

9. **Implement in small stories**
   Implementation order should be:
   - auth/admission redirects
   - visible navigation cleanup
   - chat-first MVP flow
   - refused/waiting UX
   - landing copy cleanup
   - DB fixes required for those flows
   - smoke tests/build

10. **Retire Speckit after migration - DONE**
    Completed after BMad artifacts were created:

- removed `.specify/`
- removed `.opencode/command/speckit.*`
- removed `speckit-*` skills from `.agents/skills` and `.claude/skills`
- removed Speckit blocks from `AGENTS.md`, `CLAUDE.md`, `README.md`
- deleted `specs/` per owner decision
