# Himmelsroute – Bestandsaufnahme

Stand: 24.09.2026. Grundlage ist der Code im Arbeitsverzeichnis (Branch `main`, viele Änderungen noch nicht committet).

> **Wichtig:** Die Spezifikation `docs/himmelsroute/00-master.md` lag bei der Bestandsaufnahme nicht vor – sie ist weder im Projekt noch in Downloads, Schreibtisch, Dokumenten oder OneDrive zu finden. Alles, was sich auf ihre Abschnitte bezieht (Familien aus Abschnitt 3, Abgleich mit 0, 1, 2 und 9), ist unten als **offen – Master fehlt** markiert und wird nachgetragen, sobald die Datei da ist.

## Dateien

### Wolkensammeln

| Pfad | Wofür |
|---|---|
| `src/screens/Wolkensammeln.tsx` | Spielbildschirm: Ablauf (Phasen, Zeitgeber), Himmel, Echoo, Wolken, alle Sheets, Ergebnis |
| `src/games/wolkensammeln/config.ts` | Alle Zahlen, Zeiten, Kurven und Echoo-Stufen an einer Stelle (`konfig`) |
| `src/games/wolkensammeln/types.ts` | Datenformen: Wolke, Durchgangs-Log, Unterbrechungs-Log, Rundenergebnis |
| `src/games/wolkensammeln/session.ts` | Rundenzustand, Durchgang verbuchen, Pausen-Sperren, Ergebnis berechnen |
| `src/games/wolkensammeln/sequence.ts` | Erzeugt die Wolkengruppe je Durchgang (Regeln für Reihen/Seiten) |
| `src/games/wolkensammeln/layouts.ts` | Fünf feste Wolkenanordnungen, reihum pro Runde |
| `src/games/wolkensammeln/scoring.ts` | Licht (Punkte) pro Durchgang inkl. Tempobonus |
| `src/games/wolkensammeln/staircase.ts` | Treppe für die Länge (2 richtig → +1, 1 Fehler → −1) und Spanne |
| `src/games/wolkensammeln/storage.ts` | Rundenergebnisse im `localStorage` speichern und lesen |
| `src/components/spiel/Wolke.tsx` | Eine antippbare Wolke (Aussehen, Pulse, Ausweichen vor Echoo) |
| `src/components/spiel/Echoo.tsx` | Echoo-Sonne aus Figma, steigt mit dem Fortschritt |
| `public/wolkensammeln-intro/`, `public/echoo/`, `public/bewegungspause.png`, `public/trophy.png` | Grafiken für Erklär-Sheet, Echoo, Bewegungspause und Ergebnis |

### Himmelsroute (bisher)

| Pfad | Wofür |
|---|---|
| `src/screens/Himmelsroute.tsx` | Alles in einer Datei: Spielfeld-Szene, Scroll-Auslöser, Begegnungen, Zuordnen, Ergebnis, Sheets |
| `src/games/himmelsroute-session.ts` | `naechsteSchwierigkeit` (Treppe 3–7) und `bewerteZuordnung` (nicht benutzt, siehe Kollisionen) |
| `src/games/staircase.ts` | Allgemeine Treppenfunktion `naechsteStufe`, von Himmelsroute benutzt |
| `src/data/himmelsroute-objekte.ts` | Liste der 18 Gegenstände mit Name, Familie und Grafikgröße |
| `public/himmelsroute/objekte/` | 18 Gegenstands-SVGs |
| `public/himmelsroute/spielfeld/` | Szene aus Figma: Wolkenstrecke, 4 Sternenfelder, Erde |
| `public/himmelsroute/erklaerung/` | Illustration des Erklär-Sheets (Erde, Wolken, Sterne) |
| `public/himmelsroute/szene/` | Alte Szenengrafiken (`Erde.svg`, `wolke1–4.svg`) – nicht mehr benutzt |

### Gemeinsam genutzt

| Pfad | Wofür |
|---|---|
| `src/components/ui/Sheet.tsx` | Sheet-Grundgerüst (Karte, Ein-/Ausblenden, 80 px Abstand oben, Scrollen) |
| `src/components/spiel/SpielSheets.tsx` | Gemeinsame Sheets beider Spiele + Countdown + Button-Stile |
| `src/components/spiel/SpielHud.tsx` | Obere und untere Leiste im Spiel (infoOverlay) |
| `src/styles/index.css` | `.sheet-primary`, `.sheet-secondary`, `.sheet-range` (Slider), Staffel-Animation der Sheets |
| `src/styles/tokens.css` | Farb- und Schatten-Tokens (u. a. `--sheet-primary-start/end`, `--sheet-secondary`) |

## Wiederverwendbare Komponenten

| Baustein | Pfad | Hinweis |
|---|---|---|
| Sheet | `src/components/ui/Sheet.tsx` | Variante `karte` ist der Figma-Stand; `standard` und `himmelsroute` sind Altvarianten. Muss in `<AnimatePresence>` stehen, damit das Schließen animiert. |
| Primärer Button | `knopfPrimaer` in `src/components/spiel/SpielSheets.tsx` (+ `.sheet-primary` in `index.css`) | Gelber Verlauf `#ffca67 → #ffba3a`, 56 px hoch |
| Sekundärer Button | `knopfSekundaer` in `SpielSheets.tsx` (+ `.sheet-secondary`) | `#f2f2f2` |
| Puls-Slider | `PulsSheet` in `SpielSheets.tsx`, Slider-Stil `.sheet-range` in `index.css` | Varianten `start` / `bewegung`, Füllung über CSS-Variable `--range-progress` |
| Obere Leiste | `SpielHud` (oben) in `src/components/spiel/SpielHud.tsx` | Zurück, Uhr, Punkte; `hell` für dunklen Hintergrund |
| Untere Leiste | `SpielHud` (unten), nur wenn `puls`, `fortschritt` und `onSettings` übergeben werden | Fortschritt + Puls + Einstellungen; alternativ `onWeiterScrollen` (Pfeil nach oben, Himmelsroute) |
| Zurück-Pfeil | `SpielHud`, Prop `onLeave` | öffnet in beiden Spielen das Verlassen-Sheet |
| Einstellungen | `EinstellungenSheet` in `SpielSheets.tsx` | Anzeigedauer und Anzeigepause |
| Countdown | `Countdown` in `SpielSheets.tsx` | Feder-Ziffern, mittig, `zahl={null}` blendet aus |
| Ergebnis-Sheet | `ErgebnisSheet` in `SpielSheets.tsx` | Pokal, zählende Zahl, Satz, Zeilen, zwei Buttons, Verzögerung einstellbar |
| Verlassen-Sheet | `VerlassenSheet` in `SpielSheets.tsx` | „Bist du sicher?“ |
| Bewegungspause-Sheet | `BewegungspauseSheet` in `SpielSheets.tsx` | nur Bewegungs-Variante, keine Ruhe-Variante |
| Echoo-Avatar (Spiel) | `src/components/spiel/Echoo.tsx` | Figma-Sonne; Props `fortschritt` (null = versteckt) und `lachend` |
| Echoo/Sonne (Dashboard) | `src/components/avatar/Sonnenschein.tsx` (+ `emotions.ts`) | eigener Avatar mit Stimmungen, nicht identisch mit der Spiel-Figur |

## Texte und Konstanten

- **Konstanten Wolkensammeln:** ausschließlich in `src/games/wolkensammeln/config.ts` (`konfig`). Der Kommentar dort verlangt, dass keine dieser Zahlen woanders steht.
- **Konstanten Himmelsroute:** oben in `Himmelsroute.tsx` (`SZENE_HOEHE`, `PULS_MIN/MAX`, `ERKLAERUNG_VERZOEGERUNG`, `HUD_MITTE`, `NACHT_BIS`, Stapelplätze) und direkt im Code (z. B. 2650 ms pro Begegnung, Auslösepunkte 0,15–0,85, Punkteformel). Es gibt keine eigene Config-Datei.
- **Texte:** stehen in beiden Spielen direkt im JSX. Es gibt **keine Textdatei**, weder pro Spiel noch gemeinsam.
- **Gemeinsame Texte:** nur indirekt über die gemeinsamen Sheets in `SpielSheets.tsx` („Bevor es losgeht“, „Bist du sicher?“, „Bewegungspause“, „Einstellungen“, Button-Beschriftungen). Beide Spiele nutzen damit dieselben Texte.
- Sonstige Datendateien: `src/data/glossar.ts`, `src/data/modes.ts`, `src/data/mock.ts` (Demo-Sessions für die Statistik).

## Bewegung

**Kurven** (`konfig.kurven` in `config.ts`, laut Kommentar „die einzigen drei Bewegungskurven des Spiels“):

| Name | Kurve | Einsatz |
|---|---|---|
| `standard` | `cubic-bezier(0.16, 1, 0.3, 1)` | Erscheinen, Verschwinden, Farbwechsel (400–700 ms) |
| `ruhig` | `cubic-bezier(0.4, 0, 0.2, 1)` | Himmel, Echoo, große Übergänge (700–1200 ms) |
| `druck` | `cubic-bezier(0.2, 0, 0, 1)` | Antippen (90–260 ms) |

Daneben nutzt der Code außerhalb von `konfig`:

- Sheets: öffnen `cubic-bezier(0.32, 0.72, 0, 1)` 450 ms, schließen `cubic-bezier(0.4, 0, 1, 1)` 280 ms; Karten-Sheets federn herein (`stiffness 320, damping 26`) und gleiten in 320 ms hinaus.
- Countdown: Feder `stiffness 380, damping 14` (rein), `damping 26` (raus).
- Echoo: Feder `stiffness 60, damping 13`; Mund `stiffness 420, damping 12`.
- App-weit (Statistik, Dashboard, Glossar): `src/lib/motion.ts` mit Federn (`spring`, `springSoft`, `springTap`) und Kurven (`easeStandard`, `easeAus`, `easeFeder`).

**Dauern Wolkensammeln** (Auszug `konfig`):

- **Durchgang:** Ruhephase 1100, Leuchten 600, Pause zwischen Wolken 300, Startsignal 200, erster Tipp max. 10 000, weitere Tipps max. 6000 ms.
- **Rückmeldung richtig:** 120 ein + 150 halten + 280 zurück.
- **Fehler:** 120 ms ein. Die Auflösung setzt sich zusammen aus Start 250, Versatz 80, Einblenden 120, Halten 500 und Zurück 400 ms.
- **Einstieg:** Ebene 900, Wolke 620 (Versatz 45), Himmel 1100, Bedienleiste 480 (Verzögerung 340), Welle 600, gesamt 2200 ms.
- **Echoo-Aufstieg am Ende:** 750 ms, dann Ergebniskarte nach weiteren 400 ms, Zeilen im Abstand von 60 ms.
- **Erklär-Sheet:** öffnet 600 ms nach dem Seitenaufruf.

## Pause

- **Auslöser:** nach einem Fehler, wenn `darfUnterbrechen()` in `session.ts` zustimmt. Das heißt: 3 Fehler in Folge (`unterbrechung.nachFehlernInFolge`), frühestens ab Haupt-Durchgang 0, höchstens 20 Pausen pro Runde, Sperrfrist 0 Durchgänge. Geprüft wird nach jeder Rückmeldung (`weiterNachRueckmeldung`).
- **Bedingung:** Es gibt eine Losfunktion `wuerfleUnterbrechungsArt()` (50/50 Bewegung/Ruhe), sie wird aber **nicht benutzt**. `starteUnterbrechung()` setzt die Bedingung fest auf `'bewegung'`.
- **Ruhe-Variante:** Im Code gibt es noch ein altes Overlay „Stille Pause“ mit Restsekunden-Zähler. Es ist nicht erreichbar, weil die Bedingung immer Bewegung ist, und der Zähler wird nie heruntergezählt. Ein Figma-Design für eine Ruhe-Pause gibt es im Projekt nicht.
- **Bedingung und Verhalten getrennt:**
  - Beim Start der Pause wird `{ art, verhalten: null, nachHauptDurchgang }` in `runde.unterbrechungen` angelegt.
  - Die Buttons „Ich habe mich bewegt“ und „Ohne Bewegung fortfahren“ setzen danach `verhalten` auf `'bewegt'` bzw. `'ohneBewegung'`.
  - Im Ergebnis (`UnterbrechungsLog`) stehen `bedingung` und `verhalten` als getrennte Felder. Ein nicht gesetztes Verhalten wird zu `'ohneBewegung'`.
  - Dazu kommen die Mittelwerte der bis zu 3 Durchgänge vorher und nachher.
- **Nach der Pause:** Die Treppe bleibt. Serie und Fehlerzähler starten neu. Der Bewegungs-Puls wird im Rundenzustand gespeichert.

## Daten

- **Format:** `RundenErgebnis` in `types.ts`.
  - Zeitstempel, Spanne, höchste Länge, Trefferquote, Zeiten und längste Serie.
  - Fehlerverteilung und Licht.
  - Start- und Bewegungs-Puls.
  - Alle Durchgänge (`DurchgangLog`) und alle Unterbrechungen (`UnterbrechungsLog`).
- **Speicherort:** `localStorage`, Schlüssel `sonnenschein.wolkensammeln.v1`, als JSON-Array aller Runden. Schreib- und Lesefehler werden still geschluckt.
- **Letzte Sitzung im Endergebnis:** `beendeRunde()` liest mit `letzteRunde()` die zuletzt gespeicherte Runde, **bevor** die neue gespeichert wird, und bildet daraus den Satz „x % mehr/weniger Licht als beim letzten Mal“. Auch das Dashboard liest `letzteRunde()`.
- **Statistik-Seite:** liest noch feste Demo-Daten aus `src/data/mock.ts` (Typ `Session`), nicht die gespeicherten Runden.
- **Himmelsroute:** speichert **nichts**. Punkte, Fehler, Dauer, Pulse, Bedingung und Verhalten leben nur im React-State.

## Speicher für Einstellungen

- Es gibt bisher keinen Einstellungs-Speicher. Anzeigedauer und -pause werden in keinem Spiel gespeichert, sie leben nur im State.
- Das einzige bestehende Muster ist `localStorage` mit Namensraum `sonnenschein.<spiel>.v1` und `try/catch` (siehe `storage.ts`).
- **Vorschlag für „Proberunde gesehen“:** eigener Schlüssel `sonnenschein.himmelsroute.proberundeGesehen` (Wert `"1"`), gelesen und geschrieben über eine kleine Funktion in einer neuen `src/games/himmelsroute/storage.ts`, nach dem Vorbild von Wolkensammeln.

## Gegenstände

> **Nachtrag Teil 2:** Der Master ist inzwischen da. Er legt 12 Familien fest: Sternschnuppe, Flugzeug, Papierflieger, Heißluftballon, Luftballon, Huhn, Rakete, Satellit und Ufo sind je eine eigene Familie. Der neue Katalog `src/games/himmelsroute/gegenstaende.ts` folgt dem Master; die Tabelle unten zeigt den alten Stand in `src/data/himmelsroute-objekte.ts`.

Familien laut `src/data/himmelsroute-objekte.ts`. Die Zuordnung zum Gegenstand habe ich über die Hauptfarben in den SVGs geprüft. ⚠ markiert unsichere Zuordnungen.

| Datei | Gegenstand | Familie (Code) | Farben im SVG | Sicherheit |
|---|---|---|---|---|
| `Blue Bird.svg` | Blauer Vogel | voegel | Blau `#85C4EB`, Orange (Schnabel/Füße) | sicher |
| `Green Bird.svg` | Grüner Vogel | voegel | Grün `#99CA6E`, Orange | sicher |
| `Pink Bird.svg` | Rosa Vogel | voegel | Rosa/Rot `#F37778` | sicher |
| `Stern 1.svg` | Schlafender Stern | sterne | Gelb `#F6E058` | ⚠ Farbe gelb sicher, „schlafend“ nicht aus Farben prüfbar |
| `Stern 2.svg` | Orangener Stern | sterne | Orange `#F5983A` | sicher |
| `Stern 3.svg` | Kleiner blauer Stern | sterne | Hellblau `#99C5E8` | ⚠ blau sicher, „klein“ nur über Maße (113 × 121) |
| `Stern 4.svg` | Rosa Stern | sterne | Rosa `#F4AECA` | sicher |
| `Stern 5.svg` | Roter Stern | sterne | Rot `#F04B35` | sicher |
| `Sternschnuppe.svg` | Sternschnuppe | sternschnuppe | Gelb `#F9C83E` mit Schweif | ⚠ Familie: eigene oder zu „sterne“? |
| `Flugzeug.svg` | Flugzeug | flieger | Blau `#84BCE6` | sicher |
| `Papierflieger.svg` | Papierflieger | flieger | Hellblau `#ACD3F0` | ⚠ Familie zusammen mit Flugzeug? |
| `HLB.svg` | Heißluftballon | ballons | Beige/Orange `#F5E7CB`, `#EFC28C` | ⚠ Familie zusammen mit Luftballon? |
| `Ballon.svg` | Luftballon | ballons | Rosa-roter Verlauf (`#FDE9E8`) | ⚠ Familie zusammen mit Heißluftballon? |
| `Drachen.svg` | Drachen | drachen | Gelb-Grün `#EEE386`, `#C7DB8C` | sicher |
| `FallschirmHuhn.svg` | Huhn am Fallschirm | huhn | Rot `#EB5250` (Schirm), Creme (Huhn) | ⚠ Familie: eigene oder zu „voegel“? |
| `rocket.svg` | Rakete | rakete | Rot `#E74E4C`, Gelb, Creme | ⚠ Familie: eigene oder „Raumfahrt“ mit UFO/Satellit? |
| `Satellit.svg` | Satellit | satellit | Gelb `#F8D562` (Solarflügel), Blau, Grau | ⚠ wie Rakete |
| `UFO.svg` | UFO | ufo | Weiß/Grau, Gelb (Lichter) | ⚠ wie Rakete |

Der Code kennt 10 Familien. Bei der Auswahl kommt pro Runde höchstens ein Gegenstand je Familie vor; die Ablenker stammen aus Familien, die in der Runde nicht vorkommen.

## Himmelsroute bisher

**Kann weiterverwendet werden:**

- Spielfeld-Szene `Spielfeld()` mit Figma-Assets aus `public/himmelsroute/spielfeld/`, Scroll-Mechanik (Szene folgt `scrollY`, kein Zurückscrollen nach unten), infoOverlay-Farbwechsel Tag/Nacht, Pfeil-Button „Zur nächsten Stelle“.
- Erklär-Sheet mit Illustration (`ErklaerIllustration`, `public/himmelsroute/erklaerung/`).
- Zuordnen-Sheet nach Figma: Kartenstapel mit festen Plätzen, Felder, Antippen zum Auswählen und Ablegen, Zurücklegen.
- Alle gemeinsamen Sheets, der Countdown und das Ergebnis-Sheet über `SpielSheets.tsx`.
- Gegenstandsliste und SVGs, Treppe `naechsteStufe` (3–7).
- Begegnungs-Animation (`BegegnungsObjekt`): fliegt abwechselnd von links und rechts durch.

**Wird voraussichtlich ersetzt** – vorläufige Einschätzung, Abgleich mit dem Master offen:

- Auswahl der Begegnungen (fester Zufallsstartwert, siehe Kollisionen).
- Ablenker-Auswahl (immer die ersten drei passenden der Liste).
- Pausenlogik (würfelt nach **jeder** Runde neu, keine Sperren wie in Wolkensammeln, Ruhe-Pause ohne eigenen Screen).
- Punkteformel und Bewertung (direkt im Screen statt in `himmelsroute-session.ts`).
- Fehlendes Speichern der Sitzung, keine Proberunde.
- Alte Szenengrafiken in `public/himmelsroute/szene/`.

## Kollisionen

**Mit der Spezifikation: offen – Master fehlt.** Ohne `00-master.md` lässt sich nicht prüfen, was ihr widerspricht.

Im Code selbst unklar oder widersprüchlich:

1. **Immer dieselben Begegnungen:** `waehleBegegnungen()` nutzt einen festen Startwert (`zufall(20260917)`). Bei gleicher Schwierigkeit kommen in jeder Runde dieselben Gegenstände in derselben Reihenfolge.
2. **Ablenker nicht zufällig:** Es sind immer die ersten drei Gegenstände aus fremden Familien. Die Karten werden alphabetisch sortiert.
3. **Bewertung doppelt:** `bewerteZuordnung()` in `himmelsroute-session.ts` ist fertig, wird aber nicht benutzt. Der Screen rechnet dieselbe Formel selbst nach.
4. **Pause unterschiedlich:** Wolkensammeln pausiert erst nach 3 Fehlern in Folge und immer mit Bewegung. Himmelsroute würfelt nach jeder Runde 50/50 Bewegung/Ruhe. Bei „Ruhe“ geht es ohne eigenen Screen direkt in den Countdown.
5. **Ruhe-Pause ohne Design:** Nur die Bewegungspause hat ein Figma-Design. Das alte Ruhe-Overlay in Wolkensammeln ist toter Code.
6. **Keine Daten für Himmelsroute:** Nichts wird gespeichert. Das Dashboard und der „letztes Mal“-Vergleich lesen nur Wolkensammeln.
7. **Einstellungen:** Das Himmelsroute-Einstellungen-Sheet ist nicht erreichbar, es gibt keinen Knopf dafür. Anzeigedauer und -pause beeinflussen das Spiel dort nicht.
8. **Konstanten verstreut:** Himmelsroute hat keine Config-Datei. Wolkensammeln verlangt dagegen alle Zahlen in `config.ts`.
9. **Gemeinsame Bausteine hängen an Wolkensammeln:** `SpielSheets.tsx` und `SpielHud.tsx` importieren Kurven aus `games/wolkensammeln/config.ts`. Ein gemeinsames Bewegungsmodul für Spiele fehlt.
10. **Wolkensammeln-Erklärtext:** Er sagt „in genau dieser Reihenfolge“, bewertet wird aber nur die Auswahl. Das ist bekannt und für Himmelsroute nur relevant, falls Texte geteilt werden.
11. **Ergebnis Himmelsroute:** Die Liste der einzelnen Begegnungen (richtig/falsch) und die Zeile zur Unterbrechung wurden bei der Angleichung an Wolkensammeln entfernt. Ob sie laut Spezifikation gebraucht werden, ist offen.
