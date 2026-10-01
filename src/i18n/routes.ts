export const routes = {
  home: {
    de: "",
    en: ""
  },

  portfolio: {
    de: "fotografie",
    en: "photography"
  },

  blog: {
    de: "blog",
    en: "blog"
  },

  legal: {
    de: "impressum",
    en: "legal-notice"
  },

  privacy: {
    de: "datenschutz",
    en: "privacy-policy"
  }
} as const

export type RouteId = keyof typeof routes
