# stefan-karger.de

Persönliche Website von Stefan Karger: berufliches Portfolio, Fotogalerie und
Entwicklerblog mit deutscher und englischer Oberfläche.
Die Seiten entstehen statisch mit Astro und werden auf Netlify veröffentlicht.

## Was die Website bietet

- Portfolio mit Projekten, Berufsstationen und Kontaktmöglichkeiten.
- Fotogalerie mit optimierten Bildern, Masonry-Layout und PhotoSwipe-Lightbox.
- Markdown-Blog mit Serien, RSS und Filtern nach Monat, Sprache und Tags.
- Codebeispiele mit Shiki, Twoslash-Typinformationen und Kopierfunktion;
  Mermaid-Diagramme werden beim Build als SVG erzeugt.
- Metadaten, strukturierte Daten, Sitemap, Markdown-Exporte und `llms.txt`.

Astro, HTML und CSS übernehmen den Großteil der Arbeit. JavaScript ergänzt
die Galerie und die Blog-Steuerungen. Es gibt kein Backend und kein CMS.
Tailwind CSS gestaltet die Oberfläche; die Schriften werden lokal ausgeliefert.

## Lokal starten

Voraussetzungen: Node.js `^22.13.0 || >=24.0.0` und pnpm `12.10.0`.

```sh
pnpm install --frozen-lockfile
pnpm setup:diagrams
pnpm exec astro dev --background
```

`setup:diagrams` installiert einmalig Chromium für den Mermaid-Buildrenderer
und die Browsertests. Den Entwicklungsserver mit `pnpm exec astro dev status`,
`pnpm exec astro dev logs` und `pnpm exec astro dev stop` verwalten.

| Befehl          | Zweck                                                                 |
| --------------- | --------------------------------------------------------------------- |
| `pnpm build`    | Produktionsseiten in `dist/` erzeugen                                 |
| `pnpm preview`  | Den fertigen Build lokal ansehen                                      |
| `pnpm validate` | Formatierung, Lint, Typen und Tests mit einem Produktionsbuild prüfen |

Die Output- und Browsertests verwenden denselben Build. Bei Bedarf prüft
`pnpm test:integration` zusätzliche Inhaltsszenarien mit einem einzigen Fixture-Build.
Netlify installiert Chromium und veröffentlicht `dist/` gemäß `netlify.toml`.

## Inhalte und Aufbau

| Verzeichnis                                     | Inhalt                                          |
| ----------------------------------------------- | ----------------------------------------------- |
| `src/data/`                                     | Identität, Projekte und Berufsstationen         |
| `src/i18n/`                                     | Deutsche und englische Texte sowie Sprachrouten |
| `src/content/blog/`                             | Blogbeiträge als Markdown                       |
| `src/assets/`                                   | Quellbilder für die Bildoptimierung             |
| `src/components/`, `src/layouts/`, `src/pages/` | Oberfläche und Seiten                           |
| `src/lib/`                                      | Bloglogik, Metadaten und Markdown-Verarbeitung  |

Ein Blogbeitrag beginnt beispielsweise so:

```yaml
---
title: "Mein Beitrag"
description: "Worum es geht."
pubDate: "2026-10-02"
language: de
tags: [Astro, TypeScript]
---
```

Datumswerte stehen in Anführungszeichen, Tags in einer YAML-Liste.
Optional sind `updatedDate`, `draft: true` und `series` mit `name` und `part`.
Entwürfe erscheinen nicht im Produktionsbuild. Die Beitragssprache bestimmt
den Canonical und Markdown-Export; beide Oberflächensprachen können ihn anzeigen.

## Weitere Informationen

- [Lizenzhinweise für übernommene Assets](public/third-party-notices.txt), veröffentlicht unter
  `/third-party-notices.txt`.
- [Bildpipeline und Galerie](docs/image-pipeline.md)
- [Offene Punkte und Betreiberprüfungen](docs/offene-punkte.md)
