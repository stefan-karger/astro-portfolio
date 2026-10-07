import { createHash } from "node:crypto"
import type { CollectionEntry } from "astro:content"

type Post = Pick<CollectionEntry<"blog">, "data">

export interface BlogFilter {
  type: "month" | "language" | "tag"
  value: string
  key: string
  count: number
}

export function getBlogFilters(posts: Post[]): BlogFilter[] {
  const counts = {
    month: new Map<string, number>(),
    language: new Map<string, number>(),
    tag: new Map<string, number>()
  }

  for (const { data } of posts) {
    const month = data.pubDate.toISOString().slice(0, 7)
    counts.month.set(month, (counts.month.get(month) ?? 0) + 1)
    counts.language.set(data.language, (counts.language.get(data.language) ?? 0) + 1)
    for (const tag of new Set(data.tags)) {
      counts.tag.set(tag, (counts.tag.get(tag) ?? 0) + 1)
    }
  }

  const tagSlugs = new Map<string, string>()
  const slugCounts = new Map<string, number>()
  for (const tag of counts.tag.keys()) {
    const slug = tag
      .normalize("NFKD")
      .replace(/\p{Mark}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    tagSlugs.set(tag, slug)
    slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1)
  }

  const filters: BlogFilter[] = []
  const keys = new Set<string>()
  for (const type of ["month", "language", "tag"] as const) {
    for (const [value, count] of counts[type]) {
      let slug = type === "tag" ? tagSlugs.get(value)! : value
      if (type === "tag" && (!slug || slugCounts.get(slug)! > 1)) {
        const hash = createHash("sha256").update(value).digest("hex").slice(0, 10)
        slug = `${slug || "tag"}-${hash}`
      }
      const key = `${type}-${slug}`
      if (keys.has(key)) throw new Error(`Duplicate blog filter URL: "${key}".`)
      keys.add(key)
      filters.push({ type, value, key, count })
    }
  }

  return filters
}

export function matchesBlogFilter(post: Post, filter: BlogFilter) {
  switch (filter.type) {
    case "month":
      return post.data.pubDate.toISOString().slice(0, 7) === filter.value
    case "language":
      return post.data.language === filter.value
    case "tag":
      return post.data.tags.includes(filter.value)
  }
}
