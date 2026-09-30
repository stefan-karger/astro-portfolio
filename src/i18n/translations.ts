import type { Locale } from "@/i18n/types"

const de = {
  home: {
    metaTitle: "Softwareentwicklung & Fotografie",
    metaDescription:
      "Softwareentwicklung, Systemintegration, Schnittstellen, Datenabgleich und Fotografie.",
    hero: {
      greeting: "Hi! Ich bin Stefan.",
      intro:
        "Das Spannendste an der Softwareentwicklung sind für mich die Aufgaben, bei denen es kompliziert wird: komplexe Systeme miteinander verbinden und große Datenbestände zusammenführen, abgleichen und auswerten. Besonders reizt es mich, Lösungen für Abläufe zu entwickeln, für die es nichts von der Stange gibt.",
      photography:
        "Die Fotografie schafft Abstand zum Code. Die Werkzeuge ändern sich, aber der Blick fürs Detail bleibt.",
      imageAlt: (name: string) => `${name} in schwarzer Jacke und schwarzer Kappe`
    }
  },

  portfolio: {
    title: "Portfolio",
    intro: "Eine kleine Auswahl aus 10 Jahren Fotografie.",
    metaDescription:
      "Ausgewählte Fotografien von Stefan Karger: Porträts, inszenierte Szenen und persönliche Arbeiten.",
    lightbox: {
      close: "Schließen",
      zoom: "Vergrößern",
      previous: "Vorheriges Bild",
      next: "Nächstes Bild",
      error: "Das Bild konnte nicht geladen werden."
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
        "Eine Schnittstellen-Anwendung, die Bestände und Bestellungen zwischen JTL-Wawi und Cardmarket vollautomatisch abgleicht. Anhand individueller Regeln und der aktuellen Preise auf Cardmarket berechnet und aktualisiert sie laufend die Verkaufspreise aller angebundenen Artikel.",
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
    opensInNewTab: "öffnet in neuem Tab",
    jobs: [
      {
        company: "BMW Rhein Gruppe",
        url: "https://www.rhein-bmw.de/",
        role: "Senior Softwareentwickler",
        period: "2014 — heute",
        type: "Hauptberuflich",
        summary:
          "Eigenverantwortliche Konzeption, Entwicklung und langfristige Betreuung interner Software für Vertrieb, Service und IT. Ein Schwerpunkt ist der Aufbau einer zentralen Webanwendung, die Informationen und Funktionen bestehender Fachanwendungen schrittweise zusammenführt."
      },
      {
        company: "JunksPlayground",
        url: "https://junksplayground.de/",
        role: "Softwareentwickler & technischer Berater",
        period: "2022 — heute",
        type: "Nebenberuflich",
        summary:
          "Entwicklung und langfristige Betreuung einer Schnittstelle zwischen JTL-Wawi und Cardmarket für automatisierte Bestands-, Bestell- und Preisabgleiche. Ergänzend technische Beratung der Geschäftsleitung bei Automatisierungen, Systemarchitektur und neuen Softwareprojekten."
      },
      {
        company: "PARAGON Systemhaus GmbH",
        role: "Softwareentwickler",
        period: "2013"
      },
      {
        company: "HUK-COBURG",
        role: "Softwareentwickler",
        period: "2011 — 2013"
      },
      {
        company: "Bausparkasse Schwäbisch Hall",
        role: "Duales Studium Wirtschaftsinformatik (B.Sc.)",
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
        "What I find most exciting about software development are the tasks where things get complicated: connecting complex systems and bringing together, synchronizing, and analyzing large datasets. I'm especially drawn to developing solutions for workflows that have no off-the-shelf option.",
      photography:
        "Photography gives me distance from code. The tools change, but the eye for detail remains.",
      imageAlt: (name: string) => `${name} wearing a black jacket and black cap`
    }
  },

  portfolio: {
    title: "Portfolio",
    intro: "A small selection from 10 years of photography.",
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
        "A component library for SolidJS built with Kobalte, Corvu and Tailwind CSS. It includes documentation and a CLI tool.",
      website: "solid-ui.com",
      source: "GitHub"
    },
    lager: {
      name: "Inventory sync & price automation",
      kind: "Client project for JunksPlayGround",
      description:
        "An integration application that automatically synchronizes stock and orders between JTL-Wawi and Cardmarket. Using custom rules and current Cardmarket prices, it continuously calculates and updates the selling prices of all connected items.",
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
    opensInNewTab: "opens in a new tab",
    jobs: [
      {
        company: "BMW Rhein Gruppe",
        url: "https://www.rhein-bmw.de/",
        role: "Senior Software Engineer",
        period: "2014 — present",
        type: "Full time",
        summary:
          "Independent design, development, and long-term maintenance of internal software for sales, service, and IT. A key focus is building a central web application that gradually brings together information and functionality from existing business applications."
      },
      {
        company: "JunksPlayground",
        url: "https://junksplayground.de/",
        role: "Software Engineer & Technical Advisor",
        period: "2022 — present",
        type: "Part time",
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

const translations = {
  de,
  en
} satisfies Record<Locale, Translations>

export function getTranslations(locale: Locale) {
  return translations[locale]
}
