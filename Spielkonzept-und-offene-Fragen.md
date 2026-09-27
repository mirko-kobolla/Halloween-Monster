# Halloween Monster – Spielkonzept und offene Fragen

Dieses Dokument beschreibt, wie ich die Spielidee und die technische Umsetzung derzeit verstehe. Es ist keine Änderung der ursprünglichen Regeln, sondern eine Gesprächsgrundlage. Punkte im Abschnitt **Offene Fragen** müssen vor oder während der Programmierung geklärt werden.

## 1. Grundidee

Mehrere Spieler kämpfen auf einem Schlachtfeld gegen Monster. Durch erfolgreiche tödliche Angriffe erhalten sie Siegpunkte und Beute. Die Spieler können sich vor Spielbeginn zu Allianzen zusammenschließen.

Die Anwendung soll zunächst als lokales Spiel auf einem gemeinsamen Bildschirm funktionieren. Alle Spieler sitzen gemeinsam am Gerät. Persönliche Eingaben werden nacheinander im sogenannten Pass-and-play-Verfahren gemacht, damit die anderen Spieler sie möglichst nicht sehen.

Die erste Version soll 2 bis 12 Spieler unterstützen und zunächst mit einer festen Monsterliste arbeiten.

## 2. Spielvorbereitung

Vor dem eigentlichen Spiel:

- Alle Spieler werden mit Namen erfasst.
- Jeder Spieler startet mit 5 Siegpunkten.
- Jeder Spieler erhält einen Dolch als Grundwaffe.
- Spieler dürfen sich zu Allianzen zusammenschließen.
- Eine Allianz darf höchstens 3 Mitglieder haben.
- Ein Spieler darf nur zu einer Allianz gehören.
- Nach der Bestätigung dürfen Allianzen weder aufgelöst noch verändert werden.
- Das Schlachtfeld und die Monsterziele werden bekanntgegeben.

In der Anwendung stelle ich mir dafür eine eigene Vorbereitungsphase vor:

1. Spielernamen eingeben.
2. Allianzen festlegen.
3. Allianzbestätigung sperren.
4. Monsterreserve und Schlachtfeld anzeigen.
5. Die erste Runde beginnen.

## 3. Spieler und Besitz

Ein Spieler besitzt mindestens:

- einen Namen,
- aktuelle Siegpunkte,
- eine Allianz oder keine Allianz,
- den dauerhaft verfügbaren Dolch,
- eventuell Spezialwaffen,
- erhaltene Beute,
- eine Information darüber, ob er in der aktuellen Runde bereits angegriffen hat.

Der Dolch ist keine Einwegkarte. Er darf in jeder Runde erneut verwendet werden und kehrt nach dem Angriff zum Spieler zurück.

Spezialwaffen sind dagegen Verbrauchskarten. Nach ihrer Verwendung werden sie abgegeben. Spezialwaffen dürfen außerdem zwischen Spielern getauscht oder weitergegeben werden.

## 4. Rundenablauf

Eine Runde besteht nach meinem Verständnis aus diesen Phasen:

### 4.1 Siegpunkte übertragen

Vor den Angriffen dürfen Spieler Siegpunkte untereinander übertragen.

Dabei gilt:

- Ein Transfer ist nur zwischen Mitgliedern derselben Allianz erlaubt.
- Jeder Spieler muss nach seinem Transfer mindestens einen Siegpunkt behalten.
- Transfers finden nur während dieser Phase statt.
- Nach Ende der Phase sind keine weiteren Transfers für diese Runde möglich.

### 4.2 Angriffsreihenfolge bestimmen

Nach den Transfers wird die Reihenfolge festgelegt:

- Der Spieler mit den meisten Siegpunkten beginnt.
- Danach folgen die übrigen Spieler in absteigender Reihenfolge ihrer Siegpunkte.
- Bei gleicher Punktzahl wird die Reihenfolge zufällig ausgelost.
- Die ermittelte Reihenfolge gilt für die Angriffe der Runde.

### 4.3 Angriffe auswählen

Jeder Spieler muss genau einen Angriff für die Runde auswählen. Der Angriff darf nicht ausfallen.

Ein Angriff besteht aus:

- einer Zielposition auf dem Schlachtfeld,
- einer Waffenkarte,
- eventuell einem zweiten Ziel bei den gekreuzten Schwertern.

Nur Ziele innerhalb der markierten Doppellinie dürfen angegriffen werden.

In der Anwendung gibt jeder Spieler seinen Angriff einzeln ein. Danach wird die Eingabe verborgen, bis alle Spieler ihre Angriffe festgelegt haben.

### 4.4 Angriffe automatisch ausführen

Nach der Auswahl aller Angriffe werden sie automatisch in der festgelegten Reihenfolge ausgeführt.

Während eines normalen Angriffs sollen die folgenden Informationen verborgen bleiben:

- welches Monster tatsächlich angegriffen wurde,
- wie viele Lebenspunkte das Monster noch hat,
- welcher Spieler angegriffen hat,
- welche Waffe verwendet wurde.

Wenn ein Monster stirbt, werden öffentlich bekanntgegeben:

- welches Monster gestorben ist,
- welcher Spieler den tödlichen Angriff ausgeführt hat,
- welche Siegpunkte vergeben werden,
- welche Beute vergeben wird.

### 4.5 Runde beenden

Eine Runde endet, sobald alle Spielerangriffe ausgeführt wurden. Danach beginnt wieder die Phase für Siegpunkte und Transfers.

## 5. Schlachtfeld und Monster

Das Schlachtfeld ist durch eine Doppellinie begrenzt. Nur Monster innerhalb dieser Linie sind gültige Ziele.

Ich würde das Schlachtfeld zunächst als nummerierte Positionen darstellen. Jede Position enthält ein Monster. Die Monsterpositionen bleiben während einer Runde sichtbar, während geheime Angriffsdetails verborgen werden.

Jedes Monster besitzt:

- einen Namen,
- eine maximale Lebenspunktzahl,
- aktuelle Lebenspunkte,
- einen Siegpunktwert,
- eine Beute,
- eventuell besondere Zustände oder Effekte.

Die Lebenspunkte eines Monsters entsprechen zu Beginn seinem Siegpunktwert. In der Anzeige wird das beispielsweise als Herz mit einer Zahl dargestellt.

Wenn ein Monster stirbt:

1. Der tödliche Spieler erhält die Siegpunkte und Beute.
2. Das Monster wird vom Schlachtfeld entfernt.
3. Das am weitesten links stehende Monster aus der Reserve rückt nach.
4. Die Reserve wird dadurch kleiner.
5. Bereits geplante Angriffe auf diese Position sollen nach der ursprünglichen Beschreibung gegen das neue Monster ausgeführt werden.

## 6. Waffen

### Dolch

- Grundwaffe jedes Spielers.
- Stärke 3.
- Verursacht sofort 3 Schaden.
- Kann in jeder Runde erneut verwendet werden.
- Wird nicht verbraucht.

### Gift

- Spezialwaffe.
- Stärke 1.
- Verursacht zunächst 1 Schaden.
- Danach verliert das betroffene Monster nach jedem Zug 1 weiteren Lebenspunkt, bis es stirbt.
- Wird nach dem Ausspielen abgegeben.

### Eis

- Spezialwaffe.
- Stärke 3.
- Verursacht zunächst 3 Schaden.
- Weitere Angriffe anderer Spieler können dem betroffenen Monster zunächst keinen Schaden zufügen.
- Dieser Schutz endet, wenn der Spieler, der die Eiskarte ausgespielt hat, wieder an der Reihe ist.
- Wird nach dem Ausspielen abgegeben.

### Gekreuzte Schwerter

- Spezialwaffe.
- Gesamtstärke 4.
- Gegen ein Monster: 4 Schaden.
- Gegen zwei Monster: jeweils 2 Schaden.
- Wird nach dem Ausspielen abgegeben.

### Granate

- Spezialwaffe.
- Stärke 6.
- Verursacht bei dem Zielmonster 6 Schaden.
- Wird nach dem Ausspielen abgegeben.

### Dynamit

- Spezialwaffe.
- Stärke 10.
- Der Schaden wird nicht sofort angewendet.
- Das Zielmonster erhält den Schaden erst, wenn der Spieler, der das Dynamit verwendet hat, das nächste Mal an der Reihe ist.
- Wird nach dem Ausspielen abgegeben.

## 7. Schaden und Tod

Ein Angriff zieht die Stärke der Waffe von den aktuellen Lebenspunkten des Zielmonsters ab.

Wenn die Waffenstärke größer als die verbleibenden Lebenspunkte ist:

- Das Monster stirbt.
- Überschüssige Schadenspunkte verfallen.
- Der tödliche Angriff wird dem ausführenden Spieler zugeordnet.
- Dieser Spieler erhält die Belohnung.

Ein Monster mit 0 Lebenspunkten gilt als tot und darf nicht weiter als lebendes Ziel behandelt werden.

## 8. Spielende und Gewinner

Das Spiel endet, sobald alle Monster aus der Reserve getötet wurden und keine weiteren Monster mehr nachrücken können.

Danach werden die Siegpunkte der Mitglieder jeder Allianz addiert. Die Summe wird durch die Anzahl der Allianzmitglieder geteilt. Dadurch erhält jedes Allianzmitglied denselben berechneten Endwert.

Der Spieler mit dem höchsten Endwert gewinnt.

Die Endwerte werden auf eine Dezimalstelle genau berechnet.

## 9. Geplante technische Struktur

Die Oberfläche soll nicht selbst die Regeln berechnen. Stattdessen soll die Anwendung aus drei Bereichen bestehen:

### Spielmodelle

Mögliche Klassen:

- `Spieler`
- `Allianz`
- `Monster`
- `Waffe`
- `Angriff`
- `Spielrunde`
- `Spielzustand`

### Regel- und Spielservice

Dieser Bereich soll unter anderem übernehmen:

- Spielstart und Eingabevalidierung,
- Allianzregeln,
- Punktetransfers,
- Reihenfolgebestimmung,
- Angriffvalidierung,
- Schadensberechnung,
- Spezialeffekte,
- Monsterersatz,
- Belohnungen,
- Endwertung.

### WPF-Oberfläche

Die Oberfläche soll die aktuelle Phase anzeigen und Eingaben ermöglichen:

- Spielerlobby,
- Allianzbildung,
- Schlachtfeld,
- eigene Waffen und Beute,
- Punktetransfers,
- geheime Angriffseingabe,
- öffentliche Kampfergebnisse,
- Gewinneranzeige.

Die Regelklassen sollen unabhängig von WPF testbar sein. Dadurch können wir die Spielregeln prüfen, ohne jedes Mal die grafische Oberfläche bedienen zu müssen.

## 10. Offene Fragen

Diese Punkte sind aus der Beschreibung noch nicht eindeutig genug und müssen entschieden werden:

### Schlachtfeld

1. Wie viele Monsterpositionen sind gleichzeitig auf dem Schlachtfeld sichtbar?
2. Wie viele Monster befinden sich insgesamt in der Reserve?
3. Gibt es eine feste Anzahl von Positionen oder soll sie einstellbar sein?
4. Was genau bedeutet die Doppellinie in der digitalen Darstellung?
5. Können Monsterpositionen von Spielern frei gewählt werden oder haben sie feste Nummern?

### Monster

6. Welche Monster gehören endgültig zur ersten Version?
7. Welche Siegpunktwerte und Lebenspunkte haben die einzelnen Monster?
8. Welche konkrete Beute gibt jedes Monster?
9. Haben Monster eigene Spezialfähigkeiten oder nur Lebenspunkte, Siegpunkte und Beute?
10. Darf ein Monster angegriffen werden, wenn es bereits 0 Lebenspunkte hat, aber noch nicht aus der Runde entfernt wurde?

### Spieler und Allianzen

11. Sind Allianzen mit nur einem Spieler erlaubt?
12. Müssen alle Spieler einer Allianz angehören?
13. Darf ein Spieler Siegpunkte an mehrere Allianzmitglieder verteilen?
14. Darf ein Spieler in einer Runde mehrere Transfers durchführen?
15. Werden die Punkte für die Angriffsreihenfolge vor oder nach bestimmten automatischen Effekten berechnet?

### Angriffe

16. Muss jeder Spieler genau eine Waffenkarte spielen, auch wenn er keine Spezialwaffe mehr besitzt?
17. Darf ein Spieler mit dem Dolch ein Monster angreifen, das durch Eis geschützt ist?
18. Sind mehrere Angriffe auf dasselbe Monster in derselben Runde erlaubt?
19. Was geschieht, wenn ein früher Angriff ein Monster tötet und spätere Angriffe dieselbe Position als Ziel haben?
20. Werden geplante Angriffe tatsächlich immer auf das nachgerückte Monster übertragen oder werden sie verworfen?
21. Werden Angriffe auf ein inzwischen totes Monster trotzdem als ausgeführter Angriff gezählt?

### Gift

22. Wird der Giftschaden am Ende jedes Spielerzugs, am Ende jeder Runde oder vor dem nächsten Angriff angewendet?
23. Wem wird ein Tod durch Giftschaden zugerechnet?
24. Erhält der Spieler, der das Gift gespielt hat, die Belohnung auch dann, wenn ein anderer Effekt den letzten Lebenspunkt entfernt?
25. Kann ein Monster gleichzeitig von mehreren Giftkarten betroffen sein?

### Eis

26. Beginnt die Schutzwirkung nach dem Eisschaden sofort oder erst beim nächsten Angriff?
27. Gilt der Schutz nur für Angriffe anderer Spieler in derselben Runde?
28. Was passiert, wenn der Eisspieler durch die Reihenfolge erst spät oder zuletzt angreift?
29. Endet der Schutz vor oder nach dem Angriff des Eisspielers in der nächsten Runde?

### Gekreuzte Schwerter

30. Wie wählt der Spieler die zwei Ziele aus?
31. Was passiert, wenn eines der beiden Ziele zwischen Auswahl und Auflösung stirbt?
32. Darf die Karte auch nur auf ein Ziel gespielt werden, wenn kein zweites gültiges Ziel vorhanden ist?

### Dynamit

33. Wann genau beginnt die Wartezeit für das Dynamit?
34. Wird der Schaden beim nächsten Zug des Spielers vor oder nach dessen neuem Angriff ausgeführt?
35. Was passiert, wenn das Zielmonster vorher durch einen anderen Angriff stirbt?
36. Wem wird ein Tod durch Dynamit zugerechnet?
37. Kann ein Spieler mehrere verzögerte Dynamit-Effekte gleichzeitig besitzen?

### Sieg und Gleichstand

38. Wie wird bei gleicher Endpunktzahl entschieden?
39. Werden Beute und Spezialwaffen bei der Endwertung berücksichtigt?
40. Werden Allianzpunkte vor der Teilung auf eine Dezimalstelle gerundet oder erst danach?
41. Welche Rundungsregel soll gelten, wenn die dritte Dezimalstelle eine 5 ist?
42. Was passiert mit Spielern ohne Allianz bei der Endwertung?

### Bedienung und Geheimhaltung

43. Soll nur ein Spielleiter klicken oder soll jeder Spieler seine Eingaben selbst machen?
44. Reicht das Verbergen der Ansicht beim Pass-and-play aus, oder soll zusätzlich ein Passwort/PIN verwendet werden?
45. Sollen Spieler ihre eigenen Siegpunkte und Waffen jederzeit sehen können?
46. Welche Informationen dürfen während der Runde öffentlich angezeigt werden?
47. Soll die Anwendung einen Spielstand speichern und später fortsetzen können?
48. Soll es eine Zurück-Funktion für Fehleingaben geben?

## 11. Sinnvolle erste Entscheidungen

Für den ersten spielbaren Prototypen würde ich zunächst diese Regeln festlegen:

- 2 bis 12 Spieler.
- Gemeinsamer Bildschirm mit Pass-and-play.
- Genau ein Monster pro nummerierter Schlachtfeldposition.
- Feste Anzahl sichtbarer Positionen.
- Feste Monsterreserve aus der vorhandenen Monsterliste.
- Genau ein Angriff pro Spieler und Runde.
- Der Dolch ist immer verfügbar; Spezialwaffen werden verbraucht.
- Eine einfache, eindeutige Reihenfolge für Gift, Eis und Dynamit wird festgelegt und als Regel dokumentiert.
- Bei einem Monster-Tod rückt sofort das nächste Reserve-Monster an die Position nach.
- Eine Punktgleichheit beim Gewinner wird zunächst als Unentschieden angezeigt, bis eine zusätzliche Entscheidung getroffen wird.

Sobald diese Punkte geklärt sind, kann die Spiellogik zuverlässig implementiert und anschließend die Oberfläche darum gebaut werden.

## 12. Antworten auf die offenen Fragen

Die folgenden Antworten beziehen sich auf die Nummern im Abschnitt **Offene Fragen**. Noch nicht abschließend entschiedene Punkte sind entsprechend gekennzeichnet.

1. Drei Monsterpositionen sind gleichzeitig sichtbar.
2. Insgesamt befinden sich neun Monster in der Reserve.
3. Die Anzahl der Positionen ist fest.
4. Die Monster waren als virtuelle Karten gedacht; die Reserve soll durch das Schlachtfeld abgegrenzt werden.
5. Nein, die Positionen werden nicht frei von den Spielern gewählt.
6. Die Monster der ersten Version sind: Mumie, Kürbis, Medusa, Vampir, Baum, Sensenmann, Teufel, Hexe und Werwolf.
7. Die angegebenen Werte sind: Mumie 7, Kürbis 5, Medusa 15, Vampir 6, Baum 9, Sensenmann 16, Teufel 10, Hexe 15 und Werwolf 9. Laut Grundregel entsprechen die Lebenspunkte zu Beginn dem Siegpunktwert.
8. Die Beute der Monster ist:
	- Mumie: Gift und Granate.
	- Kürbis: Gift.
	- Medusa: Taler.
	- Vampir: Granate.
	- Baum: Eis und gekreuzte Schwerter.
	- Sensenmann: gekreuzte Schwerter, Granate und Taler.
	- Teufel: Eis und Dynamit.
	- Hexe: Dynamit und Taler.
	- Werwolf: Granate.
9. Nein, Monster haben keine eigenen Spezialfähigkeiten.
10. Nein. Bei 0 Lebenspunkten ist ein Monster tot.
11. Ja.
12. Ja.
13. Ja. Ein Spieler darf Siegpunkte an mehrere Mitglieder derselben Allianz übertragen.
14. Ja. Dafür sind mehrere Transfers pro Runde erlaubt. Der abgebende Spieler muss mindestens einen Siegpunkt behalten.
15. Vor den Angriffen.
16. Ja. Falls keine Spezialwaffe mehr vorhanden ist, wird der Dolch verwendet.
17. Ja, der Angriff hat dann aber keine Wirkung.
18. Ja.
19. Der Angriff trifft das Monster, das aus der Reserve nachrückt.
20. Angriffe werden immer auf das nachrückende Monster übertragen. Hat es weniger Lebenspunkte als die Waffenstärke, verfällt der überschüssige Schaden.
21. Stirbt das Monster vor dem Angriff, wird das nachrückende Monster angegriffen.
22. Am Ende jedes Angriffs eines Spielers.
23. Der Tod wird dem Spieler zugerechnet, der an der Reihe war, als das Monster starb.
24. Nein; maßgeblich ist die Antwort auf Frage 23.
25. Nein.
26. Das Monster verliert zuerst 3 Lebenspunkte; anschließend beginnt die Schutzwirkung.
27. Die Schutzwirkung beginnt nach dem Eisschaden und endet, wenn der Spieler wieder an der Reihe ist, unmittelbar vor seinem Angriff.
28. Die Reihenfolge bleibt unverändert. Die Eiswirkung endet erst vor dem Angriff des Eisspielers.
29. Vor dem Angriff des Eisspielers.
30. Der Spieler wählt zwei Ziele; jedes Ziel verliert 2 Lebenspunkte.
31. Tötet der Spieler mit den gekreuzten Schwertern eines oder beide Monster, erhält er die Beute und Siegpunkte der getöteten Monster.
32. Ja. Die Schwerter können auf Wunsch auf ein Ziel gerichtet werden und verursachen dort 4 Schaden.
33. Das Dynamit wird wirksam, wenn der Spieler, der es gespielt hat, wieder an der Reihe ist.
34. Vor dem neuen Angriff des Spielers.
35. Stirbt das Ziel vorher, verfällt das Dynamit.
36. Der Tod wird dem Spieler zugerechnet, der das Dynamit platziert hat.
37. Ja.
38. Bei Gleichstand gibt es ein Unentschieden.
39. Noch offen. Als vorläufige Regel werden Beute und Spezialwaffen vermutlich nicht berücksichtigt.
40. Nach dem Zusammenzählen der Punkte einer Allianz werden diese durch die Anzahl ihrer Mitglieder geteilt; der Durchschnitt wird auf eine Dezimalstelle berechnet.
41. Standardmäßig wird aufgerundet.
42. Spielt ein Spieler allein, entsprechen seine Siegpunkte am Ende seinem Endwert.
43. Jeder Spieler soll seine Eingaben selbst machen. Das iPad wird in der Klasse herumgegeben und soll mit der elektrischen Tafel verbunden werden; während geheimer Eingaben soll die Tafel eingefroren werden.
44. Ein PIN ist nicht erforderlich.
45. Beim Transfer soll der aktuelle Spielstand des Spielers angezeigt werden.
46. Angezeigt werden dürfen die Reihenfolge der Monster und Spieler sowie deren Siegpunkte. Bei Monstern wird der maximale Siegpunktwert angezeigt.
47. Das Speichern und spätere Fortsetzen eines Spielstands kann noch erwogen werden.
48. Ja, eine Zurück-Funktion könnte bei Fehleingaben helfen.

## 13. Umsetzungsstand

Die erste Web-Version ist als statische Pass-and-play-Anwendung umgesetzt und über GitHub Pages erreichbar. Der aktuelle Stand umfasst:

- Eine Spielerlobby für 2 bis 12 Spieler mit frei benannten Allianzen; jede Allianz darf höchstens drei Mitglieder haben.
- Mehrere Punktetransfers pro Runde an unterschiedliche Mitglieder derselben Allianz. Der Abgeber muss mindestens einen Siegpunkt behalten.
- Drei aktive Monsterplätze. Unter dem Schlachtfeld werden die nächsten bis zu drei Monster aus der Reserve in ihrer Reihenfolge angezeigt.
- Verdeckte Angriffsplanung auf einem gemeinsamen Gerät. In der Ergebnisansicht erscheinen nur besiegte Monster, der erfolgreiche Spieler und die Todesursache; normale Treffer bleiben verborgen.
- Dolch und Spezialwaffen, Monsterbeute, Nachrücken aus der Reserve, Gift, Eis und verzögertes Dynamit.
- Lokale Speicherung des Spielstands im Browser sowie eine Reset-Schaltfläche „Neue Partie“ mit Bestätigungsabfrage.

Der Spielstand wird nicht zwischen Geräten synchronisiert. Eine Zurück-Funktion für Fehleingaben und die Einbeziehung der Beute in die Endwertung sind weiterhin offen.
