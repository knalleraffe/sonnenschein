# Annahmen

Hier sammle ich alle Entscheidungen, die ich ohne Rückfrage getroffen habe.
Alles davon lässt sich später leicht ändern.

## Meilenstein 1

1. **Keine Screenshots vorhanden:** In `design/screens/` lagen beim Start noch
   keine Bilder, in `design/exports/` keine SVGs und es gab keine
   `design/tokens.md`. Ich habe die Ordner angelegt und die Startwerte aus dem
   Auftrag als Tokens übernommen. Sobald die Screenshots und echten Werte da
   sind, baue ich die Screens exakt danach.
2. **Navigation zur Sonne:** Die Tab-Leiste enthält laut Auftrag nur
   „Dashboard" und „Statistiken". Die Sonnenschein-Seite ist vorerst unter der
   Adresse `/sonnenschein` erreichbar. Wie man vom Dashboard dorthin gelangt
   (z. B. durch Tippen auf ein Element), kläre ich, sobald die Screenshots da
   sind.
3. **Platzhalterseiten:** „Statistiken" und „Glossar" sind als leere
   Platzhalterseiten angelegt, damit die Tab-Leiste funktioniert. Sie waren
   nicht beauftragt und bleiben leer.
4. **Platzhaltertexte:** Spielnamen und Zahlen in `src/data/mock.ts` sind als
   `[SPIEL 1]` usw. markiert, bis die echten Texte aus den Screenshots
   übernommen werden können.
5. **Node.js installiert:** Auf dem Rechner war kein Node.js vorhanden. Ich
   habe es lokal im Benutzerordner installiert (`~/.local/node`), ohne
   Admin-Rechte.

## Meilenstein 2

6. **Tacho-Symbol:** Das bunte Tacho-Bild in der Stimmungscheck-Karte habe ich
   als einfache Grafik nachgebaut. Wenn du das Original als Bild oder SVG
   lieferst, tausche ich es aus.
7. **Spielnamen unbekannt:** Die Spielkarten sind im Screenshot abgeschnitten.
   Die vier Karten tragen deshalb die Markierungen `[SPIEL 1]` bis `[SPIEL 4]`
   (in `src/data/mock.ts` änderbar). Auch die Höhe der Karten ist geschätzt.
8. **Flammen-Symbol:** Das 🔥 im Serien-Badge ist als Emoji umgesetzt, da es im
   Design so aussieht.
9. **Verlaufsfarben nachgemessen:** Die Verläufe von Kopfbereich und
   Punktekarte habe ich aus dem Screenshot abgelesen und als Tokens in
   `design/tokens.md` bzw. `src/styles/tokens.css` ergänzt.
10. **Schließen-Kreuz:** Das Kreuz blendet die Karte vorerst sofort aus — die
    weiche Wegwisch-Animation kommt wie geplant in Meilenstein 5.

## Meilenstein 3

11. **Fünf Strahlen statt drei:** Im Screenshot sind drei Strahlen sichtbar,
    die äußeren beiden sind vom Bildrand angeschnitten. Ich habe fünf Strahlen
    angelegt (ray-1 bis ray-5); die äußeren zwei liegen im Vollbild außerhalb
    des Bildes, tauchen aber in der kompakten Größe auf.
12. **Gesichter der Stimmungen erfunden:** Nur „fröhlich" ist im Screenshot zu
    sehen. Die anderen fünf Gesichter (neutral, müde, aufgeregt, nachdenklich,
    traurig) habe ich passend zum Stil entworfen — auf der Playground-Seite
    prüfbar und in `src/components/avatar/emotions.ts` leicht änderbar.
13. **Vitalitäts-Regler im Playground:** Zusätzlich zu den Stimmungs-Knöpfen
    gibt es dort einen Schieberegler, um die Vitalität (0–1) zu testen.
14. **Farben der inneren Ringe und des Glanzlichts** habe ich aus dem
    Screenshot nachgemessen (#FBBE58, #FBD48A, #FDF0C7).

## Auftrag 2, Meilenstein 1

15. **Farbe Elefanten-Modus:** Für das Langsame habe ich den warmen Braunton
    #8A6A4F gewählt (Token `--mode-slow`), das Schnelle nutzt das
    System-Orange `--sun-deep`. Zusätzlich unterscheiden sich die Modi über
    Linienstärke (dick/dünn) und Punktform (Quadrat/Kreis).
16. **Datenlücken:** Die 3–4 Tage ohne Eintrag liegen an festen Positionen
    (Tag 10, 24, 25 und 45 der 60 Tage) — in `src/data/mock.ts` änderbar.
17. **Beobachtung zu Sonntagen:** Der Satz erscheint nur, wenn das Langsame an
    mindestens 2 der letzten 4 Sonntage der stärkste Wochenwert war — bei
    weniger Treffern wäre die Aussage zu dünn (N=1-Haltung).

## Auftrag 2, Meilenstein 4 — Glossar

18. **Fachlich bitte prüfen:** Alle Glossartexte sind bewusst vorsichtig und
    einfach formuliert. Besonders prüfen solltest du: **Interferenz** (stark
    vereinfacht auf „gegenseitiges Stören"), **Effektstärke** (ohne Formeln,
    nur als Einordnung beschrieben) und **Serieller Positionseffekt**
    (Begründung über Wiederholung/Frische ist die gängige, aber vereinfachte
    Erklärung).
19. **Verweise auf Spiele:** Einige „Warum das hier vorkommt"-Sätze verweisen
    auf Merk- und Listen-Spiele, die es als Screens noch nicht gibt — sie
    beschreiben den geplanten Zweck der Spielekarten im Dashboard.
20. **Suche durchsucht** Begriff, Anriss und Erklärungstext (ohne
    Groß-/Kleinschreibung).
