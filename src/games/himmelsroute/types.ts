/*
  Datenformen des Spiels Himmelsroute (Master Abschnitt 3, „Messung").
  Bedingung und Verhalten der Pause stehen getrennt — genau wie in Wolkensammeln.
*/

import type { UnterbrechungsArt } from '../../data/mock'
export type { UnterbrechungsArt }

export type PausenVerhalten = 'bewegt' | 'ohneBewegung'

/** Warum ein Durchgang endete */
export type DurchgangsEnde = 'mehrAlsHaelfteFalsch' | 'zweiterFehlversuch' | 'maximallaenge'

/** Eine gewertete Runde, vollständig festgehalten */
export interface RundenLog {
  durchgang: number
  runde: number
  laenge: number
  versuch: number
  /** Kennungen in der gezeigten Reihenfolge (Wegpunkt 1 = unterster) */
  gezeigt: string[]
  zusatz: string
  /** Kennungen in der gelegten Reihenfolge */
  gelegt: string[]
  richtigProWegpunkt: boolean[]
  routeRichtig: boolean
  /** eingestellte Zeigedauer in dieser Runde (ms) */
  zeigedauer: number
  /** erste Begegnung bis Übersicht (ms, ohne Zeit mit offenen Sheets) */
  aufstiegsDauer: number
  /** Rückweg-Sheet offen bis „Route bestätigen" (ms, ohne Zeit mit offenen Sheets) */
  rueckwegDauer: number
}

/** Eine gespeicherte Sitzung */
export interface SitzungsErgebnis {
  /** eigene Spielkennung */
  spiel: 'himmelsroute'
  zeitstempel: string
  pulsVorher: number
  /** zugewiesene Pausenbedingung */
  bedingung: UnterbrechungsArt
  /** tatsächliches Verhalten */
  verhalten: PausenVerhalten
  pulsDanach: number | null
  merkspanne1: number
  merkspanne2: number
  /** Grund für das Ende von Durchgang 1 und 2 */
  endeDurchgang1: DurchgangsEnde | null
  endeDurchgang2: DurchgangsEnde | null
  /** 0..1, über alle gewerteten Runden */
  anteilRichtigeWegpunkte: number
  /** ms, beide Durchgänge ohne Pause und ohne Zeit mit offenen Sheets */
  gesamtdauer: number
  runden: RundenLog[]
}
