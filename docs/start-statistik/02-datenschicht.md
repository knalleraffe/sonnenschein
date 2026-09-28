# Teil 2 von 7 · Datenschicht, Demodaten, Texte

Spezifikation: `docs/start-statistik/00-master.md`, Abschnitte 0, 2, 5 und die Regeln aus 4. Dazu `bestand.md`.

**Ziel:** Alle Werte für Startseite und Statistiken stehen bereit, ohne sichtbare Änderung.

1. **Texte** aus Abschnitt 5 zentral anlegen, mit Hilfsfunktionen für Einheiten (Singular/Plural), Vorzeichen, Dezimalkomma und Datum.
2. **Pro Sitzung:** Vor-Wert, Nach-Wert, Δ, zugewiesene Bedingung, tatsächliches Verhalten, Puls vorher/nachher, Stimmung des Tages, Dauer, bei Himmelsroute der Ende-Grund.
3. **Auswertungen:** Echoo-Zustand, Wochendaten und „{x} von 7 Tagen", Tagesdetails, „Heute dran", Verlauf je Spiel, alle drei Zusammenhänge inklusive Mindestzahlen, Pulsbereich und „kein klarer Unterschied".
4. **Demodaten** nach Abschnitt 2 hinter `DEMO_DATA`, nie gespeichert, nie gemischt.
5. **Streak-Logik** entfernen.
6. **Prüfen** (Tests oder temporäre Prüffunktion):
   - Gruppierung nach zugewiesener Bedingung
   - Mindestzahlen greifen
   - Pulsbereich nur ab 20 Schlägen Spanne
   - Singular bei 1, „±0", Minuszeichen
   - „Heute dran" bei nie gespielt, Gleichstand und beide heute gespielt

Erkläre danach in einfachem Deutsch, was im Hintergrund existiert, und nenne das Prüfergebnis.
