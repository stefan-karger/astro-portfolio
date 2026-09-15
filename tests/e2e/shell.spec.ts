import { expect, test } from "@playwright/test"

const widths = [320, 375, 768, 1024, 1440, 1920]

for (const width of widths) {
  test(`shared shell fits a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/")

    await expect(page.locator("main")).toHaveCount(1)
    await expect(page.getByRole("heading", { level: 1, name: "Stefan Karger" })).toBeVisible()

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )

    expect(horizontalOverflow).toBeLessThanOrEqual(0)
  })
}

test("skip link and focus indicator work from the keyboard", async ({ page }) => {
  await page.goto("/")
  await page.keyboard.press("Tab")

  const skipLink = page.getByRole("link", { name: "Zum Inhalt springen" })
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeVisible()

  const focusStyle = await skipLink.evaluate((element) => {
    const style = getComputedStyle(element)
    return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) }
  })

  expect(focusStyle.style).toBe("solid")
  expect(focusStyle.width).toBeGreaterThanOrEqual(3)
})

test("text-only zoom reflows without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await page.goto("/")
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%"
  })

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )

  expect(horizontalOverflow).toBeLessThanOrEqual(0)
  await expect(page.getByRole("navigation", { name: "Hauptnavigation" })).toBeVisible()
})

test("dark surface keeps visible focus and makes no third-party requests", async ({ page }) => {
  const thirdPartyRequests: string[] = []
  page.on("request", (request) => {
    if (new URL(request.url()).hostname !== "127.0.0.1") thirdPartyRequests.push(request.url())
  })

  await page.goto("/")
  await page.evaluate(() => {
    document.documentElement.dataset.surface = "dark"
    document.body.dataset.surface = "dark"
  })

  const email = page.getByRole("link", { name: "E-Mail an Stefan Karger" })
  await email.focus()

  const colors = await email.evaluate((element) => {
    const bodyStyle = getComputedStyle(document.body)
    const linkStyle = getComputedStyle(element)
    return {
      background: bodyStyle.backgroundColor,
      color: bodyStyle.color,
      outline: linkStyle.outlineColor
    }
  })

  expect(colors).toEqual({
    background: "rgb(24, 23, 21)",
    color: "rgb(233, 231, 225)",
    outline: "rgb(233, 231, 225)"
  })
  expect(thirdPartyRequests).toEqual([])
  await expect(page.locator("script")).toHaveCount(0)
})
