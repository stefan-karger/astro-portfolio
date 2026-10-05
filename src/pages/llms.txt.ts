import type { APIRoute } from "astro"

import { locales } from "@/i18n/types"
import { getTranslations } from "@/i18n/translations"
import { routeUrl } from "@/i18n/url"
import { getPosts, markdownUrl, postUrl } from "@/lib/blog"
import { siteConfig } from "@/lib/config"
import { projects } from "@/lib/projects"

function link(label: string, url: URL, description?: string) {
  const text = label.replace(/[\\[\]<>]/g, "\\$&").replace(/[\r\n]+/g, " ")
  return `- [${text}](<${url.href}>)${description ? `: ${description}` : ""}`
}

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("Missing `site` in astro.config.mjs")

  const t = getTranslations("en")
  const home = routeUrl("en", "home")
  const posts = (await getPosts()).filter(({ data }) => !data.draft)
  const lines = [
    `# ${siteConfig.name.public}`,
    "",
    `> ${t.home.metaDescription}`,
    "",
    "## Main",
    "",
    ...locales.flatMap((locale) =>
      (["home", "portfolio", "blog"] as const).map((route) =>
        link(`${t.nav[route]} (${t.blog.language[locale]})`, new URL(routeUrl(locale, route), site))
      )
    ),
    "",
    "## Projects",
    "",
    link(
      projects.solid.name,
      new URL(`${home}#${projects.solid.id}`, site),
      t.projects.solid.description
    ),
    link(`${projects.solid.name} website`, new URL(projects.solid.url)),
    link(`${projects.solid.name} GitHub`, new URL(projects.solid.repository)),
    link(
      t.projects.lager.name,
      new URL(`${home}#${projects.lager.id}`, site),
      t.projects.lager.description
    ),
    "",
    "## Blog",
    "",
    ...posts.map((post) =>
      link(post.data.title, new URL(postUrl(post.data.language, post.id), site))
    ),
    "",
    "## Feeds and Markdown",
    "",
    link("Blog RSS feed", new URL("/rss.xml", site)),
    ...posts.map((post) =>
      link(`${post.data.title} (Markdown)`, new URL(markdownUrl(post.data.language, post.id), site))
    )
  ]

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  })
}
