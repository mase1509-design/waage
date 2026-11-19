# Gewichtstracker

Eine schlanke, mobiloptimierte Web-App (PWA) zum Erfassen des Körpergewichts.

## Funktionen
- Datum standardmäßig auf heute; Darstellung in deutscher Schreibweise (TT.MM.JJJJ)
- Gewicht in kg mit genau einer Nachkommastelle
- Ein Eintrag pro Datum; erneutes Speichern am selben Datum aktualisiert ihn
- Historie mit neuestem Eintrag zuerst, Bearbeiten und Löschen
- Diagramm mit wählbarem Zeitraum (7 Tage, 30 Tage, 90 Tage, 1 Jahr)
- CSV-Export
- Offline-Nutzung nach dem ersten Laden
- Lokale Speicherung im Browser (`localStorage`), keine Konten oder Server-Synchronisierung

## Veröffentlichung über GitHub Pages
1. Die Dateien aus diesem ZIP in das Stammverzeichnis des Repositorys hochladen und bestehende App-Dateien ersetzen.
2. In GitHub unter **Settings → Pages** die Veröffentlichung über den Branch `main` und den Ordner `/ (root)` aktivieren.
3. Nach der Veröffentlichung die GitHub-Pages-Adresse öffnen.

## Zum Startbildschirm hinzufügen
- **iPhone/iPad:** Website in Safari öffnen → Teilen → „Zum Home-Bildschirm“.
- **Android:** Website in Chrome öffnen → Menü → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.

## Datenschutz und Datensicherung
Die Einträge bleiben auf dem jeweiligen Gerät und im jeweiligen Browser. Sie werden nicht automatisch zwischen iPhone und Android synchronisiert. Nutze regelmäßig den CSV-Export als Sicherung. Browserdaten löschen kann auch die gespeicherten Einträge löschen.

Beim ersten Start dieser Version wird außerdem der lokale Speicher-Schlüssel `bodyData` der vorherigen Tracker-Version entfernt. Bereits auf GitHub vorhandene Dateien oder Daten werden durch das Hochladen dieses ZIP nicht automatisch gelöscht; ersetze bzw. entferne sie dort bei Bedarf.
