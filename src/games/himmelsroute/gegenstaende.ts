import { oeffentlich } from '../../lib/pfad'
/*
  Die 18 Gegenstände in 12 Familien (Master Abschnitt 3, Figma 267:1748).
  Die Namen dienen auch als Bildbeschreibung.

  Größe: feste Anzeigegröße (längste Seite in px) zwischen 96 und 140,
  nach natürlicher Größe gestaffelt — nie zufällig.
  Flugbahn: hängt nur von der Familie ab (Abschnitt 4, Flugbahn-Tabelle).
*/

export type Familie =
  | 'voegel'
  | 'sterne'
  | 'sternschnuppe'
  | 'flugzeug'
  | 'papierflieger'
  | 'satellit'
  | 'ufo'
  | 'huhn'
  | 'drachen'
  | 'heissluftballon'
  | 'luftballon'
  | 'rakete'

/**
  Flugstil je Familie. Alle Gegenstände fliegen seitlich herein (von der Seite
  ihrer Ruhelage, wechselt mit der Nummer der Begegnung) und auf der anderen
  Seite hinaus; die Familie gibt nur eine leichte eigene Note.
*/
export type Flugbahn =
  /** Vögel: leichter Bogen nach oben */
  | 'bogenSeite'
  /** Sterne: etwas kleiner am Rand, wachsen zur Ruhelage */
  | 'tiefe'
  /** Sternschnuppe: leicht schräg von oben, schräg nach unten weiter */
  | 'diagonalOben'
  /** Flugzeug: gerade */
  | 'vonRechts'
  /** Papierflieger: sanfter Gleitbogen, leicht geneigt */
  | 'gleitbogenLinks'
  /** Satellit, Ufo: gerade mit kaum merklichem Bogen */
  | 'langsamSeite'
  /** Huhn mit Fallschirm: leichtes Schaukeln */
  | 'herabschweben'
  /** Drachen: geneigt */
  | 'seiteGeneigt'
  /** Heißluftballon, Luftballon: leicht von unten, leicht nach oben weiter */
  | 'aufsteigend'
  /** Rakete: leicht von unten, schräg nach oben weiter */
  | 'schnellVonUnten'

export const flugbahnFuer: Record<Familie, Flugbahn> = {
  voegel: 'bogenSeite',
  sterne: 'tiefe',
  sternschnuppe: 'diagonalOben',
  flugzeug: 'vonRechts',
  papierflieger: 'gleitbogenLinks',
  satellit: 'langsamSeite',
  ufo: 'langsamSeite',
  huhn: 'herabschweben',
  drachen: 'seiteGeneigt',
  heissluftballon: 'aufsteigend',
  luftballon: 'aufsteigend',
  rakete: 'schnellVonUnten',
}

export interface Gegenstand {
  kennung: string
  name: string
  familie: Familie
  /** längste Seite in px */
  groesse: number
  flugbahn: Flugbahn
  bild: string
}

const ordner = oeffentlich('/himmelsroute/objekte/')

function eintrag(kennung: string, name: string, familie: Familie, groesse: number, datei: string): Gegenstand {
  return { kennung, name, familie, groesse, flugbahn: flugbahnFuer[familie], bild: ordner + datei }
}

export const gegenstaende: Gegenstand[] = [
  eintrag('blauerVogel', 'Blauer Vogel', 'voegel', 108, 'Blue Bird.svg'),
  eintrag('gruenerVogel', 'Grüner Vogel', 'voegel', 108, 'Green Bird.svg'),
  eintrag('rosaVogel', 'Rosa Vogel', 'voegel', 108, 'Pink Bird.svg'),
  eintrag('gelberStern', 'Gelber Stern (schlafend)', 'sterne', 104, 'Stern 1.svg'),
  eintrag('orangefarbenerStern', 'Orangefarbener Stern', 'sterne', 104, 'Stern 2.svg'),
  eintrag('kleinerBlauerStern', 'Kleiner blauer Stern', 'sterne', 96, 'Stern 3.svg'),
  eintrag('rosaStern', 'Rosa Stern', 'sterne', 104, 'Stern 4.svg'),
  eintrag('roterStern', 'Roter Stern', 'sterne', 104, 'Stern 5.svg'),
  eintrag('sternschnuppe', 'Sternschnuppe', 'sternschnuppe', 120, 'Sternschnuppe.svg'),
  eintrag('flugzeug', 'Flugzeug', 'flugzeug', 132, 'Flugzeug.svg'),
  eintrag('papierflieger', 'Papierflieger', 'papierflieger', 104, 'Papierflieger.svg'),
  eintrag('satellit', 'Satellit', 'satellit', 124, 'Satellit.svg'),
  eintrag('ufo', 'Ufo', 'ufo', 124, 'UFO.svg'),
  eintrag('huhn', 'Huhn mit Fallschirm', 'huhn', 120, 'FallschirmHuhn.svg'),
  eintrag('drachen', 'Drachen', 'drachen', 116, 'Drachen.svg'),
  eintrag('heissluftballon', 'Heißluftballon', 'heissluftballon', 140, 'HLB.svg'),
  eintrag('luftballon', 'Luftballon', 'luftballon', 104, 'Ballon.svg'),
  eintrag('rakete', 'Rakete', 'rakete', 132, 'rocket.svg'),
]

export const familien: Familie[] = [...new Set(gegenstaende.map((g) => g.familie))]

const nachKennung = new Map(gegenstaende.map((g) => [g.kennung, g]))

export function gegenstand(kennung: string): Gegenstand {
  const g = nachKennung.get(kennung)
  if (!g) throw new Error(`Unbekannter Gegenstand: ${kennung}`)
  return g
}
