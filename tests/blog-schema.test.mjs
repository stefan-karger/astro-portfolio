import assert from "node:assert/strict"
import { test } from "node:test"

import { blogSchema } from "../src/lib/blog-schema.ts"

const post = {
  title: "Example",
  description: "An example article.",
  pubDate: "2026-10-01",
  language: "en"
}

for (const field of ["pubDate", "updatedDate"]) {
  test(`${field} accepts a leap day and returns UTC midnight`, () => {
    const parsed = blogSchema.parse({ ...post, pubDate: "1900-01-01", [field]: "2000-02-29" })
    assert.ok(parsed[field] instanceof Date)
    assert.equal(parsed[field].toISOString(), "2000-02-29T00:00:00.000Z")
  })
}

for (const [name, value] of [
  ["a leap day in a non-leap century", "1900-02-29"],
  ["an unpadded date", "2026-2-03"],
  ["a timestamp", "2026-10-01T00:00:00.000Z"],
  ["null", null],
  ["a parsed YAML Date object", new Date("2026-10-01T00:00:00.000Z")]
]) {
  test(`Dates reject ${name} with a field-specific authoring error`, () => {
    for (const field of ["pubDate", "updatedDate"]) {
      const result = blogSchema.safeParse({ ...post, [field]: value })
      assert.equal(result.success, false)
      for (const issue of result.error.issues) assert.deepEqual(issue.path, [field])
      assert.match(result.error.issues[0].message, /YYYY-MM-DD.*quote dates in frontmatter/)
    }
  })
}

test("Publication is required, while an omitted update stays absent", () => {
  const parsed = blogSchema.parse(post)
  assert.equal(parsed.updatedDate, undefined)
  const { pubDate: omitted, ...withoutDate } = post
  assert.ok(omitted)
  const result = blogSchema.safeParse(withoutDate)
  assert.equal(result.success, false)
  assert.deepEqual(result.error.issues[0].path, ["pubDate"])
})

test("Updates may match or follow publication, and earlier updates name updatedDate", () => {
  for (const updatedDate of ["2026-10-01", "2026-10-03"]) {
    assert.equal(
      blogSchema.parse({ ...post, updatedDate }).updatedDate.toISOString(),
      `${updatedDate}T00:00:00.000Z`
    )
  }
  const result = blogSchema.safeParse({ ...post, updatedDate: "2026-09-30" })
  assert.equal(result.success, false)
  assert.deepEqual(result.error.issues[0].path, ["updatedDate"])
  assert.equal(result.error.issues[0].message, "updatedDate must be on or after pubDate.")
})

test("The production schema preserves defaults, trimmed text, and normalized tag order", () => {
  const parsed = blogSchema.parse({
    ...post,
    title: " Example ",
    description: " An example article. ",
    tags: [" Astro ", "TypeScript", "astro", "", " ", "TYPESCRIPT", "C++", " C# "]
  })
  assert.equal(parsed.title, post.title)
  assert.equal(parsed.description, post.description)
  assert.equal(parsed.draft, false)
  assert.equal(parsed.series, undefined)
  assert.deepEqual(parsed.tags, ["Astro", "TypeScript", "C++", "C#"])
  assert.deepEqual(blogSchema.parse(post).tags, [])
})

test("Empty tag arrays and blank names normalize to empty; a comma stays within one tag", () => {
  assert.deepEqual(blogSchema.parse({ ...post, tags: [] }).tags, [])
  assert.deepEqual(blogSchema.parse({ ...post, tags: ["", " "] }).tags, [])
  assert.deepEqual(
    blogSchema.parse({ ...post, tags: [" Research, development ", "research, DEVELOPMENT"] }).tags,
    ["Research, development"]
  )
})

for (const [name, tags] of [
  ["a comma-separated string", "Astro, TypeScript"],
  ["an array containing a number", ["Astro", 42]]
]) {
  test(`Tags reject ${name} with a field-specific error`, () => {
    const result = blogSchema.safeParse({ ...post, tags })
    assert.equal(result.success, false)
    assert.ok(result.error.issues.every(({ path }) => path[0] === "tags"))
  })
}
