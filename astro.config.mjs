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
import { defaultLocale, locales } from "./src/i18n/types.ts"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  site: "https://stefan-karger.de",

  markdown: {
    shikiConfig: {
      theme: "github-light",
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
    "/en/portfolio": "/en/photography",
    "/blog/astro-shiki-codebloecke": "/blog/astro-fuer-entwicklerblogs-shiki-twoslash",
    "/en/blog/astro-shiki-codebloecke": "/en/blog/astro-fuer-entwicklerblogs-shiki-twoslash"
  },

  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: {
      prefixDefaultLocale: false
    }
  }
})
