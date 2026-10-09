/* global window, document, navigator */
import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import { fileURLToPath, URL } from "node:url"
import { preview } from "astro"
import { chromium } from "playwright"

import { de } from "../src/i18n/translations/de.ts"
import { en } from "../src/i18n/translations/en.ts"

let server
let browser
let baseURL

before(async () => {
  server = await preview({
    root: fileURLToPath(new URL("../", import.meta.url)),
    server: { host: "127.0.0.1", port: 0, open: false },
    logLevel: "silent"
  })
  baseURL = `http://127.0.0.1:${server.port}`
  browser = await chromium.launch()
})

after(async () => {
  try {
    await browser?.close()
  } finally {
    await server?.stop()
  }
})

async function newPage(t, options = {}) {
  const context = await browser.newContext({ baseURL, ...options })
  t.after(() => context.close())
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  return page
}

const items = "[data-portfolio-item]"
const activeImage = '.pswp__item[aria-hidden="false"] img.pswp__img:not(.pswp__img--placeholder)'

async function slide(page, index) {
  const { src, alt } = await page
    .locator(items)
    .nth(index)
    .evaluate((item) => ({
      src: item.href,
      alt: item.querySelector("img").alt
    }))
  await page.waitForFunction(
    ({ selector, src, index }) =>
      document.querySelector(selector)?.src === src &&
      window.history.state?.portfolioLightbox?.index === index,
    { selector: activeImage, src, index }
  )
  assert.equal(await page.locator(activeImage).getAttribute("alt"), alt)
  assert.equal(
    (await page.locator(".pswp__counter").textContent()).trim(),
    `${index + 1} / ${await page.locator(items).count()}`
  )
}

async function closed(page, index, scroll) {
  await page.locator(".pswp").waitFor({ state: "detached" })
  await page.waitForFunction(
    ({ index, scroll }) =>
      document.activeElement === document.querySelectorAll("[data-portfolio-item]")[index] &&
      window.scrollY === scroll,
    { index, scroll }
  )
  assert.deepEqual(await page.evaluate(() => window.history.state), {
    unrelated: { token: "retain me" }
  })
  assert.ok(
    await page.evaluate(() =>
      window.originalInert.every(([element, inert]) => element.inert === inert)
    )
  )
}

async function gallery(page, pathname) {
  await page.goto(pathname)
  await page.locator("[data-portfolio-gallery][data-enhanced]").waitFor()
  assert.ok((await page.locator(items).count()) >= 3)
  await page.evaluate(() => {
    window.history.replaceState({ unrelated: { token: "retain me" } }, "")
    const existing = document.createElement("aside")
    existing.id = "already-inert"
    existing.hidden = true
    existing.inert = true
    document.body.appendChild(existing)
    window.originalInert = [...document.body.children].map((element) => [element, element.inert])
  })
}

for (const [locale, pathname, labels] of [
  ["de", "/fotografie/", de.portfolio.lightbox],
  ["en", "/en/photography/", en.portfolio.lightbox]
]) {
  test(`${locale}: keyboard opening, navigation, modal focus and both close controls`, async (t) => {
    const page = await newPage(t, { reducedMotion: "reduce" })
    await gallery(page, pathname)
    assert.equal(
      await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      true
    )
    const opening = page.locator(items).nth(1)
    await opening.scrollIntoViewIfNeeded()
    await opening.focus()
    const scroll = await page.evaluate(() => window.scrollY)
    await page.keyboard.press("Enter")
    const dialog = page.getByRole("dialog", { name: labels.label })
    await dialog.waitFor()
    await slide(page, 1)
    assert.equal(await dialog.getAttribute("aria-modal"), "true")
    assert.ok(await dialog.evaluate((element) => document.activeElement === element))
    assert.ok(await page.evaluate(() => window.originalInert.every(([element]) => element.inert)))
    assert.equal(
      await dialog.locator(`[role="group"][aria-roledescription="${labels.carousel}"]`).count(),
      1
    )
    assert.equal(
      await dialog
        .locator(`[role="group"][aria-roledescription="${labels.slide}"][aria-hidden="false"]`)
        .count(),
      1
    )

    await page
      .locator("header a")
      .first()
      .evaluate((element) => element.focus())
    assert.ok(await dialog.evaluate((element) => element.contains(document.activeElement)))
    const enabled = dialog.locator("button:not(:disabled)").filter({ visible: true })
    await page.keyboard.press("Tab")
    assert.ok(await enabled.first().evaluate((element) => document.activeElement === element))
    await page.keyboard.press("Shift+Tab")
    assert.ok(await enabled.last().evaluate((element) => document.activeElement === element))
    await page.keyboard.press("Tab")
    assert.ok(await enabled.first().evaluate((element) => document.activeElement === element))

    await dialog.getByRole("button", { name: labels.next, exact: true }).click()
    await slide(page, 2)
    await dialog.getByRole("button", { name: labels.previous, exact: true }).click()
    await slide(page, 1)
    await page.keyboard.press("ArrowRight")
    await slide(page, 2)
    assert.deepEqual(await page.evaluate(() => window.history.state.unrelated), {
      token: "retain me"
    })
    await page.keyboard.press("Escape")
    await closed(page, 1, scroll)

    await opening.click()
    await slide(page, 1)
    await dialog.getByRole("button", { name: labels.close, exact: true }).click()
    await closed(page, 1, scroll)
  })
}

{
  const locale = "de",
    pathname = "/fotografie/",
    labels = de.portfolio.lightbox
  test(`${locale}: Back, Forward and Forward during the closing animation preserve the selected image`, async (t) => {
    const page = await newPage(t, { reducedMotion: "no-preference" })
    await gallery(page, pathname)
    const opening = page.locator(items).nth(0)
    await opening.scrollIntoViewIfNeeded()
    const scroll = await page.evaluate(() => window.scrollY)
    await opening.click()
    await slide(page, 0)
    await page.getByRole("button", { name: labels.next, exact: true }).click()
    await slide(page, 1)
    await page.getByRole("button", { name: labels.next, exact: true }).click()
    await slide(page, 2)
    await page.evaluate(() => window.history.back())
    await closed(page, 0, scroll)
    await page.evaluate(() => window.history.forward())
    await slide(page, 2)
    await page.waitForFunction(() => document.querySelector(".pswp__bg")?.style.opacity === "1")
    // The popstate listener runs after the gallery's listener, while its 200 ms close is in flight.
    const closing = await page.evaluate(
      () =>
        new Promise((resolve) => {
          window.closingDialog = document.querySelector(".pswp")
          window.addEventListener(
            "popstate",
            () => {
              const connected = window.closingDialog.isConnected
              window.history.forward()
              resolve(connected)
            },
            { once: true }
          )
          window.history.back()
        })
    )
    assert.equal(closing, true, "Forward must arrive before the previous dialog is destroyed")
    await page.waitForFunction(
      () =>
        !window.closingDialog.isConnected &&
        document.querySelector(".pswp") !== window.closingDialog
    )
    await slide(page, 2)
    assert.equal(await page.locator(".pswp").count(), 1)
    assert.ok(
      await page
        .getByRole("dialog", { name: labels.label })
        .evaluate((element) => element.contains(document.activeElement))
    )
    assert.deepEqual(await page.evaluate(() => window.history.state.unrelated), {
      token: "retain me"
    })
    await page.keyboard.press("Escape")
    await closed(page, 2, scroll)
  })
}

test("A failed PhotoSwipe stylesheet follows the original image link", async (t) => {
  const page = await newPage(t)
  const blocked = []
  await page.route("**/*", (route) => {
    const request = route.request()
    if (
      request.resourceType() === "stylesheet" &&
      /photoswipe.*\.css(?:\?|$)/.test(request.url())
    ) {
      blocked.push(request.url())
      return route.abort()
    }
    return route.continue()
  })
  await page.goto("/fotografie/")
  await page.locator("[data-portfolio-gallery][data-enhanced]").waitFor()
  assert.equal(blocked.length, 0, "PhotoSwipe assets stay deferred before opening")
  const opening = page.locator(items).nth(1)
  const href = await opening.evaluate((item) => item.href)
  await Promise.all([page.waitForURL(href), opening.click()])
  assert.ok(blocked.length > 0)
  assert.equal(page.url(), href)
  assert.equal(await page.locator(".pswp").count(), 0)
})

test("Without JavaScript the gallery links still open their images", async (t) => {
  const page = await newPage(t, { javaScriptEnabled: false })
  await page.goto("/en/photography/")
  const opening = page.locator(items).nth(0)
  assert.ok(await opening.locator("img").getAttribute("alt"))
  const href = await opening.getAttribute("href")
  await Promise.all([page.waitForURL(new URL(href, baseURL).href), opening.click()])
  assert.equal(await page.locator(".pswp").count(), 0)
})

async function load(t, pathname, options = {}) {
  const page = await newPage(t, options)
  await page.clock.install({ time: new Date("2026-10-08T00:00:00Z") })
  await page.goto(pathname)
  await page.evaluate(() => document.fonts.ready)
  await page.clock.pauseAt(new Date("2026-10-08T01:00:00Z"))
  return page
}

async function typeControls(page) {
  const first = page
    .locator("[data-twoslash-trigger]")
    .filter({ hasText: /^formatPostDate$/ })
    .first()
  const second = page
    .locator("[data-twoslash-trigger]")
    .filter({ hasText: /^locale$/ })
    .first()
  // Finish the preparation scroll: document scrolling intentionally dismisses popovers.
  await first.evaluate(
    (element) =>
      new Promise((resolve) => {
        const before = window.scrollY
        const scrolled = (event) => {
          if (event.target !== document) return
          document.removeEventListener("scroll", scrolled, true)
          resolve()
        }
        document.addEventListener("scroll", scrolled, true)
        element.scrollIntoView({ block: "center", behavior: "instant" })
        if (window.scrollY === before) {
          document.removeEventListener("scroll", scrolled, true)
          resolve()
        }
      })
  )
  const popup = page.locator(`#${await first.getAttribute("aria-controls")}`)
  const other = page.locator(`#${await second.getAttribute("aria-controls")}`)
  assert.equal(await first.getAttribute("popovertarget"), await popup.getAttribute("id"))
  return { first, second, popup, other }
}

// Native pointer movement keeps the prepared scroll position stable.
async function moveTo(page, target) {
  const rect = await target.boundingBox()
  assert.ok(rect)
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
}

for (const [locale, pathname, labels] of [
  ["de", "/blog/astro-fuer-entwicklerblogs-shiki-twoslash/", de.blog],
  ["en", "/en/blog/astro-fuer-entwicklerblogs-shiki-twoslash/", en.blog]
]) {
  test(`${locale}: copying preserves exact source and resets the localized status`, async (t) => {
    const page = await load(t, pathname, {
      permissions: ["clipboard-read", "clipboard-write"]
    })
    const button = page.getByRole("button", { name: labels.copy, exact: true }).first()
    const source = await button.getAttribute("data-copy-code")
    assert.ok(source)
    assert.equal(await button.getAttribute("lang"), locale)
    await button.click()
    await page.waitForFunction(
      () => document.querySelector("[data-copy-code]")?.dataset.state === "copied"
    )
    // Windows' native clipboard returns CRLF; every other character must round-trip exactly.
    assert.equal(
      (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n"),
      source
    )
    assert.equal(await page.locator("#code-copy-status").textContent(), labels.copied)
    assert.equal(await button.getAttribute("title"), labels.copied)
    assert.equal(await button.getAttribute("aria-busy"), null)
    await page.clock.runFor(2001)
    assert.equal(await button.getAttribute("data-state"), "idle")
    assert.equal(await button.getAttribute("title"), labels.copy)
  })
}

{
  const locale = "en",
    pathname = "/en/blog/astro-fuer-entwicklerblogs-shiki-twoslash/",
    labels = en.blog
  test(`${locale}: clipboard rejection reports the error and permits another attempt`, async (t) => {
    const page = await newPage(t)
    await page.addInitScript(() => {
      window.copyAttempts = 0
      Object.defineProperty(navigator.clipboard, "writeText", {
        value: async () => {
          window.copyAttempts++
          throw new Error("Clipboard permission denied by the browser fixture")
        }
      })
    })
    await page.clock.install({ time: new Date("2026-10-08T00:00:00Z") })
    await page.goto(pathname)
    await page.clock.pauseAt(new Date("2026-10-08T01:00:00Z"))
    const button = page.getByRole("button", { name: labels.copy, exact: true }).first()
    await button.click()
    await page.waitForFunction(
      () => document.querySelector("[data-copy-code]")?.dataset.state === "error"
    )
    assert.equal(await page.locator("#code-copy-status").textContent(), labels.copyError)
    assert.equal(await button.getAttribute("title"), labels.copyError)
    assert.equal(await button.getAttribute("aria-busy"), null)
    await page.clock.runFor(2001)
    assert.equal(await button.getAttribute("data-state"), "idle")
    assert.equal(await button.getAttribute("title"), labels.copy)
    await button.click()
    await page.waitForFunction(() => window.copyAttempts === 2)
    assert.equal(await button.getAttribute("data-state"), "error")
  })

  test(`${locale}: repeated clicks share one pending copy and replace the previous reset timer`, async (t) => {
    const page = await newPage(t)
    await page.addInitScript(() => {
      window.copyWrites = []
      Object.defineProperty(navigator.clipboard, "writeText", {
        value: (text) => {
          window.copyWrites.push(text)
          return new Promise((resolve) => {
            window.finishCopy = resolve
          })
        }
      })
    })
    await page.clock.install({ time: new Date("2026-10-08T00:00:00Z") })
    await page.goto(pathname)
    await page.clock.pauseAt(new Date("2026-10-08T01:00:00Z"))
    const button = page.getByRole("button", { name: labels.copy, exact: true }).first()
    const source = await button.getAttribute("data-copy-code")
    await button.click()
    assert.equal(await button.getAttribute("aria-busy"), "true")
    assert.equal(await page.locator("#code-copy-status").textContent(), "")
    await button.click()
    assert.deepEqual(await page.evaluate(() => window.copyWrites), [source])
    await page.evaluate(() => window.finishCopy())
    await page.waitForFunction(
      () => document.querySelector("[data-copy-code]")?.dataset.state === "copied"
    )
    assert.equal(await button.getAttribute("aria-busy"), null)
    await page.clock.runFor(1500)
    await button.click()
    assert.equal(await button.getAttribute("aria-busy"), "true")
    await page.clock.runFor(501)
    assert.equal(
      await button.getAttribute("data-state"),
      "copied",
      "The first reset must not run during a new copy"
    )
    assert.equal(await page.locator("#code-copy-status").textContent(), "")
    await page.evaluate(() => window.finishCopy())
    await page.waitForFunction(
      () => !document.querySelector("[data-copy-code]")?.hasAttribute("aria-busy")
    )
    assert.deepEqual(await page.evaluate(() => window.copyWrites), [source, source])
    assert.equal(await page.locator("#code-copy-status").textContent(), labels.copied)
    await page.clock.runFor(1999)
    assert.equal(await button.getAttribute("data-state"), "copied")
    await page.clock.runFor(2)
    assert.equal(await button.getAttribute("data-state"), "idle")
    assert.equal(await button.getAttribute("title"), labels.copy)
  })

  test(`${locale}: an unavailable Clipboard API keeps copy controls hidden and type controls working`, async (t) => {
    const page = await newPage(t)
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "clipboard", { value: undefined })
    )
    await page.goto(pathname)
    assert.ok((await page.locator("[data-copy-code]").count()) > 0)
    assert.ok(
      await page
        .locator("[data-copy-code]")
        .evaluateAll((buttons) => buttons.every((button) => button.hidden))
    )
    assert.equal(await page.locator("#code-copy-status").textContent(), "")
    assert.ok((await page.locator(".blog-content pre").first().textContent()).trim().length > 0)
    const { first, popup } = await typeControls(page)
    await first.click()
    await popup.waitFor({ state: "visible" })
    assert.ok(await popup.evaluate((element) => element.matches(":popover-open")))
  })
}

test("Keyboard focus opens a native popover; Escape and light dismissal close it", async (t) => {
  const page = await load(t, "/en/blog/astro-fuer-entwicklerblogs-shiki-twoslash/")
  const { first, popup } = await typeControls(page)
  await first.focus()
  await page.keyboard.press("Tab")
  const focused = await page.evaluate(() => document.activeElement.getAttribute("aria-controls"))
  assert.ok(focused)
  const keyboardPopup = page.locator(`#${focused}`)
  await keyboardPopup.waitFor({ state: "visible" })
  assert.ok(await keyboardPopup.evaluate((element) => element.matches(":popover-open")))
  await page.keyboard.press("Escape")
  await keyboardPopup.waitFor({ state: "hidden" })
  await moveTo(page, first)
  await popup.waitFor({ state: "visible" })
  await page.mouse.click(8, 8)
  await popup.waitFor({ state: "hidden" })
  await page.clock.runFor(200)
  assert.equal(await page.locator(":popover-open").count(), 0)
})

test("Mouse transfer into a popup cancels delayed dismissal; leaving closes it after 150 ms", async (t) => {
  const page = await load(t, "/en/blog/astro-fuer-entwicklerblogs-shiki-twoslash/")
  const { first, popup } = await typeControls(page)
  await moveTo(page, first)
  await popup.waitFor({ state: "visible" })
  await page.mouse.move(8, 8)
  await page.clock.runFor(149)
  assert.ok(await popup.evaluate((element) => element.matches(":popover-open")))
  await page.clock.runFor(2)
  await popup.waitFor({ state: "hidden" })
  await moveTo(page, first)
  await popup.waitFor({ state: "visible" })
  await moveTo(page, popup)
  await page.clock.runFor(300)
  assert.ok(await popup.evaluate((element) => element.matches(":popover-open")))
  await page.mouse.move(8, 8)
  await page.clock.runFor(151)
  await popup.waitFor({ state: "hidden" })
})

test("Rapid pointer and focus changes cannot dismiss the newly active popup", async (t) => {
  const page = await load(t, "/en/blog/astro-fuer-entwicklerblogs-shiki-twoslash/")
  const { first, second, popup, other } = await typeControls(page)
  await moveTo(page, first)
  await popup.waitFor({ state: "visible" })
  await page.mouse.move(8, 8)
  await page.clock.runFor(100)
  await second.focus()
  await other.waitFor({ state: "visible" })
  await page.clock.runFor(100)
  assert.ok(await other.evaluate((element) => element.matches(":popover-open")))
  assert.equal(await popup.isVisible(), false)
  await first.focus()
  await moveTo(page, first)
  await popup.waitFor({ state: "visible" })
  // Leave the overlapping popup so closing it cannot re-hover the first trigger.
  await page.mouse.move(8, 8)
  await second.focus()
  await other.waitFor({ state: "visible" })
  await page.clock.runFor(151)
  assert.ok(await other.evaluate((element) => element.matches(":popover-open")))
  await other.evaluate((element) => element.hidePopover())
  await other.waitFor({ state: "hidden" })
  await page.mouse.move(8, 8)
  await moveTo(page, first)
  await popup.waitFor({ state: "visible" })
  await page.clock.runFor(300)
  assert.ok(await popup.evaluate((element) => element.matches(":popover-open")))
  assert.equal(await page.locator(":popover-open").count(), 1)
})

test("Touch entry does not open a popup before the native tap focuses and clicks", async (t) => {
  const page = await load(t, "/en/blog/astro-fuer-entwicklerblogs-shiki-twoslash/", {
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 }
  })
  const { first, popup } = await typeControls(page)
  await first.evaluate((element) => {
    element.addEventListener(
      "pointerenter",
      (event) => {
        window.inputObservation = {
          pointerType: event.pointerType,
          open: document
            .getElementById(element.getAttribute("aria-controls"))
            .matches(":popover-open")
        }
      },
      { once: true }
    )
  })
  await first.tap()
  await popup.waitFor({ state: "visible" })
  assert.deepEqual(await page.evaluate(() => window.inputObservation), {
    pointerType: "touch",
    open: false
  })
  assert.ok(await first.evaluate((element) => document.activeElement === element))
  assert.ok(await popup.evaluate((element) => element.matches(":popover-open")))
})
