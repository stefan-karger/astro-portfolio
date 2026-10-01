# Blog / Astro / Shiki Research & Implementation Idea

## Goal

For the new `stefan-karger.de` blog, keep the code rendering stack deliberately small and Astro-native:

- Astro Markdown / MDX
- native Shiki syntax highlighting
- official Shiki transformers
- official `@shikijs/twoslash`
- Mermaid handled separately
- a small custom code-block wrapper
- a lightweight copy-to-clipboard feature without framework hydration

The goal is to avoid introducing a second code-rendering framework such as Expressive Code for now, while still getting most of the useful developer-blog UX.

---

# Recommended Stack

```text
Astro
│
├── Content Collections / MDX
│
├── Shiki
│   ├── github-light
│   ├── github-dark
│   ├── @shikijs/transformers
│   │   ├── diff
│   │   ├── highlight
│   │   └── focus
│   ├── @shikijs/twoslash
│   └── custom code-block wrapper transformer
│
├── Mermaid
│   └── handled separately from Shiki
│
└── Blog layout
    └── tiny delegated copy-button script
```

This keeps Markdown authoring clean while still allowing polished code examples.

---

# Why This Stack

## Shiki

Shiki remains responsible for syntax highlighting.

Example:

```ts
const posts = await getCollection("blog")
```

With the intended configuration, code blocks should use:

- `github-light`
- `github-dark`

depending on the site theme.

Shiki is also the base layer used by the rest of the code tooling.

---

## Shiki Transformers

Use official Shiki transformers for presentation-related source annotations such as:

- added / removed lines
- highlighted lines
- focused lines

Example:

````md
```ts
const value = "old" // [!code --]
const value = "new" // [!code ++]
```
````

This keeps useful developer-blog features without introducing Expressive Code.

---

## Twoslash

Twoslash adds TypeScript-aware semantics on top of Shiki.

Useful examples:

- inferred types
- compiler errors
- JSDoc/type hover information
- hidden setup code
- type queries
- checked examples

Example:

````md
```ts twoslash
const user = {
  name: "Stefan"
}

user.name
//   ^?
```
````

Important implementation preference:

```ts
transformerTwoslash({
  explicitTrigger: true
})
```

Normal TypeScript blocks remain normal Shiki blocks.

Twoslash is only enabled when explicitly requested with:

```text
twoslash
```

in the code-fence metadata.

---

# Code-Block Wrapper

The wrapper should be a small custom Shiki transformer.

The Markdown authoring API should stay normal.

Example:

````md
```ts
const posts = await getCollection("blog")
```
````

The generated structure should roughly become:

```html
<div class="code-block">
  <button type="button" class="code-block__copy" aria-label="Copy code">...</button>

  <pre class="astro-code">
    <code>...</code>
  </pre>
</div>
```

Visually:

```text
┌──────────────────────────────────────┐
│                                  ⧉   │
│ const posts = await                  │
│   getCollection("blog")              │
│                                      │
└──────────────────────────────────────┘
```

---

# Optional File Titles

The wrapper should already support optional metadata such as:

````md
```ts title="src/content.config.ts"
...
```
````

This should render conceptually as:

```text
┌─ src/content.config.ts ────────── ⧉ ┐
│                                     │
│ import { defineCollection } ...     │
│                                     │
└─────────────────────────────────────┘
```

Important UX preference:

- do not show the language name by default
- only show a header when useful metadata such as a filename/title exists
- keep titles optional
- avoid the generic "documentation framework" look

Ordinary snippet:

```text
┌────────────────────────────────── ⧉ ┐
│ const foo = ...                     │
└─────────────────────────────────────┘
```

Named file:

```text
┌ src/content.config.ts ────────── ⧉ ┐
│                                    │
│ const foo = ...                    │
└────────────────────────────────────┘
```

---

# Proposed Transformer

Suggested location:

```text
src/lib/shiki/
├── code-block.ts
└── index.ts
```

Example implementation:

```ts
import type { ShikiTransformer } from "shiki"

export function transformerCodeBlock(): ShikiTransformer {
  return {
    name: "stefan-karger:code-block",
    enforce: "post",

    root(root) {
      // Twoslash can also highlight inline snippets inside hover UI.
      // Only wrap full fenced code blocks.
      if (this.options.structure === "inline") {
        return
      }

      const pre = root.children[0]

      if (!pre || pre.type !== "element" || pre.tagName !== "pre") {
        return
      }

      const meta = this.options.meta?.__raw ?? ""
      const title = getMetaValue(meta, "title")

      /*
       * For Twoslash blocks, use processed code after Twoslash
       * has handled annotations.
       *
       * For normal blocks, fall back to the original Shiki source.
       */
      const source = this.meta.twoslash?.code ?? this.source

      const copySource = stripShikiNotations(source)

      root.children = [
        {
          type: "element",
          tagName: "div",
          properties: {
            className: ["code-block", ...(title ? ["code-block--with-title"] : [])]
          },
          children: [
            ...(title
              ? [
                  {
                    type: "element" as const,
                    tagName: "div",
                    properties: {
                      className: ["code-block__header"]
                    },
                    children: [
                      {
                        type: "element" as const,
                        tagName: "span",
                        properties: {
                          className: ["code-block__title"]
                        },
                        children: [
                          {
                            type: "text" as const,
                            value: title
                          }
                        ]
                      },
                      createCopyButton(copySource)
                    ]
                  }
                ]
              : [createCopyButton(copySource)]),

            pre
          ]
        }
      ]
    }
  }
}

function createCopyButton(source: string) {
  return {
    type: "element" as const,
    tagName: "button",
    properties: {
      type: "button",
      className: ["code-block__copy"],
      "data-copy-code": source,
      "data-state": "idle",
      "aria-label": "Copy code"
    },
    children: [
      {
        type: "element" as const,
        tagName: "svg",
        properties: {
          className: ["code-block__copy-icon"],
          viewBox: "0 0 24 24",
          width: 16,
          height: 16,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true"
        },
        children: [
          {
            type: "element" as const,
            tagName: "rect",
            properties: {
              width: 14,
              height: 14,
              x: 8,
              y: 8,
              rx: 2,
              ry: 2
            },
            children: []
          },
          {
            type: "element" as const,
            tagName: "path",
            properties: {
              d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
            },
            children: []
          }
        ]
      },

      {
        type: "element" as const,
        tagName: "svg",
        properties: {
          className: ["code-block__success-icon"],
          viewBox: "0 0 24 24",
          width: 16,
          height: 16,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true"
        },
        children: [
          {
            type: "element" as const,
            tagName: "path",
            properties: {
              d: "m20 6-11 11-5-5"
            },
            children: []
          }
        ]
      }
    ]
  }
}

function getMetaValue(meta: string, key: string): string | undefined {
  const match = meta.match(new RegExp(`${key}=(?:"([^"]*)"|'([^']*)'|(\\S+))`))

  return match?.[1] ?? match?.[2] ?? match?.[3]
}

function stripShikiNotations(source: string) {
  return source
    .replace(/\s*\/\/\s*\[!code[^\]]+\]\s*$/gm, "")
    .replace(/\s*#\s*\[!code[^\]]+\]\s*$/gm, "")
    .replace(/\s*<!--\s*\[!code[^\]]+\]\s*-->\s*$/gm, "")
}
```

---

# Copy Button Strategy

Do not rely on:

```ts
codeElement.textContent
```

once Twoslash is involved.

Twoslash can add generated markup for:

- hover information
- errors
- type information
- annotations

The canonical copy value should therefore be passed separately.

Suggested output:

```html
<button data-copy-code="const foo = ..."></button>
```

Advantages:

- copied text is controlled explicitly
- Twoslash-generated markup cannot pollute the clipboard
- Shiki transformer annotations can be stripped first
- implementation stays simple

Tradeoff:

- source code appears twice in the generated HTML

For normal blog snippets this is acceptable.

---

# Twoslash Copy Handling

Example source:

````md
```ts twoslash
const user = {
  name: "Stefan"
}

user.name
//   ^?
```
````

The copy result should not contain:

```ts
//   ^?
```

The transformer should therefore prefer Twoslash's processed source when available:

```ts
const source = this.meta.twoslash?.code ?? this.source
```

Then strip remaining presentation notations before storing it in `data-copy-code`.

---

# Transformer Annotation Cleanup

Example:

```ts
console.log("old") // [!code --]
console.log("new") // [!code ++]
```

These annotations are presentation instructions, not actual source a reader normally wants on the clipboard.

The wrapper should therefore remove known Shiki notation markers before assigning the copy source.

The helper above handles common forms:

```ts
function stripShikiNotations(source: string) {
  return source
    .replace(/\s*\/\/\s*\[!code[^\]]+\]\s*$/gm, "")
    .replace(/\s*#\s*\[!code[^\]]+\]\s*$/gm, "")
    .replace(/\s*<!--\s*\[!code[^\]]+\]\s*-->\s*$/gm, "")
}
```

This can be extended later if additional annotation syntax is introduced.

---

# Copy Script

The browser side should remain framework-free.

Place one script in the blog/article layout:

```astro
<script>
  const COPY_RESET_DELAY = 2_000

  document.addEventListener("click", async (event) => {
    const target = event.target

    if (!(target instanceof Element)) {
      return
    }

    const button = target.closest<HTMLButtonElement>("[data-copy-code]")

    if (!button) {
      return
    }

    const code = button.dataset.copyCode

    if (!code) {
      return
    }

    try {
      await navigator.clipboard.writeText(code)

      button.dataset.state = "copied"
      button.setAttribute("aria-label", "Copied to clipboard")

      window.setTimeout(() => {
        button.dataset.state = "idle"
        button.setAttribute("aria-label", "Copy code")
      }, COPY_RESET_DELAY)
    } catch {
      button.dataset.state = "error"
      button.setAttribute("aria-label", "Could not copy code")
    }
  })
</script>
```

Advantages:

- no React
- no Solid
- no hydration directive
- no component per code block
- one event listener per page
- works for any number of code blocks

The event delegation approach is intentional:

```ts
document.addEventListener(...)
```

Do not attach a separate listener to every code block.

---

# Suggested Styling

The wrapper should visually match the rest of the site rather than imitate a full IDE.

Example:

```css
.code-block {
  position: relative;

  margin-block: 1.5rem;

  overflow: clip;

  border: 1px solid var(--border);
  border-radius: 0.75rem;
}

.code-block .astro-code {
  margin: 0;

  padding: 1.25rem;

  overflow-x: auto;

  border: 0;
  border-radius: 0;

  font-family: "JetBrains Mono", monospace;
  font-size: 0.875rem;
  line-height: 1.7;
}
```

Copy button:

```css
.code-block__copy {
  display: grid;
  place-items: center;

  width: 2rem;
  height: 2rem;

  padding: 0;

  color: var(--muted-foreground);

  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 0.375rem;

  cursor: pointer;

  transition:
    color 150ms ease,
    background-color 150ms ease,
    border-color 150ms ease;
}

.code-block__copy:hover {
  color: var(--foreground);
  background: var(--muted);
}

.code-block__copy:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

For blocks without titles:

```css
.code-block:not(.code-block--with-title) > .code-block__copy {
  position: absolute;
  z-index: 2;

  top: 0.625rem;
  right: 0.625rem;
}
```

Header for titled blocks:

```css
.code-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 2.75rem;

  padding-inline: 0.75rem;

  background: var(--muted);
  border-bottom: 1px solid var(--border);
}

.code-block__title {
  color: var(--muted-foreground);

  font-family: "JetBrains Mono", monospace;
  font-size: 0.75rem;
}
```

Copy state:

```css
.code-block__success-icon {
  display: none;
}

.code-block__copy[data-state="copied"] .code-block__copy-icon {
  display: none;
}

.code-block__copy[data-state="copied"] .code-block__success-icon {
  display: block;
}
```

Preferred interaction:

```text
idle        copied

┌────┐      ┌────┐
│ ⧉  │  →   │ ✓  │
└────┘      └────┘
```

Prefer an icon switch rather than changing the button label to `"Copied!"`, because that avoids layout shifts.

---

# Astro / Shiki Configuration

Proposed overall configuration:

```ts
// astro.config.ts

import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"

import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight
} from "@shikijs/transformers"

import { transformerTwoslash } from "@shikijs/twoslash"

import { transformerCodeBlock } from "./src/lib/shiki/code-block"

export default defineConfig({
  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid", "math"]
    },

    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark"
      },

      transformers: [
        transformerTwoslash({
          explicitTrigger: true
        }),

        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationFocus(),

        // Structural wrapper should come last.
        transformerCodeBlock()
      ]
    }
  },

  integrations: [mdx()]
})
```

Important ordering:

1. Twoslash
2. presentation transformers
3. custom structural wrapper last

The wrapper should receive the final transformed code output and then add the outer UI shell.

---

# Markdown Authoring Examples

## Normal snippet

````md
```ts
const user = await getUser()
```
````

---

## Named file

````md
```ts title="src/lib/user.ts"
export async function getUser() {
  // ...
}
```
````

---

## Diff

````md
```ts
const value = "old" // [!code --]
const value = "new" // [!code ++]
```
````

---

## Focused code

````md
```ts
const config = {
  foo: true,
  bar: false // [!code focus]
}
```
````

---

## Twoslash

````md
```ts twoslash
const user = {
  name: "Stefan"
}

user.name
//   ^?
```
````

All of these should automatically get the same wrapper and copy button.

---

# Mermaid Separation

Mermaid should stay excluded from Shiki:

```ts
syntaxHighlight: {
  type: "shiki",
  excludeLangs: [
    "mermaid",
    "math",
  ],
},
```

Reason:

````text
```ts
→ Shiki

```astro
→ Shiki

```bash
→ Shiki

```mermaid
→ Mermaid
````

Do not make Shiki treat Mermaid source as a normal code block if the intent is to render diagrams.

The Mermaid implementation can remain a separate concern.

---

# Design Principles

## 1. Keep Markdown Clean

Authors should use normal fenced Markdown.

No custom MDX component should be required for ordinary code blocks.

Avoid:

```mdx
<CodeBlock language="ts" copy title="...">
  ...
</CodeBlock>
```

Prefer:

````md
```ts title="src/example.ts"
...
```
````

---

## 2. Progressive Enhancement

Rendered code must still be readable if the copy script fails.

The button is an enhancement, not a rendering dependency.

---

## 3. No Framework Hydration

Do not introduce Solid or React just for copy-to-clipboard.

A single native script is enough.

---

## 4. Keep Presentation Metadata Optional

Do not require file names or titles.

Use them when they improve understanding.

---

## 5. Avoid Overbuilding

Current requirement:

- syntax highlighting
- light/dark themes
- diff/highlight/focus
- Twoslash
- copy button
- optional filename/title

Do not pre-build:

- tabs
- multiple-file editors
- terminal chrome
- line-number systems
- collapsible code blocks
- code playgrounds
- editor emulation

unless a real blog post needs them.

This keeps the implementation aligned with KISS / YAGNI.

---

# Open Questions for Implementation Planning

The implementation agent should verify the following against the exact installed package versions before coding:

1. Exact HAST structure produced by current Astro + Shiki.
2. Exact location and typing of raw code-fence metadata.
3. Exact current Twoslash metadata shape for processed code.
4. Transformer ordering with the selected versions.
5. Whether `data-copy-code` encoding needs additional handling for unusual characters.
6. Whether clipboard text should preserve a final trailing newline.
7. Whether Shiki transformer annotations are fully removed before `root()` runs or still need manual cleanup.
8. Whether the title parser should stay intentionally minimal or use an existing metadata parser.
9. Accessibility behavior for success/error states:
   - `aria-label`
   - optional `aria-live`
   - focus behavior
10. Theme CSS for `github-light` / `github-dark` and how it integrates with the existing site theme mechanism.

---

# Suggested V1 Scope

Implement only:

- Astro native Shiki
- `github-light`
- `github-dark`
- `@shikijs/transformers`
  - diff
  - highlight
  - focus
- `@shikijs/twoslash`
  - explicit trigger
- custom wrapper transformer
- optional `title="..."`
- copy button
- copied-state icon
- single delegated browser script
- matching code-block CSS

Do not introduce Expressive Code unless future articles expose a concrete limitation in this setup.

---

# Expected Result

The final code-block system should feel native to `stefan-karger.de`:

```text
Markdown
   ↓
Astro
   ↓
Shiki
   ├─ github-light / github-dark
   ├─ Twoslash where explicitly requested
   ├─ diff / highlight / focus transformations
   └─ custom wrapper
          ↓
       HTML
          ↓
 small native copy-button enhancement
```

This preserves Astro's normal Markdown workflow while providing the most useful developer-blog features with a relatively small amount of custom code.
