import { konfig } from './config'
import type { DurchgangLog } from './types'

/*
  Auswertung: Spanne und Licht.
  Die Spanne ist der Mittelwert der Längen an den Umkehrpunkten,
  ohne die ersten zwei. Reicht das nicht (unter 4 Umkehrpunkte),
  zählt stattdessen das Mittel der letzten 6 Haupt-Durchgänge.
*/

function mittel(zahlen: number[]): number {
  if (zahlen.length === 0) return 0
  return zahlen.reduce((s, z) => s + z, 0) / zahlen.length
}

export function berechneSpanne(umkehrLaengen: number[], hauptDurchgaenge: DurchgangLog[]): number {
  const bereinigt = umkehrLaengen.slice(2)
  if (bereinigt.length >= 4) return Math.round(mittel(bereinigt) * 10) / 10
  const letzteSechs = hauptDurchgaenge.slice(-6).map((d) => d.laenge)
  return Math.round(mittel(letzteSechs) * 10) / 10
}

/**
 * Licht für einen richtigen Durchgang.
 * Grundwert = Länge × 100. Tempobonus: bei höchstens halber Bezugszeit
 * 50 % obendrauf, ab voller Bezugszeit nichts, dazwischen gleichmäßig.
 * Kein Streak-Multiplikator — Serien belohnt Echoo, nicht die Punkte.
 */
export function lichtFuerDurchgang(laenge: number, eingabezeit: number): number {
  const grund = laenge * konfig.licht.proLaengenEinheit
  const bezug = laenge * konfig.licht.bezugszeitProSchritt
  let bonus: number
  if (eingabezeit <= bezug / 2) bonus = konfig.licht.maxTempobonus
  else if (eingabezeit >= bezug) bonus = 0
  else bonus = konfig.licht.maxTempobonus * (1 - (eingabezeit - bezug / 2) / (bezug / 2))
  return Math.round(grund * (1 + bonus))
}

export const lichtBeiFehler = konfig.licht.beiFehler
