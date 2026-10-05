import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import process from "node:process"
import { test } from "node:test"
import { fileURLToPath, pathToFileURL, URL } from "node:url"
import { promisify } from "node:util"
import sharp from "sharp"
import { XMLParser } from "fast-xml-parser"
import { SyntaxValidator } from "fast-xml-validator"

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

function rss(text) {
  assert.equal(
    SyntaxValidator.validate(text, { multipleRoots: false }),
    true,
    "RSS must be well-formed XML"
  )
  return new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false,
    isArray: (name) => name === "item" || name === "category"
  }).parse(text).rss
}

function markdown(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/)
  assert.ok(match, "Markdown has one generated frontmatter block followed by its body")
  const data = Object.fromEntries(
    [...match[1].matchAll(/^(\w+): (.+)$/gm)].map(([, key, value]) => [key, JSON.parse(value)])
  )
  const series = match[1].match(/^series:\n {2}name: (.+)\n {2}part: (\d+)$/m)
  if (series) data.series = { name: JSON.parse(series[1]), part: Number(series[2]) }
  return { data, body: match[2] }
}

const files = await htmlFiles(dist)
const redirectFiles = new Set(
  Object.keys(config.redirects).map((route) => `${route.replace(/^\//, "")}/index.html`)
)
const articles = files.filter(
  (file) => /^(?:en\/)?blog\/.+\/index\.html$/.test(file) && !redirectFiles.has(file)
)
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

function structuredData(data) {
  const head = data.html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)[1]
  const scripts = [
    ...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
  ]
  assert.equal(scripts.length, 1, "Exactly one graph in the head")
  assert.ok(!scripts[0][1].includes("<"), "JSON-LD cannot close its script element")
  const graph = JSON.parse(scripts[0][1])
  assert.equal(graph["@context"], "https://schema.org")
  const ids = graph["@graph"].map((node) => node["@id"])
  assert.equal(new Set(ids).size, ids.length, "Entity IDs are unique within the graph")
  return graph["@graph"]
}

function checkArticle(data, slug, language, title, description, date, modified) {
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
  assert.equal(data.meta.get("article:modified_time"), modified)
  const graph = structuredData(data)
  assert.equal(graph.length, 3)
  const article = graph.find((node) => node["@type"] === "BlogPosting")
  const canonical = data.meta.get("og:url")
  assert.equal(article["@id"], `${canonical}#article`)
  assert.equal(article.url, canonical)
  assert.equal(article.mainEntityOfPage, canonical)
  assert.equal(article.headline, title)
  assert.equal(article.description, description)
  assert.equal(article.inLanguage, language)
  assert.equal(article.datePublished, date)
  assert.equal(article.dateModified, modified)
  assert.deepEqual(article.author, { "@id": new URL("/#person", site).href })
  assert.deepEqual(article.isPartOf, { "@id": new URL("/#website", site).href })
  const home = structuredData(regularPages.find(({ file }) => file === "index.html"))
  for (const type of ["Person", "WebSite"]) {
    assert.deepEqual(
      graph.find((node) => node["@type"] === type),
      home.find((node) => node["@type"] === type),
      `Articles and homepages share the same ${type}`
    )
  }
  const author = data.html.match(/<p\b[^>]*id="post-author"[^>]*>([\s\S]*?)<\/p>/)?.[1]
  assert.ok(author, "A visible author line exists")
  assert.equal(
    decode(author.replace(/<[^>]+>/g, ""))
      .replace(/\s+/g, " ")
      .trim(),
    `${translations[data.lang].blog.author} ${siteConfig.name.legal}`
  )
  assert.deepEqual(
    tags(author, "a").map(({ href, rel }) => ({ href, rel })),
    [{ href: data.lang === "de" ? "/" : "/en/", rel: "author" }]
  )
  const updated = data.html.match(/<span\b[^>]*id="post-updated"[^>]*>([\s\S]*?)<\/span>/)?.[1]
  if (modified) {
    assert.ok(updated?.includes(translations[data.lang].blog.updated))
    assert.deepEqual(
      tags(updated, "time").map(({ datetime }) => datetime),
      [modified]
    )
  } else {
    assert.equal(updated, undefined, "No empty wrapper or label reserves space for an unset update")
    assert.ok(!Object.hasOwn(article, "dateModified"))
  }
}

test("Public pages preserve the brand while both homepages identify the person in JSON-LD", async () => {
  for (const data of regularPages.filter(({ file }) => !legal.has(file))) {
    const publicHtml = data.html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<p\b[^>]*id="post-author"[^>]*>[\s\S]*?<\/p>/gi, "")
    assert.ok(
      !publicHtml.includes(siteConfig.name.legal),
      `${data.file} uses the public brand outside the dedicated author line`
    )
  }
  const people = []
  for (const file of ["index.html", "en/index.html"]) {
    const data = regularPages.find((item) => item.file === file)
    assert.equal(
      data.title,
      `${siteConfig.name.public} - ${translations[data.lang].home.metaTitle}`
    )
    assert.ok(data.meta.get("description").includes(siteConfig.name.public), file)
    assert.equal(
      tags(data.html, "img")[0].alt,
      translations[data.lang].home.hero.imageAlt(siteConfig.name.public)
    )
    const graph = structuredData(data)
    assert.equal(graph.length, 5)
    const person = graph.find((item) => item["@type"] === "Person")
    const profile = graph.find((item) => item["@type"] === "ProfilePage")
    const website = graph.find((item) => item["@type"] === "WebSite")
    assert.equal(person["@id"], new URL("/#person", site).href)
    assert.equal(website["@id"], new URL("/#website", site).href)
    assert.equal(profile["@id"], `${data.meta.get("og:url")}#profile`)
    assert.equal(person.name, siteConfig.name.legal)
    assert.equal(person.alternateName, siteConfig.name.public)
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
    assert.equal(website.name, siteConfig.name.public)
    assert.equal(
      website.alternateName,
      undefined,
      "The full name is not an alternative website brand"
    )
    const image = new URL(person.image)
    assert.equal(image.origin, site.origin)
    await readFile(path.join(dist, decodeURIComponent(image.pathname)))
    people.push(person)
  }
  assert.deepEqual(people[0], people[1], "Both languages identify the same person")
  for (const data of regularPages.filter(
    (item) => !["index.html", "en/index.html", ...articles].includes(item.file)
  )) {
    assert.ok(
      !data.html.includes('type="application/ld+json"'),
      `${data.file} is not a profile page`
    )
  }
})

test("Homepage projects have stable IDs, localized facts, useful link names and year-precision career periods", () => {
  const projectIds = ["project-solidui", "project-stock-sync"].map(
    (id) => new URL(`/#${id}`, site).href
  )
  for (const file of ["index.html", "en/index.html"]) {
    const data = regularPages.find((entry) => entry.file === file)
    const graph = structuredData(data)
    const t = translations[data.lang]
    const profile = graph.find((node) => node["@type"] === "ProfilePage")
    assert.deepEqual(
      profile.mentions,
      projectIds.map((id) => ({ "@id": id }))
    )
    const solid = graph.find((node) => node["@type"] === "SoftwareSourceCode")
    const stock = graph.find((node) => node["@type"] === "CreativeWork")
    assert.equal(solid["@id"], projectIds[0])
    assert.equal(stock["@id"], projectIds[1])
    assert.equal(solid.name, "SolidUI")
    assert.equal(solid.url, "https://www.solid-ui.com/")
    assert.equal(solid.codeRepository, "https://github.com/stefan-karger/solid-ui")
    assert.deepEqual(solid.description, {
      "@value": t.projects.solid.description,
      "@language": data.lang
    })
    assert.deepEqual(stock.name, { "@value": t.projects.lager.name, "@language": data.lang })
    assert.deepEqual(stock.description, {
      "@value": t.projects.lager.description,
      "@language": data.lang
    })
    assert.equal(stock.url, `${data.meta.get("og:url")}#project-stock-sync`)
    for (const work of [solid, stock]) {
      assert.ok(
        !Object.hasOwn(work, "creator"),
        "Project participation does not imply sole authorship"
      )
      assert.ok(!Object.hasOwn(work, "author"))
    }
    assert.ok(tags(data.html, "article").some(({ id }) => id === "project-solidui"))
    assert.ok(tags(data.html, "article").some(({ id }) => id === "project-stock-sync"))
    const github = tags(data.html, "a").find(({ href }) => href === solid.codeRepository)
    assert.equal(github["aria-label"], `GitHub – SolidUI (${t.links.opensInNewTab})`)
    assert.equal(github.target, "_blank")
    assert.equal(github.rel, "noopener noreferrer")
    const values = [...data.html.matchAll(/<dd\b[^>]*>([\s\S]*?)<\/dd>/gi)].map(([, value]) =>
      decode(value).trim()
    )
    assert.deepEqual(
      values,
      data.lang === "de"
        ? ["≈200.000", "≈4.000.000", "≈40.000", ">100.000"]
        : ["≈200,000", "≈4,000,000", "≈40,000", ">100,000"]
    )
    assert.deepEqual(
      tags(data.html, "time").map(({ datetime }) => datetime),
      ["2014", "2022", "2013", "2011", "2013", "2008", "2011"]
    )
    assert.equal((data.html.match(new RegExp(` — ${t.career.present}`, "g")) ?? []).length, 2)
  }
})

test("llms.txt lists published canonical content and resolvable pages and project anchors", async () => {
  const text = await readFile(path.join(dist, "llms.txt"), "utf8")
  assert.ok(text.startsWith(`# ${siteConfig.name.public}\n\n> ${en.home.metaDescription}\n`))
  assert.ok(!text.includes("__seo-draft"))
  const sections = text.split(/^## /m)
  const main = sections.find((section) => section.startsWith("Main\n"))
  const projects = sections.find((section) => section.startsWith("Projects\n"))
  const blog = sections.find((section) => section.startsWith("Blog\n"))
  const formats = sections.find((section) => section.startsWith("Feeds and Markdown\n"))
  const urls = (section) => [...section.matchAll(/\]\(<([^>]+)>\)/g)].map(([, url]) => url)
  assert.deepEqual(
    urls(main),
    ["/", "/fotografie/", "/blog/", "/en/", "/en/photography/", "/en/blog/"].map(
      (url) => new URL(url, site).href
    )
  )
  assert.deepEqual(urls(projects), [
    new URL("/en/#project-solidui", site).href,
    "https://www.solid-ui.com/",
    "https://github.com/stefan-karger/solid-ui",
    new URL("/en/#project-stock-sync", site).href
  ])
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
    const page = await readPage(`${url.pathname.replace(/^\//, "")}index.html`)
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
      regularPages.filter(({ file }) => !legal.has(file)).map(({ meta }) => meta.get("og:url"))
    )
  ].sort()
  assert.deepEqual(
    urls.sort(),
    expected,
    "Exclude noindex pages, redirects and duplicate article interfaces"
  )
  const robots = await readFile(path.join(dist, "robots.txt"), "utf8")
  assert.equal(
    robots,
    `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", site).href}\n`
  )
})

test("RSS and Markdown publish each canonical article once and are discovered only in the head", async () => {
  const feed = rss(await readFile(path.join(dist, "rss.xml"), "utf8"))
  assert.equal(feed["@_version"], "2.0")
  assert.equal(feed["@_xmlns:dc"], "http://purl.org/dc/elements/1.1/")
  assert.equal(feed["@_xmlns:dcterms"], "http://purl.org/dc/terms/")
  assert.equal(feed["@_xmlns:atom"], "http://www.w3.org/2005/Atom")
  assert.equal(feed.channel.title, `${siteConfig.name.public} - Blog`)
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
    assert.equal(item["dc:creator"], siteConfig.name.legal)
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
      author: siteConfig.name.legal,
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
    const isBlog = ["blog/index.html", "en/blog/index.html"].includes(data.file)
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
    await readFile(path.join(dist, "_headers"), "utf8"),
    "/rss.xml\n  Content-Type: application/rss+xml; charset=utf-8\n\n/blog/*.md\n  Content-Type: text/markdown; charset=utf-8\n  X-Robots-Tag: noindex, follow\n\n/en/blog/*.md\n  Content-Type: text/markdown; charset=utf-8\n  X-Robots-Tag: noindex, follow\n"
  )
})

test("Published articles preserve their content language and canonical across both interfaces", () => {
  assert.ok(articles.length > 0, "The blog has published content")
  for (const data of regularPages.filter((data) => articles.includes(data.file))) {
    const slug = data.file.replace(/^(?:en\/)?blog\//, "").replace(/\/index\.html$/, "")
    const language = tags(data.html, "h1").find((tag) => tag.id === "post-title").lang
    const title = decode(data.html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)[1].trim())
    const date = tags(data.html, "time")[0].datetime
    const modified = data.html.match(/<span\b[^>]*id="post-updated"[^>]*>([\s\S]*?)<\/span>/)?.[1]
    checkArticle(
      data,
      slug,
      language,
      title,
      data.meta.get("description"),
      date,
      modified ? tags(modified, "time")[0].datetime : undefined
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

test("The Astro series is ordered by part and uses the current interface language", () => {
  const slugs = [
    "astro-fuer-entwicklerblogs-shiki-twoslash",
    "astro-fuer-entwicklerblogs-mermaid-diagramme"
  ]
  for (const prefix of ["", "en/"]) {
    for (const slug of slugs) {
      const data = regularPages.find((entry) => entry.file === `${prefix}blog/${slug}/index.html`)
      assert.ok(data)
      const label = translations[data.lang].blog.series
      const navigation = data.html.match(
        new RegExp(`<nav\\b[^>]*aria-label="${label}"[^>]*>([\\s\\S]*?)<\\/nav>`)
      )?.[1]
      assert.ok(navigation, "The series has its own navigation")
      assert.deepEqual(
        tags(navigation, "li").map((li) => li["data-series-part"]),
        ["1", "2"]
      )
      const links = tags(navigation, "a")
      assert.deepEqual(
        links.map((link) => link.href),
        slugs.map((id) => `/${prefix}blog/${id}/`)
      )
      const current = links.filter((link) => link["aria-current"] === "page")
      assert.equal(current.length, 1)
      assert.equal(current[0].href, `/${prefix}blog/${slug}/`)
    }
  }
})

test("The Mermaid article builds five diagrams with source available before scripts execute", () => {
  for (const prefix of ["", "en/"]) {
    const data = regularPages.find(
      (entry) =>
        entry.file === `${prefix}blog/astro-fuer-entwicklerblogs-mermaid-diagramme/index.html`
    )
    assert.equal(
      (data.html.match(/<figure class="code-block mermaid-block" data-mermaid>/g) ?? []).length,
      5
    )
    assert.equal((data.html.match(/<details class="mermaid-source" open>/g) ?? []).length, 5)
    const definitions = tags(data.html, "button")
      .map((button) => button["data-copy-code"])
      .filter((source) =>
        /^(?:flowchart|sequenceDiagram|stateDiagram-v2|erDiagram)\b/.test(source ?? "")
      )
    assert.equal(definitions.length, 5)
    assert.ok(
      definitions.every((source) => source.includes("accTitle:") && source.includes("accDescr:"))
    )
  }
})

test("Old blog URLs redirect to the renamed first series part", async () => {
  for (const prefix of ["", "en/"]) {
    const html = await readFile(
      path.join(dist, `${prefix}blog/astro-shiki-codebloecke/index.html`),
      "utf8"
    )
    const target = `/${prefix}blog/astro-fuer-entwicklerblogs-shiki-twoslash`
    assert.ok(
      tags(html, "meta").some(
        (meta) => meta["http-equiv"] === "refresh" && meta.content === `0;url=${target}`
      )
    )
    assert.ok(tags(html, "a").some((link) => link.href === target))
    assert.ok(!articles.includes(`${prefix}blog/astro-shiki-codebloecke/index.html`))
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
  assert.ok(!data.html.includes('type="application/ld+json"'))
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

test("An isolated build checks articles, updates, drafts, escaping and invalid content", async () => {
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
    const title = 'English SEO fixture & "quotes" <text> </script> [brackets] \\path'
    const description = 'A description with & "quotes" and <markup>.'
    const body =
      'Fixture content.\n\n[Root link](/blog/) and [External](https://example.com/).\n\n```ts\nconst value = "Unicode: ä & <text>"\n```'
    const post = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\npubDate: "2026-10-01"\nlanguage: en\ntags: "Astro, TypeScript, Astro, , TypeScript "\ndraft: false\n---\n\n${body}\n`
    const updatedPost = post.replace("language: en", 'updatedDate: "2026-10-03"\nlanguage: en')
    const content = path.join(temporary, "src/content/blog")
    await writeFile(path.join(content, "__seo-english.md"), updatedPost)
    await writeFile(
      path.join(content, "__seo-older.md"),
      post.replace('pubDate: "2026-10-01"', 'pubDate: "2026-09-30"')
    )
    await writeFile(
      path.join(content, "__seo-leap.md"),
      post.replace('pubDate: "2026-10-01"', 'pubDate: "2024-02-29"\nupdatedDate: "2024-02-29"')
    )
    await writeFile(
      path.join(content, "__seo-draft.md"),
      post.replace("draft: false", "draft: true")
    )
    await writeFile(
      path.join(content, "__seo-german-draft.md"),
      post.replace("language: en", "language: de").replace("draft: false", "draft: true")
    )
    await mkdir(path.join(content, "__seo-nested"))
    await writeFile(
      path.join(content, "__seo-nested/entry.md"),
      post.replace("draft: false", 'draft: false\nseries:\n  name: "Nested series"\n  part: 1')
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
    const cli = (...args) =>
      run(process.execPath, [path.join(project, "node_modules/astro/bin/astro.mjs"), ...args], {
        cwd: temporary,
        timeout: 60000,
        maxBuffer: 4 * 1024 * 1024
      })
    await build()
    const fixtureDist = path.join(temporary, "dist")
    const feed = rss(await readFile(path.join(fixtureDist, "rss.xml"), "utf8"))
    const fixtureUrl = new URL("/en/blog/__seo-english/", site).href
    const fixtureItem = feed.channel.item.find(({ link }) => link === fixtureUrl)
    assert.ok(fixtureItem)
    assert.equal(fixtureItem.title, title)
    assert.equal(fixtureItem.description, description)
    assert.equal(fixtureItem["dc:creator"], siteConfig.name.legal)
    assert.equal(fixtureItem["dc:language"], "en")
    assert.equal(fixtureItem["dcterms:modified"], "2026-10-03")
    assert.deepEqual(fixtureItem.category, ["Astro", "TypeScript"])
    assert.equal(feed.channel.item.filter(({ link }) => link === fixtureUrl).length, 1)
    assert.ok(feed.channel.item.every(({ link }) => !link.includes("draft")))
    const nestedUrl = new URL("/en/blog/__seo-nested/entry/", site).href
    assert.ok(
      feed.channel.item.findIndex(({ link }) => link === fixtureUrl) <
        feed.channel.item.findIndex(({ link }) => link === nestedUrl),
      "Equal publication dates use ID ordering"
    )
    assert.deepEqual(
      markdown(await readFile(path.join(fixtureDist, "en/blog/__seo-english.md"), "utf8")),
      {
        data: {
          title,
          description,
          author: siteConfig.name.legal,
          language: "en",
          pubDate: "2026-10-01",
          updatedDate: "2026-10-03",
          tags: ["Astro", "TypeScript"],
          canonical: fixtureUrl
        },
        body
      }
    )
    const nested = markdown(
      await readFile(path.join(fixtureDist, "en/blog/__seo-nested/entry.md"), "utf8")
    )
    assert.deepEqual(nested.data.series, { name: "Nested series", part: 1 })
    assert.equal(nested.data.canonical, nestedUrl)
    assert.equal(nested.body, body)
    assert.ok(!Object.hasOwn(nested.data, "updatedDate"))
    for (const file of [
      "blog/__seo-english.md",
      "blog/__seo-nested/entry.md",
      "blog/__seo-german-draft.md",
      "en/blog/__seo-draft.md"
    ]) {
      await assert.rejects(readFile(path.join(fixtureDist, file)), { code: "ENOENT" })
    }
    const sitemap = await readFile(path.join(fixtureDist, "sitemap.xml"), "utf8")
    const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
      decode(match[1])
    )
    assert.ok(sitemapUrls.includes(new URL("/en/blog/__seo-english/", site).href))
    assert.ok(!sitemapUrls.includes(new URL("/blog/__seo-english/", site).href))
    assert.ok(!sitemap.includes("__seo-draft"), "Drafts are excluded from the sitemap")
    for (const prefix of ["", "en/"]) {
      const article = await readPage(`${prefix}blog/__seo-english/index.html`, fixtureDist)
      checkArticle(
        article,
        "__seo-english",
        "en",
        title,
        description,
        "2026-10-01T00:00:00.000Z",
        "2026-10-03T00:00:00.000Z"
      )
      assert.deepEqual(
        structuredData(article).find((node) => node["@type"] === "BlogPosting").keywords,
        ["Astro", "TypeScript"]
      )
      checkArticle(
        await readPage(`${prefix}blog/__seo-older/index.html`, fixtureDist),
        "__seo-older",
        "en",
        title,
        description,
        "2026-09-30T00:00:00.000Z"
      )
      checkArticle(
        await readPage(`${prefix}blog/__seo-leap/index.html`, fixtureDist),
        "__seo-leap",
        "en",
        title,
        description,
        "2024-02-29T00:00:00.000Z",
        "2024-02-29T00:00:00.000Z"
      )
      assert.equal(article.lang, prefix ? "en" : "de")
      assert.ok(!article.meta.has("robots"))
      const index = await readPage(`${prefix}blog/index.html`, fixtureDist)
      assert.ok(!index.html.includes("__seo-draft"))
      assert.ok(!index.html.includes("__seo-german-draft"))
      assert.deepEqual(
        article.links.filter(({ type }) => type === "text/markdown"),
        [{ rel: "alternate", type: "text/markdown", href: "/en/blog/__seo-english.md" }]
      )
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
    const llms = await readFile(path.join(fixtureDist, "llms.txt"), "utf8")
    assert.ok(!llms.includes("__seo-draft"))
    assert.ok(!llms.includes("__seo-german-draft"))
    assert.ok(llms.includes(new URL("/en/blog/__seo-english/", site).href))
    assert.ok(!llms.includes(new URL("/blog/__seo-english/", site).href))
    assert.ok(llms.includes(new URL("/en/blog/__seo-english.md", site).href))
    assert.ok(llms.includes(new URL("/en/blog/__seo-nested/entry.md", site).href))
    assert.ok(
      llms.includes("\\[brackets\\] \\\\path"),
      "Markdown link titles escape brackets and backslashes"
    )
    const escaped = await readPage("seo-fixture/index.html", fixtureDist)
    assert.equal(escaped.title, title)
    assert.equal(escaped.meta.get("description"), description)
    assert.ok(escaped.html.match(/<title>([\s\S]*?)<\/title>/)[1].includes("&lt;text&gt;"))
    assert.equal(escaped.meta.get("og:url"), new URL("/fotografie/", site).href)

    const robotsFile = path.join(temporary, "src/pages/robots.txt.ts")
    const robotsSource = await readFile(robotsFile, "utf8")
    for (const agent of ["GPTBot", "ClaudeBot", "Google-Extended"]) {
      const key = agent.includes("-") ? JSON.stringify(agent) : agent
      const blockedSource = robotsSource.replace(`${key}: true`, `${key}: false`)
      assert.notEqual(blockedSource, robotsSource, `The ${agent} switch exists`)
      await writeFile(robotsFile, blockedSource)
      const { GET } = await import(`${pathToFileURL(robotsFile).href}?blocked=${agent}`)
      const response = GET({ site })
      assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8")
      const groups = (await response.text()).trim().split("\n\n")
      assert.deepEqual(groups, [
        "User-agent: *\nAllow: /",
        ...["GPTBot", "ClaudeBot", "Google-Extended"].map(
          (name) => `User-agent: ${name}\n${name === agent ? "Disallow" : "Allow"}: /`
        ),
        `Sitemap: ${new URL("/sitemap.xml", site).href}`
      ])
    }
    await writeFile(robotsFile, robotsSource)

    try {
      await cli("dev", "--background", "--json")
      const { url } = JSON.parse(await readFile(path.join(temporary, ".astro/dev.json"), "utf8"))
      const fetchDev = (pathname) =>
        globalThis.fetch(new URL(pathname, url), { signal: globalThis.AbortSignal.timeout(30000) })
      const devFeed = await fetchDev("/rss.xml")
      assert.equal(devFeed.status, 200)
      assert.equal(devFeed.headers.get("content-type"), "application/rss+xml; charset=utf-8")
      assert.ok(rss(await devFeed.text()).channel.item.every(({ link }) => !link.includes("draft")))
      const devLlms = await fetchDev("/llms.txt")
      assert.ok(!(await devLlms.text()).includes("draft"))
      for (const pathname of ["/blog/__seo-german-draft/", "/en/blog/__seo-draft/"]) {
        const response = await fetchDev(pathname)
        assert.equal(response.status, 200, "Draft HTML remains available during development")
        const data = page(await response.text())
        assert.ok(
          !data.links.some(({ type }) => ["text/markdown", "application/rss+xml"].includes(type))
        )
        assert.ok(!data.html.includes('type="application/ld+json"'))
      }
      for (const pathname of ["/blog/__seo-german-draft.md", "/en/blog/__seo-draft.md"]) {
        assert.equal(
          (await fetchDev(pathname)).status,
          404,
          "Draft Markdown is not exported in development"
        )
      }
      for (const pathname of ["/en/blog/__seo-english.md", "/en/blog/__seo-nested/entry.md"]) {
        const response = await fetchDev(pathname)
        assert.equal(response.status, 200)
        assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8")
        assert.equal(markdown(await response.text()).body, body)
      }
    } finally {
      await cli("dev", "stop")
    }

    await writeFile(
      path.join(content, "__seo-english.md"),
      updatedPost.replace('updatedDate: "2026-10-03"', 'updatedDate: "2026-10-04"')
    )
    await build()
    const changedFeed = rss(await readFile(path.join(fixtureDist, "rss.xml"), "utf8"))
    const changedItem = changedFeed.channel.item.find(({ link }) => link === fixtureUrl)
    assert.deepEqual(changedItem.guid, fixtureItem.guid)
    assert.equal(changedItem.pubDate, fixtureItem.pubDate)
    assert.equal(changedItem["dcterms:modified"], "2026-10-04")
    assert.equal(changedFeed.channel.item.filter(({ link }) => link === fixtureUrl).length, 1)
    assert.deepEqual(
      changedFeed.channel.item.map(({ link }) => link),
      feed.channel.item.map(({ link }) => link)
    )
    assert.equal(
      markdown(await readFile(path.join(fixtureDist, "en/blog/__seo-english.md"), "utf8")).data
        .updatedDate,
      "2026-10-04"
    )

    for (const [badTitle, badDescription, canonical, message] of [
      [" ", description, "/", /Missing SEO title or description/],
      [title, " ", "/", /Missing SEO title or description/],
      [title, description, "https://example.com/wrong/", /Canonical must use the site origin/]
    ]) {
      await writeFile(fixturePage, template(badTitle, badDescription, canonical))
      await assert.rejects(build, (error) => message.test(`${error.stdout}\n${error.stderr}`))
    }
    await writeFile(fixturePage, template(title, description, "/fotografie/"))
    for (const [field, value] of [
      ["pubDate", '"2026-02-29"'],
      ["pubDate", '"2026-13-01"'],
      ["pubDate", '"01.10.2026"'],
      ["pubDate", '"2026-10-01T00:00:00.000Z"'],
      ["pubDate", "2026-10-01"],
      ["pubDate", "2026-02-30"],
      ["pubDate", "null"],
      ["pubDate", "1790812800000"],
      ["updatedDate", '"2026-09-30"'],
      ["updatedDate", '"2026-04-31"'],
      ["updatedDate", "null"],
      ["updatedDate", "2026-10-03"]
    ]) {
      const invalid = updatedPost.replace(new RegExp(`^${field}: .+$`, "m"), `${field}: ${value}`)
      await writeFile(path.join(content, "__seo-english.md"), invalid)
      await assert.rejects(build, (error) => {
        assert.match(`${error.stdout}\n${error.stderr}`, new RegExp(field), `${field}: ${value}`)
        return true
      })
    }
    const seriesPost = post.replace(
      "draft: false",
      'draft: false\nseries:\n  name: "Test series"\n  part: 1'
    )
    await writeFile(path.join(content, "__seo-english.md"), seriesPost)
    await writeFile(path.join(content, "__seo-older.md"), seriesPost)
    await assert.rejects(build, (error) =>
      /Duplicate part 1 in series "Test series"/.test(`${error.stdout}\n${error.stderr}`)
    )

    for (const file of await readdir(content, { recursive: true })) {
      if (!file.endsWith(".md")) continue
      const filename = path.join(content, file)
      const source = await readFile(filename, "utf8")
      await writeFile(
        filename,
        source.replace(/^---\r?\n([\s\S]*?)\r?\n---/, (_, frontmatter) => {
          const fields = frontmatter.replace(/^draft:.*\r?$/m, "draft: true")
          return `---\n${/^draft:/m.test(fields) ? fields : `${fields}\ndraft: true`}\n---`
        })
      )
    }
    await build()
    const emptyFeed = rss(await readFile(path.join(fixtureDist, "rss.xml"), "utf8"))
    assert.equal(emptyFeed.channel.title, `${siteConfig.name.public} - Blog`)
    assert.deepEqual(emptyFeed.channel.item ?? [], [])
    for (const directory of ["blog", "en/blog"]) {
      assert.ok(
        !(await readdir(path.join(fixtureDist, directory), { recursive: true })).some((file) =>
          file.endsWith(".md")
        )
      )
    }
  } finally {
    const resolved = path.resolve(temporary)
    assert.equal(path.dirname(resolved), path.resolve(tmpdir()))
    assert.ok(path.basename(resolved).startsWith("stefan-karger-seo-"))
    await rm(resolved, { recursive: true, force: true })
  }
})
