import type { RundenLog, SitzungsErgebnis } from './types'

/*
  Auswertung (Master Abschnitt 3 und 6) — reine Funktionen.
*/

export interface RoutenBewertung {
  richtigProWegpunkt: boolean[]
  routeRichtig: boolean
}

/** Eine Route ist richtig, wenn jeder Wegpunkt den richtigen Gegenstand trägt */
export function bewerteRoute(gezeigt: string[], gelegt: string[]): RoutenBewertung {
  const richtigProWegpunkt = gezeigt.map((kennung, i) => gelegt[i] === kennung)
  return { richtigProWegpunkt, routeRichtig: richtigProWegpunkt.every(Boolean) }
}

/** Länge der längsten richtigen Route im Durchgang, 0 wenn es keine gab */
export function merkspanne(logs: RundenLog[], durchgang: number): number {
  return Math.max(0, ...logs.filter((l) => l.durchgang === durchgang && l.routeRichtig).map((l) => l.laenge))
}

/** Anteil richtiger Wegpunkte über alle gewerteten Runden (0..1) */
export function anteilRichtigeWegpunkte(logs: RundenLog[]): number {
  const alle = logs.flatMap((l) => l.richtigProWegpunkt)
  return alle.length === 0 ? 0 : alle.filter(Boolean).length / alle.length
}

export interface Endwerte {
  span1: number
  span2: number
  /** größere Merkspanne der beiden Durchgänge */
  bestSpan: number
  /** bestSpan minus bestSpan der letzten gespeicherten Sitzung; null bei der ersten Sitzung */
  dLast: number | null
  /** Merkspanne Durchgang 2 minus Durchgang 1 */
  dPause: number
  anteilRichtig: number
  gesamtdauer: number
}

export function bestSpanVon(sitzung: Pick<SitzungsErgebnis, 'merkspanne1' | 'merkspanne2'>): number {
  return Math.max(sitzung.merkspanne1, sitzung.merkspanne2)
}

/** `vorige` muss gelesen werden, BEVOR die neue Sitzung gespeichert wird */
export function berechneEndwerte(sitzung: SitzungsErgebnis, vorige: SitzungsErgebnis | null): Endwerte {
  const bestSpan = bestSpanVon(sitzung)
  return {
    span1: sitzung.merkspanne1,
    span2: sitzung.merkspanne2,
    bestSpan,
    dLast: vorige ? bestSpan - bestSpanVon(vorige) : null,
    dPause: sitzung.merkspanne2 - sitzung.merkspanne1,
    anteilRichtig: sitzung.anteilRichtigeWegpunkte,
    gesamtdauer: sitzung.gesamtdauer,
  }
}
