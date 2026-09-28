import { oeffentlich } from '../../lib/pfad'
/*
  Deko der Himmelsroute: Bezugspunkte, damit man den Flug sieht.
  Nur Wolken ohne Gesicht (Wolkensammeln-Assets) und schlichte Lichtpunkte —
  nichts, was wie ein Gegenstand aussieht (keine Vögel, Flieger, Ballons,
  Sternfiguren). Maße in Figma-Pixeln des 393 px breiten Rahmens.

  Haltepunkte liegen bei 5170, 4690, 4210 … (Abstand 480). Vordergrund-Wolken,
  die Echoo kreuzen, liegen genau zwischen zwei Haltepunkten — im Flug ziehen
  sie vor ihm vorbei, in Ruhe liegen sie weit weg von Echoo und Gegenstand.
*/

/** wolke-4 ist die gelb leuchtende Wolke aus Wolkensammeln — bleibt draußen, Deko ist nur weiß */
export type WolkenDatei = 1 | 2 | 3 | 5

export const wolkenBild = (datei: WolkenDatei) => oeffentlich(`/wolkensammeln-intro/wolke-${datei}.svg`)

/** Kleine Wolken im unteren Himmel (Ebene des Himmelsverlaufs, 1-fach): x = linke Kante, y = Oberkante */
export const kleineWolken: { datei: WolkenDatei; x: number; y: number; breite: number }[] = [
  { datei: 2, x: 26, y: 5360, breite: 64 },
  { datei: 5, x: 302, y: 5110, breite: 56 },
  { datei: 3, x: 58, y: 4830, breite: 72 },
  { datei: 1, x: 290, y: 4570, breite: 60 },
  { datei: 1, x: 18, y: 4300, breite: 70 },
  { datei: 2, x: 296, y: 4060, breite: 66 },
]

/**
  Vordergrund (1,8-fach): `y` ist die Szenenhöhe, bei der das Element auf
  Echoos Höhe vorbeizieht; `x` ist die Mitte. Wolkenfetzen im unteren Himmel
  und in der Wolkenzone, größere Lichtpunkte in der Sternenzone.
*/
export type VordergrundElement =
  | { art: 'wolke'; datei: WolkenDatei; x: number; y: number; breite: number; deckkraft: number }
  | { art: 'stern'; x: number; y: number; groesse: number; deckkraft: number }

export const vordergrund: VordergrundElement[] = [
  // unterer Himmel: am Rand und zwischen den Haltepunkten
  { art: 'wolke', datei: 3, x: 18, y: 5300, breite: 190, deckkraft: 0.55 },
  { art: 'wolke', datei: 1, x: 150, y: 4930, breite: 210, deckkraft: 0.6 },
  { art: 'wolke', datei: 5, x: 380, y: 4700, breite: 180, deckkraft: 0.5 },
  { art: 'wolke', datei: 2, x: 250, y: 4450, breite: 220, deckkraft: 0.65 },
  { art: 'wolke', datei: 3, x: 10, y: 4180, breite: 200, deckkraft: 0.55 },
  { art: 'wolke', datei: 3, x: 140, y: 3970, breite: 240, deckkraft: 0.6 },
  // Wolkenzone: größer und dichter
  { art: 'wolke', datei: 1, x: 385, y: 3720, breite: 230, deckkraft: 0.6 },
  { art: 'wolke', datei: 5, x: 255, y: 3490, breite: 260, deckkraft: 0.7 },
  { art: 'wolke', datei: 5, x: 5, y: 3260, breite: 250, deckkraft: 0.65 },
  { art: 'wolke', datei: 2, x: 135, y: 3010, breite: 270, deckkraft: 0.7 },
  { art: 'wolke', datei: 3, x: 390, y: 2760, breite: 240, deckkraft: 0.6 },
  { art: 'wolke', datei: 1, x: 260, y: 2530, breite: 260, deckkraft: 0.65 },
  { art: 'wolke', datei: 5, x: 0, y: 2300, breite: 230, deckkraft: 0.55 },
  { art: 'wolke', datei: 2, x: 150, y: 2080, breite: 220, deckkraft: 0.5 },
  // Sternenzone: einzelne größere Lichtpunkte
  { art: 'stern', x: 40, y: 1900, groesse: 7, deckkraft: 0.9 },
  { art: 'stern', x: 330, y: 1760, groesse: 9, deckkraft: 0.8 },
  { art: 'stern', x: 250, y: 1580, groesse: 6, deckkraft: 0.9 },
  { art: 'stern', x: 70, y: 1420, groesse: 10, deckkraft: 0.75 },
  { art: 'stern', x: 360, y: 1250, groesse: 7, deckkraft: 0.9 },
  { art: 'stern', x: 130, y: 1080, groesse: 8, deckkraft: 0.8 },
  { art: 'stern', x: 300, y: 900, groesse: 10, deckkraft: 0.75 },
  { art: 'stern', x: 30, y: 740, groesse: 6, deckkraft: 0.9 },
  { art: 'stern', x: 220, y: 600, groesse: 8, deckkraft: 0.85 },
  { art: 'stern', x: 350, y: 430, groesse: 9, deckkraft: 0.8 },
  { art: 'stern', x: 90, y: 260, groesse: 7, deckkraft: 0.9 },
]
