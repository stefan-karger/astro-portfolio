import assert from "node:assert/strict"
import { after, test } from "node:test"
import { createHighlighter } from "shiki"

import config from "../astro.config.mjs"

const highlighter = await createHighlighter({
  themes: [config.markdown.shikiConfig.theme],
  langs: ["ts", "md", "mermaid"]
})
after(() => highlighter.dispose())

function render(source, meta = "", lang = "ts") {
  return highlighter.codeToHast(source, {
    ...config.markdown.shikiConfig,
    lang,
    meta: { __raw: meta }
  })
}

function elements(node, predicate) {
  const result = node.type === "element" && predicate(node) ? [node] : []
  return result.concat((node.children ?? []).flatMap((child) => elements(child, predicate)))
}

function text(node) {
  return node.type === "text" ? node.value : (node.children ?? []).map(text).join("")
}

function copy(root) {
  const buttons = elements(root, (node) => node.properties.dataCopyCode !== undefined)
  assert.equal(buttons.length, 1)
  assert.equal(buttons[0].properties.hidden, true)
  return buttons[0].properties.dataCopyCode
}

test("Copy preserves whitespace, empty lines, quotes, markup and backslashes", () => {
  const source =
    '\n\tconst html = \'<span title="A">A & B</span>\'\n\nconst template = `hello ${html}`\nconst path = "C:\\\\Blog"\n'
  assert.equal(copy(render(source)), source)
  assert.equal(copy(render("")), "")
  assert.equal(copy(render("plain\n\ntext", "", "text")), "plain\n\ntext")
})

test("Titles are text nodes and only accept the documented metadata token", () => {
  const title = "<img onerror=x> & <script>.ts"
  const root = render("const count = 1", `title="${title}"`)
  const filenames = elements(root, (node) =>
    node.properties.className?.includes("code-block-filename")
  )
  assert.equal(filenames.length, 1)
  assert.equal(text(filenames[0]), title)
  assert.ok(filenames[0].children.every((node) => node.type === "text"))
  assert.equal(elements(root, (node) => node.tagName === "img").length, 0)
  assert.equal(elements(root, (node) => node.tagName === "script").length, 0)
  for (const meta of ['subtitle="ignore.ts"', 'title=""', 'title="x.ts"suffix']) {
    const result = render("const count = 1", meta)
    assert.equal(result.children[0].children[0].tagName, "button")
  }
})

test("Diff copies additions and unchanged lines, excludes removals and preserves empty lines", () => {
  const root = render(
    "const old = 1 // [!code --]\nconst next = 2 // [!code ++]\n\nconsole.log(next)"
  )
  assert.equal(
    copy(root)
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n"),
    "const next = 2\n\nconsole.log(next)"
  )
  assert.equal(copy(render("const removed = 1 // [!code --]")), "")
})

test("Highlight strips active comments without dropping code", () => {
  const root = render("const value = 1 // [!code highlight]\nconsole.log(value)")
  assert.equal(
    copy(root)
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n"),
    "const value = 1\nconsole.log(value)"
  )
  assert.ok(
    elements(root, (node) => String(node.properties.class ?? "").includes("highlighted")).length
  )
})

test("Escaped notation stays literal in displayed and copied code", () => {
  const root = render('const literal = "[\\!code ++]"')
  assert.equal(copy(root), 'const literal = "[!code ++]"')
  assert.equal(
    elements(root, (node) => String(node.properties.class ?? "").includes("diff")).length,
    0
  )
})

test("Twoslash excludes queries, type output and hidden setup from Copy", () => {
  const root = render(
    'type User = { name: string }\n// ---cut---\nconst user: User = { name: "Ada" }\n//    ^?\nconsole.log(user.name)',
    'twoslash title="user.ts"'
  )
  assert.equal(copy(root), 'const user: User = { name: "Ada" }\nconsole.log(user.name)')
  assert.ok(text(root).includes("const user: User"))
  assert.ok(!copy(root).includes("type User"))
})

test("Twoslash runs only on explicit fences and fails for unexpected errors", () => {
  assert.equal(copy(render('const count: number = "three"')), 'const count: number = "three"')
  assert.throws(() => render('const count: number = "three"', "twoslash"), /2322/)
  const root = render('// @errors: 2322\nconst count: number = "three"', "twoslash")
  assert.equal(copy(root), 'const count: number = "three"')
  assert.ok(text(root).includes("not assignable"))
})

test("Hover popups escape the scroll container, have unique targets and retain JSDoc", () => {
  const source =
    '/** Returns a greeting. */\nfunction greet(name: string) { return `Hello ${name}` }\ngreet("Ada")'
  const roots = [render(source, "twoslash"), render(source, "twoslash")]
  const ids = []
  for (const root of roots) {
    const pre = elements(root, (node) => node.tagName === "pre")[0]
    assert.equal(elements(pre, (node) => node.properties.popover).length, 0)
    const popups = elements(root, (node) => node.properties.popover)
    assert.ok(popups.length > 0)
    assert.ok(popups.some((popup) => text(popup).includes("Returns a greeting.")))
    for (const popup of popups) {
      ids.push(popup.properties.id)
      assert.equal(popup.properties.lang, "en")
      assert.equal(
        elements(root, (node) => node.properties.popoverTarget === popup.properties.id).length,
        1
      )
      const trigger = elements(
        root,
        (node) => node.properties.popoverTarget === popup.properties.id
      )[0]
      assert.equal(trigger.properties.ariaDescribedBy, "code-type-info-label")
    }
  }
  assert.equal(new Set(ids).size, ids.length)
})

test("showLineNumbers numbers visible code, preserves Copy and composes with Diff and Twoslash", () => {
  const source = "const old = 1 // [!code --]\nconst next = 2 // [!code ++]\n\nconsole.log(next)"
  const root = render(source, 'showLineNumbers title="diff.ts"')
  const numbers = elements(root, (node) => node.properties.className?.includes("line-number"))
  assert.deepEqual(numbers.map(text), ["1", "2", "3", "4"])
  assert.ok(numbers.every((node) => node.properties.ariaHidden === "true"))
  assert.equal(copy(root), copy(render(source)))
  const twoslash = render(
    'type User = { name: string }\n// ---cut---\nconst user: User = { name: "Ada" }\n//    ^?\nconsole.log(user.name)',
    "twoslash showLineNumbers"
  )
  assert.deepEqual(
    elements(twoslash, (node) => node.properties.className?.includes("line-number")).map(text),
    ["1", "2"]
  )
  assert.equal(copy(twoslash), 'const user: User = { name: "Ada" }\nconsole.log(user.name)')
  for (const meta of [
    'title="file showLineNumbers example.ts"',
    "showLineNumbers=false",
    "noshowLineNumbers"
  ]) {
    assert.equal(
      elements(render("const count = 1", meta), (node) =>
        node.properties.className?.includes("line-number")
      ).length,
      0
    )
  }
})

test("Mermaid preserves its original definition and keeps a visible source fallback", () => {
  const source = '\nflowchart TD\n  A["A & B <text>"] --> B["Prüfung"]\n\n  %% [\\!code ++]\n'
  const root = render(source, 'title="<img onerror=x> & diagram.mmd" showLineNumbers', "mermaid")
  assert.equal(copy(root), source)
  const blocks = elements(root, (node) => node.properties.dataMermaid === true)
  assert.equal(blocks.length, 1)
  assert.equal(blocks[0].tagName, "figure")
  assert.equal(blocks[0].properties.dataMermaidSource, source)
  const details = elements(root, (node) => node.tagName === "details")
  assert.equal(details.length, 1)
  assert.equal(details[0].properties.open, true)
  assert.equal(elements(details[0], (node) => node.tagName === "pre").length, 1)
  assert.ok(elements(details[0], (node) => node.properties.ariaHidden === "true").length > 0)
  const filename = elements(root, (node) =>
    node.properties.className?.includes("code-block-filename")
  )
  assert.equal(text(filename[0]), "<img onerror=x> & diagram.mmd")
  assert.equal(
    elements(root, (node) => node.tagName === "img" || node.tagName === "script").length,
    0
  )
})
