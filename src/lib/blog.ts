import type { GetStaticPathsOptions } from "astro"
import { getCollection, type CollectionEntry } from "astro:content"
import { getRelativeLocaleUrl } from "astro:i18n"

import type { Locale } from "@/i18n/types"
import { getTranslations } from "@/i18n/translations"
import { getBlogFilters, matchesBlogFilter, type BlogFilter } from "@/lib/blog-filters"
import { siteConfig } from "@/lib/config"

export const blogPageSize = 12

export async function getPosts() {
  const posts = await getCollection("blog", ({ data }) => !import.meta.env.PROD || !data.draft)

  const parts = new Map<string, string>()
  for (const post of posts) {
    if (/^\d+$/.test(post.id)) {
      throw new Error(`Numeric blog ID "${post.id}" is reserved for pagination.`)
    }
    if (!post.data.series) continue
    const { name, part } = post.data.series
    const key = JSON.stringify([post.data.language, name, part])
    const duplicate = parts.get(key)
    if (duplicate) {
      throw new Error(
        `Duplicate part ${part} in series "${name}": "${duplicate}" and "${post.id}".`
      )
    }
    parts.set(key, post.id)
  }

  return posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime() || a.id.localeCompare(b.id)
  )
}

export function postUrl(locale: Locale, id: string) {
  return getRelativeLocaleUrl(locale, `blog/${id}`)
}

export async function getBlogPaths({ paginate }: GetStaticPathsOptions) {
  const posts = await getPosts()
  return paginate(posts, {
    pageSize: blogPageSize,
    props: { filters: getBlogFilters(posts) }
  })
}

export async function getBlogFilterPaths({ paginate }: GetStaticPathsOptions) {
  const posts = await getPosts()
  const filters = getBlogFilters(posts)
  return filters.flatMap((filter) =>
    paginate(
      posts.filter((post) => matchesBlogFilter(post, filter)),
      {
        params: { filter: filter.key },
        pageSize: blogPageSize,
        props: { filter, filters }
      }
    )
  )
}

export function formatBlogFilter(locale: Locale, filter: BlogFilter) {
  if (filter.type === "month") {
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(`${filter.value}-01T00:00:00.000Z`))
  }
  if (filter.type === "language") {
    return getTranslations(locale).blog.language[filter.value as Locale]
  }
  return filter.value
}

export function markdownUrl(locale: Locale, id: string) {
  return `${postUrl(locale, id).replace(/\/$/, "")}.md`
}

export function postMarkdown(post: CollectionEntry<"blog">, site: URL | undefined) {
  if (!site) throw new Error("Missing `site` in astro.config.mjs")
  if (typeof post.body !== "string") {
    throw new Error(`Missing Markdown body for blog post "${post.id}".`)
  }

  const { data } = post
  const lines = [
    "---",
    `title: ${JSON.stringify(data.title)}`,
    `description: ${JSON.stringify(data.description)}`,
    `author: ${JSON.stringify(siteConfig.name.legal)}`,
    `language: ${JSON.stringify(data.language)}`,
    `pubDate: ${JSON.stringify(data.pubDate.toISOString().slice(0, 10))}`
  ]
  if (data.updatedDate) {
    lines.push(`updatedDate: ${JSON.stringify(data.updatedDate.toISOString().slice(0, 10))}`)
  }
  lines.push(
    `tags: ${JSON.stringify(data.tags)}`,
    `canonical: ${JSON.stringify(new URL(postUrl(data.language, post.id), site).href)}`
  )
  if (data.series) {
    lines.push(
      "series:",
      `  name: ${JSON.stringify(data.series.name)}`,
      `  part: ${data.series.part}`
    )
  }
  return `${lines.join("\n")}\n---\n\n${post.body}`
}

export function formatPostDate(locale: Locale, date: Date) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(date)
}
