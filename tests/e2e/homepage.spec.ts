import { expect, test } from "@playwright/test"

test("serves the static homepage", async ({ request }) => {
  const response = await request.get("/")

  expect(response.ok()).toBe(true)
  expect(await response.text()).toMatch(/<h1[^>]*>Stefan Karger<\/h1>/)
})
