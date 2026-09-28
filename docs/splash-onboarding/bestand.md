# Splash und Onboarding – Bestandsaufnahme

Stand: 25.09.2026, Arbeitsverzeichnis (Branch `main`). Grundlage: Master-Abschnitte 0 und 1.

## App-Start und Routing

- `src/main.tsx`: `createRoot` → `StrictMode` → `BrowserRouter` → `App`. Beim Laden passiert sonst nichts, es gibt keinen Lade- oder Startzustand.
- `src/App.tsx`: Telefonrahmen (393 × 852 auf dem Desktop), darin `<main>` mit einer `AnimatePresence`. Zwischen App und Spiel wird überblendet, die Tab-Leiste liegt über allem.
- Routen:
  - `/` Startseite
  - `/sonnenschein` Sonnenschein-Screen
  - `/playground`
  - `/statistiken`
  - `/glossar`
  - `/spiel/wolkensammeln`
  - `/himmelsroute`
- **Einhängepunkt für Splash und Onboarding:** in `App.tsx` als Ebene über dem Rahmeninhalt, einmal pro Laden der Seite. „Kaltstart“ heißt im Browser: jedes Neuladen, unabhängig von der Route. Das Onboarding hängt an derselben Stelle, beim ersten Start direkt nach dem Splash.

## Speicher und Einstellungen

- Browser-Speicher mit dem Muster `sonnenschein.<bereich>.v1`, gelesen und geschrieben über kleine Funktionen mit `try`/`catch`:
  - `sonnenschein.wolkensammeln.v1`
  - `sonnenschein.himmelsroute.v1`
  - `sonnenschein.himmelsroute.proberundeGesehen`
  - `sonnenschein.stimmung.v1`
- **Einen Einstellungs-Speicher der App gibt es nicht**, ebenso wenig einen Einstellungs-Screen.
- **Vorhandene „Einstellungen“** gibt es nur innerhalb der Spiele, als `EinstellungenSheet` in `src/components/spiel/SpielSheets.tsx`:
  - Wolkensammeln: Regler Anzeigedauer (200–1500 ms) und Anzeigepause (100–1000 ms)
  - Himmelsroute: Regler Zeigedauer (1000–4000 ms)

  Beides sind Regler, keine Umschalter. Sie gelten nur für die laufende Sitzung und werden nicht gespeichert.

## Echoo

- **Startseite** (`src/components/start/EchooKopf.tsx`, Figma 513:1427):
  - Aufbau: weiße Bühne, 416 px hoch, oben auf der Seite. Dahinter der Schein `public/start/echoo-schein.svg` (787 × 1230 bei −199 / −115), davor die Figur `public/start/echoo-figur.svg` (563 × 846 bei −85 / 71, Körpermitte in der Grafik bei 280 / 402).
  - Einen Kopf der Startseite gibt es nicht mehr, Echoo ist ihr oberster Teil.
  - Zustände aus `echooZustand()` (`src/lib/kennzahlen.ts`): `heller`, `normal`, `gedaempft`, `neutral`. Sichtbar werden sie nur über die Stärke des Scheins (1 / 0,8 / 0,45 / 0,8).
  - Ruhe-Schleife: Atmen, Skala 1 → 1,012 → 1 in 4,2 s, `easeInOut`, aus `wolkensammeln/config.ts`.
  - Antippen öffnet `/sonnenschein` (geteilte `layoutId`).
- **Sonnenschein-Screen** (`src/screens/Avatar.tsx`): der ältere SVG-Avatar `Sonnenschein` mit 6 Stimmungen und Vitalität, ebenfalls atmend.
- **In den Spielen:** `EchooMini` (Himmelsroute, PNG, Atmen, Jubel) und `Echoo` (Wolkensammeln, wächst mit dem Fortschritt).

## Himmelsszene, Erdbogen, Parallax, Ziehgeste

- **Wiederverwendbar:** `src/components/himmelsroute/Szene.tsx`
  - `SzeneHinten`: Himmel, kleine Wolken, Wolken, Nacht, zwei Sternebenen
  - `SzeneErde`: Erde als eigene Ebene vor Echoo
  - `SzeneVordergrund`
  - `ErdeBild`, `himmelsfarbe()`

  Alles wird über einen `kamera`-Wert gesteuert (Szenenhöhe an Echoos Position), mit Parallax 0,3 / 0,6 / 1 / 1,15 / 1,8. Die Erde liegt bei Szenenhöhe 5772, der Aufgang endet bei 5650, die Haltepunkte liegen 480 px auseinander.
- **Nicht als Baustein vorhanden:** Die Ziehgeste mit Einrasten ab 30 %, Mausrad und Flug steckt direkt in `src/screens/Himmelsroute.tsx` (`ziehStart`, `ziehAuf`, `rasteEin`, `fliege`). Für das Onboarding muss ich sie herauslösen oder nachbauen. Außerdem kann sie nur nach oben, das Onboarding braucht auch „nach unten = zurück“.
- **Einstellungen der Szene:** `konfig.szene`, `konfig.flug` und `konfig.fortbewegung` in `src/games/himmelsroute/config.ts`.

## Weitere Bausteine

| Baustein | Pfad | Hinweis |
|---|---|---|
| Spielkarten | `src/components/start/SpielKarte.tsx` | 167 × 180 px, weiß, Radius 28, Bild aus der Szene, Name, Modus, Wert, „Heute dran“ |
| Puls-Slider | `PulsSheet` in `SpielSheets.tsx`, `.sheet-range` in `index.css` | Bereich 40–190 (`wolkensammeln/config.ts`, `messung.pulsMin/Max`) |
| Wegpunkte | inline in `src/components/himmelsroute/Rueckweg.tsx` | keine eigene Komponente. Kreis 44–56 px, gestrichelte weiße Kontur, Nummer `#c0c0c0` |
| Mini-Route | `src/components/himmelsroute/MiniRoute.tsx` | |
| Sheet, Buttons, Glas-Pille, Glas-Button, Karten | `src/components/ui/Sheet.tsx`, `SpielSheets.tsx` (`knopfPrimaer`/`knopfSekundaer`), `src/components/start/stil.ts` (`karte`, `glasPille`) | |
| Modi | `src/data/modes.ts` | Wolkensammeln = „Hasen-Modus“, Himmelsroute = „Elefanten-Modus“ (Zuordnung in `SpielKarte.tsx`) |

**Erster Satz der Erklärungs-Sheets**
- **Wolkensammeln:** „Merke dir die Reihenfolge, in der 3 bis 8 Wolken am Himmel nacheinander aufleuchten, und tippe sie anschließend in genau dieser Reihenfolge an.“ Er steht fest in `Wolkensammeln.tsx`, nicht in einer Textdatei.
- **Himmelsroute:** „Echoo geht auf und reist durch den Himmel.“ Er steht in `texte.erklaerung.text` in `src/games/himmelsroute/texte.ts`.

## Kollisionen mit der Spezifikation

1. **Kein Einstellungs-Screen:** Für den Eintrag „Einführung ansehen“ gibt es keinen Ort.
2. **Kein Einstellungs-Speicher:** Den Merker „Onboarding gesehen“ kann ich nicht „im vorhandenen Einstellungs-Speicher“ ablegen. Nötig ist ein neuer Schlüssel nach dem bestehenden Muster, zum Beispiel `sonnenschein.einstellungen.v1`.
3. **Schritt 6 „Die vorhandenen Einstellungen als Umschalter“:** Die App hat keine. Die Spiel-Regler sind keine Umschalter und werden nicht gespeichert. Neue Einstellungen darf ich laut Spezifikation nicht erfinden.
4. **Kaltstart im Browser:** Der Splash käme bei jedem Neuladen, auch auf `/statistiken` oder mitten im Spiel. Sein Ausgang „Echoo fährt an seine Position im Kopf der Startseite“ passt nur zur Route `/`.
5. **„Position im Kopf der Startseite“:** Die Startseite hat keinen Kopf mehr. Ziel ist Echoos Bühne oben auf der Startseite, mit der Figma-Figur statt des Sonnenschein-Avatars.
6. **Ziehgeste nicht wiederverwendbar:** Sie steckt im Himmelsroute-Screen und kennt nur „nach oben“. Für das Onboarding baue ich sie als eigenen Baustein nach.
7. **Puls-Bereich:** Der Puls-Slider reicht von 40 bis 190. Die Plausibilitätsgrenze in Teil 4 ist 40–200, Werte zwischen 191 und 200 kann der Slider nicht anzeigen.
8. **Wolkensammeln-Erklärsatz:** Er sagt „in genau dieser Reihenfolge“, das Spiel wertet aber nur die Auswahl. Das ist bekannt (Kollision aus der Himmelsroute-Bestandsaufnahme). Für die Kartenrückseite übernehme ich den Satz trotzdem wörtlich.

## Entscheidungen (Julius, 25.09.2026)

- **„Einführung ansehen“:** in einem kleinen Einstellungs-Sheet. Es öffnet sich über einen runden Glas-Button oben rechts auf der Startseite.
- **Schritt 6:** ohne Umschalter, nur Titel, Text und „Los geht's“. Es werden keine Einstellungen erfunden.
- **Splash:** nur beim Laden der Startseite `/`. Andere Adressen öffnen direkt.
- **Merker:** neuer Speicher `sonnenschein.einstellungen.v1` nach dem bestehenden Muster.
