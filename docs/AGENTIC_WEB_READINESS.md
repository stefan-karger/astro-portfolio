# Agentic Web Readiness Guide

> Project reference for reviewing websites and web applications for agentic use.
>
> Goal: Make the site easy to discover, understand, navigate, extract from, and operate by humans, search engines, browser agents, and tool-using AI agents.

---

## 1. Purpose

Use this document when reviewing or modifying a web project.

The goal is **not** to add AI-specific hacks.

The goal is to build a site that is:

- discoverable
- understandable
- semantically structured
- accessible
- machine-readable
- stable to automate
- safe to operate
- explicit about actions and state

Treat agentic readiness as an extension of good web architecture, accessibility, structured data, APIs, and progressive enhancement.

The preferred order is:

1. Fix normal web semantics first.
2. Make data and state explicit.
3. Add machine-readable representations.
4. Add agent-native interfaces only where they create real value.

Do not add speculative complexity only because a technology is associated with AI agents.

---

## 2. Review Mode

When asked to review a project against this guide:

1. Inspect the current implementation.
2. Identify only concrete issues that exist in the code.
3. Separate findings into:
   - `MUST`
   - `SHOULD`
   - `COULD`
   - `EXPERIMENTAL`
4. Explain why each finding matters.
5. Reference the affected file, component, route, or pattern.
6. Prefer the smallest robust fix.
7. Do not introduce abstractions unless multiple real use cases justify them.
8. Do not rewrite working architecture only to make it "more agentic".
9. Preserve existing UX and visual design unless a change is necessary.
10. Consider humans, accessibility tools, search engines, and agents together.

If the current implementation is already good enough, say so.

Do not invent problems to satisfy the checklist.

---

# 3. Priority Model

## MUST

Problems that materially reduce accessibility, discoverability, semantic clarity, or reliable agent interaction.

Examples:

- clickable `<div>` instead of a real button
- unlabeled form controls
- core content unavailable without client-side JavaScript
- ambiguous destructive actions
- missing canonical language relationships on multilingual pages
- duplicate or conflicting machine-readable data
- inaccessible hidden UI that remains interactive

## SHOULD

Changes that materially improve extraction, navigation, state interpretation, or structured understanding.

Examples:

- structured data
- stable entity identifiers
- better URLs
- breadcrumb markup
- explicit dates
- better action labels
- server-rendered core content

## COULD

Low-cost enhancements that improve machine consumption but are not required.

Examples:

- `llms.txt`
- Markdown alternatives
- RSS/Atom feeds
- additional structured metadata

## EXPERIMENTAL

Emerging agent-native technologies that should only be added when the project has a concrete use case.

Examples:

- WebMCP
- remote MCP server
- agent-specific tool schemas
- agentic commerce integrations

Experimental technology must never replace normal HTML, forms, URLs, APIs, or accessibility.

---

# 4. Semantic HTML

## Check

Prefer native semantic HTML over generic elements with JavaScript behavior.

Use:

- `<button>` for actions
- `<a href>` for navigation
- `<form>` for forms
- `<input>`, `<select>`, `<textarea>` for controls
- `<header>`
- `<nav>`
- `<main>`
- `<aside>`
- `<footer>`
- `<article>`
- `<section>`
- `<table>` for actual tabular data

Avoid:

```html
<div onclick="submitForm()">Send</div>
```

Prefer:

```html
<button type="submit">Send message</button>
```

## Why

Native elements expose role, keyboard behavior, focus behavior, state, and intent automatically.

This helps:

- accessibility tools
- browser automation
- DOM-based agents
- testing tools
- search engines

## Review Questions

- Are clickable elements real interactive controls?
- Are links real links with meaningful `href` values?
- Are page landmarks present?
- Are tables used for data instead of layout?
- Are sections grouped semantically?

---

# 5. Accessible Names

## Check

Every interactive element must have a clear accessible name.

Prefer visible text first.

Use when necessary:

- `<label>`
- `aria-label`
- `aria-labelledby`
- `aria-describedby`
- `alt`

Bad:

```html
<button>
  <DownloadIcon />
</button>
```

Better:

```html
<button aria-label="Download CV">
  <DownloadIcon aria-hidden="true" />
</button>
```

Avoid vague labels such as:

- Click here
- More
- Open
- Go
- Submit
- Next

Prefer context-rich names:

- View project details
- Download CV
- Send message
- Open privacy policy
- Add product to cart

## Review Questions

- Can every button be understood without visual context?
- Do repeated controls have distinct names where necessary?
- Do icon-only controls expose their purpose?
- Are decorative icons hidden from assistive technologies?

---

# 6. Forms

Treat forms as structured machine interfaces.

## Check

Each field should use appropriate native semantics.

Example:

```html
<label for="email">Email</label>

<input id="email" name="email" type="email" autocomplete="email" required />
```

Where appropriate, use:

- `name`
- `id`
- `type`
- `required`
- `min`
- `max`
- `minlength`
- `maxlength`
- `pattern`
- `autocomplete`
- `<fieldset>`
- `<legend>`
- `aria-describedby`

Avoid using placeholders as the only label.

Bad:

```html
<input placeholder="Your email..." />
```

## Validation

Validation errors must be explicit and connected to the relevant field.

Bad:

- red outline only

Better:

```html
<input id="email" aria-invalid="true" aria-describedby="email-error" />

<p id="email-error">Enter a valid email address.</p>
```

## Review Questions

- Does every field have a real label?
- Is the field meaning encoded via `type`, `name`, and `autocomplete`?
- Are required fields machine-readable?
- Are errors associated with the correct control?
- Are groups represented with `fieldset` and `legend` where useful?
- Can the form be understood without layout or placeholder text?

---

# 7. Explicit UI State

Agents should not have to infer state from color, position, or styling alone.

Use native state where possible.

Examples:

- `disabled`
- `checked`
- `selected`
- `open`
- `required`

Use ARIA where appropriate:

- `aria-expanded`
- `aria-current`
- `aria-selected`
- `aria-pressed`
- `aria-invalid`

Example:

```html
<a href="/portfolio" aria-current="page"> Portfolio </a>
```

## Review Questions

- Can selected state be determined programmatically?
- Can open/closed state be determined?
- Are disabled actions actually disabled?
- Are loading states exposed clearly?
- Do tabs, menus, accordions, and dialogs use correct semantics?

---

# 8. Hidden and Inactive Content

Do not use the simplistic rule:

> "Nothing hidden should remain in the DOM."

Hidden DOM is valid.

The important rule is:

> Visual state, focus behavior, interaction state, and accessibility state must remain consistent.

Use appropriate mechanisms such as:

- `hidden`
- `display: none`
- `visibility: hidden`
- `inert`
- `aria-hidden`

Do not leave invisible controls focusable or actionable.

## Review Questions

- Can keyboard users focus invisible elements?
- Can automation trigger hidden actions accidentally?
- Are closed dialogs and menus removed from interaction?
- Is `aria-hidden` used safely?
- Would `inert` be more appropriate?

---

# 9. Heading and Content Hierarchy

Headings exist to describe document structure.

Prefer a clear page hierarchy.

Typical structure:

```text
H1 Page topic

  H2 Main section

    H3 Subsection

  H2 Main section
```

Do not use headings only for visual styling.

Do not enforce "exactly one H1" as an absolute technical rule.

Prefer one clear primary H1 on standard content pages because it keeps the page topic obvious.

## Review Questions

- Does the H1 clearly describe the page?
- Do H2/H3 headings represent real sections?
- Are heading levels logical?
- Are headings useful outside the visual layout?

---

# 10. Content Clarity

Prefer explicit factual language over vague marketing language.

Bad:

> We take your digital experience to the next level.

Better:

> Development and maintenance of web applications, API integrations, and data-processing systems.

Agents can extract explicit facts more reliably than implied meaning.

## Review Questions

- Can the purpose of the page be understood from its text?
- Are services named concretely?
- Are technical capabilities stated directly?
- Are important facts hidden only in visuals?
- Are ambiguous slogans supplemented by factual descriptions?

---

# 11. URLs and Information Architecture

URLs should be:

- stable
- readable
- canonical
- predictable

Prefer:

```text
/portfolio/
/apps/
/apps/mecha-todo/
/apps/mecha-todo/privacy/
/blog/agentic-web-readiness/
```

Avoid unnecessary routing schemes such as:

```text
/#page=4
/?view=123
/app?id=x7f91
```

unless the application genuinely requires them.

## Review Questions

- Does important content have a stable URL?
- Can routes be understood without application state?
- Do nested resources use predictable paths?
- Are redirects used when paths change?
- Is duplicate content canonicalized?

---

# 12. Breadcrumbs

Use visible breadcrumbs when the hierarchy benefits users.

Example:

```text
Apps
→ Mecha Todo
→ Privacy
```

Where useful, expose the same hierarchy through structured data.

Do not add breadcrumbs to extremely shallow sites purely for machines.

---

# 13. Multilingual Sites

For multilingual sites, verify:

- `<html lang>`
- localized URLs
- canonical URLs
- `hreflang`
- language switch preserves equivalent page context where possible

Example:

```text
/apps/mecha-todo/privacy/
/en/apps/mecha-todo/privacy/
```

Avoid sending users or agents back to the language homepage when an equivalent localized page exists.

## Review Questions

- Is every page language declared?
- Are alternate language versions linked correctly?
- Do canonical URLs point to the correct language version?
- Does the language switch preserve the resource?

---

# 14. Structured Data

Use JSON-LD where it describes real entities or content.

Potentially useful Schema.org types include:

- `Person`
- `Organization`
- `WebSite`
- `WebPage`
- `ProfilePage`
- `SoftwareApplication`
- `Article`
- `BlogPosting`
- `BreadcrumbList`
- `Product`
- `Offer`
- `LocalBusiness`
- `Event`
- `Dataset`

Do not add schema that does not match visible content.

## Example

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://example.com/apps/example-app/#app",
  "name": "Example App",
  "url": "https://example.com/apps/example-app/"
}
```

---

# 15. Stable Entity IDs

Use stable `@id` identifiers when multiple structured objects refer to the same entity.

Example:

```json
{
  "@type": "Person",
  "@id": "https://example.com/#person",
  "name": "Example Person"
}
```

Other schema objects can reference:

```json
{
  "author": {
    "@id": "https://example.com/#person"
  }
}
```

## Why

This helps machines understand that multiple references describe the same entity.

---

# 16. Identity and Provenance

Where relevant, expose:

- `author`
- `creator`
- `publisher`
- `datePublished`
- `dateModified`
- `sameAs`
- `identifier`
- canonical `url`

Use `<time datetime="">` for visible dates where appropriate.

Example:

```html
<time datetime="2026-10-02"> 2 October 2026 </time>
```

Avoid vague freshness indicators such as:

- recently
- new
- updated
- currently

when an exact date can be provided.

---

# 17. One Source of Truth

Visible content, structured data, APIs, feeds, and agent interfaces must not contradict each other.

Bad:

```text
HTML price:        49 €
JSON-LD price:     39 €
API price:         45 €
```

Prefer deriving all representations from the same application data.

Check especially:

- prices
- availability
- names
- dates
- product IDs
- article titles
- app versions
- contact details
- business information

---

# 18. Server-Available Core Content

Core content should ideally exist in the initial document response.

Prefer:

- static generation
- server-side rendering
- prerendering

for content pages.

Client-side JavaScript may enhance the page but should not be required merely to expose basic page content.

Bad pattern:

```text
empty HTML
→ load JavaScript
→ fetch API
→ render entire article
```

Better:

```text
HTML already contains article
→ JavaScript adds optional interaction
```

This improves compatibility with:

- crawlers
- simple extractors
- slower automation
- disabled JavaScript
- partial-render agents

---

# 19. Progressive Enhancement

Where practical:

- navigation should use real links
- forms should retain native semantics
- content should remain readable without hydration
- JavaScript should enhance rather than define basic semantics

This does not mean avoiding JavaScript.

It means avoiding unnecessary dependency on JavaScript for basic meaning.

---

# 20. Sitemap

Provide and maintain:

```text
/sitemap.xml
```

Ensure it:

- contains canonical URLs
- contains current public pages
- excludes irrelevant internal routes
- updates when content changes

For larger sites, use sitemap indexes if needed.

---

# 21. Feeds

For blogs, release logs, documentation, news, or frequently updated content, consider:

- RSS
- Atom
- JSON Feed

Example:

```text
/rss.xml
/feed.xml
```

Feeds provide a compact representation of updates.

Do not add a feed if the project has no meaningful chronological content.

---

# 22. Robots and AI Crawlers

Do not treat all AI-related traffic as one category.

Where the project owner wants machine discovery, review bot rules separately for:

- search/discovery crawlers
- user-triggered fetching
- training crawlers
- unknown automated traffic

Do not blindly allow every crawler.

Do not blindly block every AI-related user agent.

Document the intended policy.

## Review Questions

- Does `robots.txt` unintentionally block desired discovery?
- Are training and search policies intentionally separated?
- Is the sitemap referenced?
- Do WAF rules contradict `robots.txt` policy?

---

# 23. WAF, CAPTCHA, and Bot Protection

Agent-friendly HTML is useless if infrastructure blocks every legitimate automated visit.

Review:

- CDN rules
- WAF rules
- rate limits
- CAPTCHA
- bot protection
- login protections

Do not weaken security purely for agent compatibility.

For high-risk operations, explicit verification may remain appropriate.

---

# 24. `llms.txt`

`llms.txt` is an optional convenience layer.

Treat it as an emerging convention, not as a replacement for:

- HTML
- sitemap
- structured data
- APIs
- feeds
- documentation

A simple version may look like:

```md
# Example Site

> Short description of the site.

## Main pages

- [About](https://example.com/)
- [Portfolio](https://example.com/portfolio/)
- [Apps](https://example.com/apps/)
- [Blog](https://example.com/blog/)
```

Only recommend `llms.txt` when maintaining it is low-cost.

Do not duplicate large amounts of content manually.

---

# 25. Markdown Representations

Content-heavy sites may optionally expose Markdown alternatives.

Possible use cases:

- documentation
- blog posts
- technical references
- long-form knowledge pages

Possible mechanisms include:

```http
Accept: text/markdown
```

or explicit alternate resources:

```html
<link rel="alternate" type="text/markdown" href="/blog/article.md" />
```

Do not build a parallel Markdown system if it requires significant duplication or manual synchronization.

Prefer generating both HTML and Markdown from one content source.

---

# 26. APIs

If an agent is expected to perform meaningful operations, first ask whether the operation should exist as a normal API.

Examples:

```text
searchProducts()
getProduct()
checkAvailability()
createQuote()
createBooking()
getOrderStatus()
```

A stable API is often better than UI automation.

UI automation should remain possible, but it should not be the only integration path for complex business operations.

---

# 27. WebMCP

WebMCP may expose structured page actions to compatible browser agents.

Treat WebMCP as experimental unless the project has a concrete agent-use case.

Good candidate actions include:

- send contact request
- search catalog
- retrieve item details
- create quote
- check availability

Do not expose every button as a tool.

Prefer high-level, meaningful actions.

Example conceptual tool:

```text
send_contact_message(
  sender_name,
  sender_email,
  message
)
```

Avoid vague tool shapes:

```text
doThing(value)
```

---

# 28. Remote MCP

A remote MCP server is appropriate when the project exposes a real service, data source, or workflow to AI clients.

Potentially useful for:

- SaaS products
- internal tools
- developer platforms
- data services
- booking systems
- commerce systems

Usually unnecessary for:

- simple portfolios
- small static marketing sites
- sites without meaningful programmatic actions

Do not create an MCP server merely because MCP exists.

---

# 29. Tool Design

When exposing agent tools, define:

- clear action names
- clear descriptions
- explicit parameters
- required vs optional parameters
- stable identifiers
- validation rules
- structured results

Prefer:

```text
get_order_status(order_id)
```

over:

```text
lookup(value)
```

Prefer domain language already used by the application.

---

# 30. Action Safety

Agent-facing actions need explicit safety characteristics.

Distinguish actions such as:

```text
get_order_status
```

from:

```text
cancel_order
```

Where supported by the protocol, use annotations such as:

- read-only
- destructive
- idempotent
- external/open-world behavior
- untrusted content

High-impact actions should require explicit confirmation where appropriate.

Examples:

- placing an order
- deleting data
- cancelling a booking
- publishing content
- transferring money
- changing credentials

---

# 31. Idempotency

Where possible, mutation APIs and tools should tolerate retries.

Bad:

```text
Agent retries request
→ order created twice
```

Better:

```text
Agent retries same idempotency key
→ existing operation result returned
```

Review actions that may be retried due to:

- timeouts
- network failures
- agent uncertainty
- browser reloads

---

# 32. Prompt Injection and Untrusted Content

Agents may interpret page content as instructions.

Treat externally controlled content as untrusted.

Examples:

- user reviews
- comments
- uploaded documents
- external API responses
- marketplace listings
- imported text

Do not allow untrusted content to silently change the meaning or authorization of agent tools.

Keep:

- data
- instructions
- permissions
- tool metadata

clearly separated.

---

# 33. Visual Stability

Do not require identical pixel positions across pages.

Instead prefer:

- consistent component patterns
- predictable layouts
- limited layout shift
- stable navigation
- clear visual hierarchy
- clear focus indicators

This benefits visual browser agents without coupling the implementation to exact coordinates.

---

# 34. Machine-Readable Availability and Status

Avoid making agents infer business state from prose.

Prefer explicit values for:

- availability
- stock
- date
- version
- status
- price
- currency
- duration
- capacity

Example:

Bad:

```text
Available soon
```

Better:

```html
<time datetime="2026-11-15">Available from 15 November 2026</time>
```

or structured application data.

---

# 35. Commerce

For commerce projects, review beyond HTML.

Potential layers include:

```text
Product page
+
Product JSON-LD
+
Merchant/product feed
+
Commerce API
+
Agentic commerce integration
```

Keep:

- price
- product ID
- currency
- variants
- stock
- shipping
- fulfillment

consistent across all representations.

Do not rely solely on scraping product cards.

---

# 36. Testing Agentic Readiness

Do not review agentic readiness only by reading markup.

Test real tasks.

Examples:

```text
Find the contact method.
Find all available apps.
Open the privacy policy for a specific app.
Identify the author of an article.
Extract publication and modification dates.
Find a product price and availability.
Fill in the contact form.
Navigate from a parent resource to a nested page.
```

For browser tests, prefer selectors based on semantics.

Example:

```ts
page.getByRole("button", { name: "Send message" })
page.getByLabel("Email")
page.getByRole("link", { name: "Privacy policy" })
```

If a workflow can only be automated with:

```ts
.page > div:nth-child(4) > span:nth-child(2)
```

review the underlying semantics.

---

# 37. Review Output Format

When reviewing a project, use the following format.

## Summary

Briefly describe the current state.

Example:

```text
The project already has strong semantic HTML and server-rendered content.
The main gaps are structured data, form labeling, and explicit multilingual metadata.
No agent-specific protocol is currently necessary.
```

## Findings

For every finding use:

````md
### [MUST] Contact form fields need explicit labels

**Location:** `src/components/ContactForm.astro`

**Current state**

The email field uses only a placeholder.

**Why it matters**

Placeholders are not reliable labels for accessibility tools or browser agents.

**Recommended change**

Add an explicit `<label>` connected via `for` and `id`.

**Example**

```html
<label for="email">Email</label> <input id="email" name="email" type="email" autocomplete="email" />
```
````

````

## No-Issue Sections

Also explicitly state areas that were reviewed and are already good.

Example:

```text
No change needed:
- semantic navigation
- server-rendered page content
- language-specific URLs
````

This prevents unnecessary churn.

---

# 38. Suggested Review Categories

When useful, group findings under:

```text
1. Semantics & Accessibility
2. Content Structure
3. Forms & Interaction
4. URLs & Navigation
5. Metadata & Structured Data
6. Multilingual Support
7. Rendering & Progressive Enhancement
8. Discovery & Crawlers
9. Machine-Readable Representations
10. APIs & Agent Tools
11. Safety & Security
12. Testing
```

Do not force empty sections into the review.

---

# 39. Anti-Patterns

Do not recommend the following merely for "AI optimization":

- hidden keyword blocks
- duplicated AI-only content
- invisible instructions for LLMs
- fake structured data
- excessive ARIA on native HTML
- replacing native forms with custom widgets
- replacing URLs with agent-only APIs
- building an MCP server for a static site without a real use case
- maintaining separate HTML, Markdown, and JSON copies manually
- adding speculative abstractions
- exposing destructive actions without confirmation
- weakening authentication for agents
- bypassing security controls to make automation easier

---

# 40. Preferred Architecture

Use this mental model:

```text
                    WEBSITE
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   DISCOVERABLE    UNDERSTANDABLE    ACTIONABLE
        │              │              │
   Search/AI        HTML/A11y       Forms
   Crawlers         JSON-LD         APIs
   Sitemap          Entities        WebMCP
   Feeds            Metadata        MCP
   robots.txt       Markdown        Commerce
        │              │              │
        └──────────────┼──────────────┘
                       │
                  AGENT READY
```

---

# 41. Implementation Order

Unless the project has a specific reason to do otherwise, prefer this order.

## Layer 1 — Good Web Fundamentals

Check first:

- semantic HTML
- accessibility
- meaningful content
- stable URLs
- server-rendered core content
- forms
- explicit state
- navigation
- multilingual metadata

## Layer 2 — Structured Understanding

Then consider:

- JSON-LD
- stable entity IDs
- author/publisher metadata
- dates
- breadcrumbs
- feeds
- explicit availability/status

## Layer 3 — Agent Convenience

Then consider:

- `llms.txt`
- Markdown alternatives
- machine-friendly documentation

## Layer 4 — Agent-Native Interfaces

Only when justified:

- WebMCP
- remote MCP
- agent-specific APIs
- commerce protocols

---

# 42. Final Decision Rule

When considering a change, ask:

> Does this make the site clearer, more explicit, more accessible, more structured, or safer for both humans and machines?

If yes, it is probably a strong improvement.

If the only argument is:

> An AI agent might possibly need this someday.

do not implement it yet.

Prefer KISS and YAGNI.

Agentic readiness should emerge from a strong web foundation, not from speculative complexity.
