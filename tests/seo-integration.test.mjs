import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import process from "node:process"
import { after, before, test } from "node:test"
import { fileURLToPath, URL } from "node:url"
import { promisify } from "node:util"
import { XMLParser } from "fast-xml-parser"

import config from "../astro.config.mjs"
import { siteConfig } from "../src/data/site.ts"
import { de } from "../src/i18n/translations/de.ts"
import { en } from "../src/i18n/translations/en.ts"
import {
  tags,
  htmlFiles,
  readPage,
  rss,
  markdown,
  checkArticle,
  checkBlogPagination
} from "./support/output.mjs"

const project = fileURLToPath(new URL("../", import.meta.url))
const site = new URL(config.site)
const title = 'English fixture & "quotes" <text> </script> [brackets] \\path'
const description = 'A description with & "quotes" and <markup>.'
const body =
  '## Fixture content\n\n[Root link](/blog/) and [External](https://example.com/).\n\n```ts\nconst value = "Unicode: ä & <text>"\n```'
const posts = Array.from({ length: 25 }, (_, index) => ({
  id: index === 24 ? "__fixture-nested/entry" : `__fixture-${String(index + 1).padStart(2, "0")}`,
  data: {
    title: index === 0 ? title : `Fixture ${index + 1}`,
    description,
    pubDate: new Date(index === 24 ? "2026-09-30T00:00:00Z" : "2026-10-01T00:00:00Z"),
    ...(index === 0 && { updatedDate: new Date("2026-10-03T00:00:00Z") }),
    language: index % 2 === 0 ? "en" : "de",
    tags: [
      "All posts",
      ...(index < 12 ? ["First twelve"] : []),
      ...(index < 13 ? ["First thirteen"] : []),
      ...(index === 0 ? ["One post", "Astro", "Research, development", "C++", "C#"] : [])
    ],
    ...([0, 2].includes(index) && { series: { name: "Fixture series", part: index === 0 ? 1 : 2 } })
  }
}))

let directory
let dist
let feed
let files

before(
  async () => {
    directory = await mkdtemp(path.join(tmpdir(), "astro-content-test-"))
    dist = path.join(directory, "dist")
    await cp(path.join(project, "src"), path.join(directory, "src"), {
      recursive: true,
      filter: (source) => source !== path.join(project, "src/content/blog")
    })
    await cp(path.join(project, "public"), path.join(directory, "public"), { recursive: true })
    for (const file of ["tsconfig.json", "package.json"])
      await cp(path.join(project, file), path.join(directory, file))
    await cp(
      path.join(project, "astro.config.mjs"),
      path.join(directory, "astro.project.config.mjs")
    )
    // Share installed dependencies, while keeping writable caches inside the fixture.
    await writeFile(
      path.join(directory, "astro.config.mjs"),
      'import config from "./astro.project.config.mjs"\nexport default { ...config, cacheDir: "./.astro/cache", vite: { ...config.vite, cacheDir: "./.astro/vite" } }\n'
    )
    await symlink(
      path.join(project, "node_modules"),
      path.join(directory, "node_modules"),
      process.platform === "win32" ? "junction" : "dir"
    )
    for (const { id, data } of posts) {
      const file = path.join(directory, "src/content/blog", `${id}.md`)
      await mkdir(path.dirname(file), { recursive: true })
      const frontmatter = [
        `title: ${JSON.stringify(data.title)}`,
        `description: ${JSON.stringify(data.description)}`,
        `pubDate: "${data.pubDate.toISOString().slice(0, 10)}"`,
        ...(data.updatedDate
          ? [`updatedDate: "${data.updatedDate.toISOString().slice(0, 10)}"`]
          : []),
        `language: ${data.language}`,
        `tags: ${JSON.stringify(id === posts[0].id ? [...data.tags, " astro ", ""] : data.tags)}`,
        ...(data.series
          ? [`series:\n  name: ${JSON.stringify(data.series.name)}\n  part: ${data.series.part}`]
          : [])
      ].join("\n")
      await writeFile(file, `---\n${frontmatter}\n---\n\n${body}\n`)
    }
    await writeFile(
      path.join(directory, "src/content/blog/__fixture-draft.md"),
      '---\ntitle: "Draft"\ndescription: "Unpublished"\npubDate: "2026-10-04"\nlanguage: en\ndraft: true\n---\n\nDraft body.\n'
    )
    await promisify(execFile)(
      process.execPath,
      [path.join(project, "node_modules/astro/bin/astro.mjs"), "build"],
      {
        cwd: directory,
        timeout: 180000,
        maxBuffer: 4 * 1024 * 1024,
        windowsHide: true
      }
    )
    feed = rss(await readFile(path.join(dist, "rss.xml"), "utf8"))
    files = await htmlFiles(dist)
  },
  { timeout: 180000 }
)

after(async () => {
  if (!directory) return
  const relative = path.relative(tmpdir(), path.resolve(directory))
  assert.ok(!relative.includes(path.sep) && relative.startsWith("astro-content-test-"))
  await rm(directory, { recursive: true, force: true })
})

test("One build covers 1, 12, 13 and 25 posts across archives and filters", async () => {
  await checkBlogPagination(dist, posts)
})

test("RSS preserves escaped metadata, normalized tags, ordering and optional update dates", () => {
  assert.deepEqual(
    feed.channel.item.map(({ link }) => new URL(link).pathname),
    posts.map(({ id, data }) => `${data.language === "en" ? "/en" : ""}/blog/${id}/`)
  )
  for (const [index, { data }] of posts.entries()) {
    const item = feed.channel.item[index]
    assert.equal(item.title, data.title)
    assert.equal(item.description, data.description)
    assert.equal(item["dc:creator"], siteConfig.name.full)
    assert.equal(item["dc:language"], data.language)
    assert.equal(new Date(item.pubDate).toISOString(), data.pubDate.toISOString())
    assert.equal(item["dcterms:modified"], data.updatedDate?.toISOString().slice(0, 10))
    assert.deepEqual(item.category, data.tags)
    assert.deepEqual(item.guid, { "#text": item.link, "@_isPermaLink": "true" })
  }
})

test("Markdown preserves source bodies, nested IDs and optional frontmatter", async () => {
  for (const { id, data } of posts) {
    const prefix = data.language === "en" ? "en/" : ""
    const exported = markdown(await readFile(path.join(dist, `${prefix}blog/${id}.md`), "utf8"))
    assert.deepEqual(exported, {
      data: {
        title: data.title,
        description: data.description,
        author: siteConfig.name.full,
        language: data.language,
        pubDate: data.pubDate.toISOString().slice(0, 10),
        ...(data.updatedDate && { updatedDate: data.updatedDate.toISOString().slice(0, 10) }),
        tags: data.tags,
        canonical: new URL(`/${prefix}blog/${id}/`, site).href,
        ...(data.series && { series: data.series })
      },
      body
    })
    await assert.rejects(readFile(path.join(dist, `${prefix ? "" : "en/"}blog/${id}.md`)), {
      code: "ENOENT"
    })
  }
})

test("Both interfaces retain the article language, identity, escaped text and updated date", async () => {
  const home = await readPage("index.html", dist)
  const { id, data } = posts[0]
  for (const prefix of ["", "en/"]) {
    const article = await readPage(`${prefix}blog/${id}/index.html`, dist)
    checkArticle(
      article,
      id,
      data.language,
      title,
      description,
      data.pubDate.toISOString(),
      data.updatedDate.toISOString(),
      home
    )
    assert.equal(tags(article.html, "h1").find(({ id }) => id === "post-title").lang, "en")
    assert.ok(!article.html.includes(title), "Source markup cannot escape into the HTML")
  }
})

test("Drafts are absent from HTML, Markdown, RSS, sitemap and llms.txt", async () => {
  assert.ok(!files.some((file) => file.includes("__fixture-draft")))
  for (const file of ["rss.xml", "sitemap.xml", "llms.txt"])
    assert.ok(!(await readFile(path.join(dist, file), "utf8")).includes("__fixture-draft"))
  for (const prefix of ["", "en/"])
    await assert.rejects(readFile(path.join(dist, `${prefix}blog/__fixture-draft.md`)), {
      code: "ENOENT"
    })
})

test("Sitemap lists one canonical per article and uses the latest author supplied date", async () => {
  const xml = new XMLParser({ parseTagValue: false }).parse(
    await readFile(path.join(dist, "sitemap.xml"), "utf8")
  )
  const entries = xml.urlset.url.filter(({ loc }) => loc.includes("__fixture-"))
  assert.equal(entries.length, posts.length)
  assert.equal(new Set(entries.map(({ loc }) => loc)).size, posts.length)
  for (const { id, data } of posts) {
    const canonical = new URL(`${data.language === "en" ? "/en" : ""}/blog/${id}/`, site).href
    assert.equal(
      entries.find(({ loc }) => loc === canonical).lastmod,
      (data.updatedDate ?? data.pubDate).toISOString().slice(0, 10)
    )
  }
})

test("Series parts are ordered and their links follow the current interface language", async () => {
  const series = [posts[0], posts[2]]
  for (const prefix of ["", "en/"]) {
    const label = (prefix ? en : de).blog.series
    for (const { id } of series) {
      const { html } = await readPage(`${prefix}blog/${id}/index.html`, dist)
      const navigation = html.match(
        new RegExp(`<nav\\b[^>]*aria-label="${label}"[^>]*>([\\s\\S]*?)<\\/nav>`)
      )?.[1]
      assert.ok(navigation)
      assert.deepEqual(
        tags(navigation, "li").map((item) => item["data-series-part"]),
        ["1", "2"]
      )
      const links = tags(navigation, "a")
      assert.deepEqual(
        links.map(({ href }) => href),
        series.map(({ id }) => `/${prefix}blog/${id}/`)
      )
      assert.deepEqual(
        links.filter((link) => link["aria-current"] === "page").map(({ href }) => href),
        [`/${prefix}blog/${id}/`]
      )
    }
  }
})
