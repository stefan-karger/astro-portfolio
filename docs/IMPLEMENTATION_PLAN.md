# stefan-karger.de v2 — implementation plan

**Status:** Draft for final approval  
**Prepared:** 2026-09-14  
**Implementation authorized:** No  
**Target repository:** `stefan-karger/astro-portfolio`  
**Development branch:** `dev/v2`

This is the implementation-ready synthesis of:

- `IDEA_PLAN.md`
- `IMPROVEMENTS_PLAN.md`
- `LANGUAGE_PLAN.md`
- `PORTFOLIO_PLAN.md`
- the current Astro repository and deployed website
- the current `e-k-fotos.de` photography website
- the decisions made during the planning/grilling rounds

Once approved, this document is the source of truth for v2. Older plans remain useful background, but this plan wins wherever they disagree.

Stefan authorized sequential implementation of tickets 01-04 on `dev/v2`. Development must not change `main` or the Netlify production setup. Tests and reviews run locally, without Deploy Previews or branch deploys.

---

## 1. Product definition

### 1.1 Purpose

Build a concise bilingual personal site that presents Stefan Karger primarily as an experienced software engineer and secondarily as a photographer.

The site must feel like one person and one design system, not a developer template joined to a separate photography template.

### 1.2 Audience priority

1. German-speaking professional contacts and employers
2. International developers and open-source collaborators
3. People interested in Stefan's photography and TFP collaboration

### 1.3 Positioning

- The homepage is engineer-first.
- Contact language is neutral. It must not announce active availability for freelance or full-time work.
- Freelance, open-source, and unusually fitting employment conversations remain possible through the same neutral contact route.
- Photography is personal artistic work and a creative outlet.
- Photography is not offered as a paid service.
- Photography copy may invite ideas, creative collaborations, and TFP work.

### 1.4 Public naming

- Use **Stefan Karger** everywhere public-facing.
- Use **Stefan Eideloth-Karger** only where legally required, principally the Impressum.
- Use **Rhein BMW** or **Rhein Gruppe / BMW Rhein** for the current employer. Never imply employment by BMW AG.
- Use **Junksplayground** in editorial copy and **Junksplayground GmbH** only where the legal entity matters.

### 1.5 v1 scope

- German and English homepage
- German and English photography portfolio
- Shared global navigation and footer
- Impressum and privacy pages
- Responsive image pipeline and lightbox
- SEO, social metadata, sitemap, robots, and custom 404
- Protected production branch, dedicated `dev/v2` development branch, and local validation
- Automated build, type, formatting, route, and accessibility checks

### 1.6 Explicitly out of scope

- Blog, posts, RSS, tags, or blog-ready placeholder infrastructure
- CMS or admin interface
- Contact form or server-side mail handling
- Analytics, tracking, cookies, or consent banner
- Theme toggle or system-theme switching
- Photography categories, filters, shoots, or project-detail pages
- Paid photography/service language
- Testimonials
- Download prevention, watermarking, or anti-AI image processing
- External image CDN
- Project screenshots in the first version
- A standalone skills cloud or expertise section

---

## 2. Definitions and release stages

The earlier documents used “v1” for both a first implementation and a public release. This plan separates them.

### First functional preview

- Runs locally from `dev/v2`.
- Uses the current approved copy as provisional content.
- Uses the existing portrait.
- Uses 5–10 supplied photographs to validate layout, image quality, and lightbox behavior.
- Is not release-ready.

### Release candidate

- Contains approximately 18–24 final photographs.
- Has a deliberately reviewed image order.
- Has German and English alt text for every photograph.
- Has completed copy, social, and legal-content review.
- Passes automated and manual acceptance checks.

### Public release

- Happens only by explicitly approved PR merge into `main`.
- Has no calendar deadline; quality and readiness determine release.

---

## 3. Audited starting point

### 3.1 Workspace and repository

- The workspace root is currently a planning folder, not a Git checkout.
- The existing clean checkout is at `docs/repos/astro-portfolio`.
- Remote: `https://github.com/stefan-karger/astro-portfolio.git`
- Current branch: `main`
- Audited commit: `2487c54ee43d81ae69ac538ae31ae175b48ee85c`
- The repository is public and currently has only `main`.
- `main` currently has no branch protection, ruleset, required checks, or CI workflow.
- GitHub CLI is installed locally but is not authenticated.

### 3.2 Hosting

- The production site is served by Netlify.
- The repository contains no `netlify.toml`; deploy configuration currently lives outside Git.
- The local Netlify CLI is not installed/authenticated.
- Stefan confirmed that pushes to `main` deploy the production site. Development stays on `dev/v2`; this project does not use Deploy Previews or branch deploys during development.

### 3.3 Current application

- Astro, pnpm, Tailwind CSS 4, SolidJS, and Sharp are present.
- Only `/` is implemented.
- `/fotos`, `/portfolio/`, `/en/`, and `/blog` currently fail or are placeholders.
- German content is rendered inside `<html lang="en">`.
- The header and mobile navigation are not a robust no-JavaScript experience.
- Theme switching, a mobile drawer, and a fake testimonial carousel ship unnecessary client JavaScript.
- The current page contains Hero, Skills, Projects, Career, and placeholder Testimonials.
- SEO is limited to a title and basic viewport metadata.
- There is no sitemap, robots file, canonical metadata, hreflang, social image metadata, custom 404, automated test suite, or CI.

### 3.4 Available assets and content

- The current portrait is a 1080 × 1080 JPEG and is usable for the first preview. Its tracked source contains legacy Photoshop/EXIF/XMP profiles, so v2 should replace it with a visually equivalent metadata-stripped web asset rather than copy the file byte-for-byte.
- Existing social SVGs can be reviewed and reused.
- The current data contains the two selected projects and the approved career history.
- No project screenshots or portfolio source images are present in the repository.
- The old photography site contains 18 people photographs and 16 advertising/product-oriented photographs, but its code, layout, commercial positioning, and broken lightbox are not migration sources.
- Stefan will supply a selected high-quality test batch, followed by the final curated set.

---

## 4. Repository and production safety

Production safety is a hard prerequisite, not a final deployment task.

### 4.1 Rules that may not be broken

- Never commit or push v2 work directly to `main`.
- Never merge a v2 PR without Stefan's explicit release approval.
- Never put local specs or tickets in GitHub Issues. They belong under `.scratch/`.
- Never commit the nested `docs/repos/astro-portfolio/.git` directory.
- Never commit original camera files, private source photographs, secrets, or unreviewed legal data.

### 4.2 Pre-development gate

Before touching application code:

1. Create `dev/v2` from the current `origin/main` commit and push only that development branch.
2. Keep Netlify production unchanged. Do not use Deploy Previews or branch deploys for development.
3. Run development validation locally.
4. Add a GitHub ruleset targeting `main`:
   - require changes through a pull request;
   - require zero approvals, suitable for the solo workflow;
   - block force pushes;
   - block branch deletion;
   - require the v2 validation workflow after that workflow exists.
5. Confirm that Git Credential Manager can push `dev/v2` and that the authenticated account can administer the repository.

### 4.3 Safe workspace promotion

Preserve Git history while making the repository the workspace root:

1. Create a fresh temporary clone in a verified sibling directory.
2. Confirm its `origin`, `HEAD`, and clean status.
3. Create `dev/v2` from `origin/main` and push only `dev/v2`.
4. Copy the planning/agent files from the current outer workspace into the clone:
   - `AGENTS.md`
   - `.agents/`
   - `skills-lock.json`
   - `docs/agents/`
   - the five planning documents, including this one
5. Do not copy `docs/repos/astro-portfolio` into the promoted checkout.
6. Add `/docs/repos/` and the private photo-intake directory to `.gitignore` as guards.
7. Verify that the promoted tree contains exactly one `.git` directory.
8. Move the present outer workspace to a dated backup and place the verified clone at the canonical `stefan-karger.de` path. If Windows locks the open root directory, move its verified child entries into the backup and move the clone entries into the empty canonical directory.
9. Keep the backup until install, build, remote, branch, and file-preservation checks pass.
10. Continue on `dev/v2`. Do not open a development pull request. A release pull request requires Stefan's explicit release instruction.

The existing nested checkout is a reference/donor only. The promoted checkout must be a fresh clone so repository identity and history are unambiguous.

---

## 5. Final information architecture

### 5.1 Routes

| Route            | Language                   | Purpose     | Surface       |
| ---------------- | -------------------------- | ----------- | ------------- |
| `/`              | German                     | Homepage    | light neutral |
| `/portfolio/`    | German                     | Photography | dark neutral  |
| `/en/`           | English                    | Homepage    | light neutral |
| `/en/portfolio/` | English                    | Photography | dark neutral  |
| `/impressum/`    | German legal content       | Imprint     | light neutral |
| `/datenschutz/`  | German legal content       | Privacy     | light neutral |
| `/404.html`      | concise bilingual recovery | Not found   | light neutral |

Rules:

- German is the unprefixed default locale.
- All canonical content URLs use trailing slashes.
- `/fotos` is removed and is not redirected in v1.
- `/blog` is removed and is not redirected.
- The English footer links to the same canonical German legal pages; do not maintain duplicate legal translations.

### 5.2 Global header

- Text wordmark: `Stefan Karger`.
- Localized links to Projects, Experience, Photography, and Contact.
- Text language switch: `DE` / `EN`.
- The switch always opens the equivalent page, not merely a locale homepage.
- On small screens, use a compact two-row/wrapping text navigation. Do not add a hamburger drawer or client-side navigation island.
- Use a sticky, opaque header with a single hairline separator; no glass blur.
- Account for the sticky header in anchor scroll offsets.

### 5.3 Footer

- Stefan Karger
- Email
- X
- GitHub
- LinkedIn
- Instagram
- Impressum
- Datenschutz / Privacy label as appropriate
- Copyright year generated at build time

Email is the primary explicit call to action. X is the principal public posting/conversation channel and must be more prominent than LinkedIn.

---

## 6. Homepage specification

The homepage order is fixed:

1. Hero
2. Projects
3. Experience
4. Contact

There is no separate Skills, Expertise, Testimonials, or Photography section.

### 6.1 Hero

Content hierarchy:

1. Stefan Karger
2. Senior Software Engineer
3. One plain sentence describing work on real applications, integrations, and long-lived systems
4. Würzburg, Deutschland / Germany
5. Primary contact link and a secondary projects anchor
6. A short linked photography kicker

Copy rules:

- Retain the direct tone of “Hi, ich bin Stefan” only if it fits the final composition.
- Remove the current generic second sentence about combining technical knowledge with “smart, modern implementation.”
- Do not mention active job seeking, full-time constraints, freelance availability, or paid photography.
- The photography kicker should be one short sentence/link, not a second identity statement or homepage section.

Visual treatment:

- Use the current portrait as a larger rectangular editorial image.
- Create the v2 portrait asset from a metadata-stripped derivative; do not rewrite repository history merely to remove the already-public legacy file.
- Do not use a circular avatar, decorative border ring, grayscale filter, or fake terminal frame.
- Preserve the portrait's natural color and composition.
- Replace it later only if Stefan supplies a stronger high-resolution portrait.

### 6.2 Projects

Show exactly two text-led project entries. They are editorial rows, not floating cards.

Each entry contains:

- project number;
- name;
- concise context/problem;
- Stefan's work or contribution without unsupported sole-credit claims;
- system scope/result where known;
- technologies as restrained inline metadata, not pill badges;
- relevant public links.

#### Project 01 — SolidUI

- Describe it as an open-source component library for SolidJS.
- Mention the documentation and CLI where useful.
- Link to the public repository and live documentation.
- Do not hard-code GitHub star/fork counts.
- Do not describe Stefan as the sole creator; the public project credits other contributors and the community.

#### Project 02 — Lagerabgleich & Preisautomatisierung

- Attribute the work to the Junksplayground side job.
- Explain it first as inventory, order, marketplace, and pricing software.
- Java, SQL, REST/API integration, JTL-Wawi, and Cardmarket may appear in technical detail.
- The existing “well over 200,000 articles” statement may be used as supplied content.
- Do not substitute public Cardmarket listing counts for internal records.
- Do not invent revenue, time-saving, error-rate, or other causal outcome claims.
- No private interface screenshot is required for v1.

### 6.3 Experience

Show the complete approved history, with visual emphasis on the current role:

- Rhein BMW / Rhein Gruppe — Senior Software Engineer — 2014–present
- PARAGON Systemhaus GmbH — Software Engineer — 2013
- HUK-COBURG — Anwendungsentwickler — 2011–2013
- Bausparkasse Schwäbisch Hall — BA Student & Anwendungsentwickler — 2008–2011

The current-role description may use the existing repository facts concerning internal sales and after-sales systems, ticketing, user/device information, project leadership, and the listed technologies.

Editorial rules:

- Do not say “at BMW,” “BMW engineer,” or otherwise imply BMW AG employment.
- Use a concise current-role description and compress older entries when no meaningful description exists.
- Do not invent copy to make older entries look equally detailed.
- Copy and naming can be refined after the first functional preview without changing the structure.

### 6.4 Contact

- One neutral invitation to get in touch.
- Large visible `mailto:` link using the current repository address.
- Location.
- X, GitHub, LinkedIn, and Instagram links in that priority context.
- No form, calendar embed, availability badge, or response-time claim.

---

## 7. Photography page specification

### 7.1 Intro

- Page title: `Fotografie` / `Photography`.
- One short paragraph stating that this is personal artistic work.
- Invite ideas and creative collaboration.
- State that collaborations are noncommercial and TFP.
- Spell out the English meaning of TFP once rather than assuming every visitor knows it.
- Link to email and Instagram without turning the page into a service funnel.

### 7.2 Gallery

- One manually curated sequence mixing people and advertising/product-oriented images.
- No visible categories, tabs, filters, counters, or archive controls.
- Approximately 18–24 final images at public release.
- The first functional preview uses 5–10 images only.
- Preserve each photograph's native aspect ratio.
- No rounded corners or card chrome.
- Default view is image-only; no permanent captions below every image.
- Optional title/model/credit metadata may appear discreetly in the lightbox only when supplied.

### 7.3 Responsive layout

Use progressively enhanced masonry:

- 1 column on narrow phones
- 2 columns on larger phones/small tablets
- 3 columns on ordinary desktop widths
- 4 columns only on wide screens where individual images remain substantial
- neutral gutter of roughly 8–12 px
- gallery width capped near 1600 px with narrow responsive edge gutters

The enhancement uses a tiny local TypeScript module and known image ratios to place items in the shortest column while retaining DOM order. A plain CSS columns or single-column fallback must remain viewable if JavaScript fails. Do not rely on experimental native CSS masonry for v1.

### 7.4 Lightbox

Use PhotoSwipe as the only runtime UI dependency.

Requirements:

- dynamic import only on the portfolio pages;
- open from semantic links to the large derivative;
- keyboard navigation, Escape close, focus restoration, touch swipe, and zoom;
- responsive large-image `srcset`;
- known width and height supplied to prevent layout errors;
- optional conditional credit/caption UI;
- direct large-image links remain useful without JavaScript.

Do not build a custom fullscreen gallery or use SolidJS for the lightbox.

---

## 8. Localization architecture

### 8.1 Astro routing

Configure Astro with:

- `site: "https://stefan-karger.de"`
- static output
- `defaultLocale: "de"`
- locales `de` and `en`
- `prefixDefaultLocale: false`
- `trailingSlash: "always"`

Use Astro's i18n URL helpers for internal locale links. Do not add manual browser-language middleware, automatic redirects, a notification banner, or a locale cookie.

### 8.2 Shared rendering

Route files are thin entry points:

- `src/pages/index.astro`
- `src/pages/portfolio/index.astro`
- `src/pages/en/index.astro`
- `src/pages/en/portfolio/index.astro`

Each passes a typed locale to the same homepage or portfolio composition. German and English must not become duplicated component trees.

### 8.3 Content model

Keep stable facts separate from localized prose:

- stable IDs, URLs, social handles, employers, raw dates, technologies, and image imports live in typed data modules;
- German and English labels/descriptions live in locale dictionaries that satisfy one shared TypeScript schema;
- photographs contain localized `alt` values and optional localized title/credit values;
- route mappings are centralized so the language switch cannot drift.

Missing translation keys must fail type checking. English copy is a natural adaptation of the German source, not a sentence-by-sentence machine translation.

### 8.4 Document metadata

Every route must set the correct:

- `<html lang>` value;
- localized title and description;
- canonical URL;
- `hreflang` alternates when an equivalent locale exists;
- `x-default` pointing to the German unprefixed route for bilingual pairs.

---

## 9. Technical architecture

### 9.1 Runtime and package policy

At implementation kickoff:

- update to the latest stable Astro release and lock it through `pnpm-lock.yaml`;
- retain Tailwind CSS 4 and update it to the compatible stable release;
- use Node.js 24 through `.nvmrc` and `package.json#engines`;
- pin the exact pnpm version in `package.json#packageManager`;
- use `pnpm install --frozen-lockfile` in CI and Netlify.

Audit baseline on 2026-09-14: Astro 7.3.2, Tailwind CSS 4.3.3, pnpm 11.5, Node 24.15. These are a reference, not a command to ignore newer compatible patch releases at kickoff.

### 9.2 Production dependencies

Expected runtime/build dependencies:

- `astro`
- `tailwindcss`
- `@tailwindcss/vite`
- `sharp`
- `photoswipe`
- `@astrojs/sitemap`

Use the Fontsource variable packages for JetBrains Mono and Atkinson Hyperlegible Next. Let the build emit their WOFF2 assets. Do not add hand-managed font binaries or load fonts from Google or another third-party origin in the browser.

### 9.3 Dependencies to remove

Unless implementation proves a new concrete need, remove:

- `solid-js`
- `@astrojs/solid-js`
- `@kobalte/core`
- `@corvu/drawer`
- `embla-carousel-solid`
- `embla-carousel-autoplay`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `tw-animate-css`

Also remove the associated TSX UI primitives and islands. The homepage must ship no authored client JavaScript.

### 9.4 Development dependencies and scripts

Retain Prettier/Astro/Tailwind formatting support and add only what the validation pipeline needs:

- `@astrojs/check`
- TypeScript
- Playwright test runner
- axe integration for automated accessibility smoke checks

Required scripts:

- `dev`
- `build`
- `preview`
- `check`
- `format`
- `format:check`
- `test:e2e`
- `validate` combining format check, Astro check, build, and tests

### 9.5 Netlify configuration

Add a minimal committed `netlify.toml`:

- build command: `pnpm build`
- publish directory: `dist`
- no Astro Netlify adapter, functions, image CDN, or server rendering
- the same build command for local verification and the later production release

The production branch remains a Netlify UI setting and must stay `main`.

---

## 10. Proposed source structure

```text
src/
├── assets/
│   ├── portrait/
│   └── portfolio/
├── components/
│   ├── global/
│   │   ├── SiteHeader.astro
│   │   ├── SiteFooter.astro
│   │   ├── LanguageSwitch.astro
│   │   └── SeoHead.astro
│   ├── home/
│   │   ├── HomePage.astro
│   │   ├── Hero.astro
│   │   ├── Projects.astro
│   │   ├── ProjectEntry.astro
│   │   ├── Experience.astro
│   │   └── Contact.astro
│   └── portfolio/
│       ├── PortfolioPage.astro
│       ├── PortfolioIntro.astro
│       ├── PortfolioGallery.astro
│       └── PortfolioImage.astro
├── data/
│   ├── profile.ts
│   ├── projects.ts
│   ├── experience.ts
│   └── photographs.ts
├── i18n/
│   ├── types.ts
│   ├── de.ts
│   ├── en.ts
│   └── routes.ts
├── layouts/
│   └── SiteLayout.astro
├── pages/
│   ├── en/
│   │   ├── index.astro
│   │   └── portfolio/index.astro
│   ├── portfolio/index.astro
│   ├── index.astro
│   ├── impressum.astro
│   ├── datenschutz.astro
│   └── 404.astro
├── scripts/
│   ├── masonry.ts
│   └── portfolio-lightbox.ts
└── styles/
    ├── tokens.css
    └── global.css
```

Do not create a content collection, MDX layer, component library, or generic UI folder for four static pages.

---

## 11. Visual system

### 11.1 Direction

Use a neutral technical-editorial system:

- the homepage feels like a precise project index;
- the portfolio lets the same neutral scale invert into a gallery canvas;
- typography, spacing, rules, and image composition create identity;
- photography supplies the chromatic color;
- there is no decorative “developer syntax,” fake terminal UI, neon accent, or generic rounded-card dashboard language.

The signature move is the controlled light-to-dark page transition within one hue family, not an added visual effect.

### 11.2 Initial color tokens

These are implementation starting values; final values must be contrast-tested before approval.

```text
light canvas       #EEEDE9
light surface      #F8F7F3
light text         #1B1A18
light muted text   #67645E
light rule         #CBC8C0

dark canvas        #181715
dark surface       #201F1C
dark text          #E9E7E1
dark muted text    #A7A39B
dark rule          #3A3833
```

Rules:

- All colors remain in the same restrained stone-neutral family.
- Do not introduce a blue/green cast on one surface and a warm cast on the other.
- Do not add a bright brand accent for links or buttons.
- Use underline, weight, border, and inversion for state.
- Focus indicators must remain conspicuous on both surfaces.

### 11.3 Typography

- **JetBrains Mono Variable:** wordmark, headings, navigation, project numbers, dates, technology metadata, and short labels.
- **Atkinson Hyperlegible Next Variable:** paragraphs, project descriptions, experience descriptions, legal copy, and longer interface text.
- Body base: 16–18 px depending on viewport, approximately 1.6 line-height.
- Reading measure: approximately 65–70 characters.
- Hero name: fluid large type, roughly 48–112 px across supported widths.
- Avoid all-caps labels, exaggerated letter spacing, and monospace paragraphs.
- Preload only the font files proven necessary above the fold.

The first visual preview includes an explicit typography checkpoint. Removing the sans face later must remain a token-level change, not a component rewrite.

### 11.4 Spacing and shape

- 4 px base spacing unit.
- Page content width around 1152–1200 px.
- Gallery width around 1600 px.
- Fluid page gutters from 16 px on phones to 48 px on wide screens.
- Section spacing roughly 80–144 px, reduced on mobile.
- Hairline separators instead of boxed cards.
- Radius limited to 0–2 px for structural elements; controls may use a small practical radius.
- No decorative shadows.

### 11.5 Responsive behavior

Design and verify at minimum:

- 320 px
- 375 px
- 768 px
- 1024 px
- 1440 px
- 1920 px

Layouts must use fluid CSS and content constraints rather than special-case device designs. Navigation, large mono headings, long German words, project links, and legal text require explicit narrow-screen checks.

---

## 12. Interaction and motion

- No theme script or local-storage preference.
- No client-side mobile drawer.
- No scroll-reveal library, parallax, autoplay, carousel, custom cursor, or page-transition framework.
- Use short CSS transitions only for links, image hover feedback, and focus/active state.
- Smooth anchor scrolling is allowed only inside `prefers-reduced-motion: no-preference`.
- Under reduced motion, remove nonessential transitions and PhotoSwipe zoom animation.
- Portfolio thumbnails may use a restrained opacity/scale response, but never obscure the image or shift layout.
- External links disclose their destination through accessible text or labels; icons are secondary.

---

## 13. Photography asset and image pipeline

### 13.1 Public-repository safety

The GitHub repository is public. Full camera originals must not enter Git history.

Asset flow:

1. Stefan supplies high-quality originals to a local, gitignored intake directory or another private transfer location.
2. Create web masters in sRGB with metadata stripped and a maximum long edge near 3000 px.
3. Visually compare the web masters with the originals for crop, color, gradients, skin tone, and sharpening.
4. Commit only the approved web masters under `src/assets/portfolio/`.
5. Astro generates delivery derivatives during the static build.

The intake directory must be ignored before any photograph is placed in it. Reject files containing GPS or other sensitive metadata from the committed asset set.

### 13.2 Manifest

Use an explicit typed manifest rather than filename-derived content or rename-based ordering.

Each item contains:

- stable opaque ID;
- imported source image;
- manual sequence position through array order;
- German alt text;
- English alt text;
- optional localized title;
- optional credit/model text;
- optional focal-position data for any intentionally cropped secondary placement.

Reordering the gallery changes the manifest only; it must not require renaming image files.

### 13.3 Derivatives

Starting derivative policy:

- grid widths around 480, 768, 1024, and 1440 px;
- lightbox widths around 1280, 1920, and 2560 px, capped by source size;
- portrait widths around 320, 640, and 960 px;
- WebP output for v1;
- visually validated quality near 85 for grid images and 90 for lightbox images;
- explicit `srcset`, `sizes`, width, and height;
- first meaningful above-fold image eager/high-priority where justified;
- remaining gallery images lazy and async-decoded.

Do not generate AVIF in v1 unless real-image comparison shows a clear quality/size benefit worth the extra transformations. Do not serve the source master directly.

### 13.4 Layout stability

- Reserve exact aspect-ratio space before image load.
- Masonry calculations use imported source dimensions and do not wait for image decoding.
- Recalculate through one debounced `ResizeObserver` path.
- Retain DOM order so keyboard navigation follows the curated sequence.
- Avoid layout shift when the enhancement activates; if this cannot be achieved cleanly, prefer the stable CSS fallback over clever masonry.

---

## 14. SEO and sharing

### 14.1 Metadata

Create one typed SEO component accepting locale, title, description, canonical path, alternates, surface color, and social image.

Required output:

- localized document title
- meta description
- canonical URL
- `hreflang="de"`, `hreflang="en"`, and `x-default` for bilingual pairs
- Open Graph title, description, URL, type, locale, alternate locale, and image
- X/Twitter summary-large-image metadata
- theme color matching the current page surface

### 14.2 Social images

- Homepage: portrait-led neutral composition with Stefan Karger and role.
- Portfolio: one supplied hero photograph or a restrained fixed montage after the final set exists.
- Do not generate social images dynamically at request time.

### 14.3 Crawling

- Configure `@astrojs/sitemap` from the canonical site URL.
- Add `robots.txt` referencing the sitemap.
- Include public content and legal routes.
- Exclude preview-only or build artifacts.
- Keep `/fotos` and `/blog` as genuine 404s, per the route decision.

### 14.4 Structured data

Add a small `Person` JSON-LD object only from confirmed facts:

- Stefan Karger
- canonical site URL
- Senior Software Engineer
- Würzburg, Germany
- same-as links for X, GitHub, LinkedIn, and Instagram

Do not encode speculative services, availability, employer legal entity, or photography business data.

---

## 15. Accessibility requirements

Target WCAG 2.2 AA for the implemented scope.

Required behavior:

- correct page language per locale;
- skip link;
- one clear `<main>` and logical landmarks;
- one H1 per page and ordered headings;
- semantic navigation and lists;
- visible keyboard focus on light and dark surfaces;
- minimum AA text contrast, including muted text;
- minimum practical touch target around 44 × 44 px for icon-only controls;
- meaningful bilingual photo alt text written manually;
- decorative icons hidden from assistive technology;
- accessible names for social links and lightbox controls;
- no keyboard trap;
- lightbox focus restoration and Escape close;
- reduced-motion handling;
- no horizontal scrolling at 320 px;
- layouts remain usable at 200% zoom and with text-only zoom;
- the no-JavaScript page still exposes content and large-image links.

Do not derive alt text from filenames and do not leave gallery alt attributes empty.

---

## 16. Validation and CI

### 16.1 GitHub Actions

Add one pull-request and `dev/v2` validation workflow:

1. install the pinned Node and pnpm versions;
2. `pnpm install --frozen-lockfile`;
3. `pnpm format:check`;
4. `pnpm check`;
5. `pnpm build`;
6. run browser smoke/accessibility tests against the built preview.

Once stable, make this workflow a required `main` check.

### 16.2 Automated route matrix

Verify at least:

- all seven declared routes return the intended document;
- `/fotos` and `/blog` return 404;
- each localized route has the correct `lang`, canonical, and hreflang values;
- language switches map home-to-home and portfolio-to-portfolio;
- home anchors target existing IDs in both languages;
- every internal link resolves;
- every image has nonzero dimensions and nonempty locale-appropriate alt text;
- PhotoSwipe opens, advances, closes with Escape, and restores focus;
- axe reports no serious or critical violations on home and portfolio in both languages.

### 16.3 Manual QA

- Review all target widths and both page surfaces.
- Test keyboard-only navigation.
- Test reduced motion.
- Test with JavaScript disabled.
- Test current Chrome/Edge, Firefox, and Safari/iOS.
- Inspect first-load and lazy-load behavior on throttled mobile networking.
- Compare photography derivatives against source files on a color-managed display where possible.
- Check that no camera original, GPS metadata, private screenshot, secret, or nested Git directory is tracked.
- Run Lighthouse against the local production build and address material accessibility, SEO, layout-shift, and image-delivery findings.

### 16.4 Performance budgets

- Homepage: zero authored client JavaScript.
- Portfolio: only masonry and dynamically loaded PhotoSwipe code; target no more than roughly 45 KB compressed authored/library JavaScript.
- CLS target below 0.1.
- Mobile LCP target below 2.5 seconds under a representative Lighthouse run.
- Avoid loading below-the-fold gallery images in the initial viewport.
- No unoptimized source photograph may be requested by a normal page load.

Budgets are release gates, not reasons to degrade visible photographic quality blindly. Compression is settled by real-image review.

---

## 17. Legal and privacy content gate

- Build one German Impressum and one German privacy page.
- Use the current `e-k-fotos.de` legal details as user-supplied source content.
- Update the privacy description so it matches the actual v2 system: Netlify hosting, self-hosted fonts, no analytics, no form, external social links, and email contact.
- Do not copy obsolete service descriptions or statutory references without review.
- Keep the full legal name off all nonlegal pages.
- Stefan must review the personal address/contact details and final legal text before public merge.

This plan defines implementation structure, not legal advice.

---

## 18. Migration disposition

| Current element                                  | Decision                                           |
| ------------------------------------------------ | -------------------------------------------------- |
| Git history and remote                           | Retain                                             |
| Astro + pnpm + Tailwind base                     | Retain and upgrade                                 |
| Current portrait                                 | Retain for first preview; change crop/presentation |
| SolidUI and inventory project facts              | Retain and edit into structured bilingual copy     |
| Career history                                   | Retain; improve hierarchy and wording later        |
| Email and social destinations                    | Retain; reorder prominence with X above LinkedIn   |
| Local social SVGs                                | Review and reuse where sound                       |
| Current section component idea                   | Retain only as a loose separation of concerns      |
| JetBrains Mono                                   | Retain for identity/display roles                  |
| Mono-only body typography                        | Replace with two-family system                     |
| Current layout, navbar, and global CSS           | Replace                                            |
| Theme variables and theme toggle                 | Replace with fixed light/dark page surfaces        |
| SolidJS integration and islands                  | Remove                                             |
| Drawer, carousel, toggle, and UI primitives      | Remove                                             |
| Fake testimonials                                | Remove                                             |
| Frequency-derived skills list                    | Remove                                             |
| Blog and `/fotos` navigation                     | Remove                                             |
| Placeholder/Astro favicon                        | Replace with a simple typographic SK favicon       |
| Age and gender fields                            | Remove                                             |
| Old photography code/design/form/commercial copy | Do not migrate                                     |
| Selected old photography images                  | Migrate only from supplied high-quality files      |

---

## 19. Implementation sequence

Each phase must end in a reviewable `dev/v2` state. Detailed tickets are created only after this plan is approved.

### Phase 0 — production safeguards and workspace promotion

- Record the owner-confirmed Netlify production behavior and leave it unchanged.
- Protect `main`.
- Promote a clean clone into the workspace root.
- Create and push `dev/v2`.
- Keep development and review local without a Deploy Preview or branch deploy.
- Preserve the existing workspace backup.

### Phase 1 — baseline modernization and deletion

- Upgrade Astro/Tailwind/toolchain.
- Pin Node and pnpm.
- Add Netlify config and validation scripts.
- Remove SolidJS and unused UI dependencies/components.
- Establish the proposed directory structure.
- Confirm a clean static build before visual work.

### Phase 2 — design system and shared shell

- Implement font loading and tokens.
- Implement reset/global styles, container, type, spacing, focus, and reduced motion.
- Implement shared SEO head, header, language switch, footer, and layout surfaces.
- Implement the typographic favicon.

### Phase 3 — typed localization and routes

- Add stable data and locale schemas.
- Add all route entry points.
- Add language mapping, canonical, hreflang, sitemap, robots, and 404.
- Add provisional legal-page shells and content.

### Phase 4 — homepage

- Implement Hero, Projects, Experience, and Contact in order.
- Use provisional repository copy.
- Add the portrait and photography kicker.
- Validate zero homepage JavaScript and mobile layout.

### Phase 5 — photography system with test batch

- Ingest 5–10 private source images safely.
- Produce approved web masters and bilingual manifest entries.
- Implement responsive derivatives, fallback gallery, masonry enhancement, and PhotoSwipe.
- Review image quality, order behavior, lightbox, keyboard behavior, and performance.

### Phase 6 — full curation and editorial pass

- Select and ingest approximately 18–24 final photographs.
- Complete sequence, alt text, and any optional credits.
- Refine German copy, then English adaptation.
- Finalize project/career phrasing and social images.
- Complete legal-content owner review.

### Phase 7 — release candidate and launch

- Run automated and manual QA.
- Review the local production build on real devices.
- Verify the diff contains no originals/private files/unrelated cleanup.
- Mark the PR ready only after all release criteria pass.
- Merge to `main` only on Stefan's explicit instruction.
- Verify the production deploy and retain an immediate rollback path to the previous Netlify deploy.

---

## 20. Definition of done

The redesign is done when all of the following are true:

- The four bilingual product routes and three supporting routes are live and correct.
- The homepage has exactly Hero, two Projects, Experience, and Contact, plus only a small photography kicker.
- The public naming and professional/photography positioning match this plan.
- German and English are complete, typed, and share one rendering implementation.
- The visual system uses the approved neutral light/dark family without a theme toggle or color-temperature split.
- The homepage ships no authored JavaScript.
- The portfolio contains approximately 18–24 reviewed images in one curated sequence.
- No full original photograph is present in the public Git history or served to visitors.
- The gallery is responsive, stable, keyboard-accessible, and useful without JavaScript.
- SEO, social metadata, sitemap, robots, 404, legal links, and page language are correct.
- Required CI passes and the local production build has passed manual review.
- Stefan has signed off on copy, social destinations, image selection/order, alt text, and legal details.
- `main` has received no direct v2 commit or push.
- Release occurs through the approved PR only.

---

## 21. Remaining inputs, not open architecture decisions

These inputs are intentionally deferred to their implementation phase and do not reopen the plan:

- the first 5–10 high-quality photographs;
- the final approximately 18–24-image selection and order;
- optional model/title/credit metadata;
- any higher-resolution replacement portrait;
- final sentence-level German copy edits and English adaptation;
- final owner verification of email/social URLs and legal details;
- access needed for GitHub protections and the later approved production release.

The phases are tracked as dependency-ordered local Markdown tickets under `.scratch/stefan-karger-v2/`. Stefan authorized sequential implementation of tickets 01-04 on `dev/v2`.
