---
type: bmad-distillate
sources:
  - "../../specs/ (deleted after extraction; historical provenance only)"
  - "../../app_flow.md"
  - "../../README.md"
  - "../../BMAD-migration-road-to-mvp.md"
  - "../project-context.md"
downstream_consumer: "Brownfield MVP PRD creation"
created: "2026-04-28"
token_estimate: 4050
parts: 1
---

## Product Intent And MVP Scope
- Le Marche Libre is a private closed-beta club for liberals and entrepreneurs; current goal is to stabilize the existing Next.js/Supabase prototype before expansion.
- Product language strategy is i18n-compatible with French first; user-facing MVP copy, routes where already French, labels, onboarding, and club terminology prioritize French while preserving future localization ability.
- Future scope if the club succeeds: scale the model on X and Y by creating a meta-club platform where anyone can create a paid club behind an app paywall.
- Core retained journey: X-based admission -> manual one-by-one profile verification -> pending/refused/approved status -> approved user completes onboarding tunnel with required information/profile -> enters app.
- Primary post-admission destination is `/chat`, not `/forum`.
- Forum is overfeatured legacy work from the original implementation; retained MVP communication model is closer to Telegram/WhatsApp with predefined channels/canals, currently created only by admins.
- Feature expansion is frozen until blockers, owners, schema reproducibility, and beta go/no-go decisions are resolved.
- Active MVP surfaces require clarification but currently include: `/`, `/rejoindre`, `/connexion`, `/inscription`, `/auth/callback`, `/en-attente`, `/onboarding`, `/chat`, `/chat/[slug]`, `/profil`, `/parametres`, `/notifications`, `/parrainages`, `/admin`, `/admin/utilisateurs`, legal pages.
- Legacy/frozen/tolerated surfaces: `/forum/**`, `/tableau-de-bord`, `/membres`; `/membres/[id]` requires decision as beta-visible member detail vs internal detail opened from search/chat.
- Park or hide for MVP: forum expansion, standalone annuaire, jobs/offers marketplace promises, channel proposals, broad discovery beyond retained member search, AI matching, payments, mobile, non-X auth, rich profile redesign, advanced moderation backoffice.
- Do not delete historical routes, tables, migrations, or admission data as part of MVP stabilization unless explicitly approved.

## Brownfield Current State
- App already includes auth, onboarding, forum, annuaire, profile, notifications, sponsorships/parrainages, admin, chat, guards, and related Supabase tables.
- Code is ahead of specs; imported backlog status cannot be trusted without reconciliation.
- Forum and annuaire were overfeatured in the original implementation and became dominant/default surfaces, even though retained MVP intent is chat-first.
- Before cleanup, `/forum` appeared in middleware, auth callback, onboarding, waiting status polling, admin fallback, settings close, sidebar/logo, notifications/forum embeds, and member recent activity.
- Chat routing architecture is not final; current canonical routes are `/chat` and `/chat/[slug]`, while `/chat?channel=<id>` appears in legacy links, but simpler architecture is preferred until a deliberate decision is made between URL-routed channels and fuller PWA/client-state navigation.
- Product language strategy: users are French-first for MVP, app copy must be i18n-ready, but software/architecture identifiers such as routes should remain English where changed or newly introduced.
- Legal pages exist; explicit decision needed for English route architecture vs currently French legal routes such as `/cgu`, `/mentions-legales`, `/confidentialite`.
- Onboarding currently conflicts with chat-centered MVP where it publishes a forum introduction post, inserts `welcome` notification, and historically redirected to `/forum`.

## Source Of Truth And Governance
- This distillate captured historical local Speckit `specs/`, imported GitHub issues, GitHub Project 1, archived project-management docs, and BMad context before Speckit was deleted.
- Speckit/GitHub material is provenance only. The BMad PRD and follow-on BMad artifacts are the active planning source.
- GitHub Project 1 and imported GitHub issues must not be treated as active status; they are historical/provenance inputs only.
- GitHub Project 1 must not be deleted/frozen/decommissioned until owner verifies imported coverage and explicitly confirms destructive action.
- Release-readiness work already classified blockers, MVP gaps, parked features, owner decisions, schema risks, quality gates, and go/no-go criteria; unresolved owner confirmations remain.
- Archived project-management mechanics are not product behavior; retain only provenance, open owner decisions, decommission constraints, and active product/technical decisions for PRD.

## Owners And Go No-Go
- Closed beta launch requires explicit signoff for product scope, technical/runtime readiness, Supabase schema/RLS readiness, and operational access to GitHub, Supabase, Vercel, and X OAuth.
- Initial execution capacity is the owner plus AI agents; planning must assume a small human-in-the-loop team, not a staffed 4-week delivery team.
- Closed beta is NO-GO unless retained MVP scope is accepted, auth/admission/profile/chat/navigation runtime state is accepted, schema reproducibility and authorization risks are resolved or explicitly accepted, and target-environment admission/auth works.
- Required route/access matrix validation: anonymous, pending, rejected/refused, approved not onboarded, approved onboarded, admin, and non-admin admin-access fallback.
- Required product validation: core chat read/send works on retained launch channels; public pages do not promise parked/hidden surfaces; French-first copy is coherent and i18n-ready.
- Signoff path: technical/schema review resolves or accepts blockers; product review confirms retained scope and public messaging; beta go/no-go is recorded before invites.
- Legacy design files such as `design.md` and `design-system/marchelibre/MASTER.md` may be referenced as historical inspiration only; they are not current launch blockers or canonical design authority.

## Quality Gates And Verification Baselines
- Merge gate: build passes, changed-scope lint is clean for touched files, targeted tests pass for touched beta-critical flows, and manual auth/schema checks are done for auth/admission/role/permission changes.
- Use repository scripts as configured (`npm`/`bun` may differ by context); record exact command, result, and whether any failure is baseline or regression.
- Beta gate: repo-wide build/lint/Vitest pass or explicit owner-accepted risk for schema drift, hidden runtime features, and known failing baselines.
- 2026-04-26 audit: `npm run build` passed; `npm run lint` failed with 117 problems including React Compiler/hooks, `no-explicit-any`, unused vars, `no-img-element`; `npx vitest run` failed snapshot and must be rerun before treating as current.
- 2026-04-28 MVP route cleanup verification: forbidden-file diff passed for Supabase/dependency/lock files; targeted `src/__tests__/mvp-route-cleanup.test.ts` passed 7 tests; `npm run build` passed; changed-scope ESLint had 0 errors and 9 warnings considered pre-existing/unrelated.
- Runtime baseline: Next.js 16.2.1 App Router, React 19.2.4, TypeScript strict, `@supabase/ssr`, `@supabase/supabase-js`, Tailwind CSS 4, ESLint 9, Vitest 4 jsdom.
- Next.js constraint: before changing routes, redirects, links, middleware/proxy logic, Server Actions, route handlers, or caching, read installed docs in `node_modules/next/dist/docs/`.
- Supabase safety: connected DB is production; inspect before writes, avoid writes by default, never destructive SQL without explicit owner approval plus backup/rollback confidence.
- Brownfield safety: implement in small verifiable lots; avoid broad refactors; preserve user/runtime data; separate destructive DB work from RLS/security fixes.
- Environment contract: use `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`; do not introduce `NEXT_PUBLIC_SUPABASE_ANON_KEY` unless contract changes.

## Admission MVP Requirements
- Product has two visible layers: public website/landing with basic legal/terms pages, and private webapp for admitted members.
- Architecture preference would normally be separated backend/API/WebSockets plus separate website/webapp, but current constraint is full Next.js brownfield due time; MVP must stabilize existing Next.js implementation instead of rebuilding.
- Landing must expose a clear app-entry CTA such as “Open app”/access app; current login/signup UX can be revisited with UX specialist, but X auth should behave as one practical path.
- User entry flow: user lands on website -> clicks app access/login/signup CTA -> authenticates with X -> routing depends on existing profile/status/onboarding state.
- Existing approved and onboarded user enters app directly.
- Existing approved but not onboarded user enters onboarding tunnel and must complete required information/profile fields.
- Existing pending user sees a clear “under review” waiting state and cannot access member content.
- Existing rejected/refused user sees a kind refusal/retry-later state and cannot access member content.
- New signup uses X auth, then collects sponsor/parrain information; one sponsor is enough for MVP.
- Sponsorship relation must be tracked so the system knows who sponsored whom, using the existing schema relationship (`sponsor_id`, `user_id`, and/or `profile_id` to be confirmed).
- Admission is manually verified one by one for now; sponsor/parrainage evidence supports review but must not grant final access by itself.
- Existing French routes such as `/en-attente` are tolerated/current; future changed/new route architecture should prefer English route identifiers with French-first app copy.
- Product statuses are pending, approved, refused/refusé; runtime/database statuses are `pending`, `approved`, `rejected`, with refused/refusé as product/UI alias for rejected.
- Admins list/review pending requests and approve/refuse; non-admins cannot approve/refuse/bypass by UI, server action, or database policy.
- Admission success baseline: X auth does not require a second login; candidate submission does not 500; pending/refused/approved checks route correctly; non-admin mutation is rejected server/database-side.

## Admission Data Model And Contracts
- Admission data model is not yet trusted by the owner; current implementation uses Supabase Auth plus database profile/admission tables, but the exact schema and relationships must be audited before PRD commitments become implementation tasks.
- There is no clear DDD/domain model layer in the project, so admission concepts are difficult to trace from product language to database tables and code paths.
- Owner-understood product model: a person signs in with X, has or creates an app profile, gives required profile information, provides one sponsor/parrain for MVP, waits for manual review, and receives approved or refused status.
- Final access gate must be one clear server/database-controlled member status; current implementation appears to use profile status, but the exact field/table must be verified.
- Sponsor/parrain relation must be tracked so the system knows who sponsored whom; exact storage fields/tables such as profile ID, user ID, sponsor ID, or sponsorship request ID must be confirmed by schema audit.
- Sponsorship/parrainage evidence supports manual review but must not grant final app access by itself.
- Existing invitation/referral mechanisms may be legacy or compatibility behavior; owner has not yet decided whether they remain active MVP concepts.
- Existing routes such as `/rejoindre?ref={x_handle}` and `/auth/callback` appear to handle referral/X OAuth/admission routing; exact behavior must be audited before changing or relying on it.
- Admission implementation must avoid redirect loops, incomplete-profile dead ends, and unclear pending/refused states.
- Admin approval/refusal mechanics must be audited before product decisions are locked; owner cannot decide transition/reversal/bypass rules until current DB model and admin code are understood.
- PRD should express admission in product terms first, then require a technical discovery task to map product concepts to actual Supabase tables, fields, RLS policies, and server actions.

## Admission Risks And Follow-Ups
- Admission remains a critical discovery area; product concepts, current Supabase schema, RLS policies, server actions, and route guards must be reviewed before final implementation commitments.
- Many admission details are intentionally undecided until further team discussion, including exact sponsor/parrain model, invitation/referral handling, admin approval workflow, reversal policy, and low-level database hardening approach.
- Known flows to validate before beta: first X OAuth login, onboarding completion, pending state, refused state, approved not-onboarded state, approved onboarded state, and admin review state.
- Known product risks: confusing pending/refused UX, redirect loops, incomplete profile dead ends, unclear sponsor tracking, and accidental access before manual approval.
- Known technical risks: schema uncertainty, RLS uncertainty, admin-action authorization, status-bypass risks, and historical implementation drift.
- Prior experimental hardening work, including commit `c1b475a`, is reference material only; do not copy/apply it without review, team decision, and staging validation.
- PRD should mark admission as a required MVP capability plus a required technical discovery/hardening workstream, not as a fully decided schema design.

## Refused User UX
- Refused/rejected users must never enter member-only app content.
- Product UX should be kind and explicit: the user should understand the account is under refusal/review outcome and may be invited to try again or contact the club, depending on final policy.
- French-first UI copy should use natural wording such as “refusé”/“demande refusée” rather than exposing database terminology like `rejected`.
- Runtime/database terminology may remain `rejected` if already implemented, but product copy should hide that technical label.
- Prior state redirected refused users from `/en-attente` to `/connexion`, hiding the refusal reason and creating a confusing loop.
- Current tolerated route `/en-attente` may show refused state for now; future changed/new route architecture should prefer English route identifiers with French-first copy.
- Admin refusal status remains source of truth until the admission model is redesigned.

## Profile And Member Search MVP
- Approved members need a simple identity profile for trust inside the private club.
- MVP profile follows X identity for now: X handle and X/avatar photo remain primary identity anchors.
- MVP profile fields: X handle, X/avatar photo when available, first name, last name, full name/display name, and short bio.
- Approved member can complete/edit required profile information during onboarding or profile settings.
- Member discovery is retained only where it supports chat/community trust; standalone annuaire is legacy, not active MVP product.
- Member search should live at the top of the channel list, similar to WhatsApp/Signal, and should search messages/members from the chat context.
- Search results should display individual results instead of only channel navigation, with channel name/context and highlighted matched word when searching messages.
- Member card/detail should expose useful identity context and X profile link when available.
- Sponsor/parrain relationship must be stored for admission traceability.
- Sponsor visibility product rule: a user can see their own sponsor; a sponsor can see users they sponsored with profile links; admins can see all sponsor relationships on profiles.
- Sponsor/sponsored badges for connected users are desirable future UX but non-MVP.
- Existing `/membres` annuaire and `/membres/[id]` detail routes are tolerated legacy/current surfaces; do not force route unification for MVP if risky.
- Route strategy: new/changed route identifiers should be English; existing French routes may remain during MVP and be converged later through aliases/redirects if needed.
- `profiles_public` and any profile view/table dependency must be audited before beta; do not rely on unclear profile schema for privacy-sensitive display.
- Open decisions: exact member-detail surface, profile privacy boundaries, retained search fields, query normalization, and route-convergence timing.

## Chat Channels And Messages MVP
- US3: Approved members enter the private app and use a chat-centered interface with predefined group channels/canals; non-approved users cannot enter the app.
- Chat is the core MVP product surface; communication model is closer to Telegram/WhatsApp/Signal group channels than a forum.
- MVP channels are group channels defined by admins; users cannot propose channels, create channels, or create private 1:1 messages for now.
- Admins should be able to rename existing channels and add new channels from the admin panel.
- Chat routing architecture remains undecided: current routes include `/chat` and `/chat/[slug]`, but simpler UX is preferred until deciding between URL-routed channels and fuller PWA/client-state navigation.
- Current implemented chat evidence includes shell, channel list, DM list, navigation, message list, realtime updates, composer, optimistic send, images, edit/delete, mentions, partial admin pin UI, global/header search, and full-text message index.
- Launch channel taxonomy is not final; existing implemented public channels may be accepted temporarily, but PRD must not claim final taxonomy until owner/team decides and seeded data/runtime match.
- Potential launch channels discussed: General/general, Business/business, Politique/politique, Divers/divers, Jobs/jobs.
- No jobs/offers marketplace like the forum is MVP.
- Jobs/offers may exist only as a read-only channel for non-admins, where admins can publish offers.
- If Jobs/offers channel is retained, approved non-admins may read it, only admins may publish, and bypass must be rejected server/database-side.
- Retained or parked interactions must be classified before beta: reply, mentions, pin, edit/delete, link preview, global chat search, reactions, reports/blocks, hidden channels, moderation actions.
- Search from chat should support message/member lookup with contextual results, not only channel navigation.
- Open chat follow-ups: route-safe search result opening, reliable found-message context/deep link, schema support for pin/reply/moderation if retained, trimming risky non-MVP interactions, channel-specific composer restrictions if retained.

## Forum Annuaire And Landing Scope
- Forum is overfeatured legacy, not explicit Beta 1 product; do not expand it, and hide/de-emphasize it from MVP navigation.
- Standalone Annuaire is legacy, not active MVP product; retain only member identity/search surfaces needed for chat/community trust.
- Main member navigation includes Chat and excludes Forum and Annuaire; existing `/forum`, `/membres`, and `/membres/[id]` routes may remain controlled/direct-accessible during MVP if removing them is risky.
- Landing page is the public website layer; it should explain Le Marche Libre, provide basic legal/terms access, and expose a clear access/open-app CTA.
- Landing copy must be French-first and i18n-ready, while avoiding promises of Forum, Annuaire, jobs/offers marketplace, annonces, broad access, or other parked surfaces.
- Exact terminology and semantics for the public positioning must be discussed further before final copy is written.
- Public messaging must not imply open self-service access; it should set expectation for closed beta/manual review.

## MVP UI Route Cleanup Status
- Feature `006-mvp-ui-route-cleanup` is recorded complete and provides implementation evidence for chat-first navigation cleanup.
- Approved/onboarded destinations were changed from `/forum` to `/chat` in middleware/auth/onboarding/waiting/admin/settings/sidebar/chat-back flows.
- Current default routing contract: approved+onboarded -> `/chat`; approved+not-onboarded -> `/onboarding`; pending -> `/en-attente`; rejected/refused -> explicit status boundary; non-admin admin fallback -> `/chat`; settings/sidebar/logo home -> `/chat`.
- Forum removed from main community nav and Annuaire removed from main network nav while route files remain.
- Footer/landing copy was adjusted to avoid promising Forum, Annuaire, offers/jobs marketplace, annonces, or other parked surfaces.
- Chat channel proposal UI was hidden/removed; users should not see proposal lists, votes, `Proposer un salon`, or proposal forms.
- Header message search links use `/chat/[slug]` where slug exists; remaining `/chat?channel=${channelId}` mention notification link is tolerated pending routing/search architecture decision.
- Route cleanup intentionally did not remove `/forum`, `/membres`, or `/membres/[id]`; future removal requires replacement/redirect strategy and risk review.
- Route cleanup intentionally did not change Supabase migrations/RLS/schema/generated types/storage, dependencies/locks, jobs/offers marketplace, or broad chat/forum/annuaire/notifications architecture.

## Supabase Schema And Reproducibility
- Supabase schema/reproducibility is a critical technical discovery area; runtime must not rely on unreproducible schema, unclear RLS, or production-only objects before beta.
- High-risk areas to audit: profiles/member status, sponsor/parrain tracking, channel membership, messages, notifications, admin actions, and related RLS policies.
- Existing findings to verify: `profiles_public` appears referenced by `/membres` and `/membres/[id]`, but no matching `CREATE VIEW profiles_public` migration was found.
- Existing findings to verify: `specialty_categories.sector` appears read by app/types/tests, but migration `00008_specialty_categories.sql` creates only `id`, `name`, `sort_order`.
- Existing findings to verify: onboarding writes `welcome` notification while migrations only clearly add `sponsor_request`; final minimal notification type set remains `welcome`, `sponsor_request`, `account_approved`, `chat_mention` if already present, with `account_rejected` excluded unless product decides.
- Existing reproducibility evidence: `countries`, `cities`, `specialty_category_ids`, `chat_muted_until`, and `chat_banned` appear covered by versioned migrations; verify against target environment before relying on them.
- Existing migration audit found unique prefixes `00001` through `00020`; rerun before new migrations.
- Channel proposal trigger mismatch exists in legacy code/docs, but user-created channel proposals are non-MVP and should not drive beta scope except to hide/disable unsafe legacy behavior.
- PRD should require a technical schema/RLS audit task before committing implementation details around admission, profiles, sponsor tracking, channels, messages, and notifications.

## Authorization RLS And Data Safety
- Authorization integrity is central; access control must be enforced server/database-side, not only by UI hiding.
- Security audit must cover member status/access, admin approval/refusal, sponsor/parrain relationships, channel membership, message posting, read-only Jobs/offers channel if retained, notifications, and moderation actions.
- Exact RLS policies and table/field names are not yet trusted; audit current Supabase schema and policies before committing implementation details.
- Known risk categories to investigate: self-approval or profile privilege escalation, admin-action bypass, sponsor/parrain visibility leaks, private/sensitive profile data exposure, unauthorized channel creation, unauthorized message posting, notification spam, and unsafe SECURITY DEFINER functions.
- Users who are pending or refused must not read or write member-only chat data.
- Non-admin users must not approve/refuse members, mutate admin-only profile/status fields, create/rename channels, publish in read-only Jobs/offers channel if retained, or perform admin moderation actions.
- Sponsor/parrain users must not gain broad write access to sponsored profiles; sponsor visibility should follow product rules only.
- Legacy non-MVP surfaces such as forum/proposals/DMs/invitations must be hidden, disabled, or explicitly audited if still reachable.
- Required negative tests should be derived after schema audit and should prove blocked access for pending/refused users, non-admin admin actions, unauthorized channel/message actions, and unauthorized notification/profile mutations.

## Admin And Bootstrap Requirements
- Admin area is required for MVP because admission is manually reviewed one by one.
- Existing admin routes/actions appear to include `/admin`, `/admin/utilisateurs`, `approveUser`, and `rejectUser`; exact implementation must be audited before relying on them.
- Admin MVP capabilities: view pending candidates, inspect required profile/admission/sponsor information, approve candidates, refuse candidates, and manage predefined chat channels/canals.
- Admin channel capabilities should include adding and renaming group channels from the admin panel.
- Admin actions must be server/database-authorized, idempotent where possible, auditable, and unavailable to non-admin users.
- Reapproval, refusal reversal, and sponsor/parrain bypass are undecided policy topics and should not be implemented casually before team decision.
- Any bootstrap of existing profiles into admin users is an operational migration task, not a product requirement; it must be backed up, explicit, environment-confirmed, and avoid committing personal data.
- Existing French admin routes are tolerated/current; future changed/new route architecture should prefer English route identifiers with French-first app copy.

## Moderation MVP Requirements
- Moderation MVP is lightweight because the product is a closed private club, but admin message removal and member reporting are required.
- Admins can delete messages.
- When a message is deleted, the feed should keep a replacement/tombstone message so the conversation remains understandable without exposing removed content.
- Every approved member can report a message through a two-step action: open message dropdown -> click “Report message” -> button changes to “Confirm” -> click again to submit.
- Reporting MVP does not require a complex moderation center; it only needs to record/report the message for admin follow-up.
- Full moderation center, complex enforcement workflows, advanced reporting categories, and automated moderation are non-MVP unless beta risk requires them.
- Exact message schema fields and mutation path are not trusted yet; audit current message tables, RLS, and client/server mutation paths before implementing moderation changes.
- Direct client mutations for sensitive actions should be avoided or replaced with server-authorized actions/RPCs where needed.

## Roadmap And Release Blockers
- Beta target is next week; documentation migration has slowed execution, so remaining planning must become very clean, short, and directly actionable.
- Roadmap must assume small human-in-the-loop execution capacity: owner plus AI agents; prioritize ruthless MVP-of-MVP stabilization over broad cleanup.
- Phase 0 immediate: freeze expansion, finalize clean MVP scope, identify only beta-blocking discovery tasks, and stop further documentation drift.
- Phase 1 immediate: stabilize critical blockers: X auth/admission flow, onboarding completion, schema/RLS minimum safety, chat-first routing, and build/test baseline.
- Phase 2 MVP-of-MVP: ship only the essential closed-beta loop: public landing/access CTA, X entry, pending/refused/approved states, onboarding information/profile completion, chat group channels, admin review, member search where needed, lightweight moderation.
- Phase 3 next-week closed beta: invite controlled first users only after route/access matrix, chat read/send, admission states, admin review, and public messaging are validated.
- Phase 4 post-beta: widen beta or continue hardening based on blockers, member activity, operational readiness, and post-beta backlog.
- Current release blockers: onboarding finalization 500/loop risk; Supabase schema/RLS uncertainty; lint/Vitest baseline failures; backlog/status drift; admission model uncertainty; route/language strategy; public landing/access CTA clarity.
- Candidate runtime work: verify/remove remaining `/forum` defaults, audit profile schema dependencies such as `profiles_public`, align notification types, perform admission/schema/RLS discovery and hardening, repair build/lint/test baseline, complete MVP admission/profile/chat/admin/moderation flows.
- Principle for next week: if a task does not directly reduce beta launch risk or enable the MVP-of-MVP loop, park it.

## Cross-Feature Dependencies And Product Decisions
- Admission gates everything: chat, profile/member search, admin surfaces, and moderation only matter for approved members inside the private app.
- For MVP, there is no per-channel admission/access segmentation: approved users can see all channels and write in all channels except Jobs/offers if retained.
- Jobs/offers channel, if retained, is read-only for non-admin approved users; admins can read/write all channels.
- Profile/member search supports chat trust and onboarding identity; it must not become a standalone annuaire rebuild before beta.
- Chat depends on admission access, admin-defined channels, and minimum message safety/moderation.
- Admin depends on audited admission model, safe authorization, and channel-management needs.
- Landing depends on final public terminology, French-first/i18n copy, clear access CTA, and honest closed-beta/manual-review expectation.
- Sponsor visibility is partially decided: user sees own sponsor, sponsor sees sponsored users, admin sees all; badges and richer sponsor UX are non-MVP.
- Deferred/non-blocking unless directly needed for beta: reversal policy, full route unification, design legacy files, broad profile enrichment, user channel proposals, private DMs, advanced moderation center, full Jobs/offers marketplace.
- Blocking for next-week beta only if unresolved in the launch loop: X auth/admission, onboarding completion, pending/refused/approved states, admin approval/refusal, chat read/send, channel visibility, minimal member search, lightweight moderation, public landing/access CTA, schema/RLS minimum safety.
- Default safe PRD stance: preserve controlled brownfield behavior, hide non-MVP promises/entry points, avoid broad refactors, and prioritize server/database authorization plus reproducibility before invites.
