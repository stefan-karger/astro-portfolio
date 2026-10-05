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

## Abnahme nach Veröffentlichung auf Netlify

Grundlage ist ein Deployment des aktuellen Arbeitsstands auf der tatsächlichen
Netlify-Umgebung. Die lokale Astro-Vorschau verarbeitet keine Netlify-Headerregeln.

### RSS, Markdown und Crawler

Lokaler manueller Prüfstand vom 5. Oktober 2026 laut Rückmeldung von Stefan,
unter `http://localhost:4321`:

- [x] `/blog/astro-fuer-entwicklerblogs-mermaid-diagramme.md` funktioniert.
- [x] `/llms.txt` funktioniert.
- [x] `/rss.xml` löst im Browser einen Dateidownload aus; der Inhalt passt.

Der übrige RSS-, Markdown- und Crawler-Umfang scheint bei der lokalen Durchsicht
ebenfalls zu passen. Die Netlify-Auslieferung und das Feed-Reader-Abonnement
sind damit noch nicht geprüft.

Auf Netlify noch prüfen:

- `/rss.xml` und veröffentlichte Markdown-Dateien mit HTTP 200 abrufen.
  Erwartete Content-Types sind `application/rss+xml; charset=utf-8` und
  `text/markdown; charset=utf-8`.
- Für Markdown `X-Robots-Tag: noindex, follow` prüfen, auch bei verschachtelten
  Slugs und in beiden Inhaltssprachen, sobald entsprechende Artikel vorliegen.
  HTML-Artikel müssen weiterhin als HTML mit ihren Canonicals erreichbar sein.
- `/robots.txt`, `/llms.txt` und `/sitemap.xml` auf Erreichbarkeit, passende
  Content-Types und Übereinstimmung mit dem Build prüfen. Die Sitemap enthält
  ausschließlich indexierbare HTML-Canonicals.
- Normale Abrufe und Abrufe mit den benannten HTTP-User-Agent-Kennungen vergleichen.
  Unerwartete Hosting-Sperren ausschließen. Google-Extended hat keinen eigenen
  HTTP-User-Agent. Diese Prüfung belegt keine spätere Trainingsverwendung.
- Den Feed in einem Feed-Reader abonnieren. Titel, Kurzbeschreibung, Autor,
  Veröffentlichung, Sprache und Artikel-Links prüfen.

### Metadaten und Linkvorschauen

- Die ausgelieferten Heads auf Startseite, Fotografie, Legal-Seiten,
  Blogübersichten und allen veröffentlichten Artikeln in beiden
  Oberflächensprachen prüfen. Titel, Beschreibung, Canonical, Sprachalternativen,
  Open Graph und Social Cards müssen zum aktuellen Build gehören.
- Auf den vier Legal-Seiten genau ein `noindex, follow` prüfen. Die übrigen
  Inhaltsseiten müssen indexierbar bleiben.
- Bei Artikeln die gemeinsame Canonical und Metadatensprache gemäß Inhaltssprache
  prüfen. Eine englische Oberfläche eines deutschen Artikels behält dessen
  deutsche Metadaten. Die sichtbare Autorenzeile nennt Stefan Eideloth-Karger;
  die Aktualisierungsangabe erscheint ausschließlich bei gesetztem `updatedDate`.
- Die ausgelieferten JSON-LD-Graphen mit dem
  [Schema.org-Validator](https://validator.schema.org/) und unterstützte Profil-
  und Artikeltypen mit dem
  [Rich Results Test](https://search.google.com/test/rich-results) prüfen.
- Die tatsächlich in `og:image` angegebene absolute URL ohne Anmeldung abrufen.
  Erwartet werden HTTP 200, `Content-Type: image/png` und das SK.-Bild mit
  1200 × 630 Pixeln. Die Erreichbarkeit allein unter einer Deploy-Preview-Adresse
  reicht für diese Prüfung nicht aus.
- Den Link in einem verfügbaren Linkvorschau-Inspector prüfen. Ältere
  Plattform-Caches getrennt von der aktuellen HTML- und Bildantwort bewerten.

### Zentrale deutsche Fehlerseite

| Aufruf                                              | Erwartung                                                                  |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| `/nicht-vorhanden-seo-test/`                        | HTTP 404, deutsche Fehlerseite, angeforderte URL bleibt erhalten.          |
| `/en/not-found-seo-test/`                           | HTTP 404, dieselbe deutsche Fehlerseite, angeforderte URL bleibt erhalten. |
| Tiefe unbekannte Pfade DE/EN                        | Dieselbe deutsche Fehlerseite mit HTTP 404.                                |
| Unbekannte Bild-, CSS- und JavaScript-Dateien DE/EN | HTTP 404.                                                                  |
| Bekannte Inhaltsseiten, Bilder, CSS und JavaScript  | Erfolgreich erreichbar.                                                    |
| `/portfolio` und `/en/portfolio`                    | Bestehendes Fotografie-Ziel in der jeweiligen Sprache.                     |

- Allgemeine Netlify-Rewrites prüfen. Fehlende Ressourcen dürfen keine
  HTTP-200-Antwort erhalten. Netlify verwendet die erzeugte `dist/404.html` als
  zentrale Fehlerseite.
- Header, Footer und `html lang` der Fehlerseite müssen deutsch sein.
  Der Sprachschalter bleibt ausgeblendet.
- Im Head genau ein `noindex`, kein Canonical, kein `hreflang` und keine
  Social-Metadaten prüfen.

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
- [ ] Der aktuelle Netlify-Build ist in beiden Sprachen mit der lokalen Fassung
      abgeglichen.

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
- Die frei formulierten ARIA-Rollenbeschreibungen `carousel` und `slide` in DE
  und EN prüfen und gegebenenfalls lokalisieren. Standardisierte ARIA-Rollen
  bleiben unverändert.
- Die Galerie mit einem echten Screenreader in DE und EN prüfen: Öffnen per
  Maus und Enter muss den lokalisierten Dialog ankündigen. Während der Dialog
  offen ist, dürfen Header, Hauptinhalt und Footer im Lesemodus nicht erreichbar
  sein. Tab, Shift+Tab, Bildwechsel, Escape und Fokusrückkehr prüfen; Zurück und
  Vorwärts auch während Übergängen und mit reduzierter Bewegung wiederholen.
- Touch-Gesten auf echter Hardware prüfen.
- Reale Core-Web-Vitals-Feldwerte prüfen, sobald ausreichend Daten vorliegen.
