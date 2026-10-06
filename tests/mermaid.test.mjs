import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import process from "node:process"
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

test("Repeated rendering is deterministic and different articles receive different IDs", async () => {
  const source = definitions.map(fence).join("\n\n")
  const first = svgs((await renderer.render(source, { fileURL })).code)
  const second = svgs((await renderer.render(source, { fileURL })).code)
  assert.deepEqual(second, first)
  const other = svgs(
    (
      await renderer.render(source, {
        fileURL: new URL("../src/content/blog/other-mermaid-test.md", import.meta.url)
      })
    ).code
  )
  const ids = new Set(first.flatMap((svg) => [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])))
  assert.ok(other.every((svg) => [...svg.matchAll(/\sid="([^"]+)"/g)].every((m) => !ids.has(m[1]))))
})

test("An invalid diagram rejects rendering with the source file and diagram number", async () => {
  await assert.rejects(
    renderer.render(`${fence(definitions[0])}\n\n${fence("flowchart TD\n  A -->")}`, { fileURL }),
    /src\/content\/blog\/mermaid-test\.md.*Diagram 2/
  )
})

test("Articles without Mermaid work without an installed browser", async () => {
  const previous = process.env.PLAYWRIGHT_BROWSERS_PATH
  process.env.PLAYWRIGHT_BROWSERS_PATH = new URL("missing-browser", import.meta.url).pathname
  try {
    const { code } = await renderer.render("## Normaler Beitrag\n\n```ts\nconst count = 1\n```", {
      fileURL
    })
    assert.ok(code.includes('id="normaler-beitrag"'))
    assert.ok(code.includes("data-copy-code"))
    assert.equal(svgs(code).length, 0)
  } finally {
    if (previous === undefined) delete process.env.PLAYWRIGHT_BROWSERS_PATH
    else process.env.PLAYWRIGHT_BROWSERS_PATH = previous
  }
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

test("Both built article surfaces contain complete SVGs and omit Mermaid client bundles", async () => {
  for (const prefix of ["", "en/"]) {
    const html = await readFile(
      new URL(
        `../dist/${prefix}blog/astro-fuer-entwicklerblogs-mermaid-diagramme/index.html`,
        import.meta.url
      ),
      "utf8"
    )
    assert.equal(svgs(html).length, 5)
    assert.equal((html.match(/<details class="mermaid-source">/g) ?? []).length, 5)
    assert.ok(!/mermaid-diagrams\.[^" ]+\.js/.test(html))
    assert.ok(
      svgs(html).every((svg) => SyntaxValidator.validate(svg, { multipleRoots: false }) === true)
    )
  }
  const files = await readdir(new URL("../dist/_astro/", import.meta.url))
  assert.ok(!files.some((file) => /^(?:mermaid|elk)-.*\.js$/.test(file)))
  for (const file of files.filter((file) => file.endsWith(".js"))) {
    const code = await readFile(new URL(`../dist/_astro/${file}`, import.meta.url), "utf8")
    assert.ok(!/mermaidAPI|registerDiagram|elk-api/.test(code), file)
  }
})
