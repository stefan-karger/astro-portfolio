import assert from "node:assert/strict"
import { test } from "node:test"

import { getBlogFilters, matchesBlogFilter } from "../src/lib/blog-filters.ts"

function post(date, language, tags) {
  return { data: { pubDate: new Date(`${date}T00:00:00.000Z`), language, tags } }
}

test("Only populated months, languages and tags appear, counting each post once", () => {
  const posts = [
    post("2026-03-01", "de", ["Astro", "Astro", "astro", "ASTRO", "Photography"]),
    post("2026-03-31", "en", ["Photography", "astro"]),
    post("2025-03-01", "de", [])
  ]
  const filters = getBlogFilters(posts)
  assert.deepEqual(Object.fromEntries(filters.map(({ key, count }) => [key, count])), {
    "month-2026-03": 2,
    "month-2025-03": 1,
    "language-de": 2,
    "language-en": 1,
    "tag-astro": 2,
    "tag-photography": 2
  })
  assert.deepEqual(getBlogFilters([]), [])
  assert.deepEqual(
    getBlogFilters([post("2026-03-01", "de", [])]).map(({ key }) => key),
    ["month-2026-03", "language-de"]
  )
})

test("Each filter independently matches its month, content language or case-insensitive tag", () => {
  const posts = [
    post("2026-03-01", "de", ["Street photography"]),
    post("2026-03-31", "en", ["Astro"]),
    post("2025-03-01", "de", ["Street photography", "astro"])
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
    true
  )
})

test("Tag URLs use readable symbol replacements and preserve non-Latin letters", () => {
  const tags = [
    "Street photography",
    "Straße & Städte",
    "C++",
    "C#",
    "F#",
    "C",
    "@Astro",
    "日本語",
    "Research, development"
  ]
  const filters = getBlogFilters([post("2026-03-01", "de", tags)]).filter(
    ({ type }) => type === "tag"
  )
  assert.deepEqual(
    filters.map(({ value }) => value),
    tags
  )
  assert.deepEqual(
    filters.map(({ key }) => key),
    [
      "tag-street-photography",
      "tag-strasse-and-stadte",
      "tag-cplusplus",
      "tag-csharp",
      "tag-fsharp",
      "tag-c",
      "tag-atastro",
      "tag-日本語",
      "tag-research-development"
    ]
  )
  for (const filter of filters) {
    for (const tag of tags) {
      assert.equal(matchesBlogFilter(post("2026-03-01", "de", [tag]), filter), tag === filter.value)
    }
  }
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

test("Adding case variants or other tags keeps existing tag URLs stable", () => {
  const original = getBlogFilters([post("2026-03-01", "de", ["Astro", "C++", "C#"])])
  const expanded = getBlogFilters([
    post("2026-03-01", "de", ["Astro", "C++", "C#"]),
    post("2026-03-31", "en", ["astro", "c++", "c#", "CSS"])
  ])
  for (const filter of original.filter(({ type }) => type === "tag")) {
    assert.deepEqual(
      expanded.find(({ key }) => key === filter.key),
      { ...filter, count: 2 }
    )
  }
  assert.equal(expanded.filter(({ key }) => key === "tag-astro").length, 1)
})

test("Unresolved slug collisions name both tags instead of adding hashes or merging them", () => {
  assert.throws(
    () => getBlogFilters([post("2026-03-01", "de", ["A/B", "A B"])]),
    /Tags "A\/B" and "A B" both produce "tag-a-b"\. Rename a tag or update the symbol lookup/
  )
})

test("Tags with no letters, numbers or supported symbols require a readable name", () => {
  assert.throws(
    () => getBlogFilters([post("2026-03-01", "de", ["🧪"])]),
    /Tag "🧪" needs a readable URL name/
  )
})
