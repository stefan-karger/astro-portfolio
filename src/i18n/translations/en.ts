import type { Translations } from "./de"

export const en = {
  home: {
    metaTitle: "Software Development & Photography",
    metaDescription:
      "Stefan Karger develops software for systems integration and data reconciliation. Explore his projects, career, and photography.",
    hero: {
      greeting: "Hi! I'm Stefan.",
      intro:
        "I'm drawn to the challenging side of software development: making complex systems work together, bringing large datasets into a coherent whole, and building solutions for workflows that off-the-shelf software can't handle.",
      photography:
        "Photography gives me a break from code. The tools change, but the eye for detail remains.",
      imageAlt: (name: string) => `${name} wearing a black jacket and black cap`
    }
  },

  portfolio: {
    title: "Photography",
    intro: "A selection of photographs from the past ten years.",
    metaDescription:
      "Selected photographs by Stefan Karger: portraits, staged scenes and personal work.",
    imageAlts: {
      "bathtub-in-meadow": "bathtub in meadow",
      "maternity-portrait-in-poppy-field": "maternity portrait in poppy field",
      "seated-portrait-in-ruins": "seated portrait in ruins",
      "shield-portrait-with-raven": "shield portrait with raven",
      "portrait-with-owl": "portrait with owl",
      "portrait-with-raven-and-spear": "portrait with raven and spear",
      "portrait-on-stone-stairs": "portrait on stone stairs",
      "winged-pair-by-tree": "winged pair by tree",
      "sword-portrait-in-sandstone": "sword portrait in sandstone",
      "maternity-portrait-on-bed": "maternity portrait on bed",
      "bridal-portrait-outdoors": "bridal portrait outdoors",
      "tattooed-portrait-by-mural": "tattooed portrait by mural",
      "portrait-facing-mirror": "portrait facing mirror",
      "seated-portrait-by-window": "seated portrait by window",
      "antler-portrait-in-forest": "antler portrait in forest",
      "maternity-portrait-by-window": "maternity portrait by window",
      "silhouette-above-city-at-night": "silhouette above city at night"
    },
    lightbox: {
      label: "Photo gallery",
      carousel: "carousel",
      slide: "slide",
      close: "Close",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      previous: "Previous image",
      next: "Next image",
      error: "The image could not be loaded."
    }
  },

  projects: {
    title: "Projects",
    solid: {
      kind: "Open source",
      description:
        "An unofficial port of shadcn/ui for SolidJS, with customizable UI components built on Kobalte, Corvu, and Tailwind CSS. It comes with its own documentation and a CLI tool for adding components directly to existing projects.",
      source: "GitHub"
    },
    lager: {
      name: "Stock sync & auto-pricing",
      kind: "Project at Junksplayground",
      metricsAsOf: "As of",
      description:
        "A custom-built integration connecting JTL-Wawi and Cardmarket. It automatically synchronizes stock and orders and updates selling prices based on custom rules and current market data.",
      metrics: {
        variants: "Product variants",
        stock: "Individual units in stock",
        orders: (since: number) => `Cardmarket orders since ${since}`,
        priceChecksPerDay: "Price evaluation per day"
      }
    }
  },

  career: {
    title: "Career",
    present: "present",
    jobs: {
      rhein: {
        role: "Senior Software Engineer",
        type: "Day job",
        summary:
          "Independent design, development, and long-term maintenance of internal software for sales, service, and IT. A key focus is building a central web application that gradually brings together information and functionality from existing business applications."
      },
      junksplayground: {
        role: "Software Engineer & Technical Advisor",
        type: "Side job",
        summary:
          "Development and long-term maintenance of an integration between JTL-Wawi and Cardmarket for automated inventory, order, and price synchronization. Technical advice to company management on automation, system architecture, and new software projects."
      },
      paragon: {
        role: "Software Engineer"
      },
      huk: {
        role: "Software Engineer"
      },
      schwaebischHall: {
        role: "Dual Study Program in Business Information Systems (B.Sc.)"
      }
    }
  },

  contact: {
    emailAction: "Email me"
  },

  links: {
    opensInNewTab: "opens in a new tab"
  },

  footer: {
    contact: "Contact",
    elsewhere: "Elsewhere"
  },

  nav: {
    menu: "Menu",
    home: "Home",
    portfolio: "Photography",
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

  seo: {
    imageAlt: "Stefan Karger's SK. wordmark"
  },

  legal: {
    metaDescription: "Legal information and contact details for Stefan Karger's website."
  },

  privacy: {
    metaDescription:
      "How personal data is processed when you visit this website or contact Stefan Karger."
  },

  blog: {
    author: "By",
    published: "Published",
    updated: "Updated",
    description: "Notes on software, web development and what I learn along the way.",
    empty: "No posts published yet.",
    draft: "Draft",
    tags: "Tags",
    language: { de: "German", en: "English" },
    contents: "On this page",
    back: "Back to overview",
    navigation: "More posts",
    previous: "Previous post",
    next: "Next post",
    copy: "Copy code",
    copied: "Code copied to clipboard",
    copyError: "Copy failed. Please select the code and copy it manually.",
    typeInfo: "Type information",
    series: "Article series",
    part: "Part",
    mermaidSource: "Show source",
    mermaidDiagram: "Diagram",
    mermaidError: "The diagram could not be loaded. Its source is still available."
  },

  prototype: {
    navigationLabel: "Choose page prototype",
    label: "Draft",
    itemLabel: "Prototype"
  }
} satisfies Translations
