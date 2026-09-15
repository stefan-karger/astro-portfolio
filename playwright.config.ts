import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  webServer: {
    command: "node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1",
    env: {
      ASTRO_PREVIEW_BACKGROUND: "0"
    },
    url: "http://127.0.0.1:4321/",
    reuseExistingServer: false
  },
  use: {
    channel: "chrome",
    baseURL: "http://127.0.0.1:4321/"
  }
})
