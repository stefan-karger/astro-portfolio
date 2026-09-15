# IMPROVEMENTS_PLAN.md

## Purpose

This document turns the current homepage review of **stefan-karger.de** into an actionable improvement plan.

Scope is intentionally limited to the **homepage only**.

The goal is not to redesign the site from scratch, but to make the existing portfolio feel:

- more consistent
- more intentional
- more professional
- more senior
- more personal
- less like a generic developer/SaaS template

The visual direction should remain restrained and technical rather than flashy.

---

# 1. Design Direction

## Target personality

Use a **refined technical / engineering portfolio** direction.

The site should feel like the portfolio of a senior engineer who:

- builds reliable software
- understands complex business processes
- cares about product quality
- has a strong frontend eye without presenting primarily as a designer

Avoid an overly futuristic, neon, terminal-heavy, or “AI startup” aesthetic.

---

## Visual language

Use the existing portrait as a visual anchor.

The image already contains a useful visual language:

- dark clothing
- concrete / neutral background
- subdued warm tones
- strong contrast
- understated mood

Build the UI around that instead of introducing an unrelated tech aesthetic.

Suggested palette direction:

- graphite / near-black
- concrete grey
- warm off-white
- muted copper / rust accent

Use the accent color sparingly.

The site should feel cohesive before it feels colorful.

---

# 2. Homepage Information Architecture

Recommended homepage order:

1. Hero
2. Selected Work
3. Expertise / Skills
4. Experience
5. Contact CTA
6. Footer

This order prioritizes proof of work over self-description.

The homepage should answer these questions quickly:

1. Who is Stefan?
2. What does he build?
3. What has he actually worked on?
4. What is he good at?
5. What is his professional background?
6. How can I contact him?

---

# 3. Priority Overview

## P0 — Highest impact

These changes should be implemented first.

- Remove fake testimonials
- Rework hero hierarchy and positioning
- Establish one consistent visual language
- Move projects above the generic skills section
- Redesign project presentation away from generic cards

## P1 — Structural polish

Implement after the core direction is stable.

- Simplify skills section
- Reduce badge/pill usage
- Improve typography
- Improve experience timeline
- Standardize copy
- Improve hero CTA
- Standardize spacing/layout system
- Improve background treatment

## P2 — Final refinement

Only after the structure works.

- Add one intentional signature visual moment
- Reduce unnecessary motion
- Remove decorative UI chrome
- Build a stronger contact ending

---

# 4. Detailed Improvements

## 4.1 Remove fake testimonials

### Problem

The homepage currently contains fictional testimonials with obviously fake company names.

Even when explicitly intended as placeholders, they reduce trust and make the portfolio look unfinished.

### Change

Remove the entire testimonials section.

Do not replace it with placeholder quotes.

### Replacement

Until real testimonials exist, let the homepage transition directly from professional experience into the final contact CTA.

### Definition of Done

- no fictional testimonials remain
- no placeholder social proof remains
- homepage still ends naturally without the section

---

# 4.2 Rework hero positioning

### Problem

The current hero opens primarily with:

> Hi! Ich bin Stefan.

This is personable, but too generic to carry the main visual hierarchy.

The descriptive copy also communicates fairly broad software-engineering attributes that could apply to many developers.

### Change

Keep the personal greeting, but reduce its visual importance.

Use the main headline to communicate a clear professional positioning.

Possible direction:

> Software für komplexe Prozesse – klar, robust und wartbar.

Supporting line could communicate areas such as:

- Senior Software Engineer
- Full Stack
- Systemintegration
- Automatisierung

The exact copy can be refined later, but the hierarchy should be:

1. small personal greeting
2. strong professional thesis
3. concise supporting description
4. primary CTA
5. secondary links

### Definition of Done

The hero communicates within a few seconds:

- who Stefan is
- what kind of work he does
- what differentiates his approach
- what the visitor should do next

---

# 4.3 Use the portrait as the visual anchor

### Problem

The portrait currently exists alongside the UI, but its visual language is not fully reflected throughout the page.

### Change

Build the site's design system around the visual qualities already present in the portrait.

Use:

- dark graphite tones
- concrete-like neutrals
- restrained warm accent
- strong but controlled contrast

Avoid adding unrelated neon gradients or cyberpunk styling.

### Definition of Done

The portrait and UI should look like they belong to the same visual system.

---

# 4.4 Establish one clear color system

### Change

Create a deliberately limited palette.

Suggested roles:

```text
background-primary
background-secondary
surface
text-primary
text-secondary
border
accent
accent-hover
```

Avoid multiple competing accent colors.

The accent should primarily be used for:

- important links
- primary actions
- subtle project highlights
- selective decorative detail

### Dark / light mode

Do not treat theme switching as a core design feature.

A single strong visual direction is preferable to two weaker ones.

If both themes remain, they must share the same visual identity rather than behaving like two separate designs.

---

# 4.5 Move Selected Work above Skills

### Problem

The current homepage introduces abstract skills before showing meaningful work.

For a senior developer, real work is stronger evidence than a technology inventory.

### Change

Recommended order:

```text
Hero
Selected Work
Expertise
Experience
Contact
```

Projects should become the main proof section immediately after the hero.

### Definition of Done

A visitor sees meaningful work before encountering a long list of technologies.

---

# 4.6 Redesign project presentation

### Problem

Project content should not be presented as interchangeable portfolio cards.

Both featured projects are different enough to deserve their own presentation style.

### Change

Use larger editorial / case-study-style rows.

Each project should communicate:

- project name
- short project purpose
- Stefan's role/contribution
- strongest technical/business detail
- relevant technologies
- links/actions where applicable
- one strong visual or supporting graphic if available

---

## SolidUI

SolidUI is suited to a visual presentation.

Possible structure:

```text
large product screenshot
project title
one-sentence description
short contribution summary
tech metadata
GitHub / live demo actions
```

Let the interface itself dominate the visual treatment.

---

## Internal inventory / stock reconciliation project

This project is valuable because of its real-world complexity.

Strong information includes:

- 200,000+ articles
- synchronization
- ordering workflows
- automatic pricing calculations
- business/system integration

Instead of forcing a product screenshot, the section could use:

- structured text
- data points
- small architecture/data-flow illustration
- technical metrics

This intentionally makes the two project sections different.

### Definition of Done

- project sections do not look like duplicated cards
- each project has its own visual emphasis
- project descriptions focus on outcome/complexity rather than only tech stack

---

# 4.7 Simplify the Skills / Expertise section

### Problem

The current skills section mixes several different types of concepts:

- languages
- frameworks
- disciplines
- engineering concepts
- design topics

Examples include:

- Java
- SQL
- TypeScript
- SolidJS
- Tailwind CSS
- REST API
- CI/CD
- UI Design
- DX
- Systemintegration & Datenabgleich

They currently appear too equivalent.

### Change

Rename the section toward something like:

- Expertise
- What I work with
- Engineering focus

Group skills by meaning.

Possible grouping:

```text
Backend & Data
- Java
- SQL
- APIs
- business logic

Frontend
- TypeScript
- SolidJS
- Tailwind CSS
- UI engineering

Systems & Engineering
- system integration
- data synchronization
- CI/CD
- developer experience
```

Alternatively, reduce the homepage to only 6–8 core competencies.

Detailed technology lists can live on later subpages.

### Definition of Done

The section communicates areas of expertise rather than looking like a tag cloud.

---

# 4.8 Reduce badge and pill usage

### Principle

Pills should be used for metadata, not as the default visual primitive.

Good uses:

- technology tags
- status labels
- small metadata

Avoid using rounded containers for:

- every section heading
- every skill
- every action
- every decorative label
- every piece of content

### Definition of Done

The page does not visually read as a collection of rounded cards and chips.

---

# 4.9 Improve typography

### Goal

Typography should provide more personality and hierarchy without becoming decorative.

### Change

Choose either:

- one strong variable sans-serif family

or

- one characterful display sans
- one restrained body sans

Avoid using monospace fonts everywhere just because this is a developer portfolio.

Use monospace only where it has semantic value.

### Hierarchy

Define clear styles for:

```text
display
h1
h2
h3
body-large
body
small/meta
```

Use meaningful differences in:

- size
- weight
- line-height
- letter spacing

### Text width

Long body copy should generally stay around:

```text
60–70ch
```

Avoid running project or experience paragraphs across the full page width.

### Definition of Done

Headings, body text, metadata, and links are visually distinguishable without relying heavily on boxes or separators.

---

# 4.10 Refine the experience timeline

### Keep

The timeline is a useful structure because chronology matters.

### Change

Make the most recent and relevant experience the strongest.

Recommended visual weighting:

```text
Current BMW role
↓
Previous BMW / HUK / PARAGON roles
↓
Older / less relevant experience
```

Older entries can progressively become more compact.

Avoid repeating large technology tag groups for every role.

Instead emphasize:

- responsibility
- scope
- domain
- major systems/problems solved

### Definition of Done

The section reads as career progression rather than a collection of repeated cards.

---

# 4.11 Standardize copy

Perform one editorial pass over the entire homepage.

Fix inconsistencies such as:

- German/English date formats
- punctuation
- tech naming
- link labels
- grammar
- abbreviations

Examples:

```text
2014 - Present
```

should become:

```text
2014–heute
```

Use consistently:

```text
CI/CD
```

instead of:

```text
CI / CD
```

Avoid vague endings like:

```text
etc...
```

Prefer concrete wording.

### Definition of Done

The page feels deliberately written rather than assembled over time.

---

# 4.12 Improve hero CTA

### Problem

The email address alone is not strong enough as the primary hero action.

### Change

Provide one clear primary CTA.

Suggested direction:

```text
Kontakt aufnehmen
```

Secondary action can be:

```text
GitHub
```

or later:

```text
Portfolio ansehen
```

The visible email address may remain nearby.

Avoid three or more equally prominent hero buttons.

### Definition of Done

There is one obvious primary action in the hero.

---

# 4.13 Build a spacing and layout system

### Goal

Professional consistency should come from repeated rules rather than per-component tweaking.

Define:

## Main container

One shared maximum width.

Example concept:

```text
content-max-width
```

## Reading width

Separate narrower width for long text.

```text
prose-max-width
```

## Section spacing

Use a small defined set.

Example:

```text
section-sm
section-md
section-lg
```

## Component spacing

Use the same spacing scale everywhere.

## Border radii

Keep the number of radii very small.

Example:

```text
radius-sm
radius-lg
```

Avoid arbitrary values on individual components.

### Definition of Done

Sections align predictably and spacing feels deliberate throughout the homepage.

---

# 4.14 Improve background treatment

### Goal

Create atmosphere without introducing generic visual effects.

### Use

Potentially:

- subtle warm/cool tone changes between sections
- extremely subtle grain/noise
- concrete-inspired texture
- restrained separators

### Avoid

- large gradient blobs
- random glowing circles
- heavy mesh gradients
- visually unrelated decorative geometry

### Definition of Done

The background supports the page without becoming a visual feature by itself.

---

# 4.15 Create one signature visual moment

Do not attempt to make every section visually special.

The homepage should have one clearly memorable compositional idea.

Recommended location:

## Hero + portrait

Possible approaches:

- portrait slightly breaks out of the main grid
- asymmetric text/image proportions
- image overlaps a subtle layout boundary
- typography uses the negative space around the portrait
- intentionally offset composition

Avoid the common SaaS layout:

```text
50% text | 50% image
```

with perfectly centered content on both sides.

### Definition of Done

The hero feels authored rather than generated from a standard template.

---

# 4.16 Reduce unnecessary motion

### Principle

Motion should support interaction and hierarchy.

Use animation for:

- initial hero entrance
- hover states
- link interactions
- project image interaction
- navigation

Avoid repeated scroll animations such as:

```text
opacity 0 → 1
translateY → 0
```

on every section.

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

### Definition of Done

The page feels responsive and polished without visibly “animating everything”.

---

# 4.17 Remove decorative UI chrome

Avoid decorative elements that do not communicate anything.

Examples to avoid:

```text
01 — PROJECTS
02 — EXPERIENCE
03 — CONTACT
```

unless numbering itself is meaningful.

Also avoid unnecessary:

- uppercase eyebrow labels
- decorative arrows
- section pills
- generic micro-labels

Strong typography and spacing should carry the hierarchy.

---

# 4.18 Build a stronger contact ending

### Problem

After removing testimonials, the homepage needs a deliberate closing section.

### Change

Create a spacious contact CTA before the footer.

Possible content direction:

```text
Du hast ein interessantes Projekt
oder möchtest dich austauschen?

Kontakt aufnehmen
kontakt@stefan-karger.de
GitHub
```

Keep this section visually simple.

Do not turn it into another three-card layout.

### Definition of Done

The homepage has a clear ending and next action.

---

# 5. Recommended Final Homepage Structure

```text
┌──────────────────────────────────────────────┐
│ Navigation                                   │
├──────────────────────────────────────────────┤
│                                              │
│ HERO                                         │
│                                              │
│ greeting                                     │
│ strong positioning headline                  │
│ short supporting copy                        │
│ CTA + secondary link                         │
│                                      portrait│
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ SELECTED WORK                                │
│                                              │
│ SolidUI                                      │
│ visual-heavy project presentation            │
│                                              │
│ Inventory / reconciliation system            │
│ data/process-heavy presentation              │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ EXPERTISE                                    │
│ compact grouped capabilities                 │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ EXPERIENCE                                   │
│ chronological timeline                       │
│ strongest focus on recent work               │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ CONTACT CTA                                  │
│                                              │
├──────────────────────────────────────────────┤
│ Footer                                       │
└──────────────────────────────────────────────┘
```

---

# 6. Implementation Order

## Phase 1 — Structure

Do this before detailed styling.

1. remove testimonials
2. reorder homepage sections
3. rewrite hero hierarchy
4. redesign project section structure
5. simplify skills/expertise content
6. simplify experience content
7. add final contact CTA

At the end of this phase, the page should already work structurally without relying on visual effects.

---

## Phase 2 — Design system

Establish:

1. color tokens
2. typography scale
3. container widths
4. spacing scale
5. border styles
6. radii
7. link/button styles
8. background treatment

Do not style sections independently before these rules exist.

---

## Phase 3 — Section styling

Apply the design system to:

1. navigation
2. hero
3. projects
4. expertise
5. experience
6. contact
7. footer

Pay special attention to the hero and project sections.

Those are the main visual identity carriers.

---

## Phase 4 — Interaction

Add only useful interaction.

Possible additions:

- navigation states
- refined button/link hover states
- project image hover treatment
- subtle hero entrance
- mobile navigation transition

Then implement reduced-motion behavior.

---

## Phase 5 — Final editorial pass

Check:

- all copy
- grammar
- punctuation
- language consistency
- date formatting
- project metadata
- technology naming
- link naming
- CTA wording

---

# 7. Things to Explicitly Avoid

Do not introduce these during implementation unless there is a strong reason.

## Generic SaaS patterns

Avoid:

- grid of identical rounded cards
- glassmorphism everywhere
- huge border-radius on every surface
- gradient blobs
- glowing orbs
- endless pills
- every section centered
- every section structured identically

## Generic developer portfolio clichés

Avoid:

- fake terminal UI
- code snippets used only as decoration
- excessive monospace typography
- Matrix/neon green aesthetic
- random `<div>` / `{}` / `//` decoration
- GitHub contribution-style visuals with no purpose

## Generic AI-generated frontend patterns

Avoid:

- eyebrow label above every heading
- scroll reveal on every section
- decorative numbered sections
- three feature cards for every concept
- excessive gradient text
- visually loud design with little information hierarchy

---

# 8. Responsive Requirements

All homepage improvements must work intentionally on:

```text
mobile
tablet
desktop
large desktop
```

Do not merely collapse desktop layouts vertically.

Specific checks:

## Hero

Mobile should retain a strong composition.

The portrait should not become a tiny image underneath a huge block of text.

## Projects

Visual hierarchy must survive without relying on side-by-side layouts.

## Experience

Timeline must remain readable without wasting horizontal space.

## CTA

Primary action must remain obvious.

---

# 9. Accessibility Requirements

Maintain or improve:

- semantic heading hierarchy
- keyboard navigation
- visible focus states
- sufficient color contrast
- reduced-motion support
- descriptive link labels
- meaningful image alt text

Decorative visuals should not add unnecessary accessibility noise.

---

# 10. Performance Constraints

Visual polish must not noticeably harm performance.

Prefer:

- Astro image optimization
- responsive image sizes
- modern image formats
- CSS effects over large decorative assets
- minimal client-side JavaScript
- no JavaScript animation library unless genuinely necessary

The homepage should remain primarily Astro/static.

---

# 11. Success Criteria

The redesign is successful when the homepage feels:

- coherent
- intentional
- senior
- technically credible
- personally recognizable
- visually restrained
- easy to scan

A visitor should quickly understand:

> Stefan is an experienced full-stack software engineer who works on real, complex systems and cares about clear, maintainable implementations.

The page should no longer feel like:

> a set of independent portfolio sections assembled from common frontend patterns.

Instead, it should feel like:

> one deliberately designed portfolio with a consistent visual and editorial voice.

---

# 12. Non-Goals

This plan does **not** include:

- portfolio subpage implementation
- blog implementation
- detailed project case-study pages
- multilingual architecture
- CMS setup
- content collections
- SEO strategy beyond homepage basics
- analytics changes
- major navigation expansion
- a complete branding exercise

Those can be handled separately.

The objective here is specifically to improve the **existing homepage** first and establish a visual system that future pages can inherit.
