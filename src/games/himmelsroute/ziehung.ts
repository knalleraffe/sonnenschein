import { konfig } from './config'
import { familien, gegenstaende, type Familie } from './gegenstaende'

/*
  Ziehen einer Runde (Master Abschnitt 3) — reine Funktion.
  L Gegenstände aus L verschiedenen Familien in zufälliger Reihenfolge,
  dazu ein Zusatzgegenstand aus einer Familie, die in der Runde nicht vorkommt.
*/

export interface Ziehung {
  /** Kennungen in der Reihenfolge der Begegnung */
  folge: string[]
  zusatz: string
}

function mische<T>(liste: readonly T[], zufall: () => number): T[] {
  const kopie = [...liste]
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1))
    ;[kopie[i], kopie[j]] = [kopie[j], kopie[i]]
  }
  return kopie
}

function ausFamilie(familie: Familie, zufall: () => number): string {
  const kandidaten = gegenstaende.filter((g) => g.familie === familie)
  return kandidaten[Math.floor(zufall() * kandidaten.length)].kennung
}

export function zieheRunde(laenge: number, zufall: () => number = Math.random): Ziehung {
  if (laenge < 1 || laenge > konfig.maxLaenge) throw new Error(`Länge ${laenge} ist nicht erlaubt`)
  // L + 1 verschiedene Familien: die ersten L für die Route, die letzte für den Zusatz
  const gewaehlt = mische(familien, zufall).slice(0, laenge + 1)
  return {
    folge: gewaehlt.slice(0, laenge).map((f) => ausFamilie(f, zufall)),
    zusatz: ausFamilie(gewaehlt[laenge], zufall),
  }
}

export function proberunde(): Ziehung {
  return { folge: [...konfig.proberunde.folge], zusatz: konfig.proberunde.zusatz }
}
