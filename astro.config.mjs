// @ts-check
import { defineConfig } from "astro/config"

import tailwindcss from "@tailwindcss/vite"
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from "@shikijs/transformers"
import { rendererRich, transformerTwoslash } from "@shikijs/twoslash"

import { transformerCodeBlock } from "./src/lib/shiki/code-block.ts"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  site: "https://stefan-karger.de",

  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
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

  redirects: {
    "/portfolio": "/fotografie",
    "/en/portfolio": "/en/photography"
  },

  i18n: {
    defaultLocale: "de",
    locales: ["de", "en"],
    routing: {
      prefixDefaultLocale: false
    }
  }
})
