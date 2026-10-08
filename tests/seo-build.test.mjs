import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile, readdir, stat } from "node:fs/promises"
import path from "node:path"
import { test } from "node:test"
import { fileURLToPath, URL } from "node:url"
import sharp from "sharp"
import { XMLParser } from "fast-xml-parser"
import { SyntaxValidator } from "fast-xml-validator"

import config from "../astro.config.mjs"
import { siteConfig } from "../src/data/site.ts"
import { de } from "../src/i18n/translations/de.ts"
import { en } from "../src/i18n/translations/en.ts"
import {
  decode,
  tags,
  htmlFiles,
  readPage,
  rss,
  markdown,
  structuredData,
  checkArticle,
  checkBlogPagination
} from "./support/output.mjs"

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

const files = await htmlFiles(dist)

const archivePages = files.filter((file) => /^(?:en\/)?blog\/\d+\/index\.html$/.test(file))

const filterPages = files.filter((file) =>
  /^(?:en\/)?blog\/filter\/[^/]+(?:\/\d+)?\/index\.html$/.test(file)
)

const articles = files.filter(
  (file) =>
    /^(?:en\/)?blog\/.+\/index\.html$/.test(file) &&
    !archivePages.includes(file) &&
    !filterPages.includes(file)
)

const regularPages = await Promise.all(
  [...fixedPages, ...archivePages, ...filterPages, ...articles].map(async (file) => ({
    file,
    ...(await readPage(file, dist))
  }))
)

test("All content pages have complete, consistent metadata and the correct indexing policy", () => {
  for (const data of regularPages) {
    const { file, title, meta, lang, html } = data
    assert.ok(title.trim(), file)
    assert.ok(meta.get("description")?.trim(), file)
    assert.equal(
      meta.get("robots"),
      legal.has(file) || filterPages.includes(file) ? "noindex, follow" : undefined,
      file
    )
    assert.equal(meta.get("og:title"), title, file)
    assert.equal(meta.get("twitter:title"), title, file)
    assert.equal(meta.get("og:description"), meta.get("description"), file)
    assert.equal(meta.get("twitter:description"), meta.get("description"), file)
    assert.equal(meta.get("og:site_name"), siteConfig.name.brand, file)
    assert.equal(meta.get("og:image"), new URL(siteConfig.socialImage.path, site).href, file)
    assert.equal(meta.get("twitter:image"), meta.get("og:image"), file)
    assert.equal(meta.get("twitter:image:alt"), meta.get("og:image:alt"), file)
    assert.equal(meta.get("twitter:card"), "summary_large_image", file)
    assert.equal(meta.get("og:image:type"), "image/png", file)
    assert.ok(!tags(html, "img").some((image) => image.src === siteConfig.socialImage.path), file)
    assert.equal(lang, file.startsWith("en/") ? "en" : "de", file)
    if (!articles.includes(file)) {
      assert.equal(meta.get("og:type"), "website", file)
      assert.equal(meta.get("og:locale"), lang === "de" ? "de_DE" : "en_US", file)
      assert.equal(meta.get("og:locale:alternate"), lang === "de" ? "en_US" : "de_DE", file)
      assert.equal(meta.get("og:image:alt"), translations[lang].seo.imageAlt, file)
      assert.ok(!meta.has("article:published_time"), file)
      assert.ok(!meta.has("article:modified_time"), file)
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
      const other = await readPage(target === "/" ? "index.html" : `${target}index.html`, dist)
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

test("Both homepages identify the same person and link their structured data", async () => {
  const people = []
  for (const file of ["index.html", "en/index.html"]) {
    const data = regularPages.find((item) => item.file === file)
    const graph = structuredData(data)
    const person = graph.find((item) => item["@type"] === "Person")
    const profile = graph.find((item) => item["@type"] === "ProfilePage")
    const website = graph.find((item) => item["@type"] === "WebSite")
    assert.equal(person["@id"], new URL("/#person", site).href)
    assert.equal(website["@id"], new URL("/#website", site).href)
    assert.equal(profile["@id"], `${data.meta.get("og:url")}#profile`)
    assert.equal(person.name, siteConfig.name.full)
    assert.equal(person.alternateName, siteConfig.name.brand)
    assert.deepEqual(
      person.sameAs,
      siteConfig.socialLinks.map(({ href }) => href)
    )
    assert.equal(profile.url, data.meta.get("og:url"))
    assert.equal(profile.name, data.title)
    assert.equal(profile.description, data.meta.get("description"))
    assert.equal(profile.inLanguage, data.lang)
    assert.equal(profile.mainEntity["@id"], person["@id"])
    assert.equal(profile.isPartOf["@id"], website["@id"])
    assert.equal(website.publisher["@id"], person["@id"])
    assert.equal(website.name, siteConfig.name.brand)
    const image = new URL(person.image)
    assert.equal(image.origin, site.origin)
    await readFile(path.join(dist, decodeURIComponent(image.pathname)))
    people.push(person)
  }
  assert.deepEqual(people[0], people[1], "Both languages identify the same person")
})

test("Profiles and published articles share the optimized hero portrait without source metadata", async () => {
  const profiles = regularPages.filter(({ file }) => ["index.html", "en/index.html"].includes(file))
  const pages = [...profiles, ...regularPages.filter(({ file }) => articles.includes(file))]
  const images = pages.map((data) => {
    const person = structuredData(data).find((node) => node["@type"] === "Person")
    assert.ok(person, `${data.file} identifies the person`)
    const image = new URL(person.image)
    assert.equal(image.origin, site.origin, data.file)
    assert.equal(image.protocol, "https:", data.file)
    assert.equal(image.search, "", data.file)
    assert.equal(image.hash, "", data.file)
    return image.href
  })
  assert.equal(new Set(images).size, 1, "All person graphs use the same portrait URL")
  const image = new URL(images[0])
  const metadata = await sharp(path.join(dist, decodeURIComponent(image.pathname))).metadata()
  assert.equal(metadata.format, "jpeg")
  for (const field of ["exif", "xmp", "iptc"]) {
    assert.equal(metadata[field], undefined, `The portrait has no ${field.toUpperCase()} metadata`)
  }
  for (const data of profiles) {
    const hero = tags(data.html, "img")[0]
    assert.equal(new URL(hero.src, site).href, image.href, `${data.file} reuses its JPEG fallback`)
  }
  const source = await readFile(path.join(project, "src/assets/hero.jpg"))
  const sourceHash = createHash("sha256").update(source).digest("hex")
  for (const entry of await readdir(dist, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue
    const file = path.join(entry.parentPath, entry.name)
    if ((await stat(file)).size !== source.length) continue
    const hash = createHash("sha256")
      .update(await readFile(file))
      .digest("hex")
    assert.notEqual(
      hash,
      sourceHash,
      `${path.relative(dist, file)} publishes the original portrait`
    )
  }
})

test("llms.txt lists published canonical content and resolvable pages and project anchors", async () => {
  const text = await readFile(path.join(dist, "llms.txt"), "utf8")
  assert.ok(text.startsWith(`# ${siteConfig.name.brand}\n\n> ${en.home.metaDescription}\n`))
  assert.ok(!text.includes("__seo-draft"))
  const sections = text.split(/^## /m)
  const main = sections.find((section) => section.startsWith("Main\n"))
  const blog = sections.find((section) => section.startsWith("Blog\n"))
  const formats = sections.find((section) => section.startsWith("Feeds and Markdown\n"))
  const urls = (section) => [...section.matchAll(/\]\(<([^>]+)>\)/g)].map(([, url]) => url)
  assert.deepEqual(
    urls(main),
    ["/", "/fotografie/", "/blog/", "/en/", "/en/photography/", "/en/blog/"].map(
      (url) => new URL(url, site).href
    )
  )
  const canonicalArticles = [
    ...new Set(
      regularPages
        .filter(({ file }) => articles.includes(file))
        .map(({ meta }) => meta.get("og:url"))
    )
  ].sort((a, b) => {
    const date = (url) =>
      regularPages.find(({ meta }) => meta.get("og:url") === url).meta.get("article:published_time")
    return date(b).localeCompare(date(a)) || a.localeCompare(b)
  })
  assert.deepEqual(urls(blog), canonicalArticles)
  assert.deepEqual(urls(formats), [
    new URL("/rss.xml", site).href,
    ...canonicalArticles.map((url) => url.replace(/\/$/, ".md"))
  ])
  for (const href of urls(text)) {
    const url = new URL(href)
    assert.equal(url.protocol, "https:")
    if (url.origin !== site.origin) continue
    if (/\.(?:md|xml)$/.test(url.pathname)) {
      await readFile(path.join(dist, decodeURIComponent(url.pathname)))
      continue
    }
    const page = await readPage(`${url.pathname.replace(/^\//, "")}index.html`, dist)
    if (url.hash) assert.ok(tags(page.html, "article").some(({ id }) => `#${id}` === url.hash))
  }
})

test("The sitemap lists each indexable canonical once and robots.txt advertises it", async () => {
  const xml = await readFile(path.join(dist, "sitemap.xml"), "utf8")
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'))
  assert.ok(xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'))
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decode(match[1]))
  const expected = [
    ...new Set(
      regularPages
        .filter(({ meta }) => !meta.get("robots")?.includes("noindex"))
        .map(({ meta }) => meta.get("og:url"))
    )
  ].sort()
  assert.deepEqual(urls.sort(), expected, "Exclude noindex pages and duplicate article interfaces")
  assert.equal(SyntaxValidator.validate(xml, { multipleRoots: false }), true)
  const entries = new XMLParser({ parseTagValue: false }).parse(xml).urlset.url
  for (const entry of entries) {
    const data = regularPages.find(({ meta }) => meta.get("og:url") === entry.loc)
    if (data.meta.get("og:type") === "article") {
      const article = structuredData(data).find((node) => node["@type"] === "BlogPosting")
      assert.equal(
        entry.lastmod,
        (article.dateModified ?? article.datePublished).slice(0, 10),
        entry.loc
      )
    } else {
      assert.ok(!Object.hasOwn(entry, "lastmod"), entry.loc)
    }
  }
  const robots = await readFile(path.join(dist, "robots.txt"), "utf8")
  assert.ok(robots.includes(`Sitemap: ${new URL("/sitemap.xml", site).href}`))
})

test("RSS and Markdown publish each canonical article once and are discovered only in the head", async () => {
  const feed = rss(await readFile(path.join(dist, "rss.xml"), "utf8"))
  assert.equal(feed["@_version"], "2.0")
  assert.equal(feed["@_xmlns:dc"], "http://purl.org/dc/elements/1.1/")
  assert.equal(feed["@_xmlns:dcterms"], "http://purl.org/dc/terms/")
  assert.equal(feed["@_xmlns:atom"], "http://www.w3.org/2005/Atom")
  assert.equal(feed.channel.title, `${siteConfig.name.brand} - Blog`)
  assert.equal(feed.channel.description, en.blog.description)
  assert.equal(feed.channel.link, new URL("/blog/", site).href)
  assert.equal(feed.channel.language, undefined, "The feed contains multiple content languages")
  assert.deepEqual(feed.channel["atom:link"], {
    "@_href": new URL("/rss.xml", site).href,
    "@_rel": "self",
    "@_type": "application/rss+xml"
  })
  const canonicalPages = regularPages.filter(
    ({ file, lang, html }) =>
      articles.includes(file) &&
      tags(html, "h1").find(({ id }) => id === "post-title").lang === lang
  )
  const expected = canonicalPages.map(({ meta }) => meta.get("og:url"))
  assert.deepEqual(new Set(feed.channel.item.map((item) => item.link)), new Set(expected))
  assert.equal(feed.channel.item.length, expected.length)
  assert.deepEqual(
    feed.channel.item.map((item) => Date.parse(item.pubDate)),
    feed.channel.item.map((item) => Date.parse(item.pubDate)).sort((a, b) => b - a)
  )
  for (const item of feed.channel.item) {
    const html = canonicalPages.find(({ meta }) => meta.get("og:url") === item.link)
    const article = structuredData(html).find((node) => node["@type"] === "BlogPosting")
    assert.equal(item.title, article.headline)
    assert.equal(item.description, article.description)
    assert.equal(new Date(item.pubDate).toISOString(), article.datePublished)
    assert.equal(item["dc:creator"], siteConfig.name.full)
    assert.equal(item["dc:language"], article.inLanguage)
    assert.equal(item["dcterms:modified"], article.dateModified?.slice(0, 10))
    assert.deepEqual(item.guid, { "#text": item.link, "@_isPermaLink": "true" })
    assert.deepEqual(item.category, article.keywords)
    assert.ok(!Object.hasOwn(item, "author"), "A name is not an RSS email address")
    assert.ok(!Object.hasOwn(item, "content:encoded"), "RSS contains the chosen summary")
    const url = new URL(item.link)
    const slug = url.pathname.replace(/^\/(?:en\/)?blog\//, "").replace(/\/$/, "")
    const exported = markdown(
      await readFile(path.join(dist, `${url.pathname.replace(/\/$/, "")}.md`), "utf8")
    )
    const metadata = { ...exported.data }
    delete metadata.series
    assert.deepEqual(metadata, {
      title: article.headline,
      description: article.description,
      author: siteConfig.name.full,
      language: article.inLanguage,
      pubDate: article.datePublished.slice(0, 10),
      ...(article.dateModified && { updatedDate: article.dateModified.slice(0, 10) }),
      tags: article.keywords,
      canonical: item.link
    })
    const source = await readFile(path.join(project, `src/content/blog/${slug}.md`), "utf8")
    assert.equal(
      exported.body,
      source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/)[1].trim(),
      "The Astro collection body preserves all source text and code annotations"
    )
    const duplicate = `${article.inLanguage === "de" ? "/en" : ""}/blog/${slug}.md`
    await assert.rejects(readFile(path.join(dist, duplicate)), { code: "ENOENT" })
  }
  for (const data of regularPages) {
    const isArticle = articles.includes(data.file)
    const isBlog =
      ["blog/index.html", "en/blog/index.html"].includes(data.file) ||
      archivePages.includes(data.file) ||
      filterPages.includes(data.file)
    assert.deepEqual(
      data.links.filter(({ type }) => type === "application/rss+xml"),
      isArticle || isBlog
        ? [{ rel: "alternate", type: "application/rss+xml", href: "/rss.xml" }]
        : [],
      data.file
    )
    assert.deepEqual(
      data.links.filter(({ type }) => type === "text/markdown"),
      isArticle
        ? [
            {
              rel: "alternate",
              type: "text/markdown",
              href: new URL(data.meta.get("og:url")).pathname.replace(/\/$/, ".md")
            }
          ]
        : [],
      data.file
    )
    assert.ok(
      !tags(data.html, "a").some(({ href }) => /(?:\/rss\.xml|\.md)$/.test(href)),
      data.file
    )
  }
  assert.equal(
    (await readFile(path.join(dist, "_headers"), "utf8")).replace(/\r\n/g, "\n"),
    "/rss.xml\n  Content-Type: application/rss+xml; charset=utf-8\n\n/blog/*.md\n  Content-Type: text/markdown; charset=utf-8\n  X-Robots-Tag: noindex, follow\n\n/en/blog/*.md\n  Content-Type: text/markdown; charset=utf-8\n  X-Robots-Tag: noindex, follow\n"
  )
})

test("Blog pagination preserves ordering, filter counts and localized navigation", async () => {
  const feed = rss(await readFile(path.join(dist, "rss.xml"), "utf8"))
  const entries = feed.channel.item.map((item) => ({
    id: new URL(item.link).pathname.replace(/^\/(?:en\/)?blog\//, "").replace(/\/$/, ""),
    data: {
      pubDate: new Date(item.pubDate),
      language: item["dc:language"],
      tags: item.category ?? []
    }
  }))
  await checkBlogPagination(dist, entries)
})

test("Published articles preserve their content language and canonical across both interfaces", () => {
  assert.ok(articles.length > 0, "The blog has published content")
  for (const data of regularPages.filter((data) => articles.includes(data.file))) {
    const slug = data.file.replace(/^(?:en\/)?blog\//, "").replace(/\/index\.html$/, "")
    const language = tags(data.html, "h1").find((tag) => tag.id === "post-title").lang
    const title = decode(data.html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)[1].trim())
    const date = data.meta.get("article:published_time")
    const modified = data.meta.get("article:modified_time")
    checkArticle(
      data,
      slug,
      language,
      title,
      data.meta.get("description"),
      date,
      modified,
      regularPages.find(({ file }) => file === "index.html")
    )
    const sibling = regularPages.find(
      (item) => item.file === `${data.lang === "de" ? "en/" : ""}blog/${slug}/index.html`
    )
    assert.ok(sibling, `Both interfaces exist for ${slug}`)
    assert.equal(data.meta.get("og:url"), sibling.meta.get("og:url"))
    assert.equal(data.meta.get("og:description"), sibling.meta.get("og:description"))
    assert.deepEqual(
      structuredData(data),
      structuredData(sibling),
      "UI language does not change article identity or facts"
    )
  }
})

test("One German 404 artifact has usable return links and no content-page SEO tags", async () => {
  const data = await readPage("404.html", dist)
  assert.equal(data.lang, "de")
  assert.equal(data.title, `${siteConfig.name.brand} - Seite nicht gefunden`)
  assert.equal(tags(data.html, "h1").length, 1)
  assert.equal(data.meta.get("robots"), "noindex")
  assert.equal(data.links.filter((link) => link.rel === "canonical" || link.hreflang).length, 0)
  assert.ok(![...data.meta.keys()].some((key) => /^(og:|twitter:|article:)/.test(key)))
  assert.ok(!data.html.includes('type="application/ld+json"'))
  assert.ok(!tags(data.html, "nav").some((nav) => nav["aria-label"] === de.nav.languageLabel))
  const main = data.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)[1]
  assert.deepEqual(
    tags(main, "a").map((link) => link.href.replace(/\/+$/, "") || "/"),
    ["/", "/fotografie"]
  )
})

function svgs(html) {
  return [...html.matchAll(/<svg\b[^>]*\bid="mermaid-[^"]+"[\s\S]*?<\/svg>/g)].map(
    (match) => match[0]
  )
}

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
    assert.ok(!/\sdata-mermaid-source(?:=|\s|>)/.test(html))
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
