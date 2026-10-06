import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { relative } from "node:path"
import { fileURLToPath } from "node:url"

import type { AstroIntegration } from "astro"
import type { Element } from "hast"
import { chromium } from "playwright"
import { defineHastPlugin, type HastNode } from "satteri"

import { de } from "../i18n/translations/de.ts"
import { en } from "../i18n/translations/en.ts"

function elements(node: Readonly<HastNode>, tag: string): Readonly<Element>[] {
  const result = node.type === "element" && node.tagName === tag ? [node] : []
  if ("children" in node) {
    for (const child of node.children) result.push(...elements(child, tag))
  }
  return result
}

export function mermaidDiagrams() {
  const root = new URL("../../", import.meta.url)
  const stylesUrl = new URL("../styles/global.css", import.meta.url)
  const styles = readFileSync(stylesUrl, "utf8")
  // These project-owned @theme blocks contain the CSS tokens used by the SVGs.
  const tokens = [...styles.matchAll(/@theme(?:\s+static)?\s*\{([^}]+)\}/g)]
    .map((match) => `:root { ${match[1]} }`)
    .join("\n")
  const fontUrl = new URL(import.meta.resolve("@fontsource-variable/jetbrains-mono/wght.css"))
  const files = [stylesUrl, fontUrl, new URL(import.meta.url)]
  const fonts = readFileSync(fontUrl, "utf8").replace(/url\(([^)]+)\)/g, (_, path: string) => {
    const url = new URL(path, fontUrl)
    files.push(url)
    return `url(data:font/woff2;base64,${readFileSync(url).toString("base64")})`
  })
  const mermaidUrl = new URL(import.meta.resolve("mermaid/dist/mermaid.min.js"))
  const css = `${tokens}\n${fonts}\n.astro-code { font: var(--text-code) var(--font-mono); }`
  const plugin = defineHastPlugin({
    name: "mermaid-diagrams",
    async after(tree, ctx) {
      const blocks = elements(tree, "figure").filter((node) => node.properties.dataMermaid)
      if (!blocks.length) return

      const definitions = blocks.map((block) => {
        const copy = elements(block, "button").find(
          (node) => typeof node.properties.dataCopyCode === "string"
        )
        if (!copy) throw new Error("Missing Mermaid definition in code block.")
        return String(copy.properties.dataCopyCode)
      })
      const file = ctx.fileURL
        ? relative(fileURLToPath(root), fileURLToPath(ctx.fileURL)).replaceAll("\\", "/")
        : "Markdown document"
      const prefix = `mermaid-${createHash("sha256").update(file).digest("hex").slice(0, 12)}`
      const locale = ctx.data.astro?.frontmatter.language === "en" ? "en" : "de"
      const fallback = (locale === "en" ? en : de).blog.mermaidDiagram
      const browser = await chromium.launch().catch((error) => {
        throw new Error(
          `Cannot render Mermaid diagrams in ${file}. Run pnpm setup:diagrams to install Chromium.`,
          { cause: error }
        )
      })

      try {
        const page = await browser.newPage()
        await page.setContent(
          '<!doctype html><html><body><pre class="astro-code"></pre></body></html>'
        )
        await page.addStyleTag({ content: css })
        await page.addScriptTag({ path: fileURLToPath(mermaidUrl) })
        const diagrams = await page.evaluate(
          async ({ definitions, prefix }) => {
            const mermaid = (
              window as typeof window & { mermaid: typeof import("mermaid").default }
            ).mermaid
            const style = getComputedStyle(document.documentElement)
            const codeStyle = getComputedStyle(document.querySelector(".astro-code")!)
            const fontSize = codeStyle.fontSize
            await document.fonts.load(`${fontSize} ${codeStyle.fontFamily}`)
            await document.fonts.ready
            function color(name: string) {
              const value = style.getPropertyValue(name).trim()
              if (!/^#[\da-f]{6}$/i.test(value))
                throw new Error(`Expected a hex CSS token: ${name}`)
              return value
            }
            const paper = color("--color-paper")
            const ink = color("--color-ink")
            const muted = color("--color-muted")
            const rule = color("--color-rule")
            const surface = color("--color-code")
            const appearance = { theme: "base", look: "classic", useMaxWidth: false } as const

            mermaid.initialize({
              startOnLoad: false,
              securityLevel: "strict",
              suppressErrorRendering: true,
              htmlLabels: false,
              deterministicIds: true,
              deterministicIDSeed: prefix,
              // ER attribute rows use Rough.js even with the classic look.
              handDrawnSeed: 1,
              layout: "elk",
              theme: "base",
              look: "classic",
              fontFamily: "var(--font-mono)",
              fontSize: parseFloat(fontSize),
              themeVariables: {
                fontFamily: "var(--font-mono)",
                fontSize,
                background: surface,
                primaryColor: paper,
                primaryTextColor: ink,
                primaryBorderColor: muted,
                secondaryColor: surface,
                secondaryTextColor: ink,
                secondaryBorderColor: muted,
                tertiaryColor: paper,
                tertiaryTextColor: ink,
                tertiaryBorderColor: muted,
                lineColor: muted,
                clusterBkg: surface,
                clusterBorder: rule,
                signalColor: muted,
                noteBkgColor: surface,
                noteBorderColor: muted,
                noteTextColor: ink,
                activationBorderColor: muted,
                sequenceNumberColor: paper,
                attributeBackgroundColorOdd: paper,
                attributeBackgroundColorEven: surface
              },
              flowchart: {
                ...appearance,
                curve: "linear",
                subGraphTitleMargin: { top: 12, bottom: 12 }
              },
              sequence: appearance,
              state: appearance,
              er: appearance
            })

            const result = []
            for (const [index, definition] of definitions.entries()) {
              try {
                const id = `${prefix}-${index + 1}`
                const { svg } = await mermaid.render(id, definition)
                const document = new DOMParser().parseFromString(svg, "image/svg+xml")
                // Some diagram types emit IDs without Mermaid's render prefix.
                // Namespace those as well, including their SVG and ARIA references.
                const ids = new Map<string, string>()
                for (const node of document.querySelectorAll("[id]")) {
                  const unique =
                    node.id === id || node.id.startsWith(`${id}-`) ? node.id : `${id}-${node.id}`
                  ids.set(node.id, unique)
                  node.id = unique
                }
                function references(value: string) {
                  return value.replace(/#([\w:-]+)/g, (match, name: string) =>
                    ids.has(name) ? `#${ids.get(name)}` : match
                  )
                }
                for (const node of document.querySelectorAll("*")) {
                  for (const attr of node.attributes) {
                    if (attr.name === "aria-labelledby" || attr.name === "aria-describedby")
                      attr.value = attr.value
                        .split(/\s+/)
                        .map((name) => ids.get(name) ?? name)
                        .join(" ")
                    else attr.value = references(attr.value)
                  }
                  if (node.tagName === "style")
                    node.textContent = references(node.textContent ?? "")
                }
                result.push({
                  svg: new XMLSerializer().serializeToString(document.documentElement),
                  title: document.querySelector("title")?.textContent
                })
              } catch (error) {
                throw new Error(`Diagram ${index + 1}: ${String(error)}`, { cause: error })
              }
            }
            return result
          },
          { definitions, prefix }
        )

        for (const [index, block] of blocks.entries()) {
          const target = elements(block, "div").find((node) =>
            node.properties.className?.includes("mermaid-diagram")
          )
          const details = elements(block, "details")[0]
          if (!target || !details) throw new Error("Missing Mermaid diagram or source container.")
          ctx.appendChild(target, { type: "raw", value: diagrams[index].svg })
          ctx.setProperty(target, "hidden", null)
          ctx.setProperty(target, "ariaLabel", diagrams[index].title || fallback)
          ctx.setProperty(details, "open", null)
        }
      } catch (error) {
        throw new Error(`Could not render Mermaid diagrams in ${file}: ${String(error)}`, {
          cause: error
        })
      } finally {
        await browser.close()
      }
    }
  })

  const integration: AstroIntegration = {
    name: "mermaid-diagrams",
    hooks: {
      "astro:config:setup": ({ addWatchFile }) => {
        for (const file of files) addWatchFile(file)
      }
    }
  }
  return { plugin, integration }
}
