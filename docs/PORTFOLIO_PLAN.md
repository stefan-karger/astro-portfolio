# PORTFOLIO_PLAN.md

## Why these decisions were made

The portfolio should stay aligned with the core philosophy of the site: **Astro first, static where possible, very little client JavaScript, and SolidJS only when it solves a real interactive problem**.

The page is intentionally designed as a **single curated portfolio**, not as a CMS, project archive, or photography platform. That is why the preferred workflow is simply: add a finished full-resolution image to one folder, give it an ordering prefix, build the site, and let Astro generate everything else automatically.

The main decisions came from these goals:

- **Masonry fits the content best** because the selected images will have mixed portrait/landscape aspect ratios and should retain their natural composition.
- **Astro should generate responsive derivatives** so the browser never needs to download a full-size original for the gallery.
- **PhotoSwipe is used only for the lightbox** because it adds zoom, keyboard navigation, swipe support, and fullscreen-style viewing without requiring React/Solid hydration.
- **A tiny vanilla TypeScript masonry enhancer is preferred** over a Solid component because Astro already knows every image's dimensions at build time. That makes the layout problem very small and avoids hydrating a framework for a static gallery.
- **CSS columns remain a sensible fallback** and can be used either as a no-JS fallback or as the initial implementation if the custom masonry is postponed.
- **The visual design should extend the existing stefan-karger.de language**, not replace it with a generic photography-site aesthetic: simple, technical, minimal, mono typography, restrained UI, and the images providing most of the visual color.

---

# 1. Goal

Create a new `/portfolio` page for `stefan-karger.de` that:

- displays only the best selected images;
- accepts mixed image aspect ratios;
- uses a masonry layout;
- requires almost no manual data maintenance;
- automatically discovers images at build time;
- automatically creates optimized thumbnails/gallery images;
- automatically creates larger responsive lightbox images;
- uses PhotoSwipe for viewing images;
- keeps the default page implementation Astro-only;
- uses Tailwind CSS v4 for styling;
- uses JetBrains Mono as the site's primary font;
- fits the current simple/technical style of the existing homepage;
- remains fast on mobile and desktop;
- keeps the original full-resolution images private from normal page delivery;
- keeps the DOM order predictable for PhotoSwipe and keyboard navigation.

The ideal content workflow is:

```text
edit/export photo
      ↓
copy JPG/PNG into src/assets/portfolio/
      ↓
rename with numeric ordering prefix
      ↓
git commit / build
      ↓
Astro discovers the image automatically
      ↓
Astro creates gallery + lightbox derivatives
      ↓
image appears in /portfolio
```

No gallery JSON, database, CMS, or content collection should be required for v1.

---

# 2. Non-goals for v1

Do **not** add these unless the requirements change:

- separate portfolio projects/shoot pages;
- category filtering;
- infinite scrolling;
- image uploads through an admin interface;
- external image CDN;
- Cloudinary/ImageKit;
- SolidJS gallery island;
- React gallery dependencies;
- JavaScript-based lazy-loading library;
- manually maintained image import list;
- captions for every image;
- complicated transitions;
- fullscreen custom gallery implementation;
- metadata database;
- client-side image sorting.

If any of these become useful later, the current structure should allow them to be added without rewriting the image pipeline.

---

# 3. Recommended stack

```text
Astro
Tailwind CSS v4
JetBrains Mono
astro:assets
import.meta.glob()
PhotoSwipe
tiny vanilla TypeScript masonry script
```

Preferred dependency footprint:

```text
Astro              existing
Tailwind            existing
PhotoSwipe          new
Masonry package     none by default
SolidJS             not required for portfolio
```

SolidJS can remain available elsewhere in the project, but the portfolio should not need it.

---

# 4. Proposed file structure

```text
src/
├─ assets/
│  └─ portfolio/
│     ├─ 001-band-live.jpg
│     ├─ 002-portrait-name.jpg
│     ├─ 003-automotive-detail.jpg
│     ├─ 004-event-stage.jpg
│     └─ ...
│
├─ components/
│  └─ portfolio/
│     ├─ PortfolioGallery.astro
│     └─ PortfolioImage.astro
│
├─ scripts/
│  └─ portfolio-masonry.ts
│
└─ pages/
   └─ portfolio.astro
```

The exact split between `PortfolioGallery.astro`, `PortfolioImage.astro`, and the script can be adjusted if a simpler single-component implementation is cleaner.

Do not move portfolio originals into `public/`.

Keeping them under `src/assets/` ensures they pass through Astro's image pipeline instead of being served as raw originals.

---

# 5. Image naming and ordering

Use a numeric prefix to control portfolio order:

```text
001-electric-callboy-live.jpg
002-red-portrait.jpg
003-bmw-night.jpg
010-stage-detail.jpg
020-landscape.jpg
```

The filename should provide two things:

1. sort order;
2. a usable human-readable fallback description.

Recommended convention:

```text
NNN-short-descriptive-name.ext
```

Example:

```text
014-electric-callboy-stage-wuerzburg.jpg
```

The numeric prefix should be removed before deriving any human-readable text.

Sorting must be **numeric-aware**, so:

```text
2
10
20
```

does not accidentally become:

```text
10
2
20
```

Use `localeCompare(..., { numeric: true })` or equivalent.

---

# 6. Automatic discovery

`PortfolioGallery.astro` should discover images using `import.meta.glob()`.

Conceptually:

```ts
const modules = import.meta.glob(
  '/src/assets/portfolio/*.{jpg,jpeg,png,webp}',
  {
    eager: true,
  }
);
```

The returned modules should be normalized into an internal list containing at least:

```ts
type PortfolioEntry = {
  path: string;
  image: ImageMetadata;
  order: number;
  fallbackAlt: string;
};
```

No manually maintained array should be necessary.

The build should fail loudly or log a clear warning for unsupported/invalid files rather than silently skipping unexpected formats if practical.

---

# 7. Alt text strategy

The gallery should not require a metadata file just to add an image.

For v1:

1. derive a fallback alt description from the filename;
2. remove the numeric prefix;
3. replace `-` / `_` with spaces;
4. normalize capitalization as needed.

Example:

```text
014-electric-callboy-stage-wuerzburg.jpg
```

becomes approximately:

```text
Electric Callboy stage Würzburg
```

This is better than empty alt text for meaningful portfolio content.

If specific images need better descriptions later, allow an **optional override map** without making it mandatory:

```ts
const altOverrides = {
  '014-electric-callboy-stage-wuerzburg.jpg':
    'Electric Callboy performing live on stage in Würzburg',
};
```

Do not introduce a sidecar JSON/content collection in v1 unless manual metadata grows beyond a few overrides.

---

# 8. Responsive image pipeline

## 8.1 Originals

Source images may be large exported JPG/PNG files, e.g.:

```text
6000 × 4000
10–20 MB
```

These originals are build inputs only.

They should **never be linked directly from the public gallery**.

---

## 8.2 Gallery derivatives

Astro should generate responsive gallery images.

Recommended width candidates:

```text
320
480
640
960
```

Possible later extension:

```text
1280
```

only if the layout or very high-DPI desktop displays justify it.

The browser should receive a real `srcset` and `sizes` declaration rather than a single fixed image.

Suggested logical `sizes` behavior:

```text
phone             ~100vw
small tablet      ~50vw
desktop           ~33vw
wide desktop      ~25vw
```

The exact CSS/container padding must be reflected in the final `sizes` value.

Do not blindly use a generic `100vw` `sizes` value for all breakpoints, because masonry columns mean each image is often much narrower than the viewport.

Use Astro's `Image` / `astro:assets` pipeline to produce the derivatives.

Preferred output format for v1:

```text
WebP
```

Possible future enhancement:

```text
AVIF + WebP fallback
```

if the extra build cost is worth the slightly smaller image sizes.

Do not complicate v1 just to support both formats if WebP already meets performance targets.

---

## 8.3 Lightbox derivatives

PhotoSwipe should **not** open the full original image.

Generate a second set of larger derivatives specifically for PhotoSwipe.

Recommended widths:

```text
1200
1800
2400
```

Optional upper tier:

```text
3000
```

only if image quality on large/high-DPI displays or zoom behavior visibly benefits from it.

Never upscale.

For an original narrower than a target width, only generate valid widths up to the source width.

Example:

```text
source: 2048px wide

lightbox candidates:
1200
1800
2048
```

not:

```text
1200
1800
2400  ← do not upscale
```

Each PhotoSwipe anchor should receive:

```text
href=<default large image>
data-pswp-width=<generated width>
data-pswp-height=<generated height>
data-pswp-srcset=<responsive large sources>
```

The image aspect ratio must come from Astro's source metadata rather than measuring the image after load.

---

# 9. Preferred masonry implementation

## Decision

Use a **tiny vanilla TypeScript masonry enhancer**.

Do not use SolidJS for v1.

Do not add a masonry dependency unless the custom implementation becomes unexpectedly complicated.

Why this works well here:

- image dimensions are already available during the Astro build;
- no image measurement is required after load;
- masonry only needs to place boxes of known aspect ratio;
- the image list is static;
- no drag/drop;
- no dynamic filters;
- no infinite loading;
- PhotoSwipe benefits from retaining logical DOM order.

---

# 10. Masonry algorithm

The gallery DOM should remain in logical image order:

```text
001
002
003
004
005
...
```

The masonry script should only change **visual placement**.

Recommended algorithm:

1. read container width;
2. determine column count;
3. determine column width;
4. maintain an array of current column heights;
5. iterate images in DOM order;
6. calculate rendered height from known aspect ratio;
7. place the next image into the shortest column;
8. update that column's height;
9. set final gallery container height.

Conceptually:

```text
columns = [0, 0, 0]

image 1 → shortest column 0
image 2 → shortest column 1
image 3 → shortest column 2
image 4 → whichever is now shortest
...
```

Visual position can be applied using:

```css
position: absolute;
transform: translate(...);
```

The container should be:

```css
position: relative;
```

This keeps visual movement performant.

---

# 11. Column count

Recommended layout:

```text
mobile          1 column
small/tablet    2 columns
desktop         3 columns
wide desktop    4 columns
```

Possible target breakpoints:

```text
< 640px          1
640–1023px       2
1024–1535px      3
>= 1536px        4
```

The exact breakpoints should match the rest of the site's responsive system.

Prefer avoiding duplicated breakpoint logic between TypeScript and CSS.

Good options:

### Option A — CSS custom property

CSS controls:

```css
--portfolio-columns: 1;
```

with media queries changing it to `2`, `3`, `4`.

JavaScript reads the computed value.

This keeps responsive rules primarily in CSS.

### Option B — compute from container width

Use:

```text
minimum desired column width
+
maximum column count
```

and calculate the number of columns from available width.

This is more fluid and avoids explicit breakpoint duplication.

For the existing site, Option A is probably easier to reason about because the intended column counts are already known.

---

# 12. Gutter

Recommended starting gutter:

```text
8–12px mobile
10–14px desktop
```

A constant `12px` is a good first implementation.

The gallery should feel like a photography wall, not a set of UI cards.

Avoid:

- huge spacing;
- 24–32px card gaps;
- card backgrounds;
- obvious borders around every image.

---

# 13. Resize handling

Use `ResizeObserver` on the gallery container rather than relying only on:

```ts
window.addEventListener('resize', ...)
```

This makes the layout respond correctly if the surrounding site layout changes for reasons other than viewport resizing.

Pseudo-flow:

```ts
layout();

const observer = new ResizeObserver(() => {
  layout();
});

observer.observe(container);
```

The layout function should be inexpensive enough that complex throttling is probably unnecessary.

If resize events produce excessive calls, schedule layout through one `requestAnimationFrame`.

---

# 14. No-JS / loading fallback

The portfolio should remain usable if masonry JavaScript has not executed.

Preferred fallback:

```text
CSS columns
```

using approximately the same column counts.

Example concept:

```text
default:
CSS columns masonry

after JS initialization:
custom positioned masonry
```

The enhancer can set:

```html
data-masonry-enhanced
```

on the container.

CSS can then disable column layout and enable positioned layout.

Benefits:

- useful layout without JavaScript;
- useful layout if script fails;
- progressive enhancement;
- no blank page during load.

A minor initial reflow from CSS columns into enhanced masonry is acceptable if it is small.

If the reflow becomes visually annoying, optimize the initial state later rather than hiding the whole gallery during page load.

---

# 15. Why custom masonry instead of CSS columns only

CSS columns are a perfectly valid v1 fallback and should remain available.

The custom enhancer is preferred because CSS columns visually flow down each column.

Example:

```text
DOM order:
1 2 3 4 5 6 7 8 9

CSS column visual layout:

1   4   7
2   5   8
3   6   9
```

PhotoSwipe still follows DOM order:

```text
1 → 2 → 3 → 4
```

That can make next/previous navigation feel disconnected from the apparent left-to-right gallery ordering.

The custom masonry keeps logical DOM order while independently balancing the visual columns.

---

# 16. Package fallback options

If the custom implementation starts accumulating edge-case logic, replace it rather than over-engineering it.

Preferred package fallback order:

## 1. MiniMasonry

Good default package fallback.

Reasons:

- focused purpose;
- framework-independent;
- zero dependency style;
- responsive;
- small enough that bundle size is not important here.

## 2. `@unri/masonry`

Alternative if minimal bundle size is the main criterion.

## 3. Solid primitive/component

Only if the portfolio later becomes genuinely reactive.

Examples of requirements that would justify Solid:

- filtering by category;
- live sorting;
- animated filtering;
- dynamically adding/removing images;
- infinite loading;
- user-controlled layout options.

Do **not** hydrate Solid just to place a static list of images.

---

# 17. PhotoSwipe integration

Install/use PhotoSwipe as the only interactive gallery dependency.

Responsibilities:

```text
Astro:
image discovery
image optimization
responsive assets
HTML

masonry script:
visual layout only

PhotoSwipe:
lightbox
keyboard navigation
swipe
zoom
close/back behavior
large responsive image loading
```

Each `PortfolioImage.astro` should output roughly:

```text
<a PhotoSwipe metadata>
    <Astro responsive image>
</a>
```

The anchor is important because the gallery should still degrade into normal links if PhotoSwipe is unavailable.

PhotoSwipe core should be dynamically imported where practical so it does not inflate the initial page unnecessarily.

---

# 18. PhotoSwipe navigation order

PhotoSwipe navigation should follow filename/DOM order.

Example:

```text
001 → 002 → 003 → 004
```

The visual masonry algorithm must not reorder DOM nodes.

It may position them visually, but source order should remain unchanged.

This provides predictable:

- next/previous navigation;
- keyboard navigation;
- accessibility tree order;
- tab order.

---

# 19. Astro navigation / view transitions consideration

If the site uses normal full-page Astro navigation:

```text
initialize PhotoSwipe once on page load
```

is sufficient.

If Astro client-side navigation / view transitions are introduced, initialization must be idempotent.

Use the relevant Astro page-load lifecycle and ensure an old PhotoSwipe instance is destroyed before creating a new one.

Avoid duplicate event handlers after navigating:

```text
home → portfolio → home → portfolio
```

This should be explicitly tested.

---

# 20. Portfolio page visual design

The new page should look like it belongs to the current site.

Do not create a separate photography-brand aesthetic.

Carry over:

- site header/navigation;
- simple spacing system;
- technical/minimal personality;
- mono typography;
- restrained use of color;
- current site structure where appropriate.

But allow the portfolio content to be wider than text-heavy pages.

The gallery should use substantially more horizontal space than the homepage's normal reading-width sections.

---

# 21. Typography

Switch the site toward:

```text
JetBrains Mono
```

as planned.

Suggested hierarchy:

```text
// PORTFOLIO
small uppercase / muted / tracked

SELECTED PHOTOGRAPHY
large but restrained heading

short intro
small/medium mono text

gallery
dominant visual content
```

Example tone:

```text
// PORTFOLIO

SELECTED PHOTOGRAPHY

A curated selection of live music, portraits,
events, automotive and personal work.
```

Avoid overusing terminal/developer jokes.

A small amount of technical labeling fits the brand.

Too much faux-terminal UI would become gimmicky.

---

# 22. Theme

The light/dark toggle may be removed.

The portfolio implementation must not depend on the toggle existing.

A single theme is acceptable.

If choosing dark:

- use a neutral near-black rather than blue developer-dark;
- keep the background neutral so photo color is not perceptually tinted;
- avoid pure black if a slightly softer dark fits the site better.

Example direction:

```text
background   #0b0c0c
surface      #111212
text         #ededed
muted        #888c8c
border       #242626
```

These values are only a starting direction, not a mandatory palette.

If the final site becomes light-only, the same gallery architecture still works.

---

# 23. Image presentation

Images should:

- retain original aspect ratio;
- use no arbitrary square crop;
- have very little surrounding UI;
- fill their calculated masonry column width;
- have intrinsic dimensions;
- avoid layout shift;
- use subtle hover feedback only.

Possible hover:

```text
slight opacity change
OR
~1% scale
```

Keep it understated.

Do not combine:

```text
large zoom
strong overlay
heavy shadow
bright border
caption animation
```

all at once.

---

# 24. Corners and card styling

Default recommendation:

```text
little or no border radius
```

The images should not look like dashboard cards.

If the rest of the redesigned site uses subtle rounding, a very small radius can be shared.

Avoid:

```text
rounded-2xl
rounded-3xl
large cards
glassmorphism
```

for the portfolio wall.

---

# 25. Loading strategy

The first visible images should appear quickly.

Recommended behavior:

- first few likely-above-the-fold images may load eagerly;
- all subsequent gallery images use native lazy loading;
- do not mark every image high priority;
- do not preload the entire gallery;
- PhotoSwipe large images should load only when required.

A sensible initial heuristic:

```text
first 2–4 images:
normal/eager based on actual layout

rest:
loading="lazy"
```

Measure rather than over-optimize this upfront.

---

# 26. CLS / layout stability

Astro already knows source width and height.

Use these dimensions from the beginning so the gallery can calculate item boxes without waiting for image decoding.

The masonry enhancer should therefore be able to position all items immediately.

Do not implement a system that waits for:

```text
img.onload
```

before first layout unless a real browser issue requires it.

Known image aspect ratios are one of the primary reasons the custom masonry implementation can remain tiny.

---

# 27. Build-time cost

The page intentionally generates multiple image variants.

For each original, expect approximately:

```text
gallery:
320
480
640
960

lightbox:
1200
1800
2400
```

Not every source will generate every width.

With ~20–60 curated images this is entirely reasonable for a static portfolio.

If the portfolio grows into hundreds or thousands of originals and build times become annoying, revisit:

- hosted media;
- image CDN;
- cache strategy;
- remote source images.

Do not introduce that complexity before it is needed.

---

# 28. Original asset safety

The full-resolution source should not be used as the PhotoSwipe link.

Only generated derivatives should be exposed by the normal page.

This has several benefits:

- lower bandwidth;
- faster lightbox;
- less trivial access to full original exports;
- fewer accidental huge downloads.

This is not DRM and should not be presented as copy protection.

Anything displayed on the web can still be copied.

---

# 29. Optional future anti-AI processing

The portfolio pipeline may later include a pre-build image transformation step for Glaze/Nightshade-like experiments or other protective derivatives.

That is outside the scope of this portfolio implementation.

The architecture should keep the input folder clear enough that a future pipeline could become:

```text
raw originals
      ↓
pre-build transform
      ↓
portfolio assets
      ↓
Astro derivatives
```

Do not couple masonry/gallery code to that concern.

---

# 30. Suggested component responsibilities

## `pages/portfolio.astro`

Responsibilities:

- page layout;
- SEO title/description;
- portfolio heading/introduction;
- render `PortfolioGallery`.

Should not contain image processing logic.

---

## `PortfolioGallery.astro`

Responsibilities:

- discover source files;
- normalize metadata;
- sort by filename/order;
- create fallback alt text;
- render all `PortfolioImage` components;
- attach gallery-level PhotoSwipe/masonry selectors.

Should not contain large amounts of styling logic if it can remain in Tailwind/CSS.

---

## `PortfolioImage.astro`

Responsibilities:

- receive one `ImageMetadata`;
- generate gallery responsive derivatives;
- generate PhotoSwipe responsive derivatives;
- output anchor + image;
- add intrinsic width/height/aspect information;
- add PhotoSwipe metadata;
- expose masonry metadata.

Suggested conceptual props:

```ts
interface Props {
  image: ImageMetadata;
  alt: string;
  index: number;
}
```

---

## `portfolio-masonry.ts`

Responsibilities:

- initialize gallery;
- read item aspect ratios;
- calculate balanced visual positions;
- react to container resize;
- apply enhanced state;
- set container height.

It must **not**:

- fetch data;
- reorder DOM nodes;
- modify image URLs;
- manage PhotoSwipe;
- load images;
- depend on Solid.

---

# 31. Suggested markup contract

Example conceptual output:

```html
<div
  id="portfolio-gallery"
  data-masonry
  data-pswp-gallery
>
  <a
    data-masonry-item
    data-image-width="6000"
    data-image-height="4000"
    href="/generated/lightbox-2400.webp"
    data-pswp-width="2400"
    data-pswp-height="1600"
    data-pswp-srcset="..."
  >
    <img
      src="..."
      srcset="..."
      sizes="..."
      width="..."
      height="..."
      alt="..."
    >
  </a>
</div>
```

Prefer `data-*` hooks for JavaScript behavior rather than styling classes.

Example:

```text
[data-masonry]
[data-masonry-item]
```

Tailwind classes can then change without breaking the script.

---

# 32. JavaScript size target

The custom masonry code should remain tiny.

Target:

```text
~30–80 lines of TypeScript
```

not:

```text
a home-grown layout framework
```

If it becomes significantly more complicated than that, switch to MiniMasonry instead.

The point of the custom implementation is simplicity, not avoiding dependencies at all costs.

---

# 33. Accessibility

Minimum requirements:

- meaningful image alt text;
- anchor remains keyboard-focusable;
- PhotoSwipe keyboard navigation works;
- Escape closes lightbox;
- focus returns sensibly after closing;
- visible focus state is preserved;
- DOM order remains logical;
- no mouse-only behavior.

Do not remove outlines globally.

Any hover visual should have a reasonable focus equivalent.

---

# 34. SEO

Portfolio page should include:

- unique page title;
- concise meta description;
- canonical URL through existing site infrastructure;
- useful image alt text.

Optional later:

- Open Graph preview;
- `ImageObject` / gallery structured data only if there is a clear SEO benefit.

Do not over-engineer structured data for v1.

---

# 35. Performance targets

The page should aim for:

- minimal JavaScript before opening the lightbox;
- no Solid hydration;
- no raw originals downloaded by the gallery;
- responsive image selection;
- lazy-loaded below-the-fold images;
- stable dimensions;
- no masonry layout thrash;
- PhotoSwipe loaded only as needed where practical.

Useful checks:

```text
Lighthouse mobile
Chrome network panel
layout shift visualization
CPU throttling
real phone
large desktop
```

---

# 36. Responsive test matrix

At minimum test approximately:

```text
390px phone
430px phone
768px tablet
1024px laptop/tablet landscape
1440px desktop
1920px desktop
```

Check:

- correct number of columns;
- no overlaps;
- correct gutters;
- images remain sharp;
- no unnecessary huge image transfers;
- PhotoSwipe opens correct image;
- next/previous follows expected order;
- resize does not break container height.

---

# 37. Image-type test matrix

Include:

```text
very tall portrait
normal portrait
square-ish image
3:2 landscape
16:9-ish landscape
very wide crop
small source image
large source image
PNG
JPG
```

Make sure:

- no upscaling;
- no broken width/height metadata;
- masonry balances correctly;
- PhotoSwipe dimensions remain correct.

---

# 38. Failure/edge cases

Handle or consciously accept:

### Empty portfolio folder

Show either:

```text
nothing
```

or a small development-only message.

Do not crash the whole site if avoidable.

### One image

Should render normally without awkward masonry assumptions.

### Very small source

Do not generate larger variants than the original.

### Duplicate numeric prefixes

Still use full filename sort as stable tie-breaker.

### Unsupported files

Ignore with a clear development warning or document supported formats.

### SVG

Do not treat as photography source input for v1.

---

# 39. Suggested implementation phases

## Phase 1 — page shell

- create `/portfolio`;
- reuse site header/nav;
- add portfolio heading;
- switch/integrate JetBrains Mono if done globally;
- establish wide gallery container.

Success criteria:

```text
portfolio page visually belongs to the site
```

---

## Phase 2 — automatic image discovery

- create `src/assets/portfolio`;
- add sample portrait and landscape images;
- implement `import.meta.glob`;
- numeric filename sorting;
- fallback alt generation.

Success criteria:

```text
dropping a new image into the folder makes it appear automatically
```

---

## Phase 3 — Astro image pipeline

- gallery width variants;
- correct `sizes`;
- WebP output;
- lazy/eager strategy;
- intrinsic dimensions.

Success criteria:

```text
browser network panel shows appropriately sized images
```

---

## Phase 4 — PhotoSwipe derivatives

- create large variants;
- build `data-pswp-srcset`;
- initialize PhotoSwipe;
- test zoom/swipe/keyboard.

Success criteria:

```text
lightbox never needs the original full-resolution file
```

---

## Phase 5 — masonry

Start with CSS columns as the fallback.

Then add custom TypeScript layout:

- known aspect ratios;
- shortest-column placement;
- `ResizeObserver`;
- enhanced state;
- preserve DOM order.

Success criteria:

```text
balanced masonry + predictable PhotoSwipe order
```

---

## Phase 6 — polish

- exact gaps;
- hover/focus;
- final page width;
- mobile spacing;
- theme alignment;
- heading styling;
- reduced-motion behavior if needed.

---

## Phase 7 — performance pass

- Lighthouse;
- network image size inspection;
- test on actual mobile device;
- ensure no huge source files are delivered;
- verify no duplicate PhotoSwipe initialization;
- check CLS.

---

# 40. Acceptance criteria

The portfolio is complete for v1 when all of the following are true:

- [ ] `/portfolio` exists.
- [ ] The page visually matches the existing site.
- [ ] JetBrains Mono integration fits the page.
- [ ] Images live in `src/assets/portfolio`.
- [ ] A new image appears without manually editing an image array.
- [ ] Numeric filename prefixes determine order.
- [ ] Mixed portrait and landscape images work.
- [ ] Astro generates responsive gallery derivatives.
- [ ] Gallery images use correct `srcset` / `sizes`.
- [ ] Astro generates larger PhotoSwipe derivatives.
- [ ] Full original files are not used as normal gallery/lightbox sources.
- [ ] Masonry works from mobile through wide desktop.
- [ ] DOM order remains logical.
- [ ] PhotoSwipe previous/next uses logical order.
- [ ] Keyboard navigation works.
- [ ] Gallery remains usable if masonry JS fails.
- [ ] No SolidJS hydration is required.
- [ ] No masonry dependency is required unless custom code becomes excessive.
- [ ] Below-the-fold images lazy load.
- [ ] Layout is stable with minimal/no CLS.
- [ ] Resize works without overlapping images.
- [ ] No image is upscaled.
- [ ] Lighthouse/network inspection shows no obviously oversized image downloads.

---

# 41. Explicit decision log

## Decided

```text
single portfolio page
curated images only
mixed aspect ratios
masonry layout
Astro-first
Tailwind v4
JetBrains Mono
PhotoSwipe
automatic file discovery
Astro-generated responsive images
separate gallery and lightbox derivatives
numeric filename ordering
custom tiny vanilla TS masonry preferred
CSS columns fallback
no SolidJS for v1
```

## Intentionally undecided

These choices can be finalized during visual implementation without affecting architecture:

```text
dark-only vs light-only vs custom theme
exact background color
exact gallery gutter
3 vs 4 columns on a given desktop breakpoint
2400 vs 3000 maximum lightbox width
WebP only vs AVIF + WebP
exact heading copy
exact hover treatment
```

## Deferred

```text
categories
filters
projects/shoot pages
captions
CMS
external image CDN
image upload UI
SolidJS gallery features
AI-protection preprocessing
```

---

# 42. Recommended final architecture

```text
src/assets/portfolio/*.jpg
          │
          │ import.meta.glob()
          ▼
   PortfolioGallery.astro
          │
          ├─────────────── sort / alt / metadata
          │
          ▼
    PortfolioImage.astro
          │
          ├── gallery responsive derivatives
          │      320 / 480 / 640 / 960
          │
          └── PhotoSwipe derivatives
                 1200 / 1800 / 2400
          │
          ▼
      static Astro HTML
          │
          ├── CSS columns fallback
          │
          ├── tiny vanilla masonry enhancer
          │
          └── PhotoSwipe lightbox
```

Client-side responsibilities remain deliberately small:

```text
masonry positioning
+
lightbox interaction
```

Everything else happens during the Astro build.

---

# 43. Guiding principle

When implementing the portfolio, prefer the simpler solution unless a visible problem justifies added complexity.

In particular:

```text
Astro before Solid
build-time before runtime
native browser behavior before libraries
small focused library before custom framework-like code
generated derivatives before raw originals
content before decoration
```

The portfolio should ultimately feel less like a "gallery component" and more like **the existing stefan-karger.de site opening up and letting the photography take over the page**.
