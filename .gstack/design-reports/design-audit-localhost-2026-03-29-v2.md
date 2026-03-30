# Design Audit: MarchéLibre v3 (localhost:3000)

| Field | Value |
|-------|-------|
| **Date** | 2026-03-29 |
| **URL** | http://localhost:3000 |
| **Scope** | Homepage + inscription + responsive |
| **Pages reviewed** | 4 views |
| **DESIGN.md** | Found (`design.md`) |

## Design Score: C+ | AI Slop Score: D+

> Better than before — teal palette, real photos, scroll animations, dark section — but the underlying layout DNA is still recognizably AI-generated. The improvements are cosmetic overlays on the same skeleton.

| Category | Grade | Notes |
|----------|-------|-------|
| Visual Hierarchy | B- | Hero is strong with image, but feature section falls flat |
| Typography | B | Space Grotesk + Inter good, gradient text adds character |
| Spacing & Layout | C | Uniform section padding (64px everywhere), cards all same size |
| Color & Contrast | B | Teal is better than blue, warm neutrals are correct |
| Interaction States | C | Hover scale exists but no visible card shadow transitions in screenshots |
| Responsive | B | Mobile stacks well, forms are clean |
| Motion | B- | FadeIn on scroll + float animations are nice, but `prefers-reduced-motion` not checked |
| Content Quality | B | Copy is solid French, no em dashes, specific button labels |
| AI Slop | D+ | Multiple patterns still present (see below) |
| Performance Feel | A | 252ms total load, excellent |

## First Impression

- The site communicates **"professional platform trying hard not to look AI-generated."** The teal palette and photos help, but the bones are still template.
- I notice **the gradient text on "indépendants" and the floating card animation are the two strongest moments of personality on the entire page.**
- The first 3 things my eye goes to are: **1) the gradient "indépendants" text**, **2) the hero photo with floating badge**, **3) the teal CTA button glow**.
- If I had to describe this in one word: **"Improving."**

## AI Slop Findings (the core problem)

### SLOP-001: Icons in colored squares — 12 instances (HIGH)
12 elements matching the `bg-primary-50` + icon pattern at 36-40px. Every feature, every step, every card uses an icon in a teal-tinted square. This is THE SaaS template look. A human designer would:
- Use the icon alone (no background square) for some instances
- Vary icon sizes and treatments
- Use inline icons within text for some features instead of standalone blocks

### SLOP-002: 3-column compact feature row (HIGH)
The bottom row of "Annonces / Offres d'emploi / Simple et direct" is the classic AI 3-feature pattern: icon-in-square + bold title + 2-line description, repeated 3× symmetrically. Even though you broke the top into 2 cards with images, this bottom row is a dead giveaway.

### SLOP-003: Uniform section rhythm (MEDIUM)
Section heights: 603px → 121px → 728px → 490px → 416px → 309px. The padding is `64px` on almost every section. Real design varies the breathing room — a testimonial section needs less space, a hero needs more visual break before the next section.

### SLOP-004: Cookie-cutter CTA section (MEDIUM)
Dark card → heading left → button right → decorative blobs behind. This is the standard AI CTA block. Every SaaS landing page generator produces this exact layout.

### SLOP-005: Decorative blobs still present (MEDIUM)
5 decorative blur-3xl elements found. The `bg-mesh` radial gradients on the hero and the blobs in the dark section. These exist to "fill space" rather than communicate information.

### SLOP-006: Stock photos are obviously stock (MEDIUM)
All images are 640px wide Pixabay downloads. The "team meeting" hero photo is the classic "business people around a table" stock shot. A designer would use:
- Product screenshots (show the actual app dashboard)
- Custom illustration
- Abstract/geometric visuals that match the brand
- Or no image at all — strong typography can carry a hero

### SLOP-007: "Social proof" with fake avatars (MEDIUM)
The stacked avatar row in the hero uses 3 random Pixabay portrait photos + a "+". This pattern is used on every AI-generated landing page. It implies users when there are none yet. Either show real people or remove it.

## Non-Slop Findings

### FINDING-001: Geist font leaking (POLISH)
`__nextjs-Geist` appears in computed styles. Should only be Inter + Space Grotesk.

### FINDING-002: Image quality insufficient for retina (MEDIUM)
Hero image is 640×427 natural, displayed at 480×400 = only 1.3× density. On retina (2×), this will look blurry. Need at least 960×800 source images for the hero.

### FINDING-003: `prefers-reduced-motion` not respected (MEDIUM)
Float animations and FadeIn scroll effects don't check for reduced motion preference. Accessibility concern.

### FINDING-004: Centered stats section (POLISH)
The 4 stats (100%, <24h, Gratuit, France) are all centered text — another AI pattern. Left-align or use a different layout.

## Quick Wins (< 30 min each)

1. **Kill the icon-in-square pattern** — Use raw icons (no colored background), or inline them in text. The 12 teal squares are the loudest slop signal. (~15 min)

2. **Replace or remove stock photos** — Either use a screenshot of the actual app dashboard as the hero image, or remove the image entirely and let the typography + gradient text carry the hero. The stock meeting photo screams "template." (~10 min)

3. **Remove fake social proof** — The stacked avatars imply users that don't exist. Replace with a single strong statement or remove entirely. (~5 min)

4. **Break the 3-column bottom row** — Make it 2 columns, or a single horizontal list, or integrate these features into the larger cards above. (~10 min)

5. **Vary section padding** — Stats bar: keep compact. Features: 64px. Steps: 80px. Testimonial: 48px. CTA: 56px. Don't use 64px for everything. (~5 min)

## The fundamental problem

The site has improved significantly — teal palette, real photos, animations, dark section — but these are **cosmetic layers on an AI skeleton**. The underlying layout follows the exact same pattern every AI generator produces:

`badge → headline → subhead → 2 buttons → stats → feature cards → numbered steps → testimonial → CTA`

A designer would reorganize this flow entirely. For example:
- Lead with the problem ("Marre de collaborer avec des inconnus ?") not the solution
- Show the product (actual dashboard screenshot) instead of stock photos
- Put the signup form directly in the hero (reduce friction)
- Use one bold, full-width testimonial instead of the card-in-card layout
- Make the CTA the final section, not a card floating in padding
