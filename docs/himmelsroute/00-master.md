# Himmelsroute – Umbau · Master-Spezifikation

Diese Datei ist die vollständige Spezifikation für den Umbau des Spielmodus „Himmelsroute". Sie liegt im Projekt unter `docs/himmelsroute/00-master.md`. Umgesetzt wird in sechs Teil-Prompts (`01` bis `06`, Abschnitt 10). Jeder Teil-Prompt sagt dir, welche Abschnitte du dafür lesen sollst – lies nur diese.

---

## 0 · Arbeitsweise

- Arbeite selbstständig: Lege Dateien an und ändere sie, ohne für Routine-Schritte nachzufragen. Installiere neue Pakete nur, wenn es ohne sie nicht geht, und nenne sie.
- Erkläre nach jedem Meilenstein in einfachem, nicht technischem Deutsch, was du gemacht hast und wie Julius es im Browser prüfen kann.
- Bleib im Umfang des jeweiligen Teil-Prompts und hör danach auf.
- Ändere nichts an Wolkensammeln, Dashboard, Statistiken oder anderen Bereichen, außer ein Teil-Prompt erlaubt es ausdrücklich.
- **Texte, Zahlen und Werte kommen ausschließlich aus dieser Spezifikation.** Aus Figma übernimmst du nur die Gestaltung: Layout, Farben, Verläufe, Radien, Schatten, Abstände, Grafiken. Stehen in Figma andere Texte, gilt diese Datei.
- Figma-Datei „Prototyp", fileKey `dJ14dXd6lLt7aPJif2EbJY`. Hol den Design-Kontext über den Figma-MCP-Server anhand der Node-IDs in Abschnitt 9.
- **Fehlt für einen Screen oder Zustand ein Design, baue ihn ausschließlich aus bestehenden Komponenten und Werten der App** – vor allem aus Wolkensammeln und den Frames in Abschnitt 9: dieselbe Sheet-Komponente, dieselben Buttons, Schriftgrößen, Farben, Radien, Schatten und Abstände. Erfinde keine neuen Farben, Schriftgrößen oder Schatten. Trag jeden so gebauten Screen in `docs/himmelsroute/ohne-design.md` ein (Name, kurze Beschreibung, verwendete Komponenten, Pfad im Code), damit Julius ihn in Figma nachziehen kann.
- Kollidiert etwas hier mit dem bestehenden Code oder ist etwas unklar: nicht raten, sondern kurz melden.

---

## 1 · Idee und Story

Echoo, die Sonne der App, geht in jeder Runde hinter der Erde auf und steigt durch den Himmel. Unterwegs begegnet er Gegenständen. Oben angekommen, baut man aus der Erinnerung seine Route nach: Man legt die Gegenstände in der Reihenfolge der Begegnung auf Wegpunkte, von der Erde aus nach oben. Dann zeichnet sich die Route. Stimmt sie, gleitet Echoo an ihr entlang zurück zur Erde und strahlt dort vor Freude. Eine Runde ist ein Tag: Aufgang, Reise, Heimkehr.

- **Echoo ist ein Spiegel, kein Pflegeobjekt.** Echoo fliegt die Route nur, wenn sie stimmt; sonst bleibt er ohne traurige Reaktion stehen. Fehler haben keine Strafe und keine traurige Reaktion. Man sieht nur, wie weit die eigene Erinnerung gereicht hat.
- **Die Route ist das zentrale Motiv.** Mit jeder Runde wird sie länger und reicht höher: anfangs bis unter die Wolken, später bis zu den Sternen.
- **Eine durchgehende Szene.** Die ganze Runde spielt im selben Raum. Sheets legen sich darüber, statt ganze Seiten zu wechseln.

---

## 2 · Ablauf

**Sitzung**

1. Spielauswahl → Erklärungs-Sheet
2. Nur beim allerersten Start: Proberunde → Sheet „Proberunde beendet"
3. Puls-vorher-Sheet
4. Durchgang 1: Runden nach den Regeln in Abschnitt 3
5. Sheet „Durchgang 1 beendet"
6. Pause nach zugewiesener Bedingung (Bewegung oder Ruhe – Zuweisung und Ablauf wie in Wolkensammeln) → nach „Ich habe mich bewegt“ das Puls-danach-Sheet; nach „Ohne Bewegung fortfahren“ geht es ohne Pulsabfrage direkt mit Durchgang 2 weiter
7. Durchgang 2: beginnt wieder bei `START_LENGTH`, gleiche Regeln
8. Endergebnis

**Runde**

1. Aufgang: Echoo geht auf, Rundenstart-Anzeige
2. Aufstieg mit `L` Begegnungen
3. Übergang in die Übersicht, Rückweg-Sheet fährt herein
4. Gegenstände auf Wegpunkte legen → „Route bestätigen"
5. Route zeichnet sich, jeder Wegpunkt zeigt sein Ergebnis
6. Richtige Route: Echoo fliegt die Route hinab heim, grinst und strahlt. Falsche Route: Echoo bleibt in der Ecke.
7. Sheet je nach Ergebnis: Rundenerfolg, Zweiter Versuch, Durchgang 1 beendet oder Endergebnis

**Jederzeit:** Zurück-Pfeil oben links → Abbruch-Bestätigung. Solange ein Sheet offen ist, laufen Zeigedauer und Gesamtzeit nicht weiter, und die Szene ist dahinter abgedunkelt wie bei den bestehenden Sheets. Nach „Fortsetzen" läuft eine unterbrochene Begegnung mit ihrer Restzeit weiter, sie beginnt nicht von vorn.

---

## 3 · Regeln, Gegenstände, Messung

### Konstanten

Alle Werte gehören in eine zentrale Konfigurationsdatei.

| Konstante | Wert | Bedeutung |
|---|---|---|
| `GAME_NAME` | Himmelsroute | Spielname überall in der App |
| `START_LENGTH` | 3 | Begegnungen in Runde 1 jedes Durchgangs |
| `MAX_LENGTH` | 11 | Längste Route (12 Familien minus Zusatzgegenstand) |
| `ATTEMPTS_PER_LENGTH` | 2 | Versuche pro Länge |
| `RUNS` | 2 | Durchgänge: vor und nach der Pause |
| `EXPOSURE_MS` | 1500 | Zeigedauer pro Gegenstand (Standard, in den Einstellungen änderbar) |
| `STOP_SPACING` | 480 | Abstand der Haltepunkte in Szenen-Pixeln |
| `GYRO_PARALLAX` | true | Optionaler Gyroskop-Effekt (Teil 6) |

### Runden

- Runde n hat `L = START_LENGTH + n − 1` Begegnungen. Nach einer richtigen Route folgt die nächste Runde mit einer Begegnung mehr.
- Eine Route ist richtig, wenn jeder Wegpunkt den richtigen Gegenstand trägt.
- Sind **mehr als 50 %** der Wegpunkte einer Route falsch, endet der Durchgang sofort, ohne zweiten Versuch. Beispiele: Bei L = 3 beenden 2 Fehler den Durchgang. Bei L = 4 führen 2 Fehler (genau 50 %) zum zweiten Versuch, erst 3 Fehler beenden ihn.
- Ist eine Route sonst falsch, folgt ein zweiter Versuch mit gleicher Länge, neu gezogenen Gegenständen und gleicher Rundennummer. Ist auch dieser falsch, endet der Durchgang.
- Nach einer richtigen Route der Länge `MAX_LENGTH` endet der Durchgang ebenfalls.
- Nach Durchgang 1 folgt die Pause nach zugewiesener Bedingung, nach Durchgang 2 das Endergebnis.
- Merkspanne eines Durchgangs = Länge der längsten richtigen Route. Gab es keine, ist sie 0.
- Der Rundenzähler beginnt in jedem Durchgang bei 1. Die Proberunde zählt nicht.

### Gegenstände

18 Gegenstände in 12 Familien (Figma-Frame 267:1748). Die Namen dienen auch als Bildbeschreibung.

| Familie | Gegenstände |
|---|---|
| Vögel | Blauer Vogel, Grüner Vogel, Rosa Vogel |
| Sterne | Gelber Stern (schlafend), Orangefarbener Stern, Kleiner blauer Stern, Rosa Stern, Roter Stern |
| Sternschnuppe | Sternschnuppe |
| Flugzeug | Flugzeug |
| Papierflieger | Papierflieger |
| Satellit | Satellit |
| Ufo | Ufo |
| Huhn | Huhn mit Fallschirm |
| Drachen | Drachen |
| Heißluftballon | Heißluftballon |
| Luftballon | Luftballon |
| Rakete | Rakete |

- Pro Runde werden `L` Gegenstände aus `L` verschiedenen Familien zufällig gezogen und in zufällige Reihenfolge gebracht. Dazu kommt ein Zusatzgegenstand aus einer Familie, die in dieser Runde nicht vorkommt. Nie zwei Gegenstände einer Familie in derselben Runde, auch nicht mit dem Zusatzgegenstand.
- Jede Runde wird neu gezogen. Wiederholungen aus früheren Runden sind erlaubt.
- Position und Höhe einer Begegnung hängen nur von ihrer Nummer ab, nie von der Art des Gegenstands. Keine „passende" Höhe (etwa Vögel unten, Satellit oben) – sonst ließe sich die Reihenfolge aus Weltwissen ableiten statt aus dem Gedächtnis.
- Proberunde: fest Drachen, dann Rakete; Zusatzgegenstand Ufo.

### Messung

- **Pro Runde speichern:** Durchgang, Runde, Länge, Versuch, gezeigte Reihenfolge, Zusatzgegenstand, gelegte Reihenfolge, richtig pro Wegpunkt, Route richtig, Dauer des Aufstiegs (erste Begegnung bis Übersicht), Dauer des Rückwegs (Sheet offen bis „Route bestätigen").
- **Pro Sitzung speichern:** Puls vorher, zugewiesene Pausenbedingung, tatsächliches Verhalten (z. B. „Ohne Bewegung fortfahren"), Puls danach, Merkspanne Durchgang 1 und 2, Grund für das Ende je Durchgang (mehr als die Hälfte falsch, zweiter Fehlversuch oder Maximallänge), Anteil richtiger Wegpunkte über alle Runden, Gesamtdauer.
- Zugewiesene Bedingung und tatsächliches Verhalten werden getrennt gespeichert, genau wie in Wolkensammeln. Gleiches Datenformat und gleicher Speicherort wie Wolkensammeln, mit eigener Spielkennung.
- Gesamtdauer = Spielzeit beider Durchgänge ohne Pause und ohne Zeit mit offenen Sheets. Sie ist während des Spiels nirgends sichtbar, nur im Endergebnis.
- Die Proberunde wird nicht gespeichert.

---

## 4 · Szene und Aufstieg

**Szene:** Frame „Spiel 2 Scroll" (315:3007), 393 × 6002 px: Erde unten, Wolken in der Mitte, Sternenhimmel oben. Auf die Bildschirmbreite skalieren. Alle Höhenangaben unten sind Szenen-Pixel.

**Aufgang:** Echoo (bestehende Avatar-Komponente, ca. 72 px) steigt hinter der Erdkrümmung auf – die Erde liegt vor ihm – bis auf Höhe 5650 (1200 ms, translateY und opacity). Gleichzeitig erscheint mittig die Rundenstart-Anzeige (Texte in Abschnitt 6): einblenden 300 ms, stehen 900 ms, ausblenden 400 ms. Kommt der Aufgang nach einer Übersicht, blendet die Übersicht zuvor in 400 ms zur Szene unten an der Erde über.

**Kamera und Haltepunkte:** Echoo ruht auf dem Bildschirm bei etwa 62 % der Höhe (seitlich siehe „Flug“), die Szene bewegt sich unter ihm. Haltepunkt k (1 bis L) liegt auf Höhe `5650 − k × STOP_SPACING`. Eine Route mit 3 Begegnungen endet dadurch unter den Wolken, eine mit 11 bei den Sternen.

**Flug zwischen zwei Haltepunkten** (damit man sieht und spürt, dass Echoo fliegt):

- Echoo fliegt vor, die Kamera zieht nach: Echoo steigt auf dem Bildschirm zuerst um 96 px nach oben (in den ersten 35 % der Flugzeit), dann holt die Kamera auf und bringt ihn bis zum Ende weich zurück auf 62 %. Flugdauer 850 ms, schneller Einstieg, weiches Ausklingen.
- Seitlich: Echoo gleitet im Flug zur Seite des nächsten Haltepunkts und bleibt dort stehen – 28 px links bei ungeradem k, 28 px rechts bei geradem k, beim Aufgang mittig. Im Flug neigt er sich bis zu 7° in die Flugrichtung, in Ruhe steht er gerade. Die Seite hängt nur von der Nummer ab, nie vom Gegenstand. Gilt für Pfeil, Ziehen und Mausrad; beim Zurückgleiten kehrt er auf seine vorige Seite zurück.
- Streckung im Flug: am schnellsten Punkt Scale Y 108 %, Scale X 95 %, danach zurück auf 100 % – ohne Überschwingen.
- Lichtschweif: weicher vertikaler Verlauf unter Echoo (Akzentfarbe → transparent), Ursprung an Echoos Unterkante. Scale Y (0 → 100 %) und Deckkraft (0 → 60 %) wachsen mit dem Tempo und gehen beim Ankommen auf 0.
- Mitziehen: Beim Ziehen mit dem Finger (und beim Mausrad) läuft Echoo je nach Zuggeschwindigkeit bis zu 40 px vor und gleitet beim Loslassen zurück.
- Echoos schwebende Ruhe-Schleife pausiert während des Flugs und setzt nach dem Ankommen weich wieder ein.
- Nachgleiten wie in Zeitlupe: Am Haltepunkt bleibt Echoo nicht stehen. Die Kamera geht mit gleichem Tempo in ein langsames Nachgleiten über (110 Szenen-px), das die ganze Begegnung dauert und danach in 500 ms weich ausläuft. Die Begegnung startet, sobald der Haltepunkt erreicht ist; der Gegenstand hält dabei seine Lage im Himmel. Offene Sheets halten auch das Nachgleiten an. Ziehen, Mausrad und Pfeil setzen an der aktuellen Stelle an.

**Fortbewegung**

- Hauptgeste: irgendwo auf der Szene nach oben ziehen. Die Szene folgt dem Finger 1:1, höchstens bis zum nächsten Haltepunkt. Beim Loslassen rastet sie ab 30 % der Strecke am nächsten Haltepunkt ein, sonst gleitet sie zurück.
- Mausrad und Trackpad: Nach oben scrollen bewegt Echoo nach oben, mit derselben Einrast-Logik.
- Alternative: Pfeil-Button (lucide `arrow-up`) in der unteren Leiste (infoOverlay 507:1276). Antippen fliegt zum nächsten Haltepunkt (850 ms, siehe „Flug“).
- Nach unten ziehen bewirkt nichts. Es gibt kein Zurückfliegen.
- Während einer Begegnung und während Übergängen sind Geste, Mausrad und Pfeil gesperrt; der Pfeil steht dann auf 40 % Deckkraft.

**Begegnung**

- Am Haltepunkt fliegt der Gegenstand herein und kommt etwa 180 px über Echoo zur Ruhe: bei ungeradem k 55 px links, bei geradem k 55 px rechts der Mitte.
- Eintritt 500 ms. Danach bleibt er genau `EXPOSURE_MS` ruhig sichtbar, dann fliegt er in seiner Richtung weiter und verschwindet (400 ms). Erst dann werden Geste und Pfeil frei.
- Größe fest pro Gegenstand zwischen 96 und 140 px nach natürlicher Größe (Heißluftballon groß, kleine Sterne klein), nie zufällig. So entsteht Tiefe, ohne dass die Schwierigkeit schwankt.
- Keine Dauerschleifen an Gegenständen. Dauerschleifen gehören ausschließlich Echoo.

Flugbahnen (nur transform und opacity): **Alle Gegenstände fliegen seitlich** – herein von der Seite ihrer Ruhelage (ungerades k links, gerades k rechts), hinaus auf der jeweils anderen Seite. Die Familie gibt nur eine leichte eigene Note:

| Familie | Note |
|---|---|
| Vögel | leichter Bogen nach oben |
| Sterne | etwas kleiner am Rand, wachsen zur Ruhelage |
| Sternschnuppe | leicht schräg von oben, schräg nach unten weiter |
| Flugzeug | gerade |
| Papierflieger | sanfter Gleitbogen, leicht geneigt |
| Satellit, Ufo | gerade mit kaum merklichem Bogen |
| Huhn mit Fallschirm | leichtes Schaukeln |
| Drachen | geneigt |
| Heißluftballon, Luftballon | leicht von unten, leicht nach oben weiter |
| Rakete | leicht von unten, schräg nach oben weiter |

Der Gegenstand hält seine Lage im Himmel: Gleitet Echoo während der Begegnung weiter, zieht der Gegenstand mit der Szene nach unten – Echoo fliegt an ihm vorbei, statt ihn mitzunehmen.

**Tiefe:** Parallax beim Bewegen (nur transform): Sterne fern 0,3-fach, Sterne nah 0,6-fach, Himmelsverlauf 1-fach, Wolken 1,15-fach, Vordergrund 1,8-fach. Die Sternebenen bleiben auf die Nacht beschnitten und rutschen nie in den Taghimmel.

- Vordergrund-Ebene (1,8-fach): im unteren Himmel und in der Wolkenzone Wolkenfetzen aus den vorhandenen Wolken-Assets (größer, 50–70 % Deckkraft, teils vor Echoo), in der Sternenzone einzelne größere Lichtpunkte.
- Auch der untere Himmel bis zu den Wolken bekommt vereinzelt kleine Wolken als Bezugspunkte.
- Deko darf nie wie ein Gegenstand aussehen: keine Vögel, Flieger, Ballons oder Sternfiguren mit Gesicht – nur weiße Wolken und schlichte Lichtpunkte.
- Optional ein leichter Gyroskop-Effekt (`GYRO_PARALLAX`).

**Leisten und Orientierung**

- Übernimm Struktur und Positionen der Leisten aus Wolkensammeln: Zurück-Pfeil oben links, Rundenzähler, Puls und Einstellungen an denselben Stellen wie dort.
- Rundenanzeige: „Runde {n} | {k} von {L}" (im Aufstieg k = Anzahl der bisherigen Begegnungen, beim Nachbauen k = Anzahl der belegten Wegpunkte).
- Die Info-Pille aus Figma mit Uhr und Punkten entfällt. Während des Spiels ist keine Zeit sichtbar.
- Der Pfeil darf keinen Platz belegen, den in Wolkensammeln ein anderes Element hat.

**Ende des Aufstiegs:** 250 ms nachdem der letzte Gegenstand verschwunden ist, startet automatisch der Übergang in die Übersicht.

---

## 5 · Rückweg, Auflösung, Heimkehr

**Übersicht** (Echoo-Lage: Figma 507:1066)

- Die Szene wird nicht gleichmäßig herunterskaliert – das ergäbe einen schmalen Streifen. Stattdessen fährt die Erde von unten ins Bild (900 ms), und darüber liegt ein verkürzter Himmelsverlauf in den Farben des durchflogenen Abschnitts (Farbwerte aus dem Himmelsverlauf der Szene).
- Echoo beim Nachbauen: größer oben links in der Ecke, teils angeschnitten (Figma 507:1066: Bild 328 × 348 px, Mitte bei 21 / 40 px, Körper ≈ 173 px). Er gleitet vom Ende des Aufstiegs in die Ecke und wächst dabei (transform, 900 ms, gleichzeitig mit der hereinfahrenden Erde).
- Gleichzeitig fährt das Rückweg-Sheet von unten herein und bedeckt etwa 44 % der Höhe. Die Übersicht nutzt den Bereich zwischen oberer Leiste und Sheet.
- Wegpunkte: `L` Kreise, gleichmäßig verteilt zwischen Erde (unten) und oberer Leiste (oben), bei ungeradem k 55 px links, bei geradem k 55 px rechts der Mitte – dieselbe Regel wie beim Aufstieg. Durchmesser 56 px; bei vielen Wegpunkten kleiner, aber nie unter 44 px.
- Leerer Wegpunkt: gestrichelte weiße Kontur (2 px), Nummer mittig (1 = unterster), Zahlenstil wie in den Feldern von 467:398, verkleinert. Die Wegpunkte erscheinen von unten nach oben gestaffelt (je 60 ms).

**Rückweg-Sheet** (Basis: 467:398)

- Lässt sich nicht wegwischen und hat kein Schließen-Kreuz. Abbrechen geht nur über den Zurück-Pfeil.
- Titel, Text und Button: Abschnitt 6.
- Haufen: `L + 1` Karten im Stil von 467:398 (weiße, abgerundete Karten mit weichem Schatten), etwa 72 px, zufällig angeordnet und leicht gedreht (±6°). Überlappung nur an den Rändern (höchstens 8 px); keine Karte verdeckt eine andere.

**Ziehen und Ablegen** (Touch und Maus)

- Beim Greifen hebt sich die Karte (Scale 105 %, stärkerer Schatten) und folgt dem Finger.
- Ein Wegpunkt unter der Karte hebt sich hervor (Scale 110 %, durchgezogene Kontur).
- Auf leerem Wegpunkt loslassen: Die Karte schrumpft in den Wegpunkt.
- Auf belegtem Wegpunkt loslassen: tauschen; der verdrängte Gegenstand geht dorthin, woher die gezogene Karte kam.
- Daneben loslassen: zurück an die Herkunft.
- Belegten Gegenstand aufs Sheet ziehen oder antippen: zurück in den Haufen.
- Alternative ohne Ziehen: Karte antippen (ausgewählt: Kontur in Akzentfarbe), dann Wegpunkt antippen.
- „Route bestätigen" ist deaktiviert (40 % Deckkraft), bis alle Wegpunkte belegt sind.

**Auflösung und Heimkehr**

- Nach „Route bestätigen" fährt das Sheet hinaus.
- Die Route zeichnet sich von der Erde nach oben, Abschnitt für Abschnitt (stroke-dashoffset, 350 ms je Abschnitt): 4 px, Akzentfarbe, runde Enden. Sie verbindet Erde und Wegpunkte; zu Echoo führt keine Linie.
- Erreicht die Linie einen Wegpunkt, zeigt er sein Ergebnis (250 ms):
  - richtig: Kontur in Akzentfarbe, kleines Abzeichen mit lucide `check` unten rechts
  - falsch: kleines Abzeichen mit lucide `x` in neutralem Dunkelgrau; der gelegte Gegenstand schrumpft auf 50 % und rückt halb neben den Wegpunkt (50 % Deckkraft), der richtige Gegenstand blendet im Wegpunkt ein
  - Richtig und falsch nie nur über Farbe unterscheiden, immer mit Symbol.
- Ab dem ersten falschen Wegpunkt läuft die Linie gestrichelt weiter (weiß, 60 % Deckkraft; Aufdecken über eine Maske per stroke-dashoffset).
- **Richtige Route:** Echoo fliegt aus der Ecke zum obersten Wegpunkt und schrumpft dabei auf Fluggröße (700 ms). Dann folgt er der Route bis zur Erde (1800 ms, ein durchgehender weicher Verlauf: sanft anfahren, lang auslaufen); jeder Abschnitt blendet aus, sobald Echoo ihn passiert hat (opacity, 250 ms), die Wegpunkte bleiben stehen. Unten angekommen geht er nicht unter, sondern jubelt: Er hebt sich 72 px über den Horizont und wächst auf 130 % (500 ms), grinst (lachender Mund aus der Figma-Echoo) und strahlt – das Leuchten wird größer, zwei Lichtringe laufen einmal nach außen. Nach 1400 ms folgt das Sheet. Bei `prefers-reduced-motion` grinst und strahlt er ohne Flug in der Ecke.
- **Falsche Route:** Die Auflösung an den Wegpunkten läuft wie oben. Echoo fliegt nicht, sondern bleibt in der Ecke – ohne traurige Reaktion. Nach 1200 ms folgt das Sheet.
- Kein Rot, kein Schütteln, keine traurige Reaktion.
- Nächste Runde: Überblendung zur Szene unten an der Erde, Echoo geht wie gewohnt hinter der Erde auf.
- Danach folgt das passende Sheet aus Abschnitt 6.

---

## 6 · Sheets und Texte

Alle Sheets nutzen die gemeinsame Sheet-Komponente aus Wolkensammeln. Übernimm Texte zeichengenau, mit typografischen Anführungszeichen („…") und Halbgeviertstrich (–). `{…}` sind Platzhalter.

### Erklärung · Design: 344:4324

| Element | Text |
|---|---|
| Titel | {GAME_NAME} |
| Text | Echoo geht auf und reist durch den Himmel. Merk dir, in welcher Reihenfolge er den Dingen begegnet – oben baust du daraus seine Route nach. Mit jeder Runde wird die Route länger. |
| Primär | Weiter |
| Sekundär | Abbrechen |

### Proberunde · Design: aus Komponenten

Nur beim allerersten Start (Merker im selben Speicher wie die übrigen Einstellungen der App). Läuft wie eine normale Runde mit 2 Begegnungen, wird aber nicht gewertet und nicht gespeichert. Hinweise erscheinen einzeln als kleine Blase nahe am betreffenden Element (Stil: kleine weiße Karte wie die Sheets). Oben rechts steht der Link „Überspringen", der die Proberunde beendet.

| Moment | Text |
|---|---|
| Rundenstart, Zeile 1 | Proberunde |
| Rundenstart, Zeile 2 | 2 Begegnungen · zählt nicht |
| Vor dem ersten Ziehen | Zieh nach oben oder tippe auf den Pfeil. |
| Erste Begegnung | Merk dir, was Echoo begegnet – und in welcher Reihenfolge. |
| Rückweg, Schritt 1 | Zieh den Drachen auf den untersten Wegpunkt. |
| Rückweg, Schritt 2 | Jetzt die Rakete darüber. |
| Rückweg, Schritt 3 | Das Ufo war nicht dabei. Tippe auf „Route bestätigen". |
| Link | Überspringen |

### Proberunde beendet · Design: aus Komponenten

| Element | Text |
|---|---|
| Titel | Proberunde beendet |
| Text | Jetzt zählt es. Mit jeder Runde kommt eine Begegnung dazu. |
| Primär | Weiter |
| Sekundär | Noch einmal üben |

### Puls vorher · Design: 460:224

| Element | Text |
|---|---|
| Titel | Bevor es losgeht |
| Label | Aktueller Puls |
| Primär | Spiel starten |

### Rundenstart-Anzeige · Design: aus Komponenten

Mittig über der Szene, ohne Hintergrundfläche.

| Zeile | Text |
|---|---|
| 1 (nur Durchgang 2, Runde 1) | Durchgang 2 |
| 2 | Runde {n} |
| 3 | {L} Begegnungen |
| 4 (nur beim zweiten Versuch) | Zweiter Versuch |

### Rundenanzeige in der Leiste

| Element | Text |
|---|---|
| Anzeige | Runde {n} \| {k} von {L} |

### Rückweg-Sheet · Design: 467:398 (angepasst)

| Element | Text |
|---|---|
| Titel | Bau Echoos Route nach |
| Text | Zieh die Gegenstände in der Reihenfolge, in der Echoo ihnen begegnet ist, von der Erde aus nach oben auf die Wegpunkte. Einer davon war nicht dabei. |
| Primär | Route bestätigen |

### Rundenerfolg · Design: aus Komponenten

| Element | Text |
|---|---|
| Titel | Runde {n} geschafft |
| Text | Nächste Runde: {L + 1} Begegnungen. |
| Primär | Nächste Runde |

### Zweiter Versuch · Design: aus Komponenten

| Element | Text |
|---|---|
| Titel | Route nicht ganz richtig |
| Text | Du bekommst einen zweiten Versuch – gleich lang, mit neuen Begegnungen. |
| Primär | Zweiter Versuch |

### Durchgang 1 beendet · Design: aus Komponenten

| Element | Text |
|---|---|
| Titel | Durchgang 1 beendet |
| Text (Standard) | Deine längste Route: {span1} Wegpunkte. Nach einer kurzen Pause folgt Durchgang 2. |
| Text (Merkspanne 0) | Diesmal hat keine Route ganz gestimmt. Nach einer kurzen Pause folgt Durchgang 2. |
| Text (`MAX_LENGTH` geschafft) | Du hast die längste Route geschafft: {MAX_LENGTH} Wegpunkte. Nach einer kurzen Pause folgt Durchgang 2. |
| Primär | Weiter |

### Bewegungspause · Design: 460:312

| Element | Text |
|---|---|
| Titel | Bewegungspause |
| Text | Bewege dich aktiv, bis dein Puls spürbar ansteigt. Danach trägst du deinen neuen Pulswert ein und es geht weiter. |
| Primär | Ich habe mich bewegt |
| Sekundär | Ohne Bewegung fortfahren |

Der alte Satzteil „geht es gestärkt zurück ins Spiel" entfällt: Er verrät die Hypothese und kann den Effekt selbst erzeugen. Die Ruhe-Variante läuft genau wie in Wolkensammeln.

### Puls danach · Design: 460:268

| Element | Text |
|---|---|
| Titel | Bevor es weitergeht |
| Label | wie in Wolkensammeln |
| Primär | Spiel fortsetzen |

### Abbruch · Design: 460:186

| Element | Text |
|---|---|
| Titel | Bist du sicher? |
| Text | Wenn du das Spiel jetzt verlässt, geht dein bisheriger Fortschritt verloren. |
| Primär | Fortsetzen |
| Sekundär | Spiel verlassen |

### Einstellungen

Gleiches Sheet wie in Wolkensammeln, aber nur ein Regler: „Anzeigedauer“ = Zeigedauer pro Gegenstand (Standard `EXPOSURE_MS` = 1500 ms, 1000–4000 ms in Schritten von 100 ms). Der neue Wert gilt ab der nächsten Begegnung und wird pro Runde mitgespeichert.

### Endergebnis · Design: 460:347 (angepasst)

Statt des Pokals eine Mini-Route aus den Komponenten des Spiels: Erde als Bogen unten, `bestSpan` Wegpunkte in Akzentfarbe mit Linie verbunden, Echoo oben. Bei `bestSpan` = 0 nur Erde und Echoo.

- `bestSpan` = größere Merkspanne der beiden Durchgänge
- `dLast` = `bestSpan` minus `bestSpan` der letzten gespeicherten Himmelsroute-Sitzung
- `dPause` = Merkspanne Durchgang 2 minus Merkspanne Durchgang 1

| Element | Text |
|---|---|
| Große Zahl | {bestSpan}; bei 0: – |
| Satz 1 | Wegpunkte in deiner längsten Route. |
| Satz 1 bei `bestSpan` = 0 | Diesmal hat keine Route ganz gestimmt. |
| Satz 2 bei der ersten Sitzung | Deine erste {GAME_NAME}. |
| Satz 2 bei `dLast` ≥ 2 | Das sind {dLast} mehr als beim letzten Mal. |
| Satz 2 bei `dLast` = 1 | Das ist einer mehr als beim letzten Mal. |
| Satz 2 bei `dLast` = 0 | Genauso viele wie beim letzten Mal. |
| Satz 2 bei `dLast` = −1 | Das ist einer weniger als beim letzten Mal. |
| Satz 2 bei `dLast` ≤ −2 | Das sind {Betrag von dLast} weniger als beim letzten Mal. |
| Zeile | Längste Route vor der Pause · {span1} |
| Zeile | Längste Route nach der Pause · {span2} |
| Zeile | Veränderung nach der Pause · +{dPause} oder ±0 oder −{Betrag von dPause} |
| Zeile | Richtige Wegpunkte · {p} % |
| Zeile | Gesamtdauer · {m}:{ss} min |
| Primär | Dashboard |
| Sekundär | Statistiken |

Bei `bestSpan` = 0 entfällt Satz 2. Formatierung: echtes Minuszeichen (U+2212), geschütztes Leerzeichen vor „%" und vor „min", Prozent ganzzahlig gerundet, Sekunden zweistellig.

---

## 7 · Gestaltung und Bewegung

- Animiert werden ausschließlich `transform`, `opacity`, `stroke-dashoffset` und `grid-template-rows`.
- Dauerschleifen nur für Echoo. Seine Ruhe-Schleife pausiert während eines Flugs.
- Schneller Einstieg, langes weiches Ausklingen, kein Nachfedern, keine Partikel. Verwende die Kurven und Dauern aus Wolkensammeln; wo keine passen: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Bewegungen sollen sich wie eine Antwort auf Berührung anfühlen, nicht wie dekorative Loops.
- Touch-Ziele mindestens 44 px.
- Beim Flug zwischen Haltepunkten nur `transform` und `opacity`: keine Partikel, keine animierten Filter oder Unschärfe, kein Nachfedern.
- `prefers-reduced-motion`: Flugbahnen, Kamerafahrten und Echoos Gleiten werden zu kurzen Überblendungen. Beim Flug entfallen Vorlauf, Streckung, Schweif und Vordergrund-Ebene; er wird zu einer kurzen Fahrt (400 ms). Zeigedauer und Spiellogik bleiben gleich.
- Alle Gegenstände haben deutsche Bildbeschreibungen (Namen aus Abschnitt 3).

---

## 8 · Was entfällt

- Info-Pille mit Uhr und Punkten im Reise-Screen
- Freies Zurückscrollen während des Aufstiegs
- Das 3 × 2-Raster mit nummerierten Feldern und das bildschirmhohe Zuordnen-Sheet
- Die Texte „Welchen Dingen ist er auf seiner Reise begegnet?", „nur so findet Echoo sicher zurück zur Erde", „geht es gestärkt zurück ins Spiel" und „Bevor es weiter geht"
- Die Wolkensammeln-Kennzahlen im Himmelsroute-Endergebnis („Licht gesammelt", Trefferquote, Längste Serie)

---

## 9 · Figma-Referenzen

fileKey `dJ14dXd6lLt7aPJif2EbJY`

| Node | Inhalt | Verwendung |
|---|---|---|
| 315:3007 | Szene „Spiel 2 Scroll" | Himmelsverlauf, Wolken, Sterne, Erde |
| 267:1748 | Objekte | 18 Gegenstände |
| 344:4324 | Erklärung | Erklärungs-Sheet, neuer Text |
| 460:224 | Puls vorher | übernehmen |
| 460:312 | Bewegungspause | übernehmen, neuer Text |
| 460:268 | Puls danach | übernehmen, neuer Titel |
| 460:186 | Abbruch | übernehmen |
| 467:398 | Zuordnen | nur Karten- und Zahlenstil für Rückweg-Sheet und Wegpunkte |
| 460:347 | Endergebnis | Aufbau übernehmen, Inhalte nach Abschnitt 6 |

---

## 10 · Teil-Prompts

| Teil | Inhalt | Liest |
|---|---|---|
| 01 | Bestandsaufnahme (nur lesen) | 0, 1, 2, 9 |
| 02 | Spiellogik, Konfiguration, Texte | 0, 3, 6, Flugbahnen aus 4 |
| 03 | Szene, Aufgang, Aufstieg | 0, 1, 4, 7, 9 |
| 04 | Übersicht, Rückweg, Auflösung, Heimkehr | 0, 1, 5, 7, 9 |
| 05 | Sheets, Proberunde, kompletter Ablauf | 0, 2, 3, 6, 9 |
| 06 | Feinschliff und Abnahme | 4 (Tiefe), 7, 8 |
