# Mermaid im Blog und die Serie "Astro für Entwicklerblogs"

Stand: 2026-10-05. Die Umsetzung dieses Plans ist abgeschlossen. `pnpm validate`
ist erfolgreich. Diagramme verwenden auf Wunsch des Nutzers JetBrains Mono und
dieselbe Schriftgröße wie Codeblöcke (14 Pixel).

## Ziel

Markdown-Fences mit der Sprache `mermaid` sollen im Blog als Diagramme erscheinen.
Ihre Gestaltung übernimmt die vorhandenen Schriften, Farben, Rahmen und Abstände
der Codeblöcke. Der Quelltext bleibt zugänglich und kopierbar.

Zwei deutschsprachige Beiträge bilden die Serie "Astro für Entwicklerblogs".
Teil 1 erklärt Codeblöcke mit Shiki und Twoslash. Teil 2 erklärt die tatsächliche
Mermaid-Integration und zeigt ausführbare Beispiele.

## Ausgangslage

- Beiträge liegen als `.md` in `src/content/blog` und werden über eine Content
  Collection geladen. Der Dateiname bestimmt bisher die Artikel-ID und URL.
- `astro.config.mjs` konfiguriert Shiki und Twoslash. Der eigene Transformer in
  `src/lib/shiki/code-block.ts` ergänzt Dateititel, Zeilennummern und Copy-Buttons.
- Shiki 4.4.3 unterstützt die Mermaid-Grammatik bereits. Ein lokaler Probeaufruf
  hat außerdem bestätigt, dass der Transformer die Sprache und den ursprünglichen
  Quelltext über `this.options.lang` und `this.source` erhält.
- `code-block-controls.astro` bedient bereits `[data-copy-code]` und meldet den
  Kopiererfolg in der Sprache der Oberfläche.
- Die Website verwendet IBM Plex Sans für Texte, JetBrains Mono für Code und
  Überschriften und eine helle, weitgehend monochrome Farbpalette.
- `/blog` und `/en/blog` zeigen dieselben Beiträge mit lokalisierter Oberfläche.
  Der vorhandene Artikel bleibt auch unter der englischen Oberfläche deutsch.

## Renderingweg

Empfohlen ist Mermaid im Browser mit einem dynamischen Import, sobald der Artikel
Mermaid-Blöcke enthält. Der Build erzeugt den Blockrahmen und den vollständigen,
von Shiki eingefärbten Quelltext. Mermaid ergänzt anschließend das SVG.

Das benötigt `mermaid` als einzige zusätzliche direkte Laufzeitabhängigkeit.
Die Browserausführung ist hier für die Diagrammberechnung erforderlich. Astro
bleibt für die Seiten und Markdown zuständig. Eine hydratisierte UI-Komponente
ist für diese Darstellung nicht erforderlich.

| Weg                                                 | Auswirkung                                                                                                                                                                                        | Entscheidung                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Browser, dynamischer Import                         | Mermaid wird auf Diagrammartikeln geladen. Die vorhandenen Schriften und CSS-Farben können direkt verwendet werden. Ohne JavaScript bleibt der Quelltext sichtbar.                                | Für diese Umsetzung verwenden.                                                              |
| SVG beim Build, beispielsweise mit `rehype-mermaid` | Diagramme wären auch ohne JavaScript sichtbar. Das Plugin benötigt außerhalb des Browsers Playwright und einen installierten Browser. Außerdem muss die Build-Umgebung dieselben Schriften laden. | Als spätere Alternative dokumentieren, falls Diagramme ohne JavaScript erforderlich werden. |

Der Browserweg bedeutet, dass das Diagramm erst nach dem Laden von Mermaid und den
Schriften erscheint. Dieser Aufwand soll im neuen Artikel offen beschrieben
werden. Die Integration lädt Mermaid lokal über Vite. Der dynamische Import
erfolgt erst nach der Suche nach Mermaid-Blöcken.

Die Rendering-API und die Initialisierung sind in der
[Mermaid-Dokumentation](https://mermaid.js.org/config/usage.html) beschrieben.
Die Build-Anforderungen der Alternative stehen im
[README von rehype-mermaid](https://github.com/remcohaszing/rehype-mermaid).

## 1. Die Serie benennen und verlinken

| Teil | Titel                                        | Neuer Slug                                     |
| ---- | -------------------------------------------- | ---------------------------------------------- |
| 1    | Astro für Entwicklerblogs: Shiki & Twoslash  | `astro-fuer-entwicklerblogs-shiki-twoslash`    |
| 2    | Astro für Entwicklerblogs: Mermaid-Diagramme | `astro-fuer-entwicklerblogs-mermaid-diagramme` |

"Teil 1" und "Teil 2" werden als separate Metadaten angezeigt. Die Titel behalten
den gemeinsamen Seriennamen. Die Reihenfolge gehört nicht in die URLs.

Das Collection-Schema erhält ein optionales `series`-Objekt mit `name` und `part`.
`part` ist eine positive Ganzzahl. Beide Beiträge verwenden denselben Seriennamen.
Beiträge ohne Serienangabe funktionieren weiterhin mit dem bisherigen Schema.

Die Blogübersicht bleibt nach Veröffentlichungsdatum sortiert. Im Artikellayout
kommt eine kleine Seriennavigation hinzu. Sie zeigt die veröffentlichten Teile
derselben Serie und Inhaltssprache aufsteigend nach `part`. Der aktuelle Teil
erhält `aria-current="page"`. Links verwenden weiterhin `postUrl()` und die
aktuelle Sprache der Oberfläche. In der Übersicht und im Artikelkopf erscheint
die Teilnummer bei den vorhandenen Metadaten. Doppelte Teilnummern innerhalb
derselben Serie und Inhaltssprache sollen bei der Verarbeitung auffallen.

Teil 1 wird umbenannt. Einleitung, Beschreibung, Frontmatter-Beispiele und der
Dateibaum im Text werden an den neuen Namen angepasst. Das ursprüngliche Datum
2026-10-02 bleibt erhalten. Teil 2 erhält beim Anlegen das tatsächliche Datum,
voraussichtlich 2026-10-05.

Die bisherige URL `/blog/astro-shiki-codebloecke` und ihre englische Variante
erhalten Weiterleitungen auf die entsprechenden neuen URLs. Bei statischem Astro
sind generierte Weiterleitungsseiten von HTTP-301-Regeln des Hostings zu
unterscheiden. Die Umsetzung folgt zunächst dem vorhandenen `redirects`-Muster.
Interne Links, Canonicals und Sitemap müssen anschließend die neuen Slugs nutzen.

## 2. Mermaid an die bestehende Codeverarbeitung anschließen

Installation während der Umsetzung:

```sh
pnpm add mermaid
```

Die installierte Version wird im Lockfile festgehalten und im Artikel korrekt
angegeben. Weitere Markdown- oder Diagramm-Plugins sind für diesen Weg nicht nötig.

Der vorhandene Shiki-Transformer erkennt `this.options.lang === "mermaid"` und
erzeugt einen Diagrammblock mit folgendem Aufbau:

```text
figure.mermaid-block
  Kopfzeile mit optionalem title und dem vorhandenen Copy-Button
  zunächst verborgener Bereich für das Diagramm
  details, im statischen HTML geöffnet
    summary "Quelltext anzeigen"
    vorhandener Shiki-Codeblock
```

Die Ergänzung bleibt im bestehenden Transformer, damit Kopfzeile, Metadaten und
Copy-Markup gemeinsam gepflegt werden. Normale Codeblöcke behalten ihre bisherige
Verarbeitung. Für Mermaid wird der ursprüngliche Quelltext verwendet, bevor
Diff-Notation, Zeilennummern oder andere Darstellungsschritte ihn beeinflussen.

`title="..."` und `showLineNumbers` funktionieren auch bei Mermaid. Der Renderer
und Copy erhalten dieselbe unveränderte Definition. Die Zeilennummern gehören
ausschließlich zur Quelltextdarstellung. Quelltext und Titel werden als Text
beziehungsweise über HAST-Attribute ausgegeben und vom Serializer escaped.

Eine neue Datei `src/components/blog/mermaid-diagrams.astro` enthält die
lokalisierten Bedien- und Fehlermeldungen sowie das kleine Rendering-Script. Das
Bloglayout bindet sie ein. Das Script sucht zuerst nach Diagrammblöcken und führt
nur dann `import("mermaid")` aus. Die vorhandene Kopierfunktion bedient die neuen
Buttons über dieselben Attribute und Statusmeldungen.

Das Script wartet auf `document.fonts.ready`, initialisiert Mermaid einmal und
rendert die Blöcke nacheinander über `mermaid.render()`. Jeder Block bekommt eine
eindeutige SVG-ID. Ein Fehler in einem Diagramm darf die weiteren Diagramme nicht
stoppen.

Nach erfolgreichem Rendern wird das Diagramm sichtbar und der Quelltext zunächst
eingeklappt. Bei Import- oder Syntaxfehlern bleibt der Quelltext geöffnet und eine
kurze lokalisierte Meldung erklärt den fehlenden Diagrammbereich. Ohne JavaScript
bleibt das statische HTML mit geöffnetem Quelltext lesbar. Der Quelltext-Schalter
verwendet natives `<details>` und benötigt kein eigenes Zustandsmodell.

Die Initialisierung verwendet `startOnLoad: false`, `securityLevel: "strict"`
und `suppressErrorRendering: true`. So steuert die Integration Rendering und
Fehlermeldungen selbst. Für die behandelten Diagrammtypen werden Theme und Look
explizit festgelegt, damit typabhängige Mermaid-Defaults die Gestaltung nicht
überschreiben.

## 3. Die Gestaltung aus der Website ableiten

| Token                        | Aktueller Wert | Verwendung                                            |
| ---------------------------- | -------------- | ----------------------------------------------------- |
| `--color-paper`              | `#fcfcfb`      | Hintergrund und helle Beschriftungsflächen            |
| `--color-ink`                | `#151513`      | Diagrammtext                                          |
| `--color-muted`              | `#62625d`      | Verbindungslinien und deutlich sichtbare Knotenränder |
| `--color-rule`               | `#d5d5d0`      | Blockrahmen und Trennlinien                           |
| Aus Ink und Paper abgeleitet | etwa `#f6f6f5` | Dezente Knotenfüllung                                 |
| Aus Ink und Paper abgeleitet | etwa `#efefed` | Gruppen und alternative Knotenflächen                 |

Der äußere Block übernimmt die aktuelle `.code-block`-Gestaltung mit einem Radius
von `1.125rem`, dem Hintergrund `--color-code` und `my-6`. Die Kopfzeile verwendet die
bestehende Höhe von mindestens 44 Pixeln, JetBrains Mono und dieselben
Innenabstände wie ein Codeblock. Die Diagrammfläche bekommt etwas mehr Abstand
zu den Rändern als der Quelltext.

Diagrammbeschriftungen verwenden JetBrains Mono mit derselben Schriftgröße wie
Codeblöcke. Der Renderer liest sie aus dem berechneten CSS des Quelltextblocks
(aktuell 14 Pixel). Gruppenüberschriften erhalten über `subGraphTitleMargin`
jeweils 12 Pixel Abstand oberhalb und unterhalb. Code und Dateititel verwenden ebenfalls
JetBrains Mono. Linien und Knoten bleiben monochrom und
verwenden die vorhandenen Grautöne. Richtungen, Pfeile und Beschriftungen tragen
die Bedeutung. Für Git- oder Statusbeispiele können später konkrete semantische
Farben begründet werden.

Mermaid erhält `theme: "base"` und `look: "classic"`. Die Themevariablen werden
aus den vorhandenen CSS-Tokens gelesen. Mermaid erwartet für Farben Hex-Werte;
abgeleitete Füllungen müssen entsprechend aufgelöst werden. SVG-spezifische
Styles werden unter `.mermaid-block` begrenzt. Diagrammtypen wie Sequenz und ER
benötigen zusätzlich passende Variablen für Akteure, Nachrichten und Tabellenzeilen.
Das Verhalten wird mit der tatsächlich installierten Mermaid-Version geprüft.
Siehe [Mermaid-Theming](https://mermaid.js.org/config/theming.html).

Die Regeln in `global.css` müssen außerdem verhindern, dass allgemeine
Markdown-Regeln für Tabellen, Absätze und Inline-Code in Mermaid-SVGs hineinwirken.
Gerade Beschriftungen mit HTML oder `foreignObject` brauchen eine visuelle Prüfung.

Diagramme behalten ihre natürliche SVG-Breite, damit die Schriftgröße bei 14
Pixeln bleibt. Kleine Diagramme werden zentriert; breite Diagramme scrollen
innerhalb des Blocks horizontal. Die
gesamte Seite darf dadurch nicht breiter werden. Der scrollbare Diagrammbereich
muss per Tastatur erreichbar sein. SVG-Proportionen bleiben durch `viewBox`
erhalten. Es gibt zunächst keine Zoom- oder Exportsteuerung.

## 4. Den zweiten Artikel als Anleitung und Beispielseite schreiben

Der Beitrag beginnt mit der Verbindung zu Teil 1 und erläutert, warum Diagramme
für Architektur und Abläufe im Entwicklerblog hilfreich sind. Danach folgt diese
Gliederung:

1. **Der Stack.** Astro und Content Collections, Markdown-Fences, Shiki für den
   Quelltext, Mermaid für SVGs, Tailwind und vorhandene CSS-Tokens für die Gestaltung.
2. **Was installieren.** Der echte pnpm-Befehl, die verwendete Mermaid-Version
   und der Unterschied zwischen Build-Verarbeitung und Browser-Rendering.
3. **Welche Dateien anpassen oder anlegen.** Transformer, Rendering-Komponente,
   Bloglayout, Styles und Übersetzungen. Die Ausschnitte entsprechen der fertigen
   Implementierung und reichen aus, um den Ansatz nachzubauen.
4. **Mermaid passend gestalten.** Theme und Look, Token-Zuordnung, Schriften,
   Warten auf die Fontdateien, typabhängige Variablen und mobile Darstellung.
5. **Diagramme ausprobieren.** Jeweils Definition, gerendertes Diagramm und eine
   Erklärung des dargestellten Vorgangs.
6. **Die Integration prüfen.** Copy, Quelltext-Schalter, mehrere Diagramme,
   Barrierefreiheit, breite Inhalte und Verhalten bei Fehlern oder ohne JavaScript.

Die Beispiele beziehen sich auf diesen Blog:

| Diagramm          | Inhalt                                                            | Damit prüfen wir                                          |
| ----------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| Flowchart         | Markdown, Content Collection, Shiki und Mermaid bis zur Blogseite | Knoten, Pfeile, Entscheidungen und Gruppen                |
| Sequenzdiagramm   | Build und anschließend Diagramm-Rendering im Browser              | Akteure, Nachrichten, Notizen und alternativer Fehlerpfad |
| Zustandsdiagramm  | Entwurf, Prüfung und Veröffentlichung eines Beitrags              | Zustände und beschriftete Übergänge                       |
| ER-Diagramm       | Beziehung zwischen Serie und Beiträgen                            | Tabellenartige Knoten, Attribute und Verbindungen         |
| Breites Flowchart | Ein längerer Veröffentlichungsablauf                              | Lange Labels, Umlaute und Scrollen auf schmalen Displays  |

Jedes Diagramm erhält `accTitle` und `accDescr`. Der umgebende Text erklärt den
Inhalt zusätzlich. Mermaid setzt daraus Titel, Beschreibung und ARIA-Verweise
im SVG, siehe [Mermaid-Barrierefreiheit](https://mermaid.js.org/config/accessibility.html).

Die Beispiele sollen Leser zum Aufklappen und Kopieren der Definition einladen.
Ein Syntaxfehler wird in der Anleitung als Quelltext gezeigt; der Fehlertest
verwendet eine separate temporäre Testdefinition. Der veröffentlichte Artikel
enthält funktionierende Diagramme.

## 5. Dateien und Prüfumfang

| Datei                                                              | Geplante Änderung                                                                       |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `package.json`, `pnpm-lock.yaml`                                   | Mermaid ergänzen und verwendete Version festhalten                                      |
| `src/lib/shiki/code-block.ts`                                      | Mermaid erkennen, Originaldefinition erhalten, Diagramm- und Quelltextbereiche erzeugen |
| `src/components/blog/mermaid-diagrams.astro`                       | Rendering, lokalisierte Meldungen und Fehlerbehandlung ergänzen                         |
| `src/styles/global.css`                                            | Block-, Diagramm-, Quelltext- und mobile Styles ergänzen                                |
| `src/content.config.ts`                                            | Optionale Serienangabe validieren                                                       |
| `src/lib/blog.ts`                                                  | Bei Bedarf die direkte Serienauswahl und Reihenfolge ergänzen                           |
| `src/layouts/blog-layout.astro`                                    | Rendering-Komponente, Teilnummer und Seriennavigation einbinden                         |
| `src/components/blog/blog-index.astro`                             | Teilnummer in den bestehenden Metadaten anzeigen                                        |
| `src/i18n/translations/de.ts`, `en.ts`                             | Neue UI-Texte für Mermaid und Serie ergänzen                                            |
| `src/content/blog/astro-fuer-entwicklerblogs-shiki-twoslash.md`    | Bestehenden Beitrag umbenennen und Serienbezug aktualisieren                            |
| `src/content/blog/astro-fuer-entwicklerblogs-mermaid-diagramme.md` | Anleitung und funktionierende Diagrammbeispiele anlegen                                 |
| `astro.config.mjs`                                                 | Alte Artikel-URLs weiterleiten                                                          |
| `tests/code-block.test.mjs`, gegebenenfalls weitere Blogtests      | Originaldefinition, Escaping, Metadaten und Serienreihenfolge prüfen                    |
| `tests/seo.spec.mjs`                                               | Neue URLs, Canonicals und Weiterleitungen bei Bedarf absichern                          |
| `docs/blog-open-ideas.md`                                          | Mermaid nach abgeschlossener Umsetzung als erledigt kennzeichnen                        |

Die bestehenden offenen Änderungen im Repository bleiben erhalten. Gerade
Übersetzungen und SEO-Dateien werden nur um die hier nötigen Änderungen ergänzt.

Die automatisierten Tests konzentrieren sich auf Verhalten, das bei einer
Regression tatsächlich kaputtgehen kann: unveränderter Kopiertext mit Leerzeilen
und Sonderzeichen, getrennte Behandlung gewöhnlicher Codeblöcke, gültige
Serienreihenfolge und korrekte Artikel-URLs.

Danach einmal `pnpm validate` ausführen. Die vorhandenen Shiki- und Twoslash-Tests
müssen weiterhin bestehen. Den Browserpfad anschließend im T3-Preview auf beiden
Sprachoberflächen prüfen, unter anderem bei 320, 390 und 1280 Pixeln Breite.
Geprüft werden alle Diagrammtypen, Titel und Beschreibungen im SVG, eindeutige
IDs, Tastaturbedienung, Copy und lokale Scrollbereiche. Ein absichtlich defektes
Diagramm darf die übrigen Diagramme nicht beeinträchtigen. Ein simulierter
Importfehler muss den Quelltext erhalten. Das gebaute HTML muss ihn auch ohne
Script-Ausführung anzeigen können. Auf Teil 1 und der Blogübersicht darf kein
Mermaid-Import ausgelöst werden.

Für Browserprüfungen den vorhandenen Hintergrundserver verwenden und vorab
prüfen, ob er den aktuellen Workspace-Stand zeigt. Bei der Untersuchung lieferte
der laufende Server einen älteren Artikeltext als die Datei auf der Festplatte.
Falls ein Neustart nötig ist, die Projektbefehle `astro dev stop` und
`astro dev --background` verwenden.

Abgeschlossen ist die Umsetzung, wenn beide Artikel unter den neuen URLs
erreichbar sind, die Serie von Teil 1 zu Teil 2 navigierbar ist, die alten Links
weiterführen und alle Diagramme mit der bestehenden Websitegestaltung lesbar
funktionieren.

## Ergebnis der Prüfung

- `pnpm validate` besteht mit 15 Codeblock- und 12 SEO-Tests, einschließlich
  Serienreihenfolge, Weiterleitungen und Ablehnung doppelter Teilnummern.
- Alle fünf Diagramme rendern. Die Browserprüfung bestätigt JetBrains Mono für
  sämtliche SVG-Text- und `tspan`-Elemente und eindeutige IDs.
- Die Darstellung ist bei 320, 390 und 1280 Pixeln geprüft. Breite Diagramme
  scrollen lokal, die Seite läuft nicht über die Fensterbreite hinaus.
- Copy meldet Erfolg, der Quelltext lässt sich auch per Enter öffnen.
- Ein Syntaxfehler stoppt das folgende gültige Diagramm nicht. Ein simulierter
  Importfehler und eine Darstellung ohne Scripts erhalten den geöffneten Quelltext.
- Beide Sprachoberflächen zeigen die passenden Bedien- und Fehlermeldungen.
  Teil 1 und die Blogübersicht lösen keinen Mermaid-Import aus.
