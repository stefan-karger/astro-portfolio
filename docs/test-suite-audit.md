# Audit der Testsuite

Stand: 10. November 2026, Ausgangspunkt: `0759e13`.

Die kleine statische Website braucht keine zehnminütige Testsuite. Die bestehende
Validierung dauert lokal bereits unter einer Minute. Die Bereinigung entfernt
doppelte Browserreisen und einen zusätzlichen Mermaid-Erfolgslauf; fachliche
Regressionen bleiben erhalten. Normale Validierung: **57 → 53 Tests**, mit der
separaten Inhaltssuite: **64 → 60 Tests**.

## Messung

Windows, Node.js 24.13.0, pnpm 12.10.0, installiertes Chromium. Gemessen wird
Wall-Clock inklusive Prozessstart, Imports und Hooks. Vorher: ein vollständiges
`pnpm validate` und zwei Durchläufe seiner acht Befehle in identischer Reihenfolge.
Nachher: drei sequenzielle Durchläufe derselben acht Befehle. Alle sind grün.
Projekt-, Bild- und Toolcaches waren warm; dies ist keine Messung einer frischen
CI-Installation. Downloads und Dependency-Installation sind nicht enthalten.
Zwei zusätzliche Nachher-Runden mit zeitweise parallelem Fixture-Build werden
wegen CPU-Konkurrenz aus dem Laufzeitvergleich ausgeschlossen.

| Umfang               | Vorher Median (Spanne), s | Nachher Median (Spanne), s |
| -------------------- | ------------------------: | -------------------------: |
| Gesamte Validierung  |       49.18 (48.42–50.02) |        45.05 (44.62–45.09) |
| `pnpm format:check`  |          3.29 (3.15–3.43) |           3.11 (3.07–3.15) |
| `pnpm lint`          |          3.39 (3.30–3.47) |           3.26 (3.25–3.27) |
| `pnpm test:unit`     |          0.48 (0.47–0.50) |           0.46 (0.46–0.47) |
| `pnpm check`         |       11.86 (11.86–11.87) |        11.58 (11.53–11.67) |
| `pnpm test:markdown` |          6.71 (6.67–6.81) |           5.35 (5.32–5.37) |
| `pnpm build`         |         9.89 (9.65–10.14) |           9.46 (9.43–9.63) |
| `pnpm test:output`   |          2.74 (2.69–2.74) |           2.65 (2.57–2.79) |
| `pnpm test:browser`  |       10.42 (10.27–10.44) |           8.95 (8.93–9.00) |

Der Median der Gesamtzeit sinkt um **4.13 s
(8.40 %)**. Kleine Unterschiede bei unveränderten
Schritten sind Messschwankungen. Die Einsparung in Markdown und Browser ist durch
entfernte Renderaufrufe beziehungsweise Seitensitzungen erklärbar.

`test:integration` lief zusätzlich vorher und nachher erfolgreich (je 7 Tests).
Der isolierte Ausgangslauf dauerte 33.90 s.
Der Fixture-Build steckt im ersten Test/Before-Hook; dessen rund 31 s sind kein
langsamer Pagination-Assert. Erzeugte Bilder und Buildinitialisierung dominieren.
Die Suite bleibt unverändert und opt-in; sie gehört nicht zur normalen Validierung.
Die Nachher-Funktionsprüfung lief parallel zu zwei ausgeschlossenen Messrunden;
für diese Suite wird keine Beschleunigung beansprucht.

## Module einzeln

Zusätzlicher sequenzieller Nachher-Lauf je Datei (eine Stichprobe, inklusive
Prozessstart/Imports). Diese Zeiten sind nicht additiv zu den Gruppenmessungen:
Node führt die beiden Unit- beziehungsweise Markdown-Dateien innerhalb ihrer
Gruppe parallel aus. Die separate Inhaltssuite ist oben dokumentiert.

| Datei                         | Wall-Clock, s |
| ----------------------------- | ------------: |
| tests/blog-schema.test.mjs    |          0.32 |
| tests/blog-filters.test.mjs   |          0.17 |
| tests/code-block.test.mjs     |          2.83 |
| tests/mermaid-render.test.mjs |          5.10 |
| tests/seo-build.test.mjs      |          2.40 |
| tests/browser.test.mjs        |          8.86 |

## Entscheidungen und Fehlersignal

- **Schema/Filter:** alle 19 Tests behalten. Datumsnormalisierung, Tag-URLs und
  Kollisionen sind eigene Logik; die gesamte Gruppe kostet etwa eine halbe Sekunde.
- **Code-Blöcke:** alle 10 Tests behalten. Der erste Twoslash-Fall initialisiert
  TypeScript und liegt bei ungefähr 0,56 s; die folgenden Assertions sind günstig.
  Whitespace, Diff, verborgener Setup-Code, Titel-Escaping und Popover-IDs prüfen
  unterschiedliche Fehler. Zusammenlegen der Testnamen spart hier kaum Laufzeit.
- **Mermaid:** den separaten Erfolgslauf mit vier Diagrammtypen entfernt. Der
  Produktionsartikel enthält diese Typen bereits. SVG-XML, Accessibility, interne
  Referenzen, sichtbare Diagramme und eindeutige IDs werden im Output geprüft.
  Wiederholte ER-Diagramme prüfen ID-Kollisionen jetzt zusammen mit beiden
  Sprach-Fallbacks. Ungültiger Quelltext muss weiterhin Datei und Diagrammnummer
  nennen. Damit entfallen einer von vier Chromium-Starts und doppelte Renderarbeit.
- **Browser:** den kompletten Galerieablauf und erfolgreichen Clipboardablauf
  jeweils nur auf Deutsch ausführen. Englische Fehler-/Retry-Flows und die
  englische Galerie ohne JavaScript bleiben. Bewusst entfällt die vollständige
  englische Erfolgsreise inklusive deren Laufzeitprüfung der Lightbox-Labels.
  Beide statischen Sprachoberflächen bleiben durch Outputtests abgedeckt.
- **Popover:** Tastatur, Hovertransfer und Schließen in einer Seitensitzung prüfen.
  Die genaue 149/151-ms-Grenze entfällt; verzögertes Schließen und die Regression
  beim Wechsel zwischen Triggern bleiben. Touch prüft Tap, Fokus und geöffneten
  Popover; die interne Reihenfolge von Pointer-/Focus-/Click-Ereignissen entfällt.
- **Galerie-History:** mit etwa 2,2 s langsamster Browserfall, aber behalten.
  Back/Forward während einer echten Schließanimation prüft eigene Zustandslogik.
  Animationen global abzuschalten würde hier das relevante Signal entfernen.
- **Output:** alle 11 Testfälle behalten. Bereits gelesene Seiten für reziproke
  Sprachlinks wiederverwenden; der entsprechende Test braucht nur noch wenige ms.
  Den wirkungslosen Check auf einen nie erzeugten Draft-Sentinel entfernt. Die
  echte Draft-Unterdrückung bleibt im Fixture-Test.
- **Integration:** alle 7 Tests behalten und separat lassen. 1/12/13/25 Beiträge,
  Entwürfe, Escaping, verschachtelte IDs und Serien sind im aktuellen Content nicht
  zuverlässig vertreten. Assertions auf weniger Beiträge zu begrenzen würde den
  dominierenden Fixture-Build kaum verkürzen.

Keine Produktionsdateien, Dependencies oder Prüfskripte geändert. Kein zusätzlicher
Runner, keine Worker-Konfiguration, kein dauerhaftes Benchmarkframework.

## Einzeltests und Ausreißer

Alle ursprünglichen 64 Tests wurden ausgeführt und fachlich geprüft. Die Tabelle
zeigt Median und Maximum der vom Node-Testreporter ausgegebenen Testdauer vor der
Änderung (ms). Suiteimporte, Prozessstarts und Teardown sind darin nicht vollständig
enthalten; daher können die Zeilen nicht zur Wall-Clock addiert werden. Die
Inhaltssuite hat nur eine isolierte Vorher-Stichprobe, die übrigen Fälle vier.
Bei unveränderten Tests bedeutet „behalten“ eigenständiges fachliches Signal gemäß
der Gruppenbewertung oben. Es gab keine fehlgeschlagenen Tests in den Messläufen;
diese Stichprobe beweist keine generelle Flake-Freiheit.

| Test                                                                                      | Median, ms | Maximum, ms | Entscheidung                    |
| ----------------------------------------------------------------------------------------- | ---------: | ----------: | ------------------------------- |
| de: keyboard opening, navigation, modal focus and both close controls                     |    1033.42 |     1058.52 | behalten                        |
| en: keyboard opening, navigation, modal focus and both close controls                     |     545.57 |      558.07 | doppelten Sprachlauf entfernt   |
| de: Back, Forward and Forward during the closing animation preserve the selected image    |    2219.13 |     2249.79 | behalten                        |
| A failed PhotoSwipe stylesheet follows the original image link                            |     237.00 |      267.15 | behalten                        |
| Without JavaScript the gallery links still open their images                              |     191.43 |      201.58 | behalten                        |
| de: copying preserves exact source and resets the localized status                        |     305.29 |      314.76 | behalten                        |
| en: copying preserves exact source and resets the localized status                        |     300.16 |      315.85 | doppelten Sprachlauf entfernt   |
| en: clipboard rejection reports the error and permits another attempt                     |     342.58 |      352.17 | behalten                        |
| en: repeated clicks share one pending copy and replace the previous reset timer           |     404.92 |      425.30 | behalten                        |
| en: an unavailable Clipboard API keeps copy controls hidden and type controls working     |     314.68 |      318.05 | behalten                        |
| Keyboard focus opens a native popover; Escape and light dismissal close it                |     321.09 |      336.30 | gemeinsamer Popover-Fall        |
| Mouse transfer into a popup cancels delayed dismissal; leaving closes it after 150 ms     |     351.08 |      383.97 | gemeinsamer Popover-Fall        |
| Rapid pointer and focus changes cannot dismiss the newly active popup                     |     424.72 |      440.26 | behalten                        |
| Touch entry does not open a popup before the native tap focuses and clicks                |     317.08 |      327.12 | auf Tap/Fokus vereinfacht       |
| Copy preserves whitespace, empty lines, quotes, markup and backslashes                    |      89.22 |       89.98 | behalten                        |
| Titles are text nodes and only accept the documented metadata token                       |       2.56 |        2.81 | behalten                        |
| Diff copies additions and unchanged lines, excludes removals and preserves empty lines    |      14.19 |       14.64 | behalten                        |
| Highlight strips active comments without dropping code                                    |       0.97 |        1.08 | behalten                        |
| Escaped notation stays literal in displayed and copied code                               |       0.66 |        0.74 | behalten                        |
| Twoslash excludes queries, type output and hidden setup from Copy                         |     572.73 |      626.14 | behalten                        |
| Twoslash runs only on explicit fences and fails for unexpected errors                     |      21.85 |       28.72 | behalten                        |
| Hover popups escape the scroll container, have unique targets and retain JSDoc            |      58.27 |       65.07 | behalten                        |
| showLineNumbers numbers visible code, preserves Copy and composes with Diff and Twoslash  |      15.70 |       16.46 | behalten                        |
| Mermaid preserves its original definition and keeps a visible source fallback             |      10.62 |       10.72 | behalten                        |
| The Markdown pipeline renders all four diagram types with accessible, unique SVGs         |    1325.10 |     1370.26 | in Output verschoben            |
| An invalid diagram rejects rendering with the source file and diagram number              |     976.59 |      984.52 | behalten                        |
| Diagrams without an explicit title receive the localized region name                      |    1905.99 |     1910.39 | mit ER-ID-Regression kombiniert |
| All content pages have complete, consistent metadata and the correct indexing policy      |       2.22 |        2.26 | behalten                        |
| Canonicals and language alternatives are absolute, reciprocal and point to built pages    |      80.88 |       81.49 | behalten                        |
| Both homepages identify the same person and link their structured data                    |       2.11 |        2.36 | behalten                        |
| Profiles and published articles share the optimized hero portrait without source metadata |      50.37 |       51.45 | behalten                        |
| llms.txt lists published canonical content and resolvable pages and project anchors       |      13.25 |       13.89 | behalten                        |
| The sitemap lists each indexable canonical once and robots.txt advertises it              |       7.41 |        9.88 | behalten                        |
| RSS and Markdown publish each canonical article once and are discovered only in the head  |      13.03 |       13.37 | behalten                        |
| Blog pagination preserves ordering, filter counts and localized navigation                |      30.40 |       31.92 | behalten                        |
| Published articles preserve their content language and canonical across both interfaces   |       2.20 |        2.29 | behalten                        |
| One German 404 artifact has usable return links and no content-page SEO tags              |       1.48 |        1.72 | behalten                        |
| Both built article surfaces contain complete SVGs and omit Mermaid client bundles         |      15.64 |       23.69 | behalten                        |
| Only populated months, languages and tags appear, counting each post once                 |       3.49 |        4.55 | behalten                        |
| Each filter independently matches its month, content language or case-insensitive tag     |       0.46 |        0.73 | behalten                        |
| Tag URLs use readable symbol replacements and preserve non-Latin letters                  |       1.81 |        2.60 | behalten                        |
| Adding case variants or other tags keeps existing tag URLs stable                         |       0.29 |        0.98 | behalten                        |
| Unresolved slug collisions name both tags instead of adding hashes or merging them        |       0.47 |        0.49 | behalten                        |
| Tags with no letters, numbers or supported symbols require a readable name                |       0.18 |        0.19 | behalten                        |
| pubDate accepts a leap day and returns UTC midnight                                       |       4.38 |        4.55 | behalten                        |
| updatedDate accepts a leap day and returns UTC midnight                                   |       0.32 |        0.40 | behalten                        |
| Dates reject a leap day in a non-leap century with a field-specific authoring error       |       1.65 |        1.70 | behalten                        |
| Dates reject an unpadded date with a field-specific authoring error                       |       0.32 |        0.32 | behalten                        |
| Dates reject a timestamp with a field-specific authoring error                            |       0.29 |        0.30 | behalten                        |
| Dates reject null with a field-specific authoring error                                   |       0.33 |        0.33 | behalten                        |
| Dates reject a parsed YAML Date object with a field-specific authoring error              |       0.22 |        0.22 | behalten                        |
| Publication is required, while an omitted update stays absent                             |       0.21 |        0.22 | behalten                        |
| Updates may match or follow publication, and earlier updates name updatedDate             |       0.29 |        0.30 | behalten                        |
| The production schema preserves defaults, trimmed text, and normalized tag order          |       0.44 |        0.45 | behalten                        |
| Empty tag arrays and blank names normalize to empty; a comma stays within one tag         |       0.23 |        0.25 | behalten                        |
| Tags reject a comma-separated string with a field-specific error                          |       0.35 |        0.35 | behalten                        |
| Tags reject an array containing a number with a field-specific error                      |       0.19 |        0.20 | behalten                        |
| One build covers 1, 12, 13 and 25 posts across archives and filters                       |   31118.58 |    31118.58 | behalten                        |
| RSS preserves escaped metadata, normalized tags, ordering and optional update dates       |       0.56 |        0.56 | behalten                        |
| Markdown preserves source bodies, nested IDs and optional frontmatter                     |      27.41 |       27.41 | behalten                        |
| Both interfaces retain the article language, identity, escaped text and updated date      |       5.66 |        5.66 | behalten                        |
| Drafts are absent from HTML, Markdown, RSS, sitemap and llms.txt                          |       3.34 |        3.34 | behalten                        |
| Sitemap lists one canonical per article and uses the latest author supplied date          |       3.04 |        3.04 | behalten                        |
| Series parts are ordered and their links follow the current interface language            |       5.77 |        5.77 | behalten                        |

## Schlanke Testauswahl im Alltag

- Schema oder Filter ändern: `pnpm test:unit`.
- Code-/Diagrammverarbeitung ändern: `pnpm test:markdown`.
- Markup, Metadaten, Routing oder Content ändern: `pnpm build && pnpm test:output`.
- Clientinteraktionen ändern: zusätzlich `pnpm test:browser` auf dem aktuellen Build.
- Pagination, Exporte, Entwürfe oder Serien ändern: zusätzlich `pnpm test:integration`.
- Vor einem PR: `pnpm validate`; bei den obigen Inhaltsthemen zusätzlich Integration.

Zur Wiederholung die Befehle aus der Messungstabelle sequenziell jeweils dreimal
ausführen, mit `System.Diagnostics.Stopwatch` die gesamte Prozessdauer messen und
Median/Spanne vergleichen. Der Node-Reporter zeigt Einzeltestdauern bereits an.
Keine Benchmarks gleichzeitig starten. Bei deutlichem Wachstum zuerst Render- und
Buildanzahl sowie neue Browserreisen prüfen; für zusätzliche Tests einen konkreten
Fehler benennen, den die bestehenden günstigen Prüfungen nicht entdecken.

Inspiration: [T3-Code-Bereinigung redundanter Tests](https://github.com/pingdotgg/t3code/runs/118961540966).
Der Link zeigt einen CI-Lauf; dessen Titel liefert die Richtung, keine für dieses
Projekt übertragbare Laufzeitgarantie.
