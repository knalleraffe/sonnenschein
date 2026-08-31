/*
  Hilfsfunktionen für die handgebauten SVG-Diagramme.
*/

export interface Punkt {
  x: number
  y: number
}

/** Weich interpolierte Linie (Catmull-Rom → Bezier) durch die Punkte */
export function glatterPfad(punkte: Punkt[]): string {
  if (punkte.length === 0) return ''
  if (punkte.length === 1) return `M ${punkte[0].x} ${punkte[0].y}`

  let d = `M ${punkte[0].x} ${punkte[0].y}`
  for (let i = 0; i < punkte.length - 1; i++) {
    const p0 = punkte[Math.max(0, i - 1)]
    const p1 = punkte[i]
    const p2 = punkte[i + 1]
    const p3 = punkte[Math.min(punkte.length - 1, i + 2)]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

/** Fläche unter einer Linie (für den Farbverlauf) */
export function flaechenPfad(punkte: Punkt[], grundlinieY: number): string {
  if (punkte.length < 2) return ''
  const linie = glatterPfad(punkte)
  const letzter = punkte[punkte.length - 1]
  const erster = punkte[0]
  return `${linie} L ${letzter.x} ${grundlinieY} L ${erster.x} ${grundlinieY} Z`
}

/** "2026-08-31" → "31.08." */
export function kurzDatum(iso: string): string {
  const [, monat, tag] = iso.split('-')
  return `${tag}.${monat}.`
}
