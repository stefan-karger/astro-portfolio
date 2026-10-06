# Offene Punkte

Stand: 6. Oktober 2026. Hier stehen ausstehende Inhaltsentscheidungen und
Prüfungen. Die aktuelle Umsetzung beschreibt die [README](../README.md).

## Inhalte und Fotografie

- Höher aufgelöste, gleichwertig bearbeitete Exporte für die Bilder 002, 011,
  012, 014 und 016 prüfen. Die vorhandenen Quellen sind nur 1080 Pixel breit.
  Die Spiegelaufnahme hat 1350 × 1350 Pixel. Kleine Quellen werden nicht
  künstlich hochskaliert.

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

## Datenschutz und Betreiberprüfungen

Die öffentlichen Texte liegen in [datenschutz.astro](../src/pages/datenschutz.astro)
und [privacy-policy.astro](../src/pages/en/privacy-policy.astro).

- [ ] satellite ist freigeschaltet. Voicemail, Abschriften und KI-Zusammenfassungen
      sind soweit verfügbar deaktiviert. Die tatsächliche Konfiguration stimmt
      mit dem Telefonabschnitt überein; der Löschablauf der Anrufliste ist geklärt.
- [ ] Optional: Nach Klärung des offenen satellite-Punkts ein Fassungsdatum auf
      den öffentlichen Datenschutzseiten ergänzen. Ein Datum gehört nicht zu den
      Pflichtangaben nach [Artikel 13 DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu).
      Der Inhalt muss unabhängig davon die tatsächliche Verarbeitung abbilden.
- [x] Die Deploy-Preview vom 5. Oktober 2026 ist in beiden Sprachen mit der
      lokalen Datenschutzfassung abgeglichen. Der Produktionsabgleich folgt nach
      Veröffentlichung.

Anbieterunterlagen für diese Prüfungen:

Netlify am 6. Oktober 2026 geprüft: Der Account-DPA v5 ist bytegenau identisch mit
der öffentlichen Fassung vom 9. Juni 2026. Exhibit 2, Abschnitt 5.A auf PDF-Seite 15
nennt für das zentrale Logging der Service-Komponenten 90 Tage online und ein Jahr
offline. Beide Datenschutzfassungen enthalten diese Angabe mit ihrem Geltungsbereich.
Der DPA umfasst auch das Self-Serve Subscription Agreement; Abschnitt 7.1 verweist
auf Exhibit II, dessen Überschrift „Enterprise Services“ lautet.
Eine gesonderte Frist für einzelne CDN-Zugriffe wird daraus nicht abgeleitet.
Die Trust-Center-Suche nach `retention` und `deletion` lieferte laut Betreiber
keine Treffer.

- [STRATO: Vereinbarung zur Auftragsverarbeitung](https://www.strato.de/agb/avv/)
- [STRATO: Wiederherstellung gelöschter E-Mails](https://www.strato.de/faq/mail/wie-kann-ich-meine-geloeschten-e-mails-wiederherstellen/)
- [Netlify: Self-Serve Subscription Agreement](https://www.netlify.com/pdf/self-serve-subscription-agreement.pdf/)
- [Netlify: Data Processing Agreement](https://www.netlify.com/pdf/netlify-dpa.pdf)
- [Netlify: Datenschutz und Aufbewahrung](https://www.netlify.com/privacy/#7-data-retention)
- [Netlify: Zugriff auf das Trust Center](https://docs.netlify.com/manage/security/overview/#access-the-trust-center)
- [Netlify: Observability und Verfügbarkeit nach Tarif](https://docs.netlify.com/manage/monitoring/observability/overview/)
- [satellite: Datenschutz](https://www.satellite.me/datenschutz/)

## Barrierefreiheit und Performance

- Nach dem vollständigen Deploy reale Core-Web-Vitals-Feldwerte prüfen,
  sobald ausreichend Besucherdaten vorliegen.
