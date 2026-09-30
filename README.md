# stefan-karger.de

Persönliche Website mit Portfolio, Blog sowie Impressum und Datenschutz in
Deutsch und Englisch. Astro erzeugt die statischen Seiten; das Hosting erfolgt
über Netlify.

## Entwicklung

Abhängigkeiten mit `pnpm install` installieren. Den Entwicklungsserver im
Hintergrund starten:

```sh
pnpm exec astro dev --background
```

Den Server mit `pnpm exec astro dev status`, `pnpm exec astro dev logs` und
`pnpm exec astro dev stop` verwalten.

| Befehl          | Zweck                                           |
| --------------- | ----------------------------------------------- |
| `pnpm validate` | Formatierung, ESLint, Astro-Prüfung und Build   |
| `pnpm build`    | Statische Produktionsseiten in `dist/` erzeugen |
| `pnpm preview`  | Den Produktions-Build lokal anzeigen            |

## Dokumentation

- [Bildpipeline und Portfolio](docs/image-pipeline.md)
- [Datenschutz und offene Prüfungen vor Veröffentlichung](docs/datenschutz.md)
- [Entwicklungsvorgaben](AGENTS.md)
- [Coding Guidelines](CODING_GUIDELINES.md)
