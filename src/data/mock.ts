/*
  Alle Platzhalterdaten an einem Ort.
  Zahlen und Texte hier ändern — die Oberfläche übernimmt sie automatisch.
  Werte entsprechen dem Screenshot design/screens/Frame.jpg.
*/

/** Punktestand auf der großen Punktekarte */
export const punkte = 12

/** Serie (Flammen-Badge oben rechts) */
export const serie = 28

/** Wochenleiste Mo–So: Wert pro Tag; heute wird hervorgehoben */
export const woche = [
  { tag: 'Mo', wert: 15 },
  { tag: 'Di', wert: 15 },
  { tag: 'Mi', wert: 15 },
  { tag: 'Do', wert: 15 },
  { tag: 'Fr', wert: 15 },
  { tag: 'Sa', wert: 15 },
  { tag: 'So', wert: 15 },
]

/** Index des heutigen Tages in der Wochenleiste (0 = Montag) */
export const heuteIndex = 3

/** Texte der Stimmungscheck-Karte */
export const stimmungscheck = {
  frage: 'Wie fühlst du dich heute?',
  erklaerung: "Dein Stimmungscheck für heute, danach kann's losgehen.",
}

/** Spieleliste im Abschnitt „Verfügbare Spiele" — Namen im Screenshot nicht sichtbar */
export const spiele = [
  { id: 'spiel-1', name: '[SPIEL 1]' },
  { id: 'spiel-2', name: '[SPIEL 2]' },
  { id: 'spiel-3', name: '[SPIEL 3]' },
  { id: 'spiel-4', name: '[SPIEL 4]' },
]
