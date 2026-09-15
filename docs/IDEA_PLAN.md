# stefan-karger.de — IDEA / MASTER PLAN

## Purpose

This document is the high-level handoff and project brief for the next iteration of **stefan-karger.de**.

It intentionally stays above the implementation details contained in the more focused planning documents. Its purpose is to define:

- what the redesign is trying to achieve,
- what is in and out of scope,
- the preferred technical direction,
- the architectural constraints,
- and how the project should be turned into an implementation-ready plan and tickets.

The next step after this document is **not immediate implementation**.  
The project should first be challenged, clarified and refined together with the user before being broken down into executable tickets.

---

## Existing project material

The project already contains more detailed planning material under `docs/`:

- `IMPROVEMENTS_PLAN.md`
  - visual consistency,
  - professionalism,
  - homepage UX/UI improvements,
  - design-system-related improvements.

- `LANGUAGE_PLAN.md`
  - bilingual architecture,
  - German/English page strategy,
  - routing and content organization,
  - avoiding unnecessary duplication between language variants.

- `PORTFOLIO_PLAN.md`
  - portfolio/gallery architecture,
  - image handling,
  - masonry layout,
  - responsive image generation,
  - lightbox/gallery behavior.

The current Astro implementation is also available under:

```text
docs/repos/
```

It should be treated as the **starting point and reference implementation**, not as something that must be preserved unchanged.

The focused planning documents are the source of truth for their respective areas.  
This file should not duplicate all of their details.

---

# 1. Core idea

Take the current version of **stefan-karger.de** and rebuild/refine it into a significantly more deliberate, consistent and professional personal portfolio.

The goal is **not** to throw everything away simply for the sake of rebuilding.

Instead:

1. inspect the existing site,
2. retain ideas, content and implementation pieces that still make sense,
3. remove or redesign weak/inconsistent parts,
4. establish a cleaner visual and technical foundation,
5. make bilingual support a first-class architectural concern,
6. ship a focused first version containing only the homepage and portfolio.

The result should feel like a coherent portfolio built intentionally around one design system rather than a collection of individually styled sections.

---

# 2. Primary goals

The first major iteration should achieve the following.

## Professional redesign

The site should look more polished, deliberate and visually consistent than the current version.

Important qualities include:

- strong visual hierarchy,
- consistent spacing,
- consistent typography,
- reusable visual patterns,
- restrained animation,
- clear content structure,
- responsive behavior,
- intentional use of whitespace,
- a design that fits both software engineering and photography/creative work.

The visual direction should remain personal rather than looking like a generic SaaS or template portfolio.

---

## Bilingual by design

The site should be designed for **German and English from the beginning**.

Internationalization must therefore be part of the architecture rather than added later as a patch.

The language system should:

- avoid duplicating page structure unnecessarily,
- allow shared components/layouts,
- keep translated content easy to maintain,
- support clean localized routes,
- make language switching obvious but unobtrusive,
- allow both language versions to evolve without creating two separate websites.

The exact architecture is defined in `LANGUAGE_PLAN.md` and should be validated during planning.

---

## Focused first release

The initial redesign should focus only on:

- **Homepage**
- **Portfolio**

Everything else should be treated as later work.

Possible future areas such as a blog may influence architecture decisions where appropriate, but they should not expand the scope of the first implementation phase.

The goal is to create a strong, complete small site before adding more sections.

---

# 3. Technology direction

## Package manager

Use:

```text
pnpm
```

---

## Primary framework

Use the latest stable version of:

```text
Astro
```

Astro should remain the primary framework and the default place for rendering, layout, components and page composition.

The site should stay as close to static/server-rendered HTML as practical.

---

## Styling

Use:

```text
Tailwind CSS v4
```

Tailwind should provide the main styling layer.

The implementation should favor:

- reusable tokens,
- shared layout primitives,
- consistent spacing scales,
- consistent typography rules,
- shared component variants,

instead of large amounts of isolated one-off utility combinations.

---

## Typography

Primary font:

```text
JetBrains Mono
```

The redesign should embrace the font intentionally rather than treating it as a novelty.

Typography, sizing, line length and spacing should keep the site readable and professional despite the monospace direction.

---

## Interactivity hierarchy

The project should avoid introducing client-side frameworks unless they provide real value.

Use the following preference order:

### 1. Astro only

Prefer regular Astro components and native browser behavior whenever possible.

### 2. Small inline Astro/browser script

For very small interactions, prefer a lightweight local script instead of hydrating an application component.

Examples might include:

- simple toggles,
- small DOM state changes,
- progressive enhancement.

### 3. Focused TypeScript / JavaScript package

If an established small library solves a specific problem well, prefer that over recreating complex behavior manually.

The dependency should have a narrow purpose and justify its inclusion.

### 4. SolidJS component / island

Use SolidJS only when the interaction is sufficiently stateful or complex that the previous approaches would result in worse code or UX.

SolidJS is therefore a **fallback for interactive islands**, not the default rendering model.

---

# 4. Design constraints

## One visual mode

The site should have **one intentionally designed visual appearance**.

Do not build:

- light/dark mode switching,
- theme toggles,
- parallel theme variants.

The chosen visual system should stand on its own.

This reduces complexity and makes it possible to focus on making one design excellent.

---

## Consistency over novelty

Visual ideas should be judged by whether they improve the site as a whole.

Avoid adding isolated effects simply because they look interesting individually.

Animations, borders, backgrounds, decorative elements and unusual layouts should share a common visual language.

---

## Responsive by default

Desktop should not be treated as the only canonical layout.

The design should work intentionally across:

- mobile,
- tablet,
- laptop,
- wide desktop.

Responsive behavior should be considered while designing components rather than patched in afterward.

---

## Accessibility and usability

The redesign should preserve normal web behavior wherever possible.

Important principles include:

- semantic HTML,
- keyboard accessibility,
- visible focus states,
- sensible contrast,
- reduced-motion consideration,
- descriptive image alternatives where applicable,
- predictable navigation.

Visual experimentation should not make the site harder to use.

---

# 5. Homepage scope

The homepage should communicate who Stefan is and what he does quickly and clearly.

The exact content and presentation should be refined using the existing site and `IMPROVEMENTS_PLAN.md`, but the page will likely continue to contain concepts such as:

- hero / introduction,
- primary links or calls to action,
- selected work/projects,
- professional history / experience,
- selected testimonials or social proof,
- links into the portfolio,
- contact / next-step information.

These should not automatically be preserved as separate sections simply because the current site uses them that way.

During the redesign, question:

- whether each section is necessary,
- whether sections can be merged,
- whether their order is optimal,
- how much content each needs,
- and how they support the overall narrative of the page.

---

# 6. Portfolio scope

The portfolio should be a curated presentation of the strongest photographic work rather than a full archive.

The main goals are:

- simple content maintenance,
- strong visual presentation,
- responsive image delivery,
- good performance,
- minimal JavaScript,
- a masonry-style gallery,
- an appropriate full-size/lightbox viewing experience.

The architectural and implementation direction is documented in:

```text
docs/PORTFOLIO_PLAN.md
```

The portfolio implementation should follow that plan unless the later planning/grilling phase reveals a better solution.

---

# 7. Architecture principles

## Shared page structure

German and English pages should share layouts and components.

The site should avoid maintaining duplicate copies of the same markup for each language.

Localized content should be supplied to reusable page/component structures.

---

## Reusable components without over-componentization

Create components where they represent a meaningful reusable design or structural concept.

Do not turn every small wrapper into its own component.

A component should normally exist because it provides at least one of:

- reuse,
- clear semantic responsibility,
- shared design behavior,
- easier maintenance,
- localized content handling,
- meaningful isolation of interaction.

---

## Keep content separate from presentation where useful

Localized or repeated page content should not be buried unnecessarily inside large Astro templates.

The exact organization should follow Astro best practices and the decisions from `LANGUAGE_PLAN.md`.

---

## Prefer simple build-time solutions

Where Astro can solve a problem during build time, prefer that over shipping runtime JavaScript.

Examples include:

- image transformation,
- responsive image generation,
- static localization data,
- gallery metadata,
- page generation.

---

## Avoid unnecessary dependencies

Every dependency should have a clear reason to exist.

Before adding a package, ask:

1. Can Astro/browser APIs solve this cleanly?
2. Is the functionality small enough to implement locally?
3. Does the package significantly reduce complexity?
4. Is the package actively maintained and appropriate for the current Astro ecosystem?

---

# 8. Out of scope for the first implementation

Unless required as infrastructure for the homepage or portfolio, do not expand the first phase into:

- blog implementation,
- CMS integration,
- authentication,
- dashboards,
- large application-style client-side state,
- theme switching,
- unrelated subpages,
- speculative features with no immediate use.

Future functionality may be considered when choosing architecture, but should not become implementation work in this phase.

---

# 9. Relationship between the planning documents

Think of the documents as layers:

```text
IDEA_PLAN.md
│
├── defines project goal, scope and technical guardrails
│
├── IMPROVEMENTS_PLAN.md
│   └── visual / UX / homepage improvement direction
│
├── LANGUAGE_PLAN.md
│   └── bilingual architecture and routing/content strategy
│
└── PORTFOLIO_PLAN.md
    └── gallery, images and portfolio implementation direction
```

The next detailed implementation plan should combine these sources rather than replacing them blindly.

If contradictions are found, they should be surfaced and resolved explicitly.

---

# 10. Required planning workflow

This document is intended as input for a deliberate planning process before implementation.

The desired workflow is roughly:

```text
existing site
      +
IDEA_PLAN.md
      +
IMPROVEMENTS_PLAN.md
      +
LANGUAGE_PLAN.md
      +
PORTFOLIO_PLAN.md
      │
      ▼
   /grilling
      │
      ▼
resolve contradictions,
missing decisions and
unclear requirements
      │
      ▼
 /frontend-design
      │
      ▼
design + implementation
decisions become concrete
      │
      ▼
    /unslop
      │
      ▼
remove generic / weak /
AI-looking design choices
      │
      ▼
detailed implementation plan
      │
      ▼
   /to-tickets
      │
      ▼
small independent tickets
      │
      ▼
implementation
```

The exact order may change if the skills work better in another sequence, but the important principle is:

> **Do not jump directly from the idea documents into implementation.**

The planning stage should actively challenge the current assumptions first.

---

# 11. Expectations for the grilling/planning phase

The planning process should inspect both the documentation and the existing Astro implementation.

It should actively identify:

- contradictions between planning documents,
- unresolved design decisions,
- unclear requirements,
- unnecessary complexity,
- outdated implementation choices,
- parts of the current site worth preserving,
- parts that should be removed,
- missing mobile/responsive considerations,
- accessibility issues,
- performance concerns,
- unnecessary JavaScript,
- opportunities to simplify the architecture.

Questions should focus on decisions that materially affect implementation.

The result should be a concrete plan rather than an open-ended brainstorming document.

---

# 12. Expectations for the detailed implementation plan

The detailed plan created after the grilling/design phase should be implementation-ready.

It should define, where relevant:

- final information architecture,
- routes,
- localization architecture,
- page structure,
- reusable components,
- data/content organization,
- image pipeline,
- gallery architecture,
- responsive behavior,
- visual tokens,
- typography system,
- spacing system,
- interaction behavior,
- animation rules,
- Astro/Solid boundaries,
- dependencies,
- accessibility requirements,
- SEO/meta handling,
- migration/reuse of current content,
- testing/validation,
- implementation order.

It should also explicitly state which ideas from the current implementation are being:

- retained,
- modified,
- replaced,
- removed.

---

# 13. Ticketing expectations

The final implementation plan should later be converted into separate tickets using `/to-tickets`.

Tickets should be:

- small enough to implement and review independently,
- ordered by dependency where necessary,
- explicit about acceptance criteria,
- limited in scope,
- traceable back to the implementation plan,
- free of unrelated cleanup work unless that cleanup is required.

Avoid tickets such as:

> “Redesign homepage”

Prefer tickets closer to:

> “Implement localized homepage hero using shared Astro component and language content source”

or:

> “Add responsive portfolio image pipeline using Astro image generation”

The exact ticket structure should be produced only after the final implementation architecture has been agreed upon.

---

# 14. Success criteria for the redesign

The first release should be considered successful when:

- the homepage and portfolio feel like parts of the same deliberate design system,
- German and English are both first-class versions of the site,
- the site remains primarily Astro-rendered,
- JavaScript shipped to the browser is minimal and justified,
- SolidJS is used only where it clearly improves the implementation,
- images are delivered efficiently and responsively,
- the portfolio is easy to maintain,
- the design works well on mobile and desktop,
- the site has one strong visual identity without a theme toggle,
- the codebase is easier to understand and extend than the current version,
- adding future sections such as a blog does not require rethinking the entire architecture.

---

# 15. Guiding principle

When multiple solutions are viable, prefer the one that produces the best combination of:

```text
clarity
+ visual quality
+ maintainability
+ performance
+ simplicity
```

The redesign should not optimize for technical cleverness.

It should optimize for a portfolio that feels intentional, professional and personal while remaining pleasant to maintain.
