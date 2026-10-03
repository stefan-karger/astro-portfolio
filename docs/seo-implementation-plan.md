# Offene SEO-Abnahme nach Deployment

Stand: 2. Oktober 2026. Diese Checkliste enthält die noch offenen externen
Prüfungen für E02 und E05 aus dem [Website-Audit](website-audit-2026-09-30.md).
Grundlage muss ein Netlify-Deployment des aktuellen Arbeitsstands sein.

## E02: Öffentlich erreichbare Linkvorschauen

- Die ausgelieferten Heads auf Startseite, Fotografie, Legal-Seiten,
  Blogübersichten und allen veröffentlichten Artikeln unter beiden
  Oberflächensprachen prüfen. Titel, Beschreibung, Canonical, Sprachalternativen,
  Open Graph und Social Cards müssen zum aktuellen Build gehören.
- Auf den vier Legal-Seiten genau ein `noindex, follow` prüfen. Die übrigen
  Inhaltsseiten müssen indexierbar bleiben.
- Bei Artikeln die gemeinsame Canonical und Metadatensprache gemäß Inhaltssprache
  prüfen. Eine englische Oberfläche eines deutschen Artikels behält dessen
  deutsche Metadaten.
- Die tatsächlich in `og:image` angegebene absolute URL abrufen. Erwartet werden
  HTTP 200, `Content-Type: image/png` und das SK.-Bild mit 1200 × 630 Pixeln.
  Der Bildabruf muss ohne Anmeldung funktionieren. Die Erreichbarkeit allein
  unter der Deployment-Vorschau-Adresse reicht für diese Prüfung nicht aus.
- Den Link in mindestens einem tatsächlich verfügbaren Linkvorschau-Inspector
  prüfen. Ältere Plattform-Caches getrennt von der aktuellen HTML- und
  Bildantwort bewerten. Für die Abnahme werden keine Beiträge veröffentlicht.

## E05: Zentrale deutsche Fehlerseite auf Netlify

| Aufruf                                              | Erwartung                                                                  |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| `/nicht-vorhanden-seo-test/`                        | HTTP 404, deutsche Fehlerseite, angeforderte URL bleibt erhalten.          |
| `/en/not-found-seo-test/`                           | HTTP 404, dieselbe deutsche Fehlerseite, angeforderte URL bleibt erhalten. |
| Tiefe unbekannte Pfade DE/EN                        | Dieselbe deutsche Fehlerseite mit HTTP 404.                                |
| Unbekannte Bild-, CSS- und JavaScript-Dateien DE/EN | HTTP 404.                                                                  |
| Bekannte Inhaltsseiten, Bilder, CSS und JavaScript  | Weiterhin erfolgreich erreichbar.                                          |
| `/portfolio` und `/en/portfolio`                    | Weiterhin das bestehende Fotografie-Ziel in der jeweiligen Sprache.        |

- Die tatsächlich verwendete Netlify-Konfiguration auf allgemeine Rewrites
  prüfen. Eine fehlende Ressource darf nicht mit HTTP 200 beantwortet werden.
- Die Fehlerseite muss vollständig deutsch sein, einschließlich Header, Footer
  und `html lang`. Der Sprachschalter bleibt auf dieser Seite ausgeblendet.
- Im Head genau ein `noindex`, kein Canonical, kein `hreflang` und keine
  Social-Metadaten prüfen.

Netlify verwendet die erzeugte `dist/404.html` als zentrale Fehlerseite.
[Netlify-404-Verhalten](https://docs.netlify.com/manage/routing/redirects/redirect-options/#custom-404-page-handling)

Nach belegter Abnahme die jeweiligen Befunde aus dem offenen Audit entfernen.
Wenn beide Befunde abgeschlossen sind, wird diese Checkliste nicht mehr benötigt.
