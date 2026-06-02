# Landing Page Orchestrator - Discovery Report

**Date:** 2026-05-27 (session start)
**Task:** Execute grok/prompts/landing-page-orchestrator.md for new /early-access route
**Status:** Discovery complete. All required inspections performed.

## Repository Overview
- **Framework:** Next.js 16.2.1 (app router, React 19.2.4)
- **Package manager:** bun (per project conventions in CLAUDE.md / AGENTS.md)
- **Styling:** Tailwind v4 + @tailwindcss/postcss + daisyUI (custom themes "marchelibre" dark + "marchelibre-light")
- **Primary font:** Plus Jakarta Sans (next/font/google, variable --font-plus-jakarta, set as --font-sans)
- **Additional:** @fontsource-variable/inter in package.json but NOT used in root layout or primary components (Plus Jakarta dominates)
- **Motion:** framer-motion + motion (both present; prefer motion/react per some skills but not required)
- **Icons:** lucide-react (primary in app code), XLogo custom component
- **Auth:** Supabase SSR + @supabase/ssr (X/Twitter OAuth via supabase.auth.signInWithOAuth)
- **No new dependencies allowed** (hard constraint)

## Existing Public Routes (key ones)
- `/` - Main homepage (animated hero/features, uses AccessModal via `/?auth=access`, LandingHeader + FloatingHeader, daisyUI buttons)
- `/acces-prive` - **Collision exists**. Sophisticated, already-built private club landing page matching the brief almost exactly (X identity, sponsor, 4 admission steps, topics: Entreprises/Politique/Projets/Emplois/Annonces, ticker, custom CSS module, AccessStoryRail, referral ?ref support, links CTA to /rejoindre). Uses semantic tokens (bg-bg-elevated, text-text-primary, Surface component, dark surfaces, XLogo). Very close to Signal/XChat minimal trust aesthetic.
- `/rejoindre` - Dedicated access request page (full X OAuth flow + referral handling via cookie `ml-referral`, creates sponsorship request, redirects based on profile status)
- `/connexion` and `/inscription` - Both redirect to `/?auth=access` (modal trigger)
- `/en-attente` - Post-auth waiting/admission review state (profile status, sponsor info, form)
- `/auth/x/continue` - OAuth intermediate page
- `/auth/callback` - Supabase OAuth handler
- Other: /cgu, /confidentialite, /mentions-legales, /onboarding, landing/* experiments (many), landing1/2/3 test pages
- Protected app under `(app)/` (chat, forum, membres, etc.) gated by middleware

**Conclusion on route:** `/acces-prive` collides. Per prompt: use `/early-access` (no collision). French convention exists but prompt defaults to /early-access on collision.

## Existing Access / Auth / Request Flow (Primary CTA Target)
- **ACCESS_MODAL_HREF** = `/?auth=access` (from src/lib/auth-entry.ts). Opens AccessModal (OAuthButtons + X login, Shield trust note). Used by homepage header/footer CTAs.
- **Dedicated flow:** `/rejoindre` (recommended for standalone landing CTAs). Handles:
  1. X login via Supabase OAuth
  2. Referral/sponsor handle (?ref= or cookie)
  3. createSponsorshipRequestForHandle if needed
  4. Redirects to /en-attente (if not approved) or /chat
- Post-login: /auth/x/continue → callback → en-attente (shows profile form, sponsor status, waiting UI)
- `getAuthEntryDestination` in lib/auth-entry.ts decides /en-attente vs /chat based on profile.status === "approved"
- **Existing acces-prive CTA target:** `/rejoindre` (with optional ref passthrough)
- **Sponsor flow:** parrainages/ page exists; sponsorship requests created server-side on /rejoindre

**CTA decision for new page:** Link primary CTA to `/rejoindre` (or `/rejoindre?ref=...` support). This is the cleanest existing "request access / authentication path" that matches the 4-step expected user journey in the prompt. Preserves all current behavior. Modal trigger `/?auth=access` is homepage-context only.

## Styling & Layout Conventions (to preserve exactly)
- **Color tokens (CSS vars, dark-first):** 
  - bg-bg-elevated (#0f1419 default), bg-bg-surface, text-text-primary (#f7f9f9), text-text-secondary, text-text-muted (#71767b)
  - Primary accent: #1d9bf0 (X blue) via --color-primary-500 etc. Custom pill CTAs in acces-prive use #8fd7ff light blue on dark text.
  - Borders: border-white/10, border-border-default (#2f3336)
  - Surfaces: rounded-[2rem], nested "Surface" wrapper with border + bg-black/26 + inner bg-black/50 (acces-prive pattern)
- **DaisyUI components:** Used in homepage/rejoindre (btn, btn-accent, base-100/200, loading spinner). Acces-prive mostly bypasses for custom dark surfaces.
- **Typography:** Plus Jakarta Sans, tight tracking-[-0.05em] to -0.055em on headlines, clamp() for responsive display sizes. Small caps tracking-[0.14em] or [0.18em] for tags.
- **Layout:** max-w-7xl or max-w-6xl mx-auto, generous py-24 / py-32 sections, responsive px-4 sm:px-6 lg:px-8. min-h-[100dvh] preferred over h-screen for viewport stability (iOS).
- **Motion:** Subtle, respect prefers-reduced-motion (globals.css has @media block). Framer/motion used in homepage animated-* components.
- **Header patterns:** Minimal logos + "Demander l’accès" CTAs. Floating or standard. No heavy nav on pure landing-style pages.
- **Dark mode:** Default (data-theme, data-mode). Full light support via [data-mode="light"] overrides. Viewport themeColor set for both.
- **No generic SaaS:** Existing premium pages (acces-prive especially) use quiet dark surfaces, X integration, no gradients/AI glows, no fake dashboards.

**Visual direction match:** The existing /acces-prive is already extremely close to "Signal and XChat: minimal, messaging-native, clear, trust-based, quiet, premium through restraint". New /early-access must feel consistent (same tokens, typography, X blue accents, sponsor/X proof language) but briefer per prompt ("do not over-explain").

## Navigation / Config Impact
- App dir: adding `src/app/early-access/page.tsx` (and optional layout/metadata) is sufficient. No next.config or additional registration needed.
- No sitemap or nav menu auto-includes new public pages (manual if wanted, but prompt says "only if required"; keep minimal, no unrelated changes).
- Middleware.ts exists (likely auth gating for (app)); new public route under src/app/ will be public by default.
- Manifest, icons, PWA: already in root layout; new page inherits.

## Next.js 16 Specifics
- Read relevant guides in `node_modules/next/dist/docs/` before any route behavior changes (per prompt).
- App router stable in 16.2.1. New route folders just work. No special enablement.
- Server Components default; client islands only where interactivity (e.g. referral param handling if needed).
- Metadata: use export const metadata or the project's createPageMetadata helper (used by acces-prive).

## Other Constraints Verified (Hard)
- No Supabase files touched (no schema, no new RLS, no functions).
- No auth behavior changes.
- No database changes.
- No unrelated routes modified (existing /acces-prive, homepage, rejoindre, etc. untouched).
- No package.json / lock changes (bun.lock / package-lock untouched).
- No BMad workflows used for implementation (only rubric reading for reviews per explicit orchestrator instruction).
- No new design system.
- Tests: vitest present; no clear route-level test pattern for public pages (landing1-3, acces-prive have none). Skip adding tests per "only if the repository already has a clear nearby pattern".

## French Language
- App is French-first ("Demander l’accès", "Club privé...", all routes French except some internals).
- CTA per prompt: French preferred → "Demander l'accès" (correct accent).
- Copy for new page: French, brief, serious, selective tone matching existing acces-prive / homepage footer.

## Evidence Gaps / Decisions Made (70%+ confidence)
- Route: `/early-access` (unambiguous per collision rule).
- CTA destination: `/rejoindre` (best match to "existing access request path" + sponsor flow + matches acces-prive precedent). Will support simple ref passthrough if trivial.
- Scope: Self-contained single page.tsx (minimal local components only if unavoidable). Reuse XLogo, Link, lucide if fits. Semantic tokens + Tailwind only. Keep < 200-300 LOC total.
- Visual: Dark, quiet surfaces, X proof, sponsor mention, 4-step admission in ultra-brief form, primary CTA prominent but restrained. Hero must immediately signal "private club + X + access request". No images unless existing public/ or simple (prompt allows existing icons/primitives).
- Length: Brief (hero + 2-3 short sections max + final gate). Avoid duplicating the elaborate /acces-prive.

## Files Inspected (partial list)
- package.json, tsconfig, next.config.ts, middleware.ts
- src/app/layout.tsx, globals.css (full), page.tsx (homepage)
- src/app/acces-prive/* (full page + module + rail)
- src/app/rejoindre/* (full)
- src/app/(auth)/* (connexion, inscription, en-attente)
- src/app/auth/x/continue + callback
- src/lib/auth-entry.ts, site-metadata.ts (inferred)
- src/components/auth/access-modal.tsx, landing-header.tsx
- .agents/skills/* (the 3 reviewers) + grok/protocols/* (scoring) — read only for rubric/protocol fidelity

**Next step:** Plan (route details, exact content outline, component strategy, CTA wiring, verification approach). Write to docs/landing-page/plan.md

All decisions documented here for autonomy. No user clarification needed (prompt + discovery sufficient).
