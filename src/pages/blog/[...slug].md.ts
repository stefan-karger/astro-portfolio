import type { APIRoute } from "astro"

import { getPosts, postMarkdown } from "@/lib/blog"

export async function getStaticPaths() {
  return (await getPosts())
    .filter(({ data }) => !data.draft && data.language === "de")
    .map((post) => ({ params: { slug: post.id }, props: { post } }))
}

export const GET: APIRoute = ({ props, site }) =>
  new Response(postMarkdown(props.post, site), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" }
  })
