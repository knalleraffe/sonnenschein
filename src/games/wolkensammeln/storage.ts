import type { RundenErgebnis } from './types'

/*
  Speichern der Rundenergebnisse im Browser-Speicher (localStorage).
  Hinweis: Die Statistik-Seite liest derzeit feste Demo-Sessions aus
  src/data/mock.ts. Das Format hier hält alle Werte bereit, die eine
  Session braucht (Punkte, Zeitstempel, Fehlerarten, Unterbrechung) —
  eingespeist wird es dort erst, wenn beide Modi echte Daten liefern.
*/

const SCHLUESSEL = 'sonnenschein.wolkensammeln.v1'

export function alleRunden(): RundenErgebnis[] {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    if (!roh) return []
    const daten = JSON.parse(roh)
    return Array.isArray(daten) ? daten : []
  } catch {
    return []
  }
}

export function speichereRunde(runde: RundenErgebnis): void {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify([...alleRunden(), runde]))
  } catch {
    // Speicher voll oder gesperrt — das Spiel läuft trotzdem weiter
  }
}

export function letzteRunde(): RundenErgebnis | null {
  const runden = alleRunden()
  return runden.length > 0 ? runden[runden.length - 1] : null
}

/** Anzahl bisheriger Runden — bestimmt die reihum wechselnde Anordnung */
export function anzahlRunden(): number {
  return alleRunden().length
}

/* Proberunde: nur beim allerersten Start (wie in der Himmelsroute) */
const PROBERUNDE_GESEHEN = 'sonnenschein.wolkensammeln.proberundeGesehen'

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
