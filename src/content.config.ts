import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    pubDate: z.coerce.date(),
    language: z.enum(["de", "en"]),
    tags: z
      .string()
      .default("")
      .transform((value) => [
        ...new Set(
          value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      ]),
    draft: z.boolean().default(false)
  })
})

export const collections = { blog }
