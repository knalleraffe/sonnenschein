/*
  Die beiden Modi der App — an genau dieser einen Stelle definiert.
  Umbenennen (z. B. wenn die endgültigen Namen feststehen) heißt:
  nur diese Datei ändern, alles andere zieht automatisch nach.
*/

export type ModusId = 'langsam' | 'schnell'

export interface Modus {
  id: ModusId
  name: string
  kurz: string
  /** Farbe als CSS-Variable aus tokens.css */
  farbe: string
  /** Unterscheidung zusätzlich zur Farbe (Farbsehschwäche): Linienstärke und Punktform */
  linienStaerke: number
  punktForm: 'kreis' | 'quadrat'
}

export const modi: Record<ModusId, Modus> = {
  langsam: {
    id: 'langsam',
    name: 'Elefanten-Modus',
    kurz: 'Tiefes, verknüpfendes Behalten. Wird über Stunden und Schlaf gefestigt — stark bei Ruhe und Wiederholung.',
    farbe: 'var(--mode-slow)',
    linienStaerke: 3.5,
    punktForm: 'quadrat',
  },
  schnell: {
    id: 'schnell',
    name: 'Hasen-Modus',
    kurz: 'Wache, flexible Aufmerksamkeit. Schnelles Reagieren, Wechseln, Filtern — stark, wenn du frisch und aktiviert bist.',
    farbe: 'var(--mode-fast)',
    linienStaerke: 2.25,
    punktForm: 'kreis',
  },
}

export const modusListe: Modus[] = [modi.langsam, modi.schnell]
