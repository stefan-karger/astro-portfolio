# stefan-karger.de

Persönliches Portfolio von Stefan Karger mit Fotogalerie und Entwicklerblog.
Die Website ist auf Deutsch und Englisch verfügbar, wird statisch mit Astro
und Tailwind CSS gebaut und über Netlify veröffentlicht.

## Lokal entwickeln

Voraussetzungen: Node.js `^22.13.0 || >=24.0.0` und pnpm `12.10.0`.

```sh
pnpm install --frozen-lockfile
pnpm setup:diagrams
pnpm exec astro dev --background
```

`pnpm setup:diagrams` installiert Chromium für Mermaid und die Browsertests.
Den Entwicklungsserver mit `pnpm exec astro dev status`, `pnpm exec astro dev logs`
und `pnpm exec astro dev stop` verwalten.

`pnpm validate` prüft Formatierung, Lint und Typen, baut die Website und führt
die Tests aus. Mit `pnpm build` und anschließend `pnpm preview` lässt sich
der Produktionsbuild lokal ansehen.

## Inhalte bearbeiten

- [`src/data/`](src/data/) enthält Portfolio, Projekte und Berufsstationen.
- [`src/i18n/`](src/i18n/) enthält die deutschen und englischen Oberflächentexte.
- [`src/content/blog/`](src/content/blog/) enthält die Blogbeiträge als Markdown.
  Das [Schema](src/content.config.ts) definiert die Metadaten.
- [Bildpipeline und Galerie](docs/image-pipeline.md) beschreibt die Arbeit mit Fotos.

[Hinweise zu Assets von Dritten](public/third-party-notices.txt) ·
[n8n-Konfiguration](docs/n8n.md)
