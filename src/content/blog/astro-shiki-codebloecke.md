---
title: "Codeblöcke mit Astro, Shiki und Twoslash"
description: "Von einfachem Markdown bis zu Typinformationen: So entstehen die Codeblöcke dieses Blogs, und so lassen sie sich ausprobieren."
pubDate: 2026-10-02
language: de
tags: "Astro, Markdown, Shiki, TypeScript"
draft: false
---

Dieser Beitrag zeigt die Funktionen, die hier tatsächlich eingebaut sind. Jeder
Codeblock lässt sich direkt prüfen: Markierung ansehen, Code kopieren und bei
Twoslash die Typinformationen öffnen. Die Beispiele bauen aufeinander auf.

## Ein Beitrag, zwei Oberflächen

Alle Beiträge liegen als `.md`-Dateien in einer gemeinsamen Astro-Collection unter
`src/content/blog`. Ein Beitrag hat eine eigene Inhaltssprache. Die Seiten
`/blog` und `/en/blog` zeigen dieselben Beiträge; Navigation, Datumsformat und
Bedienmeldungen folgen der Sprache der URL.

Auch dieser Artikel ist unter beiden Sprachpräfixen erreichbar. Beim Sprachwechsel
bleiben Text und Beispiele erhalten. Es gibt keine automatisch erzeugte Übersetzung.

Das Frontmatter dieses Beitrags sieht so aus:

```yaml title="src/content/blog/astro-shiki-codebloecke.md"
title: "Codeblöcke mit Astro, Shiki und Twoslash"
description: "Von einfachem Markdown bis zu Typinformationen."
pubDate: 2026-10-02
language: de
tags: "Astro, Markdown, Shiki, TypeScript"
draft: false
```

`tags` ist eine kommaseparierte Zeichenkette. Die Collection entfernt überflüssige
Leerzeichen, leere Einträge und doppelte Tags. Tags stehen bereits am Artikel und
in der Übersicht. Eine spätere Filterung kann darauf sowie auf Sprache und Datum
zugreifen. Eine Filteroberfläche gibt es zunächst noch nicht.

`draft: true` zeigt einen Entwurf während der lokalen Entwicklung, schließt ihn
aber vom Produktionsbuild aus. Der Dateipfad bestimmt den Slug; auch Unterordner
sind möglich.

## 1. Die Grundlage: Markdown

Für Überschriften, Absätze, Listen und Links reicht Markdown. Das Layout kümmert
sich um Abstände und Lesbarkeit. Die Regeln stehen mit Tailwinds `@apply` in
`global.css`, weil der Markdown-Prozessor das HTML erzeugt.

### Eine kleine Schreibprobe

**Fett**, _kursiv_ und `Inline-Code` helfen, einzelne Stellen zu betonen. Ein
[Link zur Astro-Dokumentation](https://docs.astro.build/en/guides/markdown-content/)
führt zur Beschreibung des Markdown-Verhaltens.

- Listen erhalten Abstand und sichtbare Aufzählungszeichen.
- Inline-Code verwendet dieselbe Monospace-Schrift wie die Codeblöcke.
- Überschriften erscheinen im Inhaltsverzeichnis dieses Artikels.

1. Markdown schreiben.
2. Lokal ansehen.
3. Den Produktionsbuild prüfen.

> Ein Zitatblock bleibt eine einfache Markdown-Struktur. Dafür ist keine
> hydratisierte Komponente nötig.

| Eingabe                  | Darstellung |
| ------------------------ | ----------- |
| `**fett**`               | **fett**    |
| `_kursiv_`               | _kursiv_    |
| Backticks um einen Namen | `name`      |

Ein Fence ohne Sprachangabe bleibt ein schlichter Textblock. Auch er bekommt Copy:

```
Ein Codeblock ohne Syntax-Highlighting.

Die Leerzeile gehört zum kopierten Inhalt.
```

## 2. Shiki: Syntax farbig darstellen

Eine Sprachangabe nach den drei Backticks aktiviert das passende Shiki-Highlighting.
Die Autorenfassung:

````md title="Markdown-Eingabe"
```ts
const greeting = "Hallo Blog"
console.log(greeting)
```
````

Das Ergebnis:

```ts
const greeting = "Hallo Blog"
console.log(greeting)
```

Astro rendert die Farben beim Build. Der Browser braucht dafür keine
Highlighting-Bibliothek. Als helles Theme wird `github-light` verwendet;
`github-dark` liefert schon zusätzliche Farbvariablen für einen späteren Dark Mode.
Die Seite bleibt auch bei dunkler Systemeinstellung hell.

## 3. Dateititel und Copy

Mit `title="..."` bekommt ein Fence eine Kopfzeile. Das funktioniert mit und ohne
Twoslash und benötigt keine MDX-Komponente:

````md title="Markdown-Eingabe"
```ts title="src/lib/greeting.ts"
export const greeting = "Hallo Blog"
```
````

```ts title="src/lib/greeting.ts"
export const greeting = "Hallo Blog"
```

Die Kopfzeile, Rahmen und dezenten Flächen orientieren sich an der
[shadcn-Dokumentation](https://ui.shadcn.com/docs/components/base/badge). Die
Schriften und Farben bleiben die dieser Website. Astro-Komponenten und die
erzeugten Bedienelemente verwenden direkt Tailwind-Utilities; Regeln für das
generierte Markdown und Shiki-HTML stehen gesammelt in `global.css`.

Der Copy-Button kopiert ausschließlich den sichtbaren Quellcode. Titel und
Typinformationen gehören nicht dazu. Ein Häkchen und eine für Screenreader
lesbare Statusmeldung bestätigen den Vorgang. Bei verweigertem Clipboard-Zugriff
erscheint eine Fehlermeldung; der Code lässt sich weiterhin manuell markieren.

### Sonderzeichen und Leerzeilen

Dieses Beispiel prüft Anführungszeichen, Backticks, HTML-Zeichen und Backslashes.
Copy muss denselben Text liefern, einschließlich der Leerzeile:

```ts title="copy-roundtrip.ts"
const html = '<span title="Hallo">A & B</span>'
const template = `Hallo ${html}`

const path = "C:\\Blog\\Beispiele"
console.log(template, path)
```

### Optionale Zeilennummern

Der Fence-Marker `showLineNumbers` ergänzt Zeilennummern. Er lässt sich mit
`title="..."`, Notationen und `twoslash` kombinieren. Nummeriert werden nur die
sichtbaren Quellcodezeilen, einschließlich Leerzeilen; Query- und Diagnoseausgaben
bekommen keine zusätzliche Nummer. Die Nummern gehören nicht zum kopierten Code.

````md title="Markdown-Eingabe"
```ts showLineNumbers
const values = [1, 2, 3]

console.log(values.length)
```
````

```ts showLineNumbers
const values = [1, 2, 3]

console.log(values.length)
```

Blöcke ohne Titel haben denselben Abstand oben, links und unten. Rechts bleibt
Platz für Copy. Ein Dateititel fügt darüber eine eigene, durch eine Linie getrennte
Kopfzeile hinzu.

## 4. Diff: den neuen Stand kopieren

`[!code --]` markiert eine entfernte Zeile, `[!code ++]` eine hinzugefügte. Im
Quelltext stehen diese Marker in Kommentaren. Im Eingabebeispiel werden sie mit
`[\!code ...]` maskiert, damit die Dokumentation die Syntax wörtlich zeigt:

````md title="Markdown-Eingabe"
```ts title="greeting.ts" showLineNumbers
const greeting = "Hallo" // [\!code --]
const greeting = "Hallo Blog" // [\!code ++]

console.log(greeting)
```
````

Das aktive Beispiel:

```ts title="greeting.ts" showLineNumbers
const greeting = "Hallo" // [!code --]
const greeting = "Hallo Blog" // [!code ++]

console.log(greeting)
```

Copy übernimmt hier den **neuen Stand**: die hinzugefügte Deklaration, die
Leerzeile und `console.log(greeting)`. Die entfernte Deklaration sowie die aktiven
Notationskommentare fehlen. Die Plus- und Minuszeichen ergänzen die farbliche
Kennzeichnung.

## 5. Zeilen hervorheben

### Einzelne Zeilen hervorheben

`// [!code highlight]` legt eine Hintergrundfläche hinter die betreffende Zeile:

```ts title="highlight.ts"
const price = 24
const quantity = 3
const total = price * quantity // [!code highlight]
console.log(total)
```

Copy enthält alle vier Codezeilen und lässt den aktiven Marker weg.

### Notation wörtlich zeigen

Shiki erkennt seine Notation auch in Beispielen über die Notation selbst.
Mit einem Backslash nach der öffnenden Klammer wird der Marker maskiert. Die
Ausgabe und Copy enthalten dann den wörtlichen Marker:

```ts title="literal-notation.ts"
const literal = "[\!code ++]"
```

Der kopierte Wert ist `const literal = "[!code ++]"`. Diese Zeile ist keine
Diff-Zeile.

## 6. Twoslash: TypeScript im Beitrag prüfen

Erst der zusätzliche Fence-Marker `twoslash` aktiviert die TypeScript-Auswertung.
Normale `ts`-Fences werden nur hervorgehoben. Dadurch kann ein Beitrag auch
unvollständige Codeausschnitte zeigen, ohne dass sie typgeprüft werden.

Twoslash läuft beim Build. Unerwartete TypeScript-Fehler stoppen den Build. Für
bewusst gezeigte Fehler wird die erwartete Fehlernummer ausdrücklich angegeben.
Der Artikelrenderer prüft zusätzlich, ob Astro den Markdown-Inhalt erfolgreich
erzeugt hat, damit kein leerer Artikel veröffentlicht wird.

### Typinferenz und eine dauerhafte Query

`// ^?` fragt nach dem Typ an der Position direkt darüber. Die Typausgabe bleibt
auch ohne JavaScript sichtbar. Unterstrichene Bezeichner lassen sich per Hover,
Tastaturfokus oder Antippen öffnen; Escape schließt das Popup.

Popup, Pfeil und mehrzeilige Typinformationen verwenden dieselbe graue Fläche.
Die Popup-Inhalte bekommen keinen zusätzlichen weißen Codehintergrund.

````md title="Markdown-Eingabe"
```ts twoslash title="inference.ts"
const message = "Hallo Twoslash"
//    ^?
const length = message.length
//    ^?
```
````

```ts twoslash title="inference.ts"
const message = "Hallo Twoslash"
//    ^?
const length = message.length
//    ^?
```

Copy liefert nur die beiden Deklarationen. Die Query-Kommentare und die
zusätzlichen Typausgaben werden nicht kopiert. TypeScript-Typen und Diagnosen
bleiben in ihrer ursprünglichen englischen Sprache; die Blog-Oberfläche wird
dadurch nicht übersetzt.

### JSDoc als Typinformation

Öffne die Typinformation von `greet`, um neben der Signatur die Beschreibung aus
dem JSDoc-Kommentar zu sehen. JSDoc wird als Text ausgegeben, ohne zusätzlichen
Markdown-Renderer:

```ts twoslash title="jsdoc.ts"
/** Returns a greeting for the given name. */
function greet(name: string): string {
  return `Hello, ${name}`
}

const greeting = greet("Astro")
//    ^?
```

### Setup ausblenden

`// ---cut---` versteckt den vorherigen Teil des Beispiels. TypeScript verwendet
das Setup trotzdem für die Typprüfung. Die Eingabe enthält die Typdefinition:

````md title="Markdown-Eingabe"
```ts twoslash title="hidden-setup.ts" showLineNumbers
type User = { name: string; active: boolean }
// ---cut---
const user: User = { name: "Ada", active: true }
//    ^?
console.log(user.name)
```
````

Im gerenderten Block und in Copy fehlt das Setup:

```ts twoslash title="hidden-setup.ts" showLineNumbers
type User = { name: string; active: boolean }
// ---cut---
const user: User = { name: "Ada", active: true }
//    ^?
console.log(user.name)
```

### Einen erwarteten Fehler erklären

Die Fehlernummer `2322` steht für einen nicht zuweisbaren Typ. Dieses Beispiel
deklariert genau diesen Fehler als erwartet. Der Build darf ihn deshalb anzeigen:

```ts twoslash title="expected-error.ts"
// @errors: 2322
const count: number = "drei"
```

Copy übernimmt die fehlerhafte Deklaration als Lehrbeispiel, ohne
`@errors`-Kommentar und ohne Diagnose. Die sichtbare Fehlermeldung erklärt, was
TypeScript an der Zuweisung beanstandet.

## 7. Die Umsetzung ausprobieren

Die folgenden Prüfungen lassen sich direkt auf dieser Seite durchführen:

- **Copy:** Vergleiche den kopierten Text mit dem jeweiligen Beispiel. Beim Diff
  darf die alte Deklaration fehlen; Leerzeilen und Sonderzeichen bleiben erhalten.
- **Tastatur:** Erreiche Copy und Typinformationen mit Tab, öffne sie mit Enter
  und schließe ein Typ-Popup mit Escape. Codeblöcke sind für horizontales Scrollen
  fokussierbar.
- **Schmales Display:** Lange Codezeilen scrollen innerhalb ihres Blocks. Die
  Seite selbst soll horizontal nicht überlaufen. Typ-Popups dürfen nicht am
  Rand des Codeblocks abgeschnitten werden.
- **Sprachwechsel:** Wechsle oben zu Englisch. Text, Slug und Beispiele bleiben
  gleich; Navigation, Datum und Copy-Meldungen wechseln die Sprache.
- **Ohne JavaScript:** Markdown, Syntaxfarben, Titel, Diff und Query-Ausgaben
  bleiben sichtbar. Copy wird erst mit verfügbarer Clipboard-API eingeblendet.
  Native Typ-Popups lassen sich in unterstützten Browsern weiterhin anklicken.
- **Helles Theme:** Auch bei dunkler Systemeinstellung bleiben Seite und
  Codeblöcke zunächst hell.

Die Regressionstests unter `tests/code-block.test.mjs` prüfen den Kopiertext, die
Transformer-Reihenfolge, maskierte Notation und die Twoslash-Verarbeitung. Sie
verwenden dieselbe Shiki-Konfiguration wie die Website.

## Spätere Erweiterungen

**MDX** kommt erst hinzu, wenn ein Beitrag tatsächlich Astro-Komponenten im Text
braucht. Für alle hier gezeigten Codeblöcke genügt Markdown.

**Mermaid** ist für spätere Diagramme vorgesehen und wird derzeit nicht gerendert.
Ein Mermaid-Fence allein aktiviert hier noch keine Diagrammkomponente.

**Dark Mode** benötigt eine bewusste Umschaltung der gesamten Website und passende
Flächen, Rahmen und Popup-Farben. Die Shiki-Farbvariablen sind dafür bereits
vorbereitet.
