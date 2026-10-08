import type { APIRoute } from "astro"
import { getRssString } from "@astrojs/rss"

import { getTranslations } from "@/i18n/translations"
import { getPosts, postUrl } from "@/lib/blog"
import { siteConfig } from "@/data/site"

function xml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("Missing `site` in astro.config.mjs")

  const posts = (await getPosts()).filter(({ data }) => !data.draft)
  const feed = await getRssString({
    title: `${siteConfig.name.brand} - Blog`,
    description: getTranslations("en").blog.description,
    site: new URL("/blog/", site),
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
      dc: "http://purl.org/dc/elements/1.1/",
      dcterms: "http://purl.org/dc/terms/"
    },
    customData: `<atom:link href="${xml(new URL("/rss.xml", site).href)}" rel="self" type="application/rss+xml"/>`,
    items: posts.map(({ id, data }) => ({
      title: data.title,
      description: data.description,
      link: new URL(postUrl(data.language, id), site).href,
      pubDate: data.pubDate,
      categories: data.tags,
      customData:
        `<dc:creator>${xml(siteConfig.name.full)}</dc:creator>` +
        `<dc:language>${data.language}</dc:language>` +
        (data.updatedDate
          ? `<dcterms:modified>${data.updatedDate.toISOString().slice(0, 10)}</dcterms:modified>`
          : "")
    }))
  })
  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
  })
}
