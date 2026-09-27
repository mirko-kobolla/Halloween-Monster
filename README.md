# Halloween Monster

Ein lokales Pass-and-play-Spiel als statische Web-Anwendung. Es benötigt keinen Server und keine Datenbank; der aktuelle Spielstand wird im Browser auf dem verwendeten Gerät gespeichert.

## Bereits umgesetzt

- 2 bis 12 Spieler; frei benannte Allianzen mit höchstens drei Mitgliedern.
- Mehrere Punktetransfers pro Runde an Mitglieder derselben Allianz; der Abgeber behält mindestens einen Siegpunkt.
- Drei aktive Monsterplätze und eine Vorschau der nächsten bis zu drei Reserve-Monster.
- Geheime Angriffsplanung; öffentlich werden nur Tötungen mit Spieler und Todesursache angezeigt.
- Waffen, Beute, Monster-Nachrücken und lokale Speicherung.
- Reset über „Neue Partie“ in der Kopfzeile.

## Lokal starten

`index.html` im Browser öffnen. Zum Entwickeln kann ein beliebiger statischer HTTP-Server verwendet werden.

## Auf GitHub Pages veröffentlichen

1. In den Repository-Einstellungen unter **Pages** als Quelle **GitHub Actions** auswählen.
2. Den Workflow `Pages` ausführen lassen. Bei jedem Push auf `main` wird die Web-App erneut veröffentlicht.

Nach der Veröffentlichung ist das Spiel über die Pages-Adresse des Repositorys erreichbar. Spielstände bleiben lokal im Browser des jeweiligen Geräts und werden nicht zwischen Geräten synchronisiert.

## Spielstand

Der Spielstand wird automatisch im lokalen Browserspeicher gesichert. Über „Neue Partie“ in der Kopfzeile kann ein neues Spiel gestartet werden; nach Bestätigung wird der bisherige lokale Spielstand ersetzt.