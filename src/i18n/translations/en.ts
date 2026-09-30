import type { Translations } from "./de"

export const en = {
  home: {
    metaTitle: "Software Development & Photography",
    metaDescription:
      "Software development, systems integration, interfaces, data reconciliation, and photography.",
    hero: {
      greeting: "Hi! I'm Stefan.",
      intro:
        "What excites me most about software development is tackling challenging problems: connecting complex systems and combining, reconciling, and analyzing large datasets. I especially enjoy building solutions for workflows where nothing off the shelf quite fits.",
      photography:
        "Photography gives me a break from code. The tools change, but the eye for detail remains.",
      imageAlt: (name: string) => `${name} wearing a black jacket and black cap`
    }
  },

  portfolio: {
    title: "Portfolio",
    intro: "A selection of photographs from the past ten years.",
    metaDescription:
      "Selected photographs by Stefan Karger: portraits, staged scenes and personal work.",
    lightbox: {
      close: "Close",
      zoom: "Zoom",
      previous: "Previous image",
      next: "Next image",
      error: "The image could not be loaded."
    }
  },

  projects: {
    title: "Projects",
    solid: {
      name: "SolidUI",
      kind: "Open source",
      description:
        "An unofficial port of shadcn/ui for SolidJS, with customizable UI components built on Kobalte, Corvu, and Tailwind CSS. It comes with its own documentation and a CLI tool for adding components directly to existing projects.",
      website: "solid-ui.com",
      source: "GitHub"
    },
    lager: {
      name: "Stock sync & auto-pricing",
      kind: "Project at JunksPlayGround",
      description:
        "A custom-built integration connecting JTL-Wawi and Cardmarket. It automatically synchronizes stock and orders and updates selling prices based on custom rules and current market data.",
      metrics: [
        { value: "≈200,000", label: "Product variants" },
        { value: "≈4,000,000", label: "Individual units in stock" },
        { value: "≈40,000", label: "Cardmarket orders since 2024" },
        { value: ">100,000", label: "Price comparisons per day" }
      ]
    }
  },

  career: {
    title: "Career",
    opensInNewTab: "opens in a new tab",
    jobs: [
      {
        company: "BMW Rhein Gruppe",
        url: "https://www.rhein-bmw.de/",
        role: "Senior Software Engineer",
        period: "2014 — present",
        type: "Full-time",
        summary:
          "Independent design, development, and long-term maintenance of internal software for sales, service, and IT. A key focus is building a central web application that gradually brings together information and functionality from existing business applications."
      },
      {
        company: "JunksPlayground",
        url: "https://junksplayground.de/",
        role: "Software Engineer & Technical Advisor",
        period: "2022 — present",
        type: "Part-time",
        summary:
          "Development and long-term maintenance of an integration between JTL-Wawi and Cardmarket for automated inventory, order, and price synchronization. Technical advice to company management on automation, system architecture, and new software projects."
      },
      {
        company: "PARAGON Systemhaus GmbH",
        role: "Software Engineer",
        period: "2013"
      },
      {
        company: "HUK-COBURG",
        role: "Software Engineer",
        period: "2011 — 2013"
      },
      {
        company: "Bausparkasse Schwäbisch Hall",
        role: "Dual Study Program in Business Information Systems (B.Sc.)",
        period: "2008 — 2011"
      }
    ]
  },

  contact: {
    emailAction: "Email me"
  },

  footer: {
    contact: "Contact",
    elsewhere: "Elsewhere"
  },

  nav: {
    home: "Home",
    portfolio: "Portfolio",
    blog: "Blog",
    legal: "Legal Notice",
    privacy: "Privacy Policy",
    primaryLabel: "Main navigation",
    socialLinksLabel: "Social profiles",
    languageLabel: "Choose language",
    legalLabel: "Legal",
    homeLinkLabel: "home page",
    skipLink: "Skip to content"
  },

  language: {
    current: "current language",
    switchToDe: "switch to the German version",
    switchToEn: "switch to the English version"
  },

  prototype: {
    navigationLabel: "Choose page prototype",
    label: "Draft",
    itemLabel: "Prototype"
  }
} satisfies Translations
