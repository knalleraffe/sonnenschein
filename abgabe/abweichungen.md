# Abweichungen zwischen Code und Master-Dateien

Für die Flowcharts und die Konzeptseite gilt der Code. Hier steht jede Stelle, an der er von den Master-Dateien in `docs/*/00-master.md` abweicht. „Auf Wunsch“ heißt: Julius hat die Änderung während der Umsetzung ausdrücklich verlangt.

## Spielübergreifend

| Thema | Master | Code | Wo im Code |
|---|---|---|---|
| Pausenbedingung | Bewegung oder Ruhe wird zugewiesen, der Zufall entscheidet (Himmelsroute §2, Onboarding-Text Schritt 2); die Statistik gruppiert nach der zugewiesenen Bedingung (Start-Statistik §2). | Beide Spiele weisen immer **Bewegung** zu. Ruhe kommt nur in den Demodaten vor. | `games/himmelsroute/ablauf.ts` (`weisePausenbedingungZu`), `screens/Wolkensammeln.tsx` (`starteUnterbrechung`) |
| Puls-Slider und Onboarding | Puls-Messung im Onboarding plausibel von 40 bis 200 Schlägen. | Der Puls-Slider der Spiele reicht nur bis 190; Werte darüber bleiben am Ende des Reglers stehen. | `games/wolkensammeln/config.ts` (`pulsMax`) |

## Wolkensammeln

Für Wolkensammeln gibt es keine eigene Master-Datei. Maßstab sind der Erklärtext im Spiel, der Onboarding-Text und die Kennzahlen aus der Start-Statistik-Master.

| Thema | Beschreibung | Code | Wo im Code |
|---|---|---|---|
| Pause | Onboarding: Puls → Spiel → Pause → Puls und Spiel, also eine Pause zwischen zwei Teilen. | Eine Bewegungspause kommt nach drei Fehlern in Folge, bis zu 20-mal pro Runde, ohne feste Stelle. Gibt es keine drei Fehler in Folge, gibt es keine Pause. | `games/wolkensammeln/session.ts` (`darfUnterbrechen`), `config.ts` (`unterbrechung`) |
| Reihenfolge | Erklärtext: Wolken „in genau dieser Reihenfolge“ antippen. | Es zählt nur, welche Wolken angetippt werden, nicht die Reihenfolge. | `screens/Wolkensammeln.tsx` (`tipp`) |
| Anzahl der Wolken | Erklärtext: 3 bis 8 Wolken. | Die Treppe reicht von 3 bis 10 Wolken. | `games/wolkensammeln/config.ts` (`minLaenge`, `maxLaenge`) |
| Proberunde | Kommt in keiner Master-Datei vor. | Auf Wunsch eingebaut, nach dem Muster der Himmelsroute. Die Hinweistexte stammen nicht aus einer Master-Datei. | `screens/Wolkensammeln.tsx` (`probeTexte`) |

## Himmelsroute

| Thema | Master | Code | Wo im Code |
|---|---|---|---|
| Echoo | Bestehende Avatar-Komponente, ca. 72 px (§4). | Auf Wunsch überall `EchooMini.png` mit Leuchten. | `components/himmelsroute/EchooMini.tsx` |
| „Überspringen“ in der Proberunde | Link oben rechts (§6). | Unten rechts anstelle von Pfeil und Einstellungen (nach Figma 507:1295). | `components/himmelsroute/Leisten.tsx` |
| Merker der Proberunde | Im selben Speicher wie die übrigen Einstellungen der App (§6). | Eigener Eintrag `sonnenschein.himmelsroute.proberundeGesehen`, getrennt von `sonnenschein.einstellungen.v1`. | `games/himmelsroute/storage.ts` |
| Pausenbedingung | siehe oben | immer Bewegung | `games/himmelsroute/ablauf.ts` |

## Startseite und Statistiken

| Thema | Master | Code | Wo im Code |
|---|---|---|---|
| Wochenleiste | Wochenleiste mit „Heute“, „{x} von 7 Tagen“ und Tages-Sheet auf der Startseite (§3). | Auf Wunsch ohne Kopfzeile: Wochenleiste und Tages-Sheet sind gebaut, aber auf der Startseite nicht erreichbar. | `components/start/Wochenleiste.tsx`, `TagesSheet.tsx`, `screens/Dashboard.tsx` |
| Stimmungsskala | „Die Nadel der Skala dreht sich mit“ (§3). | Die Skala ist ein festes Bild aus Figma; die Nadel dreht sich nicht. | `components/start/StimmungsKarte.tsx` (`Skala`) |

## Splash und Onboarding

| Thema | Master | Code | Wo im Code |
|---|---|---|---|
| Übergang zur Startseite | Echoo fährt in 500 ms an seine Stelle auf der Startseite. | Auf Wunsch: Szene und Echoo wachsen leicht und blenden aus (zwei Echoo-Versionen passen nicht nahtlos zusammen). | `einfuehrung/Startsequenz.tsx` (`ausgang`) |
| Echoo | Echoo der Startseite. | Auf Wunsch `EchooMini.png`. | `einfuehrung/EchooFigur.tsx` |
| Schritt 5 · Spiegel | Drei Stufen, Echoo wechselt live den Zustand. | Auf Wunsch ohne Regler, nur Titel und Text. | `einfuehrung/Startsequenz.tsx` |
| Schritt 6 | Mit Umschaltern. | Auf Wunsch ohne Umschalter. | `einfuehrung/Startsequenz.tsx` |
| Inhaltskarte | Feste Karte, deren Inhalt überblendet. | Auf Wunsch so hoch wie ihr Inhalt; die Höhe gleitet weich (einzige Höhen-Animation der App). | `einfuehrung/Startsequenz.tsx` |
| Rückseite Himmelsroute | Erster Satz des Erklär-Sheets. | Auf Wunsch eigener Satz: „Präge dir ein, wem und was Echoo begegnet ist, …“ | `einfuehrung/Schritte.tsx` (`ERSTER_SATZ`) |

## Zustände aus dem Briefing, die der Code nicht gestaltet

Diese Zustände sind auf der Konzeptseite beschriftet, sehen im Code aber nicht eigens anders aus:

- **Sekundärer Button, deaktiviert:** kommt in der App nicht vor, es gibt keinen Stil dafür.
- **Puls- und Stimmungs-Slider, beim Ziehen:** kein eigener Stil; Griff und Füllung folgen nur dem Finger.
- **Puls-Slider, eingerastet:** der Puls-Slider rastet in Schritten zu 1 Schlag ein, sieht dabei aber nicht anders aus.
