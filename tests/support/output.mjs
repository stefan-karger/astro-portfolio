import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { URL } from "node:url"
import { XMLParser } from "fast-xml-parser"
import { SyntaxValidator } from "fast-xml-validator"

import config from "../../astro.config.mjs"
import { siteConfig } from "../../src/data/site.ts"
import { de } from "../../src/i18n/translations/de.ts"
import { en } from "../../src/i18n/translations/en.ts"
import { getBlogFilters, matchesBlogFilter } from "../../src/lib/blog-filters.ts"

const site = new URL(config.site)
const translations = { de, en }

export function decode(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
    if (entity.startsWith("#")) {
      return String.fromCodePoint(
        entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
      )
    }
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[entity.toLowerCase()]
  })
}

export function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b(?:[^"'>]|"[^"]*"|'[^']*')*>`, "gi"))].map(
    (match) =>
      Object.fromEntries(
        [...match[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)])
      )
  )
}

export function page(html) {
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

export async function htmlFiles(dir, prefix = "") {
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

export async function readPage(file, directory) {
  return page(await readFile(path.join(directory, file), "utf8"))
}

export function rss(text) {
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

export function markdown(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/)
  assert.ok(match, "Markdown has one generated frontmatter block followed by its body")
  const data = Object.fromEntries(
    [...match[1].matchAll(/^(\w+): (.+)$/gm)].map(([, key, value]) => [key, JSON.parse(value)])
  )
  const series = match[1].match(/^series:\n {2}name: (.+)\n {2}part: (\d+)$/m)
  if (series) data.series = { name: JSON.parse(series[1]), part: Number(series[2]) }
  return { data, body: match[2] }
}

export function structuredData(data) {
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

export function checkArticle(data, slug, language, title, description, date, modified, homePage) {
  assert.equal(data.title, `${title} - ${siteConfig.name.brand}`)
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
  const home = structuredData(homePage)
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
    `${translations[data.lang].blog.author} ${siteConfig.name.full}`
  )
  assert.deepEqual(
    tags(author, "a").map(({ href, rel }) => ({ href, rel })),
    [{ href: data.lang === "de" ? "/" : "/en/", rel: "author" }]
  )
  const dates = data.html.match(/<div\b[^>]*class="post-dates\b[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1]
  assert.ok(dates, "A visible article date exists")
  assert.deepEqual(
    tags(dates, "time").map(({ datetime }) => datetime),
    [modified ?? date],
    "Only the most recent article date is visible"
  )
  const label = translations[data.lang].blog[modified ? "updated" : "published"]
  assert.ok(
    decode(dates.replace(/<[^>]+>/g, ""))
      .trim()
      .startsWith(`${label}:`)
  )
  assert.ok(!dates.includes(translations[data.lang].blog[modified ? "published" : "updated"]))
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

export async function checkBlogPagination(directory, entries) {
  const filters = getBlogFilters(entries)
  const pageCount = (posts) => Math.max(1, Math.ceil(posts.length / 12))
  const pagePath = (base, number) => `${base}${number > 1 ? `/${number}` : ""}`
  const builtFiles = await htmlFiles(directory)
  assert.deepEqual(
    new Set(builtFiles.filter((file) => /^(?:en\/)?blog\/filter\//.test(file))),
    new Set(
      ["", "en/"].flatMap((prefix) =>
        filters.flatMap((filter) =>
          Array.from(
            { length: pageCount(entries.filter((post) => matchesBlogFilter(post, filter))) },
            (_, index) => `${pagePath(`${prefix}blog/filter/${filter.key}`, index + 1)}/index.html`
          )
        )
      )
    )
  )
  assert.deepEqual(
    new Set(builtFiles.filter((file) => /^(?:en\/)?blog(?:\/\d+)?\/index\.html$/.test(file))),
    new Set(
      ["", "en/"].flatMap((prefix) =>
        Array.from(
          { length: pageCount(entries) },
          (_, index) => `${pagePath(`${prefix}blog`, index + 1)}/index.html`
        )
      )
    )
  )
  const navigation = (html) =>
    html.match(/<nav\b[^>]*id="blog-filters"[^>]*>([\s\S]*?)<\/nav>/)?.[1]
  const postLinks = (html) =>
    [...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(([, article]) =>
      tags(article, "a")[0].href.replace(/\/$/, "")
    )

  for (const prefix of ["", "en/"]) {
    const t = translations[prefix ? "en" : "de"]
    const archive = await readPage(`${prefix}blog/index.html`, directory)
    const nav = navigation(archive.html)
    if (entries.length === 0) {
      assert.equal(nav, undefined)
      assert.ok(archive.html.includes(t.blog.empty))
      assert.equal(postLinks(archive.html).length, 0)
      assert.ok(
        !tags(archive.html, "nav").some(
          ({ "aria-label": label }) => label === t.blog.pagination.label
        )
      )
      continue
    }
    assert.ok(nav)
    const baseline = nav.replace(/ aria-current="page"/g, "")
    const reset = tags(nav, "a").filter((link) => link["aria-current"] === "page")
    assert.ok(reset.length > 0, "The archive has a reset link")
    assert.ok(reset.every(({ href }) => href.replace(/\/$/, "") === `/${prefix}blog`))
    const checkPages = async (base, posts, filter) => {
      const seen = []
      const count = pageCount(posts)
      for (let number = 1; number <= count; number++) {
        const pathname = pagePath(base, number)
        const data = await readPage(`${pathname}/index.html`, directory)
        const visible = postLinks(data.html)
        assert.deepEqual(
          visible,
          posts.slice((number - 1) * 12, number * 12).map(({ id }) => `/${prefix}blog/${id}`),
          pathname
        )
        assert.ok(visible.length <= 12, pathname)
        seen.push(...visible)
        assert.equal(data.meta.get("robots"), filter ? "noindex, follow" : undefined)
        assert.equal(
          new URL(data.links.find(({ rel }) => rel === "canonical").href).pathname.replace(
            /\/$/,
            ""
          ),
          encodeURI(`/${pathname}`)
        )
        if (number > 1)
          assert.ok(data.title.endsWith(` - ${t.blog.pagination.page(number)}`), pathname)
        const sidebar = navigation(data.html)
        assert.equal(sidebar.replace(/ aria-current="page"/g, ""), baseline)
        const current = tags(sidebar, "a").filter((link) => link["aria-current"] === "page")
        assert.ok(current.length > 0, "The selected filter is marked")
        assert.ok(current.every(({ href }) => href.replace(/\/$/, "") === `/${base}`))
        assert.ok(
          tags(sidebar, "a").every(({ href }) => !/\/\d+\/?$/.test(href)),
          "Filter selection returns to page 1"
        )
        const pagination = data.html.match(
          /<nav\b[^>]*aria-label="(?:Seitennavigation|Pagination)"[^>]*>([\s\S]*?)<\/nav>/
        )?.[1]
        if (count === 1) {
          assert.equal(pagination, undefined)
        } else {
          assert.ok(pagination?.includes(t.blog.pagination.status(number, count)))
          const expected = []
          if (number > 1) expected.push({ rel: "prev", href: `/${pagePath(base, number - 1)}` })
          if (number < count) expected.push({ rel: "next", href: `/${pagePath(base, number + 1)}` })
          assert.deepEqual(
            tags(pagination, "a").map(({ rel, href }) => ({ rel, href: href.replace(/\/$/, "") })),
            expected
          )
        }
        const otherPath = prefix ? pathname.replace(/^en\//, "") : `en/${pathname}`
        const switchLink = tags(data.html, "a").find(
          (link) => link.hreflang === (prefix ? "de" : "en")
        )
        assert.equal(switchLink.href.replace(/\/$/, ""), encodeURI(`/${otherPath}`))
        assert.equal(
          new URL(
            data.links.find(({ hreflang }) => hreflang === (prefix ? "de" : "en")).href
          ).pathname.replace(/\/$/, ""),
          encodeURI(`/${otherPath}`)
        )
      }
      assert.deepEqual(
        seen,
        posts.map(({ id }) => `/${prefix}blog/${id}`),
        "The complete archive has no gaps or duplicates"
      )
    }
    await checkPages(`${prefix}blog`, entries)
    for (const filter of filters) {
      const matching = entries.filter((post) => matchesBlogFilter(post, filter))
      assert.equal(matching.length, filter.count)
      await checkPages(`${prefix}blog/filter/${filter.key}`, matching, filter)
    }
  }
}
