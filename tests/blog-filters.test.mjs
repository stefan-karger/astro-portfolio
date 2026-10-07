import assert from "node:assert/strict"
import { test } from "node:test"

import { getBlogFilters, matchesBlogFilter } from "../src/lib/blog-filters.ts"

function post(date, language, tags) {
  return { data: { pubDate: new Date(`${date}T00:00:00.000Z`), language, tags } }
}

test("Only populated months, languages and tags appear, counting each post once", () => {
  const posts = [
    post("2026-03-01", "de", ["Astro", "Astro", "Photography"]),
    post("2026-03-31", "en", ["Photography"]),
    post("2025-03-01", "de", [])
  ]
  const filters = getBlogFilters(posts)
  assert.deepEqual(Object.fromEntries(filters.map(({ key, count }) => [key, count])), {
    "month-2026-03": 2,
    "month-2025-03": 1,
    "language-de": 2,
    "language-en": 1,
    "tag-astro": 1,
    "tag-photography": 2
  })
  assert.deepEqual(getBlogFilters([]), [])
  assert.deepEqual(
    getBlogFilters([post("2026-03-01", "de", [])]).map(({ key }) => key),
    ["month-2026-03", "language-de"]
  )
})

test("Each filter independently matches its month, content language or exact authored tag", () => {
  const posts = [
    post("2026-03-01", "de", ["Street photography"]),
    post("2026-03-31", "en", ["Astro"]),
    post("2025-03-01", "de", ["Street photography", "Astro"])
  ]
  const filters = getBlogFilters(posts)
  const matching = (key) =>
    posts.filter((entry) =>
      matchesBlogFilter(
        entry,
        filters.find((filter) => filter.key === key)
      )
    )
  assert.deepEqual(matching("month-2026-03"), [posts[0], posts[1]])
  assert.deepEqual(matching("language-de"), [posts[0], posts[2]])
  assert.deepEqual(matching("tag-street-photography"), [posts[0], posts[2]])
  assert.deepEqual(matching("tag-astro"), [posts[1], posts[2]])
  assert.equal(
    matchesBlogFilter(
      post("2026-03-01", "de", ["astro"]),
      filters.find(({ key }) => key === "tag-astro")
    ),
    false
  )
})

test("Tag URLs preserve matching values and distinguish punctuation, accents and case collisions", () => {
  const tags = ["Street photography", "Straße & Städte", "C++", "C#", "Astro", "astro", "日本語"]
  const filters = getBlogFilters([post("2026-03-01", "de", tags)]).filter(
    ({ type }) => type === "tag"
  )
  assert.deepEqual(
    filters.map(({ value }) => value),
    tags
  )
  assert.equal(new Set(filters.map(({ key }) => key.toLowerCase())).size, tags.length)
  assert.ok(filters.every(({ key }) => /^tag-[a-z0-9-]+$/.test(key)))
  assert.equal(
    filters.find(({ value }) => value === "Street photography").key,
    "tag-street-photography"
  )
  assert.deepEqual(
    new Map(
      getBlogFilters([post("2026-03-01", "de", [...tags].reverse())]).map(({ value, key }) => [
        value,
        key
      ])
    ),
    new Map(getBlogFilters([post("2026-03-01", "de", tags)]).map(({ value, key }) => [value, key]))
  )
})
