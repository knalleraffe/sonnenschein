/*
  Datenformen des Spiels Wolkensammeln.
  Die Unterbrechungsart kommt aus dem bestehenden Datenmodell,
  damit Spiel und Statistik dieselbe Sprache sprechen.
*/

import type { UnterbrechungsArt } from '../../data/mock'
export type { UnterbrechungsArt }

export type WolkenGroesse = 'klein' | 'mittel' | 'gross'

export interface Wolke {
  id: number
  /** gedachtes Koordinatensystem: x 0–100, y 0–200 */
  x: number
  y: number
  groesse: WolkenGroesse
}

export type Layout = Wolke[]

export type FehlerGrund = 'falscheWolke' | 'zeitAbgelaufen'

/** Ein Durchgang, vollständig festgehalten */
export interface DurchgangLog {
  /** 1-basiert; null = Aufwärm-Durchgang */
  hauptIndex: number | null
  layoutIndex: number
  laenge: number
  folge: number[]
  /** angetippte Wolken mit Zeitpunkt (ms seit Eingabestart) — die
      Reihenfolge wird mitgeschrieben, auch wenn sie nicht bewertet wird */
  getippt: { wolkeId: number; zeit: number }[]
  richtig: boolean
  fehlerGrund: FehlerGrund | null
  /** wie viele Wolken vor dem Fehler richtig waren */
  richtigeVorFehler: number | null
  zeitBisErsterTipp: number | null
  tippAbstaende: number[]
  streakDanach: number
  /** Lage relativ zur letzten Unterbrechung */
  phaseUnterbrechung: 'vor' | 'nach' | null
  licht: number
  anzeigedauer: number
  anzeigepause: number
}

export interface UnterbrechungsLog {
  bedingung: UnterbrechungsArt
  verhalten: 'bewegt' | 'ohneBewegung'
  nachHauptDurchgang: number
  /** Mittel der bis zu 3 Haupt-Durchgänge davor/danach */
  vorher: { mittlereLaenge: number; trefferquote: number }
  nachher: { mittlereLaenge: number; trefferquote: number }
}

export interface RundenErgebnis {
  zeitstempel: string
  layoutIndex: number
  spanne: number
  hoechsteLaenge: number
  /** 0..1, nur Haupt-Durchgänge */
  trefferquote: number
  mittlereZeitErsterTipp: number
  mittlererTippAbstand: number
  laengsteSerie: number
  /** Anzahl richtiger Wolken vor dem Fehler → wie oft */
  richtigeVorFehlerVerteilung: Record<number, number>
  licht: number
  unterbrechungen: UnterbrechungsLog[]
  durchgaenge: DurchgangLog[]
  startPuls: number
  bewegungsPuls: number | null
}
