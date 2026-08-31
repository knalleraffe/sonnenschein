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
