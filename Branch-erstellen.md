# Einen neuen Git-Branch erstellen

Ein Branch ist ein eigener Entwicklungszweig. Änderungen, die du dort commitest, verändern `main` nicht. Erst durch einen Merge oder Cherry-pick gelangen sie nach `main`.

## In VS Code

1. Öffne die Quellcodeverwaltung und prüfe, ob deine Änderungen gespeichert und committet sind.
2. Klicke unten links in der Statusleiste auf den aktuellen Branchnamen.
3. Wähle **Create new branch...** (je nach Spracheinstellung **Neuen Branch erstellen...**).
4. Gib einen Namen ein, zum Beispiel `experiment/neue-funktion`, und bestätige.

VS Code erstellt den Branch und wechselt direkt dorthin. Den aktiven Branch siehst du unten links in der Statusleiste.

## Im Terminal

Wechsle im Terminal in den Projektordner und führe aus:

```powershell
git status
git switch -c experiment/neue-funktion
```

`git status` zeigt, ob noch Änderungen offen sind. Mit `git switch -c` wird der neue Branch erstellt und sofort ausgecheckt. Den Namen kannst du frei wählen; kurze, aussagekräftige Namen sind hilfreich.

Den aktuellen Branch kannst du jederzeit prüfen:

```powershell
git branch --show-current
```

## Änderungen ausprobieren und verwerfen

Commitest du deine Experimente auf dem neuen Branch, bleibt `main` unverändert. Um zurückzugehen:

```powershell
git switch main
```

Wenn du den Test-Branch danach nicht mehr brauchst, kannst du ihn löschen:

```powershell
git branch -d experiment/neue-funktion
```

Git löscht mit `-d` nur Branches, deren Änderungen bereits in einem anderen Branch enthalten sind. Hat der Branch nicht gemergte Commits, verweigert Git das Löschen standardmäßig, damit nichts versehentlich verloren geht.

## Wichtig bei offenen Änderungen

Nicht-committete Änderungen sind nicht automatisch an einen Branch gebunden. Sie können beim Branch-Wechsel mitgenommen werden oder den Wechsel verhindern. Prüfe deshalb zuerst `git status` und committe die Änderungen oder sichere sie mit `git stash`, bevor du zwischen Branches wechselst.