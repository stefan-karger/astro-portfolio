import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { relative } from "node:path"
import { fileURLToPath } from "node:url"

import type { AstroIntegration } from "astro"
import type { Element } from "hast"
import { render } from "pele"
import { defineHastPlugin, type HastNode } from "satteri"

import { de } from "../../i18n/translations/de.ts"
import { en } from "../../i18n/translations/en.ts"

function elements(node: Readonly<HastNode>, tag: string): Readonly<Element>[] {
  const result = node.type === "element" && node.tagName === tag ? [node] : []
  if ("children" in node) {
    for (const child of node.children) result.push(...elements(child, tag))
  }
  return result
}

// Diagram labels use JetBrains Mono. Every glyph advances 0.6 em in all weights
// and styles, so label widths follow from the character count.
const measurer = { width: (text: string, size: number) => [...text].length * size * 0.6 }

function codeFontSize(url: URL) {
  const rem = readFileSync(url, "utf8").match(/--text-code:\s*([\d.]+)rem;/)?.[1]
  if (!rem) throw new Error(`Expected --text-code as a rem value in ${url.href}`)
  return Number(rem) * 16
}

export function mermaidDiagrams() {
  const root = new URL("../../../", import.meta.url)
  const styles = new URL("../../styles/global.css", import.meta.url)
  // Pele lays out labels for this size. Colors and fonts come from blog.css.
  const fontSize = codeFontSize(styles)

  const plugin = defineHastPlugin({
    name: "mermaid-diagrams",
    after(tree, ctx) {
      const blocks = elements(tree, "figure").filter((node) => node.properties.dataMermaid)
      if (!blocks.length) return

      const file = ctx.fileURL
        ? relative(fileURLToPath(root), fileURLToPath(ctx.fileURL)).replaceAll("\\", "/")
        : "Markdown document"
      const prefix = `mermaid-${createHash("sha256").update(file).digest("hex").slice(0, 12)}`
      const locale = ctx.data.astro?.frontmatter.language === "en" ? "en" : "de"
      const fallback = (locale === "en" ? en : de).blog.mermaidDiagram

      for (const [index, block] of blocks.entries()) {
        // code-block.ts supplies this build-only property before HTML emission.
        const source = block.properties.dataMermaidSource
        if (typeof source !== "string" || !source.trim())
          throw new Error(`Missing Mermaid source in ${file}: Diagram ${index + 1}.`)
        ctx.setProperty(block, "dataMermaidSource", null)

        const id = `${prefix}-${index + 1}`
        let svg: string
        try {
          // responsive: false keeps the natural size; blog.css scrolls wide diagrams.
          svg = render(source, { idPrefix: id, fontSize, measurer, responsive: false }).svg
        } catch (error) {
          throw new Error(
            `Could not render Mermaid diagrams in ${file}: Diagram ${index + 1}: ${String(error)}`,
            { cause: error }
          )
        }

        const target = elements(block, "div").find((node) =>
          node.properties.className?.includes("mermaid-diagram")
        )
        const details = elements(block, "details")[0]
        if (!target || !details) throw new Error("Missing Mermaid diagram or source container.")
        ctx.appendChild(target, { type: "raw", value: svg })
        ctx.setProperty(target, "hidden", null)
        // Pele writes accTitle or title into the SVG title element with this ID.
        if (svg.includes(` id="${id}-title"`))
          ctx.setProperty(target, "ariaLabelledBy", `${id}-title`)
        else ctx.setProperty(target, "ariaLabel", fallback)
        ctx.setProperty(details, "open", null)
      }
    }
  })

  const integration: AstroIntegration = {
    name: "mermaid-diagrams",
    hooks: {
      "astro:config:setup": ({ addWatchFile }) => {
        for (const file of [styles, new URL(import.meta.url)]) addWatchFile(file)
      }
    }
  }
  return { plugin, integration }
}
