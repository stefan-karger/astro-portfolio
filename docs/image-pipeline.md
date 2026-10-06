# Bildpipeline

`src/assets/hero.jpg` ist die einzige Quelldatei für das Hero-Bild. Sie hat 3332 × 4165 Pixel und einen festen 4:5-Ausschnitt. Diese Datei kann direkt in Photoshop bearbeitet und unter demselben Namen gespeichert werden. Ein erneuter Zuschnitt oder ein Vorbereitungsskript ist nicht nötig.

Der Hero importiert `hero.jpg` in Astros `<Picture />`. Beim Build erzeugt Astro daraus responsive AVIF- und WebP-Dateien sowie einen JPEG-Fallback in `dist/_astro/`. Diese Builddateien werden nicht versioniert. Nach einer Bearbeitung an `hero.jpg` reicht `pnpm validate` aus, um alle Varianten neu zu erzeugen.

Die JSON-LD-Daten beider Startseiten und aller veröffentlichten Artikel verwenden denselben optimierten JPEG-Fallback mit 840 × 1050 Pixeln und Qualität `high`. `src/lib/structured-data.ts` fordert ihn über Astros `getImage()` an. Astro führt identische Bildtransformationen zusammen, sodass keine zusätzliche Porträtvariante nötig ist.

Die Quelldatei darf nicht im öffentlichen Build erscheinen. Das importierte Bildobjekt wird direkt an `getImage()` übergeben. Direkter Zugriff auf dessen `src` oder Dimensionen außerhalb der Bildpipeline kann Astro veranlassen, das Original zusätzlich zu veröffentlichen. Die SEO-Tests prüfen die gemeinsame URL, die Übereinstimmung mit dem sichtbaren JPEG-Fallback, Format und Dimensionen sowie das Fehlen von EXIF-, XMP- und IPTC-Metadaten. Ein SHA-256-Vergleich über alle Dateien in `dist/` prüft außerdem, dass das Original unter keinem Dateinamen enthalten ist.

## Portfolio

Die aktiven Portfolio-Quellen liegen unter `src/assets/portfolio/`. Beide Sprachversionen lesen diesen Ordner beim Build automatisch ein. Es gibt keine separate Bildliste oder Sortierdatei.

Dateinamen bestimmen die Reihenfolge und den Schlüssel für die Bildübersetzungen. Der beschreibende Teil ohne Nummer und Dateiendung verweist auf `portfolio.imageAlts` in `src/i18n/translations/de.ts` und `en.ts`. Die Texte sind vorerst kurze Motivbezeichnungen aus den Dateinamen: `001-bathtub-in-meadow.jpg` hat den Schlüssel `bathtub-in-meadow`, englisch `bathtub in meadow` und deutsch `Badewanne auf einer Wiese`. Für neue Bilder:

1. Das Original außerhalb der aktiven Bildpipeline sichern. `private/photo-backup/` ist bereits von Git ausgeschlossen.
2. Einen fertigen Export mit korrekter Orientierung und möglichst eingebettetem sRGB-Profil ablegen. JPG, JPEG, PNG und WebP werden unterstützt. Vorhandene kleine Exporte dürfen ihre Auflösung behalten.
3. Einen Namen wie `018-short-description.jpg` vergeben. Das numerische Präfix legt die Reihenfolge fest. Bindestriche oder Unterstriche trennen die Wörter der Beschreibung.
4. Den beschreibenden Dateinamenteil als Schlüssel in beiden `portfolio.imageAlts`-Zuordnungen ergänzen. Englisch die lesbare Dateinamenfassung verwenden, Deutsch sinngemäß übertragen.
5. `pnpm validate` ausführen und beide Portfolio-Seiten prüfen. Für eine andere Reihenfolge die Präfixe umbenennen; die Übersetzungsschlüssel bleiben dabei gleich.

Ungültige Dateinamen, nicht unterstützte Dateien im aktiven Ordner und fehlende Bildübersetzungen führen zu einem Buildfehler. Doppelte numerische Präfixe erzeugen eine Warnung. Bei gleichem Präfix entscheidet der restliche Dateiname.

Die Originale des ersten Bildsatzes und ein Importprotokoll mit SHA-256-Prüfsummen liegen unter `private/photo-backup/portfolio/`.

Astro erzeugt beim Build ausschließlich optimierte Portfolio-WebP-Dateien in `dist/_astro/`:

- Galerie mit Qualität 85 und Breiten von 320, 480, 640, 768, 960 und höchstens 1280 Pixeln.
- Lightbox mit Qualität 90 und längsten Kanten von 1200, 1800, 2400 und höchstens 3000 Pixeln.
- Alle Varianten bleiben innerhalb der jeweiligen Quellauflösung. Kleinere Quellen werden nicht hochskaliert. Seitenverhältnis und Bildausschnitt bleiben erhalten.

Die Galerie verwendet responsive `srcset`- und `sizes`-Angaben. Die 768-Pixel-Variante vermeidet bei 380 CSS-Pixeln und einer Pixeldichte von 1,75 oder 2 den Sprung von 640 auf 960 Pixel. Die ersten zwei Bilder laden sofort mit `fetchpriority="high"`, weil beide je nach Viewport das größte sichtbare Bild sein können. Die übrigen laden mit nativem Lazy Loading.

Große Lightbox-Dateien, der PhotoSwipe-Kern und dessen CSS laden erst beim Öffnen, anschließend auch benachbarte Bilder. Die Lightbox wartet auf den Kern und das CSS, damit sie vollständig gestylt öffnet. Wenn das Laden fehlschlägt, führt der auslösende Bildlink direkt auf die optimierte große Variante. Die Bildlinks funktionieren auch ohne JavaScript.

Die Portfolio-Komponente liest Quelldimensionen über Astros `imageMetadata()` aus den Dateien. Direkter Zugriff auf die importierten Dimensionen würde Astro dazu veranlassen, zusätzlich die Originaldateien im öffentlichen Build zu behalten. Nach Änderungen an diesem Bereich prüfen, dass `dist/_astro/` keine Portfolio-Originale enthält und die ausgelieferten Bilder keine EXIF-, GPS- oder Bearbeitungsmetadaten tragen.
