import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

import { locales } from "@/i18n/types"

const date = z.iso
  .date({ error: 'Expected a valid date string in "YYYY-MM-DD"; quote dates in frontmatter.' })
  .transform((value) => new Date(`${value}T00:00:00.000Z`))

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z
    .object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      pubDate: date,
      updatedDate: date.optional(),
      language: z.enum(locales),
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
      draft: z.boolean().default(false),
      series: z
        .object({
          name: z.string().trim().min(1),
          part: z.number().int().positive()
        })
        .optional()
    })
    .refine(({ pubDate, updatedDate }) => !updatedDate || updatedDate >= pubDate, {
      path: ["updatedDate"],
      message: "updatedDate must be on or after pubDate."
    })
})

export const collections = { blog }
