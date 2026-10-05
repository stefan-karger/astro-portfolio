export const de = {
  home: {
    metaTitle: "Softwareentwicklung & Fotografie",
    metaDescription:
      "Stefan Karger entwickelt Software für Systemintegration und Datenabgleich. Einblicke in seine Projekte, seinen Werdegang und seine Fotografie.",
    hero: {
      greeting: "Hi! Ich bin Stefan.",
      intro:
        "Das Spannendste an der Softwareentwicklung sind für mich die Aufgaben, bei denen es anspruchsvoll wird: komplexe Systeme verbinden, große Datenbestände zusammenführen und Lösungen für Prozesse entwickeln, für die es nichts von der Stange gibt.",
      photography:
        "Die Fotografie schafft Abstand zum Code. Die Werkzeuge ändern sich, aber der Blick fürs Detail bleibt.",
      imageAlt: (name: string) => `${name} in schwarzer Jacke und schwarzer Kappe`
    }
  },

  portfolio: {
    title: "Fotografie",
    intro: "Eine Auswahl meiner Fotografien aus den vergangenen zehn Jahren.",
    metaDescription:
      "Ausgewählte Fotografien von Stefan Karger: Porträts, inszenierte Szenen und persönliche Arbeiten.",
    imageAlts: {
      "bathtub-in-meadow": "Badewanne auf einer Wiese",
      "maternity-portrait-in-poppy-field": "Schwangerschaftsporträt im Mohnfeld",
      "seated-portrait-in-ruins": "Porträt im Sitzen zwischen Ruinen",
      "shield-portrait-with-raven": "Porträt mit Schild und Rabe",
      "portrait-with-owl": "Porträt mit Eule",
      "portrait-with-raven-and-spear": "Porträt mit Rabe und Speer",
      "portrait-on-stone-stairs": "Porträt auf einer Steintreppe",
      "winged-pair-by-tree": "Paar mit Flügeln an einem Baum",
      "sword-portrait-in-sandstone": "Porträt mit Schwert vor Sandstein",
      "maternity-portrait-on-bed": "Schwangerschaftsporträt auf einem Bett",
      "bridal-portrait-outdoors": "Brautporträt im Freien",
      "tattooed-portrait-by-mural": "Porträt mit Tattoos vor einem Wandbild",
      "portrait-facing-mirror": "Porträt vor einem Spiegel",
      "seated-portrait-by-window": "Porträt im Sitzen am Fenster",
      "antler-portrait-in-forest": "Porträt mit Geweih im Wald",
      "maternity-portrait-by-window": "Schwangerschaftsporträt am Fenster",
      "silhouette-above-city-at-night": "Silhouette über der nächtlichen Stadt"
    },
    lightbox: {
      label: "Fotogalerie",
      close: "Schließen",
      zoomIn: "Vergrößern",
      zoomOut: "Verkleinern",
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
      kind: "Projekt bei Junksplayground",
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
        company: "Junksplayground",
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
    emailAction: "Schreib mir"
  },

  links: {
    opensInNewTab: "öffnet in neuem Tab"
  },

  footer: {
    contact: "Kontakt",
    elsewhere: "Anderswo"
  },

  nav: {
    menu: "Menü",
    home: "Home",
    portfolio: "Fotografie",
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

  seo: {
    imageAlt: "SK.-Wordmark von Stefan Karger"
  },

  legal: {
    metaDescription: "Impressum und Kontaktangaben zur Website von Stefan Karger."
  },

  privacy: {
    metaDescription:
      "Informationen zur Verarbeitung personenbezogener Daten beim Besuch dieser Website und bei der Kontaktaufnahme mit Stefan Karger."
  },

  blog: {
    description: "Notizen zu Software, Webentwicklung und den Dingen, die ich dabei lerne.",
    empty: "Noch keine Beiträge veröffentlicht.",
    draft: "Entwurf",
    tags: "Tags",
    language: { de: "Deutsch", en: "Englisch" },
    contents: "Auf dieser Seite",
    back: "Zur Übersicht",
    navigation: "Weitere Beiträge",
    previous: "Vorheriger Beitrag",
    next: "Nächster Beitrag",
    copy: "Code kopieren",
    copied: "Code in die Zwischenablage kopiert",
    copyError: "Kopieren fehlgeschlagen. Bitte den Code markieren und manuell kopieren.",
    typeInfo: "Typinformationen",
    series: "Artikelserie",
    part: "Teil",
    mermaidSource: "Quelltext anzeigen",
    mermaidDiagram: "Diagramm",
    mermaidError: "Das Diagramm konnte nicht geladen werden. Der Quelltext ist weiterhin verfügbar."
  },

  prototype: {
    navigationLabel: "Seitenentwurf auswählen",
    label: "Entwurf",
    itemLabel: "Prototyp"
  }
}

export type Translations = typeof de
