import type { APIRoute } from "astro"
import { getRelativeLocaleUrl } from "astro:i18n"

import { locales } from "@/i18n/types"
import { routeUrl } from "@/i18n/url"
import { blogPageSize, getPosts, postUrl } from "@/lib/blog"

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("Missing `site` in astro.config.mjs")

  const pages: { path: string; lastmod?: string }[] = locales.flatMap((locale) =>
    (["home", "portfolio", "blog"] as const).map((route) => ({
      path: routeUrl(locale, route)
    }))
  )
  const posts = (await getPosts()).filter(({ data }) => !data.draft)
  const lastPage = Math.ceil(posts.length / blogPageSize)
  for (let number = 2; number <= lastPage; number++) {
    pages.push(
      ...locales.map((locale) => ({ path: getRelativeLocaleUrl(locale, `blog/${number}`) }))
    )
  }
  pages.push(
    ...posts.map(({ data, id }) => ({
      path: postUrl(data.language, id),
      lastmod: (data.updatedDate ?? data.pubDate).toISOString().slice(0, 10)
    }))
  )

  const urls = pages.map(({ path, lastmod }) => {
    const url = new URL(path, site)
    url.pathname = url.pathname.replace(/\/?$/, "/")
    return `<url><loc>${url.href.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`
  })

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  )
}
