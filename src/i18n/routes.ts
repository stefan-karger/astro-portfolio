export const routes = {
  home: {
    de: "",
    en: ""
  },

  portfolio: {
    de: "portfolio",
    en: "portfolio"
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
