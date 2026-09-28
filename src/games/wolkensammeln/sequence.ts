import { konfig } from './config'
import type { Layout } from './types'

/*
  Erzeugt eine gültige Wolken-GRUPPE. Die Reihenfolge ist beim
  Eingeben egal — die alten Weg-Regeln (Winkel, Weglänge) sind damit
  wirkungslos und wurden ersetzt:
  1. keine Wolke kommt zweimal vor
  2. die Gruppe verteilt sich über mindestens 3 verschiedene Reihen
  3. aus einer einzelnen Reihe stammen höchstens 2 Wolken
  4. ab 4 Wolken: mindestens 2 links und 2 rechts der Mitte
  So ist eine Gruppe der Größe 5 immer ungefähr gleich schwer.
  Die Wolken werden weiterhin NACHEINANDER vorgeführt — die hier
  gelieferte Reihenfolge ist die Zeigereihenfolge.
*/

/** Reihenindex je Wolke: Wolken mit gleicher y-Mitte sitzen in einer Reihe */
function reihenVon(layout: Layout): Map<number, number> {
  const yWerte = [...new Set(layout.map((w) => w.y))].sort((a, b) => a - b)
  const zuordnung = new Map<number, number>()
  for (const wolke of layout) zuordnung.set(wolke.id, yWerte.indexOf(wolke.y))
  return zuordnung
}

export function erzeugeFolge(
  layout: Layout,
  laenge: number,
  zufall: () => number = Math.random,
): number[] {
  const g = konfig.gruppe
  const reihen = reihenVon(layout)

  for (let versuch = 0; versuch < g.maxVersuche; versuch++) {
    // zufällige Auswahl ohne Wiederholung (Regel 1)
    const uebrig = layout.map((w) => w.id)
    const gruppe: number[] = []
    while (gruppe.length < laenge && uebrig.length > 0) {
      const index = Math.floor(zufall() * uebrig.length)
      gruppe.push(uebrig[index])
      uebrig.splice(index, 1)
    }

    // Regel 3: höchstens 2 je Reihe
    const jeReihe = new Map<number, number>()
    for (const id of gruppe) {
      const reihe = reihen.get(id) ?? 0
      jeReihe.set(reihe, (jeReihe.get(reihe) ?? 0) + 1)
    }
    if ([...jeReihe.values()].some((anzahl) => anzahl > g.maxProReihe)) continue

    // Regel 2: mindestens 3 verschiedene Reihen
    if (jeReihe.size < Math.min(g.minReihen, laenge)) continue

    // Regel 4: ab 4 Wolken mindestens je 2 links und rechts der Mitte
    if (laenge >= g.seitenRegelAb) {
      const links = gruppe.filter((id) => layout[id].x < g.mitteX).length
      if (links < g.minProSeite || gruppe.length - links < g.minProSeite) continue
    }

    return gruppe
  }

  // Nach vielen Versuchen: einfache Auswahl ohne Nebenregeln (Regel 1 bleibt)
  const uebrig = layout.map((w) => w.id)
  const gruppe: number[] = []
  while (gruppe.length < laenge && uebrig.length > 0) {
    const index = Math.floor(zufall() * uebrig.length)
    gruppe.push(uebrig[index])
    uebrig.splice(index, 1)
  }
  return gruppe
}