// @ts-check

import js from "@eslint/js"
import { defineConfig, globalIgnores } from "eslint/config"
import eslintConfigPrettier from "eslint-config-prettier"
import astro from "eslint-plugin-astro"
import ts from "typescript-eslint"

export default defineConfig(
  globalIgnores(["dist/**", ".astro/**", "coverage/**", ".scratch/**", "test-results/**"]),

  {
    files: ["**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}"],
    extends: [js.configs.recommended, ts.configs.recommended]
  },

  ...astro.configs.recommended,
  ...astro.configs["jsx-a11y-recommended"],

  {
    linterOptions: {
      reportUnusedDisableDirectives: "error"
    }
  },

  eslintConfigPrettier
)
