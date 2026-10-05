# SEO für beide Namen

## Befund vom 5. Oktober 2026

Die öffentliche Startseite nennt weder im Titel noch im sichtbaren Hauptinhalt
„Stefan Eideloth-Karger“. Im Repository steht der vollständige Name bislang nur
auf den Legal-Seiten, die `noindex, follow` verwenden. Das kann die Zuordnung
der Startseite zur Suche nach dem vollständigen Namen erschweren. Ohne Daten aus
Google Search Console lässt sich der genaue Grund für die Platzierung nicht
feststellen.

Die öffentliche Startseite enthält keine strukturierten Daten. `/sitemap.xml` und
`/robots.txt` antworten zum Prüfzeitpunkt mit HTTP 404. Eine fehlende `robots.txt`
verhindert das Crawlen nicht; eine Sitemap hilft bei der Entdeckung der Seiten.

## Änderungen im Repository

- „Stefan Karger“ bleibt die Marke für alle öffentlichen Inhalte außerhalb der
  Legal-Seiten, einschließlich Seitentiteln, Beschreibungen, Linkvorschauen und
  Alt-Texten. Die Begrüßung und das Layout bleiben wie bisher.
- Beide Startseiten enthalten JSON-LD mit `WebSite`, `ProfilePage` und `Person`.
  `Person.name` enthält den vollständigen Namen, `alternateName` den Kurznamen.
  `sameAs` verweist auf die bereits verlinkten persönlichen Profile. Beide
  Sprachversionen verwenden dieselbe Personen-ID und das vorhandene Porträt.
  `WebSite.name` bleibt „Stefan Karger“ und erhält keinen alternativen Website-Namen.
  Auch Titel und Beschreibung von `ProfilePage` verwenden die Marke.
  Der vollständige Name steht außerhalb der Legal-Seiten ausschließlich in
  `Person.name`. JSON-LD rendert keinen sichtbaren Text auf der Seite. Google kann
  diese Daten jedoch für Suchdarstellungen verwenden; ihre Unsichtbarkeit in
  Suchergebnissen lässt sich nicht garantieren.
- Astro erzeugt `/sitemap.xml` und `/robots.txt` beim Build, ohne neue Abhängigkeit
  oder clientseitiges JavaScript. Die Sitemap enthält beide Startseiten,
  Fotografie- und Blogübersichten sowie veröffentlichte Artikel in ihrer
  kanonischen Inhaltssprache. Legal-Seiten, Entwürfe, Weiterleitungen und
  zusätzliche Artikel-Oberflächensprachen bleiben außen vor.

## Nach Veröffentlichung

1. In [Google Search Console](https://search.google.com/search-console) die
   Domain-Property für `stefan-karger.de` bestätigen, falls noch nicht vorhanden.
   `/sitemap.xml` einreichen. Beide Startseiten mit der URL-Prüfung kontrollieren
   und eine erneute Indexierung anfordern. Auf erfolgreiche Live-Prüfung und die
   von Google gewählte Canonical achten.
2. Die Startseite mit dem
   [Rich Results Test](https://search.google.com/test/rich-results) auf lesbare
   Profildaten prüfen. Strukturierte Daten garantieren weder eine besondere
   Darstellung noch eine bessere Platzierung.
3. Auf LinkedIn und GitHub die aktuelle Website als persönliche Website
   hinterlegen. Vorhandene Profile mit dem vollständigen Namen verbinden damit
   die Person mit der aktuellen Website. Wo ein Linktext frei wählbar ist, die
   Marke „Stefan Karger“ verwenden.
4. Auf `e-k-fotos.de` einen sichtbaren Link zur aktuellen Website ergänzen, wenn
   die alte Fotografie-Seite weiter bestehen soll. Wenn sie vollständig abgelöst
   wird, dauerhafte HTTP-Weiterleitungen von jeder alten Seite zum passenden
   neuen Inhalt einrichten. Fotografie-Seiten führen zur Fotografie, die alte
   Startseite zur passenden neuen Startseite. Keine pauschale Weiterleitung aller
   URLs zur Homepage und keine Canonical zwischen unterschiedlichen Inhalten.
5. In Search Console die Suchanfragen „Stefan Karger“ und
   „Stefan Eideloth-Karger“ getrennt beobachten. Impressionen, Klicks und
   durchschnittliche Position über mehrere Wochen vergleichen. Eine einzelne
   Google-Ergebnisseite hängt auch von Standort und Personalisierung ab.

Diese Änderungen müssen zunächst veröffentlicht und erneut gecrawlt werden.
Eine Platzierung auf der ersten Seite lässt sich nicht versprechen. Die Schritte
für Search Console und andere Websites benötigen Zugriff auf die jeweiligen
Konten und sind durch die Codeänderungen noch nicht erledigt.

## Quellen

- [Google: Titel und sichtbare Überschriften](https://developers.google.com/search/docs/appearance/title-link)
- [Google: ProfilePage, Namen und externe Profile](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Google: Sitemaps erstellen und einreichen](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: Dauerhafte Weiterleitungen](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
