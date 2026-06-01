# Landing Page Orchestrator - Implementation Plan

**Based on:** discovery.md
**Date:** Session
**Confidence:** High on all structural decisions (discovery unambiguous; prompt constraints clear). Autonomous execution authorized.

## Route Decision
- **Target:** `/early-access`
- **Rationale:** Explicit collision on `/acces-prive` (already a high-quality, on-brief implementation). Prompt default: use `/early-access` when collision.
- **File:** `src/app/early-access/page.tsx`
- **Metadata:** Export const metadata (title: "Accès anticipé | MarchéLibre", French description focused on private club + X + sponsor).
- **No layout.tsx** (inherits root; avoids any risk of side effects). Pure page.
- **No changes to root layout, middleware, nav, sitemap, or any other route.**

## CTA Destination (Non-negotiable)
- **Primary:** `/rejoindre`
- **Why:** 
  - Exact match to prompt's expected user journey (X login → application details/sponsor handle → wait for review).
  - Existing, tested, production path (used by /acces-prive itself).
  - Supports ?ref= passthrough for sponsor context (via cookie + query).
  - Better standalone experience than modal trigger (/?auth=access is homepage-scoped).
- **Implementation:** Server component reads searchParams.ref, builds clean href (with ref if present), passes to client or Link. Single source of truth.
- **Label (French-first per app + prompt):** "Demander l'accès" (with correct apostrophe/encoding).

## Content Strategy (Brief + On-Brief)
Must communicate exactly these (prompt):
- What the club is (private, classical-liberal / freedom-oriented, mutual help, serious).
- Why X identity matters (proof of profile, public context, trust signal).
- Why sponsor-based access (explicit supporter, human review, not public noise).
- What members do inside (Business, Politics, Projects, Jobs, Opportunities, Announcements, Collaboration).
- Next action (CTA).

**Tone:** Selective, serious, minimal, trust-based, quiet. No startup-slop, no hype, no gradients.

**Structure (max 5-6 viewport sections, self-contained):**
1. **Header** (minimal, logo left, compact CTA right or none if redundant).
2. **Hero** (first viewport critical): Tag + H1 (≤2 lines) + 1-2 sentence sub + primary CTA. Immediately signals private messaging/community + access request. Dark elevated surface, XLogo, restrained blue accent.
3. **Signals of Trust** (3 short lines or minimal grid): Identité X, Sponsor explicite, Revue humaine. Messaging-native cards or just stacked text with icons if minimal.
4. **Inside the Club** (brief): 5-6 topics as short, high-signal phrases (no long cards). Use existing prompt language.
5. **Admission** (4 steps, ultra-compressed): Connexion X → Dossier → Sponsor → Lecture humaine. Numbered or timeline, tiny signals.
6. **Final Gate + CTA** (reinforce, legal footer links minimal).

**Copy (French, brief, serious - to be refined in code):**
- Tag: "Identité X · Accès sponsorisé · Revue manuelle"
- H1: "Travaillez entre profils qui partagent votre cap."
- Sub: "X ouvre le dossier. Un sponsor le situe. L'équipe lit avant d'ouvrir les espaces privés."
- Topics: Entreprises, Politique, Projets, Emplois, Opportunités, Annonces, Collaboration.
- Steps match prompt exactly (shortened).

**Avoid:** Over-explanation, feature lists, fake UI previews, multiple CTAs with same intent, em-dashes (per all 3 reviewer rubrics), generic AI patterns.

## Visual Direction (Signal / XChat aligned)
- Locked dark theme (use existing CSS vars: bg-bg-elevated, text-text-primary, etc.). No section theme flips.
- Premium through restraint: generous but not excessive whitespace (py-16/24), tight typography, 1-2 accent uses max (#1d9bf0 family or acces-prive #8fd7ff pill).
- Surfaces: subtle elevated panels with border-white/10, rounded-2xl/3xl consistent with acces-prive "Surface" pattern (copy minimal inline if needed; avoid new files).
- CTA: Exact pill style from acces-prive AccessButton (light blue bg, dark text, inner dark circle arrow, hover lift, focus ring). Proven, high-contrast, accessible.
- No images (to stay smallest surface + no asset risk). XLogo (existing) + typography + line icons if needed (lucide, minimal stroke).
- Motion: None or CSS-only micro (hover/active). No framer/motion import unless trivial and reduced-motion safe. Prioritize static clarity.
- Responsive: Hero fits 100dvh on mobile, single-column everywhere below md, no horizontal overflow, 44px+ tap targets.

**Anti-patterns banned (from protocol + skills):**
- No em-dashes anywhere.
- No AI-purple, gradients, glows, fake dashboards.
- No repeated split layouts >2x.
- No meta labels ("01", "SECTION").
- No 6-line headlines.
- No low-contrast CTAs.
- No viewport jumps.

## Technical Implementation (Smallest Safe Surface)
- Server Component (page.tsx) for metadata + searchParams.
- Minimal client island only if ref handling or button requires (prefer server Links).
- Import only: Link (next), XLogo (existing), type { Metadata }, cn if already in lib/utils (safe), lucide only if 1-2 icons add signal without bloat.
- Local CSS: None or tiny <style jsx> for 1-2 custom rules (ticker not needed; keep simpler than acces-prive).
- No new components/ files beyond the page itself.
- No changes to any shared lib/component.
- Accessibility: Semantic, aria, focus-visible, contrast (WCAG AA+ on CTA), reduced-motion (inherits globals).
- Performance: No heavy deps, static, fast LCP via text.

**Ref passthrough:** If ?ref=foo present, CTA href = `/rejoindre?ref=foo`. Normalize lightly (strip @).

## Verification & Evidence (per orchestrator)
- Build: `bun run build` (or npm equiv; project uses bun scripts but next build works).
- Lint: `bun run lint` or eslint.
- Typecheck: tsc --noEmit (via tsconfig).
- Runtime: Run `bun run dev` (background), navigate MCP chrome to http://localhost:3000/early-access , take desktop + mobile (iPhone) screenshots.
- Manual checks: No overflow, hero in viewport, CTA contrast, no text clip, mobile no wrap nav (none here), reduced-motion ok (static), French accents render.
- Evidence pack per round: brief summary, files (only new page), CTA dest + why, screenshots (base64 or path), cmd output, limitations.

## Review Process (3 Specialists)
- Use spawn_subagent (general-purpose) x3, each role-playing one skill with rubric excerpts loaded from SKILL.md reads + full page code + evidence pack + screenshot descriptions.
- Or sequential if parallel limited.
- Score 0-10, blocking_failures[], required_fixes[], polish_suggestions[], confidence.
- Weights: design-taste-frontend 45%, high-end-visual-design 30%, gpt-taste 25%.
- Decision tree exactly as in orchestrator (blockers first → individual floor 7.5 → weighted 8.2).
- Max 10 loops. Document every loop in docs/landing-page/evidence-loop-N.md + iterations log.
- Priority on merge: hard constraints > runtime > blockers > design-taste (prod) > high-end (craft) > gpt (creative).

## Risk Mitigation (Autonomous)
- If /early-access feels redundant with /acces-prive: Make it deliberately briefer + more messaging-native (less sections, more direct "request access" focus). Different enough.
- Screenshot capture: Use MCP chrome-devtools (search schema first). If dev server port conflict, use 3001 or kill.
- If any reviewer feedback would violate constraints (new dep, Supabase, etc.): Reject explicitly + document.
- Self-containment: If XLogo import feels wrong, inline minimal SVG (but existing primitive is allowed).
- French accents: Use &apos; or proper ’ in JSX.

## Success Definition (from prompt)
Same scoring round:
- weighted >= 8.2
- all 3 individual >= 7.5
- 0 blocking failures
- Route works (build + runtime)
- CTA points to correct existing path (/rejoindre)
- Zero hard constraint violations

## Output Artifacts (all under docs/landing-page/)
- discovery.md (done)
- plan.md (this)
- evidence-loop-*.md (before each review round)
- iterations.md (fix log)
- reviewer-*.json (raw outputs)
- FINAL-SUMMARY.md or acceptance/failure report exact format
- Any screenshots (copy to docs or reference paths)

## Immediate Next Actions (after this plan)
1. Implement src/app/early-access/page.tsx (self-contained, French, brief, CTA wired).
2. Run verification (build/lint/type + dev + MCP screenshots).
3. Build evidence pack v1.
4. Run 3 simulated/subagent reviews.
5. Score + decide per tree.
6. Loop or accept.
7. Final report + checkpoint.

**No user questions** — all decisions made per "make reasonable decisions independently" + 70%+ confidence rule. Redirect only on genuine hard blocker (none anticipated).

Ready for implementation.
