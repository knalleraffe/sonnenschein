import type { Layout, WolkenGroesse } from './types'

/*
  Die fünf festen Wolkenanordnungen (Anpassung 2: größere Wolken,
  Überhang über den Bildschirmrand). EINMALIG per Skript erzeugt und
  hier festgeschrieben — bei jedem Spielstart identisch, reihum
  wechselnd (session.ts).
  Geprüfte Regeln: 6 Reihen (y-Mitten 36/62/88/114/140/168 ± 2) zu je
  zwei Wolken; Lücke in der Reihe ≥ 6; Mittelpunkte −6…106, jede Wolke
  behält ≥ 70 % ihrer Breite auf dem Bildschirm; je Anordnung ≥ 3
  Überhänge auf beide Seiten verteilt; senkrecht ≥ 2 Einheiten Luft;
  je 3 große / 5 mittlere / 4 kleine, groß nur neben klein; oberhalb
  von y = 24 bleibt frei. Breiten stehen in config.ts.
*/

type Roh = { x: number; y: number; g: 'k' | 'm' | 'g' }

const groessen: Record<Roh['g'], WolkenGroesse> = { k: 'klein', m: 'mittel', g: 'gross' }

const roh: Roh[][] = [
  [
    { x: 14, y: 37, g: 'g' }, { x: 92, y: 37, g: 'k' },
    { x: 20, y: 62, g: 'm' }, { x: 85, y: 62, g: 'm' },
    { x: 35, y: 89, g: 'g' }, { x: 85, y: 89, g: 'k' },
    { x: 33, y: 116, g: 'k' }, { x: 84, y: 116, g: 'g' },
    { x: 40, y: 142, g: 'k' }, { x: 90, y: 142, g: 'm' },
    { x: 31, y: 167, g: 'm' }, { x: 79, y: 167, g: 'm' },
  ],
  [
    { x: 38, y: 37, g: 'k' }, { x: 88, y: 37, g: 'g' },
    { x: 20, y: 61, g: 'm' }, { x: 77, y: 61, g: 'm' },
    { x: 39, y: 88, g: 'g' }, { x: 89, y: 88, g: 'k' },
    { x: 28, y: 116, g: 'm' }, { x: 91, y: 116, g: 'k' },
    { x: 37, y: 140, g: 'm' }, { x: 88, y: 140, g: 'm' },
    { x: 43, y: 170, g: 'g' }, { x: 94, y: 170, g: 'k' },
  ],
  [
    { x: 36, y: 36, g: 'k' }, { x: 87, y: 36, g: 'g' },
    { x: 13, y: 62, g: 'k' }, { x: 83, y: 62, g: 'g' },
    { x: 11, y: 87, g: 'k' }, { x: 89, y: 87, g: 'm' },
    { x: 27, y: 114, g: 'm' }, { x: 90, y: 114, g: 'm' },
    { x: 27, y: 138, g: 'g' }, { x: 83, y: 138, g: 'k' },
    { x: 25, y: 168, g: 'm' }, { x: 83, y: 168, g: 'm' },
  ],
  [
    { x: 13, y: 36, g: 'k' }, { x: 85, y: 36, g: 'g' },
    { x: 24, y: 61, g: 'm' }, { x: 76, y: 61, g: 'm' },
    { x: 18, y: 86, g: 'k' }, { x: 71, y: 86, g: 'g' },
    { x: 27, y: 115, g: 'm' }, { x: 84, y: 115, g: 'm' },
    { x: 46, y: 141, g: 'k' }, { x: 89, y: 141, g: 'm' },
    { x: 28, y: 168, g: 'k' }, { x: 86, y: 168, g: 'g' },
  ],
  [
    { x: 15, y: 36, g: 'g' }, { x: 93, y: 36, g: 'k' },
    { x: 41, y: 60, g: 'm' }, { x: 90, y: 60, g: 'm' },
    { x: 11, y: 88, g: 'm' }, { x: 71, y: 88, g: 'm' },
    { x: 7, y: 116, g: 'k' }, { x: 58, y: 116, g: 'g' },
    { x: 14, y: 141, g: 'k' }, { x: 62, y: 141, g: 'm' },
    { x: 37, y: 168, g: 'k' }, { x: 87, y: 168, g: 'g' },
  ],
]

export const layouts: Layout[] = roh.map((anordnung) =>
  anordnung.map((wolke, id) => ({ id, x: wolke.x, y: wolke.y, groesse: groessen[wolke.g] })),
)