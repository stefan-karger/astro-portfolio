# Bildpipeline

`src/assets/hero.jpg` ist die einzige Quelldatei für das Hero-Bild. Sie hat 3332 × 4165 Pixel und einen festen 4:5-Ausschnitt. Diese Datei kann direkt in Photoshop bearbeitet und unter demselben Namen gespeichert werden. Ein erneuter Zuschnitt oder ein Vorbereitungsskript ist nicht nötig.

Der Hero importiert `hero.jpg` in Astros `<Picture />`. Beim Build erzeugt Astro daraus responsive AVIF- und WebP-Dateien sowie einen JPEG-Fallback in `dist/_astro/`. Diese Builddateien werden nicht versioniert. Nach einer Bearbeitung an `hero.jpg` reicht `pnpm validate` aus, um alle Varianten neu zu erzeugen.

Kommende Portfolio-Quellen liegen unter `src/assets/portfolio/`. Ihre Bildgrößen und Ladeprioritäten werden erst mit den konkreten Portfolio-Ansichten festgelegt. `docs/` enthält nur diese Anleitung, keine produktiven Bilder.
