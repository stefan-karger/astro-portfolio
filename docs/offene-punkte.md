# Offene Punkte

Stand: 8. Oktober 2026. Hier stehen ausstehende Inhaltsentscheidungen und
Prüfungen. Die aktuelle Umsetzung beschreibt die [README](../README.md).

## Inhalte und Fotografie

Die vorhandenen Portfolio-Bilder bleiben vorerst unverändert. Größere Exporte
werden derzeit nicht gesucht. Kleine Quellen werden nicht künstlich hochskaliert.

## Netlify-Abnahme

Geprüft am 5. Oktober 2026 auf der
[Deploy-Preview 2](https://deploy-preview-2--stefan-karger.netlify.app/).
Der Vergleich umfasst 14 Inhaltsseiten, die öffentlichen Text- und XML-Endpunkte,
zehn fehlende Seiten und Dateien sowie bekannte Assets.

Netlify ergänzt auf Deploy-Previews automatisch `X-Robots-Tag: noindex`.
Deshalb ist diese Preview nicht indexierbar. Die Abnahme der Produktionsdomain
steht weiterhin aus.
[Netlify: Indexierung von Deployments](https://docs.netlify.com/deploy/deploy-overview/#search-engine-indexing)

### In der Preview bestätigt

| Bereich                    | Ergebnis                                                                                                                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RSS                        | HTTP 200, `application/rss+xml; charset=utf-8`, gültiges XML mit beiden veröffentlichten Artikeln, vollständigem Autor und korrekten Daten und Links.                                                                                                                     |
| Markdown                   | Beide veröffentlichten deutschen Artikel mit HTTP 200, `text/markdown; charset=utf-8` und `X-Robots-Tag: noindex, follow, noindex`. Metadaten und Artikeltext stimmen mit dem lokalen Build überein.                                                                      |
| Discovery                  | `/llms.txt`, `/robots.txt` und `/sitemap.xml` sind erreichbar und stimmen mit dem Build überein. Textdateien haben UTF-8, die Sitemap `application/xml`. Feed- und Markdown-Links stehen im HTML-Head.                                                                    |
| Crawler                    | Zehn benannte HTTP-User-Agents liefern auf jeweils sechs Pfaden dieselben Statuscodes und Inhalte wie normale Abrufe. robots.txt erlaubt die vorgesehenen Gruppen.                                                                                                        |
| HTML und Metadaten         | Alle 14 Seiten haben HTTP 200 und passende Titel, Beschreibungen, Canonicals, Sprachalternativen und Social-Metadaten. Auf den vier Legal-Seiten steht genau ein `noindex, follow`. Artikel folgen ihrer Inhaltssprache; Autorenzeile und bedingtes `updatedDate` passen. |
| Schema.org                 | Beide Startseiten und beide Artikel haben im Schema.org-Validator jeweils null Fehler und null Warnungen.                                                                                                                                                                 |
| Google Rich Results        | Die deutsche Startseite liefert eine gültige ProfilePage, beide Artikel jeweils einen gültigen Artikel. Google bestätigt den Abruf; die Preview-Indexierung scheitert am erwarteten `noindex`-Header.                                                                     |
| Fehlerseite                | Alle zehn unbekannten DE/EN-Pfade einschließlich tiefer Pfade und Bild-, CSS- und JavaScript-Dateien liefern HTTP 404 mit der deutschen Fehlerseite. URL, deutscher Header und Footer, `html lang="de"` und Fehler-Metadaten passen; der Sprachschalter fehlt.            |
| Weiterleitungen und Assets | `/portfolio` und `/en/portfolio` erreichen das Fotografie-Ziel der jeweiligen Sprache. Bekannte Bilder, CSS und JavaScript sind erreichbar. Das SK.-Vorschaubild auf der Preview liefert HTTP 200 als PNG mit 1200 × 630 Pixeln und entspricht der lokalen Datei.         |
| Datenschutztexte           | Beide Sprachfassungen stimmen mit dem lokalen Build überein.                                                                                                                                                                                                              |

Die HTML-Vergleiche berücksichtigen den von Netlify eingefügten Preview-Drawer
und abweichende generierte Twoslash-IDs. Die User-Agent-Prüfung belegt die
Auslieferung mit diesen Kennungen, keine Besuche echter Anbietercrawler.

Dieses Protokoll beschreibt den damaligen Preview-Stand. Seit dem 8. Oktober sind
die Weiterleitungen von `/portfolio`, `/en/portfolio` und den beiden alten
`astro-shiki-codebloecke`-Artikelpfaden entfernt. Diese Aliase liefern lokal 404;
die Fotografie- und aktuellen Artikelrouten bleiben die gültigen Ziele.
Die nächste Deploy-Abnahme muss den aktuellen Build prüfen.

Der [Schema.org-Validator](https://validator.schema.org/) akzeptiert alle geprüften
Graphen. Im [Google Rich Results Test](https://search.google.com/test/rich-results)
fehlt bei beiden Artikeln lediglich das optionale `BlogPosting.image`.
Beide Artikel bleiben gültig.

Mermaid am 6. Oktober 2026 auf dem
[erfolgreichen Deploy](https://6ac555f22d365200084bee83--stefan-karger.netlify.app/blog/astro-fuer-entwicklerblogs-mermaid-diagramme/)
nachgeprüft: Chromium-Installation und SVG-Build funktionieren ohne `--with-deps`.
Beide Sprachfassungen liefern jeweils fünf gültige SVGs mit eindeutigen IDs und
aufklappbarem Quelltext direkt im HTML. Mermaid- und ELK-JavaScript werden nicht
nachgeladen. Desktop und schmale Ansichten mit 320 und 375 Pixeln sind geprüft;
die Diagramme verursachen keinen Seitenüberlauf. Die Auswahlfarbe ist hell.

### Noch offen

- [ ] Nach Veröffentlichung die Produktionsdomain prüfen: HTML-Indexierbarkeit,
      Auslieferungs-Header, Canonicals sowie RSS, Markdown, llms.txt, robots.txt
      und Sitemap. Das Preview-`noindex` darf dort nicht auf indexierbaren
      Inhaltsseiten erscheinen.
      Beide veröffentlichten Datenschutzfassungen mit dem aktuellen Build abgleichen.
- [ ] Nach dem erfolgreichen Produktionsdeploy die `og:image`-URL
      `https://stefan-karger.de/social/sk-wordmark.png` und die Linkvorschau
      abschließend prüfen: HTTP 200, PNG mit 1200 × 630 Pixeln.
      Die Datei ist bereits umgesetzt und in der Deploy-Preview geprüft.
- [ ] Den Google Rich Results Test nach Veröffentlichung für die Startseite und
      die Artikel auf der Produktionsdomain wiederholen.
- [ ] Nach dem vollständigen Deploy den Feed in einem Feed-Reader abonnieren
      und die Anzeige von Titel, Kurzbeschreibung, Autor, Datum, Sprache und
      Artikel-Links prüfen.

## Namenssuche und externe Profile

- In [Google Search Console](https://search.google.com/search-console) die
  Domain-Property für `stefan-karger.de` bestätigen, falls noch nicht vorhanden.
  `/sitemap.xml` einreichen. Beide Startseiten mit der URL-Prüfung kontrollieren
  und nach erfolgreicher Live-Prüfung eine erneute Indexierung anfordern.
  Die von Google gewählte Canonical prüfen.
- Nach dem vollständigen Deploy auf LinkedIn und GitHub `stefan-karger.de` als
  persönliche Website hinterlegen und den vollständigen Namen pflegen.
- Für die gekündigte Domain `e-k-fotos.de` nach dem vollständigen Deploy von
  `stefan-karger.de` eine direkte Weiterleitung bis zum Vertragsende einrichten.
- Nach dem vollständigen Deploy und der Einrichtung der Search Console die
  Suchanfragen "Stefan Karger" und "Stefan Eideloth-Karger" getrennt beobachten.
  Impressionen, Klicks und durchschnittliche Position über mehrere Wochen
  vergleichen.

Diese Schritte benötigen Zugriff auf die jeweiligen Konten. Die Codeumsetzung
erledigt sie nicht.

## Barrierefreiheit und Performance

- Nach dem vollständigen Deploy reale Core-Web-Vitals-Feldwerte prüfen,
  sobald ausreichend Besucherdaten vorliegen.
