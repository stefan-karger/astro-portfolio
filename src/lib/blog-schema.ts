import { z } from "astro/zod"

import { locales } from "../i18n/locales.ts"
import { uniqueTags } from "./blog-tags.ts"

const date = z.iso
  .date({ error: 'Expected a valid date string in "YYYY-MM-DD"; quote dates in frontmatter.' })
  .transform((value) => new Date(`${value}T00:00:00.000Z`))

export const blogSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    pubDate: date,
    updatedDate: date.optional(),
    language: z.enum(locales),
    tags: z.array(z.string()).default([]).transform(uniqueTags),
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
