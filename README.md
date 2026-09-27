# Halloween Monster

Ein lokales Pass-and-play-Spiel als statische Web-Anwendung. Es benötigt keinen Server und keine Datenbank; der aktuelle Spielstand wird im Browser auf dem verwendeten Gerät gespeichert.

## Umgesetzte Spielfunktionen

- 2 bis 12 Spieler mit frei benannten Allianzen; höchstens drei Mitglieder pro Allianz.
- Mehrere Siegpunkttransfers pro Runde an mehrere Mitglieder derselben Allianz. Der abgebende Spieler behält mindestens einen Punkt.
- Verdeckte Angriffsplanung am gemeinsamen Gerät. Die Ergebnisanzeige nennt nur besiegte Monster, den erfolgreichen Spieler und die Todesursache.
- Drei aktive Monsterplätze, Monsterreserve, Waffen, Beute sowie Wertung nach den dokumentierten Regeln.
- Reset-Schaltfläche „Neue Partie“ in der Kopfzeile mit Sicherheitsabfrage.

## Lokal starten

`index.html` im Browser öffnen. Zum Entwickeln kann ein beliebiger statischer HTTP-Server verwendet werden.

## Auf GitHub Pages veröffentlichen

1. In den Repository-Einstellungen unter **Pages** als Quelle **GitHub Actions** auswählen.
2. Den Workflow `Pages` ausführen lassen. Bei jedem Push auf `main` wird die Web-App erneut veröffentlicht.

Nach der Veröffentlichung ist das Spiel über die Pages-Adresse des Repositorys erreichbar. Spielstände bleiben lokal im Browser des jeweiligen Geräts und werden nicht zwischen Geräten synchronisiert.

## Spielstand

Der Spielstand wird automatisch im lokalen Browserspeicher gesichert. Über „Neue Partie“ kann ein neues Spiel gestartet werden; nach Bestätigung wird der bisherige lokale Spielstand ersetzt.