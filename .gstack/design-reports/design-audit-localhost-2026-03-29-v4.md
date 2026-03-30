# Design Audit: MarchéLibre v4 (DaisyUI + Plus Jakarta Sans)

| Field | Value |
|-------|-------|
| **Date** | 2026-03-29 |
| **URL** | http://localhost:3000 |
| **Scope** | Full site (homepage + /connexion + /inscription) |
| **Pages reviewed** | 3 (homepage, connexion, inscription) |
| **DESIGN.md** | Found — contains OLD Tailwind config (blue palette, Inter/Space Grotesk). Does NOT match current implementation |

## Design Score: B- | AI Slop Score: B

> Clean DaisyUI implementation with strong hero copy and good type choice. Two critical bugs (invisible auth buttons, broken bento grid span) drag the score. Fix those and this is a solid B+.

| Category | Grade | Notes |
|----------|-------|-------|
| Visual Hierarchy | B+ | Hero headline is strong, centered layout with form below works well |
| Typography | B+ | Plus Jakarta Sans is excellent — distinctive, modern, professional |
| Spacing & Layout | B | Sections have varied padding, good rhythm. Bento grid col-span bug hurts |
| Color & Contrast | B | DaisyUI blue primary + yellow accent highlight is clean and coherent |
| Interaction States | C | Invisible auth buttons (critical). Touch targets under 44px on nav/footer/cookie |
| Responsive | B | Mobile stacks cleanly. Tablet is solid. Form is usable at all sizes |
| Motion | A- | FadeIn with IntersectionObserver, CountUp, HoverScale — all respect `prefers-reduced-motion` |
| Content Quality | A- | Problem-first French copy is natural and specific. Button labels are clear |
| AI Slop | B | 3-column steps + symmetric feature grid remain. Cookie-cutter CTA present but minimal |
| Performance Feel | A | 199ms total load — excellent |

## First Impression

- The site communicates **"a focused, trustworthy professional network that takes verification seriously."**
- I notice **the headline "Arrêtez de collaborer avec des inconnus" with the yellow highlight on "inconnus" is the strongest moment** — it's confrontational, specific, and immediately tells you the problem.
- The first 3 things my eye goes to are: **1) the bold headline**, **2) the yellow-highlighted "inconnus"**, **3) the signup form card**.
- If I had to describe this in one word: **"Direct."**

## Top 5 Design Improvements

1. **CRITICAL: Auth page buttons are invisible** — `/connexion` and `/inscription` have submit buttons with `bg-primary-500 text-white` but `primary-500` doesn't resolve in the DaisyUI theme, rendering transparent text on white. Users literally cannot see the submit button.

2. **Bento grid col-span broken** — The "Annonces" feature card has `sm:col-span-2` on the `.card` div, but it's wrapped in a `<FadeIn>` div which is the actual grid child. The col-span never takes effect — all cards render at equal width.

3. **Touch targets too small** — Navbar links (32px), footer links (32px), cookie banner buttons (32px) and close button (32px) are all below the 44px minimum. Every interactive element outside the form fails this check.

4. **DESIGN.md is completely stale** — Contains a Tailwind config with blue palette (`#3b82f6`), Inter + Space Grotesk fonts, and custom utility classes. The actual site uses DaisyUI with a blue primary theme, Plus Jakarta Sans, and DaisyUI component classes. This file will mislead any developer or AI that reads it.

5. **3-column steps section is the last AI slop pattern** — "Inscription / Vérification / C'est parti" in a symmetric 3-col grid with icons in colored circles is the classic AI template layout. Consider a timeline, horizontal flow, or integrate into the testimonial section.

## Inferred Design System

### Fonts
- **Primary:** Plus Jakarta Sans (all text — headings and body)
- **Leaking:** `__nextjs-Geist` appears in computed styles on some elements (Geist is Next.js default font — being loaded but overridden by Plus Jakarta Sans on most elements)

### Colors (DaisyUI theme)
- **Primary:** Blue (DaisyUI `--p` variable) — used on hero signup button, Annonces card, CTA section, navbar logo
- **Accent:** Yellow/Amber — used for `.highlight` underline effect, "S'inscrire gratuitement" button, section labels ("FONCTIONNALITÉS", "COMMENT ÇA MARCHE")
- **Base backgrounds:** White (`base-100`), light gray (`base-200`), with `base-300` borders
- **Text:** Dark near-black hierarchy via DaisyUI `base-content` with opacity modifiers (55%, 50%, 45%, 35%)

### Heading Scale
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 60px | 800 | Hero headline |
| H2 | 36px | 800 | Section titles (Features, Steps) |
| H2 | 30px | 800 | CTA section title |
| H2 | 18px | 700 | Form card title |
| H3 | 24px | 700 | Large feature card (Annonces) |
| H3 | 18px | 700 | Regular feature cards, step titles |

### Spacing
- Section padding: `py-5` (stats) / `py-14` (CTA) / `py-16` (testimonial) / `py-20` (features, steps)
- Gap scale: `gap-4` (bento grid) / `gap-8 lg:gap-12` (steps)
- Max content width: `max-w-6xl` (1152px)

### Component Library
- **DaisyUI 4.x** — `card`, `btn`, `navbar`, `footer`, `badge`, `alert`, `fieldset`, `input` components
- Custom `.highlight` class — gradient underline effect (yellow, 32% height)

## Findings

### FINDING-001: Auth page submit buttons are invisible (HIGH — CRITICAL BUG)
**Pages:** `/connexion`, `/inscription`
**What's wrong:** Submit buttons use custom class `bg-primary-500 text-white` which doesn't resolve in the DaisyUI theme. The buttons render with `background-color: rgba(0, 0, 0, 0)` (transparent) and `color: rgb(255, 255, 255)` (white) — invisible on a white page.
**What good looks like:** Buttons should use DaisyUI classes like `btn btn-primary` or `btn btn-accent` to match the homepage form's working button.
**Screenshot:** v9-connexion-full.png — no button visible below the password field.

### FINDING-002: Bento grid col-span-2 not working (HIGH)
**Page:** Homepage features section
**What's wrong:** The "Annonces" card has `sm:col-span-2 lg:col-span-2` on the inner `.card` div, but it's wrapped in a `<FadeIn>` wrapper div which is the actual CSS grid child. Grid column spanning only works on direct grid children. All cards render at equal 352px width.
**What good looks like:** Move the `col-span-2` class to the `<FadeIn>` wrapper: `<FadeIn delay={0.06} className="sm:col-span-2 lg:col-span-2">`.
**Screenshot:** v9-features.png — all 3 top cards are same width.

### FINDING-003: Touch targets below 44px minimum (MEDIUM)
**Pages:** All pages
**What's wrong:**
- Navbar logo link: 139×32px
- "Connexion" nav link: 89×32px
- "S'inscrire gratuitement" nav button: 158×32px
- Footer "S'inscrire" link: 80×32px
- Footer "Connexion" link: 89×32px
- Cookie "Accepter" button: 80×32px
- Cookie "Refuser" button: 71×32px
- Cookie close button: 32×32px
- Inputs: 382×40px (close but under)
**What good looks like:** All interactive elements should have at least 44px tap height. Use `btn-md` instead of `btn-sm` in the navbar, or add padding.

### FINDING-004: Geist font leaking in computed styles (MEDIUM)
**What's wrong:** `__nextjs-Geist` font family appears in computed styles alongside Plus Jakarta Sans. This is Next.js's default font being loaded unnecessarily. It may cause FOUT or increase font download size.
**What good looks like:** Override the Next.js default font in `layout.tsx` to only load Plus Jakarta Sans, or explicitly set `font-family` on the `html`/`body` element to prevent Geist from appearing.

### FINDING-005: DESIGN.md is a stale Tailwind config (MEDIUM)
**What's wrong:** `design.md` contains a Tailwind config object from a previous iteration: blue `#3b82f6` palette, Inter + Space Grotesk fonts, custom shadow/spacing/font-size scales. None of this matches the current DaisyUI-based implementation. The file will actively mislead developers and AI tools.
**What good looks like:** Either delete it or rewrite it as an actual design system document that describes the current DaisyUI theme, Plus Jakarta Sans, and the component patterns in use.

### FINDING-006: 3-column steps grid — last major AI slop pattern (MEDIUM)
**What's wrong:** The "Comment ça marche" section uses the classic AI template layout: 3 symmetric cards, each with icon-in-colored-circle + bold title + description. This is the #1 most recognizable AI-generated layout pattern.
**What good looks like:** Consider a numbered timeline (vertical on mobile, horizontal on desktop), an inline stepper inside the testimonial section, or a single-column with illustrations.

### FINDING-007: CTA section is redundant (POLISH)
**What's wrong:** "Prêt à rejoindre le réseau?" with a button at the bottom duplicates the hero's signup form. Since the hero already has the inline form, this section adds friction without value.
**What good looks like:** Either remove it entirely, make it a different CTA ("Questions ? Contactez-nous"), or merge it into the footer.

### FINDING-008: CountUp starts at "0%" — visible flash (POLISH)
**What's wrong:** The "100% profils vérifiés" stat starts at "0%" and counts up when scrolled into view. Before the animation triggers, users see "0% profils vérifiés" which is factually wrong and confusing.
**What good looks like:** Start at the target value and animate from there, or use `font-variant-numeric: tabular-nums` to prevent layout shift during counting.

## Responsive Summary

| Viewport | Grade | Notes |
|----------|-------|-------|
| Mobile (375px) | B | Clean stacking, form is usable. Cookie banner overlaps. Steps section is dense |
| Tablet (768px) | B | Good layout. Feature cards go 2-col. Steps go 3-col (still the AI pattern) |
| Desktop (1280px) | B+ | Hero centered layout works well. Feature grid would be great if col-span worked |

## Quick Wins (< 30 min each)

1. **Fix auth page buttons** — Change `bg-primary-500 text-white` to DaisyUI `btn btn-primary` — ~5 min

2. **Fix bento grid col-span** — Move `sm:col-span-2 lg:col-span-2` from the `.card` div to the `<FadeIn>` wrapper — ~2 min

3. **Increase touch targets** — Change `btn-sm` to `btn-md` in navbar, add padding to footer/cookie links — ~10 min

4. **Delete or rewrite design.md** — Remove the stale Tailwind config file — ~5 min

5. **Fix Geist font leak** — Override Next.js default font in layout.tsx — ~5 min

## Regression vs Previous Audit (v3)

| Category | v3 Grade | v4 Grade | Delta |
|----------|----------|----------|-------|
| Visual Hierarchy | B+ | B+ | — |
| Typography | B+ | B+ | — (font changed: Space Grotesk → Plus Jakarta Sans) |
| Spacing & Layout | B | B | — |
| Color & Contrast | B | B | — (teal → blue primary) |
| Interaction States | C+ | C | -0.5 (auth buttons now invisible) |
| Responsive | B | B | — |
| Motion | B- | A- | +1.5 (prefers-reduced-motion now implemented!) |
| Content Quality | A- | A- | — |
| AI Slop | B- | B | +0.5 (DaisyUI removes some custom slop patterns) |
| Performance Feel | A | A | — (199ms vs 690ms — even faster) |
| **Overall** | **B** | **B-** | **-0.5** (auth bug is a regression) |
| **AI Slop** | **B-** | **B** | **+0.5** |

### Resolved from v3
- FINDING-002 (v3): `prefers-reduced-motion` — **RESOLVED** (full implementation in motion.tsx)
- FINDING-008 (v3): DESIGN.md old config — **STILL OPEN** (still contains old Tailwind config)

### New Issues
- FINDING-001: Auth page invisible buttons (NEW — critical regression)
- FINDING-002: Bento grid col-span broken (NEW)
- FINDING-004: Geist font leaking (PERSISTS from v3)

### Still Open
- 3-column steps AI pattern (from v1)
- Touch targets too small (from v3, worsened)
- Redundant CTA section (from v3)
