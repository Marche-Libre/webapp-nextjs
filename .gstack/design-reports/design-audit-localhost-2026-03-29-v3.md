# Design Audit: MarchéLibre v3 (Post-Refonte)

| Field | Value |
|-------|-------|
| **Date** | 2026-03-29 |
| **URL** | http://localhost:3000 |
| **Scope** | Homepage (full page) + responsive |
| **Pages reviewed** | 1 (homepage — 4 viewports) |
| **DESIGN.md** | Found (contains old Tailwind config, not a real design system doc) |

## Design Score: B | AI Slop Score: B-

> Significant leap from C+/D+. The hero with inline signup form, code-built dashboard mockup, and stripped-back layout kills most of the AI template smell. The remaining issues are polish, not skeleton.

| Category | Grade | Notes |
|----------|-------|-------|
| Visual Hierarchy | B+ | Hero is strong — problem headline + form is clear. Dashboard mockup adds product credibility |
| Typography | B+ | Space Grotesk + Inter good pairing, gradient text on "inconnus" adds character |
| Spacing & Layout | B | Varied section padding (40-80px) is much better. Some empty space below dashboard mockup |
| Color & Contrast | B | Teal is warm, warm neutrals correct. Dark section provides contrast break |
| Interaction States | C+ | Hover on feature cards works. Footer links too small (20px height). No visible focus rings |
| Responsive | B | Mobile stacks cleanly. Form is usable. Tablet layout solid |
| Motion | B- | FadeIn scroll + HoverScale present. `prefers-reduced-motion` still NOT checked |
| Content Quality | A- | Problem-first copy is strong. French is natural. Button labels are specific |
| AI Slop | B- | Most slop eliminated. 3-column steps grid and cookie-cutter CTA section remain |
| Performance Feel | A | 690ms total load — excellent |

## First Impression

- The site communicates **"a focused professional tool with a clear value proposition."** The problem-first headline immediately tells me why I should care.
- I notice **the inline signup form in the hero is the strongest design decision** — it removes friction and feels intentional, not template-driven.
- The first 3 things my eye goes to are: **1) "Marre de collaborer avec des inconnus?"**, **2) the signup form card**, **3) the code-built dashboard mockup**.
- If I had to describe this in one word: **"Purposeful."**

## Top 5 Design Improvements

1. **Fix the 3-column numbered steps section** — still the classic AI "01/02/03" pattern. Consider: a single-column timeline, or inline the steps into the dark section header as a horizontal flow.

2. **Add `prefers-reduced-motion` support** — FadeIn, HoverScale, and CountUp all animate unconditionally. Wrap in a media query check. Accessibility issue.

3. **The CTA section ("Prêt?") is minimal but generic** — heading + subtext + button in a row. Consider making it part of the footer, or removing it entirely since the hero already has the form.

4. **Footer links are too small** — "S'inscrire" and "Connexion" at 20px height fail the 44px touch target minimum. The footer overall feels like an afterthought.

5. **The stats bar could be bolder** — "100% profils vérifiés / <24h / Gratuit" is good content but rendered tiny (13px) and easy to miss. Consider making these the hero's supporting evidence instead of a separate section.

## Inferred Design System

### Fonts
- **Display:** Space Grotesk (headings, hero) — good character
- **Body:** Inter (all body text) — clean, professional
- **Leaking:** `__nextjs-Geist` still in computed styles on some elements (lower priority now — wasn't detected on sampled elements)

### Colors
- **Primary:** Teal #14b8a6 (500) with full scale 50-900
- **Accent:** Amber #f59e0b (used in mesh gradient only)
- **Backgrounds:** Warm neutrals (#ffffff / #fafaf9 / #f5f5f4 / #1c1917 dark)
- **Text:** Warm hierarchy (#1c1917 / #57534e / #a8a29e)
- **Borders:** Warm rgba(28, 25, 23, 0.04-0.15)

### Heading Scale
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 44px | 700 | Hero headline |
| H2 | 30px | 700 | Section titles |
| H2 | 24px | 700 | CTA title (smaller variant) |
| H2 | 20px | 700 | Form card title |
| H3 | 20px | 600 | Feature card title (large) |
| H3 | 17px | 600 | Feature/step titles (small) |

### Spacing
- Section padding varies: 24px (stats) / 56px (features, CTA) / 80px (steps)
- Inner spacing uses 4px base unit consistently
- Max content width: 1200px

## Findings

### FINDING-001: 3-column numbered steps still AI-pattern (MEDIUM)
The "01 / 02 / 03" steps section uses the classic AI layout: large ghost number + bold title + description, repeated 3× symmetrically in a grid. This is the most recognizable AI template pattern remaining on the page.

**Suggestion:** Convert to a single-column timeline with connecting lines, or integrate steps as inline content within the dark section intro text.

### FINDING-002: `prefers-reduced-motion` not respected (MEDIUM)
All FadeIn animations, HoverScale effects, and CountUp number animation run unconditionally. Users who have enabled "Reduce Motion" in system preferences will still see all animations.

**Suggestion:** In the motion.tsx component, check `window.matchMedia('(prefers-reduced-motion: reduce)')` and skip animations when true.

### FINDING-003: Footer links fail touch target minimum (MEDIUM)
"S'inscrire" (58×20px) and "Connexion" (66×20px) in the footer are well below the 44px minimum touch target. Header links are also slightly under (36-40px height).

**Suggestion:** Add padding to footer links to reach at least 44px tap height. Header links should get py-[12px] minimum.

### FINDING-004: Cookie banner close button too small (MEDIUM)
The close/dismiss button on the cookie banner is 24×24px — significantly below the 44px touch target.

**Suggestion:** Increase to at least 44×44px tap area (can keep visual icon at 24px with padding).

### FINDING-005: No visible focus rings on interactive elements (MEDIUM)
Tab navigation doesn't show clear focus indicators on links and buttons. The `.shadow-focus` class exists but isn't applied via focus-visible selectors globally.

**Suggestion:** Add a global `*:focus-visible { box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.3); outline: none; }` rule.

### FINDING-006: CTA section is redundant (POLISH)
"Prêt?" section at the bottom duplicates the hero's signup form CTA. Since the hero already has the inline form, this section adds little value and follows the standard AI "closing CTA" pattern.

**Suggestion:** Either remove it entirely, or make it a different CTA (e.g., "Questions? Contact us" or link to a specific feature).

### FINDING-007: Empty space below dashboard mockup (POLISH)
On desktop, there's noticeable empty space between the dashboard mockup and the next section. The mockup sits in the left column but the right column (form) is shorter, creating visual imbalance.

**Suggestion:** The mockup is hidden on mobile (`hidden lg:block`) which is correct. On desktop, consider reducing the gap or adding a subtle transition element.

### FINDING-008: DESIGN.md contains old Tailwind config (POLISH)
The DESIGN.md file contains a Tailwind config object from a previous iteration (blue palette, not the current teal). The actual design system is defined in `globals.css` with `@theme inline`. This file should be rewritten.

## Responsive Summary

| Viewport | Grade | Notes |
|----------|-------|-------|
| Mobile (375px) | B+ | Clean stacking, form is prominent, dark section works well. Cookie banner overlaps content slightly |
| Tablet (768px) | B | Form drops below hero text — acceptable. Feature cards stack to 2-col. Steps go single-column |
| Desktop (1280px) | B+ | Hero 2-column layout works well. Dashboard mockup adds credibility. Good use of space |

## Quick Wins (< 30 min each)

1. **Add `prefers-reduced-motion` check** to `FadeIn`, `HoverScale`, and `CountUp` components — ~10 min

2. **Increase footer link tap targets** to 44px minimum height — ~5 min

3. **Add global `focus-visible` ring** in globals.css — ~5 min

4. **Remove or rethink the "Prêt?" CTA section** — it's redundant with the hero form — ~5 min

5. **Rewrite DESIGN.md** to document the actual teal/warm-neutral design system — ~15 min

## Regression vs Previous Audit (v2)

| Category | v2 Grade | v3 Grade | Delta |
|----------|----------|----------|-------|
| Visual Hierarchy | B- | B+ | +1.5 |
| Typography | B | B+ | +0.5 |
| Spacing & Layout | C | B | +1 |
| Color & Contrast | B | B | — |
| Interaction States | C | C+ | +0.5 |
| Responsive | B | B | — |
| Motion | B- | B- | — |
| Content Quality | B | A- | +1 |
| AI Slop | D+ | B- | +2 |
| Performance Feel | A | A | — |
| **Overall** | **C+** | **B** | **+1.5** |
| **AI Slop** | **D+** | **B-** | **+2** |

### Resolved from v2
- SLOP-001: Icons in colored squares — **RESOLVED** (all removed)
- SLOP-005: Decorative blobs — **RESOLVED** (mesh gradient subtle, no floating blobs)
- SLOP-006: Stock photos — **RESOLVED** (replaced with code-built dashboard mockup)
- SLOP-007: Fake social proof avatars — **RESOLVED** (removed entirely)
- SLOP-004: Cookie-cutter CTA — **PARTIALLY RESOLVED** (simplified but still present)
- FINDING-004 (v2): Centered stats — **RESOLVED** (left-aligned)

### Still Open
- SLOP-003: 3-column numbered steps pattern
- FINDING-003 (v2): `prefers-reduced-motion` not checked
- FINDING-001 (v2): Geist font leaking (partially resolved — less prevalent)
