---
title: "Astro für Entwicklerblogs: Shiki & Twoslash"
description: "Teil 1 der Serie: So entsteht dieser Blog mit Astro-Collections, Markdown und Codeblöcken mit Shiki und Twoslash. Vom Setup bis zum Praxisbeispiel."
pubDate: "2026-10-02"
updatedDate: "2026-10-06"
language: de
tags: "Astro, Markdown, Shiki, TypeScript"
draft: false
series:
  name: "Astro für Entwicklerblogs"
  part: 1
---

Ein Entwicklerblog braucht gut lesbare Texte und Code, den man verstehen und
übernehmen kann. Für diesen Blog schreibe ich Beiträge in Markdown. Astro erzeugt
daraus die Seiten; Shiki übernimmt die Syntaxfarben und Twoslash ergänzt bei Bedarf
TypeScript-Typinformationen.

Dieser Beitrag ist der erste Teil der Serie "Astro für Entwicklerblogs".
[Teil 2 ergänzt Mermaid-Diagramme](/blog/astro-fuer-entwicklerblogs-mermaid-diagramme/)
für Architektur und Abläufe und zeigt, wie sie die Gestaltung dieses Blogs übernehmen.

Hier zeige ich den Stack, die Einrichtung im Projekt und praktische Beispiele aus
einem Blog: Entwürfe vor der Veröffentlichung filtern, Release-Notizen erzeugen und
Veröffentlichungsdaten typsicher formatieren. Die Codeblöcke lassen sich direkt
kopieren und ausprobieren.

## Der Stack

Die Aufgaben sind auf wenige Bausteine verteilt:

| Baustein                                                         | Aufgabe in diesem Blog                                                                    |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [Astro](https://docs.astro.build/en/guides/content-collections/) | Lädt und validiert Beiträge über Content Collections und erzeugt statische Seiten.        |
| [Markdown](https://docs.astro.build/en/guides/markdown-content/) | Beschreibt Texte, Überschriften, Listen, Tabellen, Links und Codeblöcke.                  |
| [Shiki](https://docs.astro.build/en/guides/syntax-highlighting/) | Erzeugt beim Build die Syntaxfarben für Code. Astro bringt die Integration bereits mit.   |
| [Shiki-Transformer](https://shiki.style/packages/transformers)   | Kennzeichnen hinzugefügte, entfernte und hervorgehobene Zeilen.                           |
| [Twoslash](https://shiki.style/packages/twoslash)                | Prüft ausgewählte TypeScript-Beispiele und erzeugt Typinformationen, JSDoc und Diagnosen. |
| Tailwind CSS und Astro-Komponenten                               | Gestalten Beiträge, Codeblöcke und die Navigation.                                        |

Ein eigener Shiki-Transformer ergänzt **Dateititel**, **Zeilennummern** und den
Quelltext für **Copy**. Diese Ergänzungen sind Konventionen dieses Projekts; sie
gehören nicht automatisch zu jedem Astro-Blog.

Syntaxfarben, Diffs und Typausgaben entstehen beim Build. Im Browser übernimmt ein
kleines Script das Kopieren und die Bedienung der Typ-Popups. Ein weiteres markiert
den aktuellen Abschnitt in der Inhaltsübersicht. Für den Text und die Codefarben
ist keine hydratisierte UI-Komponente nötig.

## Das Setup

### Pakete und Projektstruktur

Der folgende Auszug aus `package.json` zeigt die für den Blog relevanten Pakete.
Die Versionsangaben entsprechen dem Stand dieses Projekts:

```json title="package.json · Blog-Auszug"
{
  "type": "module",
  "engines": {
    "node": "^22.13.0 || >=24.0.0"
  },
  "scripts": {
    "dev": "astro dev",
    "check": "astro check",
    "build": "astro build"
  },
  "dependencies": {
    "astro": "^7.3.4",
    "@tailwindcss/vite": "^4.3.3",
    "tailwindcss": "^4.3.3"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.10",
    "@shikijs/transformers": "4.4.3",
    "@shikijs/twoslash": "4.4.3",
    "@types/hast": "3.0.4",
    "shiki": "4.4.3",
    "typescript": "~6.0.3"
  }
}
```

Die Dateien für Inhalte, Darstellung und Codeverarbeitung liegen getrennt:

```
src/
  content.config.ts
  content/blog/
    astro-fuer-entwicklerblogs-shiki-twoslash.md
  pages/blog/
    index.astro
    [...slug].astro
  layouts/
    blog-layout.astro
  components/blog/
    blog-index.astro
    code-block-controls.astro
  lib/
    blog.ts
    shiki/code-block.ts
  styles/
    global.css
```

Ein Block ohne Sprachangabe wie dieser Dateibaum bleibt ohne Syntaxfarben. Auch
hier funktioniert Copy. Die englischen Blogseiten liegen zusätzlich unter
`src/pages/en/blog`.

Die Imports mit `@/` verwenden den Alias aus der TypeScript-Konfiguration:

```json title="tsconfig.json"
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "ignoreDeprecations": "6.0"
  }
}
```

### Markdown und Shiki konfigurieren

In `astro.config.mjs` werden die Transformer an Astros Markdown-Verarbeitung
übergeben. Hier der Blog-Auszug der Konfiguration:

```js title="astro.config.mjs · Blog-Auszug"
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from "@shikijs/transformers"
import { rendererRich, transformerTwoslash } from "@shikijs/twoslash"
import { transformerCodeBlock } from "./src/lib/shiki/code-block.ts"

export default defineConfig({
  site: "https://stefan-karger.de",
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    shikiConfig: {
      theme: "github-light",
      transformers: [
        transformerTwoslash({
          explicitTrigger: true,
          renderer: rendererRich({
            queryRendering: "line",
            errorRendering: "line"
          })
        }),
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerRemoveNotationEscape(),
        transformerCodeBlock()
      ]
    }
  },
  i18n: {
    defaultLocale: "de",
    locales: ["de", "en"],
    routing: { prefixDefaultLocale: false }
  }
})
```

`explicitTrigger: true` aktiviert die Typprüfung nur für Fences mit dem Zusatz
`twoslash`. Gewöhnliche `ts`-Blöcke bleiben damit auch für unvollständige Ausschnitte
geeignet. Query- und Fehlerausgaben erscheinen direkt im Codeblock.

`transformerCodeBlock()` ist der eigene Renderer in `src/lib/shiki/code-block.ts`.
Er übernimmt drei Aufgaben:

- Die Fence-Zusätze für Dateititel und Zeilennummern lesen und den Copy-Button anlegen.
- Nach den anderen Transformern den Kopiertext ermitteln. Entfernte Diff-Zeilen,
  Twoslash-Ausgaben und Zeilennummern werden dabei ausgeschlossen.
- Typ-Popups neben das scrollbare `pre` setzen, damit sie nicht an dessen Rand
  abgeschnitten werden.

`src/styles/global.css` importiert Tailwind und definiert die gemeinsamen CSS-Tokens.
Das Bloglayout importiert zusätzlich `src/styles/blog.css`. Diese Datei enthält
die Twoslash-Styles und gestaltet das erzeugte Markdown sowie Diffs und
Hervorhebungen. `code-block-controls.astro` verbindet die Copy-Buttons mit der
Clipboard-API und ergänzt Hover, Fokus und Antippen für die nativen Popovers.

Dieser Blog verwendet das helle Theme `github-light`. Shiki erzeugt die
Syntaxfarben beim Build direkt im HTML.

### Die Content Collection anlegen

Die Collection lädt `.md`-Dateien aus `src/content/blog`. Ihr Schema prüft das
Frontmatter, akzeptiert Kalenderdaten als Strings in `YYYY-MM-DD` und wandelt sie
in `Date`-Objekte mit UTC-Mitternacht um:

```ts title="src/content.config.ts"
import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const date = z.iso
  .date({ error: 'Expected a valid date string in "YYYY-MM-DD"; quote dates in frontmatter.' })
  .transform((value) => new Date(`${value}T00:00:00.000Z`))

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z
    .object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      pubDate: date,
      updatedDate: date.optional(),
      language: z.enum(["de", "en"]),
      tags: z
        .string()
        .default("")
        .transform((value) => [
          ...new Set(
            value
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          )
        ]),
      draft: z.boolean().default(false)
    })
    .refine(({ pubDate, updatedDate }) => !updatedDate || updatedDate >= pubDate, {
      path: ["updatedDate"],
      message: "updatedDate must be on or after pubDate."
    })
})

export const collections = { blog }
```

Ein neuer Beitrag beginnt beispielsweise so:

```md title="src/content/blog/datumsformatierung.md"
---
title: "Veröffentlichungsdaten zuverlässig formatieren"
description: "Warum eine feste Zeitzone Datumsangaben im Blog stabil hält."
pubDate: "2026-10-02"
language: de
tags: "Astro, TypeScript, Astro"
draft: false
---

Datumsangaben sollen für alle Leser denselben Veröffentlichungstag zeigen.
```

Die Anführungszeichen verhindern, dass der YAML-Parser den Wert vor der
Validierung in ein `Date`-Objekt umwandelt. Ungültige Kalenderdaten werden
abgelehnt. Ein optionales `updatedDate` folgt derselben Schreibweise und darf
nicht vor `pubDate` liegen. Es wird bei einer inhaltlichen Aktualisierung gesetzt.

Aus den Tags werden hier `Astro` und `TypeScript`: Leerzeichen, leere Einträge und
Dopplungen werden entfernt. Der Dateipfad bestimmt den Slug. Unterordner sind
ebenfalls möglich; `language` beschreibt die Sprache des Beitrags.

### Beiträge rendern und veröffentlichen

Die dynamische Route erzeugt für jeden veröffentlichten Beitrag eine Seite und
übergibt ihn an das gemeinsame Layout:

```astro title="src/pages/blog/[...slug].astro"
---
import type { CollectionEntry } from "astro:content"
import BlogLayout from "@/layouts/blog-layout.astro"
import { getPosts } from "@/lib/blog"

export async function getStaticPaths() {
  return (await getPosts()).map((post) => ({
    params: { slug: post.id },
    props: { post }
  }))
}

interface Props {
  post: CollectionEntry<"blog">
}
const { post } = Astro.props
---

<BlogLayout post={post} />
```

`@/` verweist über die `paths`-Einstellung in `tsconfig.json` auf `src/`. Das Layout
ruft `render(post)` auf und erhält die gerenderte `Content`-Komponente sowie die
Überschriften. Daraus entsteht die Inhaltsübersicht für `h2` und `h3`. Der aktuelle
Abschnitt wird beim Scrollen fett markiert. Die Übersicht, das Datum, die Tags und
die Links zu benachbarten Beiträgen werden aus den Collection-Daten erzeugt.

Die Route unter `/en/blog` verwendet dasselbe Layout und dieselben Beiträge.
Beim Sprachwechsel bleiben Inhalt und Slug erhalten; Navigation, Datumsformat und
Copy-Meldungen wechseln die Sprache. Ein deutscher Beitrag wird dabei nicht
automatisch übersetzt.

Im vorhandenen Projekt lässt sich der Ablauf mit diesen Befehlen nachvollziehen:

```sh title="Entwicklung und Build"
pnpm install
pnpm dev --background
pnpm check
pnpm build
```

`draft: true` hält einen Beitrag während der lokalen Entwicklung sichtbar und
schließt ihn aus dem Produktionsbuild aus. Die Filterung dafür steckt in
`getPosts()`; die Übersicht und beide Artikelrouten verwenden diese Funktion.

## Praxisbeispiele

### Entwürfe filtern und Änderungen erklären

Wenn ein Blog zunächst alle Beiträge lädt, können Entwürfe versehentlich in der
veröffentlichten Übersicht auftauchen. Das folgende Beispiel ergänzt den Filter
und sortiert die Beiträge vom neuesten zum ältesten. Bei gleichem Datum entscheidet
der Slug über eine stabile Reihenfolge.

Der Fence verwendet `ts title="src/lib/blog.ts" showLineNumbers`. Kommentare mit
`[!code --]` und `[!code ++]` markieren die Änderung; `[!code highlight]` hebt die
Sortierung hervor:

<!-- prettier-ignore -->
```ts title="src/lib/blog.ts" showLineNumbers
import { getCollection } from "astro:content"

export async function getPosts() {
  const posts = await getCollection("blog") // [!code --]
  const posts = await getCollection( // [!code ++]
    "blog", // [!code ++]
    ({ data }) => !import.meta.env.PROD || !data.draft // [!code ++]
  ) // [!code ++]

  return posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime() || a.id.localeCompare(b.id) // [!code highlight]
  )
}
```

**Copy übernimmt den neuen Stand.** Die alte Ladezeile und die Markierungskommentare
fehlen im kopierten Code. Dateititel und Zeilennummern werden ebenfalls nicht
kopiert; die Leerzeilen bleiben erhalten.

Ein kurzer Ablauf für die Veröffentlichung lässt sich ganz normal als Markdown
schreiben:

1. Den Beitrag als _Entwurf_ lokal prüfen.
2. `draft` auf `false` setzen.
3. Typprüfung, Tests und Build ausführen.

> Ein erfolgreicher Build prüft auch die expliziten Twoslash-Beispiele. Ein
> unerwarteter TypeScript-Fehler darin verhindert die Veröffentlichung.

### Markdown für Release-Notizen erzeugen

Wer Release-Notizen aus einem Script erzeugt, arbeitet oft mit Markdown,
HTML-Zeichen und mehrzeiligen Strings. Dieser Block hat bewusst keinen Dateititel;
Copy sitzt direkt oben rechts:

````ts
const notes = [
  "## Release 1.1",
  "",
  "**Neu:** Entwürfe bleiben im Produktionsbuild verborgen.",
  "",
  "```ts",
  'const label = "<strong>Blog & Code</strong>"',
  "const published = true // [\!code ++]",
  "```"
].join("\n")

console.log(notes)
````

Der Backslash in `[\!code ++]` verhindert, dass Shiki die Beispielzeichenfolge
selbst als Diff behandelt. Anzeige und Copy enthalten den wörtlichen Marker
`[!code ++]`. Anführungszeichen, Backticks, HTML-Zeichen und `\n` bleiben im
kopierten Quelltext erhalten.

### Typen an einer Datumsfunktion zeigen

Eine feste Zeitzone verhindert, dass derselbe Veröffentlichungszeitpunkt je nach
Umgebung als anderer Kalendertag angezeigt wird. Die folgende Funktion verwendet
deshalb UTC und wählt die Darstellung über die Oberflächensprache.

Dieses Beispiel bündelt Typprüfung, JSDoc, eine dauerhafte Typausgabe, ein
ausgeblendetes Setup und Zeilennummern. Der Fence lautet
`ts twoslash title="src/lib/format-post-date.ts" showLineNumbers`:

```ts twoslash title="src/lib/format-post-date.ts" showLineNumbers
type Locale = "de" | "en"
// ---cut---
/** Formats a publication date in UTC for the selected locale. */
function formatPostDate(locale: Locale, date: Date) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC" // [!code highlight]
  }).format(date)
}

const label = formatPostDate("de", new Date("2026-10-02T00:00:00Z"))
//    ^?
```

Die kleine `Locale`-Definition oberhalb von `// ---cut---` steht nur für die
Typprüfung bereit. Im Projekt wird dieser Typ aus `src/i18n/types.ts` importiert.
Die versteckte Definition erscheint weder in der Ausgabe noch im Kopiertext.

`// ^?` zeigt den abgeleiteten Typ von `label` dauerhaft unter der Zeile an.
Öffne die Typinformation von `formatPostDate` per Hover, Tastaturfokus oder
Antippen: Das Popup enthält die Signatur und die JSDoc-Beschreibung. Escape schließt
es wieder. Query-Kommentare und Typausgaben werden nicht mitkopiert.

### Ungültige Daten gezielt erklären

Ein Datum aus einer API kommt häufig als String. Die Datumsfunktion erwartet
hingegen ein `Date`-Objekt. Twoslash kann den Fehler und die passende Umwandlung in
einem einzigen Beispiel zeigen:

```ts twoslash title="Veröffentlichungsdatum aus einer API"
// @errors: 2345
declare function formatPostDate(locale: "de" | "en", date: Date): string
// ---cut---
const pubDate = "2026-10-02T00:00:00Z"

formatPostDate("de", pubDate)
formatPostDate("de", new Date(pubDate))
```

`// @errors: 2345` erlaubt hier ausdrücklich die Diagnose für den falschen
Argumenttyp. Die nächste Zeile zeigt die Korrektur. Die versteckte Deklaration
beschreibt dieselbe Funktion wie im vorherigen Beispiel; beide Codeblöcke werden
unabhängig voneinander geprüft. Copy enthält die beiden Aufrufe als Lehrbeispiel,
aber weder das versteckte Setup noch die Diagnose.

Die Content Collection erledigt eine vergleichbare Umwandlung beim Laden des
Frontmatters nach der Prüfung mit `z.iso.date()`. So erhält das Layout geprüfte
Daten, während der Beitrag selbst bei einfachem Markdown bleibt.

Vor dem Veröffentlichen prüfe ich mit `pnpm test:blog` die Codeverarbeitung und mit
`pnpm check` und `pnpm build` das Projekt. Im Browser teste ich Copy, Sprunglinks und
Typ-Popups auch mit Tastatur und schmalem Display. Ohne JavaScript bleiben Texte,
Syntaxfarben, Diffs und die dauerhaften Typausgaben lesbar; Copy wird erst mit
verfügbarer Clipboard-API eingeblendet.
