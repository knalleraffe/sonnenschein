/*
  Gemeinsamer Typ der Pausenbedingung beider Spiele. Die früheren
  Platzhalter-Statistikdaten sind entfernt — Startseite und Statistiken
  lesen die echten Sitzungen (lib/sitzungen.ts) oder die Demodaten
  (data/demo.ts).
*/

export type UnterbrechungsArt = 'bewegung' | 'stille'
