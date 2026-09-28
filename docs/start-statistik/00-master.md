# Startseite und Statistiken · Master-Spezifikation

Liegt unter `docs/start-statistik/00-master.md`. Umsetzung in sieben Teil-Prompts (Abschnitt 9). Lies pro Teil nur die genannten Abschnitte.

---

## 0 · Arbeitsweise

- Arbeite selbstständig und erkläre jeden Meilenstein in einfachem, nicht technischem Deutsch, inklusive wie Julius ihn im Browser prüft.
- Bleib im Umfang des Teil-Prompts. An Wolkensammeln und Himmelsroute änderst du nichts, außer an Einstiegspunkten (Start aus der Spielkarte).
- **Texte, Zahlen und Werte nur aus dieser Datei.** Aus Figma kommt nur Gestaltung (fileKey `dJ14dXd6lLt7aPJif2EbJY`, Figma-MCP).
- **Keine neuen Gestaltungswerte.** Baue alles aus den Komponenten und Werten der beiden Spiele: Sheet-Komponente, primärer Button (gelber Verlauf), sekundärer Button (grau), weiße Karten mit weichem Schatten, Glas-Pille („Runde 1 | 0 von 3"), runder Glas-Button, Puls-Slider, Echoo-Komponente, Wegpunkte und Mini-Route, Farben, Verläufe, Radien, Schatten, Abstände, Schriftgrößen, Easing-Kurven. Trag jeden Screen oder Baustein ohne Figma-Design in `docs/start-statistik/ohne-design.md` ein.
- Animiert werden nur `transform`, `opacity`, `stroke-dashoffset` und `grid-template-rows`. Dauerschleifen nur an Echoo. Kein Nachfedern, keine Partikel.
- Zahlen deutsch formatieren: Dezimalkomma, eine Nachkommastelle, echtes Minuszeichen (U+2212), „±0", geschütztes Leerzeichen vor Einheiten und „%".
- Bei Kollisionen mit dem Code: nicht raten, melden.

---

## 1 · Grundidee

Die App beantwortet eine Frage: Hilft mir Bewegung beim Denken? Die Startseite zeigt, wo man steht, und führt mit einem Tipp ins Spiel. Die Statistiken zeigen nicht Rohwerte, sondern die Veränderung von vor zu nach der Pause und den Vergleich Bewegung gegen Ruhe. Echoo ist ein Spiegel, kein Pflegeobjekt: keine Streaks, kein „Echoo wartet auf dich", keine Schuld.

---

## 2 · Kennzahlen

| Spiel | Vor-Wert | Nach-Wert | Einheit |
|---|---|---|---|
| Wolkensammeln | mittlere Stufe der letzten 6 Runden vor der Pause | mittlere Stufe der letzten 6 Runden nach der Pause (bei weniger Runden: alle vorhandenen) | Wolken |
| Himmelsroute | Merkspanne Durchgang 1 | Merkspanne Durchgang 2 | Wegpunkte |

- Veränderung Δ = Nach-Wert − Vor-Wert, immer absolut, nie in Prozent.
- Die Trefferquote von Wolkensammeln ist kein Leistungswert (die Treppe hält sie bei etwa 70 %) und erscheint nur als Nebenzeile.
- Die beiden Spiele werden nie zu einem Gesamtwert verrechnet. Einzige Ausnahme ist Echoos Zustand (Abschnitt 3), der jeden Wert relativ zum eigenen Schnitt des Spiels betrachtet.
- Gruppiert wird immer nach **zugewiesener** Pausenbedingung (Bewegung oder Ruhe), nie nach tatsächlichem Verhalten.
- Stimmung: Skala 1–5 aus dem Stimmungscheck, dem Tag zugeordnet.

**Demodaten:** Konstante `DEMO_DATA` (Standard: true für den Prototyp). Erzeugt 24 plausible Sitzungen über 5 Wochen, beide Spiele, beide Bedingungen ausgewogen, Bewegung im Schnitt etwas besser als Ruhe, mit Streuung, Pulsanstiege 10–50 Schläge, Stimmungen an den meisten Tagen. Demodaten werden nie gespeichert und nie mit echten Daten gemischt.

---

## 3 · Startseite

Basis: Figma 180:37 (nur Stil von Wochenleiste, Stimmungskarte und Kartenraster). Aufbau von oben nach unten:

**Kopf mit Echoo**
- Echoo groß oben (bestehende Komponente mit ihrer Schleife), sein Zustand wie im Sonnenschein-Screen. Antippen öffnet den Sonnenschein-Screen, Echoo wächst dabei mit (transform).
- Zustand: Mittelwert der letzten 3 Vor-Werte (beide Spiele), jeweils als Abstand zum eigenen Schnitt des Spiels in Standardabweichungen. Über +0,5 → heller, unter −0,5 → gedämpfter, sonst wie gewohnt. Unter 3 Sitzungen: neutraler Zustand.

**Wochenleiste**
- Titel „Heute", rechts Glas-Pille „{x} von 7 Tagen" (Tage mit Messung in dieser Woche). Die Streak-Flamme entfällt.
- Mo–So mit echten Daten der aktuellen Woche, heute hervorgehoben wie in 180:37, Tage mit Messung mit kleinem Punkt in Akzentfarbe, zukünftige Tage gedämpft.
- Antippen eines Tages mit Messung öffnet das Tages-Sheet.

**Stimmungscheck**
- Karte mit Skala aus 180:37 und darunter Slider im Stil des Puls-Sliders, 5 Stufen mit Einrasten; die Nadel der Skala dreht sich mit.
- Nach dem Einrasten klappt die Karte nach 600 ms zu einer Zeile zusammen (grid-template-rows). Antippen der Zeile klappt sie wieder auf. Kein Schließen-Kreuz. Einmal pro Tag, jederzeit änderbar, keine Pflicht vor dem Spiel.

**Spielkarten**
- Zwei Karten nebeneinander: Wolkensammeln und Himmelsroute. Inhalt: Bild aus der jeweiligen Spielszene (Wolken bzw. Erde mit Route), Name, Modus-Label aus `modes.ts`, letzter Vor-Wert oder „Noch nicht gespielt".
- „Heute dran"-Pille auf der Karte des Spiels, dessen letzte Sitzung länger her ist (nie gespielt zählt als am längsten her; Gleichstand → Wolkensammeln). Wurden beide heute gespielt, keine Pille.
- Antippen: Die Karte wächst bildschirmfüllend auf (Container Transform, nur transform und opacity, 500 ms) und geht in das Erklärungs-Sheet des Spiels über.

**Zusammenhänge-Karte**
- Zeigt den Kernsatz aus Abschnitt 5 (Spiel mit mehr Sitzungen) oder den Fortschrittssatz. Antippen öffnet die Statistiken auf der Ebene „Zusammenhänge".

**Entfällt:** großer Echoo am Seitenende, Mini-Echoo in der Trainingskarte, Trainingskarte „Bereit für dein heutiges Training?", Streak-Flamme, Platzhalter-Daten („15").

---

## 4 · Statistiken

- Oben Tabs für die beiden Spiele (aus der Glas-Pille gebaut), darunter die bestehenden drei Ebenen: Sitzung, Verlauf, Zusammenhänge. Behalte die vorhandene Ebenen-Navigation; gibt es keine, nutze einen Umschalter im Pillen-Stil.
- Jede Ebene hat über jedem Diagramm einen Satz, der das Diagramm übersetzt.
- Diagramme als SVG: Linien zeichnen sich per stroke-dashoffset, Punkte blenden gestaffelt ein. Antippen eines Punkts öffnet die Sitzung als Sheet.

**Sitzung**
- Kopf „{Datum}, {Uhrzeit}", Blättern zwischen Sitzungen per Wischen oder Pfeil-Buttons.
- Groß: „{Vor} → {Nach}" mit Einheit, darunter Δ.
- Zeilen: Pause (Bewegung oder Ruhe; zusätzlich „Ohne Bewegung fortgefahren", falls zutreffend), Puls „{p1} → {p2}", Stimmung, Dauer.
- Wolkensammeln: Stufenverlauf der Sitzung als Linie mit Markierung der Pause; Trefferquote als Nebenzeile.
- Himmelsroute: zwei Mini-Routen nebeneinander (vor und nach der Pause); Zeile mit dem Grund für das Ende von Durchgang 1.

**Verlauf**
- Vor-Werte Sitzung für Sitzung als Linie mit Punkten, Umschalter „4 Wochen" / „Alle".

**Zusammenhänge**
1. **Bewegung oder Ruhe?** Punktdiagramm mit zwei Spalten (Bewegung, Ruhe), ein Punkt pro Sitzung = Δ, Mittelwert als waagerechte Linie. Ab 5 Sitzungen pro Bedingung, sonst Fortschrittszustand mit Balken.
2. **Wie stark bewegen?** Streudiagramm nur für Bewegungs-Sitzungen: x = Pulsanstieg, y = Δ. Ab 8 Sitzungen. Pulsbereich-Satz nur, wenn die Pulsanstiege mindestens 20 Schläge auseinanderliegen: 10er-Bereiche bilden, Bereich mit dem höchsten mittleren Δ und mindestens 3 Sitzungen nennen. Sonst Hinweis-Satz.
3. **Stimmung und Leistung:** Streudiagramm x = Stimmung (1–5), y = Vor-Wert. Ab 8 Sitzungen mit Stimmung.

„Kein klarer Unterschied" gilt, wenn der Unterschied der Mittelwerte kleiner ist als die halbe gemeinsame Standardabweichung.

---

## 5 · Texte

`{…}` sind Platzhalter. Einheit im Singular bei genau 1 („1 Wegpunkt", „1 Wolke").

**Startseite**

| Element | Text |
|---|---|
| Echoo-Satz, über dem Schnitt | Deine letzten Messungen liegen über deinem Schnitt. |
| Echoo-Satz, im Schnitt | Deine letzten Messungen liegen in deinem Schnitt. |
| Echoo-Satz, unter dem Schnitt | Deine letzten Messungen liegen unter deinem Schnitt. |
| Echoo-Satz, unter 3 Sitzungen | Noch zu wenige Messungen für einen Vergleich. |
| Wochenleiste Titel | Heute |
| Wochenleiste Pille | {x} von 7 Tagen |
| Stimmung Titel | Wie fühlst du dich heute? |
| Stimmung Text | Dein Stimmungscheck für heute. |
| Stimmungsstufen 1–5 | Schlecht · Eher schlecht · Geht so · Eher gut · Gut |
| Stimmung eingeklappt | Stimmung heute: {Stufe} |
| Abschnitt Spiele | Spiele |
| Spielkarte Wert | Zuletzt: {Vor-Wert} {Einheit} |
| Spielkarte leer | Noch nicht gespielt |
| Pille Empfehlung | Heute dran |
| Zusammenhänge-Karte Titel | Deine Zusammenhänge |

**Tages-Sheet**

| Element | Text |
|---|---|
| Titel | {Wochentag}, {Tag}. {Monat} |
| Zeile | {Spiel} · {Uhrzeit} — {Vor} → {Nach} {Einheit} · {Bewegung oder Ruhe} |
| Primär | Zur Statistik |

**Statistiken**

| Element | Text |
|---|---|
| Ebenen | Sitzung · Verlauf · Zusammenhänge |
| Pausen-Labels | Bewegung · Ruhe |
| Zusatz Verhalten | Ohne Bewegung fortgefahren |
| Zeilen Sitzung | Pause · Puls · Stimmung · Dauer · Trefferquote · Ende von Durchgang 1 |
| Ende-Gründe | Mehr als die Hälfte falsch · Zweiter Fehlversuch · Längste Route geschafft |
| Verlauf Satz | Dein Wert vor der Pause, Sitzung für Sitzung. |
| Verlauf Umschalter | 4 Wochen · Alle |
| Leer | Noch keine Sitzung. |
| Titel 1 | Bewegung oder Ruhe? |
| Kernsatz | Nach Bewegung im Schnitt {ΔB} {Einheit}, nach Ruhe {ΔR} ({nB} und {nR} Sitzungen). |
| Zusatz, Bewegung vorn | Bewegung liegt bei dir bisher vorn. |
| Zusatz, Ruhe vorn | Ruhe liegt bei dir bisher vorn. |
| Zusatz, kein Unterschied | Bisher zeigt sich kein klarer Unterschied. |
| Fortschritt | Noch {a} Sitzungen mit Bewegung und {b} mit Ruhe bis zur ersten Auswertung. |
| Hinweis Gruppierung | Gruppiert nach zugewiesener Pause. {n}-mal wurde ohne Bewegung fortgefahren. |
| Titel 2 | Wie stark bewegen? |
| Pulsbereich | Am meisten bringt dir bisher ein Pulsanstieg von {a}–{b} Schlägen pro Minute. |
| Pulsbereich fehlt | Beweg dich mal leichter, mal stärker – dann zeigt sich, welcher Bereich dir am meisten bringt. |
| Titel 3 | Stimmung und Leistung |
| Stimmungssatz | An Tagen mit guter Stimmung im Schnitt {x} {Einheit}, sonst {y}. |
| Zu wenig Daten (2 und 3) | Ab {n} Sitzungen siehst du hier einen Zusammenhang. |

„Gute Stimmung" = Stufe 4 oder 5. Im Fortschrittssatz entfällt der Teil einer Bedingung, die schon genug Sitzungen hat.

---

## 6 · Figma-Referenzen

| Node | Verwendung |
|---|---|
| 180:37 | Startseite bisher: nur Stil von Wochenleiste, Stimmungsskala, Kartenraster |
| 467:398 | Kartenstil |
| 460:224 | Puls-Slider (Vorlage für den Stimmungs-Slider) |
| 460:347 | Zeilen-Stil (Label links, Wert rechts) |
| 315:3007 | Himmelsverlauf, Erde, Wolken für Spielkarten-Bilder |

---

## 7 · Was entfällt

Streak-Flamme und jede Streak-Logik, „Echoo wartet bereits auf dich", Trainingskarte, großer Echoo am Seitenende, Prozent-Veränderungen, Trefferquote als Hauptwert, Platzhalter-Daten.

---

## 8 · Ohne Design

Startseite in neuer Anordnung, Tages-Sheet, eingeklappte Stimmungszeile, Zusammenhänge-Karte, alle Statistik-Diagramme und Fortschrittszustände.

---

## 9 · Teil-Prompts

| Teil | Inhalt | Liest |
|---|---|---|
| 01 | Bestandsaufnahme (nur lesen) | 0, 1, 6 |
| 02 | Datenschicht, Demodaten, Texte | 0, 2, 4 (Regeln), 5 |
| 03 | Startseite: Aufbau | 0, 1, 3, 5, 6 |
| 04 | Startseite: Interaktion | 0, 3 |
| 05 | Statistiken: Sitzung und Verlauf | 0, 2, 4, 5 |
| 06 | Statistiken: Zusammenhänge | 0, 2, 4, 5 |
| 07 | Feinschliff und Abnahme | 0, 7, 8 |
