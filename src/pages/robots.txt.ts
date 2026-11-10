import type { APIRoute } from "astro"

const crawlerAccess = {
  GPTBot: true,
  ClaudeBot: true,
  "Google-Extended": true
}

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error("Missing `site` in astro.config.mjs")

  const groups = [
    "User-agent: *\nAllow: /",
    ...Object.entries(crawlerAccess).map(
      ([agent, allowed]) => `User-agent: ${agent}\n${allowed ? "Allow" : "Disallow"}: /`
    ),
    `Sitemap: ${new URL("/sitemap.xml", site).href}`
  ]
  return new Response(`${groups.join("\n\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  })
}
