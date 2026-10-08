import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"

import { blogSchema } from "@/lib/blog-schema"

const blog = defineCollection({
  // Render through Vite when the page uses the entry, so diagram assets follow
  // configuration reloads instead of retaining HTML from the content store.
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog", deferRender: true }),
  schema: blogSchema
})

export const collections = { blog }
