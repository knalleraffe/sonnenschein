/*
  Alle Platzhalterdaten an einem Ort.
  Zahlen und Texte hier ändern — die Oberfläche übernimmt sie automatisch.
*/

/** Punktestand auf der großen Punktekarte */
export const punkte = 1248

/** Serie (Flammen-Badge oben rechts) */
export const serie = 5

/** Wochenleiste Mo–So: Wert pro Tag; heute wird hervorgehoben */
export const woche = [
  { tag: 'Mo', wert: 12 },
  { tag: 'Di', wert: 8 },
  { tag: 'Mi', wert: 15 },
  { tag: 'Do', wert: 10 },
  { tag: 'Fr', wert: 6 },
  { tag: 'Sa', wert: 0 },
  { tag: 'So', wert: 0 },
]

/** Index des heutigen Tages in der Wochenleiste (0 = Montag) */
export const heuteIndex = 4

/** Spieleliste im Abschnitt „Verfügbare Spiele" */
export const spiele = [
  { id: 'spiel-1', name: '[SPIEL 1]' },
  { id: 'spiel-2', name: '[SPIEL 2]' },
  { id: 'spiel-3', name: '[SPIEL 3]' },
  { id: 'spiel-4', name: '[SPIEL 4]' },
]
