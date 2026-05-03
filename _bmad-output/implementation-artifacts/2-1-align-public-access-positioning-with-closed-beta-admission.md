# Story 2.1: Align Public Access Positioning With Closed-Beta Admission

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want the public access path to clearly explain that Le Marche Libre is a private closed-beta club with manual admission,
so that I understand what I am applying for before starting sign-in.

## Acceptance Criteria

1. Given a visitor reaches the public landing, legal, or access entry surfaces, when they read the page copy or choose the primary access action, then the product clearly communicates private club, closed beta, and manual-review expectations.
2. Legal, terms, and privacy pages remain accessible from public surfaces.
3. Parked or future-only features are not presented as current MVP promises.
4. The primary access action starts the app access flow without implying automatic membership.
5. The flow remains usable on mobile widths used by beta candidates.

## Tasks / Subtasks

- [x] Audit current public/access/legal positioning before editing (AC: 1, 2, 3, 4, 5)
  - [x] Read every in-scope file listed in `Current State of Files To Audit` and confirm the current copy/CTA behavior still matches this story guide.
  - [x] Keep a short implementation note of any copy surfaces intentionally left unchanged and why.
- [x] Update public landing copy and CTAs to private closed-beta positioning (AC: 1, 3, 4, 5)
  - [x] Replace signup language such as `S'inscrire gratuitement`, `S'inscrire`, `Creer mon compte`, and `Validation sous 24h` where it implies open or guaranteed access.
  - [x] Use French-first wording that frames the action as access request/candidacy, for example `Demander l’accès`, `Rejoindre avec X`, or `Rejoindre la bêta privée`, while preserving the existing route flow unless a concrete link is wrong.
  - [x] Reframe landing search/profile-discovery copy so it does not imply a public annuaire or automatic member-profile access in the MVP.
  - [x] Review public landing/footer links that point directly to `/chat`; preserve the `/chat` route itself, but do not present public `/chat` links as immediate member access if the intended action is beta admission.
  - [x] Preserve the existing Tailwind/component structure and mobile header behavior; do not redesign the landing page.
- [x] Update access entry and auth copy without changing OAuth mechanics (AC: 1, 4, 5)
  - [x] Update `/inscription` and `/rejoindre` copy to state that X sign-in starts a manual admission request, not automatic membership.
  - [x] Preserve the existing Supabase X OAuth calls, `getAuthCallbackUrl()`, referral cookie behavior, and returning-session behavior.
  - [x] Soften referral wording that currently sounds automatic; referral/sponsor context should be attached to the admission request, not promised as automatic approval.
- [x] Update legal/privacy/terms copy to match MVP scope (AC: 2, 3)
  - [x] Keep `/mentions-legales`, `/confidentialite`, and `/cgu` public and linked from public/legal surfaces.
  - [x] Reframe claims that forum, annuaire/member discovery, annonces/jobs/offers, broad profile search, signalement/blocking, or notifications are current public/MVP promises. Preserve legally accurate disclosures for implemented, data-retained, or protected legacy surfaces, but do not market parked features as current beta value.
  - [x] Align cookie-banner copy with the privacy page if it currently claims traffic analysis while privacy says no advertising/tracking cookies.
  - [x] Keep legal language coherent with private club, closed beta, X identity, manual admission, and chat-centered MVP scope.
- [x] Update metadata if it still promises parked marketplace/discovery features (AC: 3)
  - [x] Replace root metadata description that currently promises missions/services with closed-beta/private-chat positioning.
  - [x] Do not introduce SEO expansion, structured data, or new public growth-loop work.
- [x] Add or update targeted source-inspection tests (AC: 1, 2, 3, 4)
  - [x] Extend `src/__tests__/mvp-route-cleanup.test.ts` or add `src/__tests__/public-access-positioning.test.ts` for closed-beta/manual-review copy and absence of open-signup/current-feature promises.
  - [x] Preserve existing route cleanup assertions for legal public access, chat default routing, refused state, and parked forum/annuaire navigation.
  - [x] Add negative assertions for specific replaced marketing/current-feature phrases such as `S'inscrire gratuitement`, `Validation sous 24h`, `Creer mon compte`, and concrete forum/annuaire/jobs/offers promise text. Do not add blanket failures for legitimate legal disclosures, imports, route names, comments, or parked protected code references.
- [ ] Verify and record baseline/regression status (AC: 1, 2, 3, 4, 5)
  - [x] Run targeted Vitest for changed/new tests with `npx vitest run <test-file>`.
  - [x] Run `npm run lint` if practical and classify the known lint baseline separately from any new issue.
  - [x] If full Vitest is run, classify the known `src/__tests__/profile-utils.test.ts` availability-label failures as baseline unless they changed.
  - [ ] Perform a concrete 375px mobile-width review for landing, access/auth, and legal/privacy surfaces. Confirm header/menu, primary CTA, X auth button, legal links, and legal/privacy content remain usable with no obvious horizontal overflow; record any unverified responsive risk.

### Review Findings

- [x] [Review][Patch] Cookie banner still presents opt-in consent despite necessary-cookies-only policy [src/components/ui/cookie-banner.tsx:41]
- [x] [Review][Patch] Auth layout still says every professional is sponsored [src/app/(auth)/layout.tsx:31]
- [x] [Review][Patch] Hero still markets profile discovery as an active MVP value [src/components/home/animated-hero.tsx:156]
- [x] [Review][Patch] Story records a concrete 375px review without evidence beyond source inspection [_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md:367]

## Dev Notes

### Story Scope

Story 2.1 is a public positioning and scope-containment story. It should make the visible public/access/legal entry path truthful for a private closed beta with manual admission. It is not an auth-flow rewrite, admission-state implementation, legal-compliance overhaul, navigation cleanup epic, or design refresh. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.1: Align Public Access Positioning With Closed-Beta Admission`]

The implementation should be the smallest brownfield-safe set of copy, metadata, CTA label, and targeted test changes needed to satisfy the acceptance criteria. Do not change Supabase schema/RLS, auth callback behavior, middleware route guards, protected routes, package files, generated types, dependencies, or legacy route files for this story unless a direct Story 2.1 blocker is discovered and explicitly documented. [Source: `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`; Source: `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`]

### Epic 2 Context

Epic 2 covers private club entry, identity, and admission. It owns public positioning, legal/access entry, X auth, admission information capture, pending/refused/onboarding/approved state handling, and route blocking for non-member states. Story 2.1 is intentionally first because visitors must understand closed beta and manual review before the rest of the X sign-in/admission flow is refined. [Source: `_bmad-output/planning-artifacts/epics.md#Epic 2: Private Club Entry, Identity, and Admission`]

Cross-story context in Epic 2:

- Story 2.2 preserves X sign-in and returning sessions; do not pre-empt it by rewriting OAuth flow.
- Story 2.3 captures admission/profile information; do not add new admission fields here.
- Story 2.4 shows pending/refused states; do not change `/en-attente` behavior except for public copy references if truly necessary.
- Story 2.5 routes approved users to onboarding or `/chat`; do not change route-state logic here.
- Story 2.6 enforces route boundaries; do not treat this copy story as the authorization boundary.

### Product and UX Requirements

Public surfaces must say, in French-first user-facing copy, that Le Marche Libre is a private club / closed beta with manual review. They must not imply open self-service access, guaranteed activation, or a broad public professional directory. [Source: `_bmad-output/planning-artifacts/prd.md#Public Access and Positioning`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Executive Summary`]

The primary access action must start the current access flow while making the user's mental model clear: X sign-in starts an admission request or beta candidacy; it does not grant automatic membership. Prefer clear CTA labels such as `Demander l’accès`, `Candidater avec X`, or `Rejoindre la bêta privée` over open-account language. [Source: `_bmad-output/planning-artifacts/epics.md#Story 2.1: Align Public Access Positioning With Closed-Beta Admission`; Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`]

Legal, terms, and privacy pages must remain public and coherent with the private closed-beta positioning. They should not market parked surfaces as active MVP functionality. Preserve legally accurate disclosures for implemented, data-retained, or protected legacy surfaces, but phrase them as legal/data scope rather than public beta promises. Avoid product-promise language for forum, annuaire, jobs/offers, broad discovery, DMs, AI, Nostr, Lightning, media, polls, or platformization. [Source: `_bmad-output/planning-artifacts/prd.md#Domain-Specific Requirements`; Source: `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`]

Mobile usability matters because candidates may arrive from X links. Preserve the existing responsive layout patterns and verify at 375px for the landing, access/auth, and legal/privacy surfaces touched by this story. Header/menu, primary CTA, X auth button, legal links, and legal/privacy content must remain usable without obvious horizontal overflow. Do not introduce new breakpoints or a broad responsive redesign. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`]

### Architecture Compliance

Active stack and constraints:

- Next.js `16.2.1` App Router with React `19.2.4`.
- TypeScript strict mode with `@/*` imports from `src`.
- Tailwind CSS 4 and existing UI/component patterns.
- Supabase via existing helpers only; this story should not need Supabase changes.
- Tests live under `src/__tests__`; `package.json` has no `test` script, so use `npx vitest run ...` directly.

[Source: `_bmad-output/project-context.md#Technology Stack & Versions`; Source: `package.json`]

Project structure mapping for this story:

- Public landing and footer: `src/app/page.tsx`.
- Landing components: `src/components/home/*`.
- Access entry: `src/app/rejoindre/page.tsx` and `src/app/(auth)/inscription/page.tsx`.
- Returning login copy: `src/app/(auth)/connexion/page.tsx` and `src/components/auth/oauth-buttons.tsx` if needed.
- Auth-side brand panel: `src/app/(auth)/layout.tsx`.
- Legal pages/layout: `src/app/cgu/page.tsx`, `src/app/confidentialite/page.tsx`, `src/app/mentions-legales/page.tsx`, `src/components/legal/legal-page-layout.tsx`.
- Cookie disclosure surface: `src/components/ui/cookie-banner.tsx`.
- Root metadata: `src/app/layout.tsx`.
- Tests: `src/__tests__/mvp-route-cleanup.test.ts` or a new focused source-inspection test under `src/__tests__`.

[Source: `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`; Source: `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`]

### Next.js 16 Notes

Installed Next.js 16 docs were checked during story creation. Relevant guidance:

- Use `<Link>` for navigation unless there is a specific reason to use `useRouter`; this story should prefer existing `<Link>` CTA patterns for route changes. [Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md#useRouter`]
- `useSearchParams` is a Client Component hook and production prerendering requires a Suspense boundary around the client subtree that uses it. Existing `src/app/rejoindre/page.tsx` already wraps `RejoindreContent` in `<Suspense>`; preserve this if editing the file. [Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md#Behavior`]
- Next.js 16 navigation prefetch improvements require no code changes. Do not make routing/cache changes for this copy story. [Source: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md#Enhanced Routing and Navigation`]

### Current State of Files To Audit

Read these files before editing if they are in scope for the final implementation. The observations below are from create-story analysis and must be rechecked in case the worktree changed. Some files are audit-only and should not be edited unless a direct Story 2.1 blocker is found.

`src/app/page.tsx`

- Current state: Renders the public landing by composing home components and a footer. Footer legal links are present for `/mentions-legales`, `/confidentialite`, and `/cgu`. Footer account link says `S'inscrire` and points to `/inscription`; platform footer links to `/chat` directly.
- What this story changes: Update footer/access wording if it implies automatic signup; consider whether public footer should label access as beta candidacy rather than signup. Preserve the `/chat` route itself, but public footer links should not imply immediate member access.
- Preserve: Legal links, `CookieBanner`, landing component order unless a copy-specific reason exists, direct `/chat` route existence.

`src/components/home/landing-header.tsx`

- Current state: Client component with desktop and mobile nav. Primary CTA says `S'inscrire gratuitement` and links to `/inscription`; mobile menu repeats it.
- What this story changes: Replace open-signup wording with private-beta/manual-admission CTA copy.
- Preserve: Existing menu state, `ToggleTheme`, mobile hamburger behavior, link-based navigation.

`src/components/home/floating-header.tsx`

- Current state: Scroll-triggered floating nav; CTA says `S'inscrire` and links to `/inscription`.
- What this story changes: Align CTA label with beta access request/candidacy language.
- Preserve: Scroll visibility behavior, existing styling, `/connexion` link.

`src/components/home/animated-hero.tsx`

- Current state: Client component with a 3D marquee, fake search results, a search input, CTAs linking to `/inscription`, and copy such as `Le premier reseau ferme... Chaque membre est verifie manuellement.` This file already has some aligned manual-verification copy, but the fake search/profile flow can imply public annuaire/member discovery and automatic account access. The search button says `Rechercher`; dropdown says `Inscrivez-vous pour voir les profils complets` and `Creez un compte pour y acceder`.
- What this story changes: Keep the strongest private/manual-review copy; reframe or remove search/profile-access language that overpromises member discovery as a current public/MVP capability. Ensure CTA starts access flow without implying automatic membership.
- Preserve: Existing visual structure, `FadeIn`, marquee/image behavior, mobile-safe layout, no broad redesign.

`src/components/home/animated-features.tsx`

- Current state: Feature grid already says `Identifiant X obligatoire. Validation manuelle par un administrateur.` It also has copy like `Trouvez des professionnels pres de chez vous` and profile/network claims that may imply annuaire/discovery is current MVP.
- What this story changes: Emphasize private beta, X-native identity, manual admission, and chat-centered community. Remove/reframe current-service promises for broad professional discovery if they imply parked annuaire.
- Preserve: Existing bento grid structure, icons, Tailwind classes, and no design-system changes.

`src/components/home/animated-professions.tsx`

- Current state: Large profession taxonomy and copy `Des centaines de professions representees` / `vous trouverez des pairs verifies`. This may overpromise scale and broad directory discovery before the initial 10-30 user beta.
- What this story changes: Reframe as selected beta/community context if retained, or reduce promise strength.
- Preserve: Component only if still useful; do not replace with new large design unless necessary.

`src/components/home/animated-steps.tsx`

- Current state: Three-step explanation: create account, admin verifies X, then network is yours. This is mostly aligned but `Actif en 3 etapes` and `Le reseau est a vous` may imply guaranteed activation.
- What this story changes: Make manual review and conditional admission explicit; avoid guaranteed activation language.
- Preserve: Three-step structure and existing X-logo pattern.

`src/components/home/animated-cta.tsx`

- Current state: CTA says `Pret a rejoindre le reseau ?`, `Inscription gratuite. Validation sous 24h. Aucun engagement.`, and button `Creer mon compte`.
- What this story changes: Remove guaranteed timing/open-signup implication. Replace with manual-review/private-beta wording.
- Preserve: Existing card layout and button styling.

`src/app/rejoindre/page.tsx`

- Current state: Client access page using `useSearchParams`, referral cookie, Supabase browser client, `signInWithOAuth({ provider: "x", options: { redirectTo: getAuthCallbackUrl() } })`, and Suspense wrapping. Copy says `Rejoindre MarcheLibre`, `Le reseau ferme des professionnels liberaux verifies`, `S'inscrire avec X`, and referral text says account will be automatically attached to sponsor.
- What this story changes: Clarify that X sign-in starts a beta admission request/manual review. Rephrase referral copy so sponsor context is attached to the request, not approval. Keep referral cookie and OAuth mechanics unchanged.
- Preserve: `useSearchParams`, Suspense boundary, `ml-referral` cookie behavior, `createClient`, `getAuthCallbackUrl`, X provider.

`src/app/(auth)/inscription/page.tsx`

- Current state: Client auth page with direct X OAuth call. Copy says `S'inscrire avec X`; info box already says X is identity and an existing member must sponsor activation.
- What this story changes: Align heading/button/body with candidacy/manual review instead of open signup.
- Preserve: OAuth function and info-box structure.

`src/app/(auth)/connexion/page.tsx` and `src/components/auth/oauth-buttons.tsx`

- Current state: Returning login says `Connectez-vous pour acceder a votre reseau`; new-account link says `Rejoindre le reseau`; OAuth button says `Continuer avec X`.
- What this story changes: Only adjust copy if needed to avoid automatic membership implication for non-members. Do not break returning-session behavior.
- Preserve: Existing `OAuthButtons` behavior and `getAuthCallbackUrl` usage.

`src/app/(auth)/layout.tsx`

- Current state: Auth layout brand panel is mostly aligned: manually validated members, verified community, private chat. It may still describe a broad professional network.
- What this story changes: Optional copy alignment only if needed.
- Preserve: Layout structure, mobile logo, child slot, no auth route changes.

`src/app/cgu/page.tsx`

- Current state: Terms list `Annuaire des membres`, `Forum`, sponsorship, notifications, signalement/blocking, and broad profile/service wording as active platform features.
- What this story changes: Reframe service description around private closed beta, X identity, manual admission, approved-member chat, and limited beta operations. Avoid presenting parked forum/annuaire/jobs/offers/broad discovery as current MVP promises.
- Preserve: `LegalPageLayout`, public accessibility, legal contact links, core legal structure.

`src/app/confidentialite/page.tsx`

- Current state: Privacy copy mentions forum, annonces, annuaire/member profile visibility, notifications, moderation, and tracking/statistics categories. Some data categories may reflect brownfield code, but they can read as current MVP promises.
- What this story changes: Keep privacy disclosure accurate, but avoid marketing parked features as active MVP. Align collected-data purposes with X auth, admission/profile, approved-member chat, notifications where actually relevant, and admin/manual review. Check the existing full-width purposes table at 375px if edited; wrap or simplify only if it creates obvious horizontal overflow.
- Preserve: Privacy/legal structure and public route behavior.

`src/app/mentions-legales/page.tsx`

- Current state: Mostly legal publisher/host/content/cookie copy; likely less change needed.
- What this story changes: Only adjust if wording conflicts with closed-beta/manual-admission positioning.
- Preserve: Public legal page and `LegalPageLayout`.

`src/components/legal/legal-page-layout.tsx`

- Current state: Shared legal header/footer with links back to landing and legal pages.
- What this story changes: Probably none unless a public access CTA/link is added deliberately.
- Preserve: Public navigation and legal links.

`src/components/ui/cookie-banner.tsx`

- Current state: Public cookie banner says cookies are used to improve experience and analyze traffic, while the privacy page says no advertising/tracking and only strictly necessary/preference cookies.
- What this story changes: If the privacy page is kept in its current no-tracking posture, align the banner wording so it does not imply analytics or broader tracking that the MVP does not use.
- Preserve: Existing localStorage consent behavior, buttons, and mobile-safe fixed positioning unless a concrete usability issue is found.

`src/app/layout.tsx`

- Current state: Root metadata says `MarcheLibre | Le reseau des independants` and describes missions/services/professionals, which conflicts with MVP closed-beta/chat-centered positioning.
- What this story changes: Replace metadata description with private club / closed beta / X identity / manual admission language.
- Preserve: font, theme script, providers, icons.

`src/lib/supabase/middleware.ts`

- Current state: Legal routes are already public and excluded from authenticated profile-state redirects after Story 1.3. It routes approved/onboarded users to `/chat`, approved/not-onboarded to `/onboarding`, pending/refused to `/en-attente`, logged-out protected access to `/connexion`.
- What this story changes: None expected.
- Preserve: All route-state behavior; do not alter middleware for this story unless a direct public-access bug is found and documented.
- Audit-only note: This file is listed to prevent accidental auth/legal regressions. Do not edit it for copy positioning. A returning-session edge for `/rejoindre` may be addressed in Story 2.2 unless the owner explicitly expands Story 2.1.

### Testing Requirements

Use source-inspection tests because this story is mostly copy/scope positioning and the existing suite already uses this pattern. `src/__tests__/mvp-route-cleanup.test.ts` currently reads source files with `readFileSync` and asserts against public-feature promises, legal public access, chat default routing, and refused state. Extending this file is acceptable; creating a focused `src/__tests__/public-access-positioning.test.ts` is also acceptable if it keeps assertions clearer. [Source: `src/__tests__/mvp-route-cleanup.test.ts`; Source: `_bmad-output/planning-artifacts/architecture.md#File Organization Patterns`]

Suggested tests:

- Assert public/access files contain private beta/manual review wording in key surfaces.
- Assert replaced open-signup/guarantee strings are absent from landing and access files.
- Assert legal pages do not present specific parked forum/annuaire/jobs/offers marketing phrases as current MVP promises while avoiding blanket failures for legitimate legal disclosures or route references.
- Assert legal routes remain in middleware `legalRoutes` and remain outside approved-onboarded `/chat` redirect list if middleware is touched.
- Preserve existing tests for `/chat` as app home and parked forum/annuaire primary navigation.

Verification commands to record:

- `npx vitest run src/__tests__/mvp-route-cleanup.test.ts` or `npx vitest run src/__tests__/public-access-positioning.test.ts` depending on changed tests.
- `npm run lint` if practical; classify known baseline failures separately.
- Optional full suite: `npx vitest run`, with known `src/__tests__/profile-utils.test.ts` availability-label failures classified as baseline unless changed.

Known baseline from recent Epic 1 work:

- Targeted route/auth/security tests passed in Story 1.4: 3 files, 21 tests.
- `npm run lint` failed with known baseline shape: 94 problems (52 errors, 42 warnings).
- Full `npx vitest run` failed only on known baseline `src/__tests__/profile-utils.test.ts` availability-label assertions: 42 passed, 3 failed.

[Source: `_bmad-output/implementation-artifacts/1-4-document-launch-blocking-security-risks-and-non-blocking-accepted-beta-risks.md#Testing and Verification Requirements`]

### Previous Story Intelligence

Epic 1 completed with security/risk documentation and local hardening. The relevant carry-forward lessons are:

- Do not claim production security or schema behavior without evidence; Story 2.1 should avoid Supabase writes entirely.
- Legal pages were intentionally made public in Story 1.3; preserve that behavior.
- Refused users must continue seeing explicit refused state at `/en-attente`, not login loops.
- Verification records must distinguish baseline failures from new regressions.
- Documentation/story updates should be honest about limits and not mark parked features complete through copy.

[Source: `_bmad-output/implementation-artifacts/1-3-harden-server-and-database-authorization-for-confirmed-bypasses.md#Completion Notes List`; Source: `_bmad-output/implementation-artifacts/1-4-document-launch-blocking-security-risks-and-non-blocking-accepted-beta-risks.md#Completion Notes List`]

### Git Intelligence Summary

Recent commits before this story are:

- `docs: finalize story 1.4 launch risk register`
- `docs: create story 1.4 launch risk guide`
- `fix: harden authorization boundaries`
- `Merge story/1-2-mvp-access-matrix into dev`
- `docs: finalize story 1.2 access matrix`

The established pattern is BMad-guided, minimal, security-aware work with exact verification recording, targeted source tests, and review-driven corrections. Follow that pattern: small edits, no broad refactor, no dependency changes, no unverified completion claims. [Source: `git log --oneline -5` during create-story on 2026-05-03]

### Anti-Patterns To Avoid

- Do not replace X OAuth or add a new auth provider.
- Do not change `getAuthCallbackUrl()`, `NEXT_PUBLIC_SITE_URL`, Supabase env names, or callback route behavior.
- Do not convert `middleware.ts` to `proxy.ts` as part of this story.
- Do not delete `/forum`, `/membres`, `/rejoindre`, `/inscription`, `/chat`, legal routes, migrations, or historical data.
- Do not introduce a new design system, new component library, global state library, analytics platform, SEO expansion, or growth-loop work.
- Do not promise forum, annuaire, jobs/offers, broad search, DMs, E2E encryption, Nostr, AI, Lightning, media, polls, or platformization as current MVP functionality.
- Do not treat public copy changes as proof that private route/data authorization is fixed.

### References

- `_bmad-output/project-context.md#Brownfield MVP Operating Constraints`
- `_bmad-output/planning-artifacts/epics.md#Story 2.1: Align Public Access Positioning With Closed-Beta Admission`
- `_bmad-output/planning-artifacts/epics.md#Epic 2: Private Club Entry, Identity, and Admission`
- `_bmad-output/planning-artifacts/epics.md#Implementation Guardrails and Definition of Done`
- `_bmad-output/planning-artifacts/prd.md#Public Access and Positioning`
- `_bmad-output/planning-artifacts/prd.md#Domain-Specific Requirements`
- `_bmad-output/planning-artifacts/prd.md#SEO Strategy`
- `_bmad-output/planning-artifacts/architecture.md#Technical Constraints & Dependencies`
- `_bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Executive Summary`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Admission Flow: X Sign-In to Chat Access`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/rejoindre/page.tsx`
- `src/app/(auth)/inscription/page.tsx`
- `src/app/(auth)/connexion/page.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/cgu/page.tsx`
- `src/app/confidentialite/page.tsx`
- `src/app/mentions-legales/page.tsx`
- `src/components/home/landing-header.tsx`
- `src/components/home/floating-header.tsx`
- `src/components/home/animated-hero.tsx`
- `src/components/home/animated-features.tsx`
- `src/components/home/animated-professions.tsx`
- `src/components/home/animated-steps.tsx`
- `src/components/home/animated-cta.tsx`
- `src/components/legal/legal-page-layout.tsx`
- `src/components/ui/cookie-banner.tsx`
- `src/components/auth/oauth-buttons.tsx`
- `src/lib/supabase/middleware.ts`
- `src/__tests__/mvp-route-cleanup.test.ts`

## Change Log

| Date       | Change                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-03 | Created comprehensive Story 2.1 developer guide for public closed-beta positioning and manual-admission access copy.                      |
| 2026-05-03 | Implemented closed-beta public/access/legal positioning, metadata alignment, cookie copy alignment, and targeted source-inspection tests. |

## Dev Agent Record

### Agent Model Used

gpt-5.5 (OpenCode)

### Debug Log References

- `npx vitest run src/__tests__/public-access-positioning.test.ts` failed in red phase with 4 expected failures before implementation.
- `npx vitest run src/__tests__/public-access-positioning.test.ts` passed after implementation: 1 file, 4 tests.
- `npx vitest run src/__tests__/mvp-route-cleanup.test.ts` passed: 1 file, 9 tests.
- `npx vitest run` failed only on documented baseline `src/__tests__/profile-utils.test.ts` availability-label assertions: 5 files passed, 1 failed; 46 passed, 3 failed.
- `npm run lint` failed with documented baseline shape: 94 problems (52 errors, 42 warnings); surfaced issues are outside this story's changed runtime files except pre-existing `<img>` warnings in home/legal components.
- Source grep confirmed replaced public marketing phrases only remain inside the new negative assertions.
- `npx vitest run src/__tests__/public-access-positioning.test.ts src/__tests__/mvp-route-cleanup.test.ts` passed after review patches: 2 files, 13 tests.
- `npx eslint src/components/ui/cookie-banner.tsx src/app/(auth)/layout.tsx src/components/home/animated-hero.tsx src/__tests__/public-access-positioning.test.ts` returned only pre-existing `<img>` warnings in `src/app/(auth)/layout.tsx`.

### Completion Notes List

- Audited all story-listed public, auth/access, legal, metadata, cookie, middleware, and route-cleanup test files before editing.
- Left `src/app/mentions-legales/page.tsx`, `src/components/legal/legal-page-layout.tsx`, `src/components/auth/oauth-buttons.tsx`, and `src/lib/supabase/middleware.ts` unchanged because they already preserved public legal access or runtime behavior and did not need copy changes for Story 2.1.
- Updated landing/header/footer/CTA/search/profession copy to present MarchéLibre as a private closed beta with manual admission, not open signup, guaranteed validation, public directory access, or immediate `/chat` access.
- Updated `/inscription` and `/rejoindre` copy so X OAuth starts a manual admission request; preserved Supabase X OAuth, `getAuthCallbackUrl()`, referral cookie behavior, and returning-session mechanics.
- Reframed CGU and privacy copy around closed beta, X identity, manual admission, approved-member chat, and legally accurate protected-surface disclosures without marketing parked forum/annuaire/jobs/offers as current MVP value.
- Aligned cookie banner with privacy no-tracking posture and replaced metadata marketplace/discovery promises with closed-beta/admission positioning.
- Added targeted source-inspection coverage in `src/__tests__/public-access-positioning.test.ts` and verified existing MVP route-cleanup tests still pass.
- 375px responsive source inspection only: existing mobile header/menu, stacked CTA layout, full-width X auth buttons, legal links, and legal/privacy content wrappers were preserved; no new horizontal-overflow-prone structure was introduced. A concrete runtime viewport review at 375px remains to be completed.

### File List

- `_bmad-output/implementation-artifacts/2-1-align-public-access-positioning-with-closed-beta-admission.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/__tests__/public-access-positioning.test.ts`
- `src/app/(auth)/connexion/page.tsx`
- `src/app/(auth)/inscription/page.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/cgu/page.tsx`
- `src/app/confidentialite/page.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/rejoindre/page.tsx`
- `src/components/home/animated-cta.tsx`
- `src/components/home/animated-features.tsx`
- `src/components/home/animated-hero.tsx`
- `src/components/home/animated-professions.tsx`
- `src/components/home/animated-steps.tsx`
- `src/components/home/floating-header.tsx`
- `src/components/home/landing-header.tsx`
- `src/components/ui/cookie-banner.tsx`
