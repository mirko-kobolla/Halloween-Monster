# Halloween Monster veröffentlichen

Die Web-App liegt im GitHub-Repository [Halloween-Monster](https://github.com/mirko-kobolla/Halloween-Monster). Sie ist statisch und benötigt keinen Server und keine Installation.

## Einmalig einrichten

1. Öffne die [Pages-Einstellungen](https://github.com/mirko-kobolla/Halloween-Monster/settings/pages).
2. Wähle bei **Build and deployment** unter **Source** die Option **GitHub Actions**.
3. Speichere die Einstellung, falls GitHub danach fragt.
4. Öffne den [Pages-Workflow](https://github.com/mirko-kobolla/Halloween-Monster/actions/workflows/pages.yml).
5. Wähle **Run workflow**, lasse den Branch `main` ausgewählt und starte den Lauf.
6. Öffne den Workflow-Lauf. War er erfolgreich, kannst du die App hier aufrufen:

   **https://mirko-kobolla.github.io/Halloween-Monster/**

Der erste Lauf kann einige Minuten dauern. Falls er fehlschlägt, prüfe unter **Settings → Pages**, ob als Quelle wirklich **GitHub Actions** ausgewählt ist. Danach kannst du den Workflow erneut starten.

## Spätere Änderungen veröffentlichen

Änderungen, die auf den Branch `main` gepusht werden, starten den Pages-Workflow automatisch. Nach einem erfolgreichen Lauf ist die aktualisierte App unter derselben URL verfügbar.

## Spielstand und Datenschutz

Der Spielstand wird im Browser des verwendeten Geräts gespeichert. Er wird nicht zu GitHub hochgeladen und nicht mit anderen Geräten synchronisiert. Zum gemeinsamen Spielen können die Spieler dasselbe iPad nacheinander verwenden.
