# LANGUAGE_PLAN.md

## Why these decisions were made

The site serves two relevant audiences:

- **German-speaking professional contacts** such as recruiters, employers, clients, and local business contacts.
- **International developer/open-source contacts** from GitHub, X/Twitter, SolidJS, Astro, and the wider web-development ecosystem.

Because of that, the site should support both German and English instead of forcing one language on everyone.

German is used as the default/root language because the professional market is currently Germany and the domain is `.de`. English is available under `/en/` and can be linked directly from GitHub, X/Twitter, open-source profiles, and similar international contexts.

Automatic redirects based on browser language are intentionally avoided. Instead, the German pages show a small English-language callout when the visitor's browser language is not German.

The implementation should stay close to normal Astro conventions:

- routes live in `src/pages/`
- shared UI lives in `src/components/`
- page shells live in `src/layouts/`
- translations live in `src/i18n/`
- language-independent structured data lives in `src/data/`
- future long-form content such as blog posts can use Astro Content Collections

The two languages must **not** result in two independently maintained websites. Layout and components are shared; only localized copy is duplicated.

---

# 1. Goals

The language setup should:

1. Present the site naturally to German visitors.
2. Be equally usable for international developers and open-source contacts.
3. Keep URLs stable and shareable.
4. Avoid unexpected language redirects.
5. Keep SEO explicit and predictable.
6. Keep translation overhead low.
7. Avoid duplicated page implementations.
8. Stay mostly Astro-native.
9. Remain fully static where possible.
10. Make later additions such as a blog easy.
11. Keep imports clean and consistent through a `@/` alias for `src/`.

---

# 2. v1 scope

The initial public version should intentionally stay small.

## Pages included in v1

```text
Home
Portfolio
```

Both exist in German and English:

```text
/
/portfolio/

/en/
/en/portfolio/
```

The homepage may contain sections such as:

```text
Hero
Links / social profiles
Selected projects
Career / experience
Testimonials / "what others say"
```

These are homepage sections, not standalone routes.

## Planned for later

The architecture should leave room for:

```text
Blog
individual blog posts
individual project pages / case studies
About
Contact
additional standalone pages
```

The blog should already be considered in the content and language architecture, but it is **not part of v1**.

Do not create placeholder routes just because they may exist later.

---

# 3. Language strategy

Supported locales:

```text
de
en
```

German is the default locale.

English is the secondary locale.

Recommended URL structure:

```text
/
├── portfolio/
│
└── en/
    └── portfolio/
```

Future expansion:

```text
/
├── portfolio/
├── projects/
├── blog/
│
└── en/
    ├── portfolio/
    ├── projects/
    └── blog/
```

Examples:

```text
https://stefan-karger.de/
https://stefan-karger.de/portfolio/

https://stefan-karger.de/en/
https://stefan-karger.de/en/portfolio/
```

Do not use:

```text
?lang=en
```

or:

```text
#en
```

The selected language must be represented directly by the URL.

---

# 4. Why German is the root language

Use:

```text
/      -> German
/en/   -> English
```

instead of:

```text
/      -> English
/de/   -> German
```

Reasons:

- the domain is `.de`
- the current professional market is primarily Germany
- German recruiters and local professional contacts are likely to open the bare domain
- German organic search traffic should naturally land on German content
- international profiles can explicitly link to `/en/`

Recommended usage:

```text
German CV / application
→ https://stefan-karger.de/

GitHub
→ https://stefan-karger.de/en/

X / Twitter
→ https://stefan-karger.de/en/

SolidJS / open-source profiles
→ https://stefan-karger.de/en/
```

---

# 5. No forced automatic language redirects

Do not implement:

```text
visitor opens /
Accept-Language = en
→ redirect to /en/
```

Reasons:

- browser language does not always equal user preference
- developers often use English browsers even when German is their preferred website language
- shared URLs should behave consistently
- redirects make debugging and SEO more complicated
- explicit URLs should always win

The rule is:

```text
/      always serves German
/en/   always serves English
```

The visitor remains in control.

---

# 6. Browser-language English callout

The English-language hint is part of v1.

It appears on German/default-locale pages only.

Behavior:

```text
visitor opens German page
        ↓
read browser preferred language
        ↓
language starts with "de"?
   ├── yes → no callout
   └── no  → show English callout
```

Example:

```text
Also available in English.
Switch to English →
```

The link should point to the equivalent English page whenever possible.

Examples:

```text
/
→ /en/

/portfolio/
→ /en/portfolio/
```

Implementation:

```ts
const preferredLanguage =
  navigator.languages?.[0] ?? navigator.language;

const shouldShowEnglishHint =
  !preferredLanguage.toLowerCase().startsWith("de");
```

Rules:

- hidden by default to prevent layout flash
- detected through a tiny browser script
- no geolocation
- no IP lookup
- no automatic redirect
- no SolidJS island required
- dismissible
- dismissal persisted with `sessionStorage` or `localStorage`
- should not appear repeatedly once dismissed
- only shown on German pages in v1
- no reverse German hint on English pages for v1

A small Astro component is sufficient:

```text
src/components/layout/LanguageCallout.astro
```

---

# 7. Manual language switch

Add a visible language switch to the main navigation/header.

Recommended:

```text
DE | EN
```

Avoid using flags as the only indicator.

The active language should be visually distinguishable.

Examples:

- stronger font weight
- underline
- accent treatment
- reduced emphasis for inactive language

The switch should use normal anchor links and work with JavaScript disabled.

Example markup:

```html
<nav aria-label="Language">
  <a href="/" lang="de" hreflang="de">DE</a>
  <a href="/en/" lang="en" hreflang="en">EN</a>
</nav>
```

---

# 8. Language switch behavior

Switching languages should preserve the equivalent page whenever possible.

Examples:

```text
/portfolio/
→ /en/portfolio/

/en/portfolio/
→ /portfolio/
```

Later:

```text
/projects/solid-ui/
→ /en/projects/solid-ui/
```

If no equivalent translation exists, fall back to the same section when possible.

Example:

```text
/blog/ein-deutscher-artikel/
```

has no English translation:

```text
→ /en/blog/
```

Fallback priority:

```text
equivalent translated page
        ↓
same section in target language
        ↓
target-language homepage
```

---

# 9. Import alias: `@/` for everything inside `src/`

All imports from within `src/` should use the `@/` alias.

Do not introduce imports such as:

```ts
../../components/home/Hero.astro
../../../i18n/pages/home
```

Use:

```ts
@/components/home/Hero.astro
@/i18n/pages/home
@/layouts/BaseLayout.astro
@/data/projects
```

The alias should map:

```text
@/
→ src/
```

Recommended TypeScript configuration:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Astro/Vite should resolve the alias through the project TypeScript configuration.

All examples in this plan assume this alias.

Do not mix:

```text
@/...
../...
../../...
```

for project-internal `src/` imports unless there is a very specific reason.

---

# 10. Recommended project structure

Recommended v1 structure:

```text
src/
├── assets/
│   └── images/
│
├── components/
│   ├── layout/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── LanguageSwitch.astro
│   │   └── LanguageCallout.astro
│   │
│   ├── home/
│   │   ├── Hero.astro
│   │   ├── Projects.astro
│   │   ├── Experience.astro
│   │   └── Testimonials.astro
│   │
│   └── portfolio/
│       ├── PortfolioGallery.astro
│       └── PortfolioItem.astro
│
├── data/
│   ├── projects.ts
│   ├── experience.ts
│   └── testimonials.ts
│
├── i18n/
│   ├── ui.ts
│   ├── utils.ts
│   │
│   └── pages/
│       ├── home.ts
│       └── portfolio.ts
│
├── layouts/
│   └── BaseLayout.astro
│
├── pages/
│   ├── index.astro
│   ├── portfolio.astro
│   │
│   └── en/
│       ├── index.astro
│       └── portfolio.astro
│
├── styles/
│   └── global.css
│
└── content.config.ts
```

`content.config.ts` may remain unused until Content Collections are introduced.

No `views/` directory is needed for v1.

---

# 11. Astro responsibility boundaries

Use the following rule of thumb.

| Concern | Location |
|---|---|
| URL / route | `src/pages/` |
| shared page shell | `src/layouts/` |
| reusable UI | `src/components/` |
| homepage-specific sections | `src/components/home/` |
| portfolio-specific UI | `src/components/portfolio/` |
| short UI translations | `src/i18n/ui.ts` |
| longer localized page copy | `src/i18n/pages/*.ts` |
| language helper functions | `src/i18n/utils.ts` |
| language-independent facts/data | `src/data/*.ts` |
| optimized local images | `src/assets/` |
| future blog/case-study content | Astro Content Collections |

The key principle:

> Components define presentation. Localized content defines copy. Data files define language-independent facts.

---

# 12. Do not create a `HomePage.astro` abstraction initially

For v1, the page routes can compose the homepage directly.

German:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";

import Hero from "@/components/home/Hero.astro";
import Projects from "@/components/home/Projects.astro";
import Experience from "@/components/home/Experience.astro";
import Testimonials from "@/components/home/Testimonials.astro";

import { home } from "@/i18n/pages/home";

const content = home.de;
---

<BaseLayout locale="de">
  <Hero content={content.hero} />
  <Projects content={content.projects} />
  <Experience content={content.experience} />
  <Testimonials content={content.testimonials} />
</BaseLayout>
```

English:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";

import Hero from "@/components/home/Hero.astro";
import Projects from "@/components/home/Projects.astro";
import Experience from "@/components/home/Experience.astro";
import Testimonials from "@/components/home/Testimonials.astro";

import { home } from "@/i18n/pages/home";

const content = home.en;
---

<BaseLayout locale="en">
  <Hero content={content.hero} />
  <Projects content={content.projects} />
  <Experience content={content.experience} />
  <Testimonials content={content.testimonials} />
</BaseLayout>
```

This small amount of route-level duplication is acceptable.

The actual implementation still exists only once:

```text
Hero.astro
Projects.astro
Experience.astro
Testimonials.astro
BaseLayout.astro
```

Only the route composition and selected locale are repeated.

---

# 13. When a page-level component becomes useful

Do not add abstraction only to eliminate a handful of repeated lines.

If the homepage composition later becomes substantially more complex, introduce:

```text
src/components/pages/HomePage.astro
```

Then routes may become:

```astro
---
import HomePage from "@/components/pages/HomePage.astro";
---

<HomePage locale="de" />
```

and:

```astro
---
import HomePage from "@/components/pages/HomePage.astro";
---

<HomePage locale="en" />
```

If this is introduced, use:

```text
components/pages/
```

rather than a custom `views/` directory.

For v1, start without it.

---

# 14. Astro i18n configuration

Use Astro's built-in internationalization routing.

Conceptual configuration:

```ts
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://stefan-karger.de",

  i18n: {
    locales: ["de", "en"],
    defaultLocale: "de",

    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

Expected routing:

```text
/               -> de
/portfolio/      -> de

/en/             -> en
/en/portfolio/   -> en
```

Prefer Astro-native i18n routing and helpers instead of building a custom router.

---

# 15. `src/i18n/ui.ts`

Use `ui.ts` for small recurring interface strings.

Examples:

```ts
export const languages = {
  de: "Deutsch",
  en: "English",
} as const;

export const defaultLang = "de";

export const ui = {
  de: {
    "nav.home": "Start",
    "nav.portfolio": "Portfolio",
    "language.switch": "Sprache wechseln",
    "gallery.next": "Nächstes Bild",
    "gallery.previous": "Vorheriges Bild",
  },

  en: {
    "nav.home": "Home",
    "nav.portfolio": "Portfolio",
    "language.switch": "Switch language",
    "gallery.next": "Next image",
    "gallery.previous": "Previous image",
  },
} as const;
```

Suitable content:

- navigation labels
- buttons
- form labels
- gallery labels
- accessibility labels
- small repeated UI messages

Do not put large page copy here.

---

# 16. `src/i18n/pages/home.ts`

Longer page-specific text belongs in dedicated page content files.

Recommended:

```text
src/i18n/pages/home.ts
src/i18n/pages/portfolio.ts
```

Example:

```ts
export const home = {
  de: {
    hero: {
      eyebrow: "Software Engineer & Fotograf",
      title: "...",
      intro: "...",
    },

    projects: {
      title: "Projekte",
      intro: "...",
    },

    experience: {
      title: "Werdegang",
    },

    testimonials: {
      title: "Was andere sagen",
    },
  },

  en: {
    hero: {
      eyebrow: "Software Engineer & Photographer",
      title: "...",
      intro: "...",
    },

    projects: {
      title: "Projects",
      intro: "...",
    },

    experience: {
      title: "Experience",
    },

    testimonials: {
      title: "What others say",
    },
  },
} as const;
```

For the current site size, keep both locales in the same page file.

Prefer:

```text
home.ts
```

over:

```text
home.de.ts
home.en.ts
```

until the content becomes large enough that separate files clearly improve maintainability.

---

# 17. Language-independent data

Do not duplicate facts that are identical in both languages.

Examples:

- company name
- dates
- URLs
- repository links
- technology names
- image references
- project identifiers
- social URLs

Store those in `src/data/`.

Example:

```ts
// src/data/experience.ts

export const experience = [
  {
    id: "rhein-gruppe",
    company: "Rhein Gruppe",
    from: 2014,
    to: null,
  },
];
```

Localized text belongs separately:

```ts
// src/i18n/pages/home.ts

export const home = {
  de: {
    experience: {
      title: "Werdegang",

      items: {
        "rhein-gruppe": {
          role: "Senior Software Engineer",
          description: "...",
        },
      },
    },
  },

  en: {
    experience: {
      title: "Experience",

      items: {
        "rhein-gruppe": {
          role: "Senior Software Engineer",
          description: "...",
        },
      },
    },
  },
};
```

This prevents factual data from drifting between translations.

---

# 18. Projects data

Use the same split for projects.

Shared:

```ts
// src/data/projects.ts

export const projects = [
  {
    id: "solid-ui",
    github: "...",
    url: "...",
    technologies: [
      "SolidJS",
      "TypeScript",
      "Tailwind CSS",
    ],
  },
];
```

Localized:

```ts
de: {
  projects: {
    items: {
      "solid-ui": {
        description: "...",
      },
    },
  },
},

en: {
  projects: {
    items: {
      "solid-ui": {
        description: "...",
      },
    },
  },
}
```

Do not translate:

```text
SolidJS
Astro
TypeScript
Tailwind CSS
project names
repository names
product names
company names
```

unless there is a genuine localized official name.

---

# 19. Testimonials

Testimonials are different from normal localized copy.

Original quotes should generally remain in their original language.

Recommended data:

```ts
export const testimonials = [
  {
    id: "...",
    author: "...",
    quote: "...",
    language: "en",
  },
];
```

Possible later enhancement:

```ts
translation?: "..."
```

Do not silently rewrite or translate quotations as if they were original wording.

The surrounding section title and labels should still be localized:

```text
Was andere sagen
What others say
```

---

# 20. `src/i18n/utils.ts`

Keep locale logic centralized.

Useful helpers:

```ts
type Locale = "de" | "en";

getLocaleFromUrl(url)
getAlternateLocale(locale)
getDictionary(locale)
getLocalizedPath(path, locale)
```

Prefer Astro's own i18n URL helpers where they fit.

Avoid scattering logic such as:

```ts
"/en/" + pathname
```

through components.

The language layer should remain small and predictable.

---

# 21. Internal links

Internal links should remain in the current locale by default.

German:

```text
/
→ /portfolio/
```

English:

```text
/en/
→ /en/portfolio/
```

Use centralized locale helpers rather than manual string concatenation.

---

# 22. Technical terminology on German pages

Do not force awkward German translations for established development terminology.

Natural:

```text
Ich entwickle Webanwendungen mit SolidJS, Astro und TypeScript.
```

Keep common technical terms when that is how developers normally speak.

Examples:

```text
Frontend
Backend
Framework
Build
Routing
Deployment
Open Source
Design System
Component Library
Server Rendering
```

The German version should sound like natural technical German, not literal translation.

---

# 23. Translation style

German and English do not need to be sentence-by-sentence translations.

Goal:

```text
same meaning
same facts
same personality
natural language
```

not:

```text
literal translation
```

The English version may follow the tone common in developer portfolios and open-source profiles.

The German version may be slightly more direct and factual.

Both should still clearly sound like the same person.

---

# 24. HTML language metadata

Every page must use the correct `lang`.

German:

```html
<html lang="de">
```

English:

```html
<html lang="en">
```

`BaseLayout.astro` should receive the locale:

```astro
<BaseLayout locale="de">
```

or:

```astro
<BaseLayout locale="en">
```

and set the document language accordingly.

---

# 25. Localized metadata

Titles and descriptions should be localized.

German:

```text
Portfolio | Stefan Karger
```

English:

```text
Portfolio | Stefan Karger
```

Homepage descriptions should differ by language.

Example:

German:

```text
Softwareentwicklung, Open Source und ausgewählte Fotografieprojekte von Stefan Karger.
```

English:

```text
Software development, open-source work and selected photography projects by Stefan Karger.
```

Do not reuse German descriptions on English pages.

---

# 26. Canonical URLs

Each page should canonicalize to itself.

German:

```html
<link
  rel="canonical"
  href="https://stefan-karger.de/portfolio/"
/>
```

English:

```html
<link
  rel="canonical"
  href="https://stefan-karger.de/en/portfolio/"
/>
```

Do not canonicalize the English page to the German page.

Localized equivalents are separate valid pages.

---

# 27. `hreflang`

Pages that exist in both languages should emit reciprocal language alternates.

Example:

```html
<link
  rel="alternate"
  hreflang="de"
  href="https://stefan-karger.de/portfolio/"
/>

<link
  rel="alternate"
  hreflang="en"
  href="https://stefan-karger.de/en/portfolio/"
/>
```

Optionally:

```html
<link
  rel="alternate"
  hreflang="x-default"
  href="https://stefan-karger.de/portfolio/"
/>
```

For v1, all actual pages have both languages.

Later, do not emit fake alternate URLs for untranslated blog posts.

---

# 28. Sitemap

The sitemap should include both locales.

v1:

```text
/
/portfolio/
/en/
/en/portfolio/
```

Future pages should be added normally.

Use an Astro sitemap integration where appropriate.

---

# 29. Open Graph metadata

Localized pages should use localized Open Graph metadata.

German:

```html
<meta property="og:locale" content="de_DE" />
```

English:

```html
<meta property="og:locale" content="en_US" />
```

or another consistent English locale.

Social preview images can be shared when they contain no localized text.

If a preview image contains language-specific copy, use separate images per locale.

---

# 30. Portfolio page

The visual gallery itself should stay language-neutral where possible.

Shared:

```text
images
image metadata
dimensions
gallery behavior
lightbox behavior
PhotoSwipe integration
```

Localized:

```text
page title
intro copy
category names where necessary
accessibility labels
UI labels
captions if they contain prose
```

Do not duplicate image assets for each language unless the image itself contains localized text.

---

# 31. Future blog architecture

The blog is not part of v1 but should fit naturally later.

Blog posts may be:

```text
German only
English only
both languages
```

Do not require every article to be translated.

Likely English-only technical topics:

```text
Building a masonry gallery in Astro
SolidJS component patterns
Astro image pipelines
Thoughts on TanStack Start
```

Possible German-only topics:

```text
Germany-specific professional topics
local photography topics
German business/freelancing topics
```

---

# 32. Future Content Collections

Use Astro Content Collections for actual collections of long-form content.

Good candidates:

```text
Blog posts
Project case studies
Photography sets / shoots
```

Possible later structure:

```text
src/content/
└── blog/
    ├── de/
    │   └── example.mdx
    │
    └── en/
        └── example.mdx
```

Do not use Content Collections merely for:

```text
nav.home
hero.title
gallery.next
```

Those belong in `src/i18n/`.

---

# 33. Future translation relationships

For content such as blog posts or project case studies, use an explicit shared identifier.

Example frontmatter:

```yaml
locale: en
translationKey: astro-masonry
```

German counterpart:

```yaml
locale: de
translationKey: astro-masonry
```

Do not rely only on filenames to associate translations.

---

# 34. Missing translations later

Missing translations should be valid for optional content.

Rules:

```text
Home:
both languages required

Portfolio:
both languages required

Blog posts:
translation optional

Future featured project pages:
translation strongly recommended

Secondary long-form content:
translation optional
```

Do not make the whole build fail because one blog post has no translation.

---

# 35. Accessibility

Requirements:

- correct `<html lang="">`
- language switch has an accessible label
- `hreflang` on language links
- active language is not indicated by color alone
- callout can be dismissed with keyboard input
- standard links work without JavaScript
- gallery controls have localized accessible labels

---

# 36. 404 behavior

Prefer locale-aware 404 output later.

Example:

```text
/en/does-not-exist
→ English 404
```

Default paths:

```text
/does-not-exist
→ German 404
```

If that introduces disproportionate complexity for v1, a compact bilingual 404 is acceptable.

---

# 37. RSS later

When the blog is introduced, prefer separate feeds.

Example:

```text
/rss.xml
→ German

/en/rss.xml
→ English
```

A combined feed may be added later if useful.

---

# 38. Search later

If search is ever introduced:

- search the current language by default
- do not silently mix locales
- label results from another language clearly

Search is not needed for v1.

---

# 39. Analytics

Where useful, track locale as part of analytics.

Interesting comparisons:

```text
German vs English landing traffic
GitHub → /en/
organic German search → /
language switch usage
English callout usage
portfolio engagement by locale
```

Do not add invasive tracking only for language selection.

---

# 40. Migration from the current site

Recommended process:

1. inventory current pages and inbound URLs
2. define final v1 routes
3. map old URLs to new German routes
4. add redirects when paths change
5. implement shared components
6. implement German page content
7. implement English page content
8. add language switch
9. add browser-language callout
10. add canonical URLs
11. add `hreflang`
12. add sitemap
13. test both language trees

Do not preserve old architecture merely for compatibility.

Preserve valuable URLs where reasonable.

---

# 41. Redirect rules

Old German URLs should redirect to equivalent new German URLs.

Do not redirect old German URLs to English.

Example:

```text
old German page
→ new German page
```

Language remains semantically consistent.

---

# 42. Testing checklist

Manual testing:

```text
[ ] / loads German
[ ] /en/ loads English

[ ] /portfolio/ loads German
[ ] /en/portfolio/ loads English

[ ] HTML lang is correct
[ ] navigation labels are correct
[ ] DE / EN switch works
[ ] equivalent page is preserved when switching

[ ] German internal links remain German
[ ] English internal links remain English

[ ] non-German browser shows English callout on German pages
[ ] German browser does not show callout
[ ] callout dismissal persists
[ ] callout does not redirect automatically

[ ] canonical URL is correct
[ ] hreflang is reciprocal
[ ] sitemap contains both locales
[ ] metadata is localized
[ ] gallery accessibility labels are localized
```

---

# 43. Automated tests

Useful lightweight tests:

```text
locale helper tests
localized path tests
dictionary completeness tests
required-page translation tests
```

Example:

```ts
getLocalizedPath("/portfolio/", "en");
// "/en/portfolio/"

getLocalizedPath("/en/portfolio/", "de");
// "/portfolio/"
```

Core v1 translations may fail tests if missing.

Optional future blog translations should not.

---

# 44. Build-time safeguards

Useful warnings/errors:

```text
Missing English homepage copy
Missing German portfolio copy
Unknown locale key
Broken localized route mapping
Missing required UI translation
```

Core v1 content:

```text
error
```

Optional future content:

```text
warning
```

---

# 45. v1 implementation checklist

Implement now:

```text
[x] German default locale
[x] English locale
[x] /en/ prefix
[x] @/ alias for src/
[x] Home in both languages
[x] Portfolio in both languages
[x] shared components
[x] shared BaseLayout
[x] localized page content
[x] language-independent data layer
[x] manual DE / EN switch
[x] browser-language English callout
[x] localized navigation
[x] localized metadata
[x] canonical URLs
[x] hreflang
[x] sitemap
[x] locale helpers
```

Plan for later:

```text
[ ] Blog index
[ ] Blog posts
[ ] Content Collections
[ ] optional per-post translations
[ ] project case studies
[ ] dedicated project routes
[ ] RSS
[ ] site search
```

Do not initially implement:

```text
[ ] automatic language redirects
[ ] IP/geolocation language detection
[ ] runtime translation API
[ ] machine translation
[ ] large external i18n framework
[ ] multilingual search
[ ] translation-management CMS
```

---

# 46. Final architecture summary

```text
                         stefan-karger.de
                                │
                ┌───────────────┴───────────────┐
                │                               │
             German                           English
          default locale                    /en/ locale
                │                               │
       ┌────────┴────────┐             ┌────────┴────────┐
       │                 │             │                 │
      Home           Portfolio        Home           Portfolio
       │                 │             │                 │
       └──────── shared Astro components ────────────────┘
                         │
               shared language-neutral data
                         │
                    localized copy
```

Project structure:

```text
pages
→ routes only

layouts
→ shared page shell

components
→ reusable visual implementation

data
→ language-independent facts

i18n/ui.ts
→ short shared UI strings

i18n/pages/*
→ localized page copy

content/
→ future long-form collections
```

---

# 47. Final recommendation

The portfolio should be a German-first website with a complete English counterpart.

The site must not behave like two separate implementations.

Instead:

```text
shared layout
+ shared components
+ shared structured data
+ localized copy
+ locale-specific routes
```

German:

```text
https://stefan-karger.de/
https://stefan-karger.de/portfolio/
```

English:

```text
https://stefan-karger.de/en/
https://stefan-karger.de/en/portfolio/
```

Navigation uses a normal:

```text
DE | EN
```

language switch.

German pages additionally show a small English availability callout when the browser's preferred language is not German.

No automatic language redirects are used.

All project-internal imports under `src/` use:

```text
@/...
```

rather than relative chains such as:

```text
../../...
```

This keeps the Astro implementation simple, predictable, close to normal Astro conventions, easy to maintain, and ready for the later blog expansion without overengineering v1.
