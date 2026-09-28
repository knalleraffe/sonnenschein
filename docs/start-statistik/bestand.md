# Startseite und Statistiken – Bestandsaufnahme

Stand: 25.09.2026, Arbeitsverzeichnis (Branch `main`, vieles nicht committet). Grundlage: Master-Abschnitte 0, 1 und 6.

## Startseite und Statistiken bisher

### Dateien

| Pfad | Wofür |
|---|---|
| `src/screens/Dashboard.tsx` | Startseite („Heute“): Kopf mit Streak-Badge und Wochenleiste, Stimmungscheck-Karte mit Tacho-Symbol und Kreuz, große Punktekarte („12“), „Verfügbare Spiele“ (Wolkensammeln, Himmelsroute, drei Platzhalter „[SPIEL 2–4]“) |
| `src/components/ui/WeekStrip.tsx` | Wochenleiste Mo–So mit Zahl-Chips aus `mock.woche` (überall „15“), heute = fester Index 3 |
| `src/components/ui/StreakBadge.tsx` | Flammen-Pille mit `mock.serie` (28) |
| `src/components/ui/Card.tsx`, `Erscheinen.tsx`, `ZaehlZahl.tsx`, `SegmentedControl.tsx`, `TabBar.tsx` | App-Karte, gestaffeltes Einblenden, hochzählende Zahl, Segment-Umschalter, schwebende Tab-Leiste (Dashboard, Statistiken, Glossar) |
| `src/screens/Statistiken.tsx` | „Deine Daten“: Tab-Leiste mit **vier** Ebenen (Session, Verlauf, Zusammenhänge, Befunde), Zeitraum-Umschalter 7 Tage / 30 Tage / Alles |
| `src/components/stats/*` | Karten und Diagramme der Ebenen (siehe unten) |
| `src/lib/statistik.ts` | Alle Berechnungen und Sätze der Statistik, ausschließlich aus `mock.sessions` |
| `src/data/mock.ts` | Platzhalterdaten: Punkte, Serie, Woche, Stimmungscheck-Texte, 52 erfundene Sessions mit Elefanten- und Hasen-Punkten 0–100, Gemeinschaftsdaten |
| `src/screens/Avatar.tsx` | Sonnenschein-Screen (`/sonnenschein`): `Sonnenschein` fest mit `froehlich`, Vitalität 1 |
| `src/screens/Playground.tsx` | Testseite für alle Stimmungen und die Vitalität |

### Navigation zwischen den Statistik-Ebenen

- `StatTabs` (Unterstrich gleitet per `layoutId`) schaltet zwischen den vier Ebenen um. Alle bleiben eingehängt, sichtbar ist nur die aktive. Der Wechsel überblendet mit 12 px Versatz.
- Der Zeitraum-Umschalter (`SegmentedControl`) erscheint nur bei Verlauf und Zusammenhänge.
- Es gibt keine Deep-Links: `/statistiken` öffnet immer auf „Verlauf“.

### Vorhandene Diagramme und Karten

| Ebene | Inhalt |
|---|---|
| Session (`SessionTab`) | letzte Session: zwei Ergebniskarten (Elefanten- und Hasen-Punkte mit Δ zur Vorsession), Puls vor Start → nach Unterbrechung → Ende, Balken vorher/nachher |
| Verlauf (`VerlaufTab`) | `BalanceCard` (Modi-Balken), `VerlaufsChart` und `PulsChart` (beide über `LinienKarte`: Linien per pathLength, Scrubber), `TrainingsfrequenzCard`, `FehlerartenCard` |
| Zusammenhänge (`ZusammenhaengeTab`) | `TagesrhythmusChart`, `StreuChart` (Puls gegen Punkte, Trendlinie), `BewegungsCard`, `GesperrteKarte` „Optimaler Pulsbereich“, Beobachtungs-Sätze |
| Befunde (`BefundeTab`) | Verteilung aller Nutzenden, gemeinsame Befunde in Prozent, **Konstanz-Rangliste nach Trainingsserie** |

## Komponenten aus den Spielen

| Baustein | Pfad | Hinweis |
|---|---|---|
| Sheet | `src/components/ui/Sheet.tsx` | Variante `karte` (Figma-Stand), Optionen `durchlaessig` und `hoehe`, ruhige Variante über `SheetBewegung` (`sheetBewegung.ts`). Hält immer mindestens 80 px Abstand nach oben. |
| Primärer und sekundärer Button | `knopfPrimaer`, `knopfSekundaer` in `src/components/spiel/SpielSheets.tsx`, Stile `.sheet-primary` und `.sheet-secondary` in `src/styles/index.css` | gelber Verlauf `#ffca67 → #ffba3a` bzw. `#f2f2f2`, 56 px hoch |
| Text-Sheet, Ergebnis-Sheet, Puls-, Einstellungen-, Verlassen-, Bewegungspause-Sheet | `SpielSheets.tsx` | Das Ergebnis-Sheet hat den Zeilen-Stil aus 460:347 (Label links, Wert rechts). |
| Karte (Stil 467:398) | inline in `src/components/himmelsroute/Rueckweg.tsx` | weiß, Kontur 0,5 px `#f2f2f2`, Radius ≈ 26 % der Kantenlänge, Schatten `0 8px 40px rgba(0,0,0,0.06)`. Es gibt keine eigene Komponente dafür. |
| Glas-Pille | `pille()` in `src/components/himmelsroute/Leisten.tsx`, ebenso in `src/components/spiel/SpielHud.tsx` | 48 px hoch, `bg-white/20`, Schatten `0 8px 40px rgba(0,0,0,0.12)`, Trennlinie (`Trenner`) |
| Runder Glas-Button | Zurück-Button in `Leisten.tsx` und `SpielHud.tsx` | 48 × 48 px |
| Puls-Slider | `PulsSheet` in `SpielSheets.tsx` und `.sheet-range` in `index.css` | Spur 6 px `#ffba3a` / `#dddddd`, Griff 40 × 24 px; Füllung über `--range-progress` |
| Echoo (Spiel) | `src/components/spiel/Echoo.tsx` (Wolkensammeln, Figma-Grafik, Fortschritt 0–1, lachend) und `src/components/himmelsroute/EchooMini.tsx` (PNG, Atem-Schleife, `ruht`, `jubelt` mit Grinsen und Lichtringen) | Zustände: Wolkensammeln wächst mit dem Fortschritt, EchooMini ruhig oder jubelnd |
| Echoo (App) | `src/components/avatar/Sonnenschein.tsx` und `emotions.ts` | SVG mit 6 Stimmungen (fröhlich, neutral, müde, aufgeregt, nachdenklich, traurig) und `vitality` 0–1 (Sättigung, Strahlenlänge, Glanz). **Keine Schleife.** |
| Wegpunkte | inline in `Rueckweg.tsx` | 44–56 px, gestrichelte weiße Kontur, Nummer `#c0c0c0`, Ergebnis-Abzeichen |
| Mini-Route | `src/components/himmelsroute/MiniRoute.tsx` | 148 × 127 px: Erde, Wegpunkte in Akzentfarbe, Echoo |
| Easing-Kurven | `konfig.kurven` in `src/games/wolkensammeln/config.ts` (standard, ruhig, druck), `konfig.kurve` in `src/games/himmelsroute/config.ts` (`0.22, 1, 0.36, 1`), `src/lib/motion.ts` (`easeAus`, `easeStandard`, `easeFeder` **mit Überschwingen**, Federn `spring`, `springSoft`, `springTap`) | |

## Sitzungsdaten beider Spiele

| | Wolkensammeln | Himmelsroute |
|---|---|---|
| Speicherort | `localStorage` `sonnenschein.wolkensammeln.v1`, JSON-Array (`storage.ts`) | `localStorage` `sonnenschein.himmelsroute.v1`, JSON-Array (`storage.ts`) |
| Datentyp | `RundenErgebnis` (`games/wolkensammeln/types.ts`) | `SitzungsErgebnis` (`games/himmelsroute/types.ts`) |
| Zeit | `zeitstempel` (Ende der Runde) | `zeitstempel` (Ende der Sitzung) |
| Leistung | `durchgaenge[]` mit `laenge` (= Stufe), `richtig`, `hauptIndex`, `phaseUnterbrechung` (`'vor'`/`'nach'`), außerdem `spanne`, `hoechsteLaenge`, `trefferquote`, `licht` | `merkspanne1`, `merkspanne2`, `runden[]`, `anteilRichtigeWegpunkte`, `endeDurchgang1` und `endeDurchgang2` |
| Pause | `unterbrechungen[]`: `bedingung` (`'bewegung'`/`'stille'`), `verhalten` (`'bewegt'`/`'ohneBewegung'`), `nachHauptDurchgang`; 0 bis viele pro Runde | `bedingung`, `verhalten` (genau eine Pause) |
| Puls | `startPuls`, `bewegungsPuls` (null ohne Bewegung) | `pulsVorher`, `pulsDanach` (null bei „ohne Bewegung“) |
| Dauer | **nicht gespeichert** | `gesamtdauer` (ms) |

**Vor- und Nach-Wert nach Master Abschnitt 2:**
- **Himmelsroute:** direkt ablesbar. Vor-Wert = `merkspanne1`, Nach-Wert = `merkspanne2`, Einheit Wegpunkte.
- **Wolkensammeln:** berechenbar, wenn die Runde eine Pause hatte. Vor-Wert = Mittel der `laenge` der letzten 6 Haupt-Durchgänge mit `phaseUnterbrechung === 'vor'`, Nach-Wert = Mittel der ersten 6 danach (bei weniger: alle vorhandenen). Ohne Pause gibt es keinen Nach-Wert.
- **Einheit der Wolkensammeln-Stufe:** Anzahl Wolken in der Folge (`laenge`, 3–10), also „Wolken“.

## Echoo-Zustand heute

- Der Sonnenschein-Screen bestimmt keinen Zustand. `Avatar.tsx` zeigt fest `emotion="froehlich"` und `vitality={1}`.
- Zustände gibt es nur als Bausteine: 6 Stimmungen und die Vitalität, einstellbar im Playground.
- Eine Schleife hat nur Echoo im Spiel (EchooMini atmet), der Sonnenschein-Avatar nicht.

## Sonstiges

- **`src/data/modes.ts`:** zwei Modi, `langsam` = „Elefanten-Modus“ und `schnell` = „Hasen-Modus“, mit Farbe, Linienstärke und Punktform. Das Dashboard beschriftet Wolkensammeln mit dem Hasen-Modus. Die Himmelsroute hat keinen Modus.
- **Stimmung:** wird nirgends gespeichert. `mock.stimmungscheck` enthält nur Titel und Text, die Karte hat nur ein Schließen-Kreuz.
- **Streak-Logik (muss weg):**
  - `StreakBadge.tsx` und `mock.serie`
  - `berechneSerie()` in `statistik.ts`
  - die Verteilung `serie` in `mock.gemeinschaft`
  - die Konstanz-Rangliste und die Befund-Verteilung „Trainingsserie“ in `BefundeTab.tsx`
  - der Frequenz-Satz „an x von 7 Tagen trainiert“ in `TrainingsfrequenzCard` ist Streak-nah

## Kollisionen mit der Spezifikation

1. **Wolkensammeln ohne Ruhe-Bedingung:** Die Pause ist dort immer „Bewegung“. Wolkensammeln-Sitzungen landen also nie in der Ruhe-Gruppe, und „beide Bedingungen ausgewogen“ gilt nur für die Demodaten.
2. **Wolkensammeln-Pause ist nicht garantiert:** Sie kommt erst nach 3 Fehlern in Folge. Das kann gar nicht oder mehrmals pro Runde passieren. Ohne Pause gibt es keinen Nach-Wert und kein Δ. Bei mehreren Pausen ist offen, welche zählt. Mein Vorschlag: die erste.
3. **Dauer fehlt bei Wolkensammeln:** Die Zeile „Dauer“ lässt sich aus den gespeicherten Daten nicht füllen.
4. **Stimmung wird nicht gespeichert:** Nötig ist ein neuer Speicher, pro Tag eine Stufe 1–5. Der Stimmungscheck hat bisher keine Skala-Logik.
5. **Statistiken haben vier Ebenen:** Die Spezifikation spricht von den „bestehenden drei“. „Befunde“ mit Gemeinschaftsvergleich und Serien-Rangliste passt nicht dazu. Mein Vorschlag: entfernen.
6. **Datenquelle der Statistik:** Alles rechnet mit erfundenen Elefanten- und Hasen-Punkten 0–100 aus `mock.ts`, nicht mit den Spieldaten. Das Modell muss komplett ersetzt werden.
7. **Zwei Echoo-Figuren:** Der Sonnenschein-Avatar hat Stimmungen, aber keine Schleife. EchooMini und die Spiel-Echoo haben eine Schleife, aber keine Stimmungen. Die Spezifikation verlangt „bestehende Komponente mit ihrer Schleife“ und den „Zustand wie im Sonnenschein-Screen“. Der Sonnenschein-Screen berechnet aber keinen Zustand. Mein Vorschlag:
   - `Sonnenschein` mit `vitality` für „heller“ und „gedämpfter“
   - ohne traurige Stimmung
   - als Schleife das Atmen aus der Spiel-Echoo, auch auf der Startseite
8. **Modus-Label für Himmelsroute fehlt:** Sie hat in `modes.ts` keinen Modus. Offen ist, welcher Modus zu ihr gehört.
9. **Dauerschleifen außerhalb von Echoo:** `GesperrteKarte` hat pulsierendes Schloss, atmende Vorschau und wandernden Rahmen. Dazu federn `easeFeder` und die Federn in `lib/motion.ts` nach, und das Dashboard nutzt sie. Das widerspricht Master Abschnitt 0.
10. **Routen uneinheitlich:** Wolkensammeln liegt unter `/spiel/wolkensammeln`, Himmelsroute unter `/himmelsroute`. Beide öffnen ihr Erklärungs-Sheet selbst, 600 ms nach dem Laden. Der Container Transform muss daran anschließen.
11. **Wochenleiste in 180:37:** Sie zeigt Zahlen pro Tag, die Spezifikation verlangt Punkte. Übernommen wird deshalb nur der Stil.

## Entscheidungen (Julius, 25.09.2026)

- **Wolkensammeln-Pause:** Es zählt die erste Pause. Vor-Wert = mittlere Stufe der letzten 6 Haupt-Durchgänge vor ihr, Nach-Wert = der 6 danach. Runden ohne Pause haben keinen Nach-Wert und kein Δ. Sie erscheinen nur im Verlauf, mit dem Mittel der letzten 6 Durchgänge als Vor-Wert.
- **Befunde:** wird entfernt. Die Statistiken haben nur noch die Ebenen Sitzung, Verlauf und Zusammenhänge.
- **Echoo auf der Startseite:** Sonnenschein-Avatar, Zustand über die Vitalität (heller oder gedämpfter, nie traurig), dazu als Schleife das sanfte Atmen der Spiel-Echoo.
- **Modus der Himmelsroute:** Elefanten-Modus.
