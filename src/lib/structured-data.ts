import type { CollectionEntry } from "astro:content"
import { getImage } from "astro:assets"

import portrait from "@/assets/hero.jpg"
import { locales, type Locale } from "@/i18n/types"
import { getTranslations } from "@/i18n/translations"
import { siteConfig } from "@/lib/config"
import { projects } from "@/lib/projects"

async function entities(site: URL | undefined) {
  if (!site) throw new Error("Missing `site` in astro.config.mjs")

  const image = await getImage({
    src: portrait,
    width: 840,
    height: 1050,
    format: "jpeg",
    quality: "high"
  })
  const personId = new URL("/#person", site).href
  const websiteId = new URL("/#website", site).href
  const url = new URL("/", site).href

  return {
    website: {
      "@type": "WebSite",
      "@id": websiteId,
      url,
      name: siteConfig.name.public,
      inLanguage: locales,
      publisher: { "@id": personId }
    },
    person: {
      "@type": "Person",
      "@id": personId,
      name: siteConfig.name.legal,
      alternateName: siteConfig.name.public,
      url,
      image: new URL(image.src, site).href,
      sameAs: siteConfig.socialLinks.map(({ href }) => href)
    }
  }
}

export async function profileGraph({
  site,
  canonicalPath,
  locale,
  title,
  description
}: {
  site: URL | undefined
  canonicalPath: string
  locale: Locale
  title: string
  description: string
}) {
  const { website, person } = await entities(site)
  const canonical = new URL(canonicalPath, website.url).href
  const copy = getTranslations(locale).projects
  const works = [
    {
      "@type": "SoftwareSourceCode",
      "@id": new URL(`/#${projects.solid.id}`, website.url).href,
      name: projects.solid.name,
      description: { "@value": copy.solid.description, "@language": locale },
      url: projects.solid.url,
      codeRepository: projects.solid.repository
    },
    {
      "@type": "CreativeWork",
      "@id": new URL(`/#${projects.lager.id}`, website.url).href,
      name: { "@value": copy.lager.name, "@language": locale },
      description: { "@value": copy.lager.description, "@language": locale },
      url: `${canonical}#${projects.lager.id}`
    }
  ]

  return {
    "@context": "https://schema.org",
    "@graph": [
      website,
      person,
      {
        "@type": "ProfilePage",
        "@id": `${canonical}#profile`,
        url: canonical,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { "@id": website["@id"] },
        mainEntity: { "@id": person["@id"] },
        mentions: works.map((work) => ({ "@id": work["@id"] }))
      },
      ...works
    ]
  }
}

export async function articleGraph({
  site,
  canonicalPath,
  post
}: {
  site: URL | undefined
  canonicalPath: string
  post: CollectionEntry<"blog">
}) {
  const { website, person } = await entities(site)
  const canonical = new URL(canonicalPath, website.url).href

  return {
    "@context": "https://schema.org",
    "@graph": [
      website,
      person,
      {
        "@type": "BlogPosting",
        "@id": `${canonical}#article`,
        url: canonical,
        mainEntityOfPage: canonical,
        headline: post.data.title,
        description: post.data.description,
        inLanguage: post.data.language,
        datePublished: post.data.pubDate.toISOString(),
        ...(post.data.updatedDate ? { dateModified: post.data.updatedDate.toISOString() } : {}),
        author: { "@id": person["@id"] },
        isPartOf: { "@id": website["@id"] },
        ...(post.data.tags.length ? { keywords: post.data.tags } : {})
      }
    ]
  }
}

export type Graph = Awaited<ReturnType<typeof profileGraph> | ReturnType<typeof articleGraph>>
