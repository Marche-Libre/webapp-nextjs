# Design Audit: MarchéLibre (localhost:3000)

| Field | Value |
|-------|-------|
| **Date** | 2026-03-29 |
| **URL** | http://localhost:3000 |
| **Scope** | Full site (homepage, inscription, connexion, en-attente) |
| **Pages reviewed** | 4 |
| **DESIGN.md** | Found (`design.md` — Tailwind config with full design system) |

## Design Score: C+ | AI Slop Score: D

> Clean foundation with correct tokens, but the execution screams "AI-generated SaaS template." Shadows don't render, em dashes violate user request, hero wastes space, and the 3-column icon grid is the #1 AI slop pattern.

| Category | Grade | Notes |
|----------|-------|-------|
| Visual Hierarchy | C | Hero has excessive padding, CTA competes with secondary button |
| Typography | B | Space Grotesk + Inter is solid, h1 scale good, measure slightly narrow (56ch) |
| Spacing & Layout | C | Hero 144px padding is extreme, sections all same rhythm |
| Color & Contrast | B | Blue primary coherent, labels are low contrast (#94a3b8 on #f8fafc) |
| Interaction States | D | Card shadows not rendering (broken CSS), no visible hover elevation |
| Responsive | B | Mobile stacks cleanly, form usable, CTA buttons adapt |
| Motion | C | `slide-up` animation defined but not broadly used, no hover transitions visible |
| Content Quality | C | Em dashes present (user explicitly said no), hero copy is generic |
| AI Slop | D | 3-column icon-in-circle feature grid, centered everything, cookie-cutter section rhythm |
| Performance Feel | A | 161ms total load, excellent TTFB |

## First Impression

- The site communicates **"competent SaaS landing page built with AI."** Professional color palette, but zero personality.
- I notice **the hero has ~144px of padding creating a dead zone, and the "missions" highlight feels like the only intentional design decision on the page.**
- The first 3 things my eye goes to are: **1) the blue "missions" word**, **2) the gradient blob behind the hero (decorative, not functional)**, **3) the "Rejoindre le réseau" CTA**.
- If I had to describe this in one word: **"Template."**

## Top 5 Design Improvements

### 1. Fix broken shadows (HIGH)
`shadow-[--shadow-card]` renders as `none` despite the CSS variable existing. Cards have no elevation, making the page flat and lifeless. Either use inline shadow values or fix the Tailwind v4 arbitrary property syntax.

### 2. Remove em dashes — user explicitly requested this (HIGH)
Two em dashes found:
- Hero: "décrochez des missions — en toute confiance"
- Feature card: "missions — trouvez des opportunités"
Replace with periods or restructure sentences.

### 3. Kill the 3-column icon-in-circle feature grid (HIGH)
This is THE most recognizable AI layout pattern. 6 cards, each with an icon in a colored square, a bold title, 2 lines of description. All centered. All the same height. A designer would never ship this.
**What if:** Use a 2-column layout with asymmetric cards, or a single-column list with horizontal layout (icon left, text right), or remove 3 weaker features and make the remaining 3 more prominent with different visual treatments.

### 4. Reduce hero padding dramatically (HIGH)
Currently `py-[96px]` on mobile and `lg:py-[144px]` on desktop. That's 288px of vertical dead space. Cut to `py-[48px] lg:py-[64px]` max. The hero content itself is only ~300px tall — it doesn't need a football field around it.

### 5. Break the cookie-cutter section rhythm (MEDIUM)
Every section follows the same pattern: centered heading → centered subheading → grid of cards → repeat. Vary the rhythm: left-align a section, use a different card layout, alternate background colors asymmetrically.

## Inferred Design System

**Fonts:**
- Display: Space Grotesk (700) — used on h1, h2
- Body: Inter (400, 500, 600) — used on everything else
- Stray: `__nextjs-Geist` appearing in computed styles (Next.js default leaking through)

**Colors (rendered):**
- Primary: `rgb(59, 130, 246)` — blue-500
- Text primary: `rgb(15, 23, 42)` — slate-900
- Text secondary: `rgb(71, 85, 105)` — slate-600
- Text muted: `rgb(148, 163, 184)` — slate-400
- Background: `rgb(248, 250, 252)` — slate-50
- Cards: `rgb(255, 255, 255)` — white

**Heading Scale:**
- H1: 60px/68px (desktop), Space Grotesk 700
- H2: 36px/44px, Space Grotesk 700
- H3: 15-16px, Inter 600 (jump from 36px to 15px is steep — missing an intermediate level)

**Spacing:** 4px base, using arbitrary values `[Npx]`. Consistent.

**Shadows:** Defined in CSS vars but NOT rendering via Tailwind. All cards are flat.

## Findings

### FINDING-001: Card shadows broken (HIGH — Interaction States)
`shadow-[--shadow-card]` in Tailwind v4 arbitrary value syntax is not computing. The CSS variable `--shadow-card` exists with the correct value but cards render with `box-shadow: none`. This removes ALL depth and elevation from the design. Every card, every form container, every stat block is flat.

### FINDING-002: Em dashes present despite explicit user request (HIGH — Content)
User said "Pas de em dashes." Two em dashes found in rendered copy:
1. Hero paragraph: "décrochez des missions — en toute confiance"
2. Feature card: "missions — trouvez des opportunités"

### FINDING-003: 3-column icon-in-circle feature grid (HIGH — AI Slop)
Six identical cards in a 3×2 grid. Each: icon in colored square (40×40, primary-50 bg) → bold 15px title → 2-line 13px description. This is the most recognizable AI-generated layout on the internet. A human designer would differentiate at least 2-3 of these visually.

### FINDING-004: Hero vertical padding excessive (HIGH — Spacing)
`py-[96px] lg:py-[144px]` = 288px of dead space on desktop, 192px on mobile. The actual content is ~300px tall. The padding-to-content ratio is nearly 1:1. Cut by 50-60%.

### FINDING-005: Cookie-cutter section rhythm (MEDIUM — Visual Hierarchy)
Sections follow identical structure: centered h2 → centered p → centered grid/list. No variation in alignment, density, or visual treatment. Every section is the same "weight," making none feel important.

### FINDING-006: Label contrast low (MEDIUM — Color)
Form labels use `text-text-secondary` (#475569) on `bg-bg-elevated` (#f8fafc). Computed contrast ratio ~5.5:1 — passes AA but feels washed out, especially at 13px. The labels appear gray and subordinate when they should guide the user.

### FINDING-007: Decorative gradient blobs in hero (MEDIUM — AI Slop)
Two `blur-3xl` gradient circles behind the hero text. Classic AI decoration pattern — fills empty space with decoration instead of useful content. Remove or replace with actual visual content (illustration, product screenshot, social proof).

### FINDING-008: CTA button glow not rendering (MEDIUM — Interaction States)
`shadow-[--shadow-glow-primary]` and `shadow-[--shadow-glow-primary-sm]` also compute as `none`. The primary CTA buttons have no glow effect, reducing their visual prominence.

### FINDING-009: "Comment ça fonctionne" section is generic (MEDIUM — Content)
01/02/03 numbered steps with centered icons is another AI pattern. The copy is functional but forgettable: "Renseignez vos informations..." could be on any site. Consider showing actual UI screenshots in the steps, or making the steps more specific to MarchéLibre's unique value.

### FINDING-010: Geist font leaking through (POLISH — Typography)
Next.js default Geist font appearing in computed styles. Should be cleaned up — only Inter and Space Grotesk should be present.

## Responsive Summary

| Page | Mobile (375) | Tablet (768) | Desktop (1280) |
|------|-------------|-------------|----------------|
| Homepage | B | B | C+ |
| Inscription | B+ | B+ | B |
| Connexion | B+ | B+ | B |

Mobile layout stacks correctly, form fields are usable, CTAs are full-width. The hero padding problem is actually less severe on mobile (96px vs 144px). Tablet is fine but the 2-column feature grid at 768px creates narrow cards.

## Quick Wins (< 30 min each)

1. **Fix shadows:** Replace `shadow-[--shadow-card]` with the inline value `shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]` or use a proper Tailwind theme extension. This alone will transform the flatness of every page. (~5 min)

2. **Remove em dashes:** Find-and-replace `—` with periods or restructured sentences in `page.tsx`. (~2 min)

3. **Reduce hero padding:** Change `py-[96px] lg:py-[144px]` to `py-[48px] lg:py-[64px]`. (~1 min)

4. **Remove gradient blobs:** Delete the two `absolute` blur-3xl divs in the hero section. (~1 min)

5. **Break the feature grid symmetry:** Make one card span 2 columns, or use a different layout for the first row vs second row. (~15 min)
