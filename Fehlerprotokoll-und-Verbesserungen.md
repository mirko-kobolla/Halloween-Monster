# Fehlerprotokoll und Verbesserungen

Dieses Dokument sammelt beobachtete Fehler und gewünschte Änderungen am Spiel. Die Einträge beschreiben zunächst das gemeldete Verhalten und das gewünschte Ziel. Die technische Ursache wird erst ergänzt, wenn sie im Code nachvollzogen wurde.

## 1. Monster erscheinen mehrfach

**Gemeldetes Problem**

Monster kommen im Spiel mehrmals vor. Dadurch kann die Partie je nach wiederholtem Monster schwieriger oder leichter werden.

**Gewünschtes Verhalten**

Die Monster sollen in genau der Reihenfolge erscheinen, in der sie in der ursprünglichen Monsterliste angegeben wurden. Jedes Monster soll grundsätzlich nur einmal in einer Partie vorkommen.

**Vorschlag**

Die Monster werden als geordnete Reserve geführt. Wenn ein Monster vom Schlachtfeld entfernt wird, rückt das nächste Monster aus der Reserve nach. Bereits besiegte Monster werden nicht wieder in die Reserve gelegt und die Liste wird nicht zufällig neu gemischt.

**Zu prüfen**

- An welcher Stelle werden Monster aktuell ausgewählt oder nachgefüllt?
- Wird die Liste nach dem Aufbrauchen erneut gestartet oder gemischt?
- Soll ein Monster in Sonderfällen doch mehrfach vorkommen dürfen, etwa in einer späteren Erweiterung?

**Status**: Behoben. Neue Partien verwenden die feste Reihenfolge der Monsterliste. Jedes der zwölf Monster kommt genau einmal vor; drei starten auf dem Feld und neun bleiben in der Reserve. Die Reihenfolge wird nicht mehr zufällig gemischt.

## 2. Aktuelle Lebenspunkte der Monster sind sichtbar

**Gemeldetes Problem**

Im aktuellen Spiel kann man die verbleibenden Lebenspunkte der Monster erkennen. Das soll im eigentlichen Hauptspiel nicht möglich sein.

**Gewünschtes Verhalten**

Im normalen Spiel bleiben die aktuellen Lebenspunkte verborgen. Informationen, die laut Spielregeln geheim sein sollen, dürfen nicht versehentlich durch eine Anzeige oder einen anderen UI-Bereich sichtbar werden.

**Vorschlag: Tutorial- oder Testrunde**

Eine separate Tutorial- beziehungsweise Testrunde kann die Lebenspunkte sichtbar machen. Dort können Spieler nachvollziehen, wie Waffen Schaden verursachen und wann ein Monster besiegt ist. Diese Anzeige sollte ausdrücklich an den Tutorial-/Testmodus gebunden sein und im normalen Spiel ausgeschaltet sein.

Das Tutorial sollte vom eigentlichen Spielstand getrennt sein: Übungsangriffe verändern weder die Siegpunkte noch den Fortschritt einer echten Partie. Alternativ kann es eine klar gekennzeichnete Testrunde geben, die nach Ende zurückgesetzt wird.

**Zu prüfen**

- Sollen Lebenspunkte im normalen Spiel vollständig verborgen sein oder nur nicht als genaue Zahl angezeigt werden?
- Welche Informationen dürfen stattdessen sichtbar sein, zum Beispiel ob ein Monster bereits verwundet ist?
- Soll das Tutorial geführt sein oder eine frei spielbare Proberunde bieten?

**Status**: Umgesetzt. Im Startbildschirm kann der Testmodus eingeschaltet werden. Dann werden die aktuellen Lebenspunkte im Spiel angezeigt und der Modus bleibt im gespeicherten Spielstand markiert. Ohne Testmodus bleiben die aktuellen Lebenspunkte verborgen. Es handelt sich derzeit um einen Anzeigemodus, noch nicht um ein geführtes Tutorial mit eigenen Übungsregeln.

## 3. Dynamit löst nicht korrekt aus

**Gemeldetes Problem**

Das Dynamit funktioniert im Spiel derzeit nicht wie vorgesehen.

**Erwartete Regel laut Spielbeschreibung**

Dynamit hat Stärke 10. Der Schaden wird nicht sofort angewendet, sondern erst dann, wenn der Spieler, der das Dynamit gespielt hat, das nächste Mal an der Reihe ist.

**Zu prüfendes Verhalten**

- Wird das Dynamit beim Ausspielen dem richtigen Monster zugeordnet?
- Wird gespeichert, welcher Spieler es gespielt hat?
- Wird der Effekt beim nächsten Zug dieses Spielers ausgelöst?
- Wird der Schaden zum richtigen Zeitpunkt angewendet, also vor oder nach dessen nächstem Angriff?
- Was geschieht, wenn das Zielmonster vorher stirbt oder an seiner Position ein anderes Monster nachrückt?
- Wird Dynamit nach dem Ausspielen als verbraucht behandelt?

**Vorschlag**

Den verzögerten Effekt als eigenen Spielzustand speichern: Monsterziel, auslösender Spieler und Zeitpunkt der Auslösung. Der Schaden wird vor dem nächsten Angriff des Spielers angewendet. Ist das Monster bis dahin besiegt, verfällt der Effekt.

**Status**: Behoben und im Browser geprüft. Dynamit wird beim nächsten Zug des Spielers vor dessen neuem Angriff ausgelöst. Es ist an die Monster-ID gebunden. Wurde das Ziel vorher besiegt, verfällt die Ladung; ein nachgerücktes Monster wird nicht getroffen. Der Effekt wird nach der Auslösung entfernt.

## 4. Gift endet nach einer Runde

**Gemeldetes Problem**

Gift schadet dem Monster nur eine Runde lang. Laut Regel soll es weiterwirken, bis das vergiftete Monster stirbt.

**Ursache**

Der Giftzähler wurde nach dem ersten Giftschaden heruntergezählt und dadurch auf null gesetzt. Außerdem wurde der Giftstatus erst nach dem direkten Giftschaden gesetzt. Wenn dieser Schaden das Monster besiegte, konnte stattdessen das nachgerückte Monster den Giftstatus erhalten.

**Gewünschtes Verhalten**

- Gift verursacht beim Ausspielen zunächst den normalen direkten Schaden.
- Das betroffene Monster verliert danach nach jedem Spielerzug 1 weiteren Lebenspunkt.
- Der Giftstatus bleibt bestehen, bis genau dieses Monster stirbt.
- Ein nachrückendes Monster wird nicht automatisch vergiftet.

**Status**: Behoben und im Browser über zwei Runden geprüft. Der Giftstatus bleibt aktiv und das Monster verliert weiter Lebenspunkte. Der Status wird am Zielmonster vor dem direkten Giftschaden gesetzt, damit ein Ersatzmonster nicht versehentlich betroffen ist.

## 5. Eisschutz geht auf ein nachrückendes Monster über

**Gemeldetes Problem**

Wird ein Monster durch den Eisangriff besiegt, kann das nachrückende Monster den Eisschutz erhalten.

**Ursache**

Nach dem Schaden wurde die Monsterposition erneut ausgelesen. Wenn das ursprüngliche Monster gestorben war, zeigte die Position bereits auf den Nachrücker.

**Status**: Behoben und im Browser geprüft. Der Eisschutz wird nur gesetzt, wenn das ursprüngliche Ziel den Angriff überlebt und noch an dieser Position steht.

## 6. Gift wirkt trotz Eisschutz

**Gemeldetes Problem**

Ein Giftangriff kann ein durch Eis geschütztes Monster vergiften, obwohl der Angriff laut Regel wirkungslos sein soll.

**Ursache**

Der Giftstatus wurde vor der Prüfung des Eisschutzes gesetzt. Der direkte Schaden wurde zwar abgewehrt, der spätere Giftschaden aber nicht.

**Status**: Behoben und im Browser geprüft. Wird der Angriff vom Eisschutz abgewehrt, wird kein Giftstatus gesetzt.

## 7. Zweites Schwertziel bleibt versehentlich ausgewählt

**Gemeldetes Problem**

Beim Ändern des zweiten Ziels für gekreuzte Schwerter blieb die vorherige Auswahl zusätzlich aktiv. Bei mehr als zwei markierten Zielen wurden außerdem stillschweigend nur die ersten zwei verwendet.

**Status**: Behoben und im Browser geprüft. Das Dropdown ersetzt das vorherige zweite Ziel; ein Ziel kann nicht doppelt gewählt werden. Die Auswahl über Umschalt-Klick ist auf zwei Ziele begrenzt.

## 8. Spezialwaffen lassen sich nicht weitergeben

**Gemeldetes Problem**

Die Spieler konnten Spezialwaffen weder tauschen noch weitergeben.

**Status**: Behoben und im Browser geprüft. Während der Vorbereitungsphase jeder Runde gibt es ein Formular, mit dem ein Spieler eine seiner Spezialwaffen an einen anderen Spieler übertragen kann. Der Dolch ist davon ausgeschlossen. Ein Tausch kann durch zwei aufeinanderfolgende Übergaben erfolgen.

## 9. Beute wird nach einem Monstersieg nicht angezeigt

**Gemeldetes Problem**

Die Beute wurde dem Spieler zwar intern gutgeschrieben, aber in der Ergebnisansicht nicht genannt.

**Status**: Behoben und im Browser geprüft. Die öffentliche Meldung eines besiegten Monsters enthält nun auch die erhaltene Beute.

## Reihenfolge der Bearbeitung

1. Erledigt: Monsterreserve auf feste Reihenfolge ohne Wiederholungen umgestellt.
2. Erledigt: Lebenspunktanzeige an den Testmodus im Startbildschirm gebunden.
3. Erledigt: Dynamit wird vor dem nächsten eigenen Angriff ausgelöst und verfällt, wenn das Ziel vorher stirbt.
4. Erledigt: Gift bleibt bis zum Tod des vergifteten Monsters aktiv.
5. Erledigt: Eisschutz bleibt am überlebenden ursprünglichen Monster.
6. Erledigt: Vom Eis abgewehrte Giftangriffe erzeugen keinen Giftstatus.
7. Erledigt: Zweites Ziel der gekreuzten Schwerter lässt sich eindeutig auswählen.
8. Erledigt: Spezialwaffen können zwischen Spielern weitergegeben werden.
9. Erledigt: Erhaltene Beute wird in der Ergebnisansicht angezeigt.

## Testfälle für die spätere Fehlerbehebung

- Zu prüfen: Startfolge beginnt mit Mumie, Kürbis und Geist; als nächste Reserve folgen Medusa, Vampir und Baum.
- Noch als vollständiger Spieldurchlauf zu prüfen: bis zum Ende spielen und bestätigen, dass kein Monster ein zweites Mal erscheint.
- Geprüft: Im normalen Spiel werden keine aktuellen Lebenspunkte angezeigt.
- Geprüft: Mit aktiviertem Testmodus sind Lebenspunkte sichtbar und der Modus ist während des Spiels markiert.
- Geprüft: Dynamit verursacht beim Ausspielen keinen Schaden.
- Geprüft: Beim nächsten eigenen Zug wird Dynamit einmalig vor dem neuen Angriff ausgelöst.
- Geprüft: Wenn das Dynamitziel vorher stirbt, verfällt die Ladung; das nachgerückte Monster bleibt unbeschädigt.
- Noch als Randfall zu prüfen: Ist der Zielplatz bei der Auslösung leer, verpufft Dynamit.
- Geprüft: Ein vergiftetes Monster verliert auch in der folgenden Runde weiter Lebenspunkte.
- Geprüft: Stirbt ein Monster durch den direkten Giftschaden, rückt ein Monster mit vollen Lebenspunkten und ohne Giftstatus nach.
- Geprüft: Ein vom Eisschutz abgewehrter Giftangriff verursacht weder direkten noch späteren Giftschaden.
- Geprüft: Stirbt ein Monster durch Eis, erhält der Nachrücker keinen Eisschutz.
- Geprüft: Das zweite Schwertziel ersetzt eine vorige Auswahl und es bleiben höchstens zwei Ziele ausgewählt.
- Geprüft: Eine Spezialwaffe wechselt beim Weitergeben vom Besitz des Abgebers zum Empfänger.
- Geprüft: Die Ergebnisansicht nennt die Beute eines besiegten Monsters.
