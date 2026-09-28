# Drehbuch für das Screencapture-Video

Dieselben Schritte wie im Aufnahme-Skript (`abgabe/werkzeug/video.mjs`), als Klick-Anleitung für eine eigene Aufnahme mit QuickTime. Ziel: 2–4 Minuten.

## Vorbereitung

1. Im Terminal im Projektordner `npm run dev` starten und die angezeigte Adresse in Chrome öffnen.
2. Chrome-Entwicklertools öffnen (Cmd + Alt + I), Gerätesymbolleiste einschalten (Cmd + Shift + M), eigenes Gerät **393 × 852** anlegen und auswählen.
3. Im Reiter „Application“ → „Local Storage“ alle Einträge löschen. Dann in der Konsole eingeben, damit die Proberunden übersprungen werden:
   `localStorage.setItem('sonnenschein.himmelsroute.proberundeGesehen','1'); localStorage.setItem('sonnenschein.wolkensammeln.proberundeGesehen','1')`
4. QuickTime → Ablage → Neue Bildschirmaufnahme → nur den Telefonbereich auswählen.
5. Aufnahme starten, dann die Seite neu laden (Cmd + R).

## Schritte

| # | Was zu sehen ist | Was du tust | Dauer |
|---|---|---|---|
| 1 | Splash: Erde, Echoo geht auf, „Sonnenschein“ | nichts, abwarten | 3 s |
| 2 | Onboarding Schritt 1–6 | fünfmal „Weiter“, jeweils kurz warten; dann „Los geht's“ | 12 s |
| 3 | Startseite | kurz stehen lassen | 2 s |
| 4 | Stimmungscheck | Griff nach rechts auf „Eher gut“ ziehen und loslassen, die Karte klappt zu | 3 s |
| 5 | Himmelsroute starten | Karte „Himmelsroute“ antippen, Erklärung lesen lassen, „Weiter“ | 5 s |
| 6 | Puls vorher | „Spiel starten“ | 2 s |
| 7 | Runde 1 (3 Begegnungen) | nach jeder Begegnung den Pfeil antippen oder nach oben ziehen | 15 s |
| 8 | Rückweg, **richtige Route** | die drei Gegenstände in der Reihenfolge der Begegnung von unten nach oben auf die Wegpunkte ziehen, „Route bestätigen“ | 10 s |
| 9 | Echoo fliegt heim und strahlt | abwarten, dann „Nächste Runde“ | 6 s |
| 10 | Runde 2 (4 Begegnungen) | wie Schritt 7 | 18 s |
| 11 | Rückweg, **falsche Route** | die unteren beiden Gegenstände vertauscht legen, „Route bestätigen“ | 10 s |
| 12 | Auflösung und Sheet „Route nicht ganz richtig“ | abwarten, „Zweiter Versuch“, dann oben links Zurück → „Spiel verlassen“ | 7 s |
| 13 | Wolkensammeln starten | Karte „Wolkensammeln“ antippen, „Spiel starten“, Puls „Spiel starten“ | 7 s |
| 14 | Countdown und Durchgänge | leuchtende Wolken antippen; hin und wieder absichtlich eine falsche Wolke antippen, einmal dreimal hintereinander | bis Durchgang 20 |
| 15 | Bewegungspause (nach drei Fehlern) | „Ich habe mich bewegt“, Puls „Spiel fortsetzen“ | 5 s |
| 16 | Ergebnis | kurz stehen lassen, dann „Statistiken“ | 5 s |
| 17 | Statistiken | nacheinander „Sitzung“, „Verlauf“, „Zusammenhänge“ antippen, bei „Zusammenhänge“ langsam nach unten scrollen | 15 s |

## Hinweise

- Eine Wolkensammeln-Runde hat 20 Durchgänge. Damit das Video unter 4 Minuten bleibt, kannst du einen Teil davon im Schnitt beschleunigen (das Skript spielt die Durchgänge 4–8 und 13–19 dreimal so schnell ab).
- Maus langsam bewegen, zwischen den Schritten kurz innehalten.
- Die Demodaten sind im Prototyp immer an – die Statistiken zeigen also volle Diagramme.
