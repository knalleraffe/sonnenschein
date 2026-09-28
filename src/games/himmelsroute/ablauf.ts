import { konfig } from './config'
import { anteilRichtigeWegpunkte, bewerteRoute, merkspanne, type RoutenBewertung } from './auswertung'
import { proberunde, zieheRunde, type Ziehung } from './ziehung'
import type { DurchgangsEnde, PausenVerhalten, RundenLog, SitzungsErgebnis, UnterbrechungsArt } from './types'

/*
  Der Ablauf einer Sitzung als Zustandsmaschine (Master Abschnitt 2 und 3) —
  reine Logik, unabhängig von der Oberfläche. Der Bildschirm meldet Ereignisse
  mit der aktuellen Zeit, bekommt den neuen Zustand zurück und kümmert sich
  selbst um Animationen und Zeitgeber.

  Zeiten: Drei Stoppuhren laufen nur, solange ihr Abschnitt aktiv ist und kein
  Sheet darüber liegt (Abbruch, Einstellungen). Die Gesamtdauer zählt nur in
  gewerteten Runden — nicht in der Proberunde, nicht in der Pause, nicht
  während der Sheets zwischen den Runden.
*/

export type Phase =
  | 'erklaerung'
  // eine Runde: Aufgang → Aufstieg → Rückweg → Auflösung und Heimkehr
  | 'aufgang'
  | 'aufstieg'
  | 'rueckweg'
  | 'aufloesung'
  // Sheets
  | 'proberundeBeendet'
  | 'pulsVorher'
  | 'rundenErfolg'
  | 'zweiterVersuch'
  | 'durchgang1Beendet'
  | 'pause'
  | 'pulsDanach'
  | 'endergebnis'
  | 'abgebrochen'

export type Ereignis =
  | { typ: 'erklaerungWeiter'; proberundeGesehen: boolean }
  | { typ: 'aufgangFertig' }
  | { typ: 'begegnungBeginnt' }
  | { typ: 'begegnungFertig' }
  /** Übergang in die Übersicht fertig, Rückweg-Sheet ist offen */
  | { typ: 'rueckwegOffen' }
  | { typ: 'routeBestaetigt'; gelegt: string[] }
  /** Echoo ist untergegangen, das passende Sheet folgt */
  | { typ: 'heimgekehrt' }
  | { typ: 'proberundeUeberspringen' }
  | { typ: 'nochEinmalUeben' }
  | { typ: 'proberundeWeiter' }
  | { typ: 'pulsVorherBestaetigt'; puls: number }
  | { typ: 'naechsteRunde' }
  | { typ: 'zweiterVersuchStarten' }
  | { typ: 'durchgang1Weiter'; bedingung: UnterbrechungsArt }
  | { typ: 'pauseBeendet'; verhalten: PausenVerhalten }
  | { typ: 'pulsDanachBestaetigt'; puls: number }
  /** Abbruch-Bestätigung oder Einstellungen öffnen/schließen */
  | { typ: 'sheetAuf' }
  | { typ: 'sheetZu' }
  | { typ: 'spielVerlassen' }
  /** Einstellungen gespeichert: gilt ab der nächsten Begegnung */
  | { typ: 'zeigedauerSetzen'; ms: number }

export interface Stoppuhr {
  summe: number
  /** Startzeit des laufenden Abschnitts, null = steht */
  seit: number | null
}

export interface Zustand {
  phase: Phase
  proberunde: boolean
  /** 1-basiert; 0 vor dem ersten Durchgang */
  durchgang: number
  /** 1-basiert, beginnt in jedem Durchgang bei 1 */
  runde: number
  laenge: number
  /** 1-basiert */
  versuch: number
  ziehung: Ziehung | null
  /** Anzahl der bisherigen Begegnungen dieser Runde (k) */
  begegnungen: number
  begegnungLaeuft: boolean
  /** Ergebnis der zuletzt bestätigten Route */
  bewertung: (RoutenBewertung & { gelegt: string[] }) | null
  sheetOffen: boolean
  logs: RundenLog[]
  pulsVorher: number | null
  pulsDanach: number | null
  bedingung: UnterbrechungsArt | null
  verhalten: PausenVerhalten | null
  /** Grund für das Ende je Durchgang (Schlüssel 1 und 2) */
  ende: Partial<Record<number, DurchgangsEnde>>
  /** eingestellte Zeigedauer (ms) */
  zeigedauer: number
  uhren: { gesamt: Stoppuhr; aufstieg: Stoppuhr; rueckweg: Stoppuhr }
}

const steht: Stoppuhr = { summe: 0, seit: null }

export function neuerZustand(): Zustand {
  return {
    phase: 'erklaerung',
    proberunde: false,
    durchgang: 0,
    runde: 0,
    laenge: 0,
    versuch: 0,
    ziehung: null,
    begegnungen: 0,
    begegnungLaeuft: false,
    bewertung: null,
    sheetOffen: false,
    logs: [],
    pulsVorher: null,
    pulsDanach: null,
    bedingung: null,
    ende: {},
    zeigedauer: konfig.zeigedauer,
    verhalten: null,
    uhren: { gesamt: steht, aufstieg: steht, rueckweg: steht },
  }
}

const spielPhasen: Phase[] = ['aufgang', 'aufstieg', 'rueckweg', 'aufloesung']

/** Welche Uhren in diesem Zustand laufen */
function laufendeUhren(z: Zustand): Record<keyof Zustand['uhren'], boolean> {
  const frei = !z.sheetOffen
  return {
    gesamt: frei && !z.proberunde && spielPhasen.includes(z.phase),
    // ab der ersten Begegnung bis zur Übersicht
    aufstieg: frei && z.phase === 'aufstieg' && (z.begegnungen > 0 || z.begegnungLaeuft),
    rueckweg: frei && z.phase === 'rueckweg',
  }
}

function stelleUhren(vorher: Zustand, nachher: Zustand, jetzt: number): Zustand {
  const alt = laufendeUhren(vorher)
  const neu = laufendeUhren(nachher)
  const uhren = { ...nachher.uhren }
  for (const name of Object.keys(uhren) as (keyof Zustand['uhren'])[]) {
    const uhr = uhren[name]
    if (alt[name] && !neu[name] && uhr.seit !== null) uhren[name] = { summe: uhr.summe + (jetzt - uhr.seit), seit: null }
    else if (!alt[name] && neu[name]) uhren[name] = { summe: uhr.summe, seit: jetzt }
  }
  return { ...nachher, uhren }
}

/** Aktueller Stand einer Uhr, auch während sie läuft */
export function gestoppt(uhr: Stoppuhr, jetzt: number): number {
  return uhr.summe + (uhr.seit === null ? 0 : jetzt - uhr.seit)
}

/** Startet eine Runde: neu ziehen, Begegnungen und Rundenuhren zurücksetzen */
function starteRunde(
  z: Zustand,
  werte: { proberunde: boolean; durchgang: number; runde: number; laenge: number; versuch: number },
  zufall: () => number,
): Zustand {
  return {
    ...z,
    ...werte,
    phase: 'aufgang',
    ziehung: werte.proberunde ? proberunde() : zieheRunde(werte.laenge, zufall),
    begegnungen: 0,
    begegnungLaeuft: false,
    bewertung: null,
    uhren: { ...z.uhren, aufstieg: steht, rueckweg: steht },
  }
}

function starteProberunde(z: Zustand, zufall: () => number): Zustand {
  return starteRunde(z, { proberunde: true, durchgang: 0, runde: 1, laenge: konfig.proberunde.folge.length, versuch: 1 }, zufall)
}

function starteDurchgang(z: Zustand, durchgang: number, zufall: () => number): Zustand {
  return starteRunde(z, { proberunde: false, durchgang, runde: 1, laenge: konfig.startLaenge, versuch: 1 }, zufall)
}

/**
  Endet der Durchgang nach dieser Route — und warum?
  Mehr als die Hälfte der Wegpunkte falsch → sofort, ohne zweiten Versuch.
  Sonst falsch → zweiter Versuch; ein zweiter Fehlversuch beendet ihn.
  Richtig mit MAX_LENGTH → Ende.
*/
export function durchgangsEnde(bewertung: RoutenBewertung, laenge: number, versuch: number): DurchgangsEnde | null {
  if (bewertung.routeRichtig) return laenge >= konfig.maxLaenge ? 'maximallaenge' : null
  const falsch = bewertung.richtigProWegpunkt.filter((r) => !r).length
  if (falsch * 2 > laenge) return 'mehrAlsHaelfteFalsch'
  return versuch >= konfig.versucheProLaenge ? 'zweiterFehlversuch' : null
}

/** Welches Sheet nach der Heimkehr folgt, und der Grund, falls der Durchgang endet */
function nachHeimkehr(z: Zustand): Zustand {
  if (z.proberunde || !z.bewertung) return { ...z, phase: 'proberundeBeendet' }
  const ende = durchgangsEnde(z.bewertung, z.laenge, z.versuch)
  if (!ende) return { ...z, phase: z.bewertung.routeRichtig ? 'rundenErfolg' : 'zweiterVersuch' }
  return {
    ...z,
    phase: z.durchgang < konfig.durchgaenge ? 'durchgang1Beendet' : 'endergebnis',
    ende: { ...z.ende, [z.durchgang]: ende },
  }
}

function schritt(z: Zustand, e: Ereignis, jetzt: number, zufall: () => number): Zustand {
  // Ein offenes Sheet hält alles an — nur Schließen und Verlassen gehen weiter
  if (z.sheetOffen && e.typ !== 'sheetZu' && e.typ !== 'spielVerlassen' && e.typ !== 'zeigedauerSetzen') return z

  switch (e.typ) {
    case 'sheetAuf':
      return { ...z, sheetOffen: true }
    case 'sheetZu':
      return { ...z, sheetOffen: false }
    case 'zeigedauerSetzen':
      return { ...z, zeigedauer: e.ms }
    case 'spielVerlassen':
      return { ...z, phase: 'abgebrochen', sheetOffen: false }
  }

  switch (z.phase) {
    case 'erklaerung':
      if (e.typ !== 'erklaerungWeiter') return z
      return e.proberundeGesehen ? { ...z, phase: 'pulsVorher' } : starteProberunde(z, zufall)

    case 'aufgang':
      if (e.typ === 'proberundeUeberspringen' && z.proberunde) return { ...z, phase: 'proberundeBeendet' }
      return e.typ === 'aufgangFertig' ? { ...z, phase: 'aufstieg' } : z

    case 'aufstieg':
      if (e.typ === 'proberundeUeberspringen' && z.proberunde) return { ...z, phase: 'proberundeBeendet' }
      if (e.typ === 'begegnungBeginnt' && !z.begegnungLaeuft && z.begegnungen < z.laenge)
        return { ...z, begegnungLaeuft: true }
      if (e.typ === 'begegnungFertig' && z.begegnungLaeuft)
        return { ...z, begegnungLaeuft: false, begegnungen: z.begegnungen + 1 }
      if (e.typ === 'rueckwegOffen' && !z.begegnungLaeuft && z.begegnungen === z.laenge)
        return { ...z, phase: 'rueckweg' }
      return z

    case 'rueckweg': {
      if (e.typ === 'proberundeUeberspringen' && z.proberunde) return { ...z, phase: 'proberundeBeendet' }
      if (e.typ !== 'routeBestaetigt' || !z.ziehung) return z
      // „Route bestätigen" geht erst, wenn alle Wegpunkte belegt sind
      if (e.gelegt.length !== z.laenge || e.gelegt.some((k) => !k)) return z
      const bewertung = bewerteRoute(z.ziehung.folge, e.gelegt)
      const nachher: Zustand = { ...z, phase: 'aufloesung', bewertung: { ...bewertung, gelegt: [...e.gelegt] } }
      if (z.proberunde) return nachher
      // Uhren jetzt anhalten, damit die Rundendauern im Log vollständig sind
      const gemessen = stelleUhren(z, nachher, jetzt)
      const log: RundenLog = {
        durchgang: z.durchgang,
        runde: z.runde,
        laenge: z.laenge,
        versuch: z.versuch,
        gezeigt: [...z.ziehung.folge],
        zusatz: z.ziehung.zusatz,
        gelegt: [...e.gelegt],
        richtigProWegpunkt: bewertung.richtigProWegpunkt,
        routeRichtig: bewertung.routeRichtig,
        zeigedauer: z.zeigedauer,
        aufstiegsDauer: gemessen.uhren.aufstieg.summe,
        rueckwegDauer: gemessen.uhren.rueckweg.summe,
      }
      return { ...gemessen, logs: [...z.logs, log] }
    }

    case 'aufloesung':
      return e.typ === 'heimgekehrt' ? nachHeimkehr(z) : z

    case 'proberundeBeendet':
      if (e.typ === 'nochEinmalUeben') return starteProberunde(z, zufall)
      return e.typ === 'proberundeWeiter' ? { ...z, phase: 'pulsVorher', proberunde: false } : z

    case 'pulsVorher':
      if (e.typ !== 'pulsVorherBestaetigt') return z
      return starteDurchgang({ ...z, pulsVorher: e.puls }, 1, zufall)

    case 'rundenErfolg':
      if (e.typ !== 'naechsteRunde') return z
      return starteRunde(
        z,
        { proberunde: false, durchgang: z.durchgang, runde: z.runde + 1, laenge: z.laenge + 1, versuch: 1 },
        zufall,
      )

    case 'zweiterVersuch':
      if (e.typ !== 'zweiterVersuchStarten') return z
      return starteRunde(
        z,
        { proberunde: false, durchgang: z.durchgang, runde: z.runde, laenge: z.laenge, versuch: z.versuch + 1 },
        zufall,
      )

    case 'durchgang1Beendet':
      return e.typ === 'durchgang1Weiter' ? { ...z, phase: 'pause', bedingung: e.bedingung } : z

    case 'pause':
      if (e.typ !== 'pauseBeendet') return z
      // ohne Bewegung keine Pulsabfrage: gleich weiter mit dem nächsten Durchgang
      return e.verhalten === 'bewegt'
        ? { ...z, phase: 'pulsDanach', verhalten: e.verhalten }
        : starteDurchgang({ ...z, verhalten: e.verhalten }, z.durchgang + 1, zufall)

    case 'pulsDanach':
      if (e.typ !== 'pulsDanachBestaetigt') return z
      return starteDurchgang({ ...z, pulsDanach: e.puls }, z.durchgang + 1, zufall)

    case 'endergebnis':
    case 'abgebrochen':
      return z
  }
}

/** Übergang mit Zeitstempel (ms) — stellt die Stoppuhren passend */
export function uebergang(z: Zustand, e: Ereignis, jetzt: number, zufall: () => number = Math.random): Zustand {
  const nachher = schritt(z, e, jetzt, zufall)
  return nachher === z ? z : stelleUhren(z, nachher, jetzt)
}

/** Aktuelle Merkspanne eines Durchgangs */
export function merkspanneIm(z: Zustand, durchgang: number): number {
  return merkspanne(z.logs, durchgang)
}

/** Sitzung zum Speichern — nur im Endergebnis; die Proberunde ist nie enthalten */
export function sitzungsErgebnis(z: Zustand, jetzt: number = Date.now()): SitzungsErgebnis | null {
  if (z.phase !== 'endergebnis' || z.pulsVorher === null || z.bedingung === null || z.verhalten === null) return null
  return {
    spiel: 'himmelsroute',
    zeitstempel: new Date(jetzt).toISOString(),
    pulsVorher: z.pulsVorher,
    bedingung: z.bedingung,
    verhalten: z.verhalten,
    pulsDanach: z.pulsDanach,
    merkspanne1: merkspanne(z.logs, 1),
    merkspanne2: merkspanne(z.logs, 2),
    endeDurchgang1: z.ende[1] ?? null,
    endeDurchgang2: z.ende[2] ?? null,
    anteilRichtigeWegpunkte: anteilRichtigeWegpunkte(z.logs),
    gesamtdauer: gestoppt(z.uhren.gesamt, jetzt),
    runden: z.logs,
  }
}

/**
  Zuweisung der Pausenbedingung wie in Wolkensammeln: Dort ist sie derzeit
  fest „Bewegung" (siehe starteUnterbrechung in Wolkensammeln.tsx).
*/
export function weisePausenbedingungZu(): UnterbrechungsArt {
  return 'bewegung'
}
