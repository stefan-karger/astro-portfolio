# Offene Punkte

Stand: 5. Oktober 2026. Hier stehen ausstehende Inhaltsentscheidungen und
Prüfungen. Die aktuelle Umsetzung beschreibt die [README](../README.md).

## Inhalte und Fotografie

- Den Datenstand der Junksplayground-Kennzahlen ergänzen, wenn ein bestätigtes
  Bezugsdatum vorliegt.
- Den eigenen Anteil an SolidUI präzisieren, sofern öffentlich gewünscht.
  Zusammenarbeit berücksichtigen und keine alleinige Urheberschaft behaupten.
- Beim dualen Studium die Hochschule zusätzlich zum Praxispartner nennen,
  sofern öffentlich gewünscht und bestätigt.
- Die Portfolio-Auswahl und Bildfolge kuratieren. Zusammengehörige Serien,
  die lange mobile Bildfolge sowie Auftakt und Abschluss gemeinsam beurteilen.
- Die zeitabhängige Portfolio-Angabe "aus den vergangenen zehn Jahren" durch
  einen bestätigten Zeitraum oder eine zeitneutrale Angabe ersetzen.
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
- [ ] Den Feed in einem Feed-Reader abonnieren und die Anzeige von Titel,
      Kurzbeschreibung, Autor, Datum, Sprache und Artikel-Links prüfen.
- [ ] Die Markdown-Header bei englischen Inhalten und verschachtelten Slugs
      auf Netlify prüfen, sobald entsprechende Artikel veröffentlicht sind.
      Der aktuelle Build enthält ausschließlich zwei deutsche Artikel ohne
      verschachtelte Slugs.
- [ ] Nach dem nächsten Deploy die lokal korrigierten ARIA-Rollenbeschreibungen
      der Galerie auf Netlify prüfen: DE `Bildkarussell` und `Bild`, EN `carousel`
      und `slide`. Öffnen, Bildwechsel, Escape und Fokusrückkehr wurden am 5. Oktober 2026 lokal in beiden Sprachen geprüft.

## Namenssuche und externe Profile

- In [Google Search Console](https://search.google.com/search-console) die
  Domain-Property für `stefan-karger.de` bestätigen, falls noch nicht vorhanden.
  `/sitemap.xml` einreichen. Beide Startseiten mit der URL-Prüfung kontrollieren
  und nach erfolgreicher Live-Prüfung eine erneute Indexierung anfordern.
  Die von Google gewählte Canonical prüfen.
- Auf LinkedIn und GitHub die aktuelle Website als persönliche Website
  hinterlegen. Profile mit dem vollständigen Namen verbinden die Person mit
  der Website. Wo ein Linktext frei wählbar ist, "Stefan Karger" verwenden.
- Für `e-k-fotos.de` entscheiden, ob die alte Fotografie-Seite bestehen bleibt.
  Dann einen sichtbaren Link zur aktuellen Website ergänzen. Bei Ablösung jede
  alte URL dauerhaft zum passenden neuen Inhalt weiterleiten. Fotografie-Seiten
  führen zur Fotografie. Keine pauschale Weiterleitung aller URLs zur Homepage
  und keine Canonical zwischen unterschiedlichen Inhalten.
- In Search Console die Suchanfragen "Stefan Karger" und "Stefan Eideloth-Karger"
  getrennt beobachten. Impressionen, Klicks und durchschnittliche Position über
  mehrere Wochen vergleichen.

Diese Schritte benötigen Zugriff auf die jeweiligen Konten. Die Codeumsetzung
erledigt sie nicht.

## Datenschutz und Betreiberprüfungen

Die öffentlichen Texte liegen in [datenschutz.astro](../src/pages/datenschutz.astro)
und [privacy-policy.astro](../src/pages/en/privacy-policy.astro).

- [ ] Die Gmail-Weiterleitung bei STRATO ist abgeschaltet. Antworten werden über
      `kontakt@stefan-karger.de` versendet. Die Löschregel gilt auch für etwaige
      frühere Gmail-Kopien.
- [ ] satellite ist freigeschaltet. Voicemail, Abschriften und KI-Zusammenfassungen
      sind soweit verfügbar deaktiviert. Die tatsächliche Konfiguration stimmt
      mit dem Telefonabschnitt überein; der Löschablauf der Anrufliste ist geklärt.
- [ ] Die Aufbewahrung oder belastbare Löschkriterien für technische Zugriffs- und
      Sicherheitsdaten bei Netlify Legacy Free sind anhand der Vertragsunterlagen
      oder einer Anbieterauskunft geklärt. Fristen für Function Logs und
      Credit-based Observability belegen dies nicht. Im Text ist keine feste
      Netlify-Log-Frist behauptet.
- [ ] Einschlägige Unternehmensangaben für das Impressum sind geklärt.
- [ ] Netlifys DPF-Eintrag ist geprüft und gegebenenfalls direkt verlinkt.
- [ ] Ein bestätigter Stand ist auf den öffentlichen Datenschutzseiten ergänzt.
- [x] Die Deploy-Preview vom 5. Oktober 2026 ist in beiden Sprachen mit der
      lokalen Datenschutzfassung abgeglichen. Der Produktionsabgleich folgt nach
      Veröffentlichung.

Anbieterunterlagen für diese Prüfungen:

- [STRATO: Vereinbarung zur Auftragsverarbeitung](https://www.strato.de/agb/avv/)
- [STRATO: Wiederherstellung gelöschter E-Mails](https://www.strato.de/faq/mail/wie-kann-ich-meine-geloeschten-e-mails-wiederherstellen/)
- [Netlify: Self-Serve Subscription Agreement](https://www.netlify.com/pdf/self-serve-subscription-agreement.pdf/)
- [Netlify: Data Processing Agreement](https://www.netlify.com/pdf/netlify-dpa.pdf)
- [Netlify: Observability und Verfügbarkeit nach Tarif](https://docs.netlify.com/manage/monitoring/observability/overview/)
- [satellite: Datenschutz](https://www.satellite.me/datenschutz/)

## Barrierefreiheit und Performance

- Die sichtbare Masonry-Reihenfolge mit DOM-, Tastatur- und Lightbox-Reihenfolge
  abgleichen und störende Fokussprünge prüfen.
- Die Galerie mit einem echten Screenreader in DE und EN prüfen: Öffnen per
  Maus und Enter muss den lokalisierten Dialog ankündigen. Während der Dialog
  offen ist, dürfen Header, Hauptinhalt und Footer im Lesemodus nicht erreichbar
  sein. Tab, Shift+Tab, Bildwechsel, Escape und Fokusrückkehr prüfen; Zurück und
  Vorwärts auch während Übergängen und mit reduzierter Bewegung wiederholen.
- Touch-Gesten auf echter Hardware prüfen.
- Reale Core-Web-Vitals-Feldwerte prüfen, sobald ausreichend Daten vorliegen.
