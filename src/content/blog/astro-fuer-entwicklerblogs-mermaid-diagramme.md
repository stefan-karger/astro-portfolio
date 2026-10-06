---
title: "Astro für Entwicklerblogs: Mermaid-Diagramme"
description: "Teil 2 der Serie: Mermaid in Astro-Markdown integrieren, Diagramme mit den vorhandenen Schriften und Farben gestalten und die Funktionen direkt ausprobieren."
pubDate: "2026-10-05"
updatedDate: "2026-10-06"
language: de
tags: "Astro, Markdown, Mermaid, CSS"
draft: false
series:
  name: "Astro für Entwicklerblogs"
  part: 2
---

Codebeispiele zeigen einzelne Funktionen. Für die Beziehungen zwischen Komponenten
oder einen Ablauf hilft oft ein Diagramm. Mermaid erzeugt solche Diagramme aus
Text, der zusammen mit dem Artikel in Git liegt.

In [Teil 1 über Shiki und Twoslash](/blog/astro-fuer-entwicklerblogs-shiki-twoslash/)
entstanden die Codeblöcke dieses Blogs. Hier ergänze ich sie um Mermaid. Der
Quelltext bekommt dieselben Syntaxfarben, Dateititel und Copy-Buttons. Das Diagramm
übernimmt die Schriften und Farben der Website.

Die Beispiele weiter unten sind direkt gerendert. Unter jedem Diagramm lässt sich
der Quelltext aufklappen und über den Button in der Kopfzeile kopieren.

## Der Stack

| Baustein                                                                                 | Aufgabe                                                               |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [Astro und Content Collections](https://docs.astro.build/en/guides/content-collections/) | Laden die Markdown-Beiträge und erzeugen beim Build statische Seiten. |
| Markdown                                                                                 | Enthält die Diagrammdefinition in einem `mermaid`-Fence.              |
| [Shiki](https://shiki.style/)                                                            | Färbt den Mermaid-Quelltext bereits beim Build ein.                   |
| [Mermaid 12.1.0](https://mermaid.js.org/config/usage.html)                               | Berechnet im Browser das Diagramm und erzeugt ein SVG.                |
| Tailwind CSS und CSS-Tokens                                                              | Gestalten Blockrahmen, Diagramm und Quelltext passend zur Website.    |
| Eine Astro-Komponente mit Script                                                         | Lädt Mermaid bei Bedarf und behandelt Renderingfehler.                |

Der Browserweg ist eine bewusste Entscheidung. Mermaid wird erst auf Artikeln mit
Diagrammen importiert. Beim Öffnen des Artikels müssen die Bibliothek und die
Schriften geladen sein, bevor die Diagramme erscheinen. Ohne JavaScript zeigt die
Seite den vollständigen Quelltext.

SVGs schon beim Build zu erzeugen wäre eine Alternative. Beispielsweise benötigt
[rehype-mermaid](https://github.com/remcohaszing/rehype-mermaid) dafür Playwright
und einen installierten Browser. Hier bleibt der Build bei der bestehenden
Markdown- und Shiki-Verarbeitung.

## Mermaid installieren und Dateien ergänzen

Die zusätzliche direkte Abhängigkeit wird mit pnpm installiert:

```sh title="Mermaid installieren"
pnpm add mermaid
```

Dieser Beitrag verwendet Mermaid 12.1.0. Das Lockfile hält die tatsächlich
installierte Version fest. In diesem Projekt sind weder ein zusätzliches
Markdown-Plugin noch MDX oder eine hydratisierte UI-Komponente nötig.

Die Diagrammverarbeitung liegt bei den bestehenden Blogdateien:

```text title="Dateien für die Mermaid-Integration"
src/
  lib/shiki/code-block.ts
  components/blog/
    code-block-controls.astro
    mermaid-diagrams.astro
  layouts/blog-layout.astro
  styles/
    global.css
    blog.css
  i18n/translations/
    de.ts
    en.ts
```

Der Transformer erzeugt das HTML. `mermaid-diagrams.astro` ergänzt die SVGs und
liest lokalisierte Fehlermeldungen aus den Übersetzungen. `global.css` enthält
die gemeinsamen CSS-Tokens. `blog.css` gestaltet die erzeugten Elemente und wird
nur im Bloglayout importiert. Die Kopierfunktion bleibt in `code-block-controls.astro`.

## Mermaid im vorhandenen Transformer erkennen

Ein Mermaid-Block verwendet dieselben Fence-Zusätze wie ein gewöhnlicher Codeblock:

````md title="Ein Diagramm im Markdown-Beitrag"
```mermaid title="Veröffentlichung" showLineNumbers
flowchart LR
  accTitle: Einen Beitrag veröffentlichen
  accDescr: Ein Markdown-Beitrag wird geprüft und anschließend als Blogseite veröffentlicht.
  Beitrag --> Prüfung --> Veröffentlichung
```
````

Im `root`-Hook des Shiki-Transformers steht die Sprache über `this.options.lang`
zur Verfügung. Für Mermaid verwende ich den ursprünglichen Quelltext aus
`this.source`. Zeilennummern und die erzeugten HTML-Elemente gehören nicht zur
Diagrammdefinition.

```ts title="src/lib/shiki/code-block.ts · Erkennung"
const mermaid = this.options.lang === "mermaid"
```

Der bestehende Transformer legt die Kopfzeile und den Copy-Button an. Für Mermaid
setzt er darunter einen zunächst verborgenen Diagrammbereich und ein geöffnetes
`details`-Element mit dem eingefärbten Quelltext. Als Kopiertext erhält der Button
`this.source`. Ohne Dateititel heißt die Kopfzeile "Mermaid":

```html title="Aufbau des erzeugten Diagrammblocks"
<figure class="code-block mermaid-block" data-mermaid>
  <div class="code-block-header">
    <!-- Titel und vorhandener Copy-Button mit data-copy-code -->
  </div>
  <div class="mermaid-diagram" hidden role="region" tabindex="0"></div>
  <p class="mermaid-error" hidden role="status"></p>
  <details class="mermaid-source" open>
    <summary>Quelltext anzeigen</summary>
    <pre class="astro-code"><code><!-- Shiki-Quelltext --></code></pre>
  </details>
</figure>
```

Im tatsächlichen Markup stehen deutsche und englische Summary-Texte. CSS wählt sie
anhand von `html[lang]` aus. Damit passt die Bedienoberfläche auch ohne JavaScript
zur URL-Sprache. Die Diagrammbeschriftungen bleiben in der Sprache des Beitrags.

## Das Diagramm im Browser rendern

Das Bloglayout bindet die Rendering-Komponente neben den vorhandenen Codeblock-
Controls ein:

```astro title="src/layouts/blog-layout.astro · Einbindung"
---
import CodeBlockControls from "@/components/blog/code-block-controls.astro"
import MermaidDiagrams from "@/components/blog/mermaid-diagrams.astro"
import "@/styles/blog.css"

const locale = Astro.currentLocale === "en" ? "en" : "de"
---

<CodeBlockControls locale={locale} />
<MermaidDiagrams locale={locale} />
```

Das Script sucht zunächst nach `[data-mermaid]`. Erst wenn Blöcke vorhanden sind,
importiert es Mermaid. Parallel wartet es auf `document.fonts.ready`. Andernfalls
könnte Mermaid die Beschriftungen mit einer Ersatzschrift ausmessen, und nach dem
Schriftwechsel wären Abstände oder Knotenbreiten falsch.

```ts title="mermaid-diagrams.astro · Laden"
const blocks = document.querySelectorAll<HTMLElement>("[data-mermaid]")

if (blocks.length) {
  const [{ default: mermaid }] = await Promise.all([import("mermaid"), document.fonts.ready])

  // Hier folgen die gemeinsame Konfiguration und das Rendering der Blöcke.
}
```

Jeder Block erhält eine eindeutige SVG-ID. Die Fehlerbehandlung liegt innerhalb
der Schleife, damit eine defekte Definition die folgenden Diagramme nicht stoppt.
Der folgende Ausschnitt zeigt den Kern. Die Komponente ergänzt außerdem die
Beschriftung des scrollbaren Bereichs aus dem SVG-Titel:

```ts title="mermaid-diagrams.astro · Rendering"
for (const [index, block] of blocks.entries()) {
  const target = block.querySelector<HTMLElement>(".mermaid-diagram")
  const source = block.querySelector<HTMLButtonElement>("[data-copy-code]")?.dataset.copyCode
  if (!target || source === undefined) continue

  try {
    const { svg } = await mermaid.render(`mermaid-${index + 1}`, source)
    target.innerHTML = svg
    target.hidden = false
    const details = block.querySelector("details")
    if (details && !details.contains(document.activeElement)) details.open = false
  } catch {
    // Lokalisierte Fehlermeldung anzeigen und den Quelltext geöffnet lassen.
  }
}
```

Die Definition bleibt am Copy-Button erhalten. Das SVG ersetzt den Quelltext nicht.
Auch nach dem Rendern lässt sich die Definition mit dem nativen `details`-Element
öffnen, lesen und kopieren.

## Mermaid wie die Website gestalten

### Farben und Schriften übernehmen

Mermaids Standardfarben passen nicht zur monochromen Gestaltung dieses Blogs.
Die Integration verwendet das anpassbare `base`-Theme und den `classic`-Look.
Diagrammtypen mit eigenen Defaults erhalten diese Angaben ebenfalls ausdrücklich.
Die Details beschreibt die [Mermaid-Dokumentation zum Theming](https://mermaid.js.org/config/theming.html).

Die Farbzuordnung folgt den bestehenden CSS-Tokens:

| CSS-Token       | Aufgabe im Diagramm                                        |
| --------------- | ---------------------------------------------------------- |
| `--color-paper` | Helle Knoten und Akteure                                   |
| `--color-ink`   | Beschriftungen                                             |
| `--color-muted` | Pfeile, Linien und Knotenränder                            |
| `--color-rule`  | Dezente Gruppenränder                                      |
| `--color-code`  | Hintergrundflächen, Notizen und alternative Tabellenzeilen |
| `--font-mono`   | JetBrains Mono für Diagrammbeschriftungen                  |

Mermaids Farbberechnung erwartet Hex-Werte. Die Farb-Tokens der Website verwenden
deshalb dieses Format. Auch der Codeblock-Hintergrund steht als Hexwert im CSS:

```css title="src/styles/global.css · Codeblock-Hintergrund"
@theme static {
  --color-code: #f8f8f8;
}
```

`@theme static` erhält den Token auch dann im erzeugten CSS, wenn Tailwind ihn
nicht in einer Utility-Klasse findet. Mermaid liest ihn zur Laufzeit, und
`blog.css` verwendet ihn über eine `@reference` auf `global.css`.

Der Renderer liest diese Werte direkt aus den CSS-Tokens:

```ts title="mermaid-diagrams.astro · CSS-Farben lesen"
const style = getComputedStyle(document.documentElement)

function color(name: string) {
  return style.getPropertyValue(name).trim()
}
```

So bleibt die Website die Quelle der Farben. Eine Änderung an den Tokens kommt
auch bei Mermaid an. Die Konfiguration ergänzt die Grundfarben und die Stellen,
an denen Mermaids abgeleitete Farben von der Websitegestaltung abweichen:

```ts title="mermaid-diagrams.astro · Theme"
const paper = color("--color-paper")
const ink = color("--color-ink")
const muted = color("--color-muted")
const rule = color("--color-rule")
const surface = color("--color-code")
const appearance = { theme: "base", look: "classic", useMaxWidth: false } as const
const code = blocks[0].querySelector<HTMLElement>(".astro-code")!
const fontSize = getComputedStyle(code).fontSize

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  suppressErrorRendering: true,
  htmlLabels: false,
  theme: "base",
  look: "classic",
  fontFamily: "var(--font-mono)",
  fontSize: parseFloat(fontSize),
  themeVariables: {
    fontFamily: "var(--font-mono)",
    fontSize,
    background: surface,
    primaryColor: paper,
    primaryTextColor: ink,
    primaryBorderColor: muted,
    secondaryColor: surface,
    secondaryTextColor: ink,
    secondaryBorderColor: muted,
    tertiaryColor: paper,
    tertiaryTextColor: ink,
    tertiaryBorderColor: muted,
    lineColor: muted,
    clusterBkg: surface,
    clusterBorder: rule,
    signalColor: muted,
    noteBkgColor: surface,
    noteBorderColor: muted,
    noteTextColor: ink,
    activationBorderColor: muted,
    sequenceNumberColor: paper,
    attributeBackgroundColorOdd: paper,
    attributeBackgroundColorEven: surface
  },
  flowchart: {
    ...appearance,
    curve: "linear",
    subGraphTitleMargin: { top: 12, bottom: 12 }
  },
  sequence: appearance,
  state: appearance,
  er: appearance
})
```

Das `base`-Theme übernimmt viele Werte bereits aus den Grundfarben. Zum Beispiel
folgen Akteure der primären Knotenfarbe, ihr Text `primaryTextColor` und ihre
Ränder `primaryBorderColor`. Diese Zuordnungen müssen nicht einzeln wiederholt
werden. Gruppenränder, Notizen und Tabellenzeilen bekommen die passenden Tokens
ausdrücklich zugewiesen.

Die Schriftfamilie lässt sich direkt als `var(--font-mono)` übergeben. Mermaid
setzt sie in SVG-Styles ein, die der Browser auch beim Ausmessen der Texte
auflöst. Der Tokenname `--font-mono` allein wäre dagegen ein Schriftname.

Die Schriftgröße stammt aus dem berechneten CSS des Quelltextblocks: hier 14
Pixel. Mermaid verwendet sie bereits beim Ausmessen der Beschriftungen.
Sequenzdiagramme benötigen zusätzlich die numerische `fontSize` auf der obersten
Konfigurationsebene. Die Themevariable allein ändert ihre Inline-Schriftgrößen
nicht.

Eine nachträgliche Änderung im SVG könnte die Texte verkleinern, ohne Knoten und
Abstände neu zu berechnen. `subGraphTitleMargin` reserviert bei Gruppen jeweils
12 Pixel oberhalb und unterhalb der Überschrift. So sitzt sie nicht direkt auf
dem Rahmen. Die Option ist in der
[Flowchart-Konfiguration](https://mermaid.js.org/config/schema-docs/config-defs-flowchart-diagram-config.html#subgraphtitlemargin)
beschrieben.

`htmlLabels: false` hält die Beschriftungen in SVG-Elementen. Damit wirken die
allgemeinen Markdown-Styles für Absätze, Tabellen und Inline-Code nicht auf
HTML innerhalb eines Diagramms. `securityLevel: "strict"` deaktiviert unter
anderem Mermaid-Klickaktionen. `suppressErrorRendering: true` überlässt die
Fehleranzeige der eigenen Komponente.

### Den Block und die mobile Darstellung abstimmen

Der äußere Rahmen verwendet `.code-block`, die neue Diagrammfläche ergänzt nur
Innenabstand und einen lokalen Scrollbereich:

```css title="src/styles/blog.css · Diagrammfläche"
.mermaid-diagram {
  overflow-x: auto;
  padding: 1rem;
}

.mermaid-diagram > svg {
  display: block;
  height: auto;
  margin-inline: auto;
}
```

Mit `useMaxWidth: false` setzt Mermaid selbst die natürliche Breite und Höhe am
SVG. CSS übernimmt diese Größe und zentriert das Diagramm. Dadurch bleibt auch
die 14 Pixel große Schrift erhalten. Breitere Diagramme scrollen innerhalb des
Blocks.

Der Scrollbereich ist per Tab erreichbar und über den zugänglichen Diagrammtitel
benannt. Der Quelltext-Schalter verwendet dieselben Abstände und Farben wie die
Codeblock-Kopfzeile. Diagrammbeschriftungen, Code und Titel verwenden JetBrains Mono.

## Diagramme ausprobieren

Alle folgenden Definitionen enthalten `accTitle` und `accDescr`. Mermaid erzeugt
daraus Titel, Beschreibung und ARIA-Verweise im SVG. Der Fließtext erklärt den
Inhalt zusätzlich. Siehe [Mermaids Barrierefreiheitsoptionen](https://mermaid.js.org/config/accessibility.html).

### Flowchart für den Blog-Stack

Astro verarbeitet den Beitrag beim Build. Shiki erzeugt den Quelltextblock.
Erst im Browser ergänzt Mermaid das Diagramm:

```mermaid title="Der Weg vom Markdown zum Diagramm" showLineNumbers
flowchart LR
  accTitle: Markdown und Mermaid im Astro-Blog
  accDescr: Astro lädt einen Markdown-Beitrag aus der Content Collection. Shiki färbt die Definition ein. Die statische Seite lädt Mermaid im Browser und zeigt das SVG zusammen mit dem aufklappbaren Quelltext.
  Markdown[Markdown] --> Build
  subgraph Build[Beim Build]
    direction TB
    Collection[Content Collection]
    Collection --> Shiki[Shiki und Codeblock]
    Shiki --> HTML[Blogseite mit Quelltext]
  end
  Build --> Browser
  subgraph Browser[Im Browser]
    direction TB
    Mermaid[Mermaid und geladene Schriften]
    Mermaid --> SVG[SVG-Diagramm]
  end
```

Dieser Block prüft Gruppen, Pfeile und mehrzeilige Abläufe. Beim Kopieren dürfen
die eingeblendeten Zeilennummern nicht in der Definition stehen.

### Sequenzdiagramm für das Laden

Das Script importiert die Bibliothek nur bei vorhandenen Diagrammblöcken. Ein
fehlgeschlagenes Rendering lässt die Definition auf der Seite:

```mermaid title="Diagramme beim Öffnen des Artikels laden"
sequenceDiagram
  accTitle: Ein Mermaid-Diagramm laden
  accDescr: Der Browser empfängt die statische Blogseite. Das Script wartet auf Mermaid und die lokalen Schriften. Mermaid liefert bei Erfolg ein SVG. Bei einem Fehler bleibt der Quelltext geöffnet.
  participant B as Browser
  participant S as Blog-Script
  participant M as Mermaid
  B->>S: Artikel mit Diagrammblöcken öffnen
  Note over S: Auf Bibliothek und Schriften warten
  S->>M: Definition rendern
  alt Definition ist gültig
    M-->>S: SVG
    S-->>B: Diagramm anzeigen, Quelltext einklappen
  else Definition ist fehlerhaft
    S-->>B: Meldung anzeigen, Quelltext geöffnet lassen
  end
```

Hier lassen sich die Farben von Akteuren, Nachrichten, Notizen und alternativen
Abläufen vergleichen. Auch diese Flächen sollen zur Website passen.

### Zustandsdiagramm für die Veröffentlichung

Ein Beitrag kann zwischen Entwurf und Prüfung wechseln, bevor er veröffentlicht
wird. Das Diagramm beschreibt den redaktionellen Ablauf, nicht zusätzliche
Funktionen der Content Collection:

```mermaid title="Vom Entwurf zur Veröffentlichung"
stateDiagram-v2
  accTitle: Zustände eines Blogbeitrags
  accDescr: Ein neuer Beitrag beginnt als Entwurf. Nach einer Prüfung kann er veröffentlicht werden. Nötige Korrekturen führen zurück zum Entwurf.
  [*] --> Entwurf
  Entwurf --> Prüfung: Text und Beispiele fertig
  Prüfung --> Entwurf: Korrekturen nötig
  Prüfung --> Veröffentlicht: Freigabe
  Veröffentlicht --> [*]
```

Dieser Block prüft Zustandsknoten, Start- und Endmarkierungen sowie Umlaute in
Beschriftungen.

### ER-Diagramm für Serie und Beiträge

Das Collection-Schema enthält ein optionales Serienobjekt mit Name und Teilnummer.
Das folgende Modell zeigt diese Beziehung. Es beschreibt keine zusätzliche
Datenbank im Blog:

```mermaid title="Beiträge innerhalb einer Serie"
erDiagram
  accTitle: Beziehung zwischen Artikelserie und Beiträgen
  accDescr: Eine Serie umfasst mehrere Beiträge. Ein Beitrag kann einer Serie zugeordnet sein und besitzt dort eine Teilnummer.
  SERIE o|--|{ BEITRAG : umfasst
  SERIE {
    string name
  }
  BEITRAG {
    string title
    date pubDate
    string language
    int part
  }
```

Die abwechselnden Zeilenflächen des ER-Diagramms müssen ebenfalls die hellen
Grautöne verwenden. Die Beziehungslinien bleiben deutlich sichtbar.

### Ein breites Diagramm auf dem Smartphone

Dieser längere Ablauf ist absichtlich horizontal angeordnet. Auf einem schmalen
Display sollte nur die Diagrammfläche seitlich scrollen:

```mermaid title="Ein längerer Veröffentlichungsablauf"
flowchart LR
  accTitle: Ein breiter Veröffentlichungsablauf
  accDescr: Der Ablauf führt vom Schreiben über die Prüfung und den Build bis zur Veröffentlichung. Auf schmalen Displays lässt er sich innerhalb der Diagrammfläche horizontal lesen.
  A[Beitrag in Markdown schreiben] --> B[Code und Diagramme prüfen]
  B --> C[Schriften und Abstände vergleichen]
  C --> D[Astro-Build erzeugen]
  D --> E[Statische Seiten veröffentlichen]
```

## Die Funktionen prüfen

- **Quelltext öffnen und kopieren.** Die Definition muss vollständig bleiben,
  einschließlich Leerzeilen und `accDescr`. Dateititel und Zeilennummern gehören
  nicht zum kopierten Text.
- **Mehrere Diagramme ansehen.** Jedes SVG braucht eigene IDs. Pfeile und
  Beschriftungen dürfen sich nicht auf ein anderes Diagramm beziehen.
- **Mit der Tastatur bedienen.** Tab erreicht den Copy-Button, den Scrollbereich
  und den Quelltext-Schalter. Enter öffnet den Quelltext.
- **Auf schmalen Displays lesen.** Die Seite bleibt innerhalb der Fensterbreite.
  Breite Diagramme haben einen eigenen Scrollbereich.
- **Ohne JavaScript lesen.** Die Mermaid-Definition bleibt geöffnet sichtbar.
  Ein SVG entsteht bei diesem Renderingweg erst im Browser.
- **Fehler behandeln.** Eine ungültige Definition muss ihren Quelltext behalten.
  Ein späteres gültiges Diagramm muss weiterhin gerendert werden.

Für den letzten Fall eignet sich eine temporäre Testdefinition:

````md title="Fehlerfall für einen lokalen Testartikel"
```mermaid title="Absichtlich ungültig"
flowchart TD
  A -->
```
````

Die ungültige Definition oben wird hier als Markdown-Beispiel gezeigt. Die fünf
Diagramme dieses Artikels sind gültige Beispiele. Die Integration wird zusätzlich
mit den vorhandenen Projektprüfungen verifiziert:

```sh title="Projekt prüfen"
pnpm validate
```
