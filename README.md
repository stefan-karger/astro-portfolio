# stefan-karger.de

Persönliche Website mit Portfolio, Blog sowie Impressum und Datenschutz in
Deutsch und Englisch. Astro erzeugt die statischen Seiten; das Hosting erfolgt
über Netlify.

## Entwicklung

Abhängigkeiten mit `pnpm install` installieren. Den Entwicklungsserver im
Hintergrund starten:

```sh
pnpm exec astro dev --background
```

Den Server mit `pnpm exec astro dev status`, `pnpm exec astro dev logs` und
`pnpm exec astro dev stop` verwalten.

| Befehl          | Zweck                                                              |
| --------------- | ------------------------------------------------------------------ |
| `pnpm validate` | Formatierung, ESLint, Blog- und SEO-Tests, Astro-Prüfung und Build |
| `pnpm build`    | Statische Produktionsseiten in `dist/` erzeugen                    |
| `pnpm preview`  | Den Produktions-Build lokal anzeigen                               |

## Metadaten und Auffindbarkeit

"Stefan Karger" bleibt der Name in Seitentiteln, Beschreibungen und Branding.
Die sichtbare Blog-Autorenzeile und `Person.name` in JSON-LD verwenden
"Stefan Eideloth-Karger"; `Person.alternateName` enthält den Kurznamen.
Beide Startseiten und die veröffentlichten Artikel verwenden dieselbe
Personen-ID mit Porträt und den vorhandenen Profilverlinkungen.

Die Startseiten enthalten `WebSite`, `ProfilePage` und die beiden Projekte als
`SoftwareSourceCode` beziehungsweise `CreativeWork`. Artikel enthalten
`BlogPosting` mit einem Verweis auf dieselbe Person. Canonical und
Artikel-Metadaten folgen der Inhaltssprache, auch bei einer anderen
Oberflächensprache.

`/sitemap.xml` enthält die indexierbaren Hauptseiten beider Sprachen und
veröffentlichte Artikel in ihrer kanonischen Inhaltssprache. Legal-Seiten,
Entwürfe, Weiterleitungen und zusätzliche Artikel-Oberflächen sind ausgeschlossen.
`/llms.txt` ist eine englische Übersicht mit Links auf Hauptseiten,
Projektabschnitte und veröffentlichte Artikel sowie deren weitere Formate.
Beide Endpunkte entstehen beim statischen Build.

## Blog-Daten

Beiträge liegen in `src/content/blog`. `pubDate` und ein optionales `updatedDate`
stehen als Kalenderdatum in Anführungszeichen:

```yaml
pubDate: "2026-10-02"
updatedDate: "2026-10-05"
```

Ungültige Kalenderdaten, Zeitstempel, Zahlen, `null` und YAML-Daten ohne Anführungszeichen
werden beim Build abgelehnt. `updatedDate` darf nicht vor `pubDate` liegen.
Es wird bei einer inhaltlichen Aktualisierung ausdrücklich gesetzt. Ohne das Feld
gibt es weder eine sichtbare Aktualisierungsangabe noch einen Platzhalter oder
entsprechende JSON-LD-/Open-Graph-Daten. Die Autorenzeile nennt
Stefan Eideloth-Karger und verlinkt auf die Homepage der aktuellen Oberflächensprache.

## RSS und Markdown

`/rss.xml` enthält alle veröffentlichten deutschen und englischen Artikel einmal
mit Kurzbeschreibung, vollständigem Autor, Tags, Sprache und kanonischem
HTML-Link. Aktualisierungen behalten ihre GUID und das ursprüngliche
Veröffentlichungsdatum. `dcterms:modified` erscheint nur bei gesetztem
`updatedDate`.

Für jeden veröffentlichten Inhalt gibt es eine Markdown-Fassung:

- Deutsche Inhalte unter `/blog/<slug>.md`.
- Englische Inhalte unter `/en/blog/<slug>.md`.

Beide HTML-Oberflächen verweisen auf dieselbe Fassung der Inhaltssprache.
Die Datei enthält generiertes Frontmatter und den unveränderten Body der
Astro-Collection einschließlich Mermaid-, Diff- und Twoslash-Annotationen.
Astro entfernt beim Einlesen äußeren Leerraum; der Export verändert den
Collection-Body nicht. Fehlende Aktualisierungs- und Serienangaben werden
weggelassen. Auch im Entwicklungsmodus werden Entwürfe nicht exportiert.

Artikel-Links und Medien verwenden absolute URLs oder Pfade ab `/`. Bei den
Markdown-URLs `<slug>.md` hätten verzeichnisrelative Ziele wie `./bild.png` eine
andere Basis als beim HTML-Artikel. Ein Link auf eine HTML-Überschrift enthält
deshalb auch den Artikelpfad, beispielsweise `/blog/artikel/#abschnitt`.
Medien müssen öffentlich erreichbar sein; Astro-interne Quelldateipfade sind
keine öffentlichen Asset-URLs. Der Export schreibt Links nicht um.

Die Blogübersichten und veröffentlichten Artikel enthalten die passenden
`rel="alternate"`-Links im Head. llms.txt verlinkt Feed und Markdown-Fassungen.
Auf den Webseiten gibt es keine zusätzlichen sichtbaren Formatlinks.

`public/_headers` setzt auf Netlify den RSS-Content-Type und für Markdown
`text/markdown; charset=utf-8` sowie `X-Robots-Tag: noindex, follow`.
Die Sitemap enthält weiterhin ausschließlich indexierbare HTML-Canonicals.
Die lokale Astro-Vorschau verarbeitet keine Netlify-Headerregeln; die tatsächliche
Auslieferung wird nach Veröffentlichung auf Netlify geprüft.

## Crawler-Policy

robots.txt erlaubt zunächst alle Bots, einschließlich Trainings-, Such- und
nutzerveranlasster Abrufe. In `src/pages/robots.txt.ts` steuert `crawlerAccess`
die drei benannten Verwendungen einzeln:

```ts
const crawlerAccess = {
  GPTBot: true,
  ClaudeBot: true,
  "Google-Extended": true
}
```

`true` erzeugt `Allow: /`, `false` erzeugt `Disallow: /` für den jeweiligen
Namen. Nach einer Änderung neu bauen und veröffentlichen. Das allgemeine
`Allow: /` lässt unbekannte Bots sowie die Such- und Nutzerbots weiterhin zu.

Google-Extended koppelt bestimmte Trainings- und Gemini-Verwendungen und ist
kein eigener HTTP-User-Agent. Der Schalter betrifft beide Verwendungen gemeinsam.
robots.txt wirkt gegenüber kooperierenden Crawlern, verhindert keine anderen
Abrufe und entfernt keine bereits übernommenen Daten. Eine Trainingsfreigabe
garantiert keine Aufnahme der Artikel oder spätere Nennung des Autors.

## Dokumentation

- [Offene Punkte](docs/offene-punkte.md)
- [Agentic Web Readiness: allgemeiner Leitfaden](docs/AGENTIC_WEB_READINESS.md)
- [Bildpipeline und Portfolio](docs/image-pipeline.md)
- [Datenschutz: offene Betreiberprüfungen](docs/offene-punkte.md#datenschutz-und-betreiberprüfungen)
- [Entwicklungsvorgaben](AGENTS.md)
- [Coding Guidelines](CODING_GUIDELINES.md)
