# Blog-Pagination

Stand: 8. Oktober 2026. Die Pagination ist umgesetzt. Dieses Dokument beschreibt
die Routen, das Verhalten und die zugehörigen Prüfungen.

## Grundlage

Die Routen verwenden Astros `paginate()` in `getStaticPaths()`. Die Seiten entstehen beim
Build. Jede Übersicht rendert ausschließlich `page.data`; der Browser erhält
keine vollständige Beitragsliste als JavaScript-Daten.

- [Astro: Pagination](https://docs.astro.build/en/guides/routing/#pagination)
- [Astro: Nested Pagination](https://docs.astro.build/en/guides/routing/#nested-pagination)
- [Astro: paginate() und Page](https://docs.astro.build/en/reference/routing-reference/#paginate)

Die Seitengröße beträgt **12 Beiträge pro Seite**, einschließlich des
hervorgehobenen Beitrags. `blogPageSize` legt sie zentral für Übersicht und Filter
fest. Sortierung und Behandlung von Entwürfen bleiben bei `getPosts()`.

## Routen

Die Übersichtsdateien verwenden jetzt folgende Routen:

| Bisher                                 | Jetzt                                            |
| -------------------------------------- | ------------------------------------------------ |
| `src/pages/blog/index.astro`           | `src/pages/blog/[...page].astro`                 |
| `src/pages/blog/filter/[filter].astro` | `src/pages/blog/filter/[filter]/[...page].astro` |

Dieselbe Umstellung gilt unter `src/pages/en/blog/`.

`[...page]` erhält die bisherigen URLs für Seite 1:

- Übersicht: `/blog/`, `/blog/2/`, `/blog/3/`
- Filter: `/blog/filter/<filter>/`, `/blog/filter/<filter>/2/`
- Englisch: dieselben Pfade mit `/en/` davor

Die bestehenden Artikelrouten `[...slug].astro` bleiben bestehen. Ein isolierter
Build mit der installierten Astro-Version hat die Kombination aus beiden
Rest-Parametern, verschachtelten Artikeln und Filter-Pagination für DE und EN
bestätigt. Rein numerische Artikel-IDs auf oberster Ebene sind für die Seitennummern
reserviert. `getPosts()` lehnt sie ab, damit Artikel keine Übersichtsseiten überschreiben.

## Daten und Komponenten

1. `getBlogPaths()` lädt die sortierten Beiträge und gibt
   `paginate(posts, { pageSize: blogPageSize, props: { filters } })` zurück.
2. `getBlogFilterPaths()` verwendet das Doku-Beispiel „Nested Pagination“.
   Der Helper ermittelt pro Filter die passenden Beiträge und paginiert sie mit
   `paginate(filteredPosts, { params: { filter: filter.key },
pageSize: blogPageSize, props: { filter, filters } })`. `flatMap()` führt die
   Ergebnisse zusammen.
3. `BlogIndex` erhält die aktuelle `Page<CollectionEntry<"blog">>` und die
   Filterdaten über Props. Die Komponente lädt und filtert nicht erneut alle
   Beiträge. DE und EN verwenden dieselben Helper für die Pfaderzeugung.
4. Die Helper berechnen Filter samt Gesamtzahlen aus dem vollständigen sichtbaren Bestand.
   Ein Filterwechsel oder das Zurücksetzen führt immer auf Seite 1. Das Layout
   der rechten Filterliste bleibt bestehen.

## Darstellung

- Der hervorgehobene erste Beitrag erscheint nur auf Seite 1 der jeweiligen
  Übersicht oder Filterauswahl. Er zählt zu den 12 Beiträgen.
- Ab Seite 2 sind alle Beiträge normale Listeneinträge.
- Auf Seite 1 liegt kein Trenner zwischen hervorgehobenem Beitrag und Liste.
  In der normalen Liste liegen Trenner ausschließlich zwischen den Einträgen.
- Unter der Liste erscheint bei mehreren Seiten eine beschriftete
  `<nav>` mit „Vorherige“, „Seite X von Y“ und „Nächste“, auch auf Englisch.
  Nicht vorhandene Ziele entfallen. Die Links verwenden ausschließlich Astros
  `page.url.prev` und `page.url.next`.
- Die Navigation besteht aus normalen HTML-Links und funktioniert ohne
  zusätzliches JavaScript.

## Metadaten und Discovery

- Jede Seite erhält ihre eigene Canonical-URL; ab Seite 2 ergänzt der Titel die
  Seitennummer. Sprachalternativen erhalten Filter und Seitennummer.
- Öffentliche Übersichtsseiten stehen in der bestehenden Sitemap.
- Filterseiten behalten ihr bestehendes `noindex` und bleiben aus der Sitemap.
- RSS, Markdown-Endpunkte und die vollständige Artikelliste in `llms.txt` werden
  nicht paginiert.

## Prüfung

Die Outputtests in `pnpm validate` prüfen den bestehenden Produktionsbuild.
Optional erzeugt `pnpm test:integration` einen einzigen temporären Fixture-Build
mit 25 veröffentlichten Beiträgen und einem Entwurf. Überlappende Tags bilden
Filter mit 1, 12, 13 und 25 Beiträgen ab. Geprüft werden:

- Passende Seitenzahl, höchstens 12 Einträge pro Seite, stabile Sortierung,
  keine Lücken oder Duplikate.
- Filter mit einer und mehreren Seiten; Gesamtzahlen unabhängig von der Seite;
  Filterwechsel und Zurücksetzen auf Seite 1.
- Beide Oberflächensprachen und Ausschluss von Entwürfen im Produktionsbuild.
- Hervorhebung nur auf Seite 1 und passende Trenner auf Folgeseiten.
- Erzeugte Artikelseiten einschließlich verschachtelter IDs und fehlende
  Builddateien für Seitenzahlen außerhalb des Bestands.
- Canonicals, Sprachalternativen, Seitentitel und Sitemap; die bestehende
  Unterscheidung zwischen Übersichten, Filtern und Artikeln in den SEO-Tests.

Die Beitragsmenge pro HTML-Seite bleibt damit begrenzt. Der Build verarbeitet
weiterhin den vollständigen Bestand und erzeugt mit wachsendem Archiv mehr
Seiten. Die Filterliste enthält weiterhin alle aggregierten Filter und kann mit
zusätzlichen Monaten oder Tags wachsen.
