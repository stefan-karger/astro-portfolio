import { getCollection } from "astro:content"
import { getRelativeLocaleUrl } from "astro:i18n"

import type { Locale } from "@/i18n/types"

export async function getPosts() {
  const posts = await getCollection("blog", ({ data }) => !import.meta.env.PROD || !data.draft)

  return posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime() || a.id.localeCompare(b.id)
  )
}

export function postUrl(locale: Locale, id: string) {
  return getRelativeLocaleUrl(locale, `blog/${id}`)
}

export function formatPostDate(locale: Locale, date: Date) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(date)
}
