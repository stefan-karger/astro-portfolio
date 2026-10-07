# stefan-karger.de

Persönliche Website mit Portfolio, Blog sowie Impressum und Datenschutz in
Deutsch und Englisch. Astro erzeugt die statischen Seiten; das Hosting erfolgt
über Netlify.

## Entwicklung

Voraussetzungen sind Node.js `^22.13.0 || >=24.0.0` und pnpm `12.10.0`.
Die pnpm-Version ist in `package.json` festgelegt. pnpm lokal installieren:

```sh
npx --yes get-pnpm@0.0.5 12.10.0
```

Anschließend ein neues Terminal öffnen, mit `pnpm --version` die Version prüfen
und die Abhängigkeiten mit `pnpm install --frozen-lockfile` installieren.

Für Mermaid-Diagramme einmalig `pnpm setup:diagrams` ausführen. Das installiert
Chromium für Playwright. Mermaid rendert die SVGs bei der Markdown-Verarbeitung;
die Website liefert keine Mermaid-Bibliothek an Besucher aus. CSS-Tokens,
JetBrains Mono und die Schriftgröße `--text-code` gelten auch für den Buildrenderer.
Fehlerhafte Diagramme stoppen den Build mit Dateipfad und Diagrammnummer.
Die Blog-Collection verwendet `deferRender: true`, damit Vite die Diagramme beim
Rendern der Seite verarbeitet. Registrierte CSS- und Schriftdateien lösen eine
Konfigurationsaktualisierung aus; das HTML entsteht beim Produktionsbuild statisch.

`netlify.toml` führt `pnpm setup:diagrams` vor `pnpm build` aus und veröffentlicht
`dist/`. Die Installation lädt nur Chromium herunter. `--with-deps` darf auf
Netlify nicht verwendet werden, da die Installation von Linux-Systembibliotheken
root-Rechte benötigt. In anderen Linux-Buildumgebungen mit entsprechenden Rechten
kann `pnpm exec playwright install --with-deps --only-shell chromium` fehlende
Systembibliotheken ergänzen.

`pnpm-workspace.yaml` erlaubt Abhängigkeits-Buildskripte ausschließlich für
esbuild und sharp. Neue Paketversionen müssen mindestens einen Tag alt sein;
fehlende Veröffentlichungsdaten und ein Rückgang der Vertrauensnachweise beim
Veröffentlichen führen zum Abbruch der Installation. Die eingetragenen
Ausnahmen vom Mindestalter gelten nur für die genannten Paketversionen.
Diese Einstellungen folgen den [pnpm-Buildregeln](https://pnpm.io/settings/build)
und der [pnpm-Abhängigkeitsprüfung](https://pnpm.io/settings/dependency-resolution).
Die Vertrauensprüfung hat eine Ausnahme für `chokidar@4.0.3`, das
`@astrojs/check` benötigt. Diese Version von Dezember 2024 hat keinen
npm-Provenienznachweis. Ihre Registry-Prüfsumme stimmt mit dem Lockfile überein;
der veröffentlichte Commit entspricht dem
[signierten Release-Tag](https://github.com/paulmillr/chokidar/releases/tag/4.0.3).

Den Entwicklungsserver im Hintergrund starten:

```sh
pnpm exec astro dev --background
```

Den Server mit `pnpm exec astro dev status`, `pnpm exec astro dev logs` und
`pnpm exec astro dev stop` verwalten.

| Befehl          | Zweck                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| `pnpm validate` | Formatierung, ESLint, Blog-, Diagramm- und SEO-Tests, Astro-Prüfung und Build |
| `pnpm build`    | Statische Produktionsseiten in `dist/` erzeugen                               |
| `pnpm preview`  | Den Produktions-Build lokal anzeigen                                          |

Die SEO-Integration startet pro Lauf einen neuen Hintergrundserver in einem
temporären Checkout mit eigenen Astro- und Vite-Caches. Bei einem unerwarteten
Fehler bleibt dieser Checkout erhalten. Zusätzlich liegen unter
`.astro/seo-failures/failure-*` eine Kopie des Checkouts vor der Wiederherstellung
geänderter Testdateien und eine `failure.json` mit Szenariofolge, Prozessausgaben,
Exit-Details und Werkzeugversionen. Die Tests geben beide Verzeichnisse aus.
Die Kopie behält Datei-Zeitstempel; der Test-Runner liegt als `seo.spec.mjs` daneben.
Erwartete Validierungsfehler erzeugen keine Fehlerkopie.

Zum Nachstellen im gesicherten `checkout`-Verzeichnis mit derselben Node-Version
`pnpm install --frozen-lockfile` ausführen und den betroffenen Astro-Befehl aus
`failure.json` mit der dort installierten CLI wiederholen. Die Fehlerkopie enthält
das Lockfile und die ursprünglichen Caches, aber keine `node_modules`-Verknüpfung.

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
Artikel erhalten `lastmod` aus `updatedDate`, andernfalls aus `pubDate`.
Andere Seiten enthalten kein `lastmod`.
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

Die Blogübersicht zeigt höchstens zwölf Beiträge pro Seite. Übersicht und Filter
entstehen beim Build mit Astros `paginate()` über `[...page].astro`; im Browser
steht nur die aktuelle Seite im HTML. Die erste Seite liegt weiterhin unter
`/blog/`, weitere Seiten unter `/blog/2/`, `/blog/3/` und den entsprechenden
englischen Pfaden. Die Navigation verwendet Astros `page.url.prev` und
`page.url.next`. Der erste Beitrag ist nur auf Seite 1 hervorgehoben.

Die Blogübersicht filtert über normale Links nach einem Veröffentlichungsmonat,
einer Inhaltssprache oder einem Tag. Es ist jeweils ein Filter aktiv; die Zahlen
in der Seitenleiste zählen immer alle verfügbaren Beiträge. Die Filterseiten
entstehen beim Build über `blog/filter/[filter]/[...page].astro`, beispielsweise
unter `/blog/filter/month-2026-10/` oder `/en/blog/filter/tag-astro/2/`.
Ein Filterwechsel startet auf Seite 1. Monats- und
Sprachbezeichnungen folgen der Oberflächensprache. Tag-Bezeichnungen bleiben
unverändert; bei gleichen URL-Namen unterscheidet ein kurzer Hash die Tags.
Filterseiten verwenden `noindex, follow` und erscheinen nicht in der Sitemap.
Öffentliche Übersichtsseiten sind in der Sitemap enthalten. Rein numerische
Artikel-IDs auf oberster Ebene sind für die Pagination reserviert.

Die Umsetzung folgt [Astros Pagination-Beispiel](https://docs.astro.build/en/guides/routing/#pagination)
und [Nested Pagination](https://docs.astro.build/en/guides/routing/#nested-pagination).

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
