import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { createHash } from "node:crypto"
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  symlink,
  writeFile
} from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { performance } from "node:perf_hooks"
import process from "node:process"
import { test } from "node:test"
import { fileURLToPath, pathToFileURL, URL } from "node:url"
import { inspect, promisify } from "node:util"
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
  assert.equal(metadata.width, 840)
  assert.equal(metadata.height, 1050)
  for (const field of ["exif", "xmp", "iptc"]) {
    assert.equal(metadata[field], undefined, `The portrait has no ${field.toUpperCase()} metadata`)
  }
  for (const data of profiles) {
    const hero = tags(data.html, "img")[0]
    assert.equal(new URL(hero.src, site).href, image.href, `${data.file} reuses its JPEG fallback`)
  }
})

test("The build does not publish the original portrait under any filename", async () => {
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

async function runNode(args, { cwd, timeout = 60000 }) {
  const started = performance.now()
  const details = {
    command: [process.execPath, ...args],
    cwd,
    timeout,
    startedAt: new Date().toISOString()
  }
  try {
    const pending = run(process.execPath, args, {
      cwd,
      timeout,
      maxBuffer: 4 * 1024 * 1024,
      windowsHide: true
    })
    details.pid = pending.child.pid
    const output = await pending
    const duration = Math.round(performance.now() - started)
    return {
      ...output,
      duration,
      process: { ...details, ...output, duration, code: 0, signal: null, killed: false }
    }
  } catch (error) {
    throw Object.assign(
      new Error(
        [
          `Command: ${JSON.stringify([process.execPath, ...args])}`,
          `Directory: ${cwd}`,
          `Duration: ${Math.round(performance.now() - started)} ms; timeout: ${timeout} ms`,
          `Code: ${error.code}; signal: ${error.signal ?? "none"}; killed: ${error.killed ?? false}`,
          `Original error: ${error.message}`,
          `stdout: ${JSON.stringify(error.stdout ?? "")}`,
          `stderr: ${JSON.stringify(error.stderr ?? "")}`
        ].join("\n"),
        { cause: error }
      ),
      {
        code: error.code,
        signal: error.signal,
        killed: error.killed,
        stdout: error.stdout,
        stderr: error.stderr,
        process: {
          ...details,
          duration: Math.round(performance.now() - started),
          code: error.code,
          signal: error.signal ?? null,
          killed: error.killed ?? false,
          stdout: error.stdout ?? "",
          stderr: error.stderr ?? ""
        }
      }
    )
  }
}

async function expectFailure(action, messages, fixture) {
  let output
  let error
  try {
    output = await action()
  } catch (failure) {
    error = failure
  }
  assert.ok(
    error,
    `Fixture: ${fixture} must fail validation, but the process succeeded.\nDuration: ${output?.duration} ms\nstdout: ${JSON.stringify(output?.stdout ?? "")}\nstderr: ${JSON.stringify(output?.stderr ?? "")}`
  )
  const details = `Fixture: ${fixture}\n${error.message}`
  try {
    assert.ok(Number.isInteger(error.code) && error.code !== 0, details)
    assert.ok(!error.signal && !error.killed, details)
    for (const message of messages) {
      assert.match(`${error.stdout ?? ""}\n${error.stderr ?? ""}`, message, details)
    }
  } catch (failure) {
    failure.cause = error
    throw failure
  }
}

async function saveFailure(
  directory,
  error,
  history,
  destination = path.join(project, ".astro/seo-failures")
) {
  await mkdir(destination, { recursive: true })
  const artifact = await mkdtemp(path.join(destination, "failure-"))
  const packageData = JSON.parse(await readFile(path.join(project, "package.json"), "utf8"))
  const astro = JSON.parse(
    await readFile(path.join(project, "node_modules/astro/package.json"), "utf8")
  )
  await writeFile(
    path.join(artifact, "failure.json"),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        checkout: directory,
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        packageManager: packageData.packageManager,
        astro: astro.version,
        error: inspect(error, { depth: 8 }),
        ...history
      },
      null,
      2
    ) + "\n"
  )
  await cp(fileURLToPath(import.meta.url), path.join(artifact, "seo.spec.mjs"))
  // Exclude the dependency junction so a snapshot never copies or mutates shared dependencies.
  for (const entry of await readdir(directory)) {
    if (entry === "node_modules") continue
    await cp(path.join(directory, entry), path.join(artifact, "checkout", entry), {
      recursive: true,
      preserveTimestamps: true
    })
  }
  return artifact
}

async function withFiles(changes, action, onFailure) {
  const originals = new Map()
  for (const file of changes.keys()) originals.set(file, await readFile(file, "utf8"))
  const errors = []
  try {
    for (const [file, source] of changes) await writeFile(file, source)
    await action()
  } catch (error) {
    errors.push(error)
    if (onFailure) {
      try {
        await onFailure(error)
      } catch (captureError) {
        errors.push(captureError)
      }
    }
  } finally {
    for (const [file, source] of originals) {
      try {
        await writeFile(file, source)
      } catch (error) {
        errors.push(error)
      }
    }
  }
  if (errors.length === 1) throw errors[0]
  if (errors.length > 1)
    throw new AggregateError(errors, "Scenario and fixture restoration failed", {
      cause: errors[0]
    })
}

test("Subprocess validation assertions distinguish content errors from process failures", async (t) => {
  const child = (source, timeout) => () => runNode(["--eval", source], { cwd: project, timeout })
  const message = /Expected a valid date string/
  await t.test("A normal validation error is accepted", async () => {
    await expectFailure(
      child('console.error("pubDate: Expected a valid date string"); process.exitCode = 1'),
      [/pubDate/, message],
      "valid rejection"
    )
  })
  for (const [name, source, timeout] of [
    ["An unrelated error", 'console.error("unrelated failure"); process.exitCode = 1'],
    ["An empty-output exit", "process.exitCode = 1"],
    [
      "A timeout after printing the expected message",
      'console.error("Expected a valid date string"); setInterval(() => {}, 1000)',
      1000
    ],
    [
      "A successful process printing the expected message",
      'console.error("Expected a valid date string")'
    ]
  ]) {
    await t.test(name, async () => {
      await assert.rejects(
        () => expectFailure(child(source, timeout), [message], name),
        (error) => {
          assert.ok(error.message.includes(`Fixture: ${name}`), error.message)
          if (name.startsWith("A successful")) {
            assert.match(error.message, /the process succeeded/)
            assert.match(error.message, /stderr: "Expected a valid date string\\n"/)
          } else {
            assert.ok(error.cause.cause instanceof Error)
            for (const detail of [
              "Command:",
              "Directory:",
              "Duration:",
              "Code:",
              "signal:",
              "killed:",
              "Original error:",
              "stdout:",
              "stderr:"
            ]) {
              assert.ok(error.message.includes(detail), error.message)
            }
            if (name === "An empty-output exit")
              assert.match(error.message, /stdout: ""\nstderr: ""/)
            if (timeout) assert.match(error.message, /killed: true/)
          }
          return true
        }
      )
    })
  }
  await t.test("The original launch error is preserved", async () => {
    await assert.rejects(
      () =>
        runNode(["--eval", ""], { cwd: path.join(project, "__missing-subprocess-directory__") }),
      (error) => {
        assert.equal(error.code, "ENOENT")
        assert.equal(error.cause.code, "ENOENT")
        assert.match(error.message, /Original error:/)
        return true
      }
    )
  })
})

test("Fixture restoration survives scenario failures and reports cleanup errors", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "stefan-karger-seo-files-"))
  const artifacts = await mkdtemp(path.join(tmpdir(), "stefan-karger-seo-artifacts-"))
  let artifact
  try {
    const first = path.join(directory, "first.md")
    const second = path.join(directory, "second.md")
    await writeFile(first, "first original")
    await writeFile(second, "second original")
    const changes = new Map([
      [first, "first changed"],
      [second, "second changed"]
    ])
    await t.test("A failed scenario restores both fixtures before the next scenario", async () => {
      const failure = new Error("deliberate scenario failure")
      await assert.rejects(
        () =>
          withFiles(changes, async () => {
            assert.equal(await readFile(first, "utf8"), "first changed")
            assert.equal(await readFile(second, "utf8"), "second changed")
            throw failure
          }),
        (error) => error === failure
      )
      assert.equal(await readFile(first, "utf8"), "first original")
      assert.equal(await readFile(second, "utf8"), "second original")
      await withFiles(changes, async () => {
        assert.equal(await readFile(first, "utf8"), "first changed")
        assert.equal(await readFile(second, "utf8"), "second changed")
      })
      assert.equal(await readFile(first, "utf8"), "first original")
      assert.equal(await readFile(second, "utf8"), "second original")
    })
    await t.test(
      "An unexpected exit preserves the failing fixture and cache before restoration",
      async () => {
        const cache = path.join(directory, ".astro/cache")
        await mkdir(cache, { recursive: true })
        await writeFile(path.join(cache, "data-store.json"), "failing cache state")
        await symlink(
          path.join(project, "node_modules"),
          path.join(directory, "node_modules"),
          process.platform === "win32" ? "junction" : "dir"
        )
        const commands = []
        const action = async () => {
          try {
            await runNode(["--eval", "process.exitCode = 1"], { cwd: directory })
          } catch (error) {
            commands.push(error.process)
            throw error
          }
        }
        await assert.rejects(
          () =>
            withFiles(
              changes,
              () => expectFailure(action, [/pubDate/], "invalid date fixture"),
              async (error) => {
                artifact = await saveFailure(
                  directory,
                  error,
                  {
                    scenario: "invalid date fixture",
                    scenarios: ["initial build", "invalid date fixture"],
                    commands
                  },
                  artifacts
                )
              }
            ),
          /stdout: ""\nstderr: ""/
        )
        assert.equal(await readFile(first, "utf8"), "first original")
        assert.equal(await readFile(second, "utf8"), "second original")
        assert.equal(
          await readFile(path.join(artifact, "checkout/first.md"), "utf8"),
          "first changed"
        )
        assert.equal(
          await readFile(path.join(artifact, "checkout/.astro/cache/data-store.json"), "utf8"),
          "failing cache state"
        )
        await assert.rejects(stat(path.join(artifact, "checkout/node_modules")), { code: "ENOENT" })
        const saved = JSON.parse(await readFile(path.join(artifact, "failure.json"), "utf8"))
        assert.equal(saved.scenario, "invalid date fixture")
        assert.deepEqual(saved.scenarios, ["initial build", "invalid date fixture"])
        assert.equal(saved.node, process.version)
        assert.equal(
          await readFile(path.join(artifact, "seo.spec.mjs"), "utf8"),
          await readFile(fileURLToPath(import.meta.url), "utf8")
        )
        assert.equal(saved.commands[0].code, 1)
        assert.equal(saved.commands[0].stdout, "")
        assert.equal(saved.commands[0].stderr, "")
        assert.equal(typeof saved.commands[0].pid, "number")
      }
    )
    await t.test("Expected validation rejections do not capture artifacts", async () => {
      let captured = false
      await withFiles(
        changes,
        () =>
          expectFailure(
            () =>
              runNode(
                [
                  "--eval",
                  'console.error("pubDate: Expected a valid date string"); process.exitCode = 1'
                ],
                { cwd: directory }
              ),
            [/pubDate/, /Expected a valid date string/],
            "expected rejection"
          ),
        () => {
          captured = true
        }
      )
      assert.equal(captured, false)
      assert.equal(await readFile(first, "utf8"), "first original")
      assert.equal(await readFile(second, "utf8"), "second original")
    })
    await t.test(
      "Capture errors preserve the scenario failure and still restore both fixtures",
      async () => {
        const failure = new Error("unexpected process exit")
        const captureError = new Error("artifact write failed")
        await assert.rejects(
          () =>
            withFiles(
              changes,
              () => {
                throw failure
              },
              () => {
                throw captureError
              }
            ),
          (error) => {
            assert.ok(error instanceof AggregateError)
            assert.equal(error.cause, failure)
            assert.deepEqual(error.errors, [failure, captureError])
            return true
          }
        )
        assert.equal(await readFile(first, "utf8"), "first original")
        assert.equal(await readFile(second, "utf8"), "second original")
      }
    )
    await t.test("Restoration attempts continue and retain the original failure", async () => {
      const failure = new Error("scenario failed before cleanup")
      await assert.rejects(
        () =>
          withFiles(changes, async () => {
            await rm(first)
            await mkdir(first)
            throw failure
          }),
        (error) => {
          assert.ok(error instanceof AggregateError)
          assert.equal(error.cause, failure)
          assert.equal(error.errors[0], failure)
          assert.equal(error.errors.length, 2)
          return true
        }
      )
      assert.equal(await readFile(second, "utf8"), "second original")
    })
  } finally {
    const resolved = path.resolve(directory)
    assert.equal(path.dirname(resolved), path.resolve(tmpdir()))
    assert.ok(path.basename(resolved).startsWith("stefan-karger-seo-files-"))
    await rm(resolved, { recursive: true, force: true })
    // Failure artifacts survive removal of the original checkout.
    if (artifact)
      assert.equal(
        await readFile(path.join(artifact, "checkout/first.md"), "utf8"),
        "first changed"
      )
    const resolvedArtifacts = path.resolve(artifacts)
    assert.equal(path.dirname(resolvedArtifacts), path.resolve(tmpdir()))
    assert.ok(path.basename(resolvedArtifacts).startsWith("stefan-karger-seo-artifacts-"))
    await rm(resolvedArtifacts, { recursive: true, force: true })
  }
})

test("Isolated SEO integration", async (t) => {
  const temporary = await mkdtemp(path.join(tmpdir(), "stefan-karger-seo-"))
  const scenarios = []
  const commands = []
  let scenario
  let preserved = false
  let failure
  const captureFailure = async (error) => {
    if (preserved) return
    failure = error
    preserved = true
    t.diagnostic(`Retaining failed checkout: ${temporary}`)
    const artifact = await saveFailure(temporary, error, { scenario, scenarios, commands })
    t.diagnostic(`Failure snapshot before fixture restoration: ${artifact}`)
  }
  t.beforeEach((context) => {
    scenario = context.name
    scenarios.push(scenario)
  })
  t.afterEach(async (context) => {
    if (context.error) await captureFailure(context.error.cause ?? context.error)
  })
  // Node records subtest failures without rejecting t.test(); stop before another scenario runs.
  const scenarioTest = async (...args) => {
    await t.test(...args)
    if (preserved) throw failure
  }
  let cli
  let serverStopped = true
  try {
    await cp(path.join(project, "src"), path.join(temporary, "src"), { recursive: true })
    await cp(path.join(project, "public"), path.join(temporary, "public"), { recursive: true })
    for (const file of ["tsconfig.json", "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml"]) {
      await cp(path.join(project, file), path.join(temporary, file))
    }
    await cp(
      path.join(project, "astro.config.mjs"),
      path.join(temporary, "astro.project.config.mjs")
    )
    // Dependencies are shared through a junction; writable caches must belong to this checkout.
    await writeFile(
      path.join(temporary, "astro.config.mjs"),
      'import config from "./astro.project.config.mjs"\nexport default { ...config, cacheDir: "./.astro/cache", vite: { ...config.vite, cacheDir: "./.astro/vite" } }\n'
    )
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
    cli = async (...args) => {
      try {
        const output = await runNode(
          [path.join(project, "node_modules/astro/bin/astro.mjs"), ...args],
          { cwd: temporary }
        )
        commands.push({ scenario, ...output.process })
        t.diagnostic(`astro ${args.join(" ")} completed in ${output.duration} ms`)
        return output
      } catch (error) {
        commands.push({ scenario, ...error.process })
        throw error
      }
    }
    const build = () => cli("build")
    let built = false
    await scenarioTest("Production fixture build", async () => {
      await build()
      built = true
    })
    const fixtureDist = path.join(temporary, "dist")
    const fixtureUrl = new URL("/en/blog/__seo-english/", site).href
    const nestedUrl = new URL("/en/blog/__seo-nested/entry/", site).href
    let feed
    let fixtureItem
    await scenarioTest("Production feed metadata and ordering", { skip: !built }, async () => {
      feed = rss(await readFile(path.join(fixtureDist, "rss.xml"), "utf8"))
      fixtureItem = feed.channel.item.find(({ link }) => link === fixtureUrl)
      assert.ok(fixtureItem)
      assert.equal(fixtureItem.title, title)
      assert.equal(fixtureItem.description, description)
      assert.equal(fixtureItem["dc:creator"], siteConfig.name.legal)
      assert.equal(fixtureItem["dc:language"], "en")
      assert.equal(fixtureItem["dcterms:modified"], "2026-10-03")
      assert.deepEqual(fixtureItem.category, ["Astro", "TypeScript"])
      assert.equal(feed.channel.item.filter(({ link }) => link === fixtureUrl).length, 1)
      assert.ok(feed.channel.item.every(({ link }) => !link.includes("draft")))
      assert.ok(
        feed.channel.item.findIndex(({ link }) => link === fixtureUrl) <
          feed.channel.item.findIndex(({ link }) => link === nestedUrl),
        "Equal publication dates use ID ordering"
      )
    })

    await scenarioTest("Markdown exports and draft exclusions", { skip: !built }, async () => {
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
    })

    await scenarioTest(
      "Sitemap content language and draft exclusion",
      { skip: !built },
      async () => {
        const sitemap = await readFile(path.join(fixtureDist, "sitemap.xml"), "utf8")
        const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
          decode(match[1])
        )
        assert.ok(sitemapUrls.includes(new URL("/en/blog/__seo-english/", site).href))
        assert.ok(!sitemapUrls.includes(new URL("/blog/__seo-english/", site).href))
        assert.ok(!sitemap.includes("__seo-draft"), "Drafts are excluded from the sitemap")
      }
    )

    await scenarioTest(
      "Localized article metadata, tags and ordering",
      { skip: !built },
      async () => {
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
          const tagList = article.html.match(
            /<ul\b[^>]*aria-label="Tags"[^>]*>([\s\S]*?)<\/ul>/
          )?.[1]
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
          assert.ok(
            neighbors.includes(articleLinks[position - 1]),
            "Next links to the newer article"
          )
        }
      }
    )

    await scenarioTest("Draft artifacts and llms.txt exports", { skip: !built }, async () => {
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
    })

    await scenarioTest("SEO escaping and canonical normalization", { skip: !built }, async () => {
      const escaped = await readPage("seo-fixture/index.html", fixtureDist)
      assert.equal(escaped.title, title)
      assert.equal(escaped.meta.get("description"), description)
      assert.ok(escaped.html.match(/<title>([\s\S]*?)<\/title>/)[1].includes("&lt;text&gt;"))
      assert.equal(escaped.meta.get("og:url"), new URL("/fotografie/", site).href)
    })

    const robotsFile = path.join(temporary, "src/pages/robots.txt.ts")
    const robotsSource = await readFile(robotsFile, "utf8")
    for (const agent of ["GPTBot", "ClaudeBot", "Google-Extended"]) {
      const key = agent.includes("-") ? JSON.stringify(agent) : agent
      const blockedSource = robotsSource.replace(`${key}: true`, `${key}: false`)
      assert.notEqual(blockedSource, robotsSource, `The ${agent} switch exists`)
      await scenarioTest(`Crawler switch: ${agent}`, async () => {
        await withFiles(
          new Map([[robotsFile, blockedSource]]),
          async () => {
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
          },
          captureFailure
        )
      })
    }

    serverStopped = false
    await scenarioTest("Development drafts and exports", async (devTest) => {
      const errors = []
      try {
        const lock = path.join(temporary, ".astro/dev.json")
        await assert.rejects(readFile(lock), { code: "ENOENT" })
        const started = Date.now()
        await cli("dev", "--background", "--json")
        const server = JSON.parse(await readFile(lock, "utf8"))
        assert.equal(server.background, true, "The fixture server runs in background mode")
        assert.ok(Date.parse(server.startedAt) >= started, "The fixture server is freshly started")
        commands.at(-1).server = server
        devTest.diagnostic(
          `Fresh dev server: pid ${server.pid}, started ${server.startedAt}, ${server.url}`
        )
        const { url } = server
        const fetchDev = (pathname) =>
          globalThis.fetch(new URL(pathname, url), {
            signal: globalThis.AbortSignal.timeout(30000)
          })
        const devFeed = await fetchDev("/rss.xml")
        assert.equal(devFeed.status, 200)
        assert.equal(devFeed.headers.get("content-type"), "application/rss+xml; charset=utf-8")
        assert.ok(
          rss(await devFeed.text()).channel.item.every(({ link }) => !link.includes("draft"))
        )
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
      } catch (error) {
        errors.push(error)
        for (const command of ["status", "logs"]) {
          try {
            const output = await cli("dev", command)
            devTest.diagnostic(`astro dev ${command}: ${output.stdout}\n${output.stderr}`)
          } catch (diagnosticError) {
            devTest.diagnostic(diagnosticError.message)
          }
        }
      } finally {
        try {
          await cli("dev", "stop")
          serverStopped = true
        } catch (error) {
          errors.push(error)
        }
      }
      if (errors.length === 1) throw errors[0]
      if (errors.length > 1)
        throw new AggregateError(errors, "Development scenario and shutdown failed", {
          cause: errors[0]
        })
    })
    assert.ok(serverStopped, "Stop the isolated dev server before mutating fixtures or building")
    await scenarioTest(
      "Astro and Vite caches belong to the temporary checkout",
      { skip: !built },
      async () => {
        const root = await realpath(temporary)
        for (const directory of [".astro/cache", ".astro/vite"]) {
          const resolved = await realpath(path.join(temporary, directory))
          const relative = path.relative(root, resolved)
          assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative), resolved)
        }
        const store = await readFile(path.join(temporary, ".astro/cache/data-store.json"), "utf8")
        assert.ok(store.includes("__seo-english"), "The build reads its own fixture content store")
      }
    )

    await scenarioTest(
      "Updates preserve feed identity and ordering",
      { skip: !fixtureItem },
      async () => {
        await withFiles(
          new Map([
            [
              path.join(content, "__seo-english.md"),
              updatedPost.replace('updatedDate: "2026-10-03"', 'updatedDate: "2026-10-04"')
            ]
          ]),
          async () => {
            await build()
            const changedFeed = rss(await readFile(path.join(fixtureDist, "rss.xml"), "utf8"))
            const changedItem = changedFeed.channel.item.find(({ link }) => link === fixtureUrl)
            assert.deepEqual(changedItem.guid, fixtureItem.guid)
            assert.equal(changedItem.pubDate, fixtureItem.pubDate)
            assert.equal(changedItem["dcterms:modified"], "2026-10-04")
            assert.equal(
              changedFeed.channel.item.filter(({ link }) => link === fixtureUrl).length,
              1
            )
            assert.deepEqual(
              changedFeed.channel.item.map(({ link }) => link),
              feed.channel.item.map(({ link }) => link)
            )
            assert.equal(
              markdown(await readFile(path.join(fixtureDist, "en/blog/__seo-english.md"), "utf8"))
                .data.updatedDate,
              "2026-10-04"
            )
          },
          captureFailure
        )
      }
    )

    for (const [name, badTitle, badDescription, canonical, message] of [
      ["Missing title", " ", description, "/", /Missing SEO title or description/],
      ["Missing description", title, " ", "/", /Missing SEO title or description/],
      [
        "Foreign canonical origin",
        title,
        description,
        "https://example.com/wrong/",
        /Canonical must use the site origin/
      ]
    ]) {
      await scenarioTest(name, async () => {
        await withFiles(
          new Map([[fixturePage, template(badTitle, badDescription, canonical)]]),
          async () => {
            await expectFailure(
              build,
              [message],
              `seo-fixture.astro: title=${JSON.stringify(badTitle)}, description=${JSON.stringify(badDescription)}, canonical=${canonical}`
            )
          },
          captureFailure
        )
      })
    }
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
      await scenarioTest(`Invalid date: ${field}: ${value}`, async () => {
        await withFiles(
          new Map([[path.join(content, "__seo-english.md"), invalid]]),
          async () => {
            await expectFailure(
              build,
              [
                new RegExp(field),
                field === "updatedDate" && value === '"2026-09-30"'
                  ? /updatedDate must be on or after pubDate/
                  : /Expected a valid date string/
              ],
              `__seo-english.md: ${field}: ${value}`
            )
          },
          captureFailure
        )
      })
    }
    await scenarioTest("Duplicate series parts are rejected", async () => {
      const seriesPost = post.replace(
        "draft: false",
        'draft: false\nseries:\n  name: "Test series"\n  part: 1'
      )
      await withFiles(
        new Map([
          [path.join(content, "__seo-english.md"), seriesPost],
          [path.join(content, "__seo-older.md"), seriesPost]
        ]),
        async () => {
          await expectFailure(
            build,
            [/Duplicate part 1 in series "Test series"/],
            "__seo-english.md and __seo-older.md: duplicate series part"
          )
        },
        captureFailure
      )
    })

    await scenarioTest(
      "An empty published collection has no feed items or Markdown exports",
      async () => {
        const drafts = new Map()
        for (const file of await readdir(content, { recursive: true })) {
          if (!file.endsWith(".md")) continue
          const filename = path.join(content, file)
          const source = await readFile(filename, "utf8")
          drafts.set(
            filename,
            source.replace(/^---\r?\n([\s\S]*?)\r?\n---/, (_, frontmatter) => {
              const fields = frontmatter.replace(/^draft:.*\r?$/m, "draft: true")
              return `---\n${/^draft:/m.test(fields) ? fields : `${fields}\ndraft: true`}\n---`
            })
          )
        }
        await withFiles(
          drafts,
          async () => {
            await build()
            const emptyFeed = rss(await readFile(path.join(fixtureDist, "rss.xml"), "utf8"))
            assert.equal(emptyFeed.channel.title, `${siteConfig.name.public} - Blog`)
            assert.deepEqual(emptyFeed.channel.item ?? [], [])
            for (const directory of ["blog", "en/blog"]) {
              assert.ok(
                !(await readdir(path.join(fixtureDist, directory), { recursive: true })).some(
                  (file) => file.endsWith(".md")
                )
              )
            }
          },
          captureFailure
        )
      }
    )
  } catch (error) {
    failure = error
    try {
      await captureFailure(error)
    } catch (captureError) {
      failure = new AggregateError(
        [error, captureError],
        "Integration and failure capture failed",
        {
          cause: error
        }
      )
    }
  }
  try {
    if (!serverStopped) await cli("dev", "stop")
    const resolved = path.resolve(temporary)
    assert.equal(path.dirname(resolved), path.resolve(tmpdir()))
    assert.ok(path.basename(resolved).startsWith("stefan-karger-seo-"))
    if (!preserved) await rm(resolved, { recursive: true, force: true })
  } catch (error) {
    if (failure)
      throw new AggregateError([failure, error], "Integration and cleanup failed", { cause: error })
    throw error
  }
  if (failure) throw failure
})
