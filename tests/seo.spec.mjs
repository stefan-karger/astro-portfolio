import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import process from "node:process"
import { test } from "node:test"
import { fileURLToPath, URL } from "node:url"
import { promisify } from "node:util"
import sharp from "sharp"

import config from "../astro.config.mjs"
import { siteConfig } from "../src/lib/config.ts"
import { de } from "../src/i18n/translations/de.ts"
import { en } from "../src/i18n/translations/en.ts"

const project = fileURLToPath(new URL("../", import.meta.url))
const dist = path.join(project, "dist")
const site = new URL(config.site)
const translations = { de, en }
const legal = new Set([
  "impressum/index.html",
  "datenschutz/index.html",
  "en/legal-notice/index.html",
  "en/privacy-policy/index.html"
])
const fixedPages = [
  "index.html",
  "en/index.html",
  "fotografie/index.html",
  "en/photography/index.html",
  "blog/index.html",
  "en/blog/index.html",
  ...legal
]

function decode(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
    if (entity.startsWith("#")) {
      return String.fromCodePoint(
        entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
      )
    }
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[entity.toLowerCase()]
  })
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b(?:[^"'>]|"[^"]*"|'[^']*')*>`, "gi"))].map(
    (match) =>
      Object.fromEntries(
        [...match[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)])
      )
  )
}

function page(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]
  assert.ok(head, "HTML must have a head")
  const titles = [...head.matchAll(/<title>([\s\S]*?)<\/title>/gi)]
  assert.equal(titles.length, 1, "Exactly one title")
  const meta = new Map()
  for (const tag of tags(head, "meta")) {
    const key = tag.name ?? tag.property
    if (!key) continue
    assert.ok(!meta.has(key), `Duplicate metadata: ${key}`)
    meta.set(key, tag.content)
  }
  const links = tags(head, "link")
  return { html, title: decode(titles[0][1]), meta, links, lang: tags(html, "html")[0].lang }
}

async function htmlFiles(dir, prefix = "") {
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`
    if (entry.isDirectory()) {
      files.push(...(await htmlFiles(path.join(dir, entry.name), `${relative}/`)))
    } else if (entry.name.endsWith(".html")) {
      files.push(relative)
    }
  }
  return files
}

async function readPage(file, directory = dist) {
  return page(await readFile(path.join(directory, file), "utf8"))
}

const files = await htmlFiles(dist)
const articles = files.filter((file) => /^(?:en\/)?blog\/.+\/index\.html$/.test(file))
const regularPages = await Promise.all(
  [...fixedPages, ...articles].map(async (file) => ({ file, ...(await readPage(file)) }))
)

test("All content pages have complete, consistent metadata and the correct indexing policy", () => {
  for (const data of regularPages) {
    const { file, title, meta, lang, html } = data
    assert.ok(title.trim(), file)
    assert.ok(meta.get("description")?.trim(), file)
    assert.equal(meta.get("robots"), legal.has(file) ? "noindex, follow" : undefined, file)
    assert.equal(meta.get("og:title"), title, file)
    assert.equal(meta.get("twitter:title"), title, file)
    assert.equal(meta.get("og:description"), meta.get("description"), file)
    assert.equal(meta.get("twitter:description"), meta.get("description"), file)
    assert.equal(meta.get("og:site_name"), siteConfig.name.public, file)
    assert.equal(meta.get("og:image"), new URL(siteConfig.socialImage.path, site).href, file)
    assert.equal(meta.get("twitter:image"), meta.get("og:image"), file)
    assert.equal(meta.get("twitter:image:alt"), meta.get("og:image:alt"), file)
    assert.equal(meta.get("twitter:card"), "summary_large_image", file)
    assert.equal(meta.get("og:image:type"), "image/png", file)
    assert.equal(meta.get("og:image:width"), "1200", file)
    assert.equal(meta.get("og:image:height"), "630", file)
    assert.ok(!tags(html, "img").some((image) => image.src === siteConfig.socialImage.path), file)
    assert.equal(lang, file.startsWith("en/") ? "en" : "de", file)
    if (!articles.includes(file)) {
      assert.equal(meta.get("og:type"), "website", file)
      assert.equal(meta.get("og:locale"), lang === "de" ? "de_DE" : "en_US", file)
      assert.equal(meta.get("og:locale:alternate"), lang === "de" ? "en_US" : "de_DE", file)
      assert.equal(meta.get("og:image:alt"), translations[lang].seo.imageAlt, file)
      assert.ok(!meta.has("article:published_time"), file)
    }
  }
})

test("Canonicals and language alternatives are absolute, reciprocal and point to built pages", async () => {
  for (const { file, links, meta } of regularPages) {
    const canonicals = links.filter((link) => link.rel === "canonical")
    assert.equal(canonicals.length, 1, file)
    const canonical = new URL(canonicals[0].href)
    assert.equal(canonical.origin, site.origin, file)
    assert.equal(canonical.search, "", file)
    assert.equal(canonical.hash, "", file)
    assert.equal(meta.get("og:url"), canonical.href, file)
    const alternatives = links.filter((link) => link.hreflang)
    assert.equal(alternatives.length, 3, file)
    assert.deepEqual(
      new Set(alternatives.map((link) => link.hreflang)),
      new Set(["de", "en", "x-default"]),
      file
    )
    for (const alternative of alternatives) {
      assert.equal(alternative.rel, "alternate", file)
      const url = new URL(alternative.href)
      assert.equal(url.origin, site.origin, file)
      assert.equal(url.search, "", file)
      assert.equal(url.hash, "", file)
      const target = decodeURIComponent(url.pathname).replace(/^\//, "").replace(/\/?$/, "/")
      const other = await readPage(target === "/" ? "index.html" : `${target}index.html`)
      assert.deepEqual(
        other.links.filter((link) => link.hreflang),
        alternatives,
        `${file} reciprocal alternatives`
      )
    }
    assert.equal(
      alternatives.find((link) => link.hreflang === "x-default").href,
      alternatives.find((link) => link.hreflang === "de").href,
      file
    )
  }
})

test("Home, legal and blog descriptions use their localized page copy", () => {
  for (const locale of ["de", "en"]) {
    const prefix = locale === "en" ? "en/" : ""
    const t = translations[locale]
    const expected = {
      [`${prefix}index.html`]: t.home.metaDescription,
      [`${prefix}blog/index.html`]: t.blog.description,
      [locale === "de" ? "impressum/index.html" : "en/legal-notice/index.html"]:
        t.legal.metaDescription,
      [locale === "de" ? "datenschutz/index.html" : "en/privacy-policy/index.html"]:
        t.privacy.metaDescription
    }
    assert.ok(t.home.metaDescription.includes(siteConfig.name.public))
    for (const [file, description] of Object.entries(expected)) {
      assert.equal(
        regularPages.find((data) => data.file === file).meta.get("description"),
        description,
        file
      )
    }
  }
})

function checkArticle(data, slug, language, title, description, date) {
  assert.equal(data.title, `${title} - ${siteConfig.name.public}`)
  assert.equal(data.meta.get("description"), description)
  assert.equal(data.meta.get("og:type"), "article")
  assert.equal(data.meta.get("og:locale"), language === "de" ? "de_DE" : "en_US")
  assert.ok(!data.meta.has("og:locale:alternate"))
  assert.equal(data.meta.get("og:image:alt"), translations[language].seo.imageAlt)
  assert.equal(
    data.meta.get("og:url"),
    new URL(`${language === "en" ? "/en" : ""}/blog/${slug}/`, site).href
  )
  assert.equal(data.meta.get("article:published_time"), date)
}

test("Published articles preserve their content language and canonical across both interfaces", () => {
  assert.ok(articles.length > 0, "The blog has published content")
  for (const data of regularPages.filter((data) => articles.includes(data.file))) {
    const slug = data.file.replace(/^(?:en\/)?blog\//, "").replace(/\/index\.html$/, "")
    const language = tags(data.html, "h1").find((tag) => tag.id === "post-title").lang
    const title = decode(data.html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)[1].trim())
    const date = tags(data.html, "time")[0].datetime
    checkArticle(data, slug, language, title, data.meta.get("description"), date)
    const sibling = regularPages.find(
      (item) => item.file === `${data.lang === "de" ? "en/" : ""}blog/${slug}/index.html`
    )
    assert.ok(sibling, `Both interfaces exist for ${slug}`)
    assert.equal(data.meta.get("og:url"), sibling.meta.get("og:url"))
    assert.equal(data.meta.get("og:description"), sibling.meta.get("og:description"))
  }
})

test("The shared social image is a 1200 by 630 PNG", async () => {
  const metadata = await sharp(path.join(dist, siteConfig.socialImage.path)).metadata()
  assert.equal(metadata.format, "png")
  assert.equal(metadata.width, 1200)
  assert.equal(metadata.height, 630)
})

test("One German 404 artifact has usable return links and no content-page SEO tags", async () => {
  const data = await readPage("404.html")
  assert.equal(data.lang, "de")
  assert.equal(data.title, `${siteConfig.name.public} - Seite nicht gefunden`)
  assert.equal(tags(data.html, "h1").length, 1)
  assert.equal(data.meta.get("robots"), "noindex")
  assert.equal(data.links.filter((link) => link.rel === "canonical" || link.hreflang).length, 0)
  assert.ok(![...data.meta.keys()].some((key) => /^(og:|twitter:|article:)/.test(key)))
  assert.ok(!tags(data.html, "nav").some((nav) => nav["aria-label"] === de.nav.languageLabel))
  const main = data.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)[1]
  assert.deepEqual(
    tags(main, "a").map((link) => link.href.replace(/\/+$/, "") || "/"),
    ["/", "/fotografie"]
  )
  const footer = data.html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)[1]
  assert.ok(footer.includes(de.footer.contact))
  assert.ok(tags(footer, "a").some((link) => /^\/impressum\/?$/.test(link.href)))
  assert.ok(!files.some((file) => /^en\/404(?:\/|\.)/.test(file)))
})

const run = promisify(execFile)

test("An isolated build checks English articles, drafts, escaping and invalid metadata", async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), "stefan-karger-seo-"))
  try {
    await cp(path.join(project, "src"), path.join(temporary, "src"), { recursive: true })
    await cp(path.join(project, "public"), path.join(temporary, "public"), { recursive: true })
    for (const file of ["astro.config.mjs", "tsconfig.json", "package.json"]) {
      await cp(path.join(project, file), path.join(temporary, file))
    }
    await symlink(
      path.join(project, "node_modules"),
      path.join(temporary, "node_modules"),
      process.platform === "win32" ? "junction" : "dir"
    )
    const title = 'English SEO fixture & "quotes" <text>'
    const description = 'A description with & "quotes" and <markup>.'
    const post = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\npubDate: 2026-10-01\nlanguage: en\ntags: "Astro, TypeScript, Astro, , TypeScript "\ndraft: false\n---\n\nFixture content.\n`
    const content = path.join(temporary, "src/content/blog")
    await writeFile(path.join(content, "__seo-english.md"), post)
    await writeFile(
      path.join(content, "__seo-older.md"),
      post.replace("pubDate: 2026-10-01", "pubDate: 2026-09-30")
    )
    await writeFile(
      path.join(content, "__seo-draft.md"),
      post.replace("draft: false", "draft: true")
    )
    const fixturePage = path.join(temporary, "src/pages/seo-fixture.astro")
    const template = (titleValue, descriptionValue, canonical) =>
      `---\nimport BaseLayout from "@/layouts/base-layout.astro"\n---\n<BaseLayout title={${JSON.stringify(titleValue)}} description={${JSON.stringify(descriptionValue)}} canonicalPath={${JSON.stringify(canonical)}}><h1>Fixture</h1></BaseLayout>\n`
    await writeFile(fixturePage, template(title, description, "/fotografie/?campaign=test#hero"))
    const build = () =>
      run(process.execPath, [path.join(project, "node_modules/astro/bin/astro.mjs"), "build"], {
        cwd: temporary,
        maxBuffer: 4 * 1024 * 1024
      })
    await build()
    const fixtureDist = path.join(temporary, "dist")
    for (const prefix of ["", "en/"]) {
      const article = await readPage(`${prefix}blog/__seo-english/index.html`, fixtureDist)
      checkArticle(article, "__seo-english", "en", title, description, "2026-10-01T00:00:00.000Z")
      assert.equal(article.lang, prefix ? "en" : "de")
      assert.ok(!article.meta.has("robots"))
      const index = await readPage(`${prefix}blog/index.html`, fixtureDist)
      assert.ok(!index.html.includes("__seo-draft"))
      const tagList = article.html.match(/<ul\b[^>]*aria-label="Tags"[^>]*>([\s\S]*?)<\/ul>/)?.[1]
      assert.ok(tagList, "Article tags are rendered")
      assert.deepEqual(
        [...tagList.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((match) => match[1].trim()),
        ["Astro", "TypeScript"],
        "Tag order is preserved while duplicates, whitespace and empty tags are removed"
      )
      const articleLinks = tags(index.html, "a")
        .map((link) => link.href.replace(/\/+$/, ""))
        .filter((href) => href.startsWith(`/${prefix}blog/`))
      const position = articleLinks.indexOf(`/${prefix}blog/__seo-english`)
      const olderPosition = articleLinks.indexOf(`/${prefix}blog/__seo-older`)
      assert.ok(position >= 0 && olderPosition > position, "Newest articles appear first")
      const navigation = article.html.match(
        /<nav\b[^>]*aria-label="(?:Weitere Beiträge|More posts)"[^>]*>([\s\S]*?)<\/nav>/
      )?.[1]
      assert.ok(navigation, "Article navigation is rendered")
      const neighbors = tags(navigation, "a").map((link) => link.href.replace(/\/+$/, ""))
      assert.ok(
        neighbors.includes(articleLinks[position + 1]),
        "Previous links to the older article"
      )
      assert.ok(neighbors.includes(articleLinks[position - 1]), "Next links to the newer article")
    }
    assert.ok(!(await htmlFiles(fixtureDist)).some((file) => file.includes("__seo-draft")))
    const escaped = await readPage("seo-fixture/index.html", fixtureDist)
    assert.equal(escaped.title, title)
    assert.equal(escaped.meta.get("description"), description)
    assert.ok(escaped.html.match(/<title>([\s\S]*?)<\/title>/)[1].includes("&lt;text&gt;"))
    assert.equal(escaped.meta.get("og:url"), new URL("/fotografie/", site).href)
    for (const [badTitle, badDescription, canonical, message] of [
      [" ", description, "/", /Missing SEO title or description/],
      [title, " ", "/", /Missing SEO title or description/],
      [title, description, "https://example.com/wrong/", /Canonical must use the site origin/]
    ]) {
      await writeFile(fixturePage, template(badTitle, badDescription, canonical))
      await assert.rejects(build, (error) => message.test(`${error.stdout}\n${error.stderr}`))
    }
  } finally {
    const resolved = path.resolve(temporary)
    assert.equal(path.dirname(resolved), path.resolve(tmpdir()))
    assert.ok(path.basename(resolved).startsWith("stefan-karger-seo-"))
    await rm(resolved, { recursive: true, force: true })
  }
})
