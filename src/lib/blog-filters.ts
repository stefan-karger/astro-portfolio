import type { CollectionEntry } from "astro:content"
import type { Locale } from "../i18n/locales.ts"

import { tagSlug, uniqueTags } from "./blog-tags.ts"

type Post = Pick<CollectionEntry<"blog">, "data">

export type BlogFilter = {
  key: string
  count: number
} & (
  | { type: "month"; value: string }
  | { type: "language"; value: Locale }
  | { type: "tag"; value: string }
)

export function getBlogFilters(posts: Post[]): BlogFilter[] {
  const counts = {
    month: new Map<string, number>(),
    language: new Map<Locale, number>()
  }
  const tagFilters = new Map<string, BlogFilter>()

  for (const { data } of posts) {
    const month = data.pubDate.toISOString().slice(0, 7)
    counts.month.set(month, (counts.month.get(month) ?? 0) + 1)
    counts.language.set(data.language, (counts.language.get(data.language) ?? 0) + 1)
    for (const tag of uniqueTags(data.tags)) {
      const slug = tagSlug(tag)
      if (!slug) {
        throw new Error(`Tag "${tag}" needs a readable URL name. Use letters or numbers.`)
      }
      const existing = tagFilters.get(slug)
      if (existing && existing.value.toLowerCase() !== tag.toLowerCase()) {
        throw new Error(
          `Tags "${existing.value}" and "${tag}" both produce "tag-${slug}". Rename a tag or update the symbol lookup in src/lib/blog-tags.ts.`
        )
      }
      if (existing) {
        existing.count++
      } else {
        tagFilters.set(slug, { type: "tag", value: tag, key: `tag-${slug}`, count: 1 })
      }
    }
  }

  const filters: BlogFilter[] = []
  for (const [value, count] of counts.month) {
    filters.push({ type: "month", value, key: `month-${value}`, count })
  }
  for (const [value, count] of counts.language) {
    filters.push({ type: "language", value, key: `language-${value}`, count })
  }

  return [...filters, ...tagFilters.values()]
}

export function matchesBlogFilter(post: Post, filter: BlogFilter) {
  switch (filter.type) {
    case "month":
      return post.data.pubDate.toISOString().slice(0, 7) === filter.value
    case "language":
      return post.data.language === filter.value
    case "tag": {
      const name = filter.value.toLowerCase()
      return post.data.tags.some((tag) => tag.trim().toLowerCase() === name)
    }
  }
}
