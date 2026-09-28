/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
export default {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  semi: false,
  singleQuote: false,
  trailingComma: "none",

  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],

  tailwindStylesheet: "./src/styles/global.css",

  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro"
      }
    }
  ]
}
