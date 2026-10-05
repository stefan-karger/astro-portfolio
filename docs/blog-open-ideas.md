# Offene Blog-Erweiterungen

Stand: 2026-10-05. Die offenen Ideen sind zurückgestellt und noch nicht zur Umsetzung eingeplant.

## MDX bei konkretem Komponentenbedarf

MDX ergänzen, sobald ein Beitrag Astro-Komponenten direkt im Text benötigt.
Dann die Astro-Integration und den Collection-Loader um `.mdx` erweitern.
Normale Beiträge können weiterhin als `.md` geschrieben werden.

## Mermaid-Diagramme, umgesetzt

Mermaid-Fences ergänzen die vorhandenen Shiki-Codeblöcke. Die Bibliothek wird auf
Artikeln mit Diagrammen dynamisch geladen. Die Definition bleibt aufklappbar und
kopierbar. Der zweite Teil von "Astro für Entwicklerblogs" dokumentiert die
Integration und zeigt Flowcharts, Sequenz-, Zustands- und ER-Diagramme.

## Dark Mode für die Website

Shiki erzeugt bereits die Farbvariablen für `github-dark`. Die Website bleibt hell.
Für die Aktivierung zuerst die Umschaltung und den Umgang mit der Systemeinstellung
festlegen. Danach die Tailwind-Farben der Website sowie Codeflächen, Rahmen und
Twoslash-Popups aufeinander abstimmen.

## Filter für die Blogübersicht

Eine Filteroberfläche für Tags, Inhaltssprache und Veröffentlichungsdatum ergänzen.
Diese Daten liegen bereits in der gemeinsamen Collection vor; kommaseparierte Tags
werden beim Laden normalisiert.

Vor der Umsetzung das Verhalten kombinierter Filter, die Datumsauswahl und eine
mögliche Speicherung der Auswahl in der URL festlegen. Beide Sprachübersichten
sollen weiterhin dieselbe Collection verwenden.
