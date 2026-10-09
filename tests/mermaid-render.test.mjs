import assert from "node:assert/strict"
import { test } from "node:test"
import { URL } from "node:url"
import { XMLParser } from "fast-xml-parser"
import { SyntaxValidator } from "fast-xml-validator"

import config from "../astro.config.mjs"
import { de } from "../src/i18n/translations/de.ts"
import { en } from "../src/i18n/translations/en.ts"

const renderer = await config.markdown.processor.createRenderer(config.markdown)
const fileURL = new URL("../src/content/blog/mermaid-test.md", import.meta.url)
const xml = new XMLParser({ ignoreAttributes: false })
const definitions = [
  "flowchart LR\n  accTitle: Prüfen & veröffentlichen\n  accDescr: Ein Beitrag wird geprüft.\n  A[Entwurf] --> B[Prüfung]",
  "sequenceDiagram\n  accTitle: Build-Ablauf\n  accDescr: Astro erhält ein SVG.\n  Astro->>Mermaid: Rendern\n  Mermaid-->>Astro: SVG",
  "stateDiagram-v2\n  accTitle: Zustände\n  accDescr: Vom Entwurf zur Freigabe.\n  [*] --> Entwurf\n  Entwurf --> Veröffentlicht",
  "erDiagram\n  accTitle: Serie und Beiträge\n  accDescr: Eine Serie enthält Beiträge.\n  SERIE ||--|{ BEITRAG : umfasst\n  SERIE {\n    string name\n  }\n  BEITRAG {\n    string title\n  }"
]

function fence(source) {
  return `\`\`\`mermaid showLineNumbers\n${source}\n\`\`\``
}

function svgs(html) {
  return [...html.matchAll(/<svg\b[^>]*\bid="mermaid-[^"]+"[\s\S]*?<\/svg>/g)].map(
    (match) => match[0]
  )
}

test("The Markdown pipeline renders all four diagram types with accessible, unique SVGs", async () => {
  const sources = [...definitions, definitions[3]]
  const { code } = await renderer.render(sources.map(fence).join("\n\n"), {
    fileURL,
    frontmatter: { language: "de" }
  })
  const diagrams = svgs(code)
  assert.equal(diagrams.length, sources.length)
  assert.equal((code.match(/<details class="mermaid-source">/g) ?? []).length, sources.length)
  assert.equal((code.match(/class="mermaid-diagram" hidden/g) ?? []).length, 0)
  assert.ok(!code.includes("data-mermaid-source"))
  const ids = []
  for (const svg of diagrams) {
    assert.equal(SyntaxValidator.validate(svg, { multipleRoots: false }), true)
    const parsed = xml.parse(svg).svg
    assert.ok(parsed["@_viewBox"])
    assert.ok(parsed.title)
    assert.ok(parsed.desc)
    assert.ok(svg.includes(`aria-labelledby="${parsed.title["@_id"]}"`))
    assert.ok(svg.includes(`aria-describedby="${parsed.desc["@_id"]}"`))
    assert.ok(!/<(?:script|foreignObject)\b/.test(svg))
    const ownIds = [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    for (const reference of svg
      .replace(/<style>[\s\S]*?<\/style>/g, "")
      .matchAll(/url\(#([^)]*)\)/g)) {
      assert.ok(ownIds.includes(reference[1]), `Missing SVG reference ${reference[1]}`)
    }
    ids.push(...ownIds)
  }
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(code.includes('aria-label="Prüfen &amp; veröffentlichen"'))
  const copied = [...code.matchAll(/data-copy-code="([^"]*)"/g)].map(
    (match) => xml.parse(`<source>${match[1]}</source>`).source
  )
  assert.deepEqual(copied, sources)
})

test("An invalid diagram rejects rendering with the source file and diagram number", async () => {
  await assert.rejects(
    renderer.render(`${fence(definitions[0])}\n\n${fence("flowchart TD\n  A -->")}`, { fileURL }),
    /src\/content\/blog\/mermaid-test\.md.*Diagram 2/
  )
})

test("Diagrams without an explicit title receive the localized region name", async () => {
  for (const [language, label] of [
    ["de", de.blog.mermaidDiagram],
    ["en", en.blog.mermaidDiagram]
  ]) {
    const { code } = await renderer.render(fence("flowchart LR\n  A --> B"), {
      fileURL,
      frontmatter: { language }
    })
    assert.ok(code.includes(`aria-label="${label}"`))
    assert.equal(svgs(code).length, 1)
  }
})
