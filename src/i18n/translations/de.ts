export const de = {
  home: {
    metaTitle: "Softwareentwicklung & Fotografie",
    metaDescription:
      "Softwareentwicklung, Systemintegration, Schnittstellen, Datenabgleich und Fotografie.",
    hero: {
      greeting: "Hi! Ich bin Stefan.",
      intro:
        "Das Spannendste an der Softwareentwicklung sind für mich die Aufgaben, bei denen es anspruchsvoll wird: komplexe Systeme miteinander verbinden und große Datenbestände zusammenführen, abgleichen und auswerten. Besonders reizt es mich, Lösungen für Prozesse zu entwickeln, für die es nichts von der Stange gibt.",
      photography:
        "Die Fotografie schafft Abstand zum Code. Die Werkzeuge ändern sich, aber der Blick fürs Detail bleibt.",
      imageAlt: (name: string) => `${name} in schwarzer Jacke und schwarzer Kappe`
    }
  },

  portfolio: {
    title: "Portfolio",
    intro: "Eine Auswahl meiner Fotografien aus den vergangenen zehn Jahren.",
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
        "Ein inoffizieller Port von shadcn/ui für SolidJS: anpassbare UI-Komponenten auf Basis von Kobalte, Corvu und Tailwind CSS. Dazu gehören eine eigene Dokumentation und ein CLI-Tool, mit dem sich die Komponenten direkt in bestehende Projekte übernehmen lassen.",
      website: "solid-ui.com",
      source: "GitHub"
    },
    lager: {
      name: "Lagerabgleich & Preisautomatisierung",
      kind: "Projekt bei JunksPlayGround",
      description:
        "Eine eigens entwickelte Schnittstelle, die JTL-Wawi und Cardmarket miteinander verbindet. Sie gleicht Bestände und Bestellungen automatisiert ab und aktualisiert die Verkaufspreise eigenständig anhand individueller Regeln und aktueller Marktdaten.",
      metrics: [
        { value: "≈200.000", label: "Artikelvarianten" },
        { value: "≈4.000.000", label: "Einzelartikel im Bestand" },
        { value: "≈40.000", label: "Cardmarket-Bestellungen seit 2024" },
        {
          value: ">100.000",
          label: "Preisabgleiche am Tag"
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

export type Translations = typeof de
