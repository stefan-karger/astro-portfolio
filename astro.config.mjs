// @ts-check
import { defineConfig } from "astro/config"

import tailwindcss from "@tailwindcss/vite"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  site: "https://stefan-karger.de",

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
