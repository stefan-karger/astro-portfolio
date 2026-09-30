# Datenschutz

Stand: 30.09.2026. Die vereinbarte Website-Fassung ist im Repository umgesetzt.
Die Einstellungen bei den Anbietern und der Abgleich mit Netlify stehen noch aus.

## Umsetzung

Die deutschen und englischen Datenschutzseiten beschreiben Netlify als Hoster,
den direkten E-Mail-Betrieb über STRATO und Telefonie mit satellite Free ohne
Voicemail, Aufzeichnungen, Abschriften oder KI-Zusammenfassungen.

Gewöhnliche Anfragen und gesendete Antworten werden nach abschließender
Bearbeitung einschließlich Papierkorb gelöscht. Noch benötigte oder gesetzlich
aufzubewahrende Unterlagen bleiben erhalten. Die Wiederherstellung gelöschter
Nachrichten bei STRATO ist davon getrennt beschrieben.

Vollständige Anschrift und Kontaktdaten stehen im Impressum der jeweiligen Sprache.
Die Datenschutzseiten verweisen darauf. Die Rechtstextseiten verwenden die
Titeltypografie des Portfolios, eine zentrierte Textspalte und größere Titelabstände.
Seitentitel sind ab 640 Pixeln zentriert und darunter linksbündig zum Text.
Zwischenüberschriften verwenden Monospace, Links den üblichen Website-Stil.

Die Texte liegen in [datenschutz.astro](../src/pages/datenschutz.astro) und
[privacy-policy.astro](../src/pages/en/privacy-policy.astro). App-spezifische
Datenschutzerklärungen bleiben ein separates Vorhaben.

## Vor Veröffentlichung prüfen

- [ ] Die Gmail-Weiterleitung bei STRATO ist abgeschaltet. Antworten werden über
      `kontakt@stefan-karger.de` versendet. Die Löschregel gilt auch für etwaige
      frühere Gmail-Kopien.
- [ ] satellite ist freigeschaltet. Voicemail, Abschriften und KI-Zusammenfassungen
      sind soweit verfügbar deaktiviert; die tatsächliche Konfiguration stimmt
      mit dem Telefonabschnitt überein.
- [ ] Die Aufbewahrung oder belastbare Löschkriterien für technische Zugriffs- und
      Sicherheitsdaten bei Netlify Legacy Free sind anhand der Vertragsunterlagen
      oder einer Anbieterauskunft geklärt. Fristen für Function Logs und
      Credit-based Observability belegen dies nicht. Im Text ist keine feste
      Netlify-Log-Frist behauptet.
- [ ] Der aktuelle Netlify-Build wurde in beiden Sprachen mit der lokalen Fassung
      abgeglichen. Die Deploy-Preview-URL für diesen Stand fehlt bisher.

## Prüfung des Repository-Builds

`pnpm validate` war erfolgreich. Nach den letzten Layout-Anpassungen wurden
Formatierung und Produktions-Build erneut geprüft. Alle vier Rechtstextseiten
wurden bei 1280 und 390 Pixeln ohne horizontalen Überlauf geprüft, einschließlich
Sprachwechsel, Impressumsverweisen und Linkstil.

Auf den lokal ausgelieferten Start-, Portfolio- und Rechtstextseiten DE/EN kamen
die geladenen Ressourcen vom eigenen Host. Cookies, Local Storage und Session
Storage waren leer, auch beim Öffnen, Weiterschalten und Schließen der Galerie.
Die Galerie verwendet den Browserverlauf. Der Netlify-Abgleich bleibt offen.

## Anbieterunterlagen

- [STRATO: Vereinbarung zur Auftragsverarbeitung](https://www.strato.de/agb/avv/)
- [STRATO: Wiederherstellung gelöschter E-Mails](https://www.strato.de/faq/mail/wie-kann-ich-meine-geloeschten-e-mails-wiederherstellen/)
- [Netlify: Self-Serve Subscription Agreement](https://www.netlify.com/pdf/self-serve-subscription-agreement.pdf/)
- [Netlify: Data Processing Agreement](https://www.netlify.com/pdf/netlify-dpa.pdf)
- [Netlify: Observability und Verfügbarkeit nach Tarif](https://docs.netlify.com/manage/monitoring/observability/overview/)
- [satellite: Datenschutz](https://www.satellite.me/datenschutz/)
