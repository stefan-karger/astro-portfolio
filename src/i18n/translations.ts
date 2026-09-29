import type { Locale } from "@/i18n/types"

const de = {
  home: {
    metaTitle: "Softwareentwicklung & Fotografie",
    metaDescription:
      "Softwareentwicklung, Systemintegration, Schnittstellen, Datenabgleich und Fotografie.",
    hero: {
      greeting: "Hi! Ich bin Stefan.",
      intro:
        "Mich interessieren in der Softwareentwicklung vor allem die Stellen, an denen es kompliziert wird: gewachsene Systeme, die miteinander sprechen müssen, große Datenmengen, die zuverlässig synchronisiert, aufbereitet und ausgewertet werden sollen, und Abläufe, für die es keine Lösung von der Stange gibt.",
      photography:
        "Die Fotografie schafft Abstand zum Code. Die Werkzeuge ändern sich, aber der Blick fürs Detail bleibt.",
      imageAlt: (name: string) => `${name} in schwarzer Jacke und schwarzer Kappe`
    }
  },

  projects: {
    title: "Projekte",
    solid: {
      name: "SolidUI",
      kind: "Open Source",
      description:
        "Eine Komponentenbibliothek für SolidJS mit Kobalte, Corvu und Tailwind CSS. Dazu gehören eine Dokumentationsseite und ein CLI-Tool.",
      website: "solid-ui.com",
      source: "GitHub"
    },
    lager: {
      name: "Lagerabgleich & Preisautomatisierung",
      kind: "Kundenprojekt für JunksPlayGround",
      description:
        "Eine Schnittstelle, die Bestände und Bestellungen zwischen JTL-Wawi und Cardmarket vollautomatisch abgleicht. Anhand individueller Regeln und der aktuellen Preise auf Cardmarket berechnet und aktualisiert sie laufend die Verkaufspreise aller angebundenen Artikel.",
      metrics: [
        { value: "~200.000", label: "Artikelvarianten" },
        { value: "~4 Mio.", label: "Einzelartikel im Bestand" },
        { value: "~40.000", label: "Cardmarket-Bestellungen seit 2024" },
        {
          value: ">1.000",
          label: "Preisanpassungen pro Tag"
        }
      ]
    }
  },

  career: {
    title: "Werdegang",
    jobs: [
      {
        company: "BMW Rhein Gruppe",
        role: "Senior Software Engineer",
        period: "2014 — heute",
        type: "Hauptberuflich",
        summary:
          "Interne Sales- und After-Sales-Systeme, Systemintegration und ein unternehmensweites Ticketingsystem."
      },
      {
        company: "JunksPlayGround",
        role: "Softwareentwickler & Berater",
        period: "2022 — heute",
        type: "Nebenberuflich",
        summary:
          "Eigenverantwortliche Entwicklung und Beratung rund um Schnittstellen, Automatisierung, Datenmigration und das Intranet."
      },
      {
        company: "PARAGON Systemhaus GmbH",
        role: "Software Engineer",
        period: "2013"
      },
      {
        company: "HUK-COBURG",
        role: "Anwendungsentwickler",
        period: "2011 — 2013"
      },
      {
        company: "Bausparkasse Schwäbisch Hall",
        role: "BA Student & Anwendungsentwickler",
        period: "2008 — 2011"
      }
    ]
  },

  contact: {
    emailAction: "E-Mail schreiben"
  },

  footer: {
    contact: "Kontakt",
    elsewhere: "Anderswo"
  },

  nav: {
    home: "Home",
    portfolio: "Portfolio",
    blog: "Blog",
    legal: "Impressum",
    privacy: "Datenschutz",
    primaryLabel: "Hauptnavigation",
    socialLinksLabel: "Social-Media-Profile",
    languageLabel: "Sprache wählen",
    legalLabel: "Rechtliches",
    homeLinkLabel: "zur Startseite",
    skipLink: "Zum Inhalt springen"
  },

  language: {
    current: "aktuelle Sprache",
    switchToDe: "zur deutschen Version wechseln",
    switchToEn: "zur englischen Version wechseln"
  },

  prototype: {
    navigationLabel: "Seitenentwurf auswählen",
    label: "Entwurf",
    itemLabel: "Prototyp"
  }
}

type Translations = typeof de

const en = {
  home: {
    metaTitle: "Software Development & Photography",
    metaDescription:
      "Software development, systems integration, interfaces, data synchronization, and photography.",
    hero: {
      greeting: "Hi! I'm Stefan.",
      intro:
        "What interests me most in software development is where things get complicated: existing systems that need to work together, large amounts of data that need to be reliably synchronized, processed and analyzed, and workflows where there simply is no off-the-shelf solution.",
      photography:
        "Photography gives me distance from code. The tools change, but the eye for detail remains.",
      imageAlt: (name: string) => `${name} wearing a black jacket and black cap`
    }
  },

  projects: {
    title: "Projects",
    solid: {
      name: "SolidUI",
      kind: "Open source",
      description:
        "A component library for SolidJS built with Kobalte, Corvu and Tailwind CSS. It includes documentation and a CLI tool.",
      website: "solid-ui.com",
      source: "GitHub"
    },
    lager: {
      name: "Inventory sync & price automation",
      kind: "Client project for JunksPlayGround",
      description:
        "An integration that automatically synchronizes stock and orders between JTL-Wawi and Cardmarket. Using custom rules and current Cardmarket prices, it continuously calculates and updates the selling prices of all connected items.",
      metrics: [
        { value: "~200,000", label: "product variants" },
        { value: "~4m", label: "individual items in stock" },
        { value: "~40,000", label: "Cardmarket orders since 2024" },
        { value: ">1,000", label: "Price adjustments per day" }
      ]
    }
  },

  career: {
    title: "Career",
    jobs: [
      {
        company: "BMW Rhein Gruppe",
        role: "Senior Software Engineer",
        period: "2014 — present",
        type: "Full time",
        summary:
          "Internal sales and after-sales systems, systems integration, and a company-wide ticketing system."
      },
      {
        company: "JunksPlayGround",
        role: "Software Developer & Consultant",
        period: "2022 — present",
        type: "Part time",
        summary:
          "Independent development and consulting across integrations, automation, data migration, and the intranet."
      },
      {
        company: "PARAGON Systemhaus GmbH",
        role: "Software Engineer",
        period: "2013"
      },
      {
        company: "HUK-COBURG",
        role: "Application Developer",
        period: "2011 — 2013"
      },
      {
        company: "Bausparkasse Schwäbisch Hall",
        role: "Cooperative Student & Application Developer",
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

const translations = {
  de,
  en
} satisfies Record<Locale, Translations>

export function getTranslations(locale: Locale) {
  return translations[locale]
}
