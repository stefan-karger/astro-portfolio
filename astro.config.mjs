// @ts-check
import { defineConfig } from "astro/config"
import { satteri } from "@astrojs/markdown-satteri"

import tailwindcss from "@tailwindcss/vite"
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from "@shikijs/transformers"
import { rendererRich, transformerTwoslash } from "@shikijs/twoslash"
import githubLight from "shiki/themes/github-light.mjs"

import { transformerCodeBlock } from "./src/lib/markdown/code-block.ts"
import { mermaidDiagrams } from "./src/lib/markdown/mermaid.ts"
import { defaultLocale, locales } from "./src/i18n/locales.ts"

const mermaid = mermaidDiagrams()

// https://astro.build/config
export default defineConfig({
  integrations: [mermaid.integration],
  vite: {
    plugins: [tailwindcss()]
  },
  site: "https://stefan-karger.de",

  markdown: {
    processor: satteri({ hastPlugins: [mermaid.plugin] }),
    shikiConfig: {
      theme: {
        ...githubLight,
        // Keep tokens readable on gray code blocks, diff lines, and type popups.
        colorReplacements: {
          "#d73a49": "#bd2334",
          "#e36209": "#a34600",
          "#22863a": "#1b7030",
          "#6a737d": "#58616b"
        }
      },
      transformers: [
        transformerTwoslash({
          explicitTrigger: true,
          renderer: rendererRich({ queryRendering: "line", errorRendering: "line" })
        }),
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerRemoveNotationEscape(),
        transformerCodeBlock()
      ]
    }
  },

  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: {
      prefixDefaultLocale: false
    }
  }
})
