import assert from "node:assert/strict"
import { test } from "node:test"
import { URL } from "node:url"

import config from "../astro.config.mjs"
import { de } from "../src/i18n/translations/de.ts"
import { en } from "../src/i18n/translations/en.ts"

const renderer = await config.markdown.processor.createRenderer(config.markdown)
const fileURL = new URL("../src/content/blog/mermaid-test.md", import.meta.url)
const definition = "erDiagram\n  SERIE ||--|{ BEITRAG : umfasst\n  SERIE {\n    string name\n  }"

function fence(source) {
  return `\`\`\`mermaid showLineNumbers\n${source}\n\`\`\``
}

function svgs(html) {
  return [...html.matchAll(/<svg\b[^>]*\bid="mermaid-[^"]+"[\s\S]*?<\/svg>/g)].map(
    (match) => match[0]
  )
}

test("An invalid diagram rejects rendering with the source file and diagram number", async () => {
  await assert.rejects(
    renderer.render(`${fence("flowchart LR\n  A --> B")}\n\n${fence("flowchart TD\n  A -->")}`, {
      fileURL
    }),
    /src\/content\/blog\/mermaid-test\.md.*Diagram 2/
  )
})

test("Untitled diagrams have localized labels and repeated ER diagrams have unique IDs", async () => {
  for (const [language, label] of [
    ["de", de.blog.mermaidDiagram],
    ["en", en.blog.mermaidDiagram]
  ]) {
    const { code } = await renderer.render(`${fence(definition)}\n\n${fence(definition)}`, {
      fileURL,
      frontmatter: { language }
    })
    assert.equal(code.split(`aria-label="${label}"`).length - 1, 2)
    assert.equal(svgs(code).length, 2)
    const ids = svgs(code).flatMap((svg) =>
      [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    )
    assert.equal(new Set(ids).size, ids.length)
  }
})
