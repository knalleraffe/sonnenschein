# Entwurfsmaterial – wie Sonnenschein entstanden ist

Sammelordner, nicht aufbereitet. Er zeigt den Prozess in der Reihenfolge, in der er ablief.

## Inhalt dieses Ordners

- `figma/` – Exporte der Figma-Frames, auf die sich die Umsetzung bezieht (Datei „Prototyp“, fileKey `dJ14dXd6lLt7aPJif2EbJY`):
  - 180:37 Startseite (erster Entwurf: Wochenleiste, Stimmungsskala, Kartenraster)
  - 315:3007 Szene „Spiel 2 Scroll“ (Himmel, Wolken, Sterne, Erde)
  - 267:1748 Gegenstände der Himmelsroute
  - 344:4324 Erklärung Himmelsroute
  - 460:224 Puls vorher
  - 460:312 Bewegungspause
  - 460:268 Puls danach
  - 460:186 Abbruch
  - 467:398 Zuordnen (Karten- und Zahlenstil)
  - 460:347 Endergebnis
- `prompts/` – alle Master-Spezifikationen und Teil-Prompts aus `docs/`, mit denen die App per Agent umgesetzt wurde, dazu die Protokolle „ohne Design“ und die Bestandsaufnahmen.

## Ablauf

1. **Konzept.** Ausgangsfrage: Hilft mir Bewegung beim Denken? Zwei kurze Gedächtnisspiele, eine Pause mit zugewiesener Bedingung (Bewegung oder Ruhe) und der Vergleich vor und nach der Pause. Echoo, die Sonne, als Spiegel statt Pflegeobjekt.
2. **Figma.** Gestaltung der Spiele, Sheets und Szenen in der Figma-Datei „Prototyp“ (Exporte in `figma/`).
3. **Umsetzung per Agent.** Für jeden Bereich eine Master-Spezifikation mit Texten, Zahlen und Regeln, dazu Teil-Prompts, die nacheinander abgearbeitet wurden (`prompts/`). Texte und Werte kamen aus den Master-Dateien, die Gestaltung aus Figma. Screens ohne Figma-Design wurden aus vorhandenen Bausteinen gebaut und in den „ohne-design“-Dateien festgehalten.
4. **Erste App-Grundlage.** Sonnenschein-Avatar als geschichtetes SVG, Modi, Verlaufsdaten, erster Statistik-Screen, Glossar.
5. **Überarbeitungen der Spiele.** Wolkensammeln mit Treppe, Rückmeldung und Bewegungspause; Umbau der Himmelsroute zu einer durchgehenden Szene mit Aufgang, Flug, Rückweg und Heimflug (`prompts/himmelsroute/`). Danach viele kleine Nachbesserungen, etwa am Flug-Gefühl, an Echoos Heimflug und an den Einstellungen.
6. **Startseite.** Neue Startseite mit Echoo im Zustand der letzten Messungen, Stimmungscheck, Spielkarten mit „Heute dran“ und Container Transform ins Spiel (`prompts/start-statistik/`), später nach Figma 513:1427 neu angeordnet.
7. **Statistiken.** Drei Ebenen – Sitzung, Verlauf, Zusammenhänge – mit Demodaten (`prompts/start-statistik/`).
8. **Onboarding.** Splash und eine Einführung in sechs Schritten, die in der Himmelsszene nach oben führt (`prompts/splash-onboarding/`).
9. **Abgabe.** Konzeptseite, Flowcharts, Video und dieser Ordner (`abgabe/`).
