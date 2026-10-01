# Bildpipeline

`src/assets/hero.jpg` ist die einzige Quelldatei für das Hero-Bild. Sie hat 3332 × 4165 Pixel und einen festen 4:5-Ausschnitt. Diese Datei kann direkt in Photoshop bearbeitet und unter demselben Namen gespeichert werden. Ein erneuter Zuschnitt oder ein Vorbereitungsskript ist nicht nötig.

Der Hero importiert `hero.jpg` in Astros `<Picture />`. Beim Build erzeugt Astro daraus responsive AVIF- und WebP-Dateien sowie einen JPEG-Fallback in `dist/_astro/`. Diese Builddateien werden nicht versioniert. Nach einer Bearbeitung an `hero.jpg` reicht `pnpm validate` aus, um alle Varianten neu zu erzeugen.

## Portfolio

Die aktiven Portfolio-Quellen liegen unter `src/assets/portfolio/`. Beide Sprachversionen lesen diesen Ordner beim Build automatisch ein. Es gibt keine separate Bildliste oder Sortierdatei.

Dateinamen bestimmen Reihenfolge und kurze englische Bildbeschreibung. Zum Beispiel wird `001-bathtub-in-meadow.jpg` als `bathtub in meadow` beschrieben. Für neue Bilder:

1. Das Original außerhalb der aktiven Bildpipeline sichern. `private/photo-backup/` ist bereits von Git ausgeschlossen.
2. Einen fertigen Export mit korrekter Orientierung und möglichst eingebettetem sRGB-Profil ablegen. JPG, JPEG, PNG und WebP werden unterstützt. Vorhandene kleine Exporte dürfen ihre Auflösung behalten.
3. Einen Namen wie `018-short-description.jpg` vergeben. Das numerische Präfix legt die Reihenfolge fest. Bindestriche oder Unterstriche trennen die Wörter der Beschreibung.
4. `pnpm validate` ausführen und beide Portfolio-Seiten prüfen. Für eine andere Reihenfolge die Präfixe umbenennen.

Ungültige Dateinamen und nicht unterstützte Dateien im aktiven Ordner führen zu einem Buildfehler. Doppelte numerische Präfixe erzeugen eine Warnung. Bei gleichem Präfix entscheidet der restliche Dateiname.

Die Originale des ersten Bildsatzes und ein Importprotokoll mit SHA-256-Prüfsummen liegen unter `private/photo-backup/portfolio/`. Vorhandene JPEGs wurden unverändert kopiert. PNGs wurden ohne Größenänderung in JPEG mit Qualität 95 und 4:4:4-Farbabtastung umgewandelt. Vier PNGs hatten kein Farbprofil, hier wurde sRGB angenommen.

Astro erzeugt beim Build ausschließlich optimierte Portfolio-WebP-Dateien in `dist/_astro/`:

- Galerie mit Qualität 85 und Breiten von 320, 480, 640, 960 und höchstens 1280 Pixeln.
- Lightbox mit Qualität 90 und längsten Kanten von 1200, 1800, 2400 und höchstens 3000 Pixeln.
- Alle Varianten bleiben innerhalb der jeweiligen Quellauflösung. Kleinere Quellen werden nicht hochskaliert. Seitenverhältnis und Bildausschnitt bleiben erhalten.

Die Galerie verwendet responsive `srcset`- und `sizes`-Angaben. Die ersten zwei Bilder laden sofort, die übrigen mit nativem Lazy Loading. Große Lightbox-Dateien und der PhotoSwipe-Kern laden erst beim Öffnen, anschließend auch benachbarte Bilder. Die Bildlinks führen auf optimierte Varianten und funktionieren ohne JavaScript.

Die Portfolio-Komponente liest Quelldimensionen über Astros `imageMetadata()` aus den Dateien. Direkter Zugriff auf die importierten Dimensionen würde Astro dazu veranlassen, zusätzlich die Originaldateien im öffentlichen Build zu behalten. Nach Änderungen an diesem Bereich prüfen, dass `dist/_astro/` keine Portfolio-Originale enthält und die ausgelieferten Bilder keine EXIF-, GPS- oder Bearbeitungsmetadaten tragen.
