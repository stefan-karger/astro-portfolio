import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8")

function variablesFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))

  assert.ok(block, `Missing token block: ${selector}`)

  return Object.fromEntries(
    [...block[1].matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)].map((match) => [match[1], match[2]])
  )
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrastRatio(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a)

  return (values[0] + 0.05) / (values[1] + 0.05)
}

const light = variablesFor('[data-surface="light"]')
const dark = variablesFor('[data-surface="dark"]')

const textChecks = [
  ["light normal text on canvas", light.text, light.canvas],
  ["light muted text on canvas", light["muted-text"], light.canvas],
  ["light normal text on surface", light.text, light.surface],
  ["light muted text on surface", light["muted-text"], light.surface],
  ["dark normal text on canvas", dark.text, dark.canvas],
  ["dark muted text on canvas", dark["muted-text"], dark.canvas],
  ["dark normal text on surface", dark.text, dark.surface],
  ["dark muted text on surface", dark["muted-text"], dark.surface]
]

for (const [name, foreground, background] of textChecks) {
  test(`${name} meets WCAG AA`, () => {
    assert.ok(contrastRatio(foreground, background) >= 4.5)
  })
}

for (const [name, tokens] of [
  ["light", light],
  ["dark", dark]
]) {
  test(`${name} focus indicator meets non-text contrast`, () => {
    assert.ok(contrastRatio(tokens.focus, tokens.canvas) >= 3)
    assert.ok(contrastRatio(tokens.focus, tokens.surface) >= 3)
  })

  test(`${name} inverted contact action meets text contrast`, () => {
    assert.ok(contrastRatio(tokens["inverse-text"], tokens["inverse-surface"]) >= 4.5)
  })
}
