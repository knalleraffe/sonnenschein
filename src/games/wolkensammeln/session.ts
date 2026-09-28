import { konfig } from './config'
import { layouts } from './layouts'
import { neueTreppe, verbucheErgebnis, type Treppe } from './staircase'
import { berechneSpanne, lichtFuerDurchgang, lichtBeiFehler } from './scoring'
import { anzahlRunden } from './storage'
import type {
  DurchgangLog,
  FehlerGrund,
  RundenErgebnis,
  UnterbrechungsArt,
  UnterbrechungsLog,
} from './types'

/*
  Der Ablauf einer ganzen Runde — reine Logik, unabhängig von der
  Oberfläche. Der Bildschirm ruft nur diese Funktionen auf und
  kümmert sich selbst um Zeitgeber und Darstellung.
*/

export interface Runde {
  layoutIndex: number
  treppe: Treppe
  /** Nummer des NÄCHSTEN Durchgangs, 1-basiert, inkl. Aufwärmen */
  durchgangNr: number
  streak: number
  laengsteSerie: number
  fehlerInFolge: number
  licht: number
  unterbrechungen: { art: UnterbrechungsArt; verhalten: 'bewegt' | 'ohneBewegung' | null; nachHauptDurchgang: number }[]
  logs: DurchgangLog[]
  gestartetUm: number
  startPuls: number
  bewegungsPuls: number | null
  anzeigedauer: number
  anzeigepause: number
}

export function neueRunde(): Runde {
  return {
    layoutIndex: anzahlRunden() % layouts.length,
    treppe: neueTreppe(),
    durchgangNr: 1,
    streak: 0,
    laengsteSerie: 0,
    fehlerInFolge: 0,
    licht: 0,
    unterbrechungen: [],
    logs: [],
    gestartetUm: Date.now(),
    startPuls: konfig.messung.startPuls,
    bewegungsPuls: null,
    anzeigedauer: konfig.messung.anzeigeDauer,
    anzeigepause: konfig.messung.anzeigePause,
  }
}

export function istAufwaermen(runde: Runde): boolean {
  return runde.durchgangNr <= konfig.aufwaermDurchgaenge
}

/** 1-basierter Haupt-Durchgangs-Index, null im Aufwärmen */
export function hauptIndex(runde: Runde): number | null {
  return istAufwaermen(runde) ? null : runde.durchgangNr - konfig.aufwaermDurchgaenge
}

export function istZuEnde(runde: Runde): boolean {
  return runde.durchgangNr > konfig.aufwaermDurchgaenge + konfig.hauptDurchgaenge
}

export interface DurchgangsErgebnis {
  richtig: boolean
  fehlerGrund: FehlerGrund | null
  richtigeVorFehler: number | null
  folge: number[]
  getippt: { wolkeId: number; zeit: number }[]
}

/** Verbucht einen abgeschlossenen Durchgang: Treppe, Licht, Streak, Log */
export function verbucheDurchgang(runde: Runde, ergebnis: DurchgangsErgebnis): Runde {
  const haupt = hauptIndex(runde)
  const laenge = ergebnis.folge.length

  const zeiten = ergebnis.getippt.map((t) => t.zeit)
  const zeitBisErsterTipp = zeiten.length > 0 ? zeiten[0] : null
  const tippAbstaende = zeiten.slice(1).map((z, i) => z - zeiten[i])
  const eingabezeit = zeiten.length > 0 ? zeiten[zeiten.length - 1] : Infinity

  const licht =
    haupt !== null && ergebnis.richtig ? lichtFuerDurchgang(laenge, eingabezeit) : lichtBeiFehler

  const streak = ergebnis.richtig ? runde.streak + 1 : 0

  const log: DurchgangLog = {
    hauptIndex: haupt,
    layoutIndex: runde.layoutIndex,
    laenge,
    folge: ergebnis.folge,
    getippt: ergebnis.getippt,
    richtig: ergebnis.richtig,
    fehlerGrund: ergebnis.fehlerGrund,
    richtigeVorFehler: ergebnis.richtigeVorFehler,
    zeitBisErsterTipp,
    tippAbstaende,
    streakDanach: streak,
    // 'vor' wird am Rundenende rückwirkend gesetzt, sobald klar ist, dass es eine Unterbrechung gab
    phaseUnterbrechung: runde.unterbrechungen.length > 0 ? 'nach' : null,
    licht,
    anzeigedauer: runde.anzeigedauer,
    anzeigepause: runde.anzeigepause,
  }

  return {
    ...runde,
    // Aufwärmen verändert die Treppe nicht
    treppe: haupt !== null ? verbucheErgebnis(runde.treppe, ergebnis.richtig) : runde.treppe,
    durchgangNr: runde.durchgangNr + 1,
    streak,
    laengsteSerie: Math.max(runde.laengsteSerie, streak),
    fehlerInFolge: ergebnis.richtig ? 0 : runde.fehlerInFolge + 1,
    licht: runde.licht + licht,
    logs: [...runde.logs, log],
  }
}

/** Alle drei Sperren für eine Unterbrechung */
export function darfUnterbrechen(runde: Runde): boolean {
  const u = konfig.unterbrechung
  const haupt = hauptIndex(runde)
  const letzterHaupt = haupt === null ? 0 : haupt - 1 // zuletzt abgeschlossener
  if (runde.fehlerInFolge < u.nachFehlernInFolge) return false
  if (letzterHaupt < u.fruehestensAbHauptDurchgang) return false
  if (runde.unterbrechungen.length >= u.maxProRunde) return false
  const letzte = runde.unterbrechungen[runde.unterbrechungen.length - 1]
  if (letzte && letzterHaupt - letzte.nachHauptDurchgang < u.sperrfristDurchgaenge) return false
  return true
}

/** Zufällige Wahl zu gleichen Teilen — Grundlage des Vorher-Nachher-Vergleichs */
export function wuerfleUnterbrechungsArt(zufall: () => number = Math.random): UnterbrechungsArt {
  return zufall() < 0.5 ? 'bewegung' : 'stille'
}

/** Nach der Unterbrechung: Treppe bleibt, Serie und Fehlerzähler beginnen neu */
export function verbucheUnterbrechung(runde: Runde, art: UnterbrechungsArt): Runde {
  const haupt = hauptIndex(runde)
  return {
    ...runde,
    streak: 0,
    fehlerInFolge: 0,
    unterbrechungen: [
      ...runde.unterbrechungen,
      { art, verhalten: null, nachHauptDurchgang: haupt === null ? 0 : haupt - 1 },
    ],
  }
}

function mittel(zahlen: number[]): number {
  if (zahlen.length === 0) return 0
  return zahlen.reduce((s, z) => s + z, 0) / zahlen.length
}

export function berechneErgebnis(runde: Runde): RundenErgebnis {
  const ersteUnterbrechung = runde.unterbrechungen[0]
  const logs: DurchgangLog[] = runde.logs.map((d) =>
    ersteUnterbrechung && d.phaseUnterbrechung === null && d.hauptIndex !== null
      ? { ...d, phaseUnterbrechung: 'vor' }
      : d,
  )
  const haupt = logs.filter((d) => d.hauptIndex !== null)
  const richtige = haupt.filter((d) => d.richtig)

  const richtigeVorFehlerVerteilung: Record<number, number> = {}
  for (const d of haupt) {
    if (d.richtigeVorFehler !== null)
      richtigeVorFehlerVerteilung[d.richtigeVorFehler] =
        (richtigeVorFehlerVerteilung[d.richtigeVorFehler] ?? 0) + 1
  }

  const unterbrechungen: UnterbrechungsLog[] = runde.unterbrechungen.map((u) => {
    const davor = haupt.filter((d) => d.hauptIndex !== null && d.hauptIndex <= u.nachHauptDurchgang).slice(-3)
    const danach = haupt.filter((d) => d.hauptIndex !== null && d.hauptIndex > u.nachHauptDurchgang).slice(0, 3)
    const fenster = (liste: DurchgangLog[]) => ({
      mittlereLaenge: Math.round(mittel(liste.map((d) => d.laenge)) * 10) / 10,
      trefferquote: liste.length === 0 ? 0 : Math.round((liste.filter((d) => d.richtig).length / liste.length) * 100) / 100,
    })
    return {
      bedingung: u.art,
      verhalten: u.verhalten ?? 'ohneBewegung',
      nachHauptDurchgang: u.nachHauptDurchgang,
      vorher: fenster(davor),
      nachher: fenster(danach),
    }
  })

  return {
    zeitstempel: new Date().toISOString(),
    layoutIndex: runde.layoutIndex,
    spanne: berechneSpanne(runde.treppe.umkehrLaengen, haupt),
    hoechsteLaenge: Math.max(0, ...haupt.map((d) => d.laenge)),
    trefferquote: haupt.length === 0 ? 0 : Math.round((richtige.length / haupt.length) * 100) / 100,
    mittlereZeitErsterTipp: Math.round(
      mittel(haupt.map((d) => d.zeitBisErsterTipp).filter((z): z is number => z !== null)),
    ),
    mittlererTippAbstand: Math.round(mittel(haupt.flatMap((d) => d.tippAbstaende))),
    laengsteSerie: runde.laengsteSerie,
    richtigeVorFehlerVerteilung,
    licht: runde.licht,
    unterbrechungen,
    durchgaenge: logs,
    startPuls: runde.startPuls,
    bewegungsPuls: runde.bewegungsPuls,
  }
}
