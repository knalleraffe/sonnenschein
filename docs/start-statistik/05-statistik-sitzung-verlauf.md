# Teil 5 von 7 · Statistiken: Sitzung und Verlauf

Spezifikation: `docs/start-statistik/00-master.md`, Abschnitte 0, 2, 4, 5. Dazu `bestand.md`.

**Ziel:** Die Ebenen Sitzung und Verlauf zeigen die neuen Kennzahlen.

1. **Spiel-Tabs** im Pillen-Stil; bestehende Ebenen-Navigation beibehalten.
2. **Sitzung:** Kopf mit Datum, Blättern, „{Vor} → {Nach}" mit Δ, Zeilen im Stil von 460:347. Wolkensammeln mit Stufenverlauf und Pausenmarke, Himmelsroute mit zwei Mini-Routen und Ende-Grund.
3. **Verlauf:** Linie mit Punkten, Umschalter „4 Wochen" / „Alle", Satz darüber. Antippen eines Punkts öffnet die Sitzung als Sheet.
4. Linien zeichnen sich per stroke-dashoffset, Punkte blenden gestaffelt ein.
5. Alte Kennzahlen, die der Spezifikation widersprechen (Prozente, Trefferquote als Hauptwert), entfernen.

**Prüfen:** mit Demodaten, mit einer einzigen Sitzung und ohne Sitzung.

Erkläre danach in einfachem Deutsch, wie Julius die beiden Ebenen durchgeht.
