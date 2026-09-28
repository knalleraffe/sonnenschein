# Splashscreen und Onboarding · Master-Spezifikation

Liegt unter `docs/splash-onboarding/00-master.md`. Umsetzung in sechs Teil-Prompts (Abschnitt 8). Lies pro Teil nur die genannten Abschnitte.

---

## 0 · Arbeitsweise

- Arbeite selbstständig und erkläre jeden Meilenstein in einfachem, nicht technischem Deutsch, inklusive wie Julius ihn im Browser prüft.
- Bleib im Umfang des Teil-Prompts. Spiele, Startseite und Statistiken änderst du nicht, außer an den genannten Übergängen.
- **Texte, Zahlen und Werte nur aus dieser Datei.** Aus Figma kommt nur Gestaltung (fileKey `dJ14dXd6lLt7aPJif2EbJY`, Figma-MCP).
- **Keine neuen Gestaltungswerte.** Alles aus Komponenten und Werten der Spiele und der Startseite: Sheet-Komponente, primärer und sekundärer Button, Karten, Glas-Pille, Glas-Button, Puls-Slider, Echoo mit Zuständen, Wegpunkte, Spielkarten, Himmelsszene (315:3007), Farben, Radien, Schatten, Abstände, Schriftgrößen, Easing-Kurven. Alles ohne Figma-Design in `docs/splash-onboarding/ohne-design.md` eintragen.
- Animiert werden nur `transform`, `opacity`, `stroke-dashoffset` und `grid-template-rows`. Dauerschleifen nur an Echoo. Kein Nachfedern, keine Partikel.
- `prefers-reduced-motion`: Fahrten werden zu Überblendungen.
- Bei Kollisionen mit dem Code: nicht raten, melden.

---

## 1 · Grundidee

Splash und Onboarding erzählen dasselbe Bild wie die Himmelsroute: Echoo geht hinter der Erde auf und steigt in den Himmel. Das Onboarding ist ein kleiner Aufstieg – jeder Schritt liegt etwas höher im Himmel, und man bewegt sich mit derselben Ziehgeste wie im Spiel. So lernt man die wichtigste Geste der App, bevor es zählt. Jeder Schritt hat ein Element zum Ausprobieren statt nur Text.

Konstante `APP_NAME` = „Sonnenschein".

---

## 2 · Splashscreen

- Bei jedem Kaltstart der App. Antippen springt zum Endzustand.
- Hintergrund: unterer Abschnitt der Himmelsszene (315:3007) mit Erdbogen.

| Zeit | Ablauf |
|---|---|
| 0–300 ms | Erdbogen fährt 40 px hoch und blendet ein |
| 300–1300 ms | Echoo steigt hinter der Erde auf (translateY, opacity) |
| 1300–1800 ms | `APP_NAME` blendet unter Echoo ein und rückt 8 px hoch |
| ab 1800 ms | Echoos Ruhe-Schleife setzt ein, Halten bis 2300 ms |

**Ausgang**
- Erster Start: kein Schnitt. Der Name blendet aus, die Szene wird zu Onboarding-Schritt 1, Echoo bleibt stehen.
- Sonst: Echoo fährt und skaliert an seine Position im Kopf der Startseite (transform, 500 ms), alles andere blendet aus.

---

## 3 · Onboarding-Gerüst

- Nur beim ersten Start (Merker im vorhandenen Einstellungs-Speicher). In den Einstellungen gibt es den Eintrag „Einführung ansehen".
- **Szene:** Himmelsszene mit Parallax. Jeder Schritt liegt 480 px höher als der vorige; beim Wechsel fährt die Kamera mit (900 ms), Echoo steigt mit.
- **Inhaltskarte:** feste Karte unten im Stil der Sheet-Komponente. Beim Wechsel blendet nur ihr Inhalt über (opacity, 8 px translateY), die Karte bleibt stehen.
- **Navigation:**
  - nach oben ziehen = weiter, nach unten ziehen = zurück (Einrasten ab 30 %)
  - primärer Button „Weiter" in der Karte
  - Fortschritt als senkrechte Route am rechten Rand: 6 Wegpunkte, besuchte in Akzentfarbe, aktueller größer. Antippen springt zum Schritt; Trefferfläche mindestens 44 px.
  - „Überspringen" oben rechts in den Schritten 1–5
- **Ende:** „Los geht's" → Echoo fährt an seine Position auf der Startseite wie beim Splash-Ausgang.

---

## 4 · Onboarding-Schritte

**1 · Hallo**
- Echoo groß in der Mitte. Echoo selbst nach oben ziehen führt ebenfalls weiter.

**2 · So läuft eine Sitzung**
- Vier Wegpunkte als kleine Route über der Karte. Antippen klappt darunter den Text zum Wegpunkt auf (grid-template-rows); immer nur einer offen.
- „Weiter" ist immer aktiv.

**3 · Puls messen**
- Großer runder Glas-Button zum Mittippen. Ein Ring darum zeigt die 15 Sekunden (stroke-dashoffset).
- Jeder Tipp lässt den Button kurz auf 106 % wachsen und zurück, ohne Überschwingen.
- Ergebnis aus den Abständen der Tipps (Schläge pro Minute). Danach fährt der Puls-Slider auf den Wert.
- Link für Uhr-Nutzer zeigt direkt den Slider. Nichts wird gespeichert.

**4 · Zwei Spiele**
- Die beiden Spielkarten der Startseite. Antippen dreht eine Karte um (rotateY, 500 ms).
- Rückseite: Modus-Label aus `modes.ts` und der erste Satz des Erklärungs-Sheets des Spiels.

**5 · Echoo als Spiegel**
- Slider mit drei Stufen; Echoo wechselt live zwischen seinen Zuständen gedämpft, wie gewohnt und heller.

**6 · Bereit**
- Die vorhandenen Einstellungen der App als Umschalter (keine neuen erfinden), dann „Los geht's".

---

## 5 · Texte

| Stelle | Text |
|---|---|
| Splash | {APP_NAME} |
| Überspringen | Überspringen |
| Weiter | Weiter |
| 1 Titel | Hallo, ich bin Echoo. |
| 1 Text | Mit kurzen Spielen findest du heraus, ob Bewegung dir beim Denken hilft. |
| 1 Hinweis | Zieh mich nach oben. |
| 2 Titel | So läuft eine Sitzung |
| 2 Hinweis | Tippe auf die Wegpunkte. |
| 2 Wegpunkt 1 | Puls – Du trägst deinen Puls ein. |
| 2 Wegpunkt 2 | Spiel – Du spielst den ersten Teil. |
| 2 Wegpunkt 3 | Pause – Du bewegst dich oder ruhst dich aus. Was dran ist, entscheidet der Zufall – nur so lässt sich später vergleichen. |
| 2 Wegpunkt 4 | Puls und Spiel – Du trägst deinen Puls noch einmal ein und spielst den zweiten Teil. |
| 3 Titel | Deinen Puls messen |
| 3 Text | Leg zwei Finger an dein Handgelenk und tippe 15 Sekunden lang bei jedem Schlag auf den Kreis. |
| 3 Ergebnis | {x} Schläge pro Minute |
| 3 Link | Ich lese meinen Puls von der Uhr ab. |
| 3 Hinweis | Nur eine Übung – nichts wird gespeichert. |
| 4 Titel | Zwei Spiele |
| 4 Text | Jedes Spiel fordert dich anders. Tippe auf eine Karte. |
| 5 Titel | Ich bin dein Spiegel |
| 5 Text | Ich zeige, wie deine letzten Messungen im Vergleich zu deinem Schnitt liegen. Pflegen musst du mich nicht – Pausen sind okay. |
| 5 Stufen | Unter deinem Schnitt · Im Schnitt · Über deinem Schnitt |
| 6 Titel | Bereit? |
| 6 Text | Die Einführung findest du jederzeit in den Einstellungen. |
| 6 Primär | Los geht's |
| Einstellungen-Eintrag | Einführung ansehen |

Im Wegpunkt-Text steht der Teil vor dem Gedankenstrich als Beschriftung am Wegpunkt, der Rest als aufgeklappter Text.

---

## 6 · Was nicht vorkommen darf

- Aussagen, dass Bewegung sicher hilft oder „stärkt" – das kann den Effekt selbst erzeugen.
- Streaks, Belohnungen, Schuld („Echoo vermisst dich").
- Reine Folien ohne Interaktion.

---

## 7 · Ohne Design

Splash-Anordnung, Onboarding-Gerüst mit Fortschrittsroute, alle sechs Schritte, Mittipp-Button mit Ring, Kartenrückseiten, Echoo-Zustands-Slider.

---

## 8 · Teil-Prompts

| Teil | Inhalt | Liest |
|---|---|---|
| 01 | Bestandsaufnahme (nur lesen) | 0, 1 |
| 02 | Splashscreen | 0, 1, 2, 5 |
| 03 | Onboarding-Gerüst | 0, 1, 3, 5 |
| 04 | Schritte 1–3 | 0, 4, 5, 6 |
| 05 | Schritte 4–6 | 0, 4, 5, 6 |
| 06 | Feinschliff und Abnahme | 0, 6, 7 |
