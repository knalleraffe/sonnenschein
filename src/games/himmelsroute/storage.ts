import type { SitzungsErgebnis } from './types'

/*
  Speichern der Sitzungen im Browser-Speicher (localStorage) —
  gleiches Format und gleicher Ort wie Wolkensammeln, eigene Spielkennung.
*/

const SCHLUESSEL = 'sonnenschein.himmelsroute.v1'
const PROBERUNDE_GESEHEN = 'sonnenschein.himmelsroute.proberundeGesehen'

export function alleSitzungen(): SitzungsErgebnis[] {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    if (!roh) return []
    const daten = JSON.parse(roh)
    return Array.isArray(daten) ? daten : []
  } catch {
    return []
  }
}

export function speichereSitzung(sitzung: SitzungsErgebnis): void {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify([...alleSitzungen(), sitzung]))
  } catch {
    // Speicher voll oder gesperrt — das Spiel läuft trotzdem weiter
  }
}

export function letzteSitzung(): SitzungsErgebnis | null {
  const sitzungen = alleSitzungen()
  return sitzungen.length > 0 ? sitzungen[sitzungen.length - 1] : null
}

export function proberundeGesehen(): boolean {
  try {
    return localStorage.getItem(PROBERUNDE_GESEHEN) === '1'
  } catch {
    return false
  }
}

export function merkeProberundeGesehen(): void {
  try {
    localStorage.setItem(PROBERUNDE_GESEHEN, '1')
  } catch {
    // ohne Speicher erscheint die Proberunde beim nächsten Start erneut
  }
}
